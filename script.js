
function createCircles() {
  const bg = document.getElementById('parallaxBg');
  const numCircles = 20;
  const columns = Math.ceil(Math.sqrt(numCircles));
  const rows = Math.ceil(numCircles / columns);

  for (let i = 0; i < numCircles; i++) {
    const circle = document.createElement('div');
    circle.classList.add('circle');

    const size = Math.random() * 300;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    const col = i % columns;
    const row = Math.floor(i / columns);
    const cellWidth = 100 / columns;
    const cellHeight = 90 / rows;
    const leftOffset = col * cellWidth + Math.random() * (cellWidth * 0.8);
    const topOffset = row * cellHeight + Math.random() * (cellHeight * 0.8);

    circle.style.left = `${leftOffset}%`;
    circle.style.top = `${topOffset}%`;
    bg.appendChild(circle);
  }
}

function animateCircles() {
  const circles = document.querySelectorAll('.circle');
  let rotationAngle = 0;

  function animate() {
    const scrolled = window.scrollY;
    rotationAngle += 0.005;

    circles.forEach((circle, index) => {
      const speed = (index + 1) * 0.05;
      const parallaxSpeed = (index + (1/5)) * 0.02;

      const time = Date.now() * 0.01;
      const oscillation = Math.sin(time * (speed * 0.2)) * 100;
      const parallax = scrolled * parallaxSpeed;

      const rotateAngle = rotationAngle * speed;

      circle.style.transform = `translateY(${oscillation + parallax}px) rotate(${rotateAngle}rad)`;
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function applyParallaxToText() {
  const home = document.getElementById('home');
  const bg = document.getElementById('parallaxBg');

  const bgStyle = window.getComputedStyle(bg).backgroundImage;

  home.style.backgroundImage = bgStyle;
  home.style.backgroundSize = "cover";
  home.style.backgroundPosition = "center";
}

// rotate

const zone = document.querySelector(".image-zone");
const cards = document.querySelectorAll(".cardage");
const allCards = Array.from(cards);
const dragStates = new Map();
const orbits = allCards.map((_, i) => ({
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
}));

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

    const x = centerX + o.baseRadius * Math.cos(o.angle);
    const y = centerY + o.baseRadius * Math.sin(o.angle);

    o.currentX = x;
    o.currentY = y;

    card.style.left = (x - card.offsetWidth / 2) + "px";
    card.style.top = (y - card.offsetHeight / 2) + "px";
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
      particleCount: 2,
      angle: 60,
      spread: 85,
      origin: { x: 0 , y: 1 },
      colors: colors
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 85,
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
        if (entry.intersectionRatio >= 0.5) {
            navItems.forEach(item => item.classList.remove('growed'));
            navItems[index].classList.add('growed');
        } 
    });
}, {threshold: [0, 0.5, 1]});

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
  createCircles();
  animateCircles();
  animate();
  observeScroll();
});

// AOS init

AOS.init();