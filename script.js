import { initWebGLTree }      from './js/tree-3d.js?v=53';
import { initializeOrbits }  from './js/cards-physics.js?v=34';
import { observeScroll }     from './js/nav.js?v=4';
import { initFooter }        from './js/footer.js';
import { initCardHover }     from './js/card-hover.js?v=2';
import { initConfetti }      from './js/confetti.js';
import { initMacUI }         from './js/mac-ui.js?v=31';
import { initDynamicDates }  from './js/dynamic-dates.js?v=1';

document.addEventListener('DOMContentLoaded', () => {
  initDynamicDates();
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