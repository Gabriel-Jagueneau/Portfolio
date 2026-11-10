// ─── 3D WebGL Photorealistic Botanical Oak Tree (4 Distinct Living Stages) ───
//
// 1. Physically-Based Rendering (PBR): MeshStandardMaterial with soft PCF shadow maps.
// 2. Sculpted Organic Trunk S-Curve: Continuous seamless wood without floating sphere artifacts.
// 3. Perfect Botanical Timing: Every branch, bough, and foliage cluster emerges ONLY after
//    its parent wood has reached that exact intersection node (zero premature pop-ins).
// 4. Dual-Texture System:
//    - Young Shoot / Sapling: Silky, tender, translucent green with delicate fibers & satin sheen.
//    - Mature Tree: Deep furrowed oak bark with warm hazel ridges, fissures & lichen.
// 5. Proportional Botanical Thickness:
//    - Stage 1 (0% - 25%): Slender, succulent, curved seedling stem with cotyledons & dew.
//    - Stage 2 (25% - 50%): Balanced, charming young sapling with smooth hazel bark.
//    - Stage 3 (50% - 75%): Muscular growing tree with deep 3D limbs & rich mid-canopy.
//    - Stage 4 (75% - 100%): Majestic mature oak with sprawling crown, 800+ leaves & drifting breeze.

export function initWebGLTree(onComplete) {
  const canvas = document.getElementById('webgl-tree-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // ─── 1. Scene, Camera & High-Performance Renderer ─────────────────────────
  const scene = new THREE.Scene();
  const width = window.innerWidth;
  const height = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, -3.8, 4.8);

  // Adaptive Device Detection & 4-Tier Performance Scaling (potato | low | medium | high)
  const perfTier = (window.getPerfTier ? window.getPerfTier() : (window.__PERF_TIER__ || 'high'));
  const isPotatoTier = perfTier === 'potato';
  const isLowTier = perfTier === 'low';
  const isMediumTier = perfTier === 'medium';
  const isHighTier = perfTier === 'high';

  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isLowPower = isPotatoTier || isLowTier || isMobile;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: isHighTier || (isMediumTier && !isMobile),
    powerPreference: isPotatoTier ? 'low-power' : 'high-performance',
    precision: isPotatoTier ? 'lowp' : (isLowTier ? 'mediump' : 'highp')
  });
  renderer.setSize(width, height);

  // Performance maximale : ombres portées dynamiques désactivées (économie colossale de passes GPU)
  renderer.shadowMap.enabled = false;

  // Adaptive Pixel Ratio selon le palier de performance :
  // potato: 0.75 | low: 0.85 | medium: 1.0 | high: jusqu'à 1.25
  const pixelRatios = {
    potato: 0.75,
    low: 0.85,
    medium: 1.0,
    high: Math.min(window.devicePixelRatio || 1, 1.25)
  };
  const targetPixelRatio = pixelRatios[perfTier] || 1.0;
  renderer.setPixelRatio(targetPixelRatio);

  // ─── 2. Photorealistic Botanical Lighting & Natural Radiance ───────────────
  const ambientLight = new THREE.AmbientLight(0xf5faeb, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xe8f5e9, 0x3e2723, 0.65);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffdf0, 1.35);
  sunLight.position.set(14, 24, 18);
  sunLight.castShadow = false;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xa5d6a7, 0.75);
  rimLight.position.set(-16, 12, -12);
  scene.add(rimLight);

  const mossBounceLight = new THREE.DirectionalLight(0x81c784, 0.35);
  mossBounceLight.position.set(0, -8, 6);
  scene.add(mossBounceLight);

  // ── Seasonal Lighting Configurations [0: Arbre tel quel, 1: Ajout fleurs, 2: Perte fleurs / Été, 3: Automne, 4: Hiver] ──
  const sunSeasonColors = [
    new THREE.Color(0xfffdf0), // 0 Home : Printemps doux et lumineux (parfaitement calé avec l'intro)
    new THREE.Color(0xfff2de), // 1 About : Floraison printanière lumineuse
    new THREE.Color(0xfffdf2), // 2 Experience : Plein soleil estival
    new THREE.Color(0xffa84a), // 3 Projects : Lumière rasante ambrée d'automne
    new THREE.Color(0xdceaf8)  // 4 Contact : Lumière froide et limpide d'hiver
  ];
  const sunSeasonIntensities = [1.35, 1.45, 1.65, 1.50, 1.25];

  const ambientSeasonColors = [
    new THREE.Color(0xf5faeb), // 0 Home : Ambiance claire et naturelle (parfaitement calée avec l'intro)
    new THREE.Color(0xa2c896), // 1 Floraison
    new THREE.Color(0xfafef5), // 2 Été zénithal
    new THREE.Color(0xffecb8), // 3 Automne ambré
    new THREE.Color(0xd6e5f3)  // 4 Hiver bleuté
  ];
  const ambientSeasonIntensities = [0.85, 0.95, 1.10, 0.95, 0.85];

  const rimSeasonColors = [
    new THREE.Color(0xa5d6a7), // 0 Home : Lumière de contour naturelle
    new THREE.Color(0x8ae096), // 1 Floraison
    new THREE.Color(0xa5d6a7), // 2 Été
    new THREE.Color(0xffb74d), // 3 Automne
    new THREE.Color(0x90caf9)  // 4 Hiver
  ];
  const rimSeasonIntensities = [0.75, 0.75, 0.80, 0.90, 0.85];

  const hemiSkySeasonColors = [
    new THREE.Color(0x7fae84),
    new THREE.Color(0x90c894),
    new THREE.Color(0xe3f2fd),
    new THREE.Color(0xffe0b2),
    new THREE.Color(0xcfd8dc)
  ];
  const hemiGroundSeasonColors = [
    new THREE.Color(0x281b14),
    new THREE.Color(0x2a1c14),
    new THREE.Color(0x2e1c0c),
    new THREE.Color(0x3e1f0c),
    new THREE.Color(0x263238)
  ];

  const mossBounceSeasonColors = [
    new THREE.Color(0x48964e),
    new THREE.Color(0x56a85c),
    new THREE.Color(0x66bb6a),
    new THREE.Color(0xbf360c),
    new THREE.Color(0x546e7a)
  ];

  // ─── 3. Dual Procedural Textures: Fresh Young Stem vs Mature Bark ─────────
  // A) Fresh, Clean, Silky Young Shoot Texture (For Stage 1 sprout & young Stage 2 sapling)
  function createYoungStemTexture() {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 512;
    sCanvas.height = 512;
    const sCtx = sCanvas.getContext('2d');

    // Base végétale uniforme et soyeuse (sans faux dégradé 2D pour laisser la lumière 3D sculpter la rondeur)
    sCtx.fillStyle = '#4fa846';
    sCtx.fillRect(0, 0, 512, 512);

    // Fines fibres végétales longitudinales douces
    for (let x = 0; x < 512; x += 6) {
      const alpha = 0.08 + Math.random() * 0.12;
      sCtx.strokeStyle = `rgba(210, 255, 175, ${alpha})`;
      sCtx.lineWidth = 1.0 + Math.random() * 1.5;
      sCtx.beginPath();
      sCtx.moveTo(x + (Math.random() - 0.5) * 2, 0);
      sCtx.lineTo(x + (Math.random() - 0.5) * 2, 512);
      sCtx.stroke();
    }

    const tex = new THREE.CanvasTexture(sCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }

  // B) Mature Furrowed Oak Bark Texture & Bump Map (Authentic Organic Oak Bark)
  function createMatureBarkTextures() {
    const w = 512;
    const h = 512;
    const bCanvas = document.createElement('canvas');
    bCanvas.width = w;
    bCanvas.height = h;
    const bCtx = bCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = w;
    bumpCanvas.height = h;
    const bumpCtx = bumpCanvas.getContext('2d');

    // 1. Fond chêne naturel chaud et profond
    bCtx.fillStyle = '#4a2f1b';
    bCtx.fillRect(0, 0, w, h);

    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, w, h);

    // 2. Texture de grain ligneux et fibres naturelles de chêne (sans faux dégradés de colonnes)
    for (let x = 0; x < w; x += 2) {
      const ridgeW = 2 + Math.random() * 4;
      const shade = Math.sin(x * 0.08) * 18 + (Math.random() - 0.5) * 20;
      const r = Math.min(255, Math.max(0, 92 + shade));
      const g = Math.min(255, Math.max(0, 62 + shade * 0.72));
      const b = Math.min(255, Math.max(0, 42 + shade * 0.48));

      bCtx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      bCtx.fillRect(x, 0, ridgeW, h);

      const bVal = Math.min(255, Math.max(0, 128 + shade * 1.6));
      bumpCtx.fillStyle = `rgb(${Math.round(bVal)}, ${Math.round(bVal)}, ${Math.round(bVal)})`;
      bumpCtx.fillRect(x, 0, ridgeW, h);
    }

    // 3. Fissures d'écorce naturelles sinueuses et adoucies en ellipses lisses (adieu les artefacts 2px glitchy)
    for (let i = 0; i < 480; i++) {
      const fx = Math.random() * w;
      const fy = Math.random() * (h - 60);
      const flen = 16 + Math.random() * 55;
      const fw = 1.2 + Math.random() * 2.2;

      bCtx.fillStyle = 'rgba(20, 10, 5, 0.55)';
      bCtx.beginPath();
      bCtx.ellipse(fx, fy + flen * 0.5, fw * 0.6, flen * 0.5, (Math.random() - 0.5) * 0.1, 0, Math.PI * 2);
      bCtx.fill();

      bumpCtx.fillStyle = 'rgba(25, 25, 25, 0.55)';
      bumpCtx.beginPath();
      bumpCtx.ellipse(fx, fy + flen * 0.5, fw * 0.6, flen * 0.5, (Math.random() - 0.5) * 0.1, 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // 4. Éclats de lichens et patine naturelle vers le pied du tronc
    for (let j = 0; j < 160; j++) {
      const lx = Math.random() * w;
      const ly = 240 + Math.random() * 265;
      const rad = 2.5 + Math.random() * 6.5;

      bCtx.fillStyle = 'rgba(145, 175, 125, 0.22)';
      bCtx.beginPath();
      bCtx.arc(lx, ly, rad, 0, Math.PI * 2);
      bCtx.fill();
    }

    const colTex = new THREE.CanvasTexture(bCanvas);
    colTex.wrapS = THREE.RepeatWrapping;
    colTex.wrapT = THREE.RepeatWrapping;
    colTex.repeat.set(2, 3);

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(2, 3);

    return { color: colTex, bump: bumpTex };
  }

  // C) Botanical Leaf Texture with Central Vein, Laterals & Bump Relief
  function createProceduralLeafTextures() {
    const lCanvas = document.createElement('canvas');
    lCanvas.width = 256;
    lCanvas.height = 512;
    const lCtx = lCanvas.getContext('2d');

    // Dégradé naturel de limbe végétal vert chlorophyllien lumineux
    const grad = lCtx.createLinearGradient(0, 512, 0, 0);
    grad.addColorStop(0.0, '#3e8424');
    grad.addColorStop(0.4, '#4e9a2d');
    grad.addColorStop(0.75, '#5faa38');
    grad.addColorStop(1.0, '#6db844');
    lCtx.fillStyle = grad;
    lCtx.fillRect(0, 0, 256, 512);

    // Nervure centrale claire et nette
    lCtx.strokeStyle = 'rgba(210, 255, 175, 0.85)';
    lCtx.lineWidth = 6;
    lCtx.beginPath();
    lCtx.moveTo(128, 512);
    lCtx.quadraticCurveTo(128, 256, 128, 45);
    lCtx.stroke();

    // Nervures latérales secondaires
    lCtx.lineWidth = 2.4;
    lCtx.strokeStyle = 'rgba(195, 245, 155, 0.60)';
    for (let y = 470; y > 75; y -= 36) {
      const span = (1.0 - Math.abs(y - 250) / 290) * 82;
      lCtx.beginPath();
      lCtx.moveTo(128, y);
      lCtx.quadraticCurveTo(128 - span * 0.45, y - 22, 128 - span, y - 42);
      lCtx.stroke();
      lCtx.beginPath();
      lCtx.moveTo(128, y);
      lCtx.quadraticCurveTo(128 + span * 0.45, y - 22, 128 + span, y - 42);
      lCtx.stroke();
    }

    // Fines anastomoses tertiaires
    lCtx.lineWidth = 1.0;
    lCtx.strokeStyle = 'rgba(215, 255, 180, 0.35)';
    for (let y = 440; y > 95; y -= 48) {
      const span = (1.0 - Math.abs(y - 250) / 290) * 60;
      lCtx.beginPath();
      lCtx.moveTo(128 - span * 0.5, y - 20);
      lCtx.lineTo(128 - span * 0.8, y - 35);
      lCtx.stroke();
      lCtx.beginPath();
      lCtx.moveTo(128 + span * 0.5, y - 20);
      lCtx.lineTo(128 + span * 0.8, y - 35);
      lCtx.stroke();
    }

    const colTex = new THREE.CanvasTexture(lCanvas);

    // Bump Map pour relief tactile 3D des nervures et du parenchyme
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 256;
    bCanvas.height = 512;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 256, 512);

    // Nervure centrale saillante
    bCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 7;
    bCtx.beginPath();
    bCtx.moveTo(128, 512);
    bCtx.quadraticCurveTo(128, 256, 128, 45);
    bCtx.stroke();

    // Nervures latérales
    bCtx.lineWidth = 3.2;
    bCtx.strokeStyle = '#c8c8c8';
    for (let y = 470; y > 75; y -= 36) {
      const span = (1.0 - Math.abs(y - 250) / 290) * 82;
      bCtx.beginPath();
      bCtx.moveTo(128, y);
      bCtx.quadraticCurveTo(128 - span * 0.45, y - 22, 128 - span, y - 42);
      bCtx.stroke();
      bCtx.beginPath();
      bCtx.moveTo(128, y);
      bCtx.quadraticCurveTo(128 + span * 0.45, y - 22, 128 + span, y - 42);
      bCtx.stroke();
    }

    // Micro-texture cellulaire organique
    for (let p = 0; p < 600; p++) {
      const px = Math.random() * 256;
      const py = Math.random() * 512;
      const gray = 118 + Math.floor(Math.random() * 24);
      bCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
      bCtx.fillRect(px, py, 1.5, 1.5);
    }

    const bumpTex = new THREE.CanvasTexture(bCanvas);
    return { color: colTex, bump: bumpTex };
  }

  const youngStemTexture = createYoungStemTexture();
  const matureBarkData = createMatureBarkTextures();
  const matureBarkTexture = matureBarkData.color;
  const matureBarkBumpMap = matureBarkData.bump;
  const leafTextureData = createProceduralLeafTextures();
  const leafTexture = leafTextureData.color;
  const leafBumpMap = leafTextureData.bump;

  // ─── 4. Realistic Botanical Colors & Materials ─────────────────────────────
  const sproutGreenColor = new THREE.Color(0x66bb6a);     // Vibrant fresh seedling shoot
  const youngHazelBarkColor = new THREE.Color(0x825b42);  // Warm satiny hazel sapling bark

  const matureBarkSeasonColors = [
    new THREE.Color(0x543628), // 0 Home : écorce chêne brun chaud et naturel (continuité parfaite)
    new THREE.Color(0x583b2a), // 1 Floraison : écorce fraîche et sève printanière
    new THREE.Color(0x4a2f1b), // 2 Été : chêne profond
    new THREE.Color(0x60341c), // 3 Automne : chêne ambré flamboyant
    new THREE.Color(0x463f3a)  // 4 Hiver : écorce ardoise patinée par le givre
  ];
  const barkDarkBrownColor = matureBarkSeasonColors[0];

  // Seasonal Interpolation Helpers (5 Phases : 0 Home, 1 About, 2 Experience, 3 Projects, 4 Contact)
  function interpolateSeasonColor(targetColor, palette, seasonVal) {
    const s = Math.max(0, Math.min(4, seasonVal));
    if (s <= 1.0) {
      targetColor.lerpColors(palette[0], palette[1], s);
    } else if (s <= 2.0) {
      targetColor.lerpColors(palette[1], palette[2], s - 1.0);
    } else if (s <= 3.0) {
      targetColor.lerpColors(palette[2], palette[3], s - 2.0);
    } else {
      targetColor.lerpColors(palette[3], palette[4], s - 3.0);
    }
    return targetColor;
  }

  function interpolateSeasonScalar(values, seasonVal) {
    const s = Math.max(0, Math.min(4, seasonVal));
    if (s <= 1.0) {
      return THREE.MathUtils.lerp(values[0], values[1], s);
    } else if (s <= 2.0) {
      return THREE.MathUtils.lerp(values[1], values[2], s - 1.0);
    } else if (s <= 3.0) {
      return THREE.MathUtils.lerp(values[2], values[3], s - 2.0);
    } else {
      return THREE.MathUtils.lerp(values[3], values[4], s - 3.0);
    }
  }

  // 5 Stages Leaf Palettes: [0: Arbre tel quel, 1: Ajout fleurs, 2: Perte fleurs / Été, 3: Automne, 4: Hiver]
  const leafSeasonPalettes = [
    // Mat 0: Vert chêne naturel -> Vert vif floraison -> Vert sous-bois dense -> Orange flamboyant -> Brun fané
    [new THREE.Color(0x468e2a), new THREE.Color(0x52a034), new THREE.Color(0x387820), new THREE.Color(0xd25208), new THREE.Color(0x6a5444)],
    // Mat 1: Vert prairie noble -> Émeraude éclatant -> Pin forestier -> Écarlate carmin -> Chêne séché
    [new THREE.Color(0x3e8624), new THREE.Color(0x4a962e), new THREE.Color(0x306e1b), new THREE.Color(0xb8281e), new THREE.Color(0x6e5e4e)],
    // Mat 2: Vert feuille fraîche -> Printemps frais -> Vert profond -> Ambre doré ardent -> Terre automnale
    [new THREE.Color(0x4f9b32), new THREE.Color(0x5cb23c), new THREE.Color(0x3c8225), new THREE.Color(0xe47812), new THREE.Color(0x5c4a3c)],
    // Mat 3: Chêne robuste -> Végétal vif -> Vert cœur de forêt -> Orange brûlé -> Brun-gris
    [new THREE.Color(0x428c28), new THREE.Color(0x4ea232), new THREE.Color(0x34721e), new THREE.Color(0xc54212), new THREE.Color(0x7a6c5e)],
    // Mat 4: Vert chlorophyllien -> Vert délicat -> Vert d'été mature -> Or éclatant cuivré -> Reste d'hiver
    [new THREE.Color(0x56a638), new THREE.Color(0x64be44), new THREE.Color(0x408a28), new THREE.Color(0xeb8210), new THREE.Color(0x58473a)],
    // Mat 5: Vert feuille dense -> Bourgeon printanier -> Chêne moyen -> Vermillon ardent -> Brun givré
    [new THREE.Color(0x4a942e), new THREE.Color(0x58aa38), new THREE.Color(0x387a22), new THREE.Color(0xb02e0e), new THREE.Color(0x82766e)],
    // Mat 6: Canopée vibrante -> Vert équilibré -> Vert intense ombragé -> Cuivre chaud -> Brun dormant
    [new THREE.Color(0x3b8022), new THREE.Color(0x48942a), new THREE.Color(0x2d6618), new THREE.Color(0x8c5020), new THREE.Color(0x685a4e)]
  ];

  const leafMaterials = leafSeasonPalettes.map(palette => new THREE.MeshStandardMaterial({
    color: palette[0].clone(),
    map: leafTexture,
    bumpMap: leafBumpMap,
    bumpScale: 0.026,
    roughness: 0.50,
    metalness: 0.02,
    side: THREE.DoubleSide
  }));

  // 3D Sculpted Organic Oak Leaf Geometry (Véritable solide 3D volumique)
  // Comprend :
  // 1. Pédoncule cylindrique 3D reliant physiquement l'écorce au limbe (zéro vide d'attache)
  // 2. Limbe double face volumique avec nervure centrale en relief 3D, cambrure et épaisseur
  function createSculpted3DLeafGeometry() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const indices = [];

    // A) Pédoncule 3D cylindrique d'attache au bois (du point 0,0,0 au début du limbe)
    const petioleSteps = 3;
    const petioleRadial = 6;
    const petioleLen = 0.12;
    const petioleR = 0.012;

    for (let i = 0; i <= petioleSteps; i++) {
      const frac = i / petioleSteps;
      const y = frac * petioleLen;
      const r = petioleR * (1.1 - 0.25 * frac);
      for (let j = 0; j < petioleRadial; j++) {
        const ang = (j / petioleRadial) * Math.PI * 2;
        pos.push(Math.cos(ang) * r, y, Math.sin(ang) * r);
        uvs.push(j / petioleRadial, y / 0.74);
      }
    }

    for (let i = 0; i < petioleSteps; i++) {
      for (let j = 0; j < petioleRadial; j++) {
        const nextJ = (j + 1) % petioleRadial;
        const a = i * petioleRadial + j;
        const b = (i + 1) * petioleRadial + j;
        const c = (i + 1) * petioleRadial + nextJ;
        const d = i * petioleRadial + nextJ;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // B) Limbe volumique 3D double face avec épaisseur physique et relief de nervure
    const bladeVSteps = 8;
    const bladeUCols = 5;
    const bladeStartY = petioleLen;
    const bladeLen = 0.62;

    const topOffset = pos.length / 3;

    // 1. Face supérieure (adaxiale) avec nervure centrale en arête surélevée
    for (let i = 0; i <= bladeVSteps; i++) {
      const v = i / bladeVSteps;
      const y = bladeStartY + v * bladeLen;
      const midribArch = -Math.pow(v, 1.55) * 0.065;
      const widthFactor = Math.sin(Math.pow(v, 0.72) * Math.PI);
      const halfWidth = widthFactor * 0.25; // Largeur de limbe de chêne noble (feuillage ample et couvrant)
      const lobeWave = Math.sin(v * Math.PI * 4.5) * 0.018 * widthFactor;

      for (let j = 0; j < bladeUCols; j++) {
        const uNorm = (j / (bladeUCols - 1)) * 2.0 - 1.0;
        const x = uNorm * halfWidth;
        const cupFactor = (1.0 - uNorm * uNorm);
        const zGutter = -cupFactor * 0.024 * widthFactor + (Math.abs(uNorm) * 0.016 * widthFactor);
        const zEdge = (Math.abs(uNorm) > 0.55) ? lobeWave * ((Math.abs(uNorm) - 0.55) / 0.45) : 0;
        const midribRidge = (1.0 - Math.min(1.0, Math.abs(uNorm) * 2.5)) * 0.014 * (1.0 - v * 0.35);
        const z = midribArch + zGutter + zEdge + midribRidge + 0.005;

        pos.push(x, y, z);
        uvs.push((uNorm + 1.0) * 0.5, y / 0.74);
      }
    }

    for (let i = 0; i < bladeVSteps; i++) {
      for (let j = 0; j < bladeUCols - 1; j++) {
        const a = topOffset + i * bladeUCols + j;
        const b = topOffset + (i + 1) * bladeUCols + j;
        const c = topOffset + (i + 1) * bladeUCols + (j + 1);
        const d = topOffset + i * bladeUCols + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const botOffset = pos.length / 3;

    // 2. Face inférieure (abaxiale) avec quille de nervure saillante vers l'arrière
    for (let i = 0; i <= bladeVSteps; i++) {
      const v = i / bladeVSteps;
      const y = bladeStartY + v * bladeLen;
      const midribArch = -Math.pow(v, 1.55) * 0.065;
      const widthFactor = Math.sin(Math.pow(v, 0.72) * Math.PI);
      const halfWidth = widthFactor * 0.25;
      const lobeWave = Math.sin(v * Math.PI * 4.5) * 0.018 * widthFactor;

      for (let j = 0; j < bladeUCols; j++) {
        const uNorm = (j / (bladeUCols - 1)) * 2.0 - 1.0;
        const x = uNorm * halfWidth;
        const cupFactor = (1.0 - uNorm * uNorm);
        const zGutter = -cupFactor * 0.024 * widthFactor + (Math.abs(uNorm) * 0.016 * widthFactor);
        const zEdge = (Math.abs(uNorm) > 0.55) ? lobeWave * ((Math.abs(uNorm) - 0.55) / 0.45) : 0;
        const midribKeel = -(1.0 - Math.min(1.0, Math.abs(uNorm) * 2.5)) * 0.016 * (1.0 - v * 0.35);
        const thickness = (1.0 - Math.abs(uNorm)) * 0.010 + 0.004;
        const z = midribArch + zGutter + zEdge - thickness + midribKeel;

        pos.push(x, y, z);
        uvs.push((uNorm + 1.0) * 0.5, y / 0.74);
      }
    }

    for (let i = 0; i < bladeVSteps; i++) {
      for (let j = 0; j < bladeUCols - 1; j++) {
        const a = botOffset + i * bladeUCols + j;
        const b = botOffset + (i + 1) * bladeUCols + j;
        const c = botOffset + (i + 1) * bladeUCols + (j + 1);
        const d = botOffset + i * bladeUCols + (j + 1);
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    // 3. Flancs latéraux pour clore le volume solide 3D
    for (let i = 0; i < bladeVSteps; i++) {
      const tL0 = topOffset + i * bladeUCols + 0;
      const tL1 = topOffset + (i + 1) * bladeUCols + 0;
      const bL0 = botOffset + i * bladeUCols + 0;
      const bL1 = botOffset + (i + 1) * bladeUCols + 0;
      indices.push(tL0, bL0, tL1);
      indices.push(bL0, bL1, tL1);

      const tR0 = topOffset + i * bladeUCols + (bladeUCols - 1);
      const tR1 = topOffset + (i + 1) * bladeUCols + (bladeUCols - 1);
      const bR0 = botOffset + i * bladeUCols + (bladeUCols - 1);
      const bR1 = botOffset + (i + 1) * bladeUCols + (bladeUCols - 1);
      indices.push(tR0, tR1, bR0);
      indices.push(bR0, tR1, bR1);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const leafGeo = createSculpted3DLeafGeometry();

  // ─── 5. Scene Hierarchy & Organic Forest Floor ─────────────────────────────
  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  // ── Helper : Hauteur 3D continue du sol organique (relief & contreforts) ──
  function getGroundHeight(x, z) {
    const dist = Math.hypot(x, z);
    // Renflement naturel du collet racinaire et de l'humus au centre
    const moundRise = Math.exp(-Math.pow(dist / 1.65, 2.0)) * 0.19;
    // Buttes organiques au-dessus des racines maîtresses
    const theta = Math.atan2(z, x);
    const rootRidge = Math.exp(-Math.pow(dist / 2.3, 1.8)) * (
      0.038 * Math.pow(Math.cos(theta * 2.0 + 0.35), 2) +
      0.022 * Math.sin(theta * 3.0 - 0.5)
    );
    // Micro-ondulations douces de sol forestier naturel
    const hummock = 0.028 * Math.sin(dist * 2.2 + theta * 3.0) +
                    0.016 * Math.cos(dist * 3.6 - theta * 2.0) +
                    0.012 * Math.sin(x * 2.6 + z * 2.6);
    // Pente douce en périphérie pour un fondu invisible
    const edgeDip = (dist > 5.8) ? Math.pow((dist - 5.8) / 3.2, 2) * 0.09 : 0;
    return -4.41 + moundRise + rootRidge + hummock - edgeDip;
  }

  // ── 3D Sculpted Forest Floor Mound Geometry (Adieu le plan plat cartoon) ──
  let groundBasePositions = null;
  function createOrganicGroundGeometry() {
    const rings = 44;
    const radialSegs = 56;
    const maxRadius = 9.2;
    const minRadius = 0.05;

    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const indices = [];

    // Sommet central
    pos.push(0, getGroundHeight(0, 0), 0);
    uvs.push(0.5, 0.5);

    for (let r = 1; r <= rings; r++) {
      const frac = r / rings;
      const dist = minRadius + Math.pow(frac, 1.20) * (maxRadius - minRadius);

      for (let s = 0; s < radialSegs; s++) {
        const theta = (s / radialSegs) * Math.PI * 2;
        const x = Math.cos(theta) * dist;
        const z = Math.sin(theta) * dist;
        const y = getGroundHeight(x, z);

        pos.push(x, y, z);
        uvs.push(0.5 + (x / (maxRadius * 2)), 0.5 + (z / (maxRadius * 2)));
      }
    }

    // Éventail central
    for (let s = 0; s < radialSegs; s++) {
      const nextS = (s + 1) % radialSegs;
      indices.push(0, s + 1, nextS + 1);
    }

    // Bandes de quads concentriques
    for (let r = 1; r < rings; r++) {
      const ringA = 1 + (r - 1) * radialSegs;
      const ringB = 1 + r * radialSegs;
      for (let s = 0; s < radialSegs; s++) {
        const nextS = (s + 1) % radialSegs;
        const a1 = ringA + s;
        const a2 = ringA + nextS;
        const b1 = ringB + s;
        const b2 = ringB + nextS;
        indices.push(a1, b1, a2);
        indices.push(a2, b1, b2);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    groundBasePositions = new Float32Array(pos);
    return geo;
  }

  // ── Procedural Forest Humus & Soil Canvas Textures (Color + Bump + Roughness) ──
  function createOrganicGroundTextures() {
    const w = 1024;
    const h = 1024;
    const cCanvas = document.createElement('canvas');
    cCanvas.width = w;
    cCanvas.height = h;
    const cCtx = cCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = w;
    bumpCanvas.height = h;
    const bumpCtx = bumpCanvas.getContext('2d');

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = w;
    roughCanvas.height = h;
    const roughCtx = roughCanvas.getContext('2d');

    // Pseudo-bruit FBM 2D pour l'humus, la texture granuleuse et la terre végétale
    const pTable = new Uint8Array(512);
    for (let i = 0; i < 256; i++) {
      pTable[i] = pTable[i + 256] = Math.floor(Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 256);
    }

    function noise2D(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3.0 - 2.0 * xf);
      const v = yf * yf * (3.0 - 2.0 * yf);
      const a = pTable[X] + Y;
      const b = pTable[X + 1] + Y;
      const n00 = pTable[a] / 255.0;
      const n10 = pTable[b] / 255.0;
      const n01 = pTable[a + 1] / 255.0;
      const n11 = pTable[b + 1] / 255.0;
      return (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v;
    }

    function fbm(x, y) {
      return noise2D(x, y) * 0.50 +
             noise2D(x * 2.1, y * 2.1) * 0.28 +
             noise2D(x * 4.3, y * 4.3) * 0.15 +
             noise2D(x * 8.7, y * 8.7) * 0.07;
    }

    const cImg = cCtx.createImageData(w, h);
    const bImg = bumpCtx.createImageData(w, h);
    const rImg = roughCtx.createImageData(w, h);
    const cPix = cImg.data;
    const bPix = bImg.data;
    const rPix = rImg.data;

    const cx = w * 0.5;
    const cy = h * 0.5;
    const maxR = w * 0.46;

    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dist = Math.hypot(dx, dy);
        const idx = (y * w + x) * 4;

        if (dist > maxR * 1.08) {
          cPix[idx + 3] = 0;
          bPix[idx] = bPix[idx + 1] = bPix[idx + 2] = 128;
          bPix[idx + 3] = 255;
          rPix[idx] = rPix[idx + 1] = rPix[idx + 2] = 220;
          rPix[idx + 3] = 255;
          continue;
        }

        // Bruit fractal multi-échelle pour les variations de sol
        const nx = x / 72.0;
        const ny = y / 72.0;
        const nFbm = fbm(nx, ny);
        const micro = noise2D(x / 9.0, y / 9.0);

        // Fondu radial doux avec lobes organiques et décroissance fractale
        const angle = Math.atan2(dy, dx);
        const lobeR = maxR * (0.86 + 0.12 * Math.cos(angle * 3.0 + 0.4) + 0.08 * Math.sin(angle * 5.0 - 0.2) + (nFbm - 0.5) * 0.14);
        const normDist = dist / lobeR;
        let alpha = 1.0;
        if (normDist > 0.42) {
          const tFade = Math.min(1.0, (normDist - 0.42) / 0.58);
          alpha = Math.cos(tFade * Math.PI * 0.5);
          alpha = Math.pow(alpha, 1.4);
        }

        // Ombres de contact (AO) sous le tronc et collet racinaire
        const aoFactor = Math.min(1.0, 0.38 + Math.pow(dist / (w * 0.22), 1.6) * 0.62);

        // Teintes d'humus forestier organique, terreau sombre et sous-bois naturel (moins saturé/flashy)
        const soilTone = nFbm * 0.65 + micro * 0.35;
        const rVal = Math.floor((125 + soilTone * 35) * aoFactor);
        const gVal = Math.floor((132 + soilTone * 30) * aoFactor);
        const bVal = Math.floor((108 + soilTone * 25) * aoFactor);

        cPix[idx] = Math.min(255, rVal);
        cPix[idx + 1] = Math.min(255, gVal);
        cPix[idx + 2] = Math.min(255, bVal);
        cPix[idx + 3] = Math.floor(Math.max(0, Math.min(255, alpha * 255)));

        // Bump / Relief : mottes de terre, micro-crevasses et granulométrie
        const bValCalc = Math.floor(128 + (nFbm - 0.5) * 78 + (micro - 0.5) * 38);
        bPix[idx] = bPix[idx + 1] = bPix[idx + 2] = Math.min(255, Math.max(0, bValCalc));
        bPix[idx + 3] = 255;

        // Rugosité : terre humide plus soyeuse dans les creux, mottes plus mates
        const rValCalc = Math.floor(188 + (micro - 0.5) * 44);
        rPix[idx] = rPix[idx + 1] = rPix[idx + 2] = Math.min(255, Math.max(0, rValCalc));
        rPix[idx + 3] = 255;
      }
    }

    cCtx.putImageData(cImg, 0, 0);
    bumpCtx.putImageData(bImg, 0, 0);
    roughCtx.putImageData(rImg, 0, 0);

    // Ajout de micro-débris organiques (brindilles, fragments de feuilles, particules d'humus)
    cCtx.fillStyle = 'rgba(25, 18, 10, 0.26)';
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 1.35) * (maxR * 0.78);
      const px = cx + Math.cos(a) * d;
      const py = cy + Math.sin(a) * d;
      const sz = 1.0 + Math.random() * 2.8;
      cCtx.beginPath();
      cCtx.arc(px, py, sz, 0, Math.PI * 2);
      cCtx.fill();
    }

    const colTex = new THREE.CanvasTexture(cCanvas);
    colTex.wrapS = THREE.ClampToEdgeWrapping;
    colTex.wrapT = THREE.ClampToEdgeWrapping;
    colTex.minFilter = THREE.LinearMipmapLinearFilter;
    colTex.magFilter = THREE.LinearFilter;

    const bTex = new THREE.CanvasTexture(bumpCanvas);
    bTex.wrapS = THREE.ClampToEdgeWrapping;
    bTex.wrapT = THREE.ClampToEdgeWrapping;
    bTex.minFilter = THREE.LinearMipmapLinearFilter;
    bTex.magFilter = THREE.LinearFilter;

    const rTex = new THREE.CanvasTexture(roughCanvas);
    rTex.wrapS = THREE.ClampToEdgeWrapping;
    rTex.wrapT = THREE.ClampToEdgeWrapping;
    rTex.minFilter = THREE.LinearMipmapLinearFilter;
    rTex.magFilter = THREE.LinearFilter;

    return { color: colTex, bump: bTex, rough: rTex };
  }

  const groundData = createOrganicGroundTextures();
  const groundTexture = groundData.color;
  const groundBumpTex = groundData.bump;
  const groundRoughTex = groundData.rough;

  // Couleurs de sol organique et prairie tempérée (teintes douces, naturelles et non flashy) :
  const groundSeasonColors = [
    new THREE.Color(0x284a20), // 0 Home : Sous-bois printanier naturel, vert végétal doux et équilibré
    new THREE.Color(0x2e5425), // 1 About : Prairie florissante tempérée et harmonieuse
    new THREE.Color(0x1f3d19), // 2 Experience : Vert sous-bois ombragé et profond
    new THREE.Color(0x6b441c), // 3 Projects : Humus automnal chaud, terre cuite et aiguilles mortes
    new THREE.Color(0xc2d3de)  // 4 Contact : Manteau givré doux et minéral d'hiver
  ];

  const groundMat = new THREE.MeshStandardMaterial({
    color: groundSeasonColors[0].clone(),
    map: groundTexture,
    bumpMap: groundBumpTex,
    bumpScale: 0.052,
    roughnessMap: groundRoughTex,
    transparent: true,
    depthWrite: false,
    roughness: 0.88,
    metalness: 0.01,
    side: THREE.DoubleSide
  });

  // Monticule de sol 3D sculpté et organique
  const groundMesh = new THREE.Mesh(createOrganicGroundGeometry(), groundMat);
  groundMesh.receiveShadow = true;
  treeGroup.add(groundMesh);

  // ── 3D Faceted Botanical Grass Clump Geometry (Touffes d'herbe réalistes avec nervure en V) ──
  function createRealisticGrassClumpGeometry() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    // Chaque touffe est composée de 7 brins d'herbe rayonnants aux courbures botaniques réalistes
    const bladeConfigs = [
      { angle: 0.0,  h: 0.50, w: 0.038, droop: 0.08, arch: 0.04 }, // Brin central élancé
      { angle: 0.9,  h: 0.44, w: 0.035, droop: 0.12, arch: 0.06 }, // Arc latéral droit
      { angle: 1.8,  h: 0.38, w: 0.032, droop: 0.14, arch: 0.08 }, // Bas cambré
      { angle: 2.7,  h: 0.46, w: 0.036, droop: 0.10, arch: 0.05 }, // Érigé arrière
      { angle: 3.6,  h: 0.42, w: 0.034, droop: 0.13, arch: 0.07 }, // Arc latéral gauche
      { angle: 4.5,  h: 0.36, w: 0.031, droop: 0.15, arch: 0.09 }, // Bas étalé
      { angle: 5.4,  h: 0.40, w: 0.033, droop: 0.11, arch: 0.06 }  // Deuxième cercle
    ];

    let vertOffset = 0;
    const segs = 5;

    bladeConfigs.forEach(({ angle, h, w, droop, arch }) => {
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const foldDepth = w * 0.40; // Nervure en V pour réflexion 3D de la lumière

      for (let i = 0; i <= segs; i++) {
        const v = i / segs;
        // Profil botanique : départ étroit au collet, renflement au tiers, effilement net à la pointe
        const profile = Math.sin(v * Math.PI * 0.78);
        const curW = w * (1.0 - v * 0.78) * (0.55 + 0.45 * profile);
        const curH = v * h;
        // Cambrure sous gravité : accélération parabolique vers la pointe
        const curDroop = Math.pow(v, 2.2) * droop;
        const curArch = Math.sin(v * Math.PI * 0.5) * arch;

        // Déplacement 3D le long de l'angle du brin
        const dx = cosA * (curDroop + curArch);
        const dz = sinA * (curDroop + curArch);

        // Vecteur normal perpendiculaire au plan du brin
        const perpX = -sinA;
        const perpZ = cosA;

        // Dégradé botanique doux de racine à apex (teintes mates et naturelles, sans surexposition)
        const rootR = 0.16, rootG = 0.26, rootB = 0.12;
        const midR = 0.48, midG = 0.62, midB = 0.34;
        const tipR = 0.68, tipG = 0.80, tipB = 0.46;

        let cr, cg, cb;
        if (v < 0.45) {
          const t = v / 0.45;
          cr = rootR + (midR - rootR) * t;
          cg = rootG + (midG - rootG) * t;
          cb = rootB + (midB - rootB) * t;
        } else {
          const t = (v - 0.45) / 0.55;
          cr = midR + (tipR - midR) * t;
          cg = midG + (tipG - midG) * t;
          cb = midB + (tipB - midB) * t;
        }

        // Sommet 0 : Flanc gauche du brin
        pos.push(
          dx + perpX * curW - cosA * foldDepth * (1 - v),
          curH,
          dz + perpZ * curW - sinA * foldDepth * (1 - v)
        );
        uvs.push(0.0, v);
        colors.push(cr * 0.88, cg * 0.88, cb * 0.88);

        // Sommet 1 : Nervure centrale en V
        pos.push(dx, curH, dz);
        uvs.push(0.5, v);
        colors.push(cr, cg, cb);

        // Sommet 2 : Flanc droit du brin
        pos.push(
          dx - perpX * curW - cosA * foldDepth * (1 - v),
          curH,
          dz - perpZ * curW - sinA * foldDepth * (1 - v)
        );
        uvs.push(1.0, v);
        colors.push(cr * 0.95, cg * 0.95, cb * 0.95);
      }

      // Triangles pour les 2 facettes du brin plié en V
      for (let i = 0; i < segs; i++) {
        const rowA = vertOffset + i * 3;
        const rowB = vertOffset + (i + 1) * 3;

        // Facette gauche (gauche -> centre)
        indices.push(rowA, rowB, rowA + 1);
        indices.push(rowA + 1, rowB, rowB + 1);

        // Facette droite (centre -> droite)
        indices.push(rowA + 1, rowB + 1, rowA + 2);
        indices.push(rowA + 2, rowB + 1, rowB + 2);
      }

      vertOffset += (segs + 1) * 3;
    });

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Ground Flora: Grass, Moss, Clovers, Flowers & Fallen Leaves
  const groundBlades = [];
  const seasonalFloraGroups = [];
  const grassGeo = createRealisticGrassClumpGeometry();

  // Palettes saisonnières dédiées aux brins d'herbe (vert champêtre tempéré, désaturé et organique) :
  const grassSeasonPalettes = [
    [new THREE.Color(0x3c6428), new THREE.Color(0x44722c), new THREE.Color(0x264c1c), new THREE.Color(0x945a1c), new THREE.Color(0x98aebd)],
    [new THREE.Color(0x365c24), new THREE.Color(0x3e6a29), new THREE.Color(0x204218), new THREE.Color(0x884e16), new THREE.Color(0xa0b4c3)],
    [new THREE.Color(0x426e2e), new THREE.Color(0x4a7a33), new THREE.Color(0x2a521e), new THREE.Color(0x9e6220), new THREE.Color(0xa8bcc9)],
    [new THREE.Color(0x345922), new THREE.Color(0x3c6627), new THREE.Color(0x1e3c15), new THREE.Color(0x7c4412), new THREE.Color(0x90a4b3)]
  ];

  const grassMaterials = grassSeasonPalettes.map(p => new THREE.MeshStandardMaterial({
    color: p[0].clone(),
    roughness: 0.65,
    metalness: 0.0,
    vertexColors: true,
    side: THREE.DoubleSide
  }));

  // Densité de prairie abondante et luxuriante au sol (touffes d'herbe denses et réalistes)
  const grassClumpCount = isPotatoTier ? 140 : (isLowTier ? 260 : (isMediumTier ? 420 : 580));
  for (let i = 0; i < grassClumpCount; i++) {
    const gMat = grassMaterials[i % grassMaterials.length];
    const grass = new THREE.Mesh(grassGeo, gMat);
    grass.castShadow = false;
    grass.receiveShadow = false;

    // Répartition en touffes organiques plus denses autour du tronc et des racines
    const clusterAngle = (i % 28) * (Math.PI * 2 / 28) + (Math.random() - 0.5) * 0.45;
    const rad = 0.22 + Math.pow(Math.random(), 1.22) * 3.25;
    const gx = Math.cos(clusterAngle) * rad;
    const gz = Math.sin(clusterAngle) * rad;
    const gy = getGroundHeight(gx, gz);

    const hScale = 0.70 + Math.random() * 1.10;
    const wScale = 0.75 + Math.random() * 0.65;
    const distFade = rad < 1.4 ? 1.0 : Math.max(0.35, 1.0 - (rad - 1.4) / 1.95);

    grass.position.set(gx, gy, gz);
    grass.scale.set(wScale * distFade, hScale * distFade, wScale * distFade);

    const tilt = 0.08 + Math.random() * 0.25;
    grass.rotation.set(
      Math.sin(clusterAngle) * tilt,
      Math.random() * Math.PI * 2,
      -Math.cos(clusterAngle) * tilt
    );

    treeGroup.add(grass);
    groundBlades.push({
      mesh: grass,
      baseRotZ: grass.rotation.z,
      baseScaleY: hScale * distFade,
      baseScaleXZ: wScale * distFade,
      swaySpeed: 1.4 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Sculpted Organic Moss Cushions (Mottes de mousse irrégulières, veloutées et bosselées)
  function createOrganicMossGeometry() {
    const geo = new THREE.SphereGeometry(1, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i);
      let y = p.getY(i);
      let z = p.getZ(i);
      y *= 0.38; // Coussin aplati organique
      const angle = Math.atan2(z, x);
      const ripple = 1.0 + 0.16 * Math.sin(angle * 4.0) + 0.09 * Math.cos(angle * 6.0);
      x *= ripple;
      z *= ripple;
      y += (Math.sin(x * 5.0) * Math.cos(z * 5.0)) * 0.035;
      p.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  const mossGeo = createOrganicMossGeometry();
  const mossSeasonPalettes = [
    [new THREE.Color(0x2a5418), new THREE.Color(0x32621e), new THREE.Color(0x1a4510), new THREE.Color(0x784418), new THREE.Color(0xa2b8ca)],
    [new THREE.Color(0x245014), new THREE.Color(0x2d5c1a), new THREE.Color(0x163e0e), new THREE.Color(0x6e3c14), new THREE.Color(0x9cb0c2)],
    [new THREE.Color(0x306218), new THREE.Color(0x386e1e), new THREE.Color(0x1e4c12), new THREE.Color(0x824c1a), new THREE.Color(0xa8bccd)],
    [new THREE.Color(0x224a12), new THREE.Color(0x2a5616), new THREE.Color(0x14380c), new THREE.Color(0x643610), new THREE.Color(0x94a8ba)]
  ];

  const mossMats = [
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[0][0].clone(), roughness: 1.0, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[1][0].clone(), roughness: 1.0, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[2][0].clone(), roughness: 1.0, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[3][0].clone(), roughness: 1.0, metalness: 0.0 })
  ];

  for (let m = 0; m < 26; m++) {
    const mMat = mossMats[m % mossMats.length];
    const moss = new THREE.Mesh(mossGeo, mMat);
    moss.receiveShadow = false;
    const mAngle = (m / 26) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const mRad = 0.35 + Math.random() * 2.0;
    const mx = Math.cos(mAngle) * mRad;
    const mz = Math.sin(mAngle) * mRad;
    const my = getGroundHeight(mx, mz);

    const sX = 0.22 + Math.random() * 0.32;
    const sY = 0.12 + Math.random() * 0.14;
    const sZ = 0.22 + Math.random() * 0.32;

    moss.position.set(mx, my, mz);
    moss.scale.set(sX, sY, sZ);
    moss.rotation.y = Math.random() * Math.PI * 2;
    treeGroup.add(moss);
  }

  // ── Détail Sol 1 : Galets et Rochers Mousseux de Sous-Bois ──
  const pebbleGeo = new THREE.DodecahedronGeometry(0.12, 1);
  const pPos = pebbleGeo.attributes.position;
  for (let pIdx = 0; pIdx < pPos.count; pIdx++) {
    const vx = pPos.getX(pIdx);
    const vy = pPos.getY(pIdx);
    const vz = pPos.getZ(pIdx);
    const noise = 1.0 + (Math.sin(vx * 7.0) * Math.cos(vz * 6.0)) * 0.16;
    pPos.setXYZ(pIdx, vx * noise, vy * (0.62 + 0.18 * noise), vz * noise);
  }
  pebbleGeo.computeVertexNormals();

  const stoneMats = [
    new THREE.MeshStandardMaterial({ color: 0x5a5750, roughness: 0.92, metalness: 0.04 }),
    new THREE.MeshStandardMaterial({ color: 0x484b42, roughness: 0.88, metalness: 0.05 }), // Granit moussu
    new THREE.MeshStandardMaterial({ color: 0x6e685f, roughness: 0.95, metalness: 0.02 }),
    new THREE.MeshStandardMaterial({ color: 0x3d4038, roughness: 0.90, metalness: 0.04 })
  ];

  const stoneCount = isLowPower ? 12 : 24;
  for (let s = 0; s < stoneCount; s++) {
    const sMat = stoneMats[s % stoneMats.length];
    const stone = new THREE.Mesh(pebbleGeo, sMat);
    stone.castShadow = false;
    stone.receiveShadow = false;

    const angle = (s / stoneCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const rad = 0.42 + Math.pow(Math.random(), 1.3) * 2.3;
    const sx = Math.cos(angle) * rad;
    const sz = Math.sin(angle) * rad;
    const sy = getGroundHeight(sx, sz);

    const scale = 0.55 + Math.random() * 1.1;
    stone.position.set(sx, sy, sz);
    stone.scale.set(scale * (0.8 + Math.random() * 0.4), scale * (0.5 + Math.random() * 0.3), scale * (0.8 + Math.random() * 0.4));
    stone.rotation.set(Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3);
    treeGroup.add(stone);
  }

  // ── Détail Sol 2 : Petits Branchages et Brindilles de Bois Mort au Sol ──
  const stickGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.45, 6);
  const stickMat = new THREE.MeshStandardMaterial({
    color: 0x3e281b,
    roughness: 0.92,
    metalness: 0.02
  });

  const stickCount = isLowPower ? 8 : 16;
  for (let k = 0; k < stickCount; k++) {
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.castShadow = false;
    stick.receiveShadow = false;

    const angle = Math.random() * Math.PI * 2;
    const rad = 0.45 + Math.random() * 1.9;
    const kx = Math.cos(angle) * rad;
    const kz = Math.sin(angle) * rad;
    const ky = getGroundHeight(kx, kz) + 0.01;

    stick.position.set(kx, ky, kz);
    const scale = 0.6 + Math.random() * 0.9;
    stick.scale.set(scale * (0.7 + Math.random() * 0.6), scale, scale * (0.7 + Math.random() * 0.6));
    stick.rotation.set(Math.PI * 0.5 + (Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2);
    treeGroup.add(stick);
  }

  // ── Détail Sol 3 : Glands de Chêne avec Cupules ──
  const acornNutGeo = new THREE.SphereGeometry(0.042, 8, 8);
  const acornCupGeo = new THREE.SphereGeometry(0.048, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const acornNutMat = new THREE.MeshStandardMaterial({ color: 0x8a5228, roughness: 0.45, metalness: 0.02 });
  const acornCupMat = new THREE.MeshStandardMaterial({ color: 0x4a321e, roughness: 0.95, metalness: 0.01 });

  const acornCount = isLowPower ? 6 : 14;
  for (let a = 0; a < acornCount; a++) {
    const aGroup = new THREE.Group();
    const nut = new THREE.Mesh(acornNutGeo, acornNutMat);
    nut.scale.set(1.0, 1.45, 1.0);
    nut.position.y = -0.015;
    aGroup.add(nut);

    const cup = new THREE.Mesh(acornCupGeo, acornCupMat);
    cup.position.y = 0.022;
    cup.scale.set(1.15, 0.9, 1.15);
    aGroup.add(cup);

    const angle = Math.random() * Math.PI * 2;
    const rad = 0.38 + Math.random() * 1.6;
    const ax = Math.cos(angle) * rad;
    const az = Math.sin(angle) * rad;
    const ay = getGroundHeight(ax, az) + 0.015;

    aGroup.position.set(ax, ay, az);
    const s = 0.75 + Math.random() * 0.45;
    aGroup.scale.set(s, s, s);
    aGroup.rotation.set(Math.PI * 0.5 + (Math.random() - 0.5) * 0.6, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.6);
    treeGroup.add(aGroup);
  }

  // Tapis de feuilles mortes d'automne éparpillées au sol
  const fallenLeaves = [];
  const fallenCount = isLowPower ? 20 : 42;
  const fallenSeasonPalettes = [
    [new THREE.Color(0x6ec040), new THREE.Color(0x6ec040), new THREE.Color(0x388e3c), new THREE.Color(0xe65100), new THREE.Color(0x5c493c)],
    [new THREE.Color(0x5cb838), new THREE.Color(0x5cb838), new THREE.Color(0x2e7d32), new THREE.Color(0xc62828), new THREE.Color(0x4f4035)],
    [new THREE.Color(0x8ee055), new THREE.Color(0x8ee055), new THREE.Color(0x4caf50), new THREE.Color(0xf57f17), new THREE.Color(0x6d5747)],
    [new THREE.Color(0x9ae660), new THREE.Color(0x9ae660), new THREE.Color(0x43a047), new THREE.Color(0xd84315), new THREE.Color(0x44362d)]
  ];
  const fallenMats = fallenSeasonPalettes.map(p => new THREE.MeshStandardMaterial({
    color: p[0].clone(),
    map: leafTexture,
    roughness: 0.65,
    side: THREE.DoubleSide
  }));

  for (let i = 0; i < fallenCount; i++) {
    const fMat = fallenMats[i % fallenMats.length];
    const fMesh = new THREE.Mesh(leafGeo, fMat);
    const angle = Math.random() * Math.PI * 2;
    const rad = 0.35 + Math.pow(Math.random(), 1.2) * 2.2;
    const fx = Math.cos(angle) * rad;
    const fz = Math.sin(angle) * rad;
    const fy = getGroundHeight(fx, fz) + 0.012;

    fMesh.position.set(fx, fy, fz);
    fMesh.rotation.set(-Math.PI * 0.5 + (Math.random() - 0.5) * 0.25, 0, Math.random() * Math.PI * 2);
    fMesh.scale.set(0.0001, 0.0001, 0.0001);
    treeGroup.add(fMesh);
    fallenLeaves.push({
      mesh: fMesh,
      baseScale: 0.28 + Math.random() * 0.14
    });
  }

  // Clovers
  for (let c = 0; c < 18; c++) {
    const cloverGroup = new THREE.Group();
    const cAngle = Math.random() * Math.PI * 2;
    const cRad = 0.5 + Math.random() * 1.9;
    const cx = Math.cos(cAngle) * cRad;
    const cz = Math.sin(cAngle) * cRad;
    const cy = getGroundHeight(cx, cz) + 0.01;
    cloverGroup.position.set(cx, cy, cz);

    const cMat = leafMaterials[(c * 2) % leafMaterials.length];
    const leafCount = (c % 7 === 0) ? 4 : 3; // Trèfles à 4 feuilles chanceux !
    for (let k = 0; k < leafCount; k++) {
      const leaflet = new THREE.Mesh(leafGeo, cMat);
      leaflet.castShadow = false;
      leaflet.receiveShadow = false;
      leaflet.rotation.set(Math.PI * 0.45, 0, (k * Math.PI * 2) / leafCount);
      leaflet.scale.set(0.12, 0.12, 0.12);
      cloverGroup.add(leaflet);
    }
    treeGroup.add(cloverGroup);
    seasonalFloraGroups.push(cloverGroup);
  }

  // Wildflowers on Forest Floor (Floraison printanière délicate et multicolore)
  const groundWildflowers = [];
  const petalGeo = new THREE.SphereGeometry(0.055, 8, 8);
  // Couleurs du gradient de marque Gabriel Jagueneau : Jaune (#eeff00), Cyan (#00c8ff), Magenta (#ff00d4)
  const groundFlowerMats = [
    new THREE.MeshStandardMaterial({ color: 0xeeff00, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0x00c8ff, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0xff00d4, roughness: 0.35 })
  ];
  const centerMatGold = new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.35 });
  const flowerColors = groundFlowerMats;

  for (let f = 0; f < 28; f++) {
    const flowerGroup = new THREE.Group();
    const fAngle = Math.random() * Math.PI * 2;
    const fRad = 0.5 + Math.random() * 2.2;
    const fx = Math.cos(fAngle) * fRad;
    const fz = Math.sin(fAngle) * fRad;
    const fy = getGroundHeight(fx, fz) + 0.012;
    flowerGroup.position.set(fx, fy, fz);

    const center = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), centerMatGold);
    center.scale.set(1.1, 0.8, 1.1);
    center.castShadow = false;
    flowerGroup.add(center);

    const curPetalMat = flowerColors[f % flowerColors.length];
    const petCount = 5;
    for (let p = 0; p < petCount; p++) {
      const petal = new THREE.Mesh(petalGeo, curPetalMat);
      const pAngle = (p / petCount) * Math.PI * 2;
      petal.position.set(Math.cos(pAngle) * 0.095, 0, Math.sin(pAngle) * 0.095);
      petal.scale.set(1.3, 0.45, 0.95);
      petal.castShadow = false;
      flowerGroup.add(petal);
    }
    flowerGroup.scale.set(0.0001, 0.0001, 0.0001);
    flowerGroup.visible = false;
    treeGroup.add(flowerGroup);
    groundWildflowers.push(flowerGroup);
  }

  // Forest Mushrooms (Bolets des bois, Girolles et Amanites naturelles)
  const capGeo = new THREE.SphereGeometry(0.12, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const stemGeo = new THREE.CylinderGeometry(0.025, 0.045, 0.16, 10);
  const shroomCapMatRed = new THREE.MeshStandardMaterial({ color: 0x9b2424, roughness: 0.55, metalness: 0.01 }); // Amanite naturelle nuancée
  const shroomCapMatBrown = new THREE.MeshStandardMaterial({ color: 0x5a3618, roughness: 0.65, metalness: 0.01 }); // Cèpe de Bordeaux
  const shroomCapMatGold = new THREE.MeshStandardMaterial({ color: 0xcc8224, roughness: 0.60, metalness: 0.01 }); // Girolle dorée
  const shroomStemMat = new THREE.MeshStandardMaterial({ color: 0xede4d0, roughness: 0.70, metalness: 0.01 });

  const shroomClusterCenters = [
    new THREE.Vector3(0.55, 0, 0.45),
    new THREE.Vector3(0.70, 0, 0.35),
    new THREE.Vector3(-0.62, 0, -0.40),
    new THREE.Vector3(-0.78, 0, -0.28),
    new THREE.Vector3(0.20, 0, -0.75),
    new THREE.Vector3(-0.35, 0, 0.70)
  ];

  shroomClusterCenters.forEach((center, cIdx) => {
    const countInCluster = 2 + (cIdx % 3);
    for (let sc = 0; sc < countInCluster; sc++) {
      const shroom = new THREE.Group();
      const ox = (Math.random() - 0.5) * 0.22;
      const oz = (Math.random() - 0.5) * 0.22;
      const posX = center.x + ox;
      const posZ = center.z + oz;
      const posY = getGroundHeight(posX, posZ);

      shroom.position.set(posX, posY, posZ);
      const scale = (0.55 + Math.random() * 0.50) * (cIdx % 2 === 0 ? 0.9 : 0.7);
      shroom.scale.set(scale, scale, scale);

      const stem = new THREE.Mesh(stemGeo, shroomStemMat);
      stem.position.y = 0.08;
      stem.castShadow = false;
      shroom.add(stem);

      let capMat = shroomCapMatRed;
      if (cIdx % 3 === 1) capMat = shroomCapMatBrown;
      else if (cIdx % 3 === 2) capMat = shroomCapMatGold;

      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.16;
      cap.castShadow = false;
      shroom.add(cap);

      shroom.rotation.z = (Math.random() - 0.5) * 0.35;
      treeGroup.add(shroom);
    }
  });

  // ─── 6. Continuous Sculptural Trunk Collar & Ground Transition ───────────────
  // Le tronc est un solide 3D continu et hermétique, s'élargissant au collet
  // et s'ancrant profondément dans le sol sans cylindre rapporté ni trou géométrique.

  // ─── 7. Sculptural Botanical Trunk S-Curve Nodes (12 Continuous Nodes) ────
  // Graceful organic S-line: emergent seedling lean curving into balanced oak spine
  const trunkNodes = [
    new THREE.Vector3(0.00, -4.60, 0.00),  // 0 Ground root base (deep subterranean anchor)
    new THREE.Vector3(0.06, -3.95, 0.04),  // 1 (Stage 1 Sprout lean)
    new THREE.Vector3(0.14, -3.45, 0.07),  // 2 (Stage 1 Sprout gentle curve)
    new THREE.Vector3(0.18, -2.90, 0.08),  // 3 (Stage 1 Sprout apex sweep)
    new THREE.Vector3(0.14, -2.35, 0.05),  // 4 (Stage 1 Crown / Stage 2 Base)
    new THREE.Vector3(-0.04, -1.65, -0.02),// 5 (Stage 2 Main lateral fork)
    new THREE.Vector3(-0.06, -0.95, -0.03),// 6 (Stage 2 Leader apex)
    new THREE.Vector3(0.00, 0.05, 0.01),   // 7 (Stage 3 Mid front/back fork)
    new THREE.Vector3(0.08, 0.75, 0.03),   // 8 (Stage 3 Mid trunk)
    new THREE.Vector3(0.15, 1.45, 0.01),   // 9 (Stage 3 Upper trunk)
    new THREE.Vector3(0.19, 2.15, -0.01),  // 10 (Stage 4 Base of crown)
    new THREE.Vector3(0.22, 2.85, 0.00)    // 11 (Stage 4 Crown fork)
  ];

  // ─── 8. Continuous Single-Mesh Botanical Trunk Engine (Un Seul Polygone 3D) ──
  // A single continuous 3D manifold mesh along the organic S-curve without segmented
  // cylinders, overlapping knuckles, or joint artifacts.
  const trunkCurve = new THREE.CatmullRomCurve3(trunkNodes, false, 'catmullrom', 0.25);
  const TRUNK_RINGS = 88;
  const TRUNK_RADIAL = 36;
  const SAMPLES = 256;

  // Precompute sample points, tangents, and rotation-minimizing frames (Double Reflection RMF)
  const samplePoints = [];
  const sampleTangents = [];
  for (let k = 0; k <= SAMPLES; k++) {
    const u = k / SAMPLES;
    samplePoints.push(trunkCurve.getPointAt(u));
    sampleTangents.push(trunkCurve.getTangentAt(u));
  }

  const sampleNormals = new Array(SAMPLES + 1);
  const sampleBinormals = new Array(SAMPLES + 1);

  const t0 = sampleTangents[0];
  let n0 = new THREE.Vector3(0, 0, 1);
  if (Math.abs(t0.z) > 0.85) n0.set(1, 0, 0);
  n0.crossVectors(t0, n0).normalize();
  sampleNormals[0] = n0;
  sampleBinormals[0] = new THREE.Vector3().crossVectors(t0, n0).normalize();

  for (let i = 1; i <= SAMPLES; i++) {
    const pPrev = samplePoints[i - 1];
    const pCurr = samplePoints[i];
    const tPrev = sampleTangents[i - 1];
    const tCurr = sampleTangents[i];
    const nPrev = sampleNormals[i - 1];

    const v1 = new THREE.Vector3().subVectors(pCurr, pPrev);
    const c1 = v1.dot(v1);

    if (c1 < 1e-8) {
      sampleNormals[i] = nPrev.clone();
      sampleBinormals[i] = new THREE.Vector3().crossVectors(tCurr, sampleNormals[i]).normalize();
      continue;
    }

    const rL = new THREE.Vector3().subVectors(nPrev, v1.clone().multiplyScalar((2.0 / c1) * v1.dot(nPrev)));
    const tL = new THREE.Vector3().subVectors(tPrev, v1.clone().multiplyScalar((2.0 / c1) * v1.dot(tPrev)));

    const v2 = new THREE.Vector3().subVectors(tCurr, tL);
    const c2 = v2.dot(v2);

    let nCurr;
    if (c2 < 1e-8) {
      nCurr = rL.normalize();
    } else {
      nCurr = new THREE.Vector3().subVectors(rL, v2.clone().multiplyScalar((2.0 / c2) * v2.dot(rL))).normalize();
    }

    sampleNormals[i] = nCurr;
    sampleBinormals[i] = new THREE.Vector3().crossVectors(tCurr, nCurr).normalize();
  }

  // Precomputed trigonometric tables for the 36 radial segments
  const cosTable = new Float32Array(TRUNK_RADIAL + 1);
  const sinTable = new Float32Array(TRUNK_RADIAL + 1);
  for (let j = 0; j <= TRUNK_RADIAL; j++) {
    const angle = (j / TRUNK_RADIAL) * Math.PI * 2;
    cosTable[j] = Math.cos(angle);
    sinTable[j] = Math.sin(angle);
  }

  // Trunk Geometry & Buffers
  const stride = TRUNK_RADIAL + 1;
  const totalVerts = (TRUNK_RINGS + 1) * stride + 2;
  const bottomCapIdx = (TRUNK_RINGS + 1) * stride;
  const topCapIdx = bottomCapIdx + 1;

  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  const uvArr = new Float32Array(totalVerts * 2);

  const indices = [];
  for (let i = 0; i < TRUNK_RINGS; i++) {
    for (let j = 0; j < TRUNK_RADIAL; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Bottom cap fan
  for (let j = 0; j < TRUNK_RADIAL; j++) {
    indices.push(bottomCapIdx, j + 1, j);
  }

  // Top cap fan
  const topRingStart = TRUNK_RINGS * stride;
  for (let j = 0; j < TRUNK_RADIAL; j++) {
    indices.push(topCapIdx, topRingStart + j, topRingStart + j + 1);
  }

  const trunkGeo = new THREE.BufferGeometry();
  trunkGeo.setIndex(indices);
  trunkGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  trunkGeo.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
  trunkGeo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

  const trunkMat = new THREE.MeshStandardMaterial({
    color: sproutGreenColor.clone(),
    map: youngStemTexture,
    roughness: 0.35,
    metalness: 0.04,
    side: THREE.DoubleSide
  });

  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  trunkMesh.frustumCulled = false; // Ne jamais masquer le tronc lors des déplacements caméra
  treeGroup.add(trunkMesh);
  trunkMesh.isTextureMatured = false;

  // Hermite cubic spline interpolation for fluid, seamless continuous growth (0 stops, 0 jerks)
  function hermiteGrowth(p0, p1, m0, m1, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
  }
  const growthKeyPoints = [0.005, 0.120, 0.420, 0.750, 1.000];
  const growthTangents = [0.25 * 0.40, 0.25 * 1.10, 0.25 * 1.30, 0.25 * 1.10, 0.25 * 0.30];

  function getTrunkGrowthT(prog) {
    if (prog <= 0.0) return 0.005;
    if (prog >= 1.0) return 1.0;
    const seg = Math.min(3, Math.floor(prog / 0.25));
    const u = (prog - seg * 0.25) / 0.25;
    return hermiteGrowth(growthKeyPoints[seg], growthKeyPoints[seg + 1], growthTangents[seg], growthTangents[seg + 1], u);
  }

  function getTrunkBaseRadius(t, prog) {
    const baseR = 0.62 - t * 0.44;
    // Évasement naturel et puissant au niveau du collet et du sol
    const maturity = Math.max(0, Math.min(1.0, (prog - 0.30) / 0.50));
    const flare = (t < 0.14) ? Math.pow((0.14 - t) / 0.14, 2.0) * 0.22 * maturity : 0.0;
    return baseR + flare;
  }

  const tempCenter = new THREE.Vector3();

  function updateContinuousTrunk(prog, thicknessFactor) {
    const targetT = getTrunkGrowthT(prog);

    let ptr = 0;
    let uvPtr = 0;

    for (let i = 0; i <= TRUNK_RINGS; i++) {
      const s = i / TRUNK_RINGS;
      const t = s * targetT;

      trunkCurve.getPointAt(t, tempCenter);

      const sampleIdx = Math.min(SAMPLES, Math.max(0, Math.round(t * SAMPLES)));
      const N = sampleNormals[sampleIdx];
      const B = sampleBinormals[sampleIdx];

      const baseR = getTrunkBaseRadius(t, prog);

      let tipFactor = 1.0;
      if (targetT < 0.98) {
        if (s > 0.88) {
          tipFactor = Math.sin((1.0 - s) / 0.12 * Math.PI * 0.5);
        }
      } else {
        if (s > 0.95) {
          tipFactor = 0.90 + 0.10 * (1.0 - s) / 0.05;
        }
      }

      // Rayon minimal non nul pour éviter les triangles dégénérés (évite les normales NaN)
      const minTipR = 0.015 * thicknessFactor;
      const ringRadius = Math.max(minTipR, baseR * thicknessFactor * tipFactor);

      for (let j = 0; j <= TRUNK_RADIAL; j++) {
        const cosVal = cosTable[j];
        const sinVal = sinTable[j];

        // Section transversale anatomique d'écorce de chêne (rotondité organique fluide et continue)
        const theta = (j / TRUNK_RADIAL) * Math.PI * 2.0;
        const maturity = Math.max(0, Math.min(1.0, (prog - 0.20) / 0.50));
        const rootMaturity = Math.max(0, Math.min(1.0, (prog - 0.30) / 0.50));

        // Contreforts racinaires puissants sculptés directement dans l'épaisseur du tronc (100% monobloc hermétique, 0 trou)
        const collarFlare = (s < 0.18) ? Math.pow((0.18 - s) / 0.18, 2.2) * 0.22 * rootMaturity : 0.0;
        const rootRibs = (s < 0.18) ? Math.pow((0.18 - s) / 0.18, 1.8) * (
          Math.cos(theta * 5.0 + 0.35) * 0.12 +
          Math.sin(theta * 3.0 - 0.40) * 0.07
        ) * rootMaturity : 0.0;

        // Harmoniques d'écorce strictement périodiques en 2*PI garantissant une rondeur parfaite
        const barkRidge = (
          Math.sin(theta * 4.0 + s * 1.5) * 0.016 +
          Math.cos(theta * 6.0 - s * 2.0) * 0.011 +
          Math.sin(theta * 8.0 + s * 1.0) * 0.007
        ) * maturity;

        const r = (ringRadius + collarFlare + rootRibs) * (1.0 + barkRidge);

        posArr[ptr++] = tempCenter.x + r * (N.x * cosVal + B.x * sinVal);
        posArr[ptr++] = tempCenter.y + r * (N.y * cosVal + B.y * sinVal);
        posArr[ptr++] = tempCenter.z + r * (N.z * cosVal + B.z * sinVal);

        // Mapping UV continu et exactement normalisé de 0.0 à 1.0 autour de la circonférence
        uvArr[uvPtr++] = j / TRUNK_RADIAL;
        uvArr[uvPtr++] = s * 3.5;
      }
    }

    // Sommet central calotte basse (racine profondément scellée et enfouie sous la butte de terre)
    const basePt = samplePoints[0];
    posArr[ptr++] = basePt.x;
    posArr[ptr++] = basePt.y - 0.65;
    posArr[ptr++] = basePt.z;
    uvArr[uvPtr++] = 0.5;
    uvArr[uvPtr++] = 0.0;

    // Sommet central calotte haute (apex légèrement décalé le long de la tangente)
    const topTanIdx = Math.min(SAMPLES, Math.max(0, Math.round(targetT * SAMPLES)));
    const topTan = sampleTangents[topTanIdx];
    const topOffset = 0.03 * thicknessFactor;
    posArr[ptr++] = tempCenter.x + topTan.x * topOffset;
    posArr[ptr++] = tempCenter.y + topTan.y * topOffset;
    posArr[ptr++] = tempCenter.z + topTan.z * topOffset;
    uvArr[uvPtr++] = 0.5;
    uvArr[uvPtr++] = 3.5;

    trunkGeo.computeVertexNormals();

    const nArray = trunkGeo.attributes.normal.array;

    // Soudure parfaite des normales le long de la jointure UV (j = 0 et j = TRUNK_RADIAL)
    // pour garantir une rotondité 100% lisse, sans arête ni cassure de lumière
    for (let i = 0; i <= TRUNK_RINGS; i++) {
      const idx0 = (i * stride + 0) * 3;
      const idxR = (i * stride + TRUNK_RADIAL) * 3;
      const nx = nArray[idx0] + nArray[idxR];
      const ny = nArray[idx0 + 1] + nArray[idxR + 1];
      const nz = nArray[idx0 + 2] + nArray[idxR + 2];
      const len = Math.hypot(nx, ny, nz) || 1.0;
      nArray[idx0] = nArray[idxR] = nx / len;
      nArray[idx0 + 1] = nArray[idxR + 1] = ny / len;
      nArray[idx0 + 2] = nArray[idxR + 2] = nz / len;
    }

    // Protection absolue contre les valeurs NaN dans les normales
    for (let k = 0; k < nArray.length; k += 3) {
      if (isNaN(nArray[k]) || isNaN(nArray[k + 1]) || isNaN(nArray[k + 2])) {
        nArray[k] = 0;
        nArray[k + 1] = 1;
        nArray[k + 2] = 0;
      }
    }

    trunkGeo.attributes.position.needsUpdate = true;
    trunkGeo.attributes.normal.needsUpdate = true;
    trunkGeo.attributes.uv.needsUpdate = true;
    trunkGeo.computeBoundingSphere();

    // Transitions de texture et de matériau
    if (prog < 0.25) {
      trunkMat.color.copy(sproutGreenColor);
      trunkMat.roughness = 0.35;
      if (trunkMesh.isTextureMatured) {
        trunkMat.map = youngStemTexture;
        trunkMat.bumpMap = null;
        trunkMat.needsUpdate = true;
        trunkMesh.isTextureMatured = false;
      }
    } else if (prog < 0.50) {
      const hazelP = (prog - 0.25) / 0.25;
      trunkMat.color.lerpColors(sproutGreenColor, youngHazelBarkColor, Math.min(1.0, hazelP * 1.3));
      trunkMat.roughness = THREE.MathUtils.lerp(0.35, 0.58, hazelP);
    } else {
      const brownP = Math.min(1.0, (prog - 0.50) / 0.50);
      trunkMat.color.lerpColors(youngHazelBarkColor, matureBarkSeasonColors[0], brownP);
      trunkMat.roughness = THREE.MathUtils.lerp(0.58, 0.82, brownP);

      if (!trunkMesh.isTextureMatured && prog >= 0.52) {
        trunkMat.map = matureBarkTexture;
        trunkMat.bumpMap = matureBarkBumpMap;
        trunkMat.bumpScale = 0.065;
        trunkMat.needsUpdate = true;
        trunkMesh.isTextureMatured = true;
      }

      if (prog >= 1.0 && isRevealed) {
        interpolateSeasonColor(trunkMat.color, matureBarkSeasonColors, currentSeason);
        trunkMat.roughness = interpolateSeasonScalar([0.82, 0.82, 0.85, 0.82, 0.92], currentSeason);
      }
    }
  }

  // ─── 8. Lateral Bough and Twig Engine ─────────────────────────────────────
  const branches = [];
  const leaves = [];
  const WIND_BUCKETS = 24;
  const windPhases = new Float32Array(WIND_BUCKETS);
  const windSpeeds = new Float32Array(WIND_BUCKETS);
  for (let b = 0; b < WIND_BUCKETS; b++) {
    windPhases[b] = (b / WIND_BUCKETS) * Math.PI * 2 + Math.sin(b * 1.7) * 0.5;
    windSpeeds[b] = 1.6 + (b / WIND_BUCKETS) * 2.0;
  }
  const preFlutter = new Float32Array(WIND_BUCKETS);
  const preTwist = new Float32Array(WIND_BUCKETS);
  const twigTipGeo = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);

  function createBranch({
    start, end, rStart, rEnd,
    startP, endP, turnBrownP = 1.0,
    stage = 1,
    hasTipCap = false
  }) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();

    // Natural overlap extends backward into the parent segment for a continuous seamless joint
    const overlap = Math.min(len * 0.18, rStart * 0.35);
    const radialSegs = isPotatoTier ? 6 : (isLowTier ? 8 : (isMediumTier ? 14 : 20));
    const geo = new THREE.CylinderGeometry(rEnd, rStart, len + overlap, radialSegs, 1, true);
    geo.translate(0, (len + overlap) * 0.5 - overlap, 0);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: sproutGreenColor.clone(),
      map: (stage <= 2) ? youngStemTexture : matureBarkTexture,
      bumpMap: (stage <= 2) ? null : matureBarkBumpMap,
      bumpScale: (stage <= 2) ? 0.020 : 0.045,
      roughness: (stage <= 2) ? 0.38 : 0.85,
      metalness: 0.04
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(start);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const up = new THREE.Vector3(0, 1, 0);
    const normDir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, normDir);
    mesh.quaternion.copy(quat);

    mesh.scale.set(0.0001, 0.0001, 0.0001);
    treeGroup.add(mesh);

    // Tip cap is strictly reserved for terminal outer twigs (never on intermediate joints)
    let tipCapMesh = null;
    if (hasTipCap) {
      tipCapMesh = new THREE.Mesh(twigTipGeo, mat);
      tipCapMesh.quaternion.copy(quat);
      tipCapMesh.scale.set(0.0001, 0.0001, 0.0001);
      tipCapMesh.castShadow = true;
      treeGroup.add(tipCapMesh);
    }

    const branchObj = {
      mesh,
      tipCapMesh,
      mat,
      startP,
      endP,
      turnBrownP,
      stage,
      rStart,
      rEnd,
      start,
      end,
      len,
      dir: normDir,
      isTextureMatured: false
    };
    branches.push(branchObj);
    return branchObj;
  }

  // ─── 9. Stage 1 Realistic Oak Seedling & Acorn Germination ───────────────
  // A) Gland de chêne au sol (Acorn) d'où émerge la jeune pousse
  const acornGroup = new THREE.Group();
  acornGroup.position.set(0.11, getGroundHeight(0.11, 0.08) + 0.025, 0.08);
  acornGroup.rotation.set(0.15, 0.55, 0.72); // Gland reposant naturellement sur la mousse

  // Corps du gland ovoïde effilé
  const nutGeo = new THREE.SphereGeometry(0.14, 16, 14);
  nutGeo.scale(1.0, 1.45, 1.0);
  const nutMat = new THREE.MeshStandardMaterial({
    color: 0x6e401f, // Brun noisette lustré
    roughness: 0.38,
    metalness: 0.04
  });
  const nutMesh = new THREE.Mesh(nutGeo, nutMat);
  nutMesh.castShadow = true;
  nutMesh.receiveShadow = true;
  acornGroup.add(nutMesh);

  // Cupule granuleuse et écailleuse
  const cupGeo = new THREE.SphereGeometry(0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.50);
  cupGeo.scale(1.0, 1.05, 1.0);
  cupGeo.translate(0, 0.08, 0);
  const cupMat = new THREE.MeshStandardMaterial({
    color: 0x48321e, // Cupule rugueuse et boisée
    roughness: 0.85,
    metalness: 0.02
  });
  const cupMesh = new THREE.Mesh(cupGeo, cupMat);
  cupMesh.castShadow = true;
  acornGroup.add(cupMesh);

  // Pédoncule court du gland
  const acornStemGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.12, 6);
  acornStemGeo.translate(0, 0.22, 0);
  const stemMesh = new THREE.Mesh(acornStemGeo, cupMat);
  acornGroup.add(stemMesh);

  treeGroup.add(acornGroup);

  // ─── 9B. Authentic Botanical Oak Seedling (Feuilles Juvéniles & Gemmule Apicale) ──
  // A) Texture procédurale haute définition d'une jeune feuille de chêne (Quercus robur)
  function createJuvenileLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 1024);

    ctx.save();

    // 1. Tracé vectoriel ultra-lisse (Bézier) des lobes arrondis et sinus profonds
    ctx.beginPath();
    ctx.moveTo(256, 985); // Base du pétiole
    ctx.quadraticCurveTo(252, 920, 250, 875);

    // Oreillette basale gauche
    ctx.bezierCurveTo(230, 865, 212, 840, 222, 815);
    // Sinus 1 gauche
    ctx.bezierCurveTo(228, 795, 214, 780, 198, 770);
    // Lobe 1 gauche
    ctx.bezierCurveTo(145, 755, 120, 705, 160, 660);
    // Sinus 2 gauche
    ctx.bezierCurveTo(185, 640, 195, 620, 175, 600);
    // Lobe 2 gauche (large lobe médian)
    ctx.bezierCurveTo(105, 575,  85, 505, 140, 445);
    // Sinus 3 gauche
    ctx.bezierCurveTo(175, 420, 185, 390, 165, 365);
    // Lobe 3 gauche (supérieur)
    ctx.bezierCurveTo(115, 335, 110, 265, 170, 220);
    // Sinus 4 gauche
    ctx.bezierCurveTo(195, 200, 210, 180, 200, 160);
    // Lobe sub-apical gauche
    ctx.bezierCurveTo(185, 135, 195,  95, 230,  70);
    // Apex terminal arrondi
    ctx.bezierCurveTo(245,  50, 267,  50, 282,  70);
    // Lobe sub-apical droit
    ctx.bezierCurveTo(317,  95, 327, 135, 312, 160);
    // Sinus 4 droit
    ctx.bezierCurveTo(302, 180, 317, 200, 342, 220);
    // Lobe 3 droit (supérieur)
    ctx.bezierCurveTo(402, 265, 397, 335, 347, 365);
    // Sinus 3 droit
    ctx.bezierCurveTo(327, 390, 337, 420, 372, 445);
    // Lobe 2 droit (large lobe médian)
    ctx.bezierCurveTo(427, 505, 407, 575, 337, 600);
    // Sinus 2 droit
    ctx.bezierCurveTo(317, 620, 327, 640, 352, 660);
    // Lobe 1 droit
    ctx.bezierCurveTo(392, 705, 367, 755, 314, 770);
    // Sinus 1 droit
    ctx.bezierCurveTo(298, 780, 284, 795, 290, 815);
    // Oreillette basale droite
    ctx.bezierCurveTo(300, 840, 282, 865, 262, 875);
    // Côté droit du pétiole
    ctx.quadraticCurveTo(260, 920, 256, 985);
    ctx.closePath();

    // 2. Remplissage dégradé printanier : vert tendre lumineux (chartreuse printanière)
    const bladeGrad = ctx.createLinearGradient(256, 985, 256, 50);
    bladeGrad.addColorStop(0.00, '#66b826'); // Base du pétiole
    bladeGrad.addColorStop(0.15, '#78ce30'); // Base du limbe
    bladeGrad.addColorStop(0.55, '#92e83c'); // Cœur du limbe
    bladeGrad.addColorStop(0.85, '#abf44e'); // Haut du limbe
    bladeGrad.addColorStop(1.00, '#bdfa5a'); // Apex lumineux
    ctx.fillStyle = bladeGrad;
    ctx.fill();

    // 3. Dégradé radial de rétroéclairage solaire (effet de translucidité naturelle)
    const glowGrad = ctx.createRadialGradient(256, 460, 30, 256, 460, 260);
    glowGrad.addColorStop(0.0, 'rgba(225, 255, 135, 0.45)');
    glowGrad.addColorStop(0.65, 'rgba(165, 245, 75, 0.14)');
    glowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 4. Bordure bronze-ambrée / rosée (anthocyanines des jeunes feuilles de chêne printanières)
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(205, 90, 38, 0.44)';
    ctx.stroke();

    ctx.lineWidth = 4.5;
    ctx.strokeStyle = 'rgba(235, 120, 50, 0.72)';
    ctx.stroke();

    // 5. Nervure médiane (Midrib) en relief 3D
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(55, 110, 22, 0.38)';
    ctx.beginPath();
    ctx.moveTo(258, 985);
    ctx.quadraticCurveTo(258, 500, 257, 70);
    ctx.stroke();

    ctx.lineWidth = 6.5;
    ctx.strokeStyle = 'rgba(246, 255, 225, 0.96)';
    ctx.beginPath();
    ctx.moveTo(256, 985);
    ctx.quadraticCurveTo(256, 500, 256, 70);
    ctx.stroke();

    // 6. Nervures latérales secondaires arquées vers chaque lobe
    const lateralVeins = [
      [785, 160, 665], [785, 352, 665],
      [630, 138, 450], [630, 374, 450],
      [455, 168, 225], [455, 344, 225],
      [295, 205, 162], [295, 307, 162],
      [165, 245,  75], [165, 267,  75]
    ];

    lateralVeins.forEach(([y0, x1, y1]) => {
      ctx.lineWidth = 3.6;
      ctx.strokeStyle = 'rgba(60, 115, 22, 0.32)';
      ctx.beginPath();
      ctx.moveTo(256, y0 + 2);
      ctx.quadraticCurveTo((256 + x1) * 0.5, (y0 + y1) * 0.5 + 3, x1, y1 + 2);
      ctx.stroke();

      ctx.lineWidth = 2.4;
      ctx.strokeStyle = 'rgba(240, 255, 215, 0.82)';
      ctx.beginPath();
      ctx.moveTo(256, y0);
      ctx.quadraticCurveTo((256 + x1) * 0.5, (y0 + y1) * 0.5, x1, y1);
      ctx.stroke();

      // Réticulations tertiaires
      const isLeft = x1 < 256;
      for (let t = 0.35; t <= 0.8; t += 0.25) {
        const mx = 256 + (x1 - 256) * t;
        const my = y0 + (y1 - y0) * t;
        const tx = mx + (isLeft ? -18 : 18);
        const ty = my - 14;
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = 'rgba(220, 250, 185, 0.38)';
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    });

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    return tex;
  }

  // B) Géométrie 3D incurvée d'une vraie feuille de chêne
  function createJuvenileOakLeafGeometry() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const indices = [];

    const rows = 24;
    const cols = 12;
    const widthHalf = 0.28;
    const length = 1.0;

    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      const y = v * length;
      // Courbure longitudinale naturelle : la feuille s'élance puis retombe sous son poids
      const droop = -Math.pow(v, 1.8) * 0.16;

      for (let c = 0; c <= cols; c++) {
        const u = (c / cols) * 2.0 - 1.0; // [-1.0, 1.0]
        const x = u * widthHalf;

        // Incurvation transversale en gouttière (limbe en cuillère)
        const cupping = Math.pow(Math.abs(u), 1.6) * 0.05 * Math.sin(v * Math.PI);
        // Légère ondulation 3D sur les marges
        const marginWave = Math.sin(v * 22.0) * 0.012 * Math.abs(u);

        pos.push(x, y, droop + cupping + marginWave);
        uvs.push(c / cols, v);
      }
    }

    const stride = cols + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = r * stride + c;
        const b = (r + 1) * stride + c;
        const d = (r + 1) * stride + (c + 1);
        const e = r * stride + (c + 1);
        indices.push(a, b, e);
        indices.push(b, d, e);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const juvenileLeafTex = createJuvenileLeafTexture();
  const juvenileLeafGeo = createJuvenileOakLeafGeometry();
  const juvenileLeafMat = new THREE.MeshStandardMaterial({
    map: juvenileLeafTex,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.26,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  const juvenilePetioleMat = new THREE.MeshStandardMaterial({
    color: 0x76c934,
    roughness: 0.32,
    metalness: 0.02
  });
  const juvenilePetioleGeo = new THREE.CylinderGeometry(0.011, 0.018, 0.16, 8);
  juvenilePetioleGeo.translate(0, 0.08, 0);

  // Gouttes de rosée matinale limpides
  const dewMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0.25,
    transparent: true,
    opacity: 0.90
  });
  const dewGeo = new THREE.SphereGeometry(0.020, 6, 6);

  // Helper pour construire une feuille complète (Pétiole + Limbe incurvé + Rosée)
  function createJuvenileLeafCompound(scale, targetAngle, swaySpeed, phase, pair) {
    const pivot = new THREE.Group();
    const leafGroup = new THREE.Group();

    // Pétiole fin
    const petioleMesh = new THREE.Mesh(juvenilePetioleGeo, juvenilePetioleMat);
    petioleMesh.castShadow = true;
    leafGroup.add(petioleMesh);

    // Limbe 3D fixé à l'extrémité du pétiole
    const bladeMesh = new THREE.Mesh(juvenileLeafGeo, juvenileLeafMat);
    bladeMesh.position.set(0, 0.15, 0.0);
    bladeMesh.rotation.x = 0.22; // Incurvé naturellement en prolongement du pétiole
    bladeMesh.castShadow = true;
    bladeMesh.receiveShadow = true;
    leafGroup.add(bladeMesh);

    // Goutte de rosée sur la nervure principale
    const dew = new THREE.Mesh(dewGeo, dewMat);
    dew.position.set(0, 0.45, 0.02);
    bladeMesh.add(dew);

    leafGroup.scale.set(scale, scale, scale);
    pivot.add(leafGroup);

    return { pivot, leafGroup, scale, targetAngle, swaySpeed, phase, pair };
  }

  // C) Architecture Botanique Étagée de la Jeune Pousse (Phyllotaxie Réaliste)
  const seedlingLeaves = [];

  // 1. Nœud inférieur (Node 1) : Première paire principale étalée est-ouest
  const seedlingNode1 = new THREE.Group();
  seedlingNode1.position.copy(trunkNodes[0]);
  seedlingNode1.scale.set(0.0001, 0.0001, 0.0001);

  const leaf1A = createJuvenileLeafCompound(0.46, 0.92, 2.2, 0.0, 1);
  leaf1A.pivot.rotation.y = 0.10;
  seedlingNode1.add(leaf1A.pivot);
  seedlingLeaves.push(leaf1A);

  const leaf1B = createJuvenileLeafCompound(0.44, 0.90, 2.5, 1.8, 1);
  leaf1B.pivot.rotation.y = Math.PI + 0.15;
  seedlingNode1.add(leaf1B.pivot);
  seedlingLeaves.push(leaf1B);

  treeGroup.add(seedlingNode1);

  // 2. Nœud supérieur (Node 2) : Seconde paire débourrant plus haut, orientée nord-sud
  const seedlingNode2 = new THREE.Group();
  seedlingNode2.position.copy(trunkNodes[0]);
  seedlingNode2.scale.set(0.0001, 0.0001, 0.0001);

  const leaf2A = createJuvenileLeafCompound(0.36, 0.80, 2.7, 1.0, 2);
  leaf2A.pivot.rotation.y = Math.PI * 0.5 + 0.10;
  seedlingNode2.add(leaf2A.pivot);
  seedlingLeaves.push(leaf2A);

  const leaf2B = createJuvenileLeafCompound(0.35, 0.78, 2.9, 2.6, 2);
  leaf2B.pivot.rotation.y = Math.PI * 1.5 - 0.10;
  seedlingNode2.add(leaf2B.pivot);
  seedlingLeaves.push(leaf2B);

  treeGroup.add(seedlingNode2);

  // 3. Gemmule terminale (Apex du rameau) : Bourgeon apical + Écailles + Micro-ébauches foliaires
  const seedlingApex = new THREE.Group();
  seedlingApex.position.copy(trunkNodes[0]);
  seedlingApex.scale.set(0.0001, 0.0001, 0.0001);

  const apicalBudGeo = new THREE.ConeGeometry(0.035, 0.12, 8);
  apicalBudGeo.translate(0, 0.06, 0);
  const apicalBudMat = new THREE.MeshStandardMaterial({
    color: 0x6db82e,
    roughness: 0.38,
    metalness: 0.04
  });
  const apicalBud = new THREE.Mesh(apicalBudGeo, apicalBudMat);
  apicalBud.castShadow = true;
  seedlingApex.add(apicalBud);

  const budScalesGeo = new THREE.ConeGeometry(0.042, 0.06, 6);
  budScalesGeo.translate(0, 0.03, 0);
  const budScalesMat = new THREE.MeshStandardMaterial({
    color: 0x7a4422,
    roughness: 0.65
  });
  const apicalBudScales = new THREE.Mesh(budScalesGeo, budScalesMat);
  seedlingApex.add(apicalBudScales);

  // Micro-ébauches foliaires apicales (très jeunes folioles naissantes repliées)
  const primordiumA = createJuvenileLeafCompound(0.14, 0.32, 3.2, 0.4, 3);
  primordiumA.pivot.rotation.y = 0.45;
  seedlingApex.add(primordiumA.pivot);
  seedlingLeaves.push(primordiumA);

  const primordiumB = createJuvenileLeafCompound(0.13, 0.30, 3.4, 2.2, 3);
  primordiumB.pivot.rotation.y = Math.PI + 0.45;
  seedlingApex.add(primordiumB.pivot);
  seedlingLeaves.push(primordiumB);

  treeGroup.add(seedlingApex);

  // ─── 10. Botanical Branch Architecture (Primary, Secondary, Tertiary & Twigs) ───
  // Multi-tier branching system adhering to Murray's law of botanical pipe model (R^n = sum r_i^n)

  // Tronc noble et élancé : le fût principal s'élève majestueusement du sol sans broussins bas ni moignons coupés.
  // ── Rameaux charpentiers frontaux traversant DIRECTEMENT devant le tronc (dissimulation totale de la barre de bois) ──
  const bFrontMid1_end = new THREE.Vector3(-0.2, -0.1, 1.4);
  const bFrontMid1_subA = new THREE.Vector3(-0.7, 0.4, 1.7);
  const bFrontMid1_subB = new THREE.Vector3(0.3, 0.5, 1.6);
  createBranch({ start: trunkNodes[6], end: bFrontMid1_end, rStart: 0.13, rEnd: 0.06, startP: 0.56, endP: 0.68, turnBrownP: 0.70, stage: 3, hasTipCap: false });
  createBranch({ start: bFrontMid1_end, end: bFrontMid1_subA, rStart: 0.055, rEnd: 0.024, startP: 0.66, endP: 0.76, turnBrownP: 0.78, stage: 3, hasTipCap: true });
  createBranch({ start: bFrontMid1_end, end: bFrontMid1_subB, rStart: 0.055, rEnd: 0.024, startP: 0.66, endP: 0.76, turnBrownP: 0.78, stage: 3, hasTipCap: true });

  const bFrontMid2_end = new THREE.Vector3(0.3, 0.6, 1.5);
  const bFrontMid2_subA = new THREE.Vector3(0.8, 1.2, 1.8);
  const bFrontMid2_subB = new THREE.Vector3(-0.2, 1.3, 1.7);
  createBranch({ start: trunkNodes[7], end: bFrontMid2_end, rStart: 0.13, rEnd: 0.06, startP: 0.62, endP: 0.74, turnBrownP: 0.76, stage: 3, hasTipCap: false });
  createBranch({ start: bFrontMid2_end, end: bFrontMid2_subA, rStart: 0.055, rEnd: 0.024, startP: 0.72, endP: 0.82, turnBrownP: 0.84, stage: 3, hasTipCap: true });
  createBranch({ start: bFrontMid2_end, end: bFrontMid2_subB, rStart: 0.055, rEnd: 0.024, startP: 0.72, endP: 0.82, turnBrownP: 0.84, stage: 3, hasTipCap: true });

  const bFrontMid3_end = new THREE.Vector3(0.0, 1.5, 1.6);
  const bFrontMid3_subA = new THREE.Vector3(-0.5, 2.1, 1.8);
  const bFrontMid3_subB = new THREE.Vector3(0.5, 2.2, 1.8);
  createBranch({ start: trunkNodes[8], end: bFrontMid3_end, rStart: 0.12, rEnd: 0.055, startP: 0.68, endP: 0.78, turnBrownP: 0.80, stage: 3, hasTipCap: false });
  createBranch({ start: bFrontMid3_end, end: bFrontMid3_subA, rStart: 0.050, rEnd: 0.022, startP: 0.76, endP: 0.86, turnBrownP: 0.88, stage: 4, hasTipCap: true });
  createBranch({ start: bFrontMid3_end, end: bFrontMid3_subB, rStart: 0.050, rEnd: 0.022, startP: 0.76, endP: 0.86, turnBrownP: 0.88, stage: 4, hasTipCap: true });

  const bFrontMid4_end = new THREE.Vector3(-0.2, 2.3, 1.5);
  const bFrontMid4_subA = new THREE.Vector3(-0.7, 2.9, 1.7);
  const bFrontMid4_subB = new THREE.Vector3(0.4, 3.0, 1.7);
  createBranch({ start: trunkNodes[9], end: bFrontMid4_end, rStart: 0.11, rEnd: 0.050, startP: 0.74, endP: 0.84, turnBrownP: 0.86, stage: 4, hasTipCap: false });
  createBranch({ start: bFrontMid4_end, end: bFrontMid4_subA, rStart: 0.045, rEnd: 0.020, startP: 0.82, endP: 0.92, turnBrownP: 0.90, stage: 4, hasTipCap: true });
  createBranch({ start: bFrontMid4_end, end: bFrontMid4_subB, rStart: 0.045, rEnd: 0.020, startP: 0.82, endP: 0.92, turnBrownP: 0.90, stage: 4, hasTipCap: true });

  // A) Left Primary Limb (bL) & Secondary/Tertiary Branches
  const bL_nodes = [
    trunkNodes[5],
    new THREE.Vector3(-0.8, -1.1, 0.3),
    new THREE.Vector3(-1.7, -0.4, 0.5),
    new THREE.Vector3(-2.6, 0.6, 0.7),
    new THREE.Vector3(-3.6, 1.8, 0.5),
    new THREE.Vector3(-4.4, 2.6, 0.3)
  ];
  const bL_rad = [0.24, 0.18, 0.13, 0.09, 0.06, 0.035];

  createBranch({ start: bL_nodes[0], end: bL_nodes[1], rStart: bL_rad[0], rEnd: bL_rad[1], startP: 0.38, endP: 0.45, turnBrownP: 0.48, stage: 2, hasTipCap: false });
  createBranch({ start: bL_nodes[1], end: bL_nodes[2], rStart: bL_rad[1], rEnd: bL_rad[2], startP: 0.44, endP: 0.50, turnBrownP: 0.54, stage: 2, hasTipCap: false });
  createBranch({ start: bL_nodes[2], end: bL_nodes[3], rStart: bL_rad[2], rEnd: bL_rad[3], startP: 0.51, endP: 0.62, turnBrownP: 0.64, stage: 3, hasTipCap: false });
  createBranch({ start: bL_nodes[3], end: bL_nodes[4], rStart: bL_rad[3], rEnd: bL_rad[4], startP: 0.61, endP: 0.72, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bL_nodes[4], end: bL_nodes[5], rStart: bL_rad[4], rEnd: bL_rad[5], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  // Left Secondary Fork 1 (Arching Forward-Left off bL[1])
  const bL_sub1_nodes = [
    bL_nodes[1],
    new THREE.Vector3(-1.4, -0.5, 0.9),
    new THREE.Vector3(-2.2, 0.2, 1.4),
    new THREE.Vector3(-2.9, 0.9, 1.7)
  ];
  createBranch({ start: bL_sub1_nodes[0], end: bL_sub1_nodes[1], rStart: 0.20, rEnd: 0.15, startP: 0.46, endP: 0.56, turnBrownP: 0.58, stage: 2, hasTipCap: false });
  createBranch({ start: bL_sub1_nodes[1], end: bL_sub1_nodes[2], rStart: 0.15, rEnd: 0.10, startP: 0.55, endP: 0.66, turnBrownP: 0.68, stage: 3, hasTipCap: false });
  createBranch({ start: bL_sub1_nodes[2], end: bL_sub1_nodes[3], rStart: 0.10, rEnd: 0.05, startP: 0.66, endP: 0.78, turnBrownP: 0.80, stage: 3, hasTipCap: false });

  // Left Secondary Fork 2 (Arching Rear-Left off bL[2])
  const bL_sub2_nodes = [
    bL_nodes[2],
    new THREE.Vector3(-2.3, 0.1, -0.3),
    new THREE.Vector3(-3.1, 0.8, -0.8),
    new THREE.Vector3(-3.8, 1.5, -1.1)
  ];
  createBranch({ start: bL_sub2_nodes[0], end: bL_sub2_nodes[1], rStart: 0.17, rEnd: 0.12, startP: 0.54, endP: 0.64, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bL_sub2_nodes[1], end: bL_sub2_nodes[2], rStart: 0.12, rEnd: 0.08, startP: 0.63, endP: 0.74, turnBrownP: 0.76, stage: 3, hasTipCap: false });
  createBranch({ start: bL_sub2_nodes[2], end: bL_sub2_nodes[3], rStart: 0.08, rEnd: 0.045, startP: 0.73, endP: 0.85, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  // Left Secondary Fork 3 (Ascending Lateral off bL[3])
  const bL_sub3_nodes = [
    bL_nodes[3],
    new THREE.Vector3(-3.2, 1.5, 0.9),
    new THREE.Vector3(-3.8, 2.5, 0.8)
  ];
  createBranch({ start: bL_sub3_nodes[0], end: bL_sub3_nodes[1], rStart: 0.13, rEnd: 0.08, startP: 0.68, endP: 0.80, turnBrownP: 0.82, stage: 3, hasTipCap: false });
  createBranch({ start: bL_sub3_nodes[1], end: bL_sub3_nodes[2], rStart: 0.08, rEnd: 0.045, startP: 0.78, endP: 0.89, turnBrownP: 0.88, stage: 4, hasTipCap: false });

  // ── Rameaux transversaux comblant la fourche centrale interne entre bL et bR ──
  const bL_inward1_end = new THREE.Vector3(-0.1, -0.6, 1.1);
  const bL_inward1_sub = new THREE.Vector3(0.4, -0.2, 1.4);
  createBranch({ start: bL_nodes[1], end: bL_inward1_end, rStart: 0.14, rEnd: 0.07, startP: 0.52, endP: 0.66, turnBrownP: 0.68, stage: 3, hasTipCap: false });
  createBranch({ start: bL_inward1_end, end: bL_inward1_sub, rStart: 0.065, rEnd: 0.025, startP: 0.64, endP: 0.76, turnBrownP: 0.78, stage: 3, hasTipCap: true });

  const bL_inward2_end = new THREE.Vector3(-0.7, 0.3, 1.3);
  const bL_inward2_sub = new THREE.Vector3(-0.1, 0.8, 1.5);
  createBranch({ start: bL_nodes[2], end: bL_inward2_end, rStart: 0.13, rEnd: 0.065, startP: 0.58, endP: 0.72, turnBrownP: 0.74, stage: 3, hasTipCap: false });
  createBranch({ start: bL_inward2_end, end: bL_inward2_sub, rStart: 0.060, rEnd: 0.024, startP: 0.70, endP: 0.82, turnBrownP: 0.84, stage: 4, hasTipCap: true });

  // B) Right Primary Limb (bR) & Secondary/Tertiary Branches
  const bR_nodes = [
    trunkNodes[5],
    new THREE.Vector3(0.9, -1.0, -0.2),
    new THREE.Vector3(2.0, -0.2, -0.4),
    new THREE.Vector3(3.2, 0.8, -0.5),
    new THREE.Vector3(4.3, 1.8, -0.2),
    new THREE.Vector3(5.2, 2.7, 0.1),
    new THREE.Vector3(5.9, 3.4, 0.3)
  ];
  const bR_rad = [0.25, 0.19, 0.14, 0.10, 0.07, 0.045, 0.03];

  createBranch({ start: bR_nodes[0], end: bR_nodes[1], rStart: bR_rad[0], rEnd: bR_rad[1], startP: 0.38, endP: 0.45, turnBrownP: 0.48, stage: 2, hasTipCap: false });
  createBranch({ start: bR_nodes[1], end: bR_nodes[2], rStart: bR_rad[1], rEnd: bR_rad[2], startP: 0.44, endP: 0.50, turnBrownP: 0.54, stage: 2, hasTipCap: false });
  createBranch({ start: bR_nodes[2], end: bR_nodes[3], rStart: bR_rad[2], rEnd: bR_rad[3], startP: 0.51, endP: 0.62, turnBrownP: 0.64, stage: 3, hasTipCap: false });
  createBranch({ start: bR_nodes[3], end: bR_nodes[4], rStart: bR_rad[3], rEnd: bR_rad[4], startP: 0.61, endP: 0.72, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bR_nodes[4], end: bR_nodes[5], rStart: bR_rad[4], rEnd: bR_rad[5], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });
  createBranch({ start: bR_nodes[5], end: bR_nodes[6], rStart: bR_rad[5], rEnd: bR_rad[6], startP: 0.86, endP: 0.94, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // Right Secondary Fork 1 (Arching Forward-Right off bR[1])
  const bR_sub1_nodes = [
    bR_nodes[1],
    new THREE.Vector3(1.7, -0.4, 0.5),
    new THREE.Vector3(2.5, 0.3, 1.1),
    new THREE.Vector3(3.3, 1.1, 1.4)
  ];
  createBranch({ start: bR_sub1_nodes[0], end: bR_sub1_nodes[1], rStart: 0.22, rEnd: 0.16, startP: 0.46, endP: 0.56, turnBrownP: 0.58, stage: 2, hasTipCap: false });
  createBranch({ start: bR_sub1_nodes[1], end: bR_sub1_nodes[2], rStart: 0.16, rEnd: 0.11, startP: 0.55, endP: 0.66, turnBrownP: 0.68, stage: 3, hasTipCap: false });
  createBranch({ start: bR_sub1_nodes[2], end: bR_sub1_nodes[3], rStart: 0.11, rEnd: 0.05, startP: 0.66, endP: 0.78, turnBrownP: 0.80, stage: 3, hasTipCap: false });

  // Right Secondary Fork 2 (Arching Rear-Right off bR[2])
  const bR_sub2_nodes = [
    bR_nodes[2],
    new THREE.Vector3(2.9, 0.4, -1.1),
    new THREE.Vector3(3.8, 1.1, -1.6),
    new THREE.Vector3(4.5, 1.9, -1.9)
  ];
  createBranch({ start: bR_sub2_nodes[0], end: bR_sub2_nodes[1], rStart: 0.18, rEnd: 0.13, startP: 0.54, endP: 0.64, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bR_sub2_nodes[1], end: bR_sub2_nodes[2], rStart: 0.13, rEnd: 0.09, startP: 0.63, endP: 0.74, turnBrownP: 0.76, stage: 3, hasTipCap: false });
  createBranch({ start: bR_sub2_nodes[2], end: bR_sub2_nodes[3], rStart: 0.09, rEnd: 0.045, startP: 0.74, endP: 0.86, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  // Right Secondary Fork 3 (Ascending Lateral off bR[3])
  const bR_sub3_nodes = [
    bR_nodes[3],
    new THREE.Vector3(3.9, 1.8, -0.1),
    new THREE.Vector3(4.6, 2.7, 0.3)
  ];
  createBranch({ start: bR_sub3_nodes[0], end: bR_sub3_nodes[1], rStart: 0.14, rEnd: 0.09, startP: 0.68, endP: 0.80, turnBrownP: 0.82, stage: 3, hasTipCap: false });
  createBranch({ start: bR_sub3_nodes[1], end: bR_sub3_nodes[2], rStart: 0.09, rEnd: 0.045, startP: 0.78, endP: 0.89, turnBrownP: 0.88, stage: 4, hasTipCap: false });

  // Right Secondary Fork 4 (Outer Fork off bR[4])
  const bR_sub4_nodes = [
    bR_nodes[4],
    new THREE.Vector3(5.0, 2.5, -0.6),
    new THREE.Vector3(5.6, 3.2, -0.8)
  ];
  createBranch({ start: bR_sub4_nodes[0], end: bR_sub4_nodes[1], rStart: 0.10, rEnd: 0.065, startP: 0.80, endP: 0.90, turnBrownP: 0.88, stage: 4, hasTipCap: false });
  createBranch({ start: bR_sub4_nodes[1], end: bR_sub4_nodes[2], rStart: 0.065, rEnd: 0.035, startP: 0.87, endP: 0.95, turnBrownP: 0.92, stage: 4, hasTipCap: false });

  // ── Rameaux transversaux comblant la fourche centrale interne depuis bR vers le centre ──
  const bR_inward1_end = new THREE.Vector3(0.1, -0.5, 1.0);
  const bR_inward1_sub = new THREE.Vector3(-0.3, -0.1, 1.3);
  createBranch({ start: bR_nodes[1], end: bR_inward1_end, rStart: 0.14, rEnd: 0.07, startP: 0.52, endP: 0.66, turnBrownP: 0.68, stage: 3, hasTipCap: false });
  createBranch({ start: bR_inward1_end, end: bR_inward1_sub, rStart: 0.065, rEnd: 0.025, startP: 0.64, endP: 0.76, turnBrownP: 0.78, stage: 3, hasTipCap: true });

  const bR_inward2_end = new THREE.Vector3(0.7, 0.4, 1.2);
  const bR_inward2_sub = new THREE.Vector3(0.1, 0.9, 1.4);
  createBranch({ start: bR_nodes[2], end: bR_inward2_end, rStart: 0.13, rEnd: 0.065, startP: 0.58, endP: 0.72, turnBrownP: 0.74, stage: 3, hasTipCap: false });
  createBranch({ start: bR_inward2_end, end: bR_inward2_sub, rStart: 0.060, rEnd: 0.024, startP: 0.70, endP: 0.82, turnBrownP: 0.84, stage: 4, hasTipCap: true });

  // C) Front Primary Limb (bF) & Secondary Forks
  const bF_nodes = [
    trunkNodes[7],
    new THREE.Vector3(0.6, 0.4, 1.0),
    new THREE.Vector3(1.2, 1.2, 1.8),
    new THREE.Vector3(1.7, 2.1, 2.5),
    new THREE.Vector3(2.2, 2.9, 2.9)
  ];
  const bF_rad = [0.20, 0.15, 0.10, 0.065, 0.035];
  createBranch({ start: bF_nodes[0], end: bF_nodes[1], rStart: bF_rad[0], rEnd: bF_rad[1], startP: 0.60, endP: 0.68, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bF_nodes[1], end: bF_nodes[2], rStart: bF_rad[1], rEnd: bF_rad[2], startP: 0.67, endP: 0.74, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bF_nodes[2], end: bF_nodes[3], rStart: bF_rad[2], rEnd: bF_rad[3], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });
  createBranch({ start: bF_nodes[3], end: bF_nodes[4], rStart: bF_rad[3], rEnd: bF_rad[4], startP: 0.86, endP: 0.94, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // Front Sub-Fork 1 (Lateral Left arch off bF[1])
  const bF_sub1_nodes = [
    bF_nodes[1],
    new THREE.Vector3(0.2, 1.1, 1.7),
    new THREE.Vector3(-0.3, 1.9, 2.2),
    new THREE.Vector3(-0.7, 2.6, 2.5)
  ];
  createBranch({ start: bF_sub1_nodes[0], end: bF_sub1_nodes[1], rStart: 0.15, rEnd: 0.10, startP: 0.69, endP: 0.78, turnBrownP: 0.76, stage: 3, hasTipCap: false });
  createBranch({ start: bF_sub1_nodes[1], end: bF_sub1_nodes[2], rStart: 0.10, rEnd: 0.065, startP: 0.77, endP: 0.86, turnBrownP: 0.84, stage: 4, hasTipCap: false });
  createBranch({ start: bF_sub1_nodes[2], end: bF_sub1_nodes[3], rStart: 0.065, rEnd: 0.035, startP: 0.85, endP: 0.93, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // D) Back Primary Limb (bB) & Secondary Forks
  const bB_nodes = [
    trunkNodes[7],
    new THREE.Vector3(-0.6, 0.5, -0.9),
    new THREE.Vector3(-1.2, 1.3, -1.7),
    new THREE.Vector3(-1.7, 2.2, -2.4),
    new THREE.Vector3(-2.2, 3.0, -2.8)
  ];
  const bB_rad = [0.20, 0.15, 0.10, 0.065, 0.035];
  createBranch({ start: bB_nodes[0], end: bB_nodes[1], rStart: bB_rad[0], rEnd: bB_rad[1], startP: 0.60, endP: 0.68, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bB_nodes[1], end: bB_nodes[2], rStart: bB_rad[1], rEnd: bB_rad[2], startP: 0.67, endP: 0.74, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bB_nodes[2], end: bB_nodes[3], rStart: bB_rad[2], rEnd: bB_rad[3], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });
  createBranch({ start: bB_nodes[3], end: bB_nodes[4], rStart: bB_rad[3], rEnd: bB_rad[4], startP: 0.86, endP: 0.94, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // Back Sub-Fork 1 (Lateral Right arch off bB[1])
  const bB_sub1_nodes = [
    bB_nodes[1],
    new THREE.Vector3(-0.3, 1.2, -1.6),
    new THREE.Vector3(0.3, 2.0, -2.1),
    new THREE.Vector3(0.8, 2.7, -2.4)
  ];
  createBranch({ start: bB_sub1_nodes[0], end: bB_sub1_nodes[1], rStart: 0.15, rEnd: 0.10, startP: 0.69, endP: 0.78, turnBrownP: 0.76, stage: 3, hasTipCap: false });
  createBranch({ start: bB_sub1_nodes[1], end: bB_sub1_nodes[2], rStart: 0.10, rEnd: 0.065, startP: 0.77, endP: 0.86, turnBrownP: 0.84, stage: 4, hasTipCap: false });
  createBranch({ start: bB_sub1_nodes[2], end: bB_sub1_nodes[3], rStart: 0.065, rEnd: 0.035, startP: 0.85, endP: 0.93, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // E) Mid-Trunk Boughs (bMidL from node 8, bMidR from node 9)
  const bMidL_nodes = [
    trunkNodes[8],
    new THREE.Vector3(-0.8, 1.4, 0.6),
    new THREE.Vector3(-1.6, 2.1, 1.0),
    new THREE.Vector3(-2.4, 2.8, 1.2)
  ];
  createBranch({ start: bMidL_nodes[0], end: bMidL_nodes[1], rStart: 0.22, rEnd: 0.16, startP: 0.68, endP: 0.77, turnBrownP: 0.74, stage: 3, hasTipCap: false });
  createBranch({ start: bMidL_nodes[1], end: bMidL_nodes[2], rStart: 0.16, rEnd: 0.10, startP: 0.76, endP: 0.85, turnBrownP: 0.82, stage: 4, hasTipCap: false });
  createBranch({ start: bMidL_nodes[2], end: bMidL_nodes[3], rStart: 0.10, rEnd: 0.05, startP: 0.84, endP: 0.92, turnBrownP: 0.88, stage: 4, hasTipCap: false });

  const bMidR_nodes = [
    trunkNodes[9],
    new THREE.Vector3(1.0, 2.1, -0.6),
    new THREE.Vector3(1.8, 2.8, -1.0),
    new THREE.Vector3(2.6, 3.5, -1.2)
  ];
  createBranch({ start: bMidR_nodes[0], end: bMidR_nodes[1], rStart: 0.20, rEnd: 0.14, startP: 0.72, endP: 0.81, turnBrownP: 0.78, stage: 3, hasTipCap: false });
  createBranch({ start: bMidR_nodes[1], end: bMidR_nodes[2], rStart: 0.14, rEnd: 0.09, startP: 0.80, endP: 0.88, turnBrownP: 0.85, stage: 4, hasTipCap: false });
  createBranch({ start: bMidR_nodes[2], end: bMidR_nodes[3], rStart: 0.09, rEnd: 0.045, startP: 0.87, endP: 0.94, turnBrownP: 0.90, stage: 4, hasTipCap: false });

  // F) Lower Crown Secondary Forks (from node 10)
  const bCrownLowL_end = new THREE.Vector3(-1.4, 3.4, -0.7);
  const bCrownLowR_end = new THREE.Vector3(1.5, 3.5, 0.8);
  createBranch({ start: trunkNodes[10], end: bCrownLowL_end, rStart: 0.18, rEnd: 0.08, startP: 0.78, endP: 0.87, turnBrownP: 0.84, stage: 4, hasTipCap: false });
  createBranch({ start: trunkNodes[10], end: bCrownLowR_end, rStart: 0.18, rEnd: 0.08, startP: 0.78, endP: 0.87, turnBrownP: 0.84, stage: 4, hasTipCap: false });

  // G) Upper Crown Limbs (from node 11) & Sub-Crown Prongs
  const bTop1_end = new THREE.Vector3(-0.7, 4.0, 0.2);
  const bTop2_end = new THREE.Vector3(0.9, 4.2, -0.3);
  const bTopCrown_end = new THREE.Vector3(0.2, 4.8, 0.0);

  createBranch({ start: trunkNodes[11], end: bTop1_end, rStart: 0.20, rEnd: 0.11, startP: 0.84, endP: 0.92, turnBrownP: 0.88, stage: 4, hasTipCap: false });
  createBranch({ start: trunkNodes[11], end: bTop2_end, rStart: 0.20, rEnd: 0.11, startP: 0.84, endP: 0.92, turnBrownP: 0.88, stage: 4, hasTipCap: false });
  createBranch({ start: trunkNodes[11], end: bTopCrown_end, rStart: 0.20, rEnd: 0.10, startP: 0.85, endP: 0.93, turnBrownP: 0.88, stage: 4, hasTipCap: false });

  // Crown Sub-Forks
  const bTop1_subA = new THREE.Vector3(-1.5, 4.8, 0.6);
  const bTop1_subB = new THREE.Vector3(-0.9, 5.0, -0.5);
  createBranch({ start: bTop1_end, end: bTop1_subA, rStart: 0.10, rEnd: 0.05, startP: 0.89, endP: 0.95, turnBrownP: 0.92, stage: 4, hasTipCap: false });
  createBranch({ start: bTop1_end, end: bTop1_subB, rStart: 0.10, rEnd: 0.05, startP: 0.89, endP: 0.95, turnBrownP: 0.92, stage: 4, hasTipCap: false });

  const bTop2_subA = new THREE.Vector3(1.7, 4.9, 0.2);
  const bTop2_subB = new THREE.Vector3(1.1, 5.2, -1.0);
  createBranch({ start: bTop2_end, end: bTop2_subA, rStart: 0.10, rEnd: 0.05, startP: 0.89, endP: 0.95, turnBrownP: 0.92, stage: 4, hasTipCap: false });
  createBranch({ start: bTop2_end, end: bTop2_subB, rStart: 0.10, rEnd: 0.05, startP: 0.89, endP: 0.95, turnBrownP: 0.92, stage: 4, hasTipCap: false });

  const bTopCrown_subA = new THREE.Vector3(-0.5, 5.6, 0.4);
  const bTopCrown_subB = new THREE.Vector3(0.6, 5.7, -0.3);
  const bTopCrown_subC = new THREE.Vector3(0.1, 6.0, 0.1);
  createBranch({ start: bTopCrown_end, end: bTopCrown_subA, rStart: 0.09, rEnd: 0.045, startP: 0.90, endP: 0.96, turnBrownP: 0.93, stage: 4, hasTipCap: false });
  createBranch({ start: bTopCrown_end, end: bTopCrown_subB, rStart: 0.09, rEnd: 0.045, startP: 0.90, endP: 0.96, turnBrownP: 0.93, stage: 4, hasTipCap: false });
  createBranch({ start: bTopCrown_end, end: bTopCrown_subC, rStart: 0.09, rEnd: 0.045, startP: 0.91, endP: 0.97, turnBrownP: 0.94, stage: 4, hasTipCap: false });

  // ─── 10B. Deep Botanical Ramification: 40 Intermediate Scaffold Limbs ─────────
  // Ramification abondante et naturelle comblant tout le volume 3D de la ramure
  const intermediateLimbsData = [
    // Branchlets off bL (Left side canopy volume)
    { start: bL_nodes[1], end: new THREE.Vector3(-1.3, -0.6, -0.2), rStart: 0.12, rEnd: 0.045, startP: 0.48, endP: 0.60, stage: 2 },
    { start: bL_nodes[1], end: new THREE.Vector3(-0.9, -0.4, 0.8), rStart: 0.11, rEnd: 0.042, startP: 0.50, endP: 0.62, stage: 2 },
    { start: bL_nodes[2], end: new THREE.Vector3(-2.2, 0.3, -0.1), rStart: 0.10, rEnd: 0.040, startP: 0.54, endP: 0.66, stage: 3 },
    { start: bL_nodes[2], end: new THREE.Vector3(-1.5, 0.3, 1.2), rStart: 0.10, rEnd: 0.040, startP: 0.54, endP: 0.66, stage: 3 },
    { start: bL_nodes[2], end: new THREE.Vector3(-2.1, 0.2, 0.8), rStart: 0.095, rEnd: 0.038, startP: 0.56, endP: 0.68, stage: 3 },
    { start: bL_nodes[3], end: new THREE.Vector3(-3.2, 1.4, -0.2), rStart: 0.08, rEnd: 0.035, startP: 0.64, endP: 0.76, stage: 3 },
    { start: bL_nodes[3], end: new THREE.Vector3(-2.2, 1.2, 1.5), rStart: 0.08, rEnd: 0.035, startP: 0.64, endP: 0.76, stage: 3 },
    { start: bL_nodes[3], end: new THREE.Vector3(-2.9, 1.3, 0.9), rStart: 0.075, rEnd: 0.032, startP: 0.66, endP: 0.78, stage: 3 },
    { start: bL_nodes[4], end: new THREE.Vector3(-4.2, 2.7, 0.1), rStart: 0.06, rEnd: 0.028, startP: 0.78, endP: 0.88, stage: 4 },
    { start: bL_nodes[4], end: new THREE.Vector3(-3.8, 2.4, 0.9), rStart: 0.055, rEnd: 0.025, startP: 0.80, endP: 0.90, stage: 4 },

    // Branchlets off bL sub-forks
    { start: bL_sub1_nodes[1], end: new THREE.Vector3(-1.9, 0.0, 0.6), rStart: 0.095, rEnd: 0.038, startP: 0.56, endP: 0.68, stage: 3 },
    { start: bL_sub1_nodes[2], end: new THREE.Vector3(-2.8, 0.7, 1.1), rStart: 0.075, rEnd: 0.030, startP: 0.68, endP: 0.80, stage: 3 },
    { start: bL_sub2_nodes[1], end: new THREE.Vector3(-2.8, 0.5, -0.5), rStart: 0.090, rEnd: 0.036, startP: 0.58, endP: 0.70, stage: 3 },
    { start: bL_sub2_nodes[2], end: new THREE.Vector3(-3.6, 1.1, -0.5), rStart: 0.070, rEnd: 0.028, startP: 0.70, endP: 0.82, stage: 4 },

    // Branchlets off bR (Right side canopy volume)
    { start: bR_nodes[1], end: new THREE.Vector3(1.5, -0.5, 0.6), rStart: 0.13, rEnd: 0.048, startP: 0.48, endP: 0.60, stage: 2 },
    { start: bR_nodes[1], end: new THREE.Vector3(1.1, -0.4, -0.7), rStart: 0.12, rEnd: 0.044, startP: 0.50, endP: 0.62, stage: 2 },
    { start: bR_nodes[2], end: new THREE.Vector3(2.5, 0.5, 0.7), rStart: 0.11, rEnd: 0.042, startP: 0.54, endP: 0.66, stage: 3 },
    { start: bR_nodes[2], end: new THREE.Vector3(2.3, 0.4, -1.3), rStart: 0.11, rEnd: 0.042, startP: 0.54, endP: 0.66, stage: 3 },
    { start: bR_nodes[2], end: new THREE.Vector3(2.8, 0.3, -0.2), rStart: 0.095, rEnd: 0.038, startP: 0.56, endP: 0.68, stage: 3 },
    { start: bR_nodes[3], end: new THREE.Vector3(3.9, 1.6, 0.5), rStart: 0.085, rEnd: 0.035, startP: 0.64, endP: 0.76, stage: 3 },
    { start: bR_nodes[3], end: new THREE.Vector3(3.8, 1.5, -1.5), rStart: 0.085, rEnd: 0.035, startP: 0.64, endP: 0.76, stage: 3 },
    { start: bR_nodes[3], end: new THREE.Vector3(3.5, 1.4, -0.2), rStart: 0.075, rEnd: 0.032, startP: 0.66, endP: 0.78, stage: 3 },
    { start: bR_nodes[4], end: new THREE.Vector3(4.9, 2.6, 0.5), rStart: 0.065, rEnd: 0.028, startP: 0.78, endP: 0.88, stage: 4 },
    { start: bR_nodes[4], end: new THREE.Vector3(4.5, 2.3, -0.8), rStart: 0.060, rEnd: 0.025, startP: 0.80, endP: 0.90, stage: 4 },
    { start: bR_nodes[5], end: new THREE.Vector3(5.7, 3.5, -0.4), rStart: 0.045, rEnd: 0.022, startP: 0.88, endP: 0.96, stage: 4 },

    // Branchlets off bR sub-forks
    { start: bR_sub1_nodes[1], end: new THREE.Vector3(2.1, 0.1, 0.4), rStart: 0.095, rEnd: 0.038, startP: 0.56, endP: 0.68, stage: 3 },
    { start: bR_sub1_nodes[2], end: new THREE.Vector3(3.1, 0.8, 0.7), rStart: 0.075, rEnd: 0.030, startP: 0.68, endP: 0.80, stage: 3 },
    { start: bR_sub2_nodes[1], end: new THREE.Vector3(3.4, 0.8, -0.8), rStart: 0.090, rEnd: 0.036, startP: 0.58, endP: 0.70, stage: 3 },
    { start: bR_sub2_nodes[2], end: new THREE.Vector3(4.3, 1.4, -1.2), rStart: 0.070, rEnd: 0.028, startP: 0.70, endP: 0.82, stage: 4 },

    // Branchlets off bF (Frontal fullness)
    { start: bF_nodes[1], end: new THREE.Vector3(-0.1, 0.9, 1.6), rStart: 0.11, rEnd: 0.042, startP: 0.64, endP: 0.74, stage: 3 },
    { start: bF_nodes[2], end: new THREE.Vector3(0.7, 1.9, 2.3), rStart: 0.085, rEnd: 0.035, startP: 0.72, endP: 0.82, stage: 3 },
    { start: bF_nodes[2], end: new THREE.Vector3(1.8, 1.8, 2.2), rStart: 0.085, rEnd: 0.035, startP: 0.72, endP: 0.82, stage: 3 },
    { start: bF_nodes[3], end: new THREE.Vector3(1.3, 2.5, 2.6), rStart: 0.060, rEnd: 0.025, startP: 0.82, endP: 0.91, stage: 4 },

    // Branchlets off bB (Back depth)
    { start: bB_nodes[1], end: new THREE.Vector3(0.2, 1.0, -1.5), rStart: 0.11, rEnd: 0.042, startP: 0.64, endP: 0.74, stage: 3 },
    { start: bB_nodes[2], end: new THREE.Vector3(-0.6, 2.0, -2.2), rStart: 0.085, rEnd: 0.035, startP: 0.72, endP: 0.82, stage: 3 },
    { start: bB_nodes[2], end: new THREE.Vector3(-1.8, 1.9, -2.1), rStart: 0.085, rEnd: 0.035, startP: 0.72, endP: 0.82, stage: 3 },
    { start: bB_nodes[3], end: new THREE.Vector3(-1.3, 2.6, -2.5), rStart: 0.060, rEnd: 0.025, startP: 0.82, endP: 0.91, stage: 4 },

    // Branchlets off mid-trunk boughs (Center crown volume)
    { start: bMidL_nodes[1], end: new THREE.Vector3(-1.4, 2.0, 0.1), rStart: 0.11, rEnd: 0.040, startP: 0.72, endP: 0.82, stage: 3 },
    { start: bMidL_nodes[2], end: new THREE.Vector3(-2.2, 2.7, 0.5), rStart: 0.085, rEnd: 0.032, startP: 0.80, endP: 0.90, stage: 4 },
    { start: bMidR_nodes[1], end: new THREE.Vector3(1.6, 2.7, -0.1), rStart: 0.11, rEnd: 0.040, startP: 0.75, endP: 0.84, stage: 3 },
    { start: bMidR_nodes[2], end: new THREE.Vector3(2.4, 3.4, -0.5), rStart: 0.080, rEnd: 0.030, startP: 0.82, endP: 0.91, stage: 4 },

    // Upper crown branches
    { start: bCrownLowL_end, end: new THREE.Vector3(-1.2, 4.0, -0.2), rStart: 0.075, rEnd: 0.028, startP: 0.84, endP: 0.93, stage: 4 },
    { start: bCrownLowR_end, end: new THREE.Vector3(1.2, 4.1, 0.3), rStart: 0.075, rEnd: 0.028, startP: 0.84, endP: 0.93, stage: 4 },
    { start: bTop1_end, end: new THREE.Vector3(-0.3, 4.6, 0.6), rStart: 0.085, rEnd: 0.032, startP: 0.88, endP: 0.95, stage: 4 },
    { start: bTop2_end, end: new THREE.Vector3(0.4, 4.7, -0.7), rStart: 0.085, rEnd: 0.032, startP: 0.88, endP: 0.95, stage: 4 }
  ];

  const intermediateBranches = [];
  const intermediateChildTwigs = [];

  intermediateLimbsData.forEach(d => {
    const b = createBranch({
      start: d.start, end: d.end, rStart: d.rStart, rEnd: d.rEnd,
      startP: d.startP, endP: d.endP, turnBrownP: d.endP + 0.04,
      stage: d.stage, hasTipCap: false
    });
    intermediateBranches.push(b);

    const pDir = b.dir;
    const pEnd = b.end;
    const pLen = b.len * 0.52;
    const refUp = Math.abs(pDir.y) < 0.90 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const side = new THREE.Vector3().crossVectors(pDir, refUp).normalize();
    const norm = new THREE.Vector3().crossVectors(side, pDir).normalize();

    const fDir1 = new THREE.Vector3().copy(pDir).multiplyScalar(0.85).addScaledVector(side, 0.50).add(new THREE.Vector3(0, 0.15, 0)).normalize();
    const fDir2 = new THREE.Vector3().copy(pDir).multiplyScalar(0.85).addScaledVector(norm, 0.50).add(new THREE.Vector3(0, 0.12, 0)).normalize();

    const c1 = createBranch({
      start: pEnd, end: new THREE.Vector3().copy(pEnd).addScaledVector(fDir1, pLen),
      rStart: d.rEnd, rEnd: d.rEnd * 0.45,
      startP: d.endP - 0.02, endP: Math.min(1.0, d.endP + 0.08),
      turnBrownP: d.endP + 0.06, stage: d.stage, hasTipCap: true
    });
    const c2 = createBranch({
      start: pEnd, end: new THREE.Vector3().copy(pEnd).addScaledVector(fDir2, pLen * 0.9),
      rStart: d.rEnd, rEnd: d.rEnd * 0.45,
      startP: d.endP - 0.01, endP: Math.min(1.0, d.endP + 0.09),
      turnBrownP: d.endP + 0.07, stage: d.stage, hasTipCap: true
    });
    intermediateChildTwigs.push(c1, c2);
  });

  // ─── 11. Botanical Terminal Twigs (Réseau complet de 76 brindilles extérieures) ───
  const twigs = [
    // Stage 2/3 early twigs
    [bL_nodes[2], new THREE.Vector3(-2.2, 0.0, 0.9), 0.52, 0.66, 3],
    [bR_nodes[2], new THREE.Vector3(2.6, 0.4, 0.6), 0.52, 0.66, 3],
    [bF_nodes[1], new THREE.Vector3(0.6, 1.8, 2.1), 0.68, 0.76, 3],
    [bB_nodes[1], new THREE.Vector3(-1.7, 1.8, -1.2), 0.68, 0.76, 3],
    [bL_sub1_nodes[2], new THREE.Vector3(-2.5, 0.6, 2.0), 0.67, 0.78, 3],
    [bR_sub1_nodes[2], new THREE.Vector3(2.8, 0.7, 1.6), 0.67, 0.78, 3],

    // Stage 3 mid twigs
    [bL_nodes[3], new THREE.Vector3(-3.2, 1.2, 1.2), 0.72, 0.84, 3],
    [bR_nodes[3], new THREE.Vector3(3.8, 1.4, -1.0), 0.72, 0.84, 3],
    [bL_sub2_nodes[2], new THREE.Vector3(-3.5, 1.2, -1.4), 0.74, 0.85, 3],
    [bR_sub2_nodes[2], new THREE.Vector3(4.2, 1.5, -2.1), 0.74, 0.85, 3],
    [bMidL_nodes[2], new THREE.Vector3(-2.0, 2.6, 1.5), 0.82, 0.91, 4],
    [bMidR_nodes[2], new THREE.Vector3(2.3, 3.2, -1.6), 0.83, 0.92, 4],

    // Stage 4 outer perimeter twigs
    [bL_nodes[4], new THREE.Vector3(-4.2, 2.3, 0.8), 0.77, 0.89, 4],
    [bL_nodes[5], new THREE.Vector3(-5.1, 3.1, 0.2), 0.88, 0.96, 4],
    [bL_nodes[5], new THREE.Vector3(-4.7, 3.3, -0.4), 0.89, 0.97, 4],
    [bL_sub1_nodes[3], new THREE.Vector3(-3.5, 1.4, 2.1), 0.78, 0.90, 4],
    [bL_sub1_nodes[3], new THREE.Vector3(-3.1, 1.6, 1.4), 0.80, 0.91, 4],
    [bL_sub2_nodes[3], new THREE.Vector3(-4.4, 2.0, -1.4), 0.82, 0.92, 4],
    [bL_sub2_nodes[3], new THREE.Vector3(-4.1, 2.1, -0.6), 0.83, 0.93, 4],
    [bL_sub3_nodes[1], new THREE.Vector3(-4.3, 3.1, 0.9), 0.84, 0.94, 4],
    [bL_sub3_nodes[1], new THREE.Vector3(-3.4, 3.1, 1.4), 0.85, 0.95, 4],

    [bR_nodes[4], new THREE.Vector3(4.9, 2.3, -0.7), 0.77, 0.89, 4],
    [bR_nodes[5], new THREE.Vector3(5.8, 3.2, 0.5), 0.87, 0.95, 4],
    [bR_nodes[6], new THREE.Vector3(6.5, 3.9, 0.4), 0.90, 0.98, 4],
    [bR_nodes[6], new THREE.Vector3(6.2, 4.0, -0.3), 0.91, 0.98, 4],
    [bR_sub1_nodes[3], new THREE.Vector3(3.9, 1.6, 1.8), 0.78, 0.90, 4],
    [bR_sub1_nodes[3], new THREE.Vector3(3.6, 1.8, 1.0), 0.80, 0.91, 4],
    [bR_sub2_nodes[3], new THREE.Vector3(5.1, 2.4, -2.2), 0.82, 0.92, 4],
    [bR_sub2_nodes[3], new THREE.Vector3(4.8, 2.5, -1.3), 0.83, 0.93, 4],
    [bR_sub3_nodes[1], new THREE.Vector3(5.2, 3.3, 0.5), 0.84, 0.94, 4],
    [bR_sub3_nodes[1], new THREE.Vector3(4.2, 3.4, 0.8), 0.85, 0.95, 4],
    [bR_sub4_nodes[1], new THREE.Vector3(6.1, 3.7, -1.1), 0.89, 0.97, 4],

    [bF_nodes[3], new THREE.Vector3(2.3, 2.7, 2.9), 0.82, 0.93, 4],
    [bF_nodes[4], new THREE.Vector3(2.8, 3.5, 3.2), 0.88, 0.96, 4],
    [bF_nodes[4], new THREE.Vector3(1.8, 3.6, 3.3), 0.89, 0.97, 4],
    [bF_sub1_nodes[3], new THREE.Vector3(-1.2, 3.1, 2.8), 0.87, 0.95, 4],
    [bF_sub1_nodes[3], new THREE.Vector3(-0.4, 3.2, 3.0), 0.88, 0.96, 4],

    [bB_nodes[3], new THREE.Vector3(-2.3, 2.9, -2.8), 0.82, 0.93, 4],
    [bB_nodes[4], new THREE.Vector3(-2.8, 3.6, -3.1), 0.88, 0.96, 4],
    [bB_nodes[4], new THREE.Vector3(-1.8, 3.7, -3.2), 0.89, 0.97, 4],
    [bB_sub1_nodes[3], new THREE.Vector3(1.3, 3.2, -2.7), 0.87, 0.95, 4],
    [bB_sub1_nodes[3], new THREE.Vector3(0.5, 3.3, -2.9), 0.88, 0.96, 4],

    [bMidL_nodes[3], new THREE.Vector3(-3.0, 3.4, 1.4), 0.87, 0.95, 4],
    [bMidL_nodes[3], new THREE.Vector3(-2.2, 3.5, 1.8), 0.88, 0.96, 4],
    [bMidR_nodes[3], new THREE.Vector3(3.2, 4.0, -1.4), 0.89, 0.96, 4],
    [bMidR_nodes[3], new THREE.Vector3(2.4, 4.2, -1.7), 0.90, 0.97, 4],

    [bCrownLowL_end, new THREE.Vector3(-2.0, 4.1, -1.1), 0.88, 0.96, 4],
    [bCrownLowR_end, new THREE.Vector3(2.1, 4.2, 1.2), 0.88, 0.96, 4],

    [bTop1_subA, new THREE.Vector3(-2.1, 5.3, 0.8), 0.93, 0.98, 4],
    [bTop1_subA, new THREE.Vector3(-1.2, 5.5, 1.1), 0.93, 0.98, 4],
    [bTop1_subB, new THREE.Vector3(-1.4, 5.6, -0.8), 0.93, 0.98, 4],
    [bTop1_subB, new THREE.Vector3(-0.5, 5.7, -1.0), 0.94, 0.99, 4],

    [bTop2_subA, new THREE.Vector3(2.2, 5.4, 0.4), 0.93, 0.98, 4],
    [bTop2_subA, new THREE.Vector3(1.4, 5.6, 0.7), 0.93, 0.98, 4],
    [bTop2_subB, new THREE.Vector3(1.6, 5.7, -1.4), 0.93, 0.98, 4],
    [bTop2_subB, new THREE.Vector3(0.7, 5.8, -1.5), 0.94, 0.99, 4],

    [bTopCrown_subA, new THREE.Vector3(-0.9, 6.1, 0.5), 0.94, 0.99, 4],
    [bTopCrown_subA, new THREE.Vector3(-0.2, 6.2, 0.8), 0.94, 0.99, 4],
    [bTopCrown_subB, new THREE.Vector3(0.9, 6.2, -0.5), 0.94, 0.99, 4],
    [bTopCrown_subB, new THREE.Vector3(0.3, 6.3, -0.7), 0.95, 0.99, 4],
    [bTopCrown_subC, new THREE.Vector3(-0.2, 6.5, 0.2), 0.95, 1.00, 4],
    [bTopCrown_subC, new THREE.Vector3(0.4, 6.5, -0.1), 0.95, 1.00, 4],

    // Additional Stage 4 ramified sprigs for deep organic crown volume
    [bL_nodes[4], new THREE.Vector3(-3.8, 2.8, -0.4), 0.84, 0.94, 4],
    [bL_nodes[3], new THREE.Vector3(-2.6, 2.0, 0.2), 0.78, 0.88, 4],
    [bR_nodes[4], new THREE.Vector3(4.2, 2.8, 0.2), 0.84, 0.94, 4],
    [bR_nodes[3], new THREE.Vector3(3.0, 2.1, -0.2), 0.78, 0.88, 4],
    [bMidL_nodes[2], new THREE.Vector3(-1.4, 3.2, 0.7), 0.84, 0.93, 4],
    [bMidR_nodes[2], new THREE.Vector3(1.6, 3.6, -0.8), 0.84, 0.93, 4],
    [bCrownLowL_end, new THREE.Vector3(-2.4, 3.8, -0.4), 0.89, 0.97, 4],
    [bCrownLowR_end, new THREE.Vector3(2.5, 3.9, 0.6), 0.89, 0.97, 4],
    [bTop1_subA, new THREE.Vector3(-1.8, 5.8, 0.3), 0.94, 0.99, 4],
    [bTop2_subA, new THREE.Vector3(1.9, 5.9, 0.0), 0.94, 0.99, 4],
    [bF_nodes[4], new THREE.Vector3(2.2, 3.8, 2.6), 0.90, 0.98, 4],
    [bB_nodes[4], new THREE.Vector3(-2.2, 3.9, -2.5), 0.90, 0.98, 4]
  ];

  const twigBranches = [];
  twigs.forEach(([start, end, startP, endP, stage]) => {
    const b = createBranch({
      start, end, rStart: 0.052, rEnd: 0.024,
      startP, endP, turnBrownP: 0.88,
      stage, hasTipCap: false
    });
    twigBranches.push(b);
  });

  // Ramifications secondaires dendritiques (sous-rameaux subTwigs fannant depuis les 76 rameaux)
  const subTwigBranches = [];
  twigBranches.forEach((tb, idx) => {
    const parentDir = tb.dir;
    const parentLen = tb.len;
    const end = tb.end;

    const refUp = Math.abs(parentDir.y) < 0.90 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const sideVec = new THREE.Vector3().crossVectors(parentDir, refUp).normalize();
    const normVec = new THREE.Vector3().crossVectors(sideVec, parentDir).normalize();

    // Fourche 1 : divergence latérale et ascension
    const ang1 = 0.36 + (idx % 4) * 0.05;
    const phi1 = (idx * 2.39996) % (Math.PI * 2);
    const radDir1 = new THREE.Vector3()
      .copy(sideVec).multiplyScalar(Math.cos(phi1))
      .addScaledVector(normVec, Math.sin(phi1));
    const forkDir1 = new THREE.Vector3()
      .copy(parentDir).multiplyScalar(Math.cos(ang1))
      .addScaledVector(radDir1, Math.sin(ang1))
      .add(new THREE.Vector3(0, 0.06, 0))
      .normalize();
    const len1 = parentLen * (0.48 + ((idx % 5) / 5) * 0.18);
    const subEnd1 = new THREE.Vector3().copy(end).addScaledVector(forkDir1, len1);

    // Fourche 2 : divergence opposée
    const ang2 = 0.38 + ((idx + 2) % 4) * 0.05;
    const phi2 = phi1 + Math.PI * 0.82;
    const radDir2 = new THREE.Vector3()
      .copy(sideVec).multiplyScalar(Math.cos(phi2))
      .addScaledVector(normVec, Math.sin(phi2));
    const forkDir2 = new THREE.Vector3()
      .copy(parentDir).multiplyScalar(Math.cos(ang2))
      .addScaledVector(radDir2, Math.sin(ang2))
      .add(new THREE.Vector3(0, 0.04, 0))
      .normalize();
    const len2 = parentLen * (0.44 + (((idx + 3) % 5) / 5) * 0.18);
    const subEnd2 = new THREE.Vector3().copy(end).addScaledVector(forkDir2, len2);

    const subStartP = tb.startP + (tb.endP - tb.startP) * 0.50;
    const subRem = 1.0 - subStartP;
    const subEndP1 = Math.min(0.98, subStartP + Math.max(0.04, subRem * 0.45));
    const subEndP2 = Math.min(0.99, subStartP + Math.max(0.045, subRem * 0.50));

    const sb1 = createBranch({
      start: end, end: subEnd1, rStart: 0.024, rEnd: 0.010,
      startP: subStartP, endP: subEndP1, turnBrownP: 0.90,
      stage: 4, hasTipCap: false
    });
    const sb2 = createBranch({
      start: end, end: subEnd2, rStart: 0.022, rEnd: 0.009,
      startP: subStartP, endP: subEndP2, turnBrownP: 0.91,
      stage: 4, hasTipCap: false
    });
    subTwigBranches.push(sb1, sb2);
  });

  // ── Quaternary Fine Terminal Twigs (Ramilles dendritiques terminales quadruplées) ──
  const quaternaryBranches = [];
  subTwigBranches.forEach((stb, qIdx) => {
    const qDir = stb.dir;
    const qEnd = stb.end;
    const qLen = stb.len * 0.54;
    const refUp = Math.abs(qDir.y) < 0.90 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const side = new THREE.Vector3().crossVectors(qDir, refUp).normalize();
    const norm = new THREE.Vector3().crossVectors(side, qDir).normalize();

    const ang1 = 0.38 + (qIdx % 3) * 0.04;
    const fork1 = new THREE.Vector3().copy(qDir).multiplyScalar(Math.cos(ang1)).addScaledVector(side, Math.sin(ang1)).add(new THREE.Vector3(0, 0.06, 0)).normalize();
    const fork2 = new THREE.Vector3().copy(qDir).multiplyScalar(Math.cos(ang1)).addScaledVector(norm, Math.sin(ang1) * (qIdx % 2 === 0 ? 1 : -1)).add(new THREE.Vector3(0, 0.05, 0)).normalize();

    const qStartP = stb.startP + (stb.endP - stb.startP) * 0.55;
    const qRem = 1.0 - qStartP;
    const qEndP1 = Math.min(1.0, qStartP + Math.max(0.035, qRem * 0.60));
    const qEndP2 = Math.min(1.0, qStartP + Math.max(0.040, qRem * 0.65));

    const qb1 = createBranch({
      start: qEnd, end: new THREE.Vector3().copy(qEnd).addScaledVector(fork1, qLen),
      rStart: 0.016, rEnd: 0.007,
      startP: qStartP, endP: qEndP1,
      turnBrownP: 0.92, stage: 4, hasTipCap: true
    });
    const qb2 = createBranch({
      start: qEnd, end: new THREE.Vector3().copy(qEnd).addScaledVector(fork2, qLen * 0.88),
      rStart: 0.015, rEnd: 0.006,
      startP: qStartP, endP: qEndP2,
      turnBrownP: 0.92, stage: 4, hasTipCap: true
    });
    quaternaryBranches.push(qb1, qb2);
  });

  // ─── 12. Dense, Volumetric 3D Foliage Engine ("Ébouriffé comme un vrai arbre") ─────────
  // Canopée volumique dense et luxuriante inspirée de l'arbre réel :
  // - Bouquets terminaux radiaux 3D (rosace à 360° en cloche) enveloppant et masquant totalement chaque pointe de bois
  // - Feuilles étagées le long des tiges, insérées directement dans l'écorce (zéro pétiole flottant, 100% solidaire)
  // - Synchronisation physique stricte : une feuille n'apparaît JAMAIS avant que le bois n'ait atteint son point d'attache
  // - Ramification complète de tous les rameaux bas et internes (y compris dessous de canopée)
  // - ZÉRO feuille sur le fût du tronc (le tronc principal reste 100% noble et pur bois)
  function populateBranchFoliage(branchObj, bodyLeafCount, bouquetCount, minScale, maxScale) {
    if (!branchObj || branchObj._hasFoliage) return;
    branchObj._hasFoliage = true;

    // Mise à l'échelle du nombre de feuilles selon le palier de performance :
    // potato: 20% | low: 45% | medium: 72% | high: 100%
    const leafMult = isPotatoTier ? 0.20 : (isLowTier ? 0.45 : (isMediumTier ? 0.72 : 1.0));
    bodyLeafCount = Math.max(1, Math.round(bodyLeafCount * leafMult));
    bouquetCount = Math.max(1, Math.round(bouquetCount * leafMult));

    const bDir = branchObj.dir;
    const bStart = branchObj.start;
    const bEnd = branchObj.end;
    const rStart = branchObj.rStart;
    const rEnd = branchObj.rEnd;
    const bStartP = branchObj.startP;
    const bEndP = branchObj.endP;

    // Protection absolue : interdiction stricte sur le fût du tronc principal (y < -0.65 et au centre)
    if (bStart.y < -0.65 && bEnd.y < -0.65 && Math.hypot(bEnd.x, bEnd.z) < 0.42) return;

    const upVec = new THREE.Vector3(0, 1, 0);
    const refUp = (Math.abs(bDir.y) < 0.90) ? upVec : new THREE.Vector3(1, 0, 0);
    const bSide = new THREE.Vector3().crossVectors(bDir, refUp).normalize();
    const bNorm = new THREE.Vector3().crossVectors(bSide, bDir).normalize();

    // 1. Feuilles étagées le long de la tige (alternance spiralée distique naturelle)
    for (let i = 0; i < bodyLeafCount; i++) {
      // Répartition de 18% à 86% de la longueur du rameau
      const t = 0.18 + 0.68 * ((i + 0.5) / bodyLeafCount);
      const axisPt = new THREE.Vector3().lerpVectors(bStart, bEnd, t);
      if (axisPt.y < -0.65 && Math.hypot(axisPt.x, axisPt.z) < 0.40) continue;

      const woodR = THREE.MathUtils.lerp(rStart, rEnd, t);

      // Spirale phyllotaxique dorée avec légère variation organique
      const phi = (i * 2.39996) + (Math.random() - 0.5) * 0.35;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const radialVec = new THREE.Vector3()
        .copy(bSide).multiplyScalar(cosP)
        .addScaledVector(bNorm, sinP)
        .normalize();

      // Pétiole ancré physiquement dans l'écorce (94% du rayon de bois) : zéro vide d'attache
      const petioleAnchor = new THREE.Vector3().copy(axisPt).addScaledVector(radialVec, woodR * 0.94);

      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.castShadow = false;
      leaf.receiveShadow = false;
      leaf.position.copy(petioleAnchor);

      // Orientation phototropique vers l'extérieur et vers le haut
      const targetDir = new THREE.Vector3()
        .copy(radialVec).multiplyScalar(0.72)
        .addScaledVector(bDir, 0.30)
        .add(new THREE.Vector3(0, 0.28, 0))
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.10, (Math.random() - 0.5) * 0.10, (Math.random() - 0.5) * 0.10))
        .normalize();

      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, targetDir);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(targetDir, (Math.random() - 0.5) * 0.55);
      quat.premultiply(rollQuat);
      leaf.quaternion.copy(quat);

      const sizeVariance = 0.85 + Math.random() * 0.30;
      const baseScale = THREE.MathUtils.lerp(minScale, maxScale, Math.random()) * sizeVariance;
      leaf.scale.set(0.0001, 0.0001, 0.0001);
      treeGroup.add(leaf);

      // Synchronisation absolue : la feuille naît EXACTEMENT lorsque le bois atteint la fraction t
      const leafStartP = bStartP + t * (bEndP - bStartP);
      const leafDuration = 0.040 + Math.random() * 0.018;

      leaves.push({
        mesh: leaf,
        targetScale: baseScale,
        leafStartP,
        leafDuration,
        stage: branchObj.stage,
        windBucket: Math.floor(Math.random() * WIND_BUCKETS),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.6 + Math.random() * 2.0,
        origRot: leaf.rotation.clone(),
        unfurlAngle: (Math.random() * 0.35 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
        dropSeasonThreshold: 3.10 + Math.random() * 0.60,
        isClinger: Math.random() < 0.015
      });
    }

    // 2. Bouquet terminal apical à 360° en rosette (coiffe et dissimule totalement la pointe de bois)
    for (let k = 0; k < bouquetCount; k++) {
      if (bEnd.y < -0.65 && Math.hypot(bEnd.x, bEnd.z) < 0.40) continue;

      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.castShadow = false;
      leaf.receiveShadow = false;

      // Répartition radiale équilibrée en dôme 3D autour de l'axe terminal
      const ang = (k / bouquetCount) * Math.PI * 2 + (k % 2 === 0 ? 0 : 0.26);
      const fanOut = 0.48 + (k % 2) * 0.28;
      const fanFwd = 0.55 + ((k + 1) / (bouquetCount + 1)) * 0.42;

      const radialVec = new THREE.Vector3()
        .copy(bSide).multiplyScalar(Math.cos(ang))
        .addScaledVector(bNorm, Math.sin(ang))
        .normalize();

      // Le bouquet naît dans l'écorce à l'extrémité du rameau
      const bouquetPos = new THREE.Vector3()
        .copy(bEnd)
        .addScaledVector(bDir, -0.014)
        .addScaledVector(radialVec, rEnd * 0.88);

      leaf.position.copy(bouquetPos);

      // Chaque feuille s'évase vers l'avant et l'extérieur en cloche 3D, masquant complètement la coupe de bois
      const targetDir = new THREE.Vector3()
        .copy(bDir).multiplyScalar(fanFwd)
        .addScaledVector(radialVec, fanOut)
        .add(new THREE.Vector3(0, 0.22, 0))
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08))
        .normalize();

      const quat = new THREE.Quaternion().setFromUnitVectors(upVec, targetDir);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(targetDir, (Math.random() - 0.5) * 0.50);
      quat.premultiply(rollQuat);
      leaf.quaternion.copy(quat);

      const tipVariance = 0.88 + Math.random() * 0.28;
      const tipScale = THREE.MathUtils.lerp(minScale, maxScale, Math.random()) * tipVariance;
      leaf.scale.set(0.0001, 0.0001, 0.0001);
      treeGroup.add(leaf);

      // Le bouquet naît au moment exact où la pointe du rameau est formée
      const leafStartP = bEndP;
      const leafDuration = 0.040 + Math.random() * 0.018;

      leaves.push({
        mesh: leaf,
        targetScale: tipScale,
        leafStartP,
        leafDuration,
        stage: branchObj.stage,
        windBucket: Math.floor(Math.random() * WIND_BUCKETS),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.8 + Math.random() * 2.0,
        origRot: leaf.rotation.clone(),
        unfurlAngle: (Math.random() * 0.35 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
        dropSeasonThreshold: 3.15 + Math.random() * 0.60,
        isClinger: Math.random() < 0.015
      });
    }
  }

  // Distribution étagée du feuillage créant la canopée dense et ébouriffée ("comme un vrai arbre") :
  // A) Rameaux quaternaires (jeunes pousses terminales : bouquets radiaux luxuriants de 8 feuilles)
  quaternaryBranches.forEach(qb => {
    populateBranchFoliage(qb, 3, 8, 0.38, 0.56);
  });

  // B) Sous-rameaux subTwigs (feuilles jeunes et fraîches en éventail + bouquet terminal de 7 feuilles)
  subTwigBranches.forEach(sb => {
    populateBranchFoliage(sb, 4, 7, 0.42, 0.60);
  });

  // C) Rameaux intermédiaires child twigs
  intermediateChildTwigs.forEach(ict => {
    populateBranchFoliage(ict, 4, 7, 0.42, 0.62);
  });

  // D) Rameaux twigs (feuilles médianes robustes + bouquet terminal couvrant la pointe)
  twigBranches.forEach(tb => {
    populateBranchFoliage(tb, 4, 6, 0.44, 0.64);
  });

  // E) Rameaux intermédiaires intérieurs
  intermediateBranches.forEach(ib => {
    populateBranchFoliage(ib, 4, 6, 0.46, 0.66);
  });

  // F) Branches de charpente et petites branches basses/internes (dessous de canopée touffu et naturel)
  branches.forEach(b => {
    // Exclure strictement le fût du tronc
    if (b.rStart >= 0.20 && b.end.y < 0.40 && Math.hypot(b.end.x, b.end.z) < 0.45) return;

    // 1. Rameaux terminaux ou petites branches basses avec embout (bFrontMid, bL_inward, bR_inward, bTop, etc.)
    if (b.hasTipCap || b.rEnd <= 0.035) {
      populateBranchFoliage(b, 4, 7, 0.40, 0.60);
    }
    // 2. Branches secondaires moyennes (rEnd <= 0.080)
    else if (b.stage >= 3 && b.rEnd <= 0.080 && b.end.y > -0.50) {
      populateBranchFoliage(b, 4, 4, 0.44, 0.65);
    }
  });

  // ── 12B. Delicate Sculpted Canopy Tree Blossoms (Floraison printanière - Étape 1 : About) ──
  function createSculptedBlossomGeometry() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const indices = [];

    // Sommet central pistil
    pos.push(0, 0, 0.025);
    uvs.push(0.5, 0.5);

    const petals = 5;
    let vertIdx = 1;

    for (let p = 0; p < petals; p++) {
      const midAngle = (p / petals) * Math.PI * 2;
      const cosM = Math.cos(midAngle);
      const sinM = Math.sin(midAngle);
      const perpX = -sinM;
      const perpY = cosM;

      // Dimensions légèrement agrandies pour un impact visuel majestueux et délicat
      const rBase = 0.035;
      const rMid = 0.155;
      const rTip = 0.250;
      const spread = 0.088;

      const bx = cosM * rBase;
      const by = sinM * rBase;
      const bz = 0.012;

      const lx = cosM * rMid + perpX * spread;
      const ly = sinM * rMid + perpY * spread;
      const lz = -0.018;

      const tx = cosM * rTip;
      const ty = sinM * rTip;
      const tz = -0.010;

      const rx = cosM * rMid - perpX * spread;
      const ry = sinM * rMid - perpY * spread;
      const rz = -0.018;

      const bIdx = vertIdx;
      pos.push(bx, by, bz);
      pos.push(lx, ly, lz);
      pos.push(tx, ty, tz);
      pos.push(rx, ry, rz);

      uvs.push(0.5, 0.5);
      uvs.push(0.1, 0.6);
      uvs.push(0.5, 1.0);
      uvs.push(0.9, 0.6);

      indices.push(0, bIdx, bIdx + 1);
      indices.push(0, bIdx + 1, bIdx + 2);
      indices.push(0, bIdx + 2, bIdx + 3);
      indices.push(0, bIdx + 3, bIdx);

      vertIdx += 4;
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const blossomPetalGeo = createSculptedBlossomGeometry();
  const blossomPistilGeo = new THREE.SphereGeometry(0.062, 8, 6);
  // Fleurs aux 3 couleurs du gradient de marque réparties aléatoirement dans la ramure :
  // 1. Jaune éclatant (#eeff00), 2. Cyan électrique (#00c8ff / #38bdf8), 3. Magenta éclatant (#ff00d4 / #ff00f2)
  const blossomPetalMats = [
    new THREE.MeshStandardMaterial({
      color: 0xeeff00,
      emissive: 0x444400,
      emissiveIntensity: 0.18,
      roughness: 0.35,
      metalness: 0.02,
      side: THREE.DoubleSide
    }),
    new THREE.MeshStandardMaterial({
      color: 0x00c8ff,
      emissive: 0x003355,
      emissiveIntensity: 0.20,
      roughness: 0.35,
      metalness: 0.02,
      side: THREE.DoubleSide
    }),
    new THREE.MeshStandardMaterial({
      color: 0xff00d4,
      emissive: 0x550044,
      emissiveIntensity: 0.20,
      roughness: 0.35,
      metalness: 0.02,
      side: THREE.DoubleSide
    })
  ];
  const blossomPistilMat = new THREE.MeshStandardMaterial({
    color: 0xffea00,
    emissive: 0x664400,
    emissiveIntensity: 0.20,
    roughness: 0.35,
    metalness: 0.02
  });

  const canopyBlossomsGroup = new THREE.Group();
  canopyBlossomsGroup.visible = false;
  treeGroup.add(canopyBlossomsGroup);

  const canopyBlossoms = [];
  const blossomAnchorPoints = [
    bTopCrown_end, bTopCrown_subA, bTopCrown_subB, bTopCrown_subC,
    bTop1_end, bTop1_subA, bTop1_subB,
    bTop2_end, bTop2_subA, bTop2_subB,
    bL_nodes[4], bL_nodes[5], bL_sub1_nodes[3], bL_sub2_nodes[3], bL_sub3_nodes[1],
    bR_nodes[4], bR_nodes[5], bR_nodes[6], bR_sub1_nodes[3], bR_sub2_nodes[3], bR_sub3_nodes[1], bR_sub4_nodes[1],
    bF_nodes[3], bF_nodes[4], bF_sub1_nodes[3],
    bB_nodes[3], bB_nodes[4], bB_sub1_nodes[3],
    bMidL_nodes[3], bMidR_nodes[3], bCrownLowL_end, bCrownLowR_end
  ];

  // Éparpillement de fleurs sur la dentelle des nouveaux sous-rameaux
  for (let i = 0; i < subTwigBranches.length; i += 3) {
    blossomAnchorPoints.push(subTwigBranches[i].end);
  }
  for (let i = 0; i < quaternaryBranches.length; i += 2) {
    blossomAnchorPoints.push(quaternaryBranches[i].end);
  }

  const blossomsPerCluster = isLowPower ? 4 : 7;
  const blossomFaceNormal = new THREE.Vector3(0, 0, 1);

  blossomAnchorPoints.forEach((anchor) => {
    for (let b = 0; b < blossomsPerCluster; b++) {
      const bGroup = new THREE.Group();

      const curPetalMat = blossomPetalMats[Math.floor(Math.random() * blossomPetalMats.length)];
      const petalsMesh = new THREE.Mesh(blossomPetalGeo, curPetalMat);
      petalsMesh.castShadow = false;
      petalsMesh.receiveShadow = false;
      bGroup.add(petalsMesh);

      const pistilMesh = new THREE.Mesh(blossomPistilGeo, blossomPistilMat);
      pistilMesh.position.set(0, 0, 0.028);
      pistilMesh.scale.set(1.0, 1.0, 0.75);
      bGroup.add(pistilMesh);

      // Positionnement harmonieux sur l'enveloppe de la ramure
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.8 - 0.9);
      const rad = 0.20 + Math.random() * 0.24;
      const ox = rad * Math.sin(phi) * Math.cos(theta);
      const oy = rad * Math.sin(phi) * Math.sin(theta) * 0.85 + 0.05;
      const oz = rad * Math.cos(phi);

      bGroup.position.set(anchor.x + ox, anchor.y + oy, anchor.z + oz);

      // Orientation de la corolle vers l'extérieur et vers le ciel
      const outDir = new THREE.Vector3(ox, oy, oz).normalize();
      outDir.y += 0.45;
      outDir.normalize();

      const quat = new THREE.Quaternion().setFromUnitVectors(blossomFaceNormal, outDir);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(outDir, (Math.random() - 0.5) * Math.PI);
      quat.premultiply(rollQuat);
      bGroup.quaternion.copy(quat);

      const baseScale = 0.78 + Math.random() * 0.30;
      bGroup.scale.set(0.0001, 0.0001, 0.0001);

      canopyBlossomsGroup.add(bGroup);
      canopyBlossoms.push({
        mesh: bGroup,
        baseScale,
        baseRotZ: bGroup.rotation.z,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 1.4 + Math.random() * 1.6
      });
    }
  });

  // Atmospheric Sunlit Pollen Motes
  const pollenCount = isLowPower ? 18 : 45;
  const pollenGeo = new THREE.BufferGeometry();
  const pollenPos = new Float32Array(pollenCount * 3);
  const pollenVels = [];

  for (let i = 0; i < pollenCount; i++) {
    pollenPos[i * 3] = (Math.random() - 0.5) * 9;
    pollenPos[i * 3 + 1] = -3.5 + Math.random() * 8.5;
    pollenPos[i * 3 + 2] = (Math.random() - 0.5) * 7;

    pollenVels.push({
      speedX: 0.004 + Math.random() * 0.008,
      speedY: -0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2
    });
  }

  pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3));
  const pollenMat = new THREE.PointsMaterial({
    color: 0xfff3a0,
    size: 0.08,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const pollenPoints = new THREE.Points(pollenGeo, pollenMat);
  treeGroup.add(pollenPoints);

  // ─── 14. Falling Leaves Particle System (Chute naturelle et tourbillonnante de feuilles) ───────
  const fallingLeavesCount = isLowPower ? 20 : 42;
  const fallingLeavesGroup = new THREE.Group();
  fallingLeavesGroup.visible = false;
  treeGroup.add(fallingLeavesGroup);

  const fallingLeaves = [];
  const fallingLeafMats = [
    new THREE.MeshStandardMaterial({ color: 0xdd7205, map: leafTexture, bumpMap: leafBumpMap, bumpScale: 0.03, roughness: 0.65, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xc24400, map: leafTexture, bumpMap: leafBumpMap, bumpScale: 0.03, roughness: 0.65, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xa82018, map: leafTexture, bumpMap: leafBumpMap, bumpScale: 0.03, roughness: 0.65, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x224e1b, map: leafTexture, bumpMap: leafBumpMap, bumpScale: 0.03, roughness: 0.65, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0xd46808, map: leafTexture, bumpMap: leafBumpMap, bumpScale: 0.03, roughness: 0.65, side: THREE.DoubleSide })
  ];

  function respawnFallingLeaf(fl, startAtTop = true) {
    const ang = Math.random() * Math.PI * 2;
    const r = 0.5 + Math.random() * 2.5;
    fl.mesh.position.x = Math.cos(ang) * r;
    fl.mesh.position.z = Math.sin(ang) * r;
    // Toujours démarrer haut dans la canopée, JAMAIS au niveau du tronc
    fl.mesh.position.y = 2.8 + Math.random() * 3.2;

    fl.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    fl.vy = -(0.012 + Math.random() * 0.018);
    fl.vx = (Math.random() - 0.5) * 0.008;
    fl.vz = (Math.random() - 0.5) * 0.008;
    fl.rotSpeedX = (Math.random() - 0.5) * 0.035;
    fl.rotSpeedY = (Math.random() - 0.5) * 0.025;
    fl.rotSpeedZ = (Math.random() - 0.5) * 0.035;
    fl.swayFreq = 1.3 + Math.random() * 1.8;
    fl.swayAmp = 0.014 + Math.random() * 0.020;
    fl.phase = Math.random() * Math.PI * 2;
  }

  for (let i = 0; i < fallingLeavesCount; i++) {
    const fMat = fallingLeafMats[i % fallingLeafMats.length];
    const mesh = new THREE.Mesh(leafGeo, fMat);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    const scale = 0.38 + Math.random() * 0.28;
    mesh.scale.set(scale, scale, scale);
    mesh.visible = false;

    fallingLeavesGroup.add(mesh);
    const fl = {
      mesh,
      baseScale: scale,
      index: i,
      vy: 0, vx: 0, vz: 0,
      rotSpeedX: 0, rotSpeedY: 0, rotSpeedZ: 0,
      swayFreq: 0, swayAmp: 0, phase: 0
    };
    respawnFallingLeaf(fl, true);
    fallingLeaves.push(fl);
  }

  // ─── 14B. Winter Snowflakes Particle Engine ────────────────────────────────
  const snowCount = isLowPower ? 35 : 75;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  const snowVels = [];

  for (let i = 0; i < snowCount; i++) {
    snowPos[i * 3]     = (Math.random() - 0.5) * 14;
    snowPos[i * 3 + 1] = -4.2 + Math.random() * 10;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 10;

    snowVels.push({
      vy: 0.014 + Math.random() * 0.018,
      vx: (Math.random() - 0.5) * 0.005,
      swaySpeed: 1.1 + Math.random() * 1.6,
      swayAmp: 0.005 + Math.random() * 0.007,
      phase: Math.random() * Math.PI * 2
    });
  }

  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.11,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const snowPoints = new THREE.Points(snowGeo, snowMat);
  treeGroup.add(snowPoints);

  // ─── 15. Mouse Parallax & Resizing ────────────────────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }, { passive: true });

  // ─── Smooth Cinematic Camera Spline Paths ─────────────────────────────────
  const camPath = [
    new THREE.Vector3(0.00, -4.00, 4.40),  // 0% Sol / Semis émergent
    new THREE.Vector3(0.00, -3.40, 5.50),  // 25% Jeune pousse
    new THREE.Vector3(0.15, -1.60, 9.50),  // 50% Arbrisseau
    new THREE.Vector3(0.35,  0.50, 14.50), // 75% Arbre en croissance
    new THREE.Vector3(-3.20, 0.90, 14.20)  // 100% Chêne mature
  ];

  const lookPath = [
    new THREE.Vector3(0.00, -4.30, 0.00),  // 0% Sol
    new THREE.Vector3(0.00, -3.20, 0.00),  // 25% Pousse
    new THREE.Vector3(0.10, -1.00, 0.00),  // 50% Sapling
    new THREE.Vector3(0.15,  1.10, 0.00),  // 75% Mid-canopy
    new THREE.Vector3(-1.20, 1.50, 0.00)   // 100% Cime
  ];

  const camCurve = new THREE.CatmullRomCurve3(camPath, false, 'catmullrom', 0.5);
  const lookCurve = new THREE.CatmullRomCurve3(lookPath, false, 'catmullrom', 0.5);
  const currentCamLook = new THREE.Vector3(0, -4.3, 0);
  const targetCamPos = new THREE.Vector3();
  const targetLookPos = new THREE.Vector3();

  // ─── 16. Real Page Loading & Subresource Tracking Engine ────────────────────
  // L'arbre est un loader vivant : sa croissance est synchronisée avec le chargement
  // effectif du DOM, des images, des polices et des ressources de la page.
  let isPageFullyLoaded = (document.readyState === 'complete');
  let realLoadingRatio = isPageFullyLoaded ? 1.0 : 0.20;

  const pageImages = Array.from(document.querySelectorAll('img'));
  const totalImgs = pageImages.length;
  let loadedImgs = 0;

  function recalculateLoadingState() {
    if (isPageFullyLoaded) {
      realLoadingRatio = 1.0;
      return;
    }
    const domRatio = (document.readyState === 'complete') ? 1.0 :
                     (document.readyState === 'interactive') ? 0.70 : 0.35;
    const imgRatio = totalImgs > 0 ? (loadedImgs / totalImgs) : 1.0;

    if (document.readyState === 'complete' && imgRatio >= 1.0) {
      isPageFullyLoaded = true;
      realLoadingRatio = 1.0;
    } else {
      realLoadingRatio = domRatio * 0.40 + imgRatio * 0.60;
    }
  }

  pageImages.forEach((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      loadedImgs++;
    } else {
      img.addEventListener('load', () => {
        loadedImgs++;
        recalculateLoadingState();
      }, { once: true });
      img.addEventListener('error', () => {
        loadedImgs++;
        recalculateLoadingState();
      }, { once: true });
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      recalculateLoadingState();
    });
  }

  window.addEventListener('load', () => {
    isPageFullyLoaded = true;
    realLoadingRatio = 1.0;
  }, { once: true });

  recalculateLoadingState();

  // ─── 17. Botanical Stage Timeline & Interactive Controller ────────────────
  function botanicalTimeline(tNorm) {
    tNorm = Math.max(0, Math.min(1.0, tNorm));
    // Progression biologique douce et continue (accélération juvénile, croissance vigoureuse, maturation cime)
    return tNorm * tNorm * (3.0 - 2.0 * tNorm);
  }

  let manualLockedStage = null;
  let manualLockedProgress = null;
  let isPaused = false;

  window.treeStageController = {
    setStage(stageNum) {
      if (stageNum >= 1 && stageNum <= 4) {
        manualLockedStage = stageNum;
        manualLockedProgress = stageNum * 0.25;
        console.log(`[Tree 3D] Locked to Stage ${stageNum} (${(stageNum * 25)}%)`);
      }
    },
    setProgress(p) {
      manualLockedStage = Math.min(4, Math.max(1, Math.ceil(p * 4)));
      manualLockedProgress = Math.max(0, Math.min(1, p));
    },
    pause() {
      isPaused = true;
    },
    resume() {
      isPaused = false;
      manualLockedStage = null;
      manualLockedProgress = null;
    },
    getStage() {
      return Math.min(4, Math.max(1, Math.ceil(currentProgress * 4)));
    },
    getProgress() {
      return currentProgress;
    }
  };

  // ─── 17B. Seasonal Scroll Architecture (0: Arbre tel quel -> 1: Fleurs -> 2: Perte fleurs / Été -> 3: Automne -> 4: Hiver) ────
  // Section pairing:
  // Home => Arbre tel quel (0.0) : arbre vert printanier mature sans fleur
  // About => Ajout de fleurs (1.0) : floraison printanière délicate dans la canopée et au sol
  // Experience => Perte des fleurs / Été (2.0) : fleurs disparues, vert émeraude profond
  // Projects => Automne (3.0) : or, ambre, rouille, tourbillons de feuilles au vent
  // Contact => Hiver (4.0) : ramure nue sculpturale, neige qui tombe doucement, sol givré
  let currentSeason = 0.0;
  let targetSeason = 0.0;
  let manualSeason = null;

  function getSeasonFromScroll() {
    if (!isRevealed) return 0.0; // Pendant l'intro / loader, rester strictement à 0.0

    const home = document.getElementById('home');
    const about = document.getElementById('about');
    const exp = document.getElementById('experience');
    const proj = document.getElementById('projects');
    const contact = document.getElementById('contact');

    if (!home || !about || !exp || !proj) return 0.0;

    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    const focal = vh * 0.40;

    // Tout en haut de la page (Home) -> Arbre tel quel (0.0)
    if (scrollY <= 30) return 0.0;

    // Tout en bas de la page (Contact / Footer) -> Hiver (4.0) garanti
    const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    if (scrollY >= maxScroll - 60) return 4.0;

    const rHome = home.getBoundingClientRect();
    const rAbout = about.getBoundingClientRect();
    const rExp = exp.getBoundingClientRect();
    const rProj = proj.getBoundingClientRect();
    const rContact = contact ? contact.getBoundingClientRect() : null;

    // Section Contact atteinte => Hiver (4.0)
    if (rContact && rContact.top <= focal) {
      return 4.0;
    }

    // Entre Projects et Contact : 3.0 (Automne) -> 4.0 (Hiver)
    if (rProj.top <= focal) {
      if (!rContact) return 3.0;
      const span = rContact.top - rProj.top;
      if (span <= 0) return 4.0;
      const t = (focal - rProj.top) / span;
      return 3.0 + Math.max(0.0, Math.min(1.0, t));
    }

    // Entre Experience et Projects : 2.0 (Perte des fleurs / Plein Été) -> 3.0 (Automne)
    if (rExp.top <= focal) {
      const span = rProj.top - rExp.top;
      if (span <= 0) return 3.0;
      const t = (focal - rExp.top) / span;
      return 2.0 + Math.max(0.0, Math.min(1.0, t));
    }

    // Entre About et Experience : 1.0 (Ajout de fleurs) -> 2.0 (Perte des fleurs / Plein Été)
    if (rAbout.top <= focal) {
      const span = rExp.top - rAbout.top;
      if (span <= 0) return 2.0;
      const t = (focal - rAbout.top) / span;
      return 1.0 + Math.max(0.0, Math.min(1.0, t));
    }

    // Entre Home et About : 0.0 (Arbre tel quel) -> 1.0 (Ajout de fleurs)
    const span = rAbout.top - rHome.top;
    if (span <= 0) return 1.0;
    const t = (focal - rHome.top) / span;
    return Math.max(0.0, Math.min(1.0, t));
  }

  window.treeSeasonController = {
    setSeason(s) {
      if (typeof s === 'number' && s >= 0 && s <= 4) {
        manualSeason = s;
        const labels = ['Arbre tel quel (0)', 'Ajout de fleurs (1)', 'Perte des fleurs / Été (2)', 'Automne (3)', 'Hiver (4)'];
        console.log(`[Tree 3D] Season set to ${labels[s]}`);
      }
    },
    getSeason() {
      return currentSeason;
    },
    resume() {
      manualSeason = null;
    }
  };

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === '1') window.treeStageController.setStage(1);
    else if (e.key === '2') window.treeStageController.setStage(2);
    else if (e.key === '3') window.treeStageController.setStage(3);
    else if (e.key === '4') window.treeStageController.setStage(4);
    else if (e.key === '0' || e.key === 'Escape') {
      window.treeStageController.resume();
      window.treeSeasonController?.resume();
    }
  });

  // Dynamic Sprout Tip Calculation
  function getSproutTip(prog) {
    const t = getTrunkGrowthT(prog);
    return trunkCurve.getPointAt(Math.max(0.001, Math.min(1.0, t)));
  }

  // ─── 18. Animation Loop (60 FPS Multi-Harmonic Wind & Botanical Growth) ───
  const introDelay = 450; // Pause initiale : seul le background pur est affiché
  const startTime = performance.now();
  let accumulatedGrowthTime = 0;
  const minDuration = 3000; // 3 secondes minimum de croissance de l'arbre
  let currentProgress = 0.0;
  let isRevealed = false;
  let isCompleteTriggered = false;

  // ── Companion Mini-Nav ("Nav Close") Liquid Loading Animation ──
  const subPhrases = [
    'Loading data...',
    'Making a coffee...',
    'Watering the seedling...',
    'Planting seeds...',
    'Rendering foliage...',
    'Warming up the sun...',
    'Breathing fresh air...',
    'Aligning leaves...',
    'Nurturing the roots...',
    'Generating branches...',
    'Synthesizing chlorophyll...',
    'Almost ready...'
  ];
  let currentPhrase = '';
  let availablePhrases = [];
  let subPhraseInterval = null;

  function getNextUniquePhrase() {
    if (availablePhrases.length === 0) {
      // Reconstituer le sac mélangé sans jamais répéter la dernière phrase affichée
      availablePhrases = subPhrases.filter(p => p !== currentPhrase);
      for (let i = availablePhrases.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePhrases[i], availablePhrases[j]] = [availablePhrases[j], availablePhrases[i]];
      }
    }
    currentPhrase = availablePhrases.pop();
    return currentPhrase;
  }

  function rollToNextPhrase() {
    const rollerEl = document.getElementById('nav-show-roller');
    const navShowEl = document.getElementById('nav-show');
    if (!rollerEl || !navShowEl || isRevealed || document.body.classList.contains('site-revealed')) return;

    const currentItem = rollerEl.querySelector('.nav-show-item:not(.roll-out)');
    const nextText = getNextUniquePhrase();

    // 1. L'ancien élément effectue son roll-out avec flou cinétique montant
    if (currentItem) {
      currentItem.classList.remove('is-visible', 'roll-in');
      currentItem.classList.add('roll-out');
      setTimeout(() => {
        if (currentItem.parentNode === rollerEl) {
          rollerEl.removeChild(currentItem);
        }
      }, 430);
    }

    // 2. Le nouvel élément démarre immédiatement son animation roll-in avec flou cinétique
    const nextItem = document.createElement('span');
    nextItem.className = 'nav-show-item roll-in';
    nextItem.textContent = nextText;
    rollerEl.appendChild(nextItem);
  }

  function startSubNavLoading() {
    if (isRevealed || document.body.classList.contains('site-revealed')) return;
    const navShowEl = document.getElementById('nav-show');
    const rollerEl = document.getElementById('nav-show-roller');
    if (!navShowEl || !rollerEl) return;

    rollerEl.innerHTML = '';
    availablePhrases = [];
    currentPhrase = '';
    const initialText = getNextUniquePhrase();

    const firstItem = document.createElement('span');
    firstItem.className = 'nav-show-item is-visible';
    firstItem.textContent = initialText;
    rollerEl.appendChild(firstItem);

    navShowEl.classList.remove('sub-nav-retract');
    navShowEl.classList.add('sub-nav-active');

    // Défilement toutes les secondes sans jamais répéter le même texte
    if (subPhraseInterval) clearInterval(subPhraseInterval);
    subPhraseInterval = setInterval(() => {
      rollToNextPhrase();
    }, 1000);
  }

  function retractSubNavLoading(onDone) {
    if (subPhraseInterval) {
      clearInterval(subPhraseInterval);
      subPhraseInterval = null;
    }
    const navShowEl = document.getElementById('nav-show');
    if (!navShowEl) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    navShowEl.classList.remove('sub-nav-active');
    navShowEl.classList.add('sub-nav-retract');

    // Durée de la rentrée liquide inversée légèrement plus rapide (580ms)
    setTimeout(() => {
      if (typeof onDone === 'function') onDone();
    }, 580);
  }

  // Déclenchement de l'entrée : le sol monte en fondu up et la barre descend et s'élargit en down width
  setTimeout(() => {
    document.body.classList.add('tree-intro-active');
    setTimeout(() => {
      startSubNavLoading();
    }, 380);
  }, 80);

  // ── Render Loop Lifecycle (The tree stays continuously visible across the entire site) ──
  let rafId = null;
  let lastFrameTime = performance.now();

  const loaderFillEl = document.getElementById('nav-loader-fill');
  const loaderPercentEl = document.getElementById('nav-loader-percent');
  let lastReportedPercent = -1;

  function triggerSiteReveal() {
    if (isRevealed) return;
    isRevealed = true;
    currentProgress = 1.0;

    // Garantir l'affichage 100% sur le loader
    if (loaderFillEl) loaderFillEl.style.transform = 'scaleX(1)';
    if (loaderPercentEl) loaderPercentEl.textContent = '100%';

    const navBar = document.getElementById('navBar');
    if (navBar) navBar.classList.add('is-complete');
    retractSubNavLoading();

    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('preloader-zoom-morph');
      setTimeout(() => {
        preloader.remove();
      }, 800);
    }

    // Déclenche l'expansion morphing fluide du navBar et l'apparition échelonnée de ses éléments
    document.body.classList.add('site-revealed', 'site-revealing');
    const navShowEl = document.getElementById('nav-show');
    if (navShowEl) navShowEl.classList.remove('sub-nav-retract');

    setTimeout(() => {
      document.body.classList.remove('site-revealing');
    }, 1200);

    if (typeof onComplete === 'function') onComplete();
  }

  // Navigation fluide instantanée : dès que l'utilisateur scrolle, clique ou touche, révéler immédiatement
  const userIntentReveal = () => {
    if (!isRevealed) {
      triggerSiteReveal();
    }
  };
  window.addEventListener('wheel', userIntentReveal, { passive: true, once: true });
  window.addEventListener('touchmove', userIntentReveal, { passive: true, once: true });
  window.addEventListener('click', userIntentReveal, { passive: true, once: true });
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'Enter'].includes(e.key)) {
      userIntentReveal();
    }
  }, { once: true });

  function stopTreeLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Optimisations de performance ultra haute fidélité (Zero dégradation visuelle)
  let isTrunkFinalized = false;
  let areBranchesFinalized = false;
  let isPixelRatioAdapted = false;
  let lastSeasonForBark = -1;
  let lastShadowSeason = -1;
  let lastSeasonForLeaves = -1;
  let lastSeasonForGround = -1;
  let lastSeasonForColors = -1;
  let adultCamPos = null;
  let adultLookPos = null;
  const tempBranchTip = new THREE.Vector3();

  function startTreeLoop() {
    if (!rafId && !document.hidden) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function animate(now) {
    if (document.hidden) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(animate);

    // Dynamic Frame Pacing : 60 FPS fluide pendant le chargement et le défilement actif,
    // et 36 FPS doux en arrière-plan lorsque le visiteur est en lecture statique
    if (isRevealed) {
      const isInteracting = Math.abs(targetSeason - currentSeason) > 0.003 || Math.abs(mouse.targetX - mouse.x) > 0.01;
      const minFrameInterval = isInteracting ? 0 : (isLowPower ? 32 : 27);
      if (minFrameInterval > 0 && (now - lastFrameTime < minFrameInterval)) {
        return;
      }
    } else if (isLowPower) {
      if (now - lastFrameTime < 32) return;
    }

    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    const elapsed = now - startTime;
    const elapsedSec = elapsed / 1000;
    const windGust = Math.sin(elapsedSec * 0.5) * 0.5 + Math.sin(elapsedSec * 0.22) * 0.35 + 0.5;

    // Synchronisation en temps réel avec le DOM, images et fonts de la page (seulement si pas encore 100%)
    if (!isPageFullyLoaded) {
      recalculateLoadingState();
    }

    let targetProgress = 0.0;

    if (elapsed >= introDelay) {
      // Plafond strict : tant que tout le DOM, images et polices ne sont pas chargés,
      // la croissance de l'arbre plafonne à 88% (l'arbre s'arrête de croître et attend sans saccade)
      const maxAllowedProgress = isPageFullyLoaded ? 1.0 : Math.min(0.88, 0.20 + realLoadingRatio * 0.68);

      // Si l'arbre n'a pas atteint le plafond autorisé, la croissance avance
      if (currentProgress < maxAllowedProgress - 0.003) {
        accumulatedGrowthTime += dt;
      }

      const rawTimeProgress = Math.min(1.0, accumulatedGrowthTime / (minDuration / 1000));
      const organicTimeProgress = botanicalTimeline(rawTimeProgress);
      targetProgress = Math.min(maxAllowedProgress, organicTimeProgress);

      if (isPageFullyLoaded && rawTimeProgress >= 1.0) {
        targetProgress = 1.0;
      }
    }

    if (manualLockedProgress !== null) {
      targetProgress = manualLockedProgress;
    } else if (isPaused) {
      targetProgress = currentProgress;
    }

    // Convergence fluide vers la cible sans aucun à-coup
    const diff = targetProgress - currentProgress;
    const lerpSpeed = (targetProgress >= 0.98) ? 0.065 : 0.070;
    currentProgress += diff * lerpSpeed;

    // Arrivée propre et continue à 100%
    if ((manualLockedProgress === 1.0 || (manualLockedProgress === null && isPageFullyLoaded)) && targetProgress >= 0.999 && (1.0 - currentProgress) < 0.001) {
      currentProgress = 1.0;
    }

    const progress = currentProgress;
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // ── Seasonal Architecture & Scroll Transition ──
    targetSeason = (manualSeason !== null) ? manualSeason : getSeasonFromScroll();
    currentSeason += (targetSeason - currentSeason) * 0.06;

    // Mise à jour chromatique saisonnière (gated sur variation réelle de saison pour CPU minimal à l'arrêt)
    const colorSeasonDiff = Math.abs(currentSeason - lastSeasonForColors);
    if (colorSeasonDiff > 0.0012 || lastSeasonForColors < 0) {
      lastSeasonForColors = currentSeason;

      // Mise à jour chromatique des matériaux de feuilles (Printemps -> Été -> Automne -> Hiver)
      for (let i = 0; i < leafMaterials.length; i++) {
        interpolateSeasonColor(leafMaterials[i].color, leafSeasonPalettes[i], currentSeason);
      }

      // Mise à jour sol, mousses & herbes
      interpolateSeasonColor(groundMat.color, groundSeasonColors, currentSeason);
      groundMat.roughness = interpolateSeasonScalar([0.84, 0.86, 0.90, 0.86, 0.42], currentSeason);
      groundMat.metalness = interpolateSeasonScalar([0.01, 0.01, 0.02, 0.02, 0.06], currentSeason);

      for (let m = 0; m < mossMats.length; m++) {
        interpolateSeasonColor(mossMats[m].color, mossSeasonPalettes[m], currentSeason);
      }
      for (let g = 0; g < grassMaterials.length; g++) {
        interpolateSeasonColor(grassMaterials[g].color, grassSeasonPalettes[g], currentSeason);
      }
      for (let f = 0; f < fallenMats.length; f++) {
        interpolateSeasonColor(fallenMats[f].color, fallenSeasonPalettes[f], currentSeason);
      }
      for (let f = 0; f < fallingLeafMats.length; f++) {
        interpolateSeasonColor(fallingLeafMats[f].color, leafSeasonPalettes[f % leafSeasonPalettes.length], currentSeason);
      }

      interpolateSeasonColor(sunLight.color, sunSeasonColors, currentSeason);
      sunLight.intensity = interpolateSeasonScalar(sunSeasonIntensities, currentSeason);

      interpolateSeasonColor(ambientLight.color, ambientSeasonColors, currentSeason);
      ambientLight.intensity = interpolateSeasonScalar(ambientSeasonIntensities, currentSeason);

      interpolateSeasonColor(rimLight.color, rimSeasonColors, currentSeason);
      rimLight.intensity = interpolateSeasonScalar(rimSeasonIntensities, currentSeason);

      interpolateSeasonColor(hemiLight.color, hemiSkySeasonColors, currentSeason);
      interpolateSeasonColor(hemiLight.groundColor, hemiGroundSeasonColors, currentSeason);

      interpolateSeasonColor(mossBounceLight.color, mossBounceSeasonColors, currentSeason);
    }

    // ── Déformation 3D & Configuration morphologique du sol selon les saisons ──
    const groundSeasonDiff = Math.abs(currentSeason - lastSeasonForGround);
    if (groundMesh && groundBasePositions && (groundSeasonDiff > 0.0015 || lastSeasonForGround < 0)) {
      lastSeasonForGround = currentSeason;
      const posAttr = groundMesh.geometry.attributes.position;
      const posArr = posAttr.array;
      const winterProg = (currentSeason >= 2.6) ? Math.min(1.0, (currentSeason - 2.6) / 1.4) : 0.0;
      const winterEase = winterProg * winterProg * (3 - 2 * winterProg);
      const springProg = (currentSeason <= 1.8) ? Math.max(0.0, 1.0 - currentSeason / 1.8) : 0.0;

      for (let i = 0; i < posArr.length; i += 3) {
        const x = groundBasePositions[i];
        const baseY = groundBasePositions[i + 1];
        const z = groundBasePositions[i + 2];
        const dist = Math.hypot(x, z);
        const theta = Math.atan2(z, x);

        // En Hiver : accumulation d'un doux manteau de neige 3D (congères épaisses autour des contreforts)
        const snowDrift = winterEase * (Math.exp(-Math.pow(dist / 2.6, 1.8)) * 0.24 + Math.cos(theta * 3.0 + dist * 1.4) * 0.038 * Math.exp(-dist / 3.2));
        // Au Printemps : renflement végétal et prairie vivante
        const springSwell = springProg * (Math.exp(-Math.pow(dist / 1.8, 2.0)) * 0.045);

        posArr[i + 1] = baseY + snowDrift + springSwell;
      }
      posAttr.needsUpdate = true;
      groundMesh.geometry.computeVertexNormals();
    }

    // Tapis de feuilles mortes d'automne éparpillées sur le sol (Automne : 2.3 -> 3.85)
    if (fallenLeaves.length > 0) {
      let fallenScale = 0.0001;
      if (currentSeason >= 2.3 && currentSeason <= 3.85) {
        if (currentSeason < 2.9) {
          // Apparition progressive en automne
          fallenScale = (currentSeason - 2.3) / 0.6;
        } else if (currentSeason <= 3.3) {
          // Plein automne : sol tapissé de feuilles dorées et rousses
          fallenScale = 1.0;
        } else {
          // Recouvert par la neige en arrivant en hiver
          fallenScale = Math.max(0.0001, 1.0 - (currentSeason - 3.3) / 0.55);
        }
      }
      fallenLeaves.forEach(fl => {
        const s = fl.baseScale * fallenScale;
        fl.mesh.scale.set(s, s, s);
        fl.mesh.visible = (fallenScale > 0.02);
      });
    }

    // ── Falling Leaves Dynamics (Chute naturelle et tourbillonnante de feuilles - Strictement en Automne) ──
    let fallingLeavesActivity = 0.0;
    if (progress >= 0.95) {
      if (currentSeason >= 2.4 && currentSeason <= 3.6) {
        // Automne (Section Projets) : tourbillon doré de feuilles qui tombent
        const autumnProg = (currentSeason - 2.4) / 1.2;
        fallingLeavesActivity = Math.sin(autumnProg * Math.PI);
      }
    }

    if (fallingLeavesGroup) {
      fallingLeavesGroup.visible = (fallingLeavesActivity > 0.01);
      if (fallingLeavesGroup.visible) {
        const activeCount = Math.round(fallingLeaves.length * Math.max(0.20, fallingLeavesActivity));
        for (let i = 0; i < fallingLeaves.length; i++) {
          const fl = fallingLeaves[i];
          if (i >= activeCount) {
            fl.mesh.visible = false;
            continue;
          }
          fl.mesh.visible = true;

          // Mouvement aérodynamique de feuille dans le vent
          fl.mesh.position.y += fl.vy;
          fl.mesh.position.x += fl.vx + Math.sin(elapsedSec * fl.swayFreq + fl.phase) * fl.swayAmp + windGust * 0.015;
          fl.mesh.position.z += fl.vz + Math.cos(elapsedSec * (fl.swayFreq * 0.8) + fl.phase) * (fl.swayAmp * 0.7);

          fl.mesh.rotation.x += fl.rotSpeedX;
          fl.mesh.rotation.y += fl.rotSpeedY;
          fl.mesh.rotation.z += fl.rotSpeedZ;

          // Impact sol -> respawn au sommet de la ramure
          const gH = getGroundHeight(fl.mesh.position.x, fl.mesh.position.z);
          if (fl.mesh.position.y <= gH + 0.05) {
            respawnFallingLeaf(fl, true);
          }
        }
      } else {
        // En dehors de l'automne, masquer strictement toutes les mailles individuelles
        for (let i = 0; i < fallingLeaves.length; i++) {
          fallingLeaves[i].mesh.visible = false;
        }
      }
    }

    // ── Cycle Floral : Éclosion (About : 1.0) et Perte des Fleurs (Experience : 2.0) ──
    let blossomFactor = 0.0;
    // Les fleurs n'apparaissent pas dès le premier scroll, mais plus tard en s'approchant de About Me
    const blossomThreshold = 0.35; // Reste strictement à 0 fleur entre 0.0 et 0.35
    if (currentSeason < blossomThreshold) {
      blossomFactor = 0.0;
    } else if (currentSeason < 1.0) {
      // Entre 0.35 et 1.0 (approche de About me) : éclosion douce et progressive vers 1.0
      const f = (currentSeason - blossomThreshold) / (1.0 - blossomThreshold);
      const ease = f * f * (3 - 2 * f);
      blossomFactor = ease;
    } else if (currentSeason < 2.0) {
      // 1.0 (About) -> 2.0 (Experience : perte totale des fleurs)
      const f = currentSeason - 1.0;
      blossomFactor = Math.cos(f * Math.PI * 0.5);
    } else {
      blossomFactor = 0.0;
    }

    // Fleurs dans la ramure de l'arbre
    if (canopyBlossomsGroup) {
      const isBlossomVisible = (blossomFactor > 0.015);
      canopyBlossomsGroup.visible = isBlossomVisible;
      if (isBlossomVisible) {
        canopyBlossoms.forEach((cb) => {
          const s = cb.baseScale * blossomFactor;
          cb.mesh.scale.set(s, s, s);
          const flutter = Math.sin(elapsedSec * cb.swaySpeed + cb.phase) * (0.02 + windGust * 0.03);
          cb.mesh.rotation.z = cb.baseRotZ + flutter;
        });
      }
    }

    // Fleurs sauvages au sol
    if (groundWildflowers.length > 0) {
      const gFlowerVis = (blossomFactor > 0.015);
      groundWildflowers.forEach((gw) => {
        gw.visible = gFlowerVis;
        if (gFlowerVis) {
          const s = blossomFactor;
          gw.scale.set(s, s, s);
        }
      });
    }

    // Trèfles du sous-bois (végétation vivace, repos sous la neige en hiver)
    if (seasonalFloraGroups.length > 0) {
      const floraScale = currentSeason >= 3.2 ? Math.max(0.0001, 1.0 - (currentSeason - 3.2) / 0.7) : 1.0;
      seasonalFloraGroups.forEach(fg => {
        fg.scale.set(floraScale, floraScale, floraScale);
        fg.visible = (floraScale > 0.02);
      });
    }

    // ── Live Top Loader Capsule Update (optimisé sans query DOM per frame) ──
    const currentPercentInt = Math.round(progress * 100);
    if (loaderFillEl) {
      loaderFillEl.style.transform = `scaleX(${progress})`;
    }
    if (loaderPercentEl && currentPercentInt !== lastReportedPercent) {
      lastReportedPercent = currentPercentInt;
      loaderPercentEl.textContent = `${currentPercentInt}%`;
    }

    // ── Étape Terminé : logo vert, bordure et fond vert, puis transition rapide vers le site ──
    if (progress >= 1.0 && !isCompleteTriggered && manualLockedProgress === null && isPageFullyLoaded) {
      isCompleteTriggered = true;

      if (loaderFillEl) loaderFillEl.style.transform = 'scaleX(1)';
      if (loaderPercentEl) loaderPercentEl.textContent = '100%';

      requestAnimationFrame(() => {
        const navBar = document.getElementById('navBar');
        if (navBar) navBar.classList.add('is-complete');
        retractSubNavLoading();
      });

      // Laisser le temps à la capsule verte "✓ Loaded" de s'afficher élégamment (1000ms) avant l'expansion fluide du navBar
      setTimeout(() => {
        triggerSiteReveal();
      }, 1000);
    }

    // Balancement organique naturel du tronc et de l'arbre entier dans la brise
    const trunkSwayZ = Math.sin(elapsedSec * 0.65) * 0.005 + Math.sin(elapsedSec * 0.28) * 0.007 * (0.8 + windGust * 0.4);
    const trunkSwayX = Math.cos(elapsedSec * 0.52) * 0.004 * (0.8 + windGust * 0.4);
    treeGroup.rotation.z = trunkSwayZ;
    treeGroup.rotation.x = trunkSwayX;

    // Le collet racinaire et les contreforts du tronc croissent organiquement dans updateContinuousTrunk

    // ── Proportional Botanical Trunk & Branch Scaling ──
    let trunkThicknessFactor = 0.035;
    if (progress <= 0.25) {
      // Stage 1 (0 -> 25%) : Tige de semis très fine, souple et élancée
      const p = progress / 0.25;
      const ease = p * p * (3 - 2 * p);
      trunkThicknessFactor = 0.035 + 0.035 * ease;
    } else if (progress <= 0.50) {
      // Stage 2 (25% -> 50%) : Épaississement naturel en jeune arbrisseau
      const p = (progress - 0.25) / 0.25;
      const ease = p * p * (3 - 2 * p);
      trunkThicknessFactor = 0.070 + 0.220 * ease;
    } else if (progress <= 0.75) {
      // Stage 3 (50% -> 75%) : Tronc vigoureux et musclé
      const p = (progress - 0.50) / 0.25;
      const ease = p * p * (3 - 2 * p);
      trunkThicknessFactor = 0.290 + 0.400 * ease;
    } else {
      // Stage 4 (75% -> 100%) : Grand chêne mature au tronc puissant
      const p = (progress - 0.75) / 0.25;
      const ease = p * p * (3 - 2 * p);
      trunkThicknessFactor = 0.690 + 0.310 * ease;
    }

    // ── Update Continuous Botanical Trunk (Un Seul Polygone 3D Continu) ──
    if (progress < 1.0 || !isTrunkFinalized) {
      updateContinuousTrunk(progress, trunkThicknessFactor);
      if (progress >= 1.0) isTrunkFinalized = true;
    }

    // ── Proportional Botanical Branch Scaling & Material Transition ──
    if (progress < 1.0 || !areBranchesFinalized) {
      branches.forEach((b) => {
        if (progress < b.startP) {
          b.mesh.scale.set(0.0001, 0.0001, 0.0001);
          if (b.tipCapMesh) b.tipCapMesh.scale.set(0.0001, 0.0001, 0.0001);
        } else {
          const span = Math.max(0.03, b.endP - b.startP);
          const localP = Math.min(1.0, (progress - b.startP) / span);
          const easeLen = localP * localP * (3 - 2 * localP);

          const currentThickness = 0.10 + 0.90 * Math.min(1.0, Math.max(0, (progress - b.startP) / (1.0 - b.startP)));

          b.mesh.scale.set(currentThickness, easeLen, currentThickness);

          if (b.tipCapMesh) {
            tempBranchTip.copy(b.start).addScaledVector(b.dir, b.len * easeLen);
            b.tipCapMesh.position.copy(tempBranchTip);
            const capScale = b.rEnd * currentThickness;
            b.tipCapMesh.scale.set(capScale, capScale * 0.8, capScale);
          }

          // Texture and Material Transition: Fresh clean young stem -> Warm Hazel Sapling -> Ancient Oak
          if (progress < 0.25) {
            b.mat.color.copy(sproutGreenColor);
            b.mat.roughness = 0.35;
            if (b.isTextureMatured) {
              b.mat.map = youngStemTexture;
              b.mat.bumpMap = null;
              b.mat.needsUpdate = true;
              b.isTextureMatured = false;
            }
          } else if (progress < 0.50) {
            b.mat.color.copy(sproutGreenColor);
            b.mat.roughness = 0.38;
          } else if (progress >= b.turnBrownP) {
            const brownSpan = Math.max(0.18, 1.0 - b.turnBrownP);
            const brownP = Math.min(1.0, (progress - b.turnBrownP) / brownSpan);
            b.mat.color.lerpColors(youngHazelBarkColor, matureBarkSeasonColors[0], brownP);
            b.mat.roughness = THREE.MathUtils.lerp(0.38, 0.82, brownP);

            if (!b.isTextureMatured && progress >= 0.55) {
              b.mat.map = matureBarkTexture;
              b.mat.bumpMap = matureBarkBumpMap;
              b.mat.bumpScale = 0.015;
              b.mat.needsUpdate = true;
              b.isTextureMatured = true;
            }
          }
        }
      });
      if (progress >= 1.0) areBranchesFinalized = true;
    } else if (Math.abs(currentSeason - lastSeasonForBark) > 0.005) {
      lastSeasonForBark = currentSeason;
      interpolateSeasonColor(trunkMat.color, matureBarkSeasonColors, currentSeason);
      trunkMat.roughness = interpolateSeasonScalar([0.82, 0.82, 0.85, 0.82, 0.92], currentSeason);
      branches.forEach((b) => {
        if (b.turnBrownP !== undefined) {
          interpolateSeasonColor(b.mat.color, matureBarkSeasonColors, currentSeason);
          b.mat.roughness = interpolateSeasonScalar([0.82, 0.82, 0.85, 0.82, 0.92], currentSeason);
        }
      });
    }

    // ── Stage 1 Realistic Oak Seedling Germination & Tiered Growth ──
    const trunkGrowthT = getTrunkGrowthT(progress);
    if (progress < 0.012 || progress >= 0.44) {
      seedlingNode1.scale.set(0.0001, 0.0001, 0.0001);
      seedlingNode2.scale.set(0.0001, 0.0001, 0.0001);
      seedlingApex.scale.set(0.0001, 0.0001, 0.0001);
      seedlingNode1.visible = false;
      seedlingNode2.visible = false;
      seedlingApex.visible = false;
    } else {
      seedlingNode1.visible = true;
      seedlingNode2.visible = true;
      seedlingApex.visible = true;

      // Positionnement botanique : les étages foliaires s'ancrent au tronc au fur et à mesure
      // et restent à leur hauteur d'émergence naturelle au lieu de monter en ascenseur
      const n1T = Math.min(trunkGrowthT, 0.038);
      const n2T = Math.min(trunkGrowthT, 0.080);
      seedlingNode1.position.copy(trunkCurve.getPointAt(n1T));
      seedlingNode2.position.copy(trunkCurve.getPointAt(n2T));
      seedlingApex.position.copy(trunkCurve.getPointAt(trunkGrowthT));

      // Échelle globale d'éclosion du semis et transition douce vers l'arbrisseau de Stage 2
      let seedlingScale = 1.0;
      if (progress < 0.12) {
        const p = (progress - 0.012) / 0.108;
        seedlingScale = p * p * (3 - 2 * p);
      } else if (progress > 0.38) {
        // Fondu organique lorsque les charpentières et les clusters de canopée prennent le relais
        const p = Math.max(0.0001, (0.44 - progress) / 0.06);
        seedlingScale = p * p * (3 - 2 * p);
      }
      seedlingNode1.scale.set(seedlingScale, seedlingScale, seedlingScale);
      seedlingNode2.scale.set(seedlingScale, seedlingScale, seedlingScale);
      seedlingApex.scale.set(seedlingScale, seedlingScale, seedlingScale);

      // Dépliement biologique progressif (éclosion en éventail / débourrement)
      // Paire 1 (inférieure) : débourre de 0.02 à 0.11
      const unfurlP1 = Math.min(1.0, Math.max(0, (progress - 0.02) / 0.09));
      const easeUnfurl1 = unfurlP1 * unfurlP1 * (3 - 2 * unfurlP1);

      // Paire 2 (supérieure) : débourre de 0.05 à 0.15
      const unfurlP2 = Math.min(1.0, Math.max(0, (progress - 0.05) / 0.10));
      const easeUnfurl2 = unfurlP2 * unfurlP2 * (3 - 2 * unfurlP2);

      // Primordia (sommet apical) : s'entrouvre délicatement de 0.08 à 0.18
      const unfurlP3 = Math.min(1.0, Math.max(0, (progress - 0.08) / 0.10));
      const easeUnfurl3 = unfurlP3 * unfurlP3 * (3 - 2 * unfurlP3);

      seedlingLeaves.forEach((sl) => {
        let ease = easeUnfurl1;
        if (sl.pair === 2) ease = easeUnfurl2;
        else if (sl.pair === 3) ease = easeUnfurl3;

        const openAngle = THREE.MathUtils.lerp(0.15, sl.targetAngle, ease);
        const breezePitch = Math.sin(elapsedSec * sl.swaySpeed + sl.phase) * (0.028 + windGust * 0.022);
        const breezeRoll  = Math.cos(elapsedSec * sl.swaySpeed * 0.85 + sl.phase) * (0.016 + windGust * 0.014);

        sl.leafGroup.rotation.x = openAngle + breezePitch;
        sl.leafGroup.rotation.z = breezeRoll;
      });
    }

    // Gland au sol (Acorn) : visible dès le début, puis absorbé par le tronc mature
    if (progress < 0.25) {
      acornGroup.scale.set(1.0, 1.0, 1.0);
      acornGroup.visible = true;
    } else if (progress < 0.42) {
      const p = (0.42 - progress) / 0.17;
      const ease = p * p * (3 - 2 * p);
      const s = Math.max(0.0001, ease);
      acornGroup.scale.set(s, s, s);
      acornGroup.visible = true;
    } else {
      acornGroup.scale.set(0.0001, 0.0001, 0.0001);
      acornGroup.visible = false;
    }

    // ── Dense Canopy Leaves with Organic Progressive Unfurl & Specular Sunlight Flutter ──
    const skipLeafSway = isLowPower && isRevealed && (Math.floor(elapsedSec * 30) % 2 !== 0);
    if (!skipLeafSway) {
      const isAdult = (progress >= 1.0);
      const seasonChanged = Math.abs(currentSeason - lastSeasonForLeaves) > 0.003;
      if (seasonChanged) lastSeasonForLeaves = currentSeason;

      // Calcul global du facteur saisonnier (une seule fois pour toutes les feuilles)
      let baseSeasonScale = 1.0;
      if (currentSeason <= 1.0) {
        baseSeasonScale = THREE.MathUtils.lerp(1.00, 1.03, currentSeason);
      } else if (currentSeason <= 2.0) {
        baseSeasonScale = THREE.MathUtils.lerp(1.03, 1.06, currentSeason - 1.0);
      } else if (currentSeason <= 3.0) {
        baseSeasonScale = THREE.MathUtils.lerp(1.06, 1.00, currentSeason - 2.0);
      }

      // Pré-calcul vectoriel des 24 harmoniques de vent pour toute la canopée (élimine 12 400 calculs trigonométriques CPU par frame)
      const flutterFactor = 0.028 + windGust * 0.035;
      const twistFactor = 0.018 + windGust * 0.022;
      for (let b = 0; b < WIND_BUCKETS; b++) {
        const angle = elapsedSec * windSpeeds[b] + windPhases[b];
        preFlutter[b] = Math.sin(angle) * flutterFactor;
        preTwist[b] = Math.cos(angle * 0.8) * twistFactor;
      }

      leaves.forEach((l) => {
        if (!isAdult && progress < l.leafStartP) {
          if (l.mesh.visible) {
            l.mesh.scale.set(0.0001, 0.0001, 0.0001);
            l.mesh.visible = false;
          }
          return;
        }

        if (!l.mesh.visible) l.mesh.visible = true;

        // Flutter & twist par harmonique vectorielle (0 calcul trigonométrique dans la boucle des 6 200 feuilles)
        const bIdx = (l.windBucket !== undefined) ? l.windBucket : (l.windBucket = Math.floor(Math.random() * WIND_BUCKETS));
        const flutter = preFlutter[bIdx];
        const twist = preTwist[bIdx];

        // Optimisation CPU : En phase adulte sans changement de saison, l'échelle reste inchangée
        // On évite ainsi d'appeler l.mesh.scale.set() 6 200 fois par frame inutilement
        if (!isAdult || seasonChanged || l._needScaleInit) {
          let growScale = 1.0;
          let unfoldProg = 1.0;
          if (!isAdult) {
            const p = Math.min(1.0, (progress - l.leafStartP) / l.leafDuration);
            if (p < 1.0) {
              if (p <= 0.35) {
                const u = p / 0.35;
                const unfurlEase = u * u * (3 - 2 * u);
                growScale = (0.05 + 0.45 * unfurlEase);
                unfoldProg = unfurlEase;
              } else {
                const m = (p - 0.35) / 0.65;
                const matureEase = m * m * (3 - 2 * m);
                growScale = (0.50 + 0.50 * matureEase);
                unfoldProg = 1.0;
              }
            }
          }

          let seasonScale = baseSeasonScale;
          if (currentSeason > 3.0) {
            // Hiver : chute progressive
            if (l.isClinger) {
              const t = Math.min(1.0, (currentSeason - 3.0) / 1.0);
              seasonScale = THREE.MathUtils.lerp(0.95, 0.20, t);
              l.mesh.visible = (seasonScale > 0.25);
            } else if (currentSeason >= l.dropSeasonThreshold) {
              const dropP = Math.min(1.0, (currentSeason - l.dropSeasonThreshold) / 0.18);
              seasonScale = (1.0 - dropP) * 0.95;
              if (dropP >= 0.96) {
                seasonScale = 0.0001;
                l.mesh.visible = false;
              } else {
                l.mesh.visible = true;
              }
            } else {
              seasonScale = THREE.MathUtils.lerp(1.00, 0.95, currentSeason - 3.0);
              l.mesh.visible = true;
            }
          }

          const finalScale = Math.max(0.0001, l.targetScale * growScale * seasonScale);
          l.mesh.scale.set(finalScale, finalScale, finalScale);
          l._unfoldRotOffset = (1.0 - unfoldProg) * l.unfurlAngle;
          l._needScaleInit = false;
        }

        if (!isPotatoTier || !isAdult || !isRevealed) {
          const rotOffset = l._unfoldRotOffset || 0;
          l.mesh.rotation.z = l.origRot.z + flutter + rotOffset * 0.5;
          l.mesh.rotation.x = l.origRot.x + twist + rotOffset;
        }
      });
    }

    // ── Ground Grass Blades Breeze Swaying & Winter Dormancy ──
    // En Hiver (contact) : l'herbe s'enfouit sous l'épais manteau neigeux
    if (!isPotatoTier) {
      const grassWinterFactor = (currentSeason >= 2.8) ? Math.max(0.0001, 1.0 - (currentSeason - 2.8) / 0.95) : 1.0;
      groundBlades.forEach((gb) => {
        gb.mesh.rotation.z = gb.baseRotZ + Math.sin(elapsedSec * gb.swaySpeed + gb.phase) * (0.03 + windGust * 0.025);
        if (gb.baseScaleY) {
          gb.mesh.scale.set(gb.baseScaleXZ * grassWinterFactor, gb.baseScaleY * grassWinterFactor, gb.baseScaleXZ * grassWinterFactor);
        }
      });
    }

    // ── Atmospheric Sunlit Pollen Motes Animation (Spring & Summer) ──
    if (progress >= 0.20) {
      const posAttr = pollenGeo.attributes.position;
      const posArr = posAttr.array;
      for (let i = 0; i < pollenCount; i++) {
        const vel = pollenVels[i];
        posArr[i * 3] += vel.speedX + Math.sin(elapsedSec * 1.2 + vel.phase) * 0.003;
        posArr[i * 3 + 1] += vel.speedY + Math.cos(elapsedSec * 0.9 + vel.phase) * 0.002;

        if (posArr[i * 3] > 4.5) posArr[i * 3] = -4.5;
        if (posArr[i * 3 + 1] > 5.5) posArr[i * 3 + 1] = -3.5;
        if (posArr[i * 3 + 1] < -3.8) posArr[i * 3 + 1] = 5.0;
      }
      posAttr.needsUpdate = true;

      // Atténuation en automne et disparition en hiver
      let pollenSeasonFade = 1.0;
      if (currentSeason >= 2.3) {
        pollenSeasonFade = Math.max(0.0, 1.0 - (currentSeason - 2.3) / 0.7);
      }
      pollenMat.opacity = Math.min(0.75, (progress - 0.20) / 0.40) * pollenSeasonFade;
    } else {
      pollenMat.opacity = 0;
    }

    // ── Winter Snowflakes Animation (Douce chute de neige en Hiver à Contact) ──
    if (currentSeason >= 3.2) {
      const snowFade = Math.min(0.85, (currentSeason - 3.2) / 0.75);
      snowMat.opacity = snowFade;
      if (snowFade > 0.01) {
        const posAttr = snowGeo.attributes.position;
        const posArr = posAttr.array;
        for (let i = 0; i < snowCount; i++) {
          const vel = snowVels[i];
          posArr[i * 3 + 1] -= vel.vy;
          posArr[i * 3]     += vel.vx + Math.sin(elapsedSec * vel.swaySpeed + vel.phase) * vel.swayAmp;

          if (posArr[i * 3 + 1] < -4.3) {
            posArr[i * 3 + 1] = 5.8;
            posArr[i * 3]     = (Math.random() - 0.5) * 14;
          }
        }
        posAttr.needsUpdate = true;
      }
    } else {
      snowMat.opacity = 0.0;
    }

    // ── Ultra-Fluid Continuous Cinematic Camera Choreography ──
    const smoothProg = Math.max(0, Math.min(1.0, progress));
    if (smoothProg >= 0.9999) {
      if (!adultCamPos) {
        adultCamPos = camCurve.getPointAt(1.0);
        adultLookPos = lookCurve.getPointAt(1.0);
      }
      targetCamPos.copy(adultCamPos);
      targetLookPos.copy(adultLookPos);
    } else {
      camCurve.getPointAt(smoothProg, targetCamPos);
      lookCurve.getPointAt(smoothProg, targetLookPos);
    }

    // Amortissement exponentiel doux et fluide (sans saccades ni cassures d'angles)
    camera.position.x += (targetCamPos.x + mouse.x * 0.35 - camera.position.x) * 0.045;
    camera.position.y += (targetCamPos.y - mouse.y * 0.25 - camera.position.y) * 0.045;
    camera.position.z += (targetCamPos.z - camera.position.z) * 0.045;

    currentCamLook.x += (targetLookPos.x + mouse.x * 0.15 - currentCamLook.x) * 0.045;
    currentCamLook.y += (targetLookPos.y - mouse.y * 0.15 - currentCamLook.y) * 0.045;
    currentCamLook.z += (targetLookPos.z - currentCamLook.z) * 0.045;

    camera.lookAt(currentCamLook);



    renderer.render(scene, camera);
  }

  // ── Render Loop Lifecycle: The tree remains visible as the living background across the site ──
  // Pauses WebGL rendering strictly when the tab itself is minimized or hidden in background
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTreeLoop();
    } else {
      startTreeLoop();
    }
  }, { passive: true });

  startTreeLoop();
}
