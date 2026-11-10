// ─── Confetti Generator ───────────────────────────────────────────────────────
// Stage 1 (Hover): Confetti strictly drawn on the canvas inside the #contact .head container
// Stage 2 (10 rapid hovers): Massive 2.8s SUPER CONFETTI explosion covering the entire window
// Stage 3 (Hold >= 3s):
//   - At 1s: "you !" starts trembling and shakes more and more (escalates over 2s)
//   - At 3s: trembles fast and continuously loses/spews confetti from "you !" falling across the whole page as long as hovered
//   - On leave: smoothly de-excites and dampens down back to rest

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

  // Hold Easter Egg state
  let holdStage1Timer = null;
  let holdStage2Timer = null;
  let holdConfettiInterval = null;
  let calmTimer = null;
  let isHolding = false;

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

  function getYouOrigin() {
    const target = confettiBtn.querySelector('.confetti-inner') || confettiBtn;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return { x: 0.5, y: 0.5 };
    }
    return {
      x: Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.innerWidth)),
      y: Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.innerHeight)),
    };
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
    stopHold();

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
      zIndex: 9999,
    });
    window.confetti({
      particleCount: 55,
      angle: 60,
      spread: 85,
      startVelocity: 65,
      origin: { x: 0, y: 1 },
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
      zIndex: 9999,
    });
    window.confetti({
      particleCount: 55,
      angle: 120,
      spread: 85,
      startVelocity: 65,
      origin: { x: 1, y: 1 },
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
      zIndex: 9999,
    });
    window.confetti({
      particleCount: 45,
      angle: 300,
      spread: 80,
      startVelocity: 45,
      origin: { x: 0.1, y: 0 },
      colors: superColors,
      shapes: ['star', 'circle'],
      zIndex: 9999,
    });
    window.confetti({
      particleCount: 45,
      angle: 240,
      spread: 80,
      startVelocity: 45,
      origin: { x: 0.9, y: 0 },
      colors: superColors,
      shapes: ['star', 'circle'],
      zIndex: 9999,
    });

    const duration = 1500;
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
        zIndex: 9999,
      });

      window.confetti({
        particleCount: Math.floor(14 * progress) + 6,
        angle: 55 + Math.random() * 20,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0, y: Math.random() * 0.5 + 0.5 },
        colors: superColors,
        zIndex: 9999,
      });
      window.confetti({
        particleCount: Math.floor(14 * progress) + 6,
        angle: 125 - Math.random() * 20,
        spread: 65,
        startVelocity: 55,
        origin: { x: 1, y: Math.random() * 0.5 + 0.5 },
        colors: superColors,
        zIndex: 9999,
      });

      window.confetti({
        particleCount: Math.floor(10 * progress) + 5,
        spread: 120,
        startVelocity: 28,
        origin: { x: Math.random() * 0.8 + 0.1, y: 0 },
        colors: superColors,
        shapes: ['star', 'circle'],
        zIndex: 9999,
      });
    }, 180);
  }

  function triggerHoldConfetti() {
    if (typeof window.confetti !== 'function') return;

    // Initial pop burst from "you !" across the whole page
    window.confetti({
      particleCount: 40,
      angle: 90,
      spread: 100,
      startVelocity: 38,
      origin: getYouOrigin(),
      colors: superColors,
      shapes: ['circle', 'square', 'star'],
      scalar: 1.15,
      ticks: 400,
      gravity: 0.95,
      zIndex: 9999,
    });

    // Continuous spurts leaking and dropping out of "you !"
    // Never stops as long as the mouse stays hovered!
    clearInterval(holdConfettiInterval);
    holdConfettiInterval = setInterval(() => {
      if (!isHolding || isSuperActive) {
        clearInterval(holdConfettiInterval);
        holdConfettiInterval = null;
        return;
      }

      const curOrigin = getYouOrigin();

      // Main upward arc spilling out across the whole page
      window.confetti({
        particleCount: 4 + Math.floor(Math.random() * 4),
        angle: 65 + Math.random() * 50,
        spread: 75,
        startVelocity: 24 + Math.random() * 18,
        origin: curOrigin,
        colors: superColors,
        shapes: ['circle', 'square', 'star'],
        scalar: 0.95 + Math.random() * 0.3,
        ticks: 360,
        gravity: 1.05,
        drift: (Math.random() - 0.5) * 1.2,
        zIndex: 9999,
      });

      // Confetti dropping out downwards as it shakes
      if (Math.random() > 0.35) {
        window.confetti({
          particleCount: 2 + Math.floor(Math.random() * 2),
          angle: 250 + Math.random() * 40,
          spread: 45,
          startVelocity: 6 + Math.random() * 8,
          origin: curOrigin,
          colors: superColors,
          shapes: ['circle', 'square'],
          scalar: 0.85,
          ticks: 300,
          gravity: 1.25,
          zIndex: 9999,
        });
      }
    }, 130);
  }

  function startHold() {
    if (isSuperActive || isHolding) return;
    clearTimeout(calmTimer);
    calmTimer = null;
    confettiBtn.classList.remove('is-calming');
    isHolding = true;

    // After 1 second: start trembling with increasing intensity
    holdStage1Timer = setTimeout(() => {
      if (!isHolding || isSuperActive) return;
      confettiBtn.classList.add('is-escalating');

      // After 3 seconds total (2s after stage 1): shake and continuously leak confetti
      holdStage2Timer = setTimeout(() => {
        if (!isHolding || isSuperActive) return;
        confettiBtn.classList.remove('is-escalating');
        confettiBtn.classList.add('is-wild');

        triggerHoldConfetti();
      }, 2000);
    }, 1000);
  }

  function stopHold() {
    const wasShaking = confettiBtn.classList.contains('is-escalating') || confettiBtn.classList.contains('is-wild');

    isHolding = false;
    clearTimeout(holdStage1Timer);
    clearTimeout(holdStage2Timer);
    clearInterval(holdConfettiInterval);
    holdStage1Timer = null;
    holdStage2Timer = null;
    holdConfettiInterval = null;

    confettiBtn.classList.remove('is-escalating', 'is-wild');

    if (wasShaking) {
      // Smoothly de-excite over 500ms back to rest
      confettiBtn.classList.add('is-calming');
      clearTimeout(calmTimer);
      calmTimer = setTimeout(() => {
        confettiBtn.classList.remove('is-calming');
        calmTimer = null;
      }, 500);
    } else {
      confettiBtn.classList.remove('is-calming');
    }
  }

  function handleEnter() {
    if (isSuperActive) return;

    const now = Date.now();
    hoverTimestamps = hoverTimestamps.filter(t => now - t < 2000);
    hoverTimestamps.push(now);

    if (hoverTimestamps.length >= 10) {
      hoverTimestamps = [];
      stopHold();
      triggerSuperConfetti();
    } else {
      triggerNormalConfetti();
      startHold();
    }
  }

  function handleLeave() {
    stopHold();
  }

  confettiBtn.addEventListener('mouseenter', handleEnter);
  confettiBtn.addEventListener('mouseleave', handleLeave);
  confettiBtn.addEventListener('touchstart', handleEnter, { passive: true });
  confettiBtn.addEventListener('touchend', handleLeave);
  confettiBtn.addEventListener('touchcancel', handleLeave);
  window.addEventListener('blur', handleLeave);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) handleLeave();
  });
}
