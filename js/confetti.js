// ─── Confetti Generator ───────────────────────────────────────────────────────
// Stage 1 (Hover): Confetti strictly drawn on the canvas inside the #contact .head container
// Stage 2 (10 rapid hovers): Massive 2.8s SUPER CONFETTI explosion covering the entire window

export function initConfetti() {
  const confettiBtn = document.getElementById('confetti-generator');
  if (!confettiBtn) return;

  const brandColors = ["#eeff00", "#00aeff", "#ff00f2"];
  const superColors = [
    "#eeff00", "#00aeff", "#ff00f2", "#ff3366",
    "#00ffcc", "#ffd700", "#ff9900", "#ffffff", "#7928ca"
  ];

  let hoverTimestamps = [];
  let isSuperActive = false;
  let superInterval = null;

  // Local instance strictly inside #contact .head
  let headConfetti = null;
  function getHeadConfetti() {
    if (!headConfetti) {
      const headCanvas = document.getElementById('head-confetti-canvas');
      if (headCanvas && typeof window.confetti !== 'undefined' && typeof window.confetti.create === 'function') {
        headConfetti = window.confetti.create(headCanvas, { resize: true, useWorker: false });
      }
    }
    return headConfetti;
  }

  function triggerNormalConfetti() {
    if (isSuperActive) return;

    const fire = getHeadConfetti();
    if (!fire) return;

    // Small crisp burst emerging from bottom-left and bottom-right corners of .head
    fire({
      particleCount: 16,
      angle: 50,
      spread: 60,
      startVelocity: 35,
      origin: { x: 0, y: 1 },
      colors: brandColors,
      ticks: 180,
    });
    fire({
      particleCount: 16,
      angle: 130,
      spread: 60,
      startVelocity: 35,
      origin: { x: 1, y: 1 },
      colors: brandColors,
      ticks: 180,
    });
  }

  function triggerSuperConfetti() {
    if (typeof window.confetti !== 'function' || isSuperActive) return;
    isSuperActive = true;

    // ─── Massive Full-Screen Explosion across the ENTIRE WINDOW (100vw x 100vh) ───
    window.confetti({
      particleCount: 90,
      spread: 360,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.5 },
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
      scalar: 1.3,
      ticks: 350,
    });
    window.confetti({
      particleCount: 55,
      angle: 60,
      spread: 85,
      startVelocity: 65,
      origin: { x: 0, y: 1 },
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
    });
    window.confetti({
      particleCount: 55,
      angle: 120,
      spread: 85,
      startVelocity: 65,
      origin: { x: 1, y: 1 },
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
    });
    window.confetti({
      particleCount: 45,
      angle: 300,
      spread: 80,
      startVelocity: 45,
      origin: { x: 0.1, y: 0 },
      colors: superColors,
      shapes: ['star', 'circle'],
    });
    window.confetti({
      particleCount: 45,
      angle: 240,
      spread: 80,
      startVelocity: 45,
      origin: { x: 0.9, y: 0 },
      colors: superColors,
      shapes: ['star', 'circle'],
    });

    const duration = 2800;
    const animationEnd = Date.now() + duration;

    clearInterval(superInterval);
    superInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(superInterval);
        superInterval = null;
        setTimeout(() => {
          isSuperActive = false;
          hoverTimestamps = [];
        }, 300);
        return;
      }

      const progress = timeLeft / duration;

      window.confetti({
        particleCount: Math.floor(16 * progress) + 8,
        spread: 360,
        startVelocity: 42,
        origin: { x: Math.random(), y: Math.random() * 0.7 + 0.1 },
        colors: superColors,
        shapes: ['circle', 'square', 'star'],
        scalar: 1.15,
      });

      window.confetti({
        particleCount: Math.floor(14 * progress) + 6,
        angle: 55 + Math.random() * 20,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0, y: Math.random() * 0.5 + 0.5 },
        colors: superColors,
      });
      window.confetti({
        particleCount: Math.floor(14 * progress) + 6,
        angle: 125 - Math.random() * 20,
        spread: 65,
        startVelocity: 55,
        origin: { x: 1, y: Math.random() * 0.5 + 0.5 },
        colors: superColors,
      });

      window.confetti({
        particleCount: Math.floor(10 * progress) + 5,
        spread: 120,
        startVelocity: 28,
        origin: { x: Math.random() * 0.8 + 0.1, y: 0 },
        colors: superColors,
        shapes: ['star', 'circle'],
      });
    }, 180);
  }

  confettiBtn.addEventListener('mouseenter', () => {
    if (isSuperActive) return;

    const now = Date.now();
    hoverTimestamps = hoverTimestamps.filter(t => now - t < 3500);
    hoverTimestamps.push(now);

    if (hoverTimestamps.length >= 10) {
      hoverTimestamps = [];
      triggerSuperConfetti();
    } else {
      triggerNormalConfetti();
    }
  });
}




