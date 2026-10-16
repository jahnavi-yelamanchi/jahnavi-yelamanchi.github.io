import {createWorkMap,LAYERS,ROLES} from './work-map.js';
import {setupPreviews} from './previews.js';
const data=JSON.parse(document.querySelector('#portfolio-data').textContent);
const priority=['experience-cilvr','experience-sai','research-thesis'];
const records=[...priority.map(id=>data.records.find(r=>r.id===id)),...data.records.filter(r=>!priority.includes(r.id))];
const labels={experience:'Experience',project:'Project',research:'Research',oss:'Open source',education:'Education'};
const shortTitles={'experience-cilvr':'Learning through touch & vision','experience-sai':'Making models run better','research-thesis':'Visuo-tactile world models','research-csf':'Predicting CSF pressure with GANs','research-gan':'Comparing generative models','research-neuro':'AI for neurodiagnostics'};
const shortSummaries={'experience-cilvr':'AnySkin sensors, video, and world models for robotic manipulation. From data collection to remote experiments.','experience-sai':'Triton kernels on A100s, memory-path profiling, and multi-node experiments on Slurm.'};
let kind='all',year='all',cell=null,pinnedCell=false,index=0;
const stage=document.querySelector('#map-stage');
const map=createWorkMap(stage,(r,c,mode)=>{
 if(mode==='hover'&&pinnedCell)return;
 const key=`${r}:${c}`;
 if(cell!==key)index=0;
 if(mode==='select'){pinnedCell=!(pinnedCell&&cell===key);cell=pinnedCell?key:null;}else cell=key;
 render();
});
function filtered(){return records.filter(r=>(kind==='all'||r.kind===kind)&&(year==='all'||(r.start!==null&&r.start<=Number(year)&&r.end>=Number(year))));}
function matches(){const list=filtered();return cell?list.filter(r=>r.cells.some(([a,b])=>`${a}:${b}`===cell)):list;}
function render(){
 const items=filtered(),list=matches();index=Math.max(0,Math.min(index,list.length-1));const record=list[index];
 document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
 document.querySelectorAll('[data-year]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===year)));
 document.querySelector('#evidence').dataset.record=record?.id||'';
 document.querySelector('#evidence-meta').textContent=record?`${labels[record.kind]} · ${record.org&&record.kind==='experience'?record.org+' · ':''}${record.date}`:'No dated records';
 document.querySelector('#evidence-title').textContent=record?(shortTitles[record.id]||record.title):'A quieter part of the map';
 document.querySelector('#evidence-summary').textContent=record?(shortSummaries[record.id]||record.summary):'Try another year or All years. Independent projects and open-source contributions are not assigned dates in this record.';
 const link=document.querySelector('#evidence-link');link.hidden=!record;if(record){link.href=`#${record.id}`;link.textContent=`View ${labels[record.kind].toLowerCase()} ↗`;}
 document.querySelector('#evidence-count').textContent=list.length?`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:'00 / 00';
 document.querySelector('#previous-record').disabled=list.length<2;document.querySelector('#next-record').disabled=list.length<2;
 const context=document.querySelector('#map-context');
 if(cell){const [r,c]=cell.split(':').map(Number);context.textContent=`${LAYERS[r]} × ${ROLES[c]} · ${list.length} ${list.length===1?'connection':'connections'}${pinnedCell?' · selected':''}`;}
 else context.textContent=year==='all'?'Hover or select a cell to find the connections.':`${year} · ${items.length} dated ${items.length===1?'entry':'entries'}`;
 map.update(items,record,cell);
}
function reset(){kind='all';year='all';cell=null;pinnedCell=false;index=0;render();}
for(const b of document.querySelectorAll('[data-kind]'))b.addEventListener('click',()=>{kind=b.dataset.kind;cell=null;pinnedCell=false;index=0;render();});
for(const b of document.querySelectorAll('[data-year]'))b.addEventListener('click',()=>{year=b.dataset.year;cell=null;pinnedCell=false;index=0;render();});
document.querySelector('#previous-record').addEventListener('click',()=>{const l=matches().length;index=(index-1+l)%l;render();});
document.querySelector('#next-record').addEventListener('click',()=>{index=(index+1)%matches().length;render();});
document.querySelector('#reset-map').addEventListener('click',reset);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cell=null;pinnedCell=false;render();}});
for(const b of document.querySelectorAll('[data-record]'))b.addEventListener('click',()=>{kind='all';year='all';cell=null;pinnedCell=false;index=records.findIndex(r=>r.id===b.dataset.record);render();document.querySelector('#top').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('#evidence-link').focus({preventScroll:true});});
function revealHash(){
 const id=decodeURIComponent(location.hash.slice(1));const el=document.getElementById(id);if(!el)return;
 const details=el.closest('details');if(details&&!details.open){details.open=true;requestAnimationFrame(()=>el.scrollIntoView());}
}
addEventListener('hashchange',revealHash);revealHash();
document.querySelector('#evidence-link').addEventListener('click',e=>{const target=document.querySelector(e.currentTarget.getAttribute('href'));if(target?.closest('details'))target.closest('details').open=true;});
function updateTheme(theme){document.documentElement.dataset.theme=theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#111310':'#ffffff';map.redraw();}
for(const b of document.querySelectorAll('[data-theme-choice]'))b.addEventListener('click',()=>{try{localStorage.setItem('portfolio-theme',b.dataset.themeChoice);}catch{}updateTheme(b.dataset.themeChoice);});
const systemTheme=matchMedia('(prefers-color-scheme: dark)');systemTheme.addEventListener('change',e=>{try{if(!localStorage.getItem('portfolio-theme'))updateTheme(e.matches?'dark':'light');}catch{}});
updateTheme(document.documentElement.dataset.theme||'light');
const nav=[...document.querySelectorAll('.site-nav a')];
const sections=nav.map(a=>document.querySelector(a.getAttribute('href')));
let scheduled=false;
function updateNav(){scheduled=false;let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=innerHeight*.3)current=section;nav.forEach(a=>{if(a.hash===`#${current.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});
render();setupPreviews(records);updateNav();
