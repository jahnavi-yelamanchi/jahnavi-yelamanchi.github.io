import {createWorkMap,LAYERS,ROLES} from './work-map.js';
export function setupMap(records){
const labels={experience:'Experience',project:'Project',research:'Research',oss:'Open source',education:'Education'};
const shortTitles={'research-reference-wording':'Reference wording & robot tasks','experience-cilvr':'Learning through touch & vision','experience-sai':'Making models run better','research-thesis':'Visuo-tactile world models','research-csf':'Predicting CSF pressure with GANs','research-gan':'Comparing generative models','research-neuro':'AI for neurodiagnostics'};
const shortSummaries={'experience-cilvr':'AnySkin sensors, video, and world models for robotic manipulation. From data collection to remote experiments.','experience-sai':'Triton kernels on A100s, memory-path profiling, and multi-node experiments on Slurm.'};
let cell=null,hasSelection=false,pinned=false,index=0;
const stage=document.querySelector('#map-stage');
const map=createWorkMap(stage,(r,c,action)=>{
 const key=`${r}:${c}`;
 if(action==='preview'){
  if(pinned||cell===key)return;
 }else{
  pinned=!(pinned&&cell===key);
 }
 if(cell!==key)index=0;
 cell=key;hasSelection=true;
 render();
});
function matches(){return cell?records.filter(r=>r.cells.some(([a,b])=>`${a}:${b}`===cell)):records;}
function render(){
 const list=matches();index=Math.max(0,Math.min(index,list.length-1));const record=hasSelection?list[index]:null;
 document.querySelector('#evidence').hidden=!hasSelection;
 document.querySelector('#evidence').dataset.record=record?.id||'';
 document.querySelector('#evidence-meta').textContent=record?`${labels[record.kind]} · ${record.org&&record.kind==='experience'?record.org+' · ':''}${record.date}`:'Explore my work';
 document.querySelector('#evidence-title').textContent=record?(shortTitles[record.id]||record.title):'A quieter part of the map';
 document.querySelector('#evidence-summary').textContent=record?(shortSummaries[record.id]||record.summary):'Hover a tile to preview the work connected to it.';
 const link=document.querySelector('#evidence-link');link.hidden=!record;if(record){link.href=`work.html#${record.id}`;link.textContent=`View ${labels[record.kind].toLowerCase()} ↗`;}
 document.querySelector('#evidence-count').textContent=list.length?`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:'00 / 00';
 document.querySelector('#previous-record').disabled=list.length<2;document.querySelector('#next-record').disabled=list.length<2;
 const context=document.querySelector('#map-context');
 if(cell){const [r,c]=cell.split(':').map(Number);context.textContent=`${LAYERS[r]} × ${ROLES[c]} · ${list.length} ${list.length===1?'connection':'connections'} · ${pinned?'pinned':'preview'}`;}
 else context.textContent=hasSelection?'Selected work · pinned':'';
 map.update(records,record,cell,pinned);
}
function reset(){const url=new URL(location.href);url.searchParams.delete('record');history.replaceState(null,'',url);cell=null;hasSelection=false;pinned=false;index=0;render();}
document.querySelector('#previous-record').addEventListener('click',()=>{const l=matches().length;index=(index-1+l)%l;render();});
document.querySelector('#next-record').addEventListener('click',()=>{index=(index+1)%matches().length;render();});
document.querySelector('#reset-map').addEventListener('click',reset);
render();
 const recordId=new URLSearchParams(location.search).get('record');
 const recordIndex=records.findIndex(r=>r.id===recordId);
 if(recordIndex>=0){hasSelection=true;pinned=true;index=recordIndex;render();}
 return map;
}
