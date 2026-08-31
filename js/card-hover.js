// ─── Card Hover Spotlight Effect ─────────────────────────────────────────────
// Tracks mouse position globally and updates --mouse-x / --mouse-y CSS vars
// on every .card element to power the radial gradient halo effect.

export function initCardHover() {
  const handleMouseMove = event => {
    for (const card of document.getElementsByClassName("card")) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    }
  };

  document.getElementById("body").onmousemove = handleMouseMove;
}
