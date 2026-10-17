import {setupMap} from './map-controller.js';
import {setupFooterMotion} from './footer-motion.js';
import {setupPreviews} from './previews.js';
const data=JSON.parse(document.querySelector('#portfolio-data').textContent);
const priority=['experience-cilvr','experience-sai','research-thesis'];
const records=[...priority.map(id=>data.records.find(r=>r.id===id)),...data.records.filter(r=>!priority.includes(r.id))];
const map=document.querySelector('#map-stage')?setupMap(records):null;
function revealHash(){
 let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
 const el=document.getElementById(id);
 // Preserve links to the previous single-page site.
 if(!el&&map&&(records.some(r=>r.id===id)||['projects','experience','open-source','research','about','contact'].includes(id))){
  location.replace(`work.html#${encodeURIComponent(id)}`);return;
 }
 if(!el)return;
 const details=el.closest('details');if(details&&!details.open){details.open=true;requestAnimationFrame(()=>el.scrollIntoView());}
}
addEventListener('hashchange',revealHash);revealHash();
function updateTheme(theme){document.documentElement.dataset.theme=theme;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#000000':'#ffffff';map?.redraw();}
for(const b of document.querySelectorAll('[data-theme-choice]'))b.addEventListener('click',()=>{try{localStorage.setItem('portfolio-theme',b.dataset.themeChoice);}catch{}updateTheme(b.dataset.themeChoice);});
const systemTheme=matchMedia('(prefers-color-scheme: dark)');systemTheme.addEventListener('change',e=>{try{if(!localStorage.getItem('portfolio-theme'))updateTheme(e.matches?'dark':'light');}catch{}});
updateTheme(document.documentElement.dataset.theme||'light');
const nav=[...document.querySelectorAll('.site-nav a')];
const sections=nav.map(a=>({link:a,section:document.getElementById(a.hash.slice(1))})).filter(x=>x.section);
let scheduled=false;
function updateNav(){
 scheduled=false;let current=sections[0];
 for(const item of sections)if(item.section.getBoundingClientRect().top<=innerHeight*.3)current=item;
 nav.forEach(a=>{if(a===current?.link)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}},{passive:true});
addEventListener('pageshow',updateNav);
addEventListener('hashchange',()=>requestAnimationFrame(updateNav));
setupPreviews(records);setupFooterMotion();requestAnimationFrame(updateNav);
