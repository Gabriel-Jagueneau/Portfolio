import { Curtains, Plane } from 'https://cdn.skypack.dev/curtainsjs';

const zone = document.querySelector(".image-zone");
const cards = document.querySelectorAll(".cardage");
const allCards = Array.from(cards);
const dragStates = new Map();

let orbits;
let maxVelocity = 40;

// Parameters to tune
const BASE_REPULSION_SCALE = 1.4;
const REPULSION_STRENGTH = 0.025;

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
        targetSpeed: 0.00060,
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
  const end = Date.now() + 600;
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
  navShow.classList.toggle('up');
});

document.addEventListener('DOMContentLoaded', () => {
  const footerContainer = document.getElementById("footer-container");
  let hoverTimeout;
  const DETECTION_ZONE_PX = 165; 
  const DELAY_MS = 500;
  const SCROLL_THRESHOLD = 1000;

  if (!footerContainer) return;

  footerContainer.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains("animating")) return; 
    btn.classList.add("animating"); 

    const { animationDuration } = window.getComputedStyle(btn);
    let durationMs = parseFloat(animationDuration) * (animationDuration.includes('s') && !animationDuration.includes('ms') ? 1000 : 1);
    durationMs = durationMs || 800; 
    const scrollDelay = Math.max(0, durationMs - 150);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, scrollDelay);

    btn.addEventListener("animationend", function handler() {
        btn.classList.remove("animating");
        btn.removeEventListener("animationend", handler);
    }, { once: true });
  });

  const updateRocketVisibility = (mouseInZone = false) => {
    const { innerHeight, scrollY } = window;
    const { scrollHeight } = document.documentElement;
    
    const isAtBottom = innerHeight + scrollY >= scrollHeight - 10;
    const isNotAtTop = scrollY > SCROLL_THRESHOLD;

    if (isNotAtTop && (isAtBottom || mouseInZone)) {
      footerContainer.classList.add("scrolled-bottom");
    } else {
      footerContainer.classList.remove("scrolled-bottom");
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  window.addEventListener("mousemove", (e) => {
    const isMouseInZone = e.clientY >= window.innerHeight - DETECTION_ZONE_PX;
    const isNotAtTop = window.scrollY > SCROLL_THRESHOLD;

    if (isMouseInZone && isNotAtTop) {
      if (!hoverTimeout && !footerContainer.classList.contains("scrolled-bottom")) {
        hoverTimeout = setTimeout(() => {
          updateRocketVisibility(true);
        }, DELAY_MS);
      }
    } else {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
      updateRocketVisibility(false);
    }
  });

  window.addEventListener("scroll", () => {
    updateRocketVisibility(false);
  });

  updateRocketVisibility(); 
});

// Initialization

document.addEventListener('DOMContentLoaded', () => {
  animate();
  observeScroll();
});

// Hover Exp cards
document.addEventListener('DOMContentLoaded', () => {
  const handleMouseMove = event => {
    for(const card of document.getElementsByClassName("card")) {
        const rect = card.getBoundingClientRect(),
              x = event.clientX - rect.left, 
              y = event.clientY - rect.top;
  
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };
  };
  
  document.getElementById("body").onmousemove = handleMouseMove;
});

// mac clock

function updateClock() {
  const timeElement = document.getElementById('mac-menu-item-time');
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  const secondsStr = seconds < 10 ? '0' + seconds : seconds;

  timeElement.textContent = hours + ':' + minutesStr + ':' + secondsStr + ' ' + ampm;

  setTimeout(updateClock, 1000);
}

updateClock();

// mac window:

const desktop = document.getElementById('mac-desktop');
const minWindows = 6;

const appTemplates = {
    "Terminal": `
        <div style="font-family: 'Courier New', monospace; color: #a6e22e; font-size: 11px; padding: 10px; background: #1e1e1e; height: 100%;">
            <p style="color: #fff; margin-bottom: 5px;">Last login: ${new Date().toLocaleTimeString()}</p>
            <p><span style="color: #66d9ef;">➜</span> <span style="color: #f92672;">~</span> git status</p>
            <p style="color: #cfcfc2;">On branch main</p>
            <p style="color: #cfcfc2;">Your branch is up to date.</p>
            <p><span style="color: #66d9ef;">➜</span> <span style="color: #f92672;">~</span> <span class="cursor">_</span></p>
        </div>`,
    "Finder": `
        <div style="display: flex; height: 100%; color: #eee; font-size: 11px;">
            <div style="width: 75px; background: rgba(255,255,255,0.05); padding: 10px; border-right: 1px solid rgba(255,255,255,0.1);">
                <div style="opacity: 0.5; margin-bottom: 10px;">Favoris</div>
                <div style="margin-bottom: 5px;">🏠 Home</div>
                <div style="margin-bottom: 5px;">📄 Docs</div>
                <div style="margin-bottom: 5px;">☁️ iCloud</div>
            </div>
            <div style="flex: 1; padding: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; align-content: start;">
                <div style="text-align: center; border-radius: 5px; background-color: #555; padding: 8px;">📂<br>Projets</div>
                <div style="text-align: center; border-radius: 5px; background-color: #555; padding: 8px;">📂<br>Images</div>
                <div style="text-align: center; border-radius: 5px; background-color: #555; padding: 8px;">📂<br>Videos</div>
                <div style="text-align: center; border-radius: 5px; background-color: #555; padding: 8px;">📄<br>index.html</div>
            </div>
        </div>`,
    "Safari": `
    <div style="background: #555; height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, sans-serif; border-radius: 6px; overflow: hidden;">
        <div style="padding: 5px 10px; background: #444; display: flex; gap: 10px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.2);">
            <div style="display: flex; gap: 4px;">
                <div style="width:6px;height:6px;background:#bbb;border-radius:50%"></div>
                <div style="width:6px;height:6px;background:#bbb;border-radius:50%"></div>
            </div>
            <div style="flex: 1; background: #666; border-radius: 4px; height: 18px; font-size: 10px; display: flex; align-items: center; padding: 0 8px; color: aliceblue; opacity: 0.8;">
                https://gjagueneau.eu/
            </div>
        </div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #555;">
            <div style="
                position: relative; 
                font-size: 20px; 
                font-weight: 600; 
                color: aliceblue;
                background: linear-gradient(90deg, #eeff0088, #00aeff88, #ff00f288);
                background-size: 100% 3px;
                background-repeat: no-repeat;
                background-position: left bottom;
                padding-bottom: 4px;
            ">
                My Portfolio
            </div>
        </div>
    </div>`,
    "Music": `
        <div style="background: linear-gradient(180deg, #444, #222); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white;">
            <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #ff2d55, #ff5e3a); border-radius: 8px; box-shadow: 0 8px 15px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 10px;">♫</div>
            <div style="font-weight: bold; font-size: 13px;">Lofi Beats</div>
            <div style="font-size: 10px; opacity: 0.6;">Apple Music</div>
            <div style="width: 80%; height: 3px; background: #555; margin-top: 15px; border-radius: 2px; position: relative;">
                <div style="width: 40%; height: 100%; background: #fff; border-radius: 2px;"></div>
            </div>
        </div>`,
    "Settings": `
        <div style="padding: 10px; color: white;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 8px;">
                <div style="width: 30px; height: 30px; background: #888; border-radius: 50%;"></div>
                <div>
                  <div style="font-size: 12px; font-weight: bold;">Gabriel JAGUENEAU</div>
                  <div style="font-size: 9px; opacity: 0.6;">Apple ID, iCloud, Media</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; font-size: 10px;">🌐 Wi-Fi</div>
                <div style="background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; font-size: 10px;">🎧 Bluetooth</div>
            </div>
        </div>`
};

function spawnWindow() {
  const win = document.createElement('div');
  win.className = 'window';
  
  const apps = Object.keys(appTemplates);
  const appName = apps[Math.floor(Math.random() * apps.length)];
  
  // Dimensions de la fenêtre
  const winWidth = 320;
  const winHeight = 220;

  // Calcul des positions maximales en pixels (basé sur la taille de .desktop)
  const desktopWidth = desktop.offsetWidth;
  const desktopHeight = desktop.offsetHeight;

  // On s'assure que la fenêtre reste bien dans les limites du bureau
  const maxPosX = desktopWidth - winWidth;
  const maxPosY = desktopHeight - winHeight;

  // Positionnement aléatoire sur toute la surface disponible
  const posX = Math.floor(Math.random() * maxPosX);
  const posY = Math.floor(Math.random() * maxPosY);

  win.style.width = `${winWidth}px`;
  win.style.height = `${winHeight}px`;
  win.style.left = `${posX}px`;
  win.style.top = `${posY}px`;
  
  win.style.filter = "blur(10px)";
  win.style.opacity = "0";
  win.style.transform = "scale(0.8) translateY(30px)";

  win.innerHTML = `
      <div class="window-header">
          <div class="dots">
              <span class="dot close"></span>
              <span class="dot minimize"></span>
              <span class="dot maximize"></span>
          </div>
          <span class="window-title">${appName}</span>
      </div>
      <div class="window-content">${appTemplates[appName]}</div>
  `;

  desktop.appendChild(win);

  // Animation d'entrée
  requestAnimationFrame(() => {
      win.style.transition = "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      win.style.opacity = "1";
      win.style.transform = "scale(1) translateY(0)";
      win.style.filter = "blur(0px) brightness(0.75)";
  });

  // Cycle de vie
  const lifetime = Math.random() * 6000 + 5000;

  setTimeout(() => {
      win.style.opacity = "0";
      win.style.transform = "scale(0.8) translateY(-30px)";
      win.style.filter = "blur(10px)";
      setTimeout(() => {
          win.remove();
          spawnWindow();
      }, 500);
  }, lifetime);
}

for (let i = 0; i < minWindows; i++) {
  setTimeout(spawnWindow, i * 3000);
}

// AOS init

AOS.init();