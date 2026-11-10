// ═══════════════════════════════════════════════════════════════════════════════
//  Performance Tier Optimizer (potato | low | medium | high)
//
// 1. Affiche un écran initial de la couleur du fond (durée : 0.5s).
// 2. Évalue pendant ce laps de temps la puissance matérielle & GPU (micro-benchmark).
// 3. Détermine le niveau d'optimisation (potato, low, medium, high - par défaut high).
// 4. Applique les réglages et lève le rideau pour révéler l'arbre.
// ═══════════════════════════════════════════════════════════════════════════════

let currentTier = 'medium';
let isEvaluated = false;
let isInitializing = false;
let isReady = false;
let perfReadyPromise = null;

export function waitForPerfReady() {
  if (isReady) return Promise.resolve(currentTier);
  if (!perfReadyPromise) {
    perfReadyPromise = new Promise((resolve) => {
      window.addEventListener('perfOptimizerReady', (e) => {
        resolve(e.detail.tier);
      }, { once: true });
    });
  }
  return perfReadyPromise;
}

/**
 * Détecte le profil de puissance matérielle (GPU, CPU, mémoire, latence de rendu)
 */
export function evaluateHardwarePerformance() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // en Go (si supporté)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
  const saveData = navigator.connection?.saveData === true;

  // 1. Possibilité de forcer un niveau via URL (?perf=potato | ?perf=low | ?perf=medium | ?perf=high | ?perf=auto)
  // ou via localStorage ('gab_perf_tier')
  const urlParams = new URLSearchParams(window.location.search);
  const forcedPerf = urlParams.get('perf') || localStorage.getItem('gab_perf_tier');
  if (['potato', 'low', 'medium', 'high'].includes(forcedPerf)) {
    return forcedPerf;
  }

  // 2. Par défaut : sélection 'medium' pour tout nouvel utilisateur (sauf si auto demandé)
  if (forcedPerf !== 'auto') {
    // Sécurité pour machines extrêmement restreintes (software emulators ou économiseur de données actif)
    if (saveData || (cores <= 2 && memory <= 2)) {
      return 'potato';
    }
    return 'medium';
  }

  // 3. Analyse du GPU via WebGL
  let gpuRenderer = '';
  let drawDuration = 999;
  let supportsWebGL2 = false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    supportsWebGL2 = !!canvas.getContext('webgl2');

    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        gpuRenderer = (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      }

      // Détection immédiate des moteurs de rendu logiciel (CPU Software Emulators)
      if (
        gpuRenderer.includes('swiftshader') ||
        gpuRenderer.includes('llvmpipe') ||
        gpuRenderer.includes('softpipe') ||
        gpuRenderer.includes('software') ||
        gpuRenderer.includes('microsoft basic render')
      ) {
        return 'potato';
      }

      // Micro-Benchmark de remplissage GPU (mesure réelle de latence)
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }');
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(
        fs,
        'precision mediump float; void main(){ vec2 uv=gl_FragCoord.xy/128.; float v=0.; for(int i=0;i<40;i++){ v+=sin(uv.x*float(i)+uv.y); } gl_FragColor=vec4(vec3(v*0.02),1.); }'
      );
      gl.compileShader(fs);

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      const pLoc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(pLoc);
      gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

      // Mesure du temps d'exécution réel du draw pass
      const t0 = performance.now();
      for (let i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      gl.finish();
      drawDuration = performance.now() - t0;
    }
  } catch (e) {
    // WebGL indisponible ou erreur d'initialisation
    return 'potato';
  }

  // 4. Calcul du score composite (0 à 100)
  let score = 50;

  // Facteur CPU & RAM
  if (cores >= 8) score += 20;
  else if (cores >= 6) score += 12;
  else if (cores <= 2) score -= 25;
  else if (cores <= 4) score -= 10;

  if (memory >= 8) score += 15;
  else if (memory <= 2) score -= 25;
  else if (memory <= 4) score -= 10;

  // Facteur GPU Détecté
  const isDedicatedOrApple =
    gpuRenderer.includes('apple') ||
    gpuRenderer.includes('nvidia') ||
    gpuRenderer.includes('geforce') ||
    gpuRenderer.includes('rtx') ||
    gpuRenderer.includes('gtx') ||
    gpuRenderer.includes('radeon') ||
    gpuRenderer.includes('rx ');

  const isOldIntel =
    gpuRenderer.includes('intel hd') ||
    gpuRenderer.includes('intel uhd') ||
    gpuRenderer.includes('mali-400') ||
    gpuRenderer.includes('adreno 3');

  if (isDedicatedOrApple) score += 25;
  if (isOldIntel) score -= 20;
  if (supportsWebGL2) score += 10;

  // Facteur Micro-Benchmark GPU
  if (drawDuration < 5.0) score += 15;
  else if (drawDuration > 25.0) score -= 25;
  else if (drawDuration > 15.0) score -= 10;

  if (isMobile) score -= 15;

  // 5. Attribution du palier
  if (score < 35) return 'potato';
  if (score < 60) return 'low';
  if (score < 80) return 'medium';
  return 'high';
}

/**
 * Initialise l'écran d'attente initial (0.5s couleur de fond) et déclenche l'évaluation
 */
export function initPerfOptimizer(onReady) {
  if (isInitializing) {
    if (onReady) waitForPerfReady().then(onReady);
    return;
  }
  isInitializing = true;
  const startTime = performance.now();

  // 1. Détermine le niveau
  currentTier = evaluateHardwarePerformance();
  isEvaluated = true;

  // 2. Applique les classes CSS globales
  document.documentElement.dataset.perfTier = currentTier;
  document.documentElement.classList.remove('perf-potato', 'perf-low', 'perf-medium', 'perf-high');
  document.documentElement.classList.add(`perf-${currentTier}`);
  if (document.body) {
    document.body.classList.remove('perf-potato', 'perf-low', 'perf-medium', 'perf-high');
    document.body.classList.add(`perf-${currentTier}`);
  }

  // Helper global en console
  window.__PERF_TIER__ = currentTier;
  window.getPerfTier = () => currentTier;
  window.setPerfTier = (newTier) => {
    if (['potato', 'low', 'medium', 'high'].includes(newTier)) {
      localStorage.setItem('gab_perf_tier', newTier);
      window.location.reload();
    }
  };

  console.log(
    `%c[PerfOptimizer] Mode: ${currentTier.toUpperCase()}`,
    'background: #191919; color: #00aeff; font-weight: bold; padding: 4px 10px; border: 1px solid #00aeff; border-radius: 6px;'
  );

  // 3. Gestion de l'écran initial de la couleur du fond (durée exacte : 0.5s depuis le load)
  const remaining = Math.max(0, 500 - performance.now());

  setTimeout(() => {
    const curtain = document.getElementById('perf-init-curtain');
    if (curtain) {
      curtain.classList.add('curtain-hidden');
      setTimeout(() => {
        curtain.remove();
      }, 500);
    }

    isReady = true;
    if (typeof onReady === 'function') {
      onReady(currentTier);
    }
    injectPerfBadge(currentTier);
    window.dispatchEvent(new CustomEvent('perfOptimizerReady', { detail: { tier: currentTier } }));
  }, remaining);
}

/**
 * Injecte la notification discrète avec menu déroulant en bas à droite
 * (style pill de date 'About Me' qui se replie en petit icône demi-arc de cercle)
 */
export function injectPerfBadge(tier) {
  if (document.getElementById('perf-badge-widget')) return;
  if (!document.body) return;

  const savedTier = localStorage.getItem('gab_perf_tier') || 'medium';
  const isAuto = savedTier === 'auto';

  const tierLabels = {
    potato: 'Potato',
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };

  const widget = document.createElement('div');
  widget.id = 'perf-badge-widget';
  widget.className = `perf-badge-widget perf-tier-${tier} date`;
  widget.setAttribute('role', 'region');
  widget.setAttribute('aria-label', 'Qualité graphique');
  widget.setAttribute('title', 'Qualité graphique - Survoler pour modifier');

  widget.innerHTML = `
    <div class="perf-gear-wrapper" aria-hidden="true">
      <svg class="perf-gear-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
    <div class="perf-content">
      <span class="perf-title">Qualité :</span>
      <div class="perf-select-wrapper">
        <select id="perf-tier-select" class="perf-select" aria-label="Choisir la qualité graphique">
          <option value="high" ${savedTier === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${savedTier === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${savedTier === 'low' ? 'selected' : ''}>Low</option>
          <option value="potato" ${savedTier === 'potato' ? 'selected' : ''}>Potato</option>
          <option value="auto" ${isAuto ? 'selected' : ''}>Auto (${tierLabels[tier] || 'Medium'})</option>
        </select>
        <svg class="perf-select-arrow" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  const select = widget.querySelector('#perf-tier-select');

  // Clic sur l'icône : ouvre le focus pour permettre l'interaction
  widget.addEventListener('click', (e) => {
    if (e.target !== select && select) {
      select.focus();
    }
  });

  // Si on quitte le widget avec la souris, on retire le focus pour qu'il se referme impérativement
  widget.addEventListener('mouseleave', () => {
    if (select) {
      select.blur();
    }
  });

  // 1. Apparition fluide en pilule déployée pour afficher le résultat du benchmark
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      widget.classList.add('is-visible');
    });
  });

  // 2. Repliage automatique en demi-arc de cercle discret après l'introduction (3.8s)
  setTimeout(() => {
    widget.classList.add('is-folded');
  }, 3800);

  select.addEventListener('change', (e) => {
    const val = e.target.value;
    localStorage.setItem('gab_perf_tier', val);
    // Nettoie l'URL sans query param pour recharger sans rien dans l'URL
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.location.reload();
  });
}

export function getPerfTier() {
  return currentTier;
}

export function isPotato() {
  return currentTier === 'potato';
}

export function isLow() {
  return currentTier === 'low';
}

export function isMedium() {
  return currentTier === 'medium';
}

export function isHigh() {
  return currentTier === 'high';
}
