// ─── Card Hover Spotlight Effect ─────────────────────────────────────────────
// Updates --mouse-x and --mouse-y on all visible spotlight elements and cards,
// creating a fluid multi-card radial gradient halo with zero layout thrashing.

export function initCardHover() {
  const selector = ".card, .carder, .hero-btn, .diploma, .parag, #contact .head, #contact .body, #contact .bottom .info";
  let rafPending = false;
  let lastEvent = null;

  function update() {
    rafPending = false;
    if (!lastEvent) return;

    const clientX = lastEvent.clientX;
    const clientY = lastEvent.clientY;
    const windowH = window.innerHeight;

    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      // Skip elements that are not rendered (e.g. inactive tab or hidden section)
      if (el.offsetParent === null) continue;

      const rect = el.getBoundingClientRect();
      // Only process elements currently in or adjacent to the viewport
      if (rect.bottom < -150 || rect.top > windowH + 150) continue;

      el.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
    }
  }

  const handleMouseMove = (event) => {
    lastEvent = event;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  };

  const handleScrollOrResize = () => {
    if (lastEvent && !rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("scroll", handleScrollOrResize, { passive: true });
  window.addEventListener("resize", handleScrollOrResize, { passive: true });
}
