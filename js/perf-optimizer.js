// ═══════════════════════════════════════════════════════════════════════════════
//  Performance Tier Optimizer (potato | low | medium | high)
//
// 1. Affiche un écran initial de la couleur du fond (durée : 0.5s).
// 2. Mesure la puissance GPU réelle (benchmark WebGL préchauffé & synchronisé),
//    les capacités WebGL2, l'architecture GPU et la cadence rAF sur 0.5s.
// 3. Détermine le niveau le plus juste tout en maximisant la qualité visuelle.
// 4. Applique les réglages et lève le rideau pour révéler la scène 3D.
// ═══════════════════════════════════════════════════════════════════════════════

let currentTier = 'high';
let isEvaluated = false;
let isInitializing = false;
let isReady = false;
let perfReadyPromise = null;
let cachedBenchmarkResult = null;
let lastPerfDiagnostics = null;

const TIER_RANK = { potato: 0, low: 1, medium: 2, high: 3 };
const TIER_ORDER = ['potato', 'low', 'medium', 'high'];

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

export function getPerfDiagnostics() {
  return lastPerfDiagnostics;
}

/**
 * Exécute un micro-benchmark GPU WebGL calibré avec passe de préchauffage (warm-up)
 * pour exclure la compilation shader/driver, puis mesure 12 passes plein écran (256x256)
 * synchronisées via readPixels. Le résultat est mis en cache pour la session.
 */
function runWebGLBenchmark() {
  if (cachedBenchmarkResult) return cachedBenchmarkResult;

  const fallback = {
    ok: false,
    supportsWebGL2: false,
    gpuRenderer: '',
    gpuVendor: '',
    isSoftwareRenderer: false,
    maxTextureSize: 0,
    maxSamples: 0,
    drawDuration: 999
  };

  let canvas = null;
  let gl = null;
  let vs = null;
  let fs = null;
  let prog = null;
  let buf = null;

  try {
    canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const ctxOpts = {
      powerPreference: 'high-performance',
      antialias: false,
      depth: false,
      stencil: false
    };

    gl = canvas.getContext('webgl2', ctxOpts);
    const supportsWebGL2 = !!gl;
    if (!gl) {
      gl = canvas.getContext('webgl', ctxOpts) || canvas.getContext('experimental-webgl', ctxOpts);
    }

    if (!gl) {
      cachedBenchmarkResult = fallback;
      return cachedBenchmarkResult;
    }

    let gpuRenderer = '';
    let gpuVendor = '';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      gpuRenderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      gpuVendor = String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '').toLowerCase();
    }

    const maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
    const maxSamples = supportsWebGL2 ? (Number(gl.getParameter(gl.MAX_SAMPLES)) || 0) : 0;

    const isSoftwareRenderer =
      gpuRenderer.includes('swiftshader') ||
      gpuRenderer.includes('llvmpipe') ||
      gpuRenderer.includes('softpipe') ||
      gpuRenderer.includes('software') ||
      gpuRenderer.includes('microsoft basic render') ||
      gpuRenderer.includes('gdi generic');

    if (isSoftwareRenderer) {
      cachedBenchmarkResult = {
        ok: true,
        supportsWebGL2,
        gpuRenderer,
        gpuVendor,
        isSoftwareRenderer: true,
        maxTextureSize,
        maxSamples,
        drawDuration: 999
      };
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      if (loseCtx) loseCtx.loseContext();
      return cachedBenchmarkResult;
    }

    vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }');
    gl.compileShader(vs);

    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fs,
      `precision mediump float;
       uniform float uPass;
       void main(){
         vec2 uv = gl_FragCoord.xy / 256.0;
         float v = uPass * 0.01;
         for (int i = 0; i < 48; i++) {
           float fi = float(i);
           v += sin(uv.x * (fi + 1.0) + uv.y * 2.3 + uPass) * cos(uv.y * (fi * 0.5 + 1.0) - uPass);
         }
         gl_FragColor = vec4(vec3(fract(v * 0.02)), 1.0);
       }`
    );
    gl.compileShader(fs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS) || !gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      cachedBenchmarkResult = fallback;
      return cachedBenchmarkResult;
    }

    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      cachedBenchmarkResult = fallback;
      return cachedBenchmarkResult;
    }

    gl.useProgram(prog);
    gl.viewport(0, 0, 256, 256);

    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pLoc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    const uPassLoc = gl.getUniformLocation(prog, 'uPass');
    const syncPixel = new Uint8Array(4);

    // Passe de préchauffage (warm-up) hors chronomètre pour exclure la compilation driver/shader
    for (let w = 0; w < 2; w++) {
      if (uPassLoc) gl.uniform1f(uPassLoc, w * 0.13);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel);

    // Passe chronométrée (12 passes x 256x256 synchronisées GPU -> CPU)
    const t0 = performance.now();
    for (let i = 0; i < 12; i++) {
      if (uPassLoc) gl.uniform1f(uPassLoc, i + 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel);
    const drawDuration = Math.max(0.01, performance.now() - t0);

    cachedBenchmarkResult = {
      ok: true,
      supportsWebGL2,
      gpuRenderer,
      gpuVendor,
      isSoftwareRenderer: false,
      maxTextureSize,
      maxSamples,
      drawDuration
    };
    return cachedBenchmarkResult;
  } catch (e) {
    cachedBenchmarkResult = fallback;
    return cachedBenchmarkResult;
  } finally {
    if (gl) {
      try {
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        const loseCtx = gl.getExtension('WEBGL_lose_context');
        if (loseCtx) loseCtx.loseContext();
      } catch (_) {
        // Ignorer les erreurs de libération du contexte éphémère
      }
    }
  }
}

/**
 * Détecte le profil de puissance matérielle (GPU réel, capacités WebGL, CPU/RAM, cadence rAF)
 */
export function evaluateHardwarePerformance(frameMetrics = null) {
  let savedPref = 'auto';
  try {
    savedPref = localStorage.getItem('gab_perf_tier') || 'auto';
  } catch (_) {
    savedPref = 'auto';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const forcedPerf = urlParams.get('perf') || savedPref || 'auto';
  if (['potato', 'low', 'medium', 'high'].includes(forcedPerf)) {
    lastPerfDiagnostics = {
      tier: forcedPerf,
      source: urlParams.get('perf') ? 'url' : 'storage',
      score: null,
      drawDuration: cachedBenchmarkResult?.drawDuration ?? null,
      medianFrameMs: frameMetrics?.medianFrameMs ?? null,
      gpuRenderer: cachedBenchmarkResult?.gpuRenderer ?? ''
    };
    return forcedPerf;
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const cores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0
    ? navigator.hardwareConcurrency
    : null;
  const memory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0
    ? navigator.deviceMemory
    : null;
  const isApplePlatform = /Macintosh|MacIntel|iPhone|iPad|iPod/i.test(ua) || /Mac/i.test(platform);
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (/Macintosh/i.test(ua) && maxTouchPoints > 1) ||
    (window.innerWidth > 0 && window.innerWidth <= 768 && maxTouchPoints > 0);
  const saveData = navigator.connection?.saveData === true;

  const bench = runWebGLBenchmark();
  if (!bench.ok || bench.isSoftwareRenderer) {
    lastPerfDiagnostics = {
      tier: 'potato',
      source: bench.isSoftwareRenderer ? 'software-renderer' : 'webgl-unavailable',
      score: 0,
      drawDuration: bench.drawDuration,
      medianFrameMs: frameMetrics?.medianFrameMs ?? null,
      gpuRenderer: bench.gpuRenderer
    };
    return 'potato';
  }

  const r = bench.gpuRenderer;

  const isWeakOrLegacyGPU =
    /\bintel.*hd\b/.test(r) ||
    /uhd\s*(?:graphics\s*)?6\d{2}/.test(r) ||
    /\bmali-(?:4\d+|t\d+|g3\d|g5[12])\b/.test(r) ||
    /\badreno\s*(?:\(tm\)\s*)?(?:[34]\d{2}|50\d)\b/.test(r) ||
    r.includes('powervr') ||
    r.includes('videocore');

  const isHighEndGPU = !isWeakOrLegacyGPU && (
    /\brtx\s*(?:20|30|40|50)/.test(r) ||
    /\bgtx\s*(?:1070|1080|1660)/.test(r) ||
    r.includes('rx 5700') ||
    /\brx\s*[6789]/.test(r) ||
    r.includes('radeon pro') ||
    r.includes('780m') ||
    r.includes('880m') ||
    r.includes('890m') ||
    /intel.*arc/.test(r) ||
    /apple\s+m[1-5]\b/.test(r) ||
    (r.includes('apple gpu') && !isMobile)
  );

  const isCapableGPU = !isWeakOrLegacyGPU && (
    r.includes('apple') ||
    r.includes('nvidia') ||
    r.includes('geforce') ||
    r.includes('rtx') ||
    r.includes('gtx') ||
    r.includes('quadro') ||
    r.includes('radeon') ||
    r.includes('rx ') ||
    /iris.*xe/.test(r) ||
    /iris.*plus/.test(r) ||
    /\badreno\s*(?:\(tm\)\s*)?(?:[78]\d{2}|x1)/.test(r) ||
    r.includes('immortalis') ||
    /\bmali-g7(?:10|15|20|25)/.test(r) ||
    r.includes('xclipse')
  );

  const isMidGPU = !isWeakOrLegacyGPU && (
    r.includes('iris') ||
    /uhd\s*(?:graphics\s*)?7\d{2}/.test(r) ||
    /\badreno\s*(?:\(tm\)\s*)?6\d{2}/.test(r) ||
    /\bmali-g(?:57|68|[789]\d)\b/.test(r)
  );

  // Calcul du score composite (base 62) calibré sans pénaliser les masquages navigateur
  let score = 62;

  const d = bench.drawDuration;
  if (d <= 2.5) score += 28;
  else if (d <= 5.0) score += 20;
  else if (d <= 8.5) score += 12;
  else if (d <= 13.5) score += 2;
  else if (d <= 20.0) score -= 12;
  else if (d <= 32.0) score -= 26;
  else score -= 42;

  if (isHighEndGPU) score += 22;
  else if (isCapableGPU) score += 14;
  else if (isMidGPU) score += 5;

  if (isWeakOrLegacyGPU) score -= 20;

  if (bench.supportsWebGL2) score += 6;
  else score -= 14;

  if (bench.maxTextureSize >= 16384) score += 4;
  else if (bench.maxTextureSize > 0 && bench.maxTextureSize < 4096) score -= 12;

  if (bench.maxSamples >= 8) score += 3;
  else if (bench.maxSamples >= 4) score += 1;

  if (cores !== null) {
    if (cores >= 10) score += 8;
    else if (cores >= 8) score += 5;
    else if (cores >= 6) score += 3;
    else if (cores <= 2) score -= 16;
    else if (cores <= 4 && !isApplePlatform) score -= 5;
  }

  if (memory !== null) {
    if (memory >= 8) score += 6;
    else if (memory <= 2) score -= 18;
    else if (memory <= 3) score -= 8;
  }

  if (isMobile) score -= 8;
  if (saveData) score -= 22;

  if (frameMetrics && frameMetrics.sampleCount >= 4 && typeof frameMetrics.medianFrameMs === 'number') {
    if (frameMetrics.medianFrameMs <= 10.0 && d <= 10.0) score += 6;
    else if (frameMetrics.medianFrameMs <= 18.0 && d <= 12.0) score += 3;
    else if (frameMetrics.medianFrameMs > 36.0) score -= 16;
  }

  let tier;
  if (score >= 78) tier = 'high';
  else if (score >= 48) tier = 'medium';
  else if (score >= 24) tier = 'low';
  else tier = 'potato';

  // Garde-fou Maximisation Qualité : si le GPU répond rapidement sous WebGL2,
  // ne pas brider même si le navigateur masque GPU / RAM / CPU (Safari, Firefox RFP)
  if (!saveData && bench.supportsWebGL2 && !isWeakOrLegacyGPU) {
    if ((!isMobile && d <= 6.0) || (isMobile && d <= 3.5)) {
      tier = TIER_ORDER[Math.max(TIER_RANK[tier], TIER_RANK.high)];
    } else if (d <= 11.0) {
      tier = TIER_ORDER[Math.max(TIER_RANK[tier], TIER_RANK.medium)];
    }
  }

  // Garde-fou Anti-Saccade : plafonne si le débit GPU ou la cadence rAF réelle décroche
  if (d > 38.0) {
    tier = TIER_ORDER[Math.min(TIER_RANK[tier], TIER_RANK.potato)];
  } else if (d > 24.0) {
    tier = TIER_ORDER[Math.min(TIER_RANK[tier], TIER_RANK.low)];
  } else if (d > 15.0 || (isWeakOrLegacyGPU && d > 9.0)) {
    tier = TIER_ORDER[Math.min(TIER_RANK[tier], TIER_RANK.medium)];
  }

  if (frameMetrics && frameMetrics.sampleCount >= 6 && frameMetrics.medianFrameMs > 38.0) {
    tier = TIER_ORDER[Math.min(TIER_RANK[tier], TIER_RANK.medium)];
  }

  lastPerfDiagnostics = {
    tier,
    source: frameMetrics ? 'auto-bench+raf' : 'auto-bench',
    score,
    drawDuration: bench.drawDuration,
    medianFrameMs: frameMetrics?.medianFrameMs ?? null,
    sampleCount: frameMetrics?.sampleCount ?? 0,
    gpuRenderer: bench.gpuRenderer,
    gpuVendor: bench.gpuVendor,
    supportsWebGL2: bench.supportsWebGL2,
    maxTextureSize: bench.maxTextureSize,
    maxSamples: bench.maxSamples,
    cores,
    memory,
    isMobile,
    saveData
  };

  return tier;
}

function applyTierState(tier) {
  document.documentElement.dataset.perfTier = tier;
  document.documentElement.classList.remove('perf-potato', 'perf-low', 'perf-medium', 'perf-high');
  document.documentElement.classList.add(`perf-${tier}`);
  if (document.body) {
    document.body.classList.remove('perf-potato', 'perf-low', 'perf-medium', 'perf-high');
    document.body.classList.add(`perf-${tier}`);
  }
  window.__PERF_TIER__ = tier;
}

/**
 * Initialise l'écran d'attente initial (0.5s couleur de fond) et déclenche l'évaluation en 2 phases
 */
export function initPerfOptimizer(onReady) {
  if (isInitializing) {
    if (onReady) waitForPerfReady().then(onReady);
    return;
  }
  isInitializing = true;

  // Helpers globaux en console
  window.getPerfTier = () => currentTier;
  window.getPerfDiagnostics = () => lastPerfDiagnostics;
  window.setPerfTier = (newTier) => {
    if (['potato', 'low', 'medium', 'high', 'auto'].includes(newTier)) {
      localStorage.setItem('gab_perf_tier', newTier);
      window.location.reload();
    }
  };

  // Phase 1 : évaluation synchrone immédiate (GPU + capacités WebGL + matériel)
  currentTier = evaluateHardwarePerformance();
  isEvaluated = true;
  applyTierState(currentTier);

  // Phase 2 : pendant le rideau de 0.5s, mesure de la cadence d'affichage réelle (rAF)
  const remaining = Math.max(0, 500 - performance.now());
  const frameDeltas = [];
  let prevTs = null;
  let rafHandle = 0;
  let settled = false;

  if (remaining > 50 && document.visibilityState !== 'hidden' && typeof requestAnimationFrame === 'function') {
    const sampleFrame = (ts) => {
      if (settled) return;
      if (prevTs !== null) {
        const dt = ts - prevTs;
        if (dt > 0 && dt < 250) {
          frameDeltas.push(dt);
        }
      }
      prevTs = ts;
      rafHandle = requestAnimationFrame(sampleFrame);
    };
    rafHandle = requestAnimationFrame(sampleFrame);
  }

  setTimeout(() => {
    settled = true;
    if (rafHandle) cancelAnimationFrame(rafHandle);

    let frameMetrics = null;
    if (document.visibilityState !== 'hidden' && frameDeltas.length > 0) {
      // Ignore la 1re frame susceptible d'inclure le layout/style initial
      const usable = frameDeltas.length > 1 ? frameDeltas.slice(1) : frameDeltas;
      if (usable.length > 0) {
        const sorted = [...usable].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const medianFrameMs = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) * 0.5
          : sorted[mid];
        frameMetrics = {
          medianFrameMs,
          sampleCount: usable.length
        };
      }
    }

    currentTier = evaluateHardwarePerformance(frameMetrics);
    applyTierState(currentTier);

    const diag = lastPerfDiagnostics || {};
    const gpuStr = typeof diag.drawDuration === 'number' ? `${diag.drawDuration.toFixed(2)}ms` : 'n/a';
    const rafStr = typeof diag.medianFrameMs === 'number' ? `${diag.medianFrameMs.toFixed(1)}ms` : 'n/a';
    console.log(
      `%c[PerfOptimizer] Mode: ${currentTier.toUpperCase()} | Score: ${diag.score ?? '-'} | GPU: ${gpuStr} | rAF: ${rafStr}`,
      'background: #191919; color: #00aeff; font-weight: bold; padding: 4px 10px; border: 1px solid #00aeff; border-radius: 6px;'
    );

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
    window.dispatchEvent(new CustomEvent('perfOptimizerReady', { detail: { tier: currentTier, diagnostics: lastPerfDiagnostics } }));
  }, remaining);
}

  /**
   * Injecte la notification discrète avec menu déroulant en bas à droite
   * (style pill de date 'About Me' qui se replie en petit icône demi-arc de cercle)
   */
  export function injectPerfBadge(tier) {
    if (document.getElementById('perf-badge-widget')) return;
    if (!document.body) return;

    const savedTier = localStorage.getItem('gab_perf_tier') || 'auto';
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
          <option value="auto" ${isAuto ? 'selected' : ''}>Auto (${tierLabels[tier] || 'Medium'})</option>
          <option value="high" ${savedTier === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${savedTier === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${savedTier === 'low' ? 'selected' : ''}>Low</option>
          <option value="potato" ${savedTier === 'potato' ? 'selected' : ''}>Potato</option>
        </select>
        <svg class="perf-select-arrow" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 6l4 4 4-4"/>
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
