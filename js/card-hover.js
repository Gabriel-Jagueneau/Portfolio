// ─── Card Hover Spotlight Effect ─────────────────────────────────────────────
// Ultra-optimized: tracks mouse position strictly for the card currently under cursor.
// Zero forced reflows: avoids looping over multiple elements per frame.

export function initCardHover() {
  const selector = ".card, .hero-btn, .diploma, #about .parags .inner .parag, #contact .head, #contact .body, #contact .bottom .info";
  let activeTarget = null;
  let activeRect = null;
  let rafPending = false;
  let lastClientX = 0;
  let lastClientY = 0;

  function update() {
    rafPending = false;
    if (activeTarget && activeRect) {
      activeTarget.style.setProperty("--mouse-x", `${lastClientX - activeRect.left}px`);
      activeTarget.style.setProperty("--mouse-y", `${lastClientY - activeRect.top}px`);
    }
  }

  document.addEventListener('pointermove', (e) => {
    const target = e.target.closest(selector);
    if (!target) {
      activeTarget = null;
      activeRect = null;
      return;
    }

    if (target !== activeTarget) {
      activeTarget = target;
      activeRect = target.getBoundingClientRect();
    }

    lastClientX = e.clientX;
    lastClientY = e.clientY;

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (activeTarget) {
      activeRect = activeTarget.getBoundingClientRect();
    }
  }, { passive: true });
}
