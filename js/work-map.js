// A small WebGL wireframe renderer. Positions are projected on the CPU so
// the HTML hit targets and the drawing always share the same geometry.
export const LAYERS = ['Data', 'Math', 'Algorithms', 'Architecture', 'Optimization', 'Runtime', 'Hardware', 'Production'];
export const ROLES = ['Represent', 'Compute', 'Communicate', 'Control', 'Measure'];
// Role definitions and cross-layer examples condensed from the supplied StaffML reference.
const ROLE_DESCRIPTIONS = [
 {meaning:'Holds and structures information.',examples:'Across layers: tensors, embeddings, caches, and SRAM.'},
 {meaning:'Transforms inputs into outputs.',examples:'Across layers: convolution, attention, fusion, and compilation.'},
 {meaning:'Moves information between components.',examples:'Backpropagation, tokenization, pipelining, and interconnects move information without deciding what to do with it.'},
 {meaning:'Makes decisions that govern behavior.',examples:'Across layers: gradient descent, masking, scheduling, and allocation.'},
 {meaning:'Observes without changing system state.',examples:'Across layers: loss, throughput, energy, and latency.'}
];
const LAYER_DESCRIPTIONS = [
 {meaning:'The observations a system learns from.',examples:'Images, audio, touch, text, and the way they are collected and organized.'},
 {meaning:'The mathematical language behind the model.',examples:'Probability, linear algebra, objectives, and constraints.'},
 {meaning:'The procedures that turn a problem into steps.',examples:'Learning rules, search, inference, and how their results are evaluated.'},
 {meaning:'How the parts of a system fit together.',examples:'Model components, connections, memory, and the paths information takes.'},
 {meaning:'Making learning and execution more effective.',examples:'Training updates, kernel fusion, quantization, and resource tradeoffs.'},
 {meaning:'What happens while the system is running.',examples:'Scheduling, caching, communication, and managing memory during execution.'},
 {meaning:'The physical machinery that does the work.',examples:'GPUs, processors, memory, sensors, and the connections between them.'},
 {meaning:'Keeping a system useful outside the experiment.',examples:'Deployment, serving, monitoring, reliability, and operating at scale.'}
];
const vertexSource = `attribute vec2 a_position; attribute vec4 a_color;
uniform vec2 u_resolution; varying vec4 v_color;
void main(){vec2 clip=a_position/u_resolution*2.0-1.0;gl_Position=vec4(clip*vec2(1.,-1.),0.,1.);v_color=a_color;}`;
const fragmentSource = `precision mediump float; varying vec4 v_color; void main(){gl_FragColor=v_color;}`;
function rgba(hex) { let h=hex.trim().replace('#',''); if(h.length===3)h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).concat(1); }
export function createWorkMap(stage, onCell) {
 const canvas=stage.querySelector('canvas'), overlay=stage.querySelector('#map-labels');
 let gl, program, buffer, dimensions, frame=0, visible=true, disposed=false;
 let occupied=new Set(), selected=new Set(), currentCell=null;
 let amounts=Array(40).fill(0), targets=Array(40).fill(0), hitButtons=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const contextOptions={alpha:false,antialias:true,powerPreference:'low-power'};
 function initialize(){
  try{
   gl=canvas.getContext('webgl',contextOptions);
   if(!gl) return false;
   function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
   program=gl.createProgram();const vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
   gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
   gl.deleteShader(vs);gl.deleteShader(fs);buffer=gl.createBuffer();gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   const position=gl.getAttribLocation(program,'a_position'),color=gl.getAttribLocation(program,'a_color');
   gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,24,0);
   gl.enableVertexAttribArray(color);gl.vertexAttribPointer(color,4,gl.FLOAT,false,24,8);
   stage.dataset.renderer='webgl';return true;
  }catch(error){console.warn('The map is using its SVG fallback.',error.message);gl=null;return false;}
 }
 const ns='http://www.w3.org/2000/svg';let fallback;
 function ensureFallback(){
  if(!fallback){fallback=document.createElementNS(ns,'svg');fallback.setAttribute('aria-hidden','true');Object.assign(fallback.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});stage.insertBefore(fallback,overlay);}
  stage.dataset.renderer='svg';canvas.style.visibility='hidden';
 }
 if(!initialize())ensureFallback();
 const label=(text,cls)=>{const s=document.createElement('button');s.type='button';s.className=`map-label ${cls}`;s.textContent=text;overlay.append(s);return s;};
 const rowLabels=LAYERS.map(x=>label(x,'row-label')), colLabels=ROLES.map(x=>label(x,'col-label'));
 const tooltip=document.createElement('div');
 tooltip.id='axis-tooltip';tooltip.className='axis-tooltip';tooltip.role='tooltip';tooltip.hidden=true;
 const axisName=document.createElement('p'),axisMeaning=document.createElement('strong'),axisExamples=document.createElement('p');
 axisName.className='axis-name';axisExamples.className='axis-examples';
 tooltip.append(axisName,axisMeaning,axisExamples);stage.append(tooltip);
 let tooltipButton=null,hideTimer;
 function setTargets(){
  targets=targets.map((_,i)=>{
   const key=`${Math.floor(i/5)}:${i%5}`;
   return selected.has(key)||key===currentCell?12:occupied.has(key)?3:0;
  });
 }
 function hideTooltip(){
  clearTimeout(hideTimer);tooltip.hidden=true;
  tooltipButton?.removeAttribute('aria-describedby');tooltipButton=null;
 }
 function showTooltip(button,name,description){
  clearTimeout(hideTimer);
  tooltipButton?.removeAttribute('aria-describedby');tooltipButton=button;
  button.setAttribute('aria-describedby',tooltip.id);
  axisName.textContent=name;
  axisMeaning.textContent=description.meaning;
  axisExamples.textContent=description.examples;
  tooltip.hidden=false;
  const box=button.getBoundingClientRect(),bounds=stage.getBoundingClientRect();
  const left=Math.max(8,Math.min(box.left-bounds.left+box.width/2-tooltip.offsetWidth/2,bounds.width-tooltip.offsetWidth-8));
  let top=box.top-bounds.top-tooltip.offsetHeight-12;
  if(top<8)top=box.bottom-bounds.top+10;
  top=Math.max(8,Math.min(top,bounds.height-tooltip.offsetHeight-8));
  tooltip.style.left=`${left}px`;tooltip.style.top=`${top}px`;
 }
 function scheduleHide(){
  clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>{
   if(!tooltip.matches(':hover')&&!tooltipButton?.matches(':focus-visible'))hideTooltip();
  },100);
 }
 tooltip.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
 tooltip.addEventListener('pointerleave',scheduleHide);
 const dismissTooltip=e=>{if(e.key==='Escape')hideTooltip();};
 document.addEventListener('keydown',dismissTooltip);
 function explainLabel(button,name,description){
  button.setAttribute('aria-label',`About ${name}`);
  button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')showTooltip(button,name,description);});
  button.addEventListener('pointerleave',scheduleHide);
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))showTooltip(button,name,description);});
  button.addEventListener('blur',hideTooltip);
  button.addEventListener('click',e=>{
   if(e.pointerType==='touch'&&tooltipButton===button&&!tooltip.hidden)hideTooltip();
   else showTooltip(button,name,description);
  });
 }
 rowLabels.forEach((button,r)=>explainLabel(button,LAYERS[r],LAYER_DESCRIPTIONS[r]));
 colLabels.forEach((button,c)=>explainLabel(button,ROLES[c],ROLE_DESCRIPTIONS[c]));
 for(let r=0;r<8;r++)for(let c=0;c<5;c++){
  const b=document.createElement('button');b.type='button';b.className='cell-target';b.dataset.row=r;b.dataset.col=c;
  const preview=()=>{hideTooltip();onCell(r,c,'preview');};
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!b.disabled)preview();});
  b.addEventListener('focus',()=>{if(!b.disabled&&b.matches(':focus-visible'))preview();});
  b.addEventListener('click',()=>{hideTooltip();onCell(r,c,'select');});
  overlay.append(b);hitButtons.push(b);
 }
 function point(c,r,z=0){const {w,h,left,top,cw,rh,skew}=dimensions;return [left+c*cw+(8-r)*skew,top+r*rh-z];}
 function resize(){
  hideTooltip();
  const {width:w,height:h}=stage.getBoundingClientRect();if(!w||!h)return;
  const small=w<450;const left=small?80:100,skew=small?2.5:9,cw=(w-left-8*skew-12)/5,rh=(h-75)/8;
  dimensions={w,h,left,top:45,cw,rh,skew};const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  if(gl&&!gl.isContextLost()){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(gl.getUniformLocation(program,'u_resolution'),w,h);}
  if(fallback)fallback.setAttribute('viewBox',`0 0 ${w} ${h}`);
  rowLabels.forEach((el,r)=>{const p=point(0,r+.5);el.style.left=`${p[0]-13}px`;el.style.top=`${p[1]-2}px`;});
  colLabels.forEach((el,c)=>{const p=point(c+.5,0);el.style.left=`${p[0]}px`;el.style.top='19px';el.textContent=small?['Hold','Compute','Move','Decide','Measure'][c]:ROLES[c];});
  hitButtons.forEach((el,i)=>{const p=point(i%5+.5,Math.floor(i/5)+.5);el.style.left=`${p[0]}px`;el.style.top=`${p[1]-4}px`;el.style.width=`${cw+skew}px`;el.style.height=`${rh+9}px`;});
  schedule();
 }
 function draw(){
  frame=0;if(!dimensions||disposed||!visible)return;
  const css=getComputedStyle(document.documentElement),bg=rgba(css.getPropertyValue('--bg')),ink=rgba(css.getPropertyValue('--ink')),line=rgba(css.getPropertyValue('--line')),accent=rgba(css.getPropertyValue('--accent')),fill=rgba(css.getPropertyValue('--accent-fill'));
  const tris=[],lines=[],svg=[];let moving=false;
  const vertex=(out,p,color)=>out.push(...p,...color);
  const segment=(a,b,color)=>{vertex(lines,a,color);vertex(lines,b,color);};
  const polygon=(ps,color)=>{for(let i=1;i<ps.length-1;i++){vertex(tris,ps[0],color);vertex(tris,ps[i],color);vertex(tris,ps[i+1],color);}};
  const colorString=c=>`rgb(${c.slice(0,3).map(x=>Math.round(x*255)).join(',')})`;
  // Back-to-front tiles with restrained, uniform relief (not an ability score).
  for(let r=0;r<8;r++)for(let c=0;c<5;c++){
   const i=r*5+c,key=`${r}:${c}`,d=targets[i]-amounts[i];amounts[i]=reduced.matches?targets[i]:amounts[i]+d*.2;
   if(Math.abs(d)>.02)moving=true;else amounts[i]=targets[i];
   const z=amounts[i],a=point(c+.025,r+.06,z),b=point(c+.975,r+.06,z),cc=point(c+.975,r+.94,z),dd=point(c+.025,r+.94,z);
   const isSelected=selected.has(key),hovered=key===currentCell,stroke=hovered||isSelected?accent:occupied.has(key)?ink:line;
   const face=isSelected||hovered?fill:bg;const top=[a,b,cc,dd];
   polygon(top,face);for(let j=0;j<4;j++)segment(top[j],top[(j+1)%4],stroke);
   if(z>1){const b0=[b[0],b[1]+z],c0=[cc[0],cc[1]+z],d0=[dd[0],dd[1]+z];polygon([b,b0,c0,cc],bg);polygon([dd,cc,c0,d0],bg);for(const [u,v] of [[b,b0],[b0,c0],[cc,c0],[c0,d0],[d0,dd]])segment(u,v,stroke);}
   if(!gl||gl.isContextLost()){
    const poly=document.createElementNS(ns,'polygon');poly.setAttribute('points',top.map(p=>p.join(',')).join(' '));poly.setAttribute('fill',colorString(face));poly.setAttribute('stroke',colorString(stroke));poly.setAttribute('stroke-width','.8');svg.push(poly);
   }
  }
  if(gl&&!gl.isContextLost()){
   gl.clearColor(...bg);gl.clear(gl.COLOR_BUFFER_BIT);
   const paint=(data,mode)=>{gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);gl.drawArrays(mode,0,data.length/6);};
   paint(tris,gl.TRIANGLES);paint(lines,gl.LINES);
  }else{ensureFallback();fallback.replaceChildren(...svg);}
  if(moving)schedule();
 }
 function schedule(){if(!frame&&visible&&!disposed)frame=requestAnimationFrame(draw);}
 const ro=new ResizeObserver(resize);ro.observe(stage);
 const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}});io.observe(stage);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ensureFallback();schedule();});
 canvas.addEventListener('webglcontextrestored',()=>{if(initialize()){fallback?.remove();fallback=null;canvas.style.visibility='';resize();}});
 reduced.addEventListener('change',schedule);
 return {
  update(items,record,cell,pinned){
   hideTooltip();
   const counts=new Map();for(const item of items)for(const [r,c] of item.cells){const k=`${r}:${c}`;counts.set(k,(counts.get(k)||0)+1);}
   occupied=new Set(counts.keys());selected=new Set((record?.cells||[]).map(([r,c])=>`${r}:${c}`));currentCell=cell;
   setTargets();
   hitButtons.forEach((b,i)=>{const key=`${Math.floor(i/5)}:${i%5}`,count=counts.get(key)||0;b.disabled=count===0;b.setAttribute('aria-label',`${LAYERS[Math.floor(i/5)]} × ${ROLES[i%5]}: ${count} ${count===1?'record':'records'}`);b.setAttribute('aria-pressed',String(pinned&&key===cell));});schedule();
  },redraw:schedule,
  destroy(){disposed=true;clearTimeout(hideTimer);tooltip.remove();document.removeEventListener('keydown',dismissTooltip);cancelAnimationFrame(frame);ro.disconnect();io.disconnect();reduced.removeEventListener('change',schedule);if(gl){gl.deleteBuffer(buffer);gl.deleteProgram(program);}}
 };
}
