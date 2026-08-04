(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // scroll-triggered section reveals
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // nav flips to dark styling over dark sections
  const nav = document.getElementById("nav");
  const darkSections = document.querySelectorAll(".section--dark, footer");
  if (nav && darkSections.length) {
    const overDark = new Set();
    const navIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) overDark.add(entry.target);
          else overDark.delete(entry.target);
        });
        nav.classList.toggle("is-dark", overDark.size > 0);
      },
      { rootMargin: "-64px 0px -85% 0px" }
    );
    darkSections.forEach((el) => navIo.observe(el));
  }
})();
