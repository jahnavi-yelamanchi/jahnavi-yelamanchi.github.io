// CSS owns the motion; JS only manages visibility and the visitor's pause choice.
export function setupFooterMotion() {
 const art=document.querySelector('#transformer-art');
 const button=document.querySelector('#toggle-footer-motion');
 if(!art||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;
 function update(){
  art.classList.toggle('is-paused',paused||reduced.matches);
  button.hidden=reduced.matches;
  button.setAttribute('aria-pressed',String(paused));
  button.textContent=paused?'Resume motion':'Pause motion';
  button.setAttribute('aria-label',paused?'Resume footer animation':'Pause footer animation');
 }
 button.addEventListener('click',()=>{paused=!paused;update();});
 reduced.addEventListener('change',update);
 const observer=new IntersectionObserver(([entry])=>art.classList.toggle('is-offscreen',!entry.isIntersecting));
 observer.observe(art);
 update();
}
