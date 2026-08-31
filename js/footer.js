// ─── Footer "To Top" Rocket Button ───────────────────────────────────────────
// Shows the rocket button when near the bottom of the page.
// Triggers a smooth scroll-to-top animation on click.

export function initFooter() {
  const footerContainer = document.getElementById("footer-container");
  let hoverTimeout;
  const DETECTION_ZONE_PX  = 165;
  const DELAY_MS           = 500;
  const SCROLL_THRESHOLD   = 1000;

  if (!footerContainer) return;

  footerContainer.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains("animating")) return;
    btn.classList.add("animating");

    const { animationDuration } = window.getComputedStyle(btn);
    let durationMs = parseFloat(animationDuration) * (animationDuration.includes('s') && !animationDuration.includes('ms') ? 1000 : 1);
    durationMs = durationMs || 800;

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, Math.max(0, durationMs - 150));

    btn.addEventListener("animationend", function handler() {
      btn.classList.remove("animating");
      btn.removeEventListener("animationend", handler);
    }, { once: true });
  });

  const updateRocketVisibility = (mouseInZone = false) => {
    const { innerHeight, scrollY } = window;
    const { scrollHeight } = document.documentElement;

    const isAtBottom  = innerHeight + scrollY >= scrollHeight - 10;
    const isNotAtTop  = scrollY > SCROLL_THRESHOLD;

    if (isNotAtTop && (isAtBottom || mouseInZone)) {
      footerContainer.classList.add("scrolled-bottom");
    } else {
      footerContainer.classList.remove("scrolled-bottom");
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  let mouseCheckScheduled = false;
  window.addEventListener("mousemove", (e) => {
    if (mouseCheckScheduled) return;
    mouseCheckScheduled = true;
    requestAnimationFrame(() => {
      mouseCheckScheduled = false;
      const isMouseInZone = e.clientY >= window.innerHeight - DETECTION_ZONE_PX;
      const isNotAtTop    = window.scrollY > SCROLL_THRESHOLD;

      if (isMouseInZone && isNotAtTop) {
        if (!hoverTimeout && !footerContainer.classList.contains("scrolled-bottom")) {
          hoverTimeout = setTimeout(() => updateRocketVisibility(true), DELAY_MS);
        }
      } else {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
        updateRocketVisibility(false);
      }
    });
  }, { passive: true });

  window.addEventListener("scroll", () => updateRocketVisibility(false), { passive: true });

  updateRocketVisibility();
}
