// ─── Navigation & Scroll Observer ────────────────────────────────────────────
// Highlights the active nav item based on the visible section.

const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.container .sub');
let isClickScrolling = false;

const navBar  = document.getElementById('navBar');
const navShow = document.getElementById('nav-show');

const navObserver = new IntersectionObserver((entries) => {
  if (isClickScrolling) return;
  entries.forEach(entry => {
    const index = Array.from(sections).indexOf(entry.target);
    if (entry.isIntersecting && index !== -1) {
      navItems.forEach(item => item.classList.remove('growed'));
      navItems[index]?.classList.add('growed');
    }
  });
}, { threshold: 0.3 });

export function observeScroll() {
  sections.forEach(section => navObserver.observe(section));
  navItems.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = sections[index];
      if (!targetSection) return;

      isClickScrolling = true;
      navItems.forEach(item => item.classList.remove('growed'));
      link.classList.add('growed');
      targetSection.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => { isClickScrolling = false; }, 1000);
    });
  });
}

if (navShow && navBar) {
  navShow.addEventListener('click', () => {
    navBar.classList.toggle('hidden');
    navShow.classList.toggle('up');
  });
}
