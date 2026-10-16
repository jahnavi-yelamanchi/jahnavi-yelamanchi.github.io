// Curated local previews: no third-party page loads, tracking, or unreliable iframes.
export function setupPreviews(records) {
 const panel=document.querySelector('#link-preview'),content=document.querySelector('#preview-content'),domain=document.querySelector('#preview-domain'),open=document.querySelector('#preview-open'),pin=document.querySelector('#preview-pin');
 const canHover=matchMedia('(hover: hover) and (min-width: 541px)');let timer,closeTimer,source,pinned=false;
 const normalized=u=>new URL(u,location.href).href;
 const byURL=new Map();records.forEach(r=>r.links.forEach(l=>byURL.set(normalized(l.url),r)));
 const known=[
 ['data/jahnavi_cv.pdf','Resume','Jahnavi Yelamanchi · Education, research, experience, and technical work. Opens the PDF resume.'],
 ['https://github.com/jahnavi-yelamanchi/','GitHub','Code, experiments, and open-source work by Jahnavi Yelamanchi.'],
 ['https://www.linkedin.com/in/jahnaviym','LinkedIn','Jahnavi Yelamanchi’s professional profile.'],
 ['https://scholar.google.com/citations?user=SkukPTgAAAAJ&hl=en','Google Scholar','Publications and citation information.'],
 ['https://x.com/sugoi_loop','Elsewhere','Jahnavi on X.']
 ];
 function hide(restore=false){clearTimeout(timer);clearTimeout(closeTimer);panel.hidden=true;pinned=false;pin.setAttribute('aria-pressed','false');if(restore)source?.focus();}
 function scheduleHide(){clearTimeout(timer);clearTimeout(closeTimer);if(!pinned)closeTimer=setTimeout(()=>{if(!panel.matches(':hover')&&!panel.contains(document.activeElement))hide();},180);}
 function show(a){
  if(!canHover.matches||pinned)return;clearTimeout(closeTimer);source=a;
  const url=new URL(a.href,location.href);if(!['http:','https:'].includes(url.protocol))return;
  let r=byURL.get(url.href);
  if(url.origin===location.origin&&url.hash)r=records.find(x=>x.id===decodeURIComponent(url.hash.slice(1)))||r;
  const k=known.find(x=>normalized(x[0])===url.href);
  const target=url.origin===location.origin&&url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;
  let title=r?.title||k?.[1]||target?.querySelector('h1,h2,h3')?.textContent||a.textContent.trim().replace(/[↗↘↓↑]/g,'');
  let summary=r?.summary||k?.[2]||target?.querySelector('p')?.textContent||`Visit ${url.hostname}${url.pathname==='/'?'':url.pathname}.`;
  content.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=summary;content.append(h,p);
  if(r?.image){const img=document.createElement('img');img.src=r.image;img.alt=`Figure from ${r.title}`;content.append(img);}
  domain.textContent=url.origin===location.origin?'jahnavi / '+(url.hash?'on this page':url.pathname.split('/').pop()):url.hostname;
  open.href=url.href;panel.hidden=false;
  const rect=a.getBoundingClientRect();let x=rect.left,y=rect.bottom+12;
  if(x+panel.offsetWidth>innerWidth-14)x=innerWidth-panel.offsetWidth-14;
  if(y+panel.offsetHeight>innerHeight-14)y=Math.max(14,rect.top-panel.offsetHeight-12);
  panel.style.left=`${Math.max(14,x)}px`;panel.style.top=`${y}px`;
 }
 document.querySelectorAll('a[href]').forEach(a=>{
  if(a.closest('#link-preview')||a.classList.contains('skip-link')||a.protocol==='mailto:')return;
  a.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(closeTimer);clearTimeout(timer);timer=setTimeout(()=>show(a),380);});
  a.addEventListener('pointerleave',scheduleHide);
  a.addEventListener('focus',()=>{if(a.matches(':focus-visible')){clearTimeout(closeTimer);clearTimeout(timer);timer=setTimeout(()=>show(a),380);}});
  a.addEventListener('blur',scheduleHide);
  a.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&!panel.hidden&&source===a){e.preventDefault();pinned=true;pin.setAttribute('aria-pressed','true');open.focus();}});
  a.addEventListener('click',()=>hide());
 });
 panel.addEventListener('pointerenter',()=>{clearTimeout(closeTimer);clearTimeout(timer);});panel.addEventListener('pointerleave',scheduleHide);
 panel.addEventListener('focusout',()=>{setTimeout(()=>{if(!panel.contains(document.activeElement)&&!pinned)scheduleHide();},0);});
 pin.addEventListener('click',()=>{pinned=!pinned;pin.setAttribute('aria-pressed',String(pinned));});
 document.querySelector('#preview-close').addEventListener('click',()=>hide(true));open.addEventListener('click',()=>hide());
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){const restore=panel.contains(document.activeElement);hide(restore);}});
 addEventListener('resize',()=>hide());addEventListener('scroll',()=>{if(!pinned)hide();},{passive:true});
}
