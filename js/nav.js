// ─── Navigation & Scroll Observer ────────────────────────────────────────────
// Ultra-smooth, jitter-free active section tracking with directional hysteresis

const navBar  = document.getElementById('navBar');
const navShow = document.getElementById('nav-show');

const navItems = Array.from(document.querySelectorAll('.container .sub'));

// Map each nav item to its section element via href attribute for guaranteed 1:1 pairing
const navPairs = navItems.map((item) => {
  const href = item.getAttribute('href');
  const section = href ? document.querySelector(href) : null;
  return { item, section };
}).filter(pair => pair.section !== null);

let isClickScrolling = false;
let clickTimeout = null;
let currentActiveIndex = -1;

function setActiveIndex(targetIndex) {
  if (targetIndex === currentActiveIndex || targetIndex < 0 || targetIndex >= navPairs.length) return;
  currentActiveIndex = targetIndex;
  navPairs.forEach((pair, idx) => {
    if (idx === targetIndex) {
      pair.item.classList.add('growed');
    } else {
      pair.item.classList.remove('growed');
    }
  });
}

function updateActiveSection() {
  if (isClickScrolling || navPairs.length === 0) return;

  const scrollY = window.scrollY || window.pageYOffset;
  const viewportH = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  const isAtBottom = (viewportH + scrollY) >= (scrollHeight - 35);

  const lastIdx = navPairs.length - 1;
  const lastRect = navPairs[lastIdx].section.getBoundingClientRect();

  // Bottom-of-page check: Only activate the last section (Contact)
  // if we are genuinely near the end of the page AND Contact is visible on screen
  if (isAtBottom && lastRect.top <= viewportH * 0.72) {
    setActiveIndex(lastIdx);
    return;
  }

  // Very top of page (Home)
  if (scrollY <= 60) {
    setActiveIndex(0);
    return;
  }

  const baseFocalPoint = viewportH * 0.40;
  const HYSTERESIS_PX = 55;

  // 1. Hysteresis check: If the currently active section still covers the focal zone comfortably,
  // hold onto it to prevent rapid micro-toggling / stuttering on wheel or trackpad scroll.
  if (currentActiveIndex >= 0 && currentActiveIndex < navPairs.length) {
    const currRect = navPairs[currentActiveIndex].section.getBoundingClientRect();
    if (currRect.top <= (baseFocalPoint + HYSTERESIS_PX) && currRect.bottom > (baseFocalPoint - HYSTERESIS_PX)) {
      return;
    }
  }

  // 2. Identify the section dominating the base focal point
  let targetIndex = -1;
  for (let i = 0; i < navPairs.length; i++) {
    const rect = navPairs[i].section.getBoundingClientRect();
    if (rect.top <= baseFocalPoint && rect.bottom > baseFocalPoint) {
      targetIndex = i;
      break;
    }
  }

  // 3. Fallback: closest section to focal point
  if (targetIndex === -1) {
    let minDistance = Infinity;
    navPairs.forEach((pair, i) => {
      const rect = pair.section.getBoundingClientRect();
      const dist = Math.abs(rect.top - baseFocalPoint);
      if (dist < minDistance) {
        minDistance = dist;
        targetIndex = i;
      }
    });
  }

  if (targetIndex !== -1) {
    setActiveIndex(targetIndex);
  }
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
    ticking = true;
  }
}

export function observeScroll() {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial calculation
  updateActiveSection();

  navPairs.forEach((pair, index) => {
    pair.item.addEventListener('click', (e) => {
      e.preventDefault();
      if (!pair.section) return;

      isClickScrolling = true;
      setActiveIndex(index);
      pair.section.scrollIntoView({ behavior: 'smooth' });

      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
        updateActiveSection();
      }, 950);
    });
  });
}

if (navShow && navBar) {
  navShow.addEventListener('click', () => {
    navBar.classList.toggle('hidden');
    navShow.classList.toggle('up');
  });
}
