import { initPerfOptimizer } from './js/perf-optimizer.js';
import { initWebGLTree }      from './js/tree-3d.js';
import { initializeOrbits }  from './js/cards-physics.js';
import { observeScroll }     from './js/nav.js';
import { initFooter }        from './js/footer.js';
import { initCardHover }     from './js/card-hover.js';
import { initConfetti }      from './js/confetti.js';
import { initMacUI }         from './js/mac-ui.js';
import { initMac3D }         from './js/mac-3d.js';
import { initDynamicDates }  from './js/dynamic-dates.js';
import { initBentoGrid }     from './js/bento-grid.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Écran initial couleur de fond (0.5s) + Détection et optimisation adaptative (potato | low | medium | high)
  initPerfOptimizer((tier) => {
    // 2. Dès la levée du rideau des 0.5s, l'arbre démarre sa croissance
    initWebGLTree(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init();
        AOS.refresh();
      }
    });
  });

  initDynamicDates();
  initBentoGrid();
  initializeOrbits();
  observeScroll();
  initFooter();
  initCardHover();
  initConfetti();
  initMacUI();
  initMac3D();
});
