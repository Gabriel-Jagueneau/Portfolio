// ─── Card Hover Spotlight Effect ─────────────────────────────────────────────
// Tracks mouse position globally on the body and updates --mouse-x / --mouse-y CSS vars
// strictly for cards and spotlight elements that are currently visible on screen.

export function initCardHover() {
  const elements = Array.from(document.querySelectorAll(".card, .hero-btn"));
  const visibleElements = new Set();

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleElements.add(entry.target);
        } else {
          visibleElements.delete(entry.target);
        }
      });
    }, { rootMargin: '60px' });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback: all elements
    elements.forEach(el => visibleElements.add(el));
  }

  let lastEvent = null;
  let rafPending = false;

  function updateElements() {
    rafPending = false;
    if (!lastEvent) return;

    for (const el of visibleElements) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${lastEvent.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${lastEvent.clientY - rect.top}px`);
    }
  }

  const handleMouseMove = event => {
    lastEvent = event;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateElements);
    }
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
}
