// ─── Pure SVG Tree Growth & Zoom-Morph Preloader ──────────────────────────────
// 1. Starts on pure black: a tiny green sprout emerges from the soil.
// 2. Grows organically into a full SVG tree over 5 seconds (branches draw, leaves bloom).
// 3. At 4.8s, executes a cinematic zoom towards the right canopy and smoothly morphs
//    into the real background tree photo, then orchestrates the website entrance.

export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');

  if (!preloader) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const startTime = performance.now();
  const growthDuration = 4800; // 4.8s full growth before morph
  let isPageLoaded = document.readyState === 'complete';

  if (!isPageLoaded) {
    window.addEventListener('load', () => { isPageLoaded = true; }, { once: true });
  }

  function checkDone() {
    const elapsed = performance.now() - startTime;

    if (elapsed >= growthDuration && isPageLoaded) {
      // Trigger cinematic zoom & background photo crossfade
      preloader.classList.add('preloader-zoom-morph');
      document.body.classList.add('site-revealed');

      setTimeout(() => {
        preloader.remove();
        if (typeof onComplete === 'function') onComplete();
      }, 1000);
      return;
    }

    requestAnimationFrame(checkDone);
  }

  requestAnimationFrame(checkDone);
}
