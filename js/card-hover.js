// ─── Card Hover Spotlight Effect ─────────────────────────────────────────────
// Tracks mouse position globally on the body and updates --mouse-x / --mouse-y CSS vars
// strictly for cards and spotlight elements that are currently visible on screen.

export function initCardHover() {
  const cards = Array.from(document.getElementsByClassName("card"));
  const visibleCards = new Set();

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleCards.add(entry.target);
        } else {
          visibleCards.delete(entry.target);
        }
      });
    }, { rootMargin: '60px' });

    cards.forEach(card => observer.observe(card));
  } else {
    // Fallback: all cards
    cards.forEach(card => visibleCards.add(card));
  }

  let lastEvent = null;
  let rafPending = false;

  function updateCards() {
    rafPending = false;
    if (!lastEvent) return;

    for (const card of visibleCards) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${lastEvent.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${lastEvent.clientY - rect.top}px`);
    }
  }

  const handleMouseMove = event => {
    lastEvent = event;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateCards);
    }
  };

  const body = document.getElementById("body");
  if (body) {
    body.onmousemove = handleMouseMove;
  }
}
