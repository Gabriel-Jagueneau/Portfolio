let orbits;
const zone = document.querySelector(".image-zone");
const cards = document.querySelectorAll(".cardage");
const allCards = Array.from(cards);
const dragStates = new Map();

let repulsionDistance = 375;
let maxVelocity = 35;

document.addEventListener('DOMContentLoaded', () => {
  function initializeOrbits() {
    orbits = allCards.map((_, i) => ({
      baseRadius: 0,
      targetRadius: zone.getBoundingClientRect().width / 3,
      speed: 0,
      targetSpeed: 0.0005,
      angle: (2 * Math.PI * i) / allCards.length,
      direction: 1,
      dragging: false,
      returning: false,
      angleLocked: false,

      currentX: 0,
      currentY: 0,

      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
    }));
  }

  initializeOrbits();

  window.addEventListener('resize', () => {
    initializeOrbits();
  });
});

function applyPhysics(o1, o2) {
  const dx = o2.currentX - o1.currentX;
  const dy = o2.currentY - o1.currentY;
  const distance = Math.hypot(dx, dy);

  if (distance < repulsionDistance && distance > 0) {
    const force = (repulsionDistance - distance) * 0.005;
    const angle = Math.atan2(dy, dx);

    o1.velocityX -= force * Math.cos(angle);
    o1.velocityY -= force * Math.sin(angle);

    o2.velocityX += force * Math.cos(angle);
    o2.velocityY += force * Math.sin(angle);
  }
}

function animate() {
  const rect = zone.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  cards.forEach((card, i) => {
    const o = orbits[i];
    if (!o) return;

    if (o.dragging) return;

    if (o.returning) {
      const targetX = centerX + o.baseRadius * Math.cos(o.angle);
      const targetY = centerY + o.baseRadius * Math.sin(o.angle);

      const easing = 0.1;
      o.currentX += (targetX - o.currentX) * easing;
      o.currentY += (targetY - o.currentY) * easing;

      card.style.left = (o.currentX - card.offsetWidth / 2) + "px";
      card.style.top = (o.currentY - card.offsetHeight / 2) + "px";

      if (Math.hypot(targetX - o.currentX, targetY - o.currentY) < 0.5) {
        o.returning = false;
        o.angleLocked = false;
        o.currentX = targetX;
        o.currentY = targetY;
      }
      return;
    }

    if (!o.angleLocked) {
      o.baseRadius += (o.targetRadius - o.baseRadius) * 0.02;
      o.speed += (o.targetSpeed - o.speed) * 0.02;
      o.angle += o.speed * o.direction;
    }

    orbits.forEach((otherOrbit, j) => {
      if (i !== j) {
        applyPhysics(o, otherOrbit);
      }
    });

    o.velocityX *= 0.95;
    o.velocityY *= 0.95;

    const velocityMagnitude = Math.hypot(o.velocityX, o.velocityY);
    if (velocityMagnitude > maxVelocity) {
      const scale = maxVelocity / velocityMagnitude;
      o.velocityX *= scale;
      o.velocityY *= scale;
    }

    o.currentX += o.velocityX;
    o.currentY += o.velocityY;

    const x = centerX + o.baseRadius * Math.cos(o.angle);
    const y = centerY + o.baseRadius * Math.sin(o.angle);

    o.currentX += (x - o.currentX) * 0.02;
    o.currentY += (y - o.currentY) * 0.02;

    card.style.left = (o.currentX - card.offsetWidth / 2) + "px";
    card.style.top = (o.currentY - card.offsetHeight / 2) + "px";
  });

  requestAnimationFrame(animate);
}

cards.forEach((card, i) => {
  card.style.position = 'absolute';

  card.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const o = orbits[i];
    o.dragging = true;
    o.returning = false;
    o.angleLocked = true;

    dragStates.set(card, {
      dragging: true,
      offsetX: e.clientX - card.offsetLeft,
      offsetY: e.clientY - card.offsetTop,
      posX: card.offsetLeft + card.offsetWidth / 2,
      posY: card.offsetTop + card.offsetHeight / 2,
      scheduled: false,
    });

    function onMouseMove(e) {
      const drag = dragStates.get(card);
      if (!drag || !drag.dragging) return;

      drag.posX = e.clientX - drag.offsetX + card.offsetWidth / 2;
      drag.posY = e.clientY - drag.offsetY + card.offsetHeight / 2;

      if (!drag.scheduled) {
        drag.scheduled = true;
        requestAnimationFrame(() => {
          drag.scheduled = false;
          if (drag.dragging) {
            card.style.left = (drag.posX - card.offsetWidth / 2) + 'px';
            card.style.top = (drag.posY - card.offsetHeight / 2) + 'px';

            o.currentX = drag.posX;
            o.currentY = drag.posY;
          }
        });
      }
    }

    function onMouseUp() {
      const drag = dragStates.get(card);
      if (drag) drag.dragging = false;

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      o.dragging = false;

      const releaseX = card.offsetLeft + card.offsetWidth / 2;
      const releaseY = card.offsetTop + card.offsetHeight / 2;
      const rect = zone.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = releaseX - centerX;
      const dy = releaseY - centerY;

      o.baseRadius = Math.hypot(dx, dy);
      o.angle = Math.atan2(dy, dx);

      o.returning = true;
      o.angleLocked = true;

      o.currentX = releaseX;
      o.currentY = releaseY;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
});

document.getElementById('confetti-generator').addEventListener('mouseover', () => {
  const end = Date.now() + 1000;
  const colors = ["#eeff00", "#00aeff", "#ff00f2"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 50,
      spread: 60,
      origin: { x: 0 , y: 1 },
      colors: colors
    });

    confetti({
      particleCount: 4,
      angle: 130,
      spread: 60,
      origin: { x: 1 , y: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
});

// Nav & scroll

const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.container .sub');
let isClickScrolling = false;

const navBar = document.getElementById('navBar');
const navShow = document.getElementById('nav-show');

const observer = new IntersectionObserver((entries) => {
    if (isClickScrolling) return;

    entries.forEach(entry => {
        const index = Array.from(sections).indexOf(entry.target);
        if (entry.intersectionRatio >= 0.3) {
            navItems.forEach(item => item.classList.remove('growed'));
            navItems[index].classList.add('growed');
        } 
    });
}, { threshold: Array.from({length: 101}, (_, i) => i / 100) });

function observeScroll() {
  sections.forEach(section => observer.observe(section));
  navItems.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = sections[index];

        isClickScrolling = true;

        navItems.forEach(item => item.classList.remove('growed'));
        link.classList.add('growed');

        targetSection.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            isClickScrolling = false;
        }, 1000);
    });
  });
}

navShow.addEventListener('click', () => {
  navBar.classList.toggle('hidden');
});

// Initialization

document.addEventListener('DOMContentLoaded', () => {
  animate();
  observeScroll();
});

// AOS init

AOS.init();