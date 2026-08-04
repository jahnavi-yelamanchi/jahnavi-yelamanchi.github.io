(() => {
  const canUse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUse || reduceMotion) return;

  document.body.classList.add("has-custom-cursor");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    },
    { passive: true }
  );

  const HOVER_TARGETS = "a, button, .chip, .project-card, .pillar, .oss-item, .pub, .tl-row, .edu-card, .skill-group";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(HOVER_TARGETS)) ring.classList.add("hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(HOVER_TARGETS)) ring.classList.remove("hover");
  });

  const tick = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
