const zone = document.querySelector(".image-zone");
const cards = document.querySelectorAll(".cardage");
const allCards = Array.from(cards);
const dragStates = new Map();

let orbits;
let maxVelocity = 35;

// Parameters to tune
const BASE_REPULSION_SCALE = 1.4;
const REPULSION_STRENGTH = 0.01;

document.addEventListener('DOMContentLoaded', () => {
  function initializeOrbits() {
    const rect = zone.getBoundingClientRect();
    const targetRadius = rect.width / 3;

    orbits = allCards.map((card, i) => {
      const cr = card.getBoundingClientRect();
      const repulsionRadiusX = cr.width * BASE_REPULSION_SCALE;
      const repulsionRadiusY = cr.height * BASE_REPULSION_SCALE;

      return {
        baseRadius: 0,
        targetRadius,
        speed: 0,
        targetSpeed: 0.00075,
        angle: (2 * Math.PI * i) / allCards.length,
        dragging: false,
        returning: false,
        angleLocked: false,

        currentX: 0,
        currentY: 0,

        targetX: 0,
        targetY: 0,
        velocityX: 0,
        velocityY: 0,

        width: cr.width,
        height: cr.height,
        repulsionRadiusX,
        repulsionRadiusY
      };
    });
  }

  initializeOrbits();

  window.addEventListener('resize', () => {
    const rect = zone.getBoundingClientRect();
    const targetRadius = rect.width / 3;

    orbits.forEach((o, i) => {
      const card = allCards[i];
      const cr = card.getBoundingClientRect();
      o.width = cr.width;
      o.height = cr.height;
      o.repulsionRadiusX = cr.width * BASE_REPULSION_SCALE;
      o.repulsionRadiusY = cr.height * BASE_REPULSION_SCALE;
      o.targetRadius = targetRadius;
    });
  });
});

function applyPhysics(o1, o2) {
  const dx = o2.currentX - o1.currentX;
  const dy = o2.currentY - o1.currentY;

  const pairRx = (o1.repulsionRadiusX + o2.repulsionRadiusX) / 2;
  const pairRy = (o1.repulsionRadiusY + o2.repulsionRadiusY) / 2;

  if (pairRx <= 0 || pairRy <= 0) return;

  const nx = dx / pairRx;
  const ny = dy / pairRy;
  const scaledDistance = Math.hypot(nx, ny);

  if (scaledDistance > 0 && scaledDistance < 1) {
    const closeness = 1 - scaledDistance;

    const avgPairSize = (pairRx + pairRy) / 2;
    let force = closeness * REPULSION_STRENGTH * avgPairSize;

    const angle = Math.atan2(dy, dx);

    const fx = force * Math.cos(angle);
    const fy = force * Math.sin(angle);

    o1.velocityX -= fx;
    o1.velocityY -= fy;

    o2.velocityX += fx;
    o2.velocityY += fy;
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

    if (o.inertialRelease) {
      const velMag = Math.hypot(o.velocityX || 0, o.velocityY || 0);
      if (velMag < 0.6) {
        o.inertialRelease = false;
        o.returning = true;
      }
    }

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
      o.angle += o.speed;
    }

    orbits.forEach((otherOrbit, j) => {
      if (i !== j) {
        applyPhysics(o, otherOrbit);
      }
    });

    o.velocityX = (o.velocityX || 0) * 0.95;
    o.velocityY = (o.velocityY || 0) * 0.95;

    const velocityMagnitude = Math.hypot(o.velocityX, o.velocityY);
    if (velocityMagnitude > maxVelocity) {
      const scale = maxVelocity / velocityMagnitude;
      o.velocityX *= scale;
      o.velocityY *= scale;
    }

    o.currentX += o.velocityX || 0;
    o.currentY += o.velocityY || 0;

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
      if (drag && typeof drag.posX === 'number' && typeof drag.posY === 'number') {
        const lastPosX = drag.posX;
        const lastPosY = drag.posY;
        const deltaX = releaseX - lastPosX;
        const deltaY = releaseY - lastPosY;
        o.velocityX = deltaX * 0.2;
        o.velocityY = deltaY * 0.2;
        if (Math.abs(o.velocityX) < 0.5 && Math.abs(o.velocityY) < 0.5) {
          o.velocityX = 0;
          o.velocityY = 0;
          o.returning = true;
          o.inertialRelease = false;
        } else {
          o.inertialRelease = true;
          o.returning = false;
        }
      } else {
        o.returning = true;
        o.inertialRelease = false;
      }

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


document.getElementById("cards-student").onmousemove = e => {
  for(const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };
}
document.getElementById("cards-dev").onmousemove = e => {
  for(const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };
}
document.getElementById("cards-other").onmousemove = e => {
  for(const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };
}

// AOS init

AOS.init();