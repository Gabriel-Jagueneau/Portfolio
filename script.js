import { initWebGLTree }      from './js/tree-3d.js';
import { initializeOrbits }  from './js/cards-physics.js?v=17';
import { observeScroll }     from './js/nav.js';
import { initFooter }        from './js/footer.js';
import { initCardHover }     from './js/card-hover.js';
import { initConfetti }      from './js/confetti.js';
import { initMacUI }         from './js/mac-ui.js?v=17';

document.addEventListener('DOMContentLoaded', () => {
  initializeOrbits();
  observeScroll();
  initFooter();
  initCardHover();
  initConfetti();
  initMacUI();

  initWebGLTree(() => {
    if (typeof AOS !== 'undefined') {
      AOS.init();
      AOS.refresh();
    }
  });
});