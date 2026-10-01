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

  // Adaptive Device Detection: Mobile & Low-Power Hardware
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isLowPower = isMobile ||
                     (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                     (navigator.deviceMemory && navigator.deviceMemory <= 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
    precision: isLowPower ? 'mediump' : 'highp'
  });
  renderer.setSize(width, height);

  // Soft PCF Shadow Map (strictly disabled on mobile & low-power devices for huge FPS gain)
  renderer.shadowMap.enabled = !isLowPower;
  if (!isLowPower) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // Adaptive Pixel Ratio: clamp to 1.0 on mobile/low-power (prevents multi-million pixel buffers), max 1.25 on desktop
  const targetPixelRatio = isLowPower ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
  renderer.setPixelRatio(targetPixelRatio);

  // ─── 2. Photorealistic Botanical Lighting & Dappled Shadows ───────────────
  const ambientLight = new THREE.AmbientLight(0xf5faeb, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xe8f5e9, 0x3e2723, 0.65);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffdf0, 1.35);
  sunLight.position.set(14, 24, 18);
  if (!isLowPower) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 65;
    sunLight.shadow.camera.left = -8.5;
    sunLight.shadow.camera.right = 8.5;
    sunLight.shadow.camera.top = 9.0;
    sunLight.shadow.camera.bottom = -5.5;
    sunLight.shadow.bias = -0.0008;
  } else {
    sunLight.castShadow = false;
  }
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xa5d6a7, 0.75);
  rimLight.position.set(-16, 12, -12);
  scene.add(rimLight);

  const mossBounceLight = new THREE.DirectionalLight(0x81c784, 0.35);
  mossBounceLight.position.set(0, -8, 6);
  scene.add(mossBounceLight);

  // ── Seasonal Lighting Configurations [0: Printemps, 1: Été, 2: Automne, 3: Hiver] ──
  const sunSeasonColors = [
    new THREE.Color(0xf6d8a8), // Printemps : lumière dorée douce et chaleureuse (anti-blanchiment)
    new THREE.Color(0xfffdf2), // Été : plein soleil éclatant
    new THREE.Color(0xff9a3c), // Automne : lumière rasante ambrée crépusculaire
    new THREE.Color(0xdceaf8)  // Hiver : lumière froide, pure et limpide
  ];
  const sunSeasonIntensities = [1.10, 1.45, 1.35, 1.10];

  const ambientSeasonColors = [
    new THREE.Color(0x7ea872), // Printemps : ambiance chlorophyllienne douce et contrastée
    new THREE.Color(0xfafef5), // Été
    new THREE.Color(0xffecb8), // Automne
    new THREE.Color(0xd6e5f3)  // Hiver
  ];
  const ambientSeasonIntensities = [0.62, 0.90, 0.80, 0.70];

  const rimSeasonColors = [
    new THREE.Color(0x72c884), // Printemps
    new THREE.Color(0xa5d6a7), // Été
    new THREE.Color(0xffb74d), // Automne
    new THREE.Color(0x90caf9)  // Hiver
  ];
  const rimSeasonIntensities = [0.55, 0.80, 0.90, 0.85];

  const hemiSkySeasonColors = [
    new THREE.Color(0x7fae84),
    new THREE.Color(0xe3f2fd),
    new THREE.Color(0xffe0b2),
    new THREE.Color(0xcfd8dc)
  ];
  const hemiGroundSeasonColors = [
    new THREE.Color(0x281b14),
    new THREE.Color(0x2e1c0c),
    new THREE.Color(0x3e1f0c),
    new THREE.Color(0x263238)
  ];

  const mossBounceSeasonColors = [
    new THREE.Color(0x48964e),
    new THREE.Color(0x66bb6a),
    new THREE.Color(0xbf360c),
    new THREE.Color(0x546e7a)
  ];

  // ─── 3. Dual Procedural Textures: Fresh Young Stem vs Mature Bark ─────────
  // A) Fresh, Clean, Silky Young Shoot Texture (For Stage 1 sprout & young Stage 2 sapling)
  function createYoungStemTexture() {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 256;
    sCanvas.height = 512;
    const sCtx = sCanvas.getContext('2d');

    const sGrad = sCtx.createLinearGradient(0, 0, 256, 0);
    sGrad.addColorStop(0.0, '#52a556');
    sGrad.addColorStop(0.3, '#74c478');
    sGrad.addColorStop(0.5, '#85d289');
    sGrad.addColorStop(0.7, '#74c478');
    sGrad.addColorStop(1.0, '#52a556');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 512);

    sCtx.strokeStyle = 'rgba(215, 255, 185, 0.25)';
    sCtx.lineWidth = 1.2;
    for (let x = 6; x < 256; x += 8) {
      sCtx.beginPath();
      sCtx.moveTo(x + (Math.random() - 0.5) * 3, 0);
      sCtx.lineTo(x + (Math.random() - 0.5) * 3, 512);
      sCtx.stroke();
    }

    const tex = new THREE.CanvasTexture(sCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
  }

  // B) Mature Furrowed Oak Bark Texture (For Stage 3 & 4)
  function createMatureBarkTexture() {
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 512;
    const bCtx = bCanvas.getContext('2d');

    bCtx.fillStyle = '#4a2f1b';
    bCtx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += 3) {
      const ridgeW = 2 + Math.random() * 5;
      const shade = Math.sin(x * 0.08) * 22 + (Math.random() - 0.5) * 25;
      const r = Math.min(255, Math.max(0, 92 + shade));
      const g = Math.min(255, Math.max(0, 62 + shade * 0.75));
      const b = Math.min(255, Math.max(0, 42 + shade * 0.5));
      bCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      bCtx.fillRect(x, 0, ridgeW, 512);
    }

    for (let i = 0; i < 700; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const flen = 15 + Math.random() * 70;
      bCtx.fillStyle = 'rgba(22, 12, 6, 0.48)';
      bCtx.fillRect(fx, fy, 2, flen);
    }

    for (let j = 0; j < 180; j++) {
      const lx = Math.random() * 512;
      const ly = 260 + Math.random() * 252;
      bCtx.fillStyle = 'rgba(155, 185, 135, 0.22)';
      bCtx.beginPath();
      bCtx.arc(lx, ly, 3 + Math.random() * 7, 0, Math.PI * 2);
      bCtx.fill();
    }

    const tex = new THREE.CanvasTexture(bCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  }

  // C) Botanical Leaf Texture with Central Vein & Laterals
  function createProceduralLeafTexture() {
    const lCanvas = document.createElement('canvas');
    lCanvas.width = 256;
    lCanvas.height = 512;
    const lCtx = lCanvas.getContext('2d');

    const grad = lCtx.createLinearGradient(0, 512, 0, 0);
    grad.addColorStop(0.0, '#2e7d32');
    grad.addColorStop(0.5, '#4caf50');
    grad.addColorStop(1.0, '#8bc34a');
    lCtx.fillStyle = grad;
    lCtx.fillRect(0, 0, 256, 512);

    lCtx.strokeStyle = 'rgba(235, 255, 195, 0.85)';
    lCtx.lineWidth = 7;
    lCtx.beginPath();
    lCtx.moveTo(128, 512);
    lCtx.quadraticCurveTo(128, 256, 128, 45);
    lCtx.stroke();

    lCtx.lineWidth = 2.8;
    lCtx.strokeStyle = 'rgba(215, 250, 175, 0.60)';
    for (let y = 470; y > 75; y -= 38) {
      const span = (1.0 - Math.abs(y - 250) / 290) * 82;
      lCtx.beginPath();
      lCtx.moveTo(128, y);
      lCtx.quadraticCurveTo(128 - span * 0.45, y - 24, 128 - span, y - 44);
      lCtx.stroke();
      lCtx.beginPath();
      lCtx.moveTo(128, y);
      lCtx.quadraticCurveTo(128 + span * 0.45, y - 24, 128 + span, y - 44);
      lCtx.stroke();
    }

    const tex = new THREE.CanvasTexture(lCanvas);
    return tex;
  }

  const youngStemTexture = createYoungStemTexture();
  const matureBarkTexture = createMatureBarkTexture();
  const leafTexture = createProceduralLeafTexture();

  // ─── 4. Realistic Botanical Colors & Materials ─────────────────────────────
  const sproutGreenColor = new THREE.Color(0x66bb6a);     // Vibrant fresh seedling shoot
  const youngHazelBarkColor = new THREE.Color(0x825b42);  // Warm satiny hazel sapling bark
  const barkDarkBrownColor = new THREE.Color(0x543628);   // Deep mature oak heartwood

  // Seasonal Interpolation Helpers
  function interpolateSeasonColor(targetColor, palette, seasonVal) {
    const s = Math.max(0, Math.min(3, seasonVal));
    if (s <= 1.0) {
      targetColor.lerpColors(palette[0], palette[1], s);
    } else if (s <= 2.0) {
      targetColor.lerpColors(palette[1], palette[2], s - 1.0);
    } else {
      targetColor.lerpColors(palette[2], palette[3], s - 2.0);
    }
    return targetColor;
  }

  function interpolateSeasonScalar(values, seasonVal) {
    const s = Math.max(0, Math.min(3, seasonVal));
    if (s <= 1.0) {
      return THREE.MathUtils.lerp(values[0], values[1], s);
    } else if (s <= 2.0) {
      return THREE.MathUtils.lerp(values[1], values[2], s - 1.0);
    } else {
      return THREE.MathUtils.lerp(values[2], values[3], s - 2.0);
    }
  }

  // 4 Seasons Leaf Palettes: [0: Printemps, 1: Été, 2: Automne, 3: Hiver]
  const leafSeasonPalettes = [
    // Mat 0: Vert végétal printanier riche -> Émeraude dense -> Orange flamboyant -> Brun fané
    [new THREE.Color(0x388224), new THREE.Color(0x2e702c), new THREE.Color(0xe65100), new THREE.Color(0x6d5747)],
    // Mat 1: Vert prairie profond -> Pin forestier -> Écarlate carmin -> Chêne séché
    [new THREE.Color(0x2d681c), new THREE.Color(0x164a18), new THREE.Color(0xc62828), new THREE.Color(0x7d6c5d)],
    // Mat 2: Vert tendre soutenu -> Émeraude noble -> Ambre doré -> Sombre automnal
    [new THREE.Color(0x429424), new THREE.Color(0x2c6b2a), new THREE.Color(0xf57f17), new THREE.Color(0x5c493c)],
    // Mat 3: Feuillage chêne jeune vigoureux -> Vert chêne riche -> Orange brûlé -> Brun-gris
    [new THREE.Color(0x327820), new THREE.Color(0x1c521a), new THREE.Color(0xd84315), new THREE.Color(0x8c7c6e)],
    // Mat 4: Vert chlorophyllien printanier -> Vert d'été mature -> Or éclatant -> Reste d'hiver
    [new THREE.Color(0x488e28), new THREE.Color(0x2a6828), new THREE.Color(0xff8f00), new THREE.Color(0x4f4035)],
    // Mat 5: Vert feuille jeune dense -> Chêne moyen -> Vermillon ardent -> Brun givré
    [new THREE.Color(0x448a22), new THREE.Color(0x32752e), new THREE.Color(0xbf360c), new THREE.Color(0x948a82)],
    // Mat 6: Canopée printanière profonde -> Vert intense sous-bois -> Cuivre chaud -> Brun dormant
    [new THREE.Color(0x245e1a), new THREE.Color(0x184816), new THREE.Color(0x8d5b28), new THREE.Color(0x736356)]
  ];

  const matureBarkSeasonColors = [
    new THREE.Color(0x382318), // Printemps : écorce chêne brun profond contrastée
    new THREE.Color(0x4a2f1b), // Été : chêne profond
    new THREE.Color(0x60341c), // Automne : chêne ambré flamboyant
    new THREE.Color(0x463f3a)  // Hiver : écorce ardoise patinée par le givre
  ];

  const leafMaterials = leafSeasonPalettes.map(palette => new THREE.MeshStandardMaterial({
    color: palette[0].clone(),
    map: leafTexture,
    roughness: 0.55,
    metalness: 0.02,
    side: THREE.DoubleSide
  }));

  // 3D Folded Botanical Leaf Geometry with central spine V-crease
  function createFoldedLeafGeometry() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uvs = [];
    const indices = [];

    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const v = i / steps;
      const y = v * 1.25;
      const widthFactor = Math.sin(v * Math.PI);
      const w = widthFactor * 0.36;
      const droop = -Math.sin(v * Math.PI * 0.85) * 0.08;

      pos.push(0, y, droop);
      uvs.push(0.5, v);

      pos.push(-w, y, droop + 0.06 * widthFactor);
      uvs.push(0.0, v);

      pos.push(w, y, droop + 0.06 * widthFactor);
      uvs.push(1.0, v);
    }

    for (let i = 0; i < steps; i++) {
      const rowA = i * 3;
      const rowB = (i + 1) * 3;
      indices.push(rowA, rowA + 1, rowB);
      indices.push(rowA + 1, rowB + 1, rowB);
      indices.push(rowA, rowB, rowA + 2);
      indices.push(rowA + 2, rowB, rowB + 2);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const leafGeo = createFoldedLeafGeometry();

  // ─── 5. Scene Hierarchy & Ground Biome ─────────────────────────────────────
  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  // ─── Mossy Ground Mound with Organic Undulating Falloff into Background ───
  // Texture neutre en luminance avec dégradé d'alpha organique pour teinter vivement le sol par saison
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 512;
  groundCanvas.height = 512;
  const gCtx = groundCanvas.getContext('2d');
  gCtx.clearRect(0, 0, 512, 512);

  // 1) Lobe principal au centre (monticule avec luminance neutre et chute d'alpha progressive)
  const mainGrad = gCtx.createRadialGradient(256, 256, 12, 256, 256, 235);
  mainGrad.addColorStop(0.00, 'rgba(255, 255, 255, 0.98)');
  mainGrad.addColorStop(0.25, 'rgba(242, 242, 242, 0.90)');
  mainGrad.addColorStop(0.48, 'rgba(220, 220, 220, 0.72)');
  mainGrad.addColorStop(0.68, 'rgba(180, 180, 180, 0.45)');
  mainGrad.addColorStop(0.84, 'rgba(140, 140, 140, 0.18)');
  mainGrad.addColorStop(0.92, 'rgba(80, 80, 80, 0.05)');
  mainGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');

  gCtx.fillStyle = mainGrad;
  gCtx.beginPath();
  gCtx.arc(256, 256, 238, 0, Math.PI * 2);
  gCtx.fill();

  // 2) Lobes organiques secondaires décentrés pour briser toute géométrie circulaire artificielle
  const groundLobes = [
    { cx: 290, cy: 230, r: 175, alpha: 0.38 },
    { cx: 220, cy: 285, r: 180, alpha: 0.35 },
    { cx: 280, cy: 295, r: 165, alpha: 0.30 },
    { cx: 225, cy: 220, r: 170, alpha: 0.32 },
    { cx: 310, cy: 265, r: 155, alpha: 0.28 },
    { cx: 200, cy: 255, r: 160, alpha: 0.30 }
  ];

  groundLobes.forEach(({ cx, cy, r, alpha }) => {
    const lobeGrad = gCtx.createRadialGradient(cx, cy, 10, cx, cy, r);
    lobeGrad.addColorStop(0.00, `rgba(240, 240, 240, ${alpha})`);
    lobeGrad.addColorStop(0.55, `rgba(190, 190, 190, ${alpha * 0.45})`);
    lobeGrad.addColorStop(0.82, `rgba(130, 130, 130, ${alpha * 0.15})`);
    lobeGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0.00)');

    gCtx.fillStyle = lobeGrad;
    gCtx.beginPath();
    gCtx.arc(cx, cy, r, 0, Math.PI * 2);
    gCtx.fill();
  });

  // 3) Micro-détails botaniques d'humus et mottes de mousse dans le dôme central
  for (let i = 0; i < 350; i++) {
    const a = Math.random() * Math.PI * 2;
    const dist = Math.pow(Math.random(), 1.6) * 160;
    const px = 256 + Math.cos(a) * dist;
    const py = 256 + Math.sin(a) * dist;
    const sz = 1.0 + Math.random() * 2.5;
    const isHighlight = Math.random() > 0.45;
    gCtx.fillStyle = isHighlight
      ? `rgba(255, 255, 255, ${0.12 + Math.random() * 0.16})`
      : `rgba(0, 0, 0, ${0.15 + Math.random() * 0.20})`;
    gCtx.beginPath();
    gCtx.arc(px, py, sz, 0, Math.PI * 2);
    gCtx.fill();
  }

  const groundTexture = new THREE.CanvasTexture(groundCanvas);
  groundTexture.wrapS = THREE.ClampToEdgeWrapping;
  groundTexture.wrapT = THREE.ClampToEdgeWrapping;
  groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
  groundTexture.magFilter = THREE.LinearFilter;

  // Couleurs franches et immersives pour le sol par saison :
  const groundSeasonColors = [
    new THREE.Color(0x38782a), // Printemps : vert mousse frais & fertile
    new THREE.Color(0x1a4515), // Été : humus forestier profond et vert sombre
    new THREE.Color(0xa2531a), // Automne : terre chaude ambrée, tapis de feuilles fauves et cuivrées
    new THREE.Color(0xdce9f5)  // Hiver : dôme de neige fraîche et givre blanc immaculé
  ];

  const groundMat = new THREE.MeshStandardMaterial({
    color: groundSeasonColors[0].clone(),
    map: groundTexture,
    transparent: true,
    depthWrite: false,
    roughness: 0.95,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  // Plan élargi (18x18m) assurant que les bordures dégradées s'étendent amplement avec une transition douce
  const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), groundMat);
  groundPlane.rotation.x = -Math.PI * 0.5;
  groundPlane.position.set(0, -4.41, 0);
  groundPlane.receiveShadow = true;
  treeGroup.add(groundPlane);

  // Ground Flora: Grass, Moss, Clovers, Flowers & Fallen Leaves
  const groundBlades = [];
  const seasonalFloraGroups = [];
  const grassGeo = new THREE.ConeGeometry(0.06, 0.44, 4);
  grassGeo.translate(0, 0.22, 0);

  // Palettes saisonnières dédiées aux brins d'herbe :
  const grassSeasonPalettes = [
    [new THREE.Color(0x6ec040), new THREE.Color(0x2e7d32), new THREE.Color(0xd87a22), new THREE.Color(0xb4c8d8)],
    [new THREE.Color(0x5cb838), new THREE.Color(0x1b5e20), new THREE.Color(0xc46b18), new THREE.Color(0xc2d4e2)],
    [new THREE.Color(0x8ee055), new THREE.Color(0x388e3c), new THREE.Color(0xe6922a), new THREE.Color(0xd0e0ee)],
    [new THREE.Color(0x4fa632), new THREE.Color(0x256b24), new THREE.Color(0xb05a14), new THREE.Color(0xa8bccb)]
  ];

  const grassMaterials = grassSeasonPalettes.map(p => new THREE.MeshStandardMaterial({
    color: p[0].clone(),
    roughness: 0.55,
    metalness: 0.05
  }));

  const grassBladeCount = isLowPower ? 40 : 95;
  for (let i = 0; i < grassBladeCount; i++) {
    const grassMat = grassMaterials[i % grassMaterials.length];
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.castShadow = false;
    grass.receiveShadow = false;

    const clusterAngle = (i % 12) * (Math.PI * 2 / 12) + (Math.random() - 0.5) * 0.4;
    const rad = 0.25 + Math.pow(Math.random(), 1.5) * 2.6;
    const hScale = 0.6 + Math.random() * 0.9;
    const wScale = 0.7 + Math.random() * 0.6;

    // Atténuation délicate de la flore vers les bords pour accompagner le fondu du sol
    const distFade = rad < 1.0 ? 1.0 : Math.max(0.35, 1.0 - (rad - 1.0) / 1.85);

    grass.position.set(Math.cos(clusterAngle) * rad, -4.41, Math.sin(clusterAngle) * rad);
    grass.scale.set(wScale * distFade, hScale * distFade, wScale * distFade);

    const tilt = 0.15 + Math.random() * 0.35;
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
      swaySpeed: 1.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Moss Cushions
  const mossGeo = new THREE.SphereGeometry(1, 8, 8);
  const mossSeasonPalettes = [
    [new THREE.Color(0x43a047), new THREE.Color(0x2e7d32), new THREE.Color(0xb86420), new THREE.Color(0xc0d2e2)],
    [new THREE.Color(0x689f38), new THREE.Color(0x388e3c), new THREE.Color(0xa25418), new THREE.Color(0xb0c4d6)],
    [new THREE.Color(0x558b2f), new THREE.Color(0x1b5e20), new THREE.Color(0xcf7626), new THREE.Color(0xd2e2ee)],
    [new THREE.Color(0x7cb342), new THREE.Color(0x256b24), new THREE.Color(0x8e4614), new THREE.Color(0xa4bad0)]
  ];

  const mossMats = [
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[0][0].clone(), roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[1][0].clone(), roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[2][0].clone(), roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: mossSeasonPalettes[3][0].clone(), roughness: 0.95 })
  ];

  for (let m = 0; m < 14; m++) {
    const mMat = mossMats[m % mossMats.length];
    const moss = new THREE.Mesh(mossGeo, mMat);
    moss.receiveShadow = false;
    const mAngle = (m / 14) * Math.PI * 2 + Math.random() * 0.3;
    const mRad = 0.35 + Math.random() * 1.8;
    const sX = 0.22 + Math.random() * 0.28;
    const sY = 0.08 + Math.random() * 0.10;
    const sZ = 0.22 + Math.random() * 0.28;

    moss.position.set(Math.cos(mAngle) * mRad, -4.41 + sY * 0.5, Math.sin(mAngle) * mRad);
    moss.scale.set(sX, sY, sZ);
    treeGroup.add(moss);
  }

  // Tapis de feuilles mortes d'automne éparpillées au sol
  const fallenLeaves = [];
  const fallenCount = isLowPower ? 18 : 36;
  const fallenSeasonPalettes = [
    [new THREE.Color(0x6ec040), new THREE.Color(0x388e3c), new THREE.Color(0xe65100), new THREE.Color(0x5c493c)],
    [new THREE.Color(0x5cb838), new THREE.Color(0x2e7d32), new THREE.Color(0xc62828), new THREE.Color(0x4f4035)],
    [new THREE.Color(0x8ee055), new THREE.Color(0x4caf50), new THREE.Color(0xf57f17), new THREE.Color(0x6d5747)],
    [new THREE.Color(0x9ae660), new THREE.Color(0x43a047), new THREE.Color(0xd84315), new THREE.Color(0x44362d)]
  ];
  const fallenMats = fallenSeasonPalettes.map(p => new THREE.MeshStandardMaterial({
    color: p[0].clone(),
    map: leafTexture,
    roughness: 0.70,
    side: THREE.DoubleSide
  }));

  for (let i = 0; i < fallenCount; i++) {
    const fMat = fallenMats[i % fallenMats.length];
    const fMesh = new THREE.Mesh(leafGeo, fMat);
    const angle = Math.random() * Math.PI * 2;
    const rad = 0.35 + Math.pow(Math.random(), 1.2) * 2.2;
    fMesh.position.set(Math.cos(angle) * rad, -4.395, Math.sin(angle) * rad);
    fMesh.rotation.set(-Math.PI * 0.5 + (Math.random() - 0.5) * 0.2, 0, Math.random() * Math.PI * 2);
    fMesh.scale.set(0.0001, 0.0001, 0.0001);
    treeGroup.add(fMesh);
    fallenLeaves.push({
      mesh: fMesh,
      baseScale: 0.28 + Math.random() * 0.14
    });
  }

  // Clovers
  for (let c = 0; c < 8; c++) {
    const cloverGroup = new THREE.Group();
    const cAngle = Math.random() * Math.PI * 2;
    const cRad = 0.6 + Math.random() * 1.6;
    cloverGroup.position.set(Math.cos(cAngle) * cRad, -4.40, Math.sin(cAngle) * cRad);

    const cMat = leafMaterials[(c * 2) % leafMaterials.length];
    for (let k = 0; k < 3; k++) {
      const leaflet = new THREE.Mesh(leafGeo, cMat);
      leaflet.castShadow = false;
      leaflet.receiveShadow = false;
      leaflet.rotation.set(Math.PI * 0.45, 0, (k * Math.PI * 2) / 3);
      leaflet.scale.set(0.12, 0.12, 0.12);
      cloverGroup.add(leaflet);
    }
    treeGroup.add(cloverGroup);
    seasonalFloraGroups.push(cloverGroup);
  }

  // Wildflowers
  const petalGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.5 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4 });

  for (let f = 0; f < 7; f++) {
    const flowerGroup = new THREE.Group();
    const fAngle = Math.random() * Math.PI * 2;
    const fRad = 0.7 + Math.random() * 1.5;
    flowerGroup.position.set(Math.cos(fAngle) * fRad, -4.38, Math.sin(fAngle) * fRad);

    const center = new THREE.Mesh(petalGeo, centerMat);
    center.scale.set(1.1, 0.8, 1.1);
    center.castShadow = false;
    flowerGroup.add(center);

    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const pAngle = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(pAngle) * 0.07, 0, Math.sin(pAngle) * 0.07);
      petal.scale.set(1.3, 0.4, 0.9);
      petal.castShadow = false;
      flowerGroup.add(petal);
    }
    treeGroup.add(flowerGroup);
    seasonalFloraGroups.push(flowerGroup);
  }

  // Mushrooms
  const capGeo = new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.16, 6);
  const shroomCapMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.35 });
  const shroomStemMat = new THREE.MeshStandardMaterial({ color: 0xfff8e1, roughness: 0.6 });

  const shroomPositions = [
    new THREE.Vector3(0.55, -4.38, 0.45),
    new THREE.Vector3(0.68, -4.40, 0.38),
    new THREE.Vector3(-0.62, -4.38, -0.40),
    new THREE.Vector3(-0.75, -4.40, -0.32)
  ];

  shroomPositions.forEach((pos, idx) => {
    const shroom = new THREE.Group();
    shroom.position.copy(pos);
    const scale = idx % 2 === 0 ? 0.9 : 0.6;
    shroom.scale.set(scale, scale, scale);

    const stem = new THREE.Mesh(stemGeo, shroomStemMat);
    stem.position.y = 0.08;
    stem.castShadow = false;
    shroom.add(stem);

    const cap = new THREE.Mesh(capGeo, shroomCapMat);
    cap.position.y = 0.16;
    cap.castShadow = false;
    shroom.add(cap);

    shroom.rotation.z = (Math.random() - 0.5) * 0.3;
    treeGroup.add(shroom);
  });

  // ─── 6. Anatomical Root Buttresses (Develops in Stages 2, 3, 4 only) ───────
  const rootButtresses = [];
  const rootAngles = [0.2, 1.45, 2.7, 4.0, 5.25];
  const rootGeo = new THREE.ConeGeometry(0.16, 1.15, 7);
  rootGeo.translate(0, 0.55, 0);

  rootAngles.forEach((angle) => {
    const rMat = new THREE.MeshStandardMaterial({
      color: youngHazelBarkColor.clone(),
      map: matureBarkTexture,
      roughness: 0.85,
      metalness: 0.05
    });
    const rootMesh = new THREE.Mesh(rootGeo, rMat);
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;

    rootMesh.position.set(Math.cos(angle) * 0.12, -4.38, Math.sin(angle) * 0.12);
    rootMesh.rotation.set(
      Math.sin(angle) * 0.65,
      angle + Math.PI * 0.5,
      -Math.cos(angle) * 0.65
    );
    rootMesh.scale.set(0.0001, 0.0001, 0.0001);
    treeGroup.add(rootMesh);

    rootButtresses.push({ mesh: rootMesh, mat: rMat, angle });
  });

  // ─── 7. Sculptural Botanical Trunk S-Curve Nodes (12 Continuous Nodes) ────
  // Graceful organic S-line: emergent seedling lean curving into balanced oak spine
  const trunkNodes = [
    new THREE.Vector3(0.00, -4.40, 0.00),  // 0 Ground root base
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
  const TRUNK_RINGS = 64;
  const TRUNK_RADIAL = 18;
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

  // Precomputed trigonometric tables for the 18 radial segments
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
    metalness: 0.04
  });

  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  trunkMesh.frustumCulled = false; // Ne jamais masquer le tronc lors des déplacements caméra
  treeGroup.add(trunkMesh);
  trunkMesh.isTextureMatured = false;

  function getTrunkGrowthT(prog) {
    if (prog <= 0.0) return 0.005;
    if (prog <= 0.25) {
      // Stage 1 (0 -> 25%) : Germination naturelle, la jeune tige verte émerge
      // et atteint une taille de jeune pousse réaliste et délicate (~75 cm, t = 0.11)
      const u = prog / 0.25;
      const ease = u * u * (3 - 2 * u);
      return 0.005 + 0.105 * ease;
    }
    if (prog <= 0.38) {
      // Stage 2 (25% -> 38%) : Élongation de l'arbrisseau vers la fourche latérale (Node 5, t = 0.382)
      const u = (prog - 0.25) / 0.13;
      const ease = u * u * (3 - 2 * u);
      return 0.110 + (0.382 - 0.110) * ease;
    }
    if (prog <= 0.60) {
      // Stage 3 (38% -> 60%) : Croissance jusqu'à la fourche médiane (Node 7, t = 0.600)
      const u = (prog - 0.38) / 0.22;
      const ease = u * u * (3 - 2 * u);
      return 0.382 + (0.600 - 0.382) * ease;
    }
    if (prog <= 0.84) {
      // Stage 4 (60% -> 84%) : Tronc supérieur jusqu'à la cime (Node 11, t = 1.0)
      const u = (prog - 0.60) / 0.24;
      const ease = u * u * (3 - 2 * u);
      return 0.600 + 0.400 * ease;
    }
    return 1.0;
  }

  function getTrunkBaseRadius(t, prog) {
    const baseR = 0.60 - t * 0.44;
    // Les contreforts racinaires massifs n'apparaissent qu'avec la maturité (prog > 0.35)
    const maturity = Math.max(0, Math.min(1.0, (prog - 0.35) / 0.50));
    const flare = (t < 0.08) ? Math.pow((0.08 - t) / 0.08, 2) * 0.12 * maturity : 0.0;
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
        const angle = (j / TRUNK_RADIAL) * Math.PI * 2;

        const fluting = 1.0 + 0.032 * Math.sin(angle * 4.0 + t * 12.0) + 0.018 * Math.cos(angle * 2.0 - t * 6.0);
        const r = ringRadius * fluting;

        posArr[ptr++] = tempCenter.x + r * (N.x * cosVal + B.x * sinVal);
        posArr[ptr++] = tempCenter.y + r * (N.y * cosVal + B.y * sinVal);
        posArr[ptr++] = tempCenter.z + r * (N.z * cosVal + B.z * sinVal);

        uvArr[uvPtr++] = (j / TRUNK_RADIAL) * 2.0;
        uvArr[uvPtr++] = t * 4.0;
      }
    }

    // Sommet central calotte basse (racine)
    const basePt = samplePoints[0];
    posArr[ptr++] = basePt.x;
    posArr[ptr++] = basePt.y - 0.02;
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
    uvArr[uvPtr++] = targetT * 4.0;

    trunkGeo.computeVertexNormals();

    // Protection absolue contre les valeurs NaN dans les normales
    const nArray = trunkGeo.attributes.normal.array;
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
        trunkMat.needsUpdate = true;
        trunkMesh.isTextureMatured = false;
      }
    } else if (prog < 0.50) {
      const hazelP = (prog - 0.25) / 0.25;
      trunkMat.color.lerpColors(sproutGreenColor, youngHazelBarkColor, Math.min(1.0, hazelP * 1.3));
      trunkMat.roughness = THREE.MathUtils.lerp(0.35, 0.58, hazelP);
    } else {
      const brownP = Math.min(1.0, (prog - 0.50) / 0.25);
      trunkMat.color.lerpColors(youngHazelBarkColor, barkDarkBrownColor, brownP);
      trunkMat.roughness = THREE.MathUtils.lerp(0.58, 0.85, brownP);

      if (!trunkMesh.isTextureMatured && prog >= 0.52) {
        trunkMat.map = matureBarkTexture;
        trunkMat.needsUpdate = true;
        trunkMesh.isTextureMatured = true;
      }

      if (prog >= 1.0 && isRevealed) {
        interpolateSeasonColor(trunkMat.color, matureBarkSeasonColors, currentSeason);
        trunkMat.roughness = interpolateSeasonScalar([0.75, 0.85, 0.82, 0.92], currentSeason);
      }
    }
  }

  // ─── 8. Lateral Bough and Twig Engine ─────────────────────────────────────
  const branches = [];
  const leaves = [];
  const twigTipGeo = new THREE.SphereGeometry(1, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);

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
    const geo = new THREE.CylinderGeometry(rEnd, rStart, len + overlap, 12, 1, true);
    geo.translate(0, (len + overlap) * 0.5 - overlap, 0);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: sproutGreenColor.clone(),
      map: (stage <= 2) ? youngStemTexture : matureBarkTexture,
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
  acornGroup.position.set(0.11, -4.37, 0.08);
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

  // ─── 10. Stage 2 Primary Lateral Boughs (Emerge only when trunk reaches node 5 at 0.38) ───
  const bL_nodes = [
    trunkNodes[5],
    new THREE.Vector3(-0.8, -1.1, 0.3),
    new THREE.Vector3(-1.7, -0.4, 0.5),
    new THREE.Vector3(-2.6, 0.6, 0.7),
    new THREE.Vector3(-3.6, 1.8, 0.5)
  ];
  const bL_rad = [0.32, 0.26, 0.20, 0.15, 0.09];

  createBranch({ start: bL_nodes[0], end: bL_nodes[1], rStart: bL_rad[0], rEnd: bL_rad[1], startP: 0.38, endP: 0.45, turnBrownP: 0.48, stage: 2, hasTipCap: false });
  createBranch({ start: bL_nodes[1], end: bL_nodes[2], rStart: bL_rad[1], rEnd: bL_rad[2], startP: 0.44, endP: 0.50, turnBrownP: 0.54, stage: 2, hasTipCap: false });
  createBranch({ start: bL_nodes[2], end: bL_nodes[3], rStart: bL_rad[2], rEnd: bL_rad[3], startP: 0.51, endP: 0.62, turnBrownP: 0.64, stage: 3, hasTipCap: false });
  createBranch({ start: bL_nodes[3], end: bL_nodes[4], rStart: bL_rad[3], rEnd: bL_rad[4], startP: 0.61, endP: 0.72, turnBrownP: 0.72, stage: 3, hasTipCap: false });

  const bR_nodes = [
    trunkNodes[5],
    new THREE.Vector3(0.9, -1.0, -0.2),
    new THREE.Vector3(2.0, -0.2, -0.4),
    new THREE.Vector3(3.2, 0.8, -0.5),
    new THREE.Vector3(4.3, 1.8, -0.2),
    new THREE.Vector3(5.1, 2.7, 0.1)
  ];
  const bR_rad = [0.34, 0.28, 0.22, 0.16, 0.11, 0.06];

  createBranch({ start: bR_nodes[0], end: bR_nodes[1], rStart: bR_rad[0], rEnd: bR_rad[1], startP: 0.38, endP: 0.45, turnBrownP: 0.48, stage: 2, hasTipCap: false });
  createBranch({ start: bR_nodes[1], end: bR_nodes[2], rStart: bR_rad[1], rEnd: bR_rad[2], startP: 0.44, endP: 0.50, turnBrownP: 0.54, stage: 2, hasTipCap: false });
  createBranch({ start: bR_nodes[2], end: bR_nodes[3], rStart: bR_rad[2], rEnd: bR_rad[3], startP: 0.51, endP: 0.62, turnBrownP: 0.64, stage: 3, hasTipCap: false });
  createBranch({ start: bR_nodes[3], end: bR_nodes[4], rStart: bR_rad[3], rEnd: bR_rad[4], startP: 0.61, endP: 0.72, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bR_nodes[4], end: bR_nodes[5], rStart: bR_rad[4], rEnd: bR_rad[5], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  // ─── 11. Stage 3 Mid-Level Front & Back Boughs (Emerge only when trunk reaches node 7 at 0.60) ───
  const bF_nodes = [
    trunkNodes[7],
    new THREE.Vector3(0.6, 0.4, 1.0),
    new THREE.Vector3(1.2, 1.2, 1.8),
    new THREE.Vector3(1.7, 2.1, 2.5)
  ];
  const bF_rad = [0.26, 0.20, 0.14, 0.08];
  createBranch({ start: bF_nodes[0], end: bF_nodes[1], rStart: bF_rad[0], rEnd: bF_rad[1], startP: 0.60, endP: 0.68, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bF_nodes[1], end: bF_nodes[2], rStart: bF_rad[1], rEnd: bF_rad[2], startP: 0.67, endP: 0.74, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bF_nodes[2], end: bF_nodes[3], rStart: bF_rad[2], rEnd: bF_rad[3], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  const bB_nodes = [
    trunkNodes[7],
    new THREE.Vector3(-0.6, 0.5, -0.9),
    new THREE.Vector3(-1.2, 1.3, -1.7),
    new THREE.Vector3(-1.7, 2.2, -2.4)
  ];
  const bB_rad = [0.26, 0.20, 0.14, 0.08];
  createBranch({ start: bB_nodes[0], end: bB_nodes[1], rStart: bB_rad[0], rEnd: bB_rad[1], startP: 0.60, endP: 0.68, turnBrownP: 0.66, stage: 3, hasTipCap: false });
  createBranch({ start: bB_nodes[1], end: bB_nodes[2], rStart: bB_rad[1], rEnd: bB_rad[2], startP: 0.67, endP: 0.74, turnBrownP: 0.72, stage: 3, hasTipCap: false });
  createBranch({ start: bB_nodes[2], end: bB_nodes[3], rStart: bB_rad[2], rEnd: bB_rad[3], startP: 0.76, endP: 0.88, turnBrownP: 0.86, stage: 4, hasTipCap: false });

  // ─── 12. Stage 4 Crown Limbs (Emerge only when trunk reaches node 11 at 0.84) ───
  const bTop1_end = new THREE.Vector3(-0.7, 4.0, 0.2);
  const bTop2_end = new THREE.Vector3(0.9, 4.2, -0.3);
  const bTopCrown_end = new THREE.Vector3(0.2, 4.8, 0.0);

  createBranch({ start: trunkNodes[11], end: bTop1_end, rStart: 0.18, rEnd: 0.10, startP: 0.84, endP: 0.92, turnBrownP: 0.88, stage: 4, hasTipCap: false });
  createBranch({ start: trunkNodes[11], end: bTop2_end, rStart: 0.18, rEnd: 0.10, startP: 0.84, endP: 0.92, turnBrownP: 0.88, stage: 4, hasTipCap: false });
  createBranch({ start: trunkNodes[11], end: bTopCrown_end, rStart: 0.18, rEnd: 0.09, startP: 0.85, endP: 0.93, turnBrownP: 0.88, stage: 4, hasTipCap: false });

  // ─── 13. Delicate Terminal Twigs (Synchronized strictly with parent nodes) ───
  const twigs = [
    // Stage 3 twigs (emerge after bL[2] and bR[2] reach full length at 0.50)
    [bL_nodes[2], new THREE.Vector3(-2.2, 0.0, 0.9), 0.52, 0.66, 3],
    [bR_nodes[2], new THREE.Vector3(2.6, 0.4, 0.6), 0.52, 0.66, 3],
    [bF_nodes[1], new THREE.Vector3(0.6, 1.9, 2.1), 0.68, 0.75, 3],
    [bB_nodes[1], new THREE.Vector3(-1.7, 1.9, -1.2), 0.68, 0.75, 3],

    // Stage 4 outer twigs
    [bL_nodes[3], new THREE.Vector3(-3.2, 1.2, 1.2), 0.75, 0.86, 4],
    [bL_nodes[4], new THREE.Vector3(-4.4, 2.6, 0.6), 0.78, 0.89, 4],
    [bR_nodes[3], new THREE.Vector3(3.8, 1.4, -1.0), 0.75, 0.86, 4],
    [bR_nodes[4], new THREE.Vector3(4.8, 2.6, -0.7), 0.78, 0.90, 4],
    [bR_nodes[5], new THREE.Vector3(5.7, 3.3, 0.2), 0.88, 0.95, 4],
    [bF_nodes[2], new THREE.Vector3(2.3, 2.8, 2.8), 0.80, 0.92, 4],
    [bB_nodes[2], new THREE.Vector3(-2.3, 3.0, -2.7), 0.80, 0.92, 4],
    [bTop1_end, new THREE.Vector3(-1.4, 4.7, 0.7), 0.92, 0.97, 4],
    [bTop1_end, new THREE.Vector3(-0.3, 5.0, -0.5), 0.92, 0.97, 4],
    [bTop2_end, new THREE.Vector3(1.6, 4.9, 0.3), 0.92, 0.97, 4],
    [bTop2_end, new THREE.Vector3(0.5, 5.1, -1.0), 0.92, 0.97, 4],
    [bTopCrown_end, new THREE.Vector3(-0.5, 5.5, 0.3), 0.93, 0.98, 4],
    [bTopCrown_end, new THREE.Vector3(0.6, 5.6, -0.4), 0.93, 0.98, 4]
  ];

  twigs.forEach(([start, end, startP, endP, stage]) => {
    createBranch({
      start, end, rStart: 0.08, rEnd: 0.03,
      startP, endP, turnBrownP: 0.88,
      stage, hasTipCap: true
    });
  });

  // ─── 14. High-Density Foliage Canopy Structured by Stage ──────────────────
  function addCanopyCluster(center, count, radiusX, radiusY, radiusZ, bloomStartP, bloomEndP, stage = 4) {
    const clusterSpan = Math.max(0.04, bloomEndP - bloomStartP);
    const clusterCount = isLowPower ? Math.max(10, Math.round(count * 0.45)) : count;
    const leafScaleMult = isLowPower ? 1.35 : 1.0;

    for (let i = 0; i < clusterCount; i++) {
      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
      const leaf = new THREE.Mesh(leafGeo, mat);
      // Leaves do not need individual shadow passes, saves 800+ depth renders per frame
      leaf.castShadow = false;
      leaf.receiveShadow = false;

      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random());

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta) * radiusX;
      const y = r * sinPhi * Math.sin(theta) * radiusY;
      const z = r * Math.cos(phi) * radiusZ;

      leaf.position.set(center.x + x, center.y + y, center.z + z);
      leaf.rotation.set(
        Math.random() * Math.PI * 0.8 - 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 0.8 - 0.4
      );

      const baseScale = (0.55 + Math.random() * 0.4) * leafScaleMult;
      leaf.scale.set(0.0001, 0.0001, 0.0001);
      treeGroup.add(leaf);

      // Échelonnement individuel et organique de chaque feuille dans l'intervalle du cluster
      // pour éviter tout effet de bloc ou d'apparition soudaine en masse
      const staggerFraction = (i + Math.random() * 0.5) / (clusterCount + 0.5);
      const leafStartP = bloomStartP + staggerFraction * clusterSpan * 0.65;
      const leafDuration = 0.08 + Math.random() * 0.04;

      leaves.push({
        mesh: leaf,
        targetScale: baseScale,
        leafStartP,
        leafDuration,
        bloomStartP,
        bloomEndP,
        stage,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.6 + Math.random() * 2.0,
        origRot: leaf.rotation.clone(),
        unfurlAngle: (Math.random() * 0.35 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
        dropSeasonThreshold: 2.15 + Math.random() * 0.75,
        isClinger: Math.random() < 0.05
      });
    }
  }

  // Stage 2 Foliage: Blooms cleanly between 0.42 and 0.54 (in sync with sapling boughs)
  addCanopyCluster(bL_nodes[2], 26, 0.7, 0.6, 0.7, 0.42, 0.52, 2);
  addCanopyCluster(bR_nodes[2], 28, 0.7, 0.6, 0.7, 0.42, 0.52, 2);
  addCanopyCluster(trunkNodes[5], 24, 0.6, 0.5, 0.6, 0.40, 0.50, 2);
  addCanopyCluster(trunkNodes[6], 26, 0.7, 0.6, 0.7, 0.44, 0.54, 2);

  // Stage 3 Foliage: Rich Mid-Tier Canopy Volumes (0.56 -> 0.76)
  addCanopyCluster(bL_nodes[3], 45, 1.2, 1.0, 1.2, 0.56, 0.72, 3);
  addCanopyCluster(bL_nodes[4], 50, 1.3, 1.1, 1.3, 0.60, 0.75, 3);
  addCanopyCluster(bR_nodes[3], 55, 1.3, 1.1, 1.3, 0.56, 0.72, 3);
  addCanopyCluster(bF_nodes[1], 35, 1.0, 0.8, 1.0, 0.64, 0.76, 3);
  addCanopyCluster(bB_nodes[1], 35, 1.0, 0.8, 1.0, 0.64, 0.76, 3);
  addCanopyCluster(new THREE.Vector3(0.0, 1.8, 0.0), 50, 1.4, 1.2, 1.4, 0.58, 0.74, 3);
  addCanopyCluster(new THREE.Vector3(1.5, 2.2, 0.2), 45, 1.3, 1.1, 1.3, 0.60, 0.75, 3);
  addCanopyCluster(new THREE.Vector3(-1.2, 2.0, -0.3), 45, 1.3, 1.1, 1.3, 0.60, 0.75, 3);

  // Stage 4 Foliage: Full High-Density Crown & Sprawling Boughs (0.76 -> 0.98)
  addCanopyCluster(bTopCrown_end, 65, 1.4, 1.3, 1.4, 0.85, 0.97, 4);
  addCanopyCluster(new THREE.Vector3(0.0, 4.8, 0.0), 60, 1.5, 1.2, 1.5, 0.85, 0.97, 4);
  addCanopyCluster(bTop1_end, 45, 1.2, 1.0, 1.2, 0.86, 0.96, 4);
  addCanopyCluster(bTop2_end, 45, 1.2, 1.0, 1.2, 0.86, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(-1.0, 4.2, 0.4), 50, 1.3, 1.1, 1.3, 0.83, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(1.2, 4.3, -0.3), 50, 1.3, 1.1, 1.3, 0.83, 0.96, 4);
  addCanopyCluster(bF_nodes[2], 45, 1.2, 1.0, 1.2, 0.76, 0.92, 4);
  addCanopyCluster(new THREE.Vector3(1.8, 2.8, 2.4), 40, 1.1, 1.0, 1.1, 0.78, 0.93, 4);
  addCanopyCluster(bB_nodes[2], 45, 1.2, 1.0, 1.2, 0.76, 0.92, 4);
  addCanopyCluster(new THREE.Vector3(-2.0, 3.0, -2.2), 40, 1.1, 1.0, 1.1, 0.78, 0.93, 4);
  addCanopyCluster(bR_nodes[4], 65, 1.4, 1.2, 1.4, 0.76, 0.92, 4);
  addCanopyCluster(bR_nodes[5], 60, 1.4, 1.2, 1.4, 0.85, 0.97, 4);
  addCanopyCluster(new THREE.Vector3(4.2, 3.5, -0.4), 55, 1.3, 1.1, 1.3, 0.82, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(5.2, 2.4, 0.4), 50, 1.2, 1.0, 1.2, 0.82, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(-3.2, 2.8, 0.7), 40, 1.1, 1.0, 1.1, 0.80, 0.94, 4);
  addCanopyCluster(new THREE.Vector3(1.5, 3.2, 0.2), 50, 1.5, 1.3, 1.5, 0.82, 0.95, 4);
  addCanopyCluster(new THREE.Vector3(-1.0, 3.0, -0.2), 45, 1.4, 1.2, 1.4, 0.80, 0.94, 4);

  // Floating Breeze Leaves
  const floatingLeaves = [];
  const floatingLeavesCount = isLowPower ? 12 : 35;
  for (let i = 0; i < floatingLeavesCount; i++) {
    const mat = leafMaterials[i % leafMaterials.length];
    const fLeaf = new THREE.Mesh(leafGeo, mat);
    fLeaf.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 6 - 1,
      (Math.random() - 0.5) * 8
    );
    fLeaf.scale.set(0.38, 0.38, 0.38);
    fLeaf.visible = false;
    fLeaf.castShadow = false;
    treeGroup.add(fLeaf);

    floatingLeaves.push({
      mesh: fLeaf,
      vy: -0.012 - Math.random() * 0.02,
      vx: 0.008 + Math.random() * 0.02,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      spawnP: 0.82 + Math.random() * 0.15
    });
  }

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

  // ─── 16. Real Page Loading State & Staging Caps ───────────────────────────
  let domReady = (document.readyState === 'interactive' || document.readyState === 'complete');
  let windowLoaded = (document.readyState === 'complete');
  let imagesLoaded = false;

  if (!domReady) {
    document.addEventListener('DOMContentLoaded', () => { domReady = true; }, { once: true });
  }

  const pageImages = Array.from(document.querySelectorAll('img'));
  let loadedImgCount = 0;
  const totalImgs = pageImages.length;

  if (totalImgs === 0) {
    imagesLoaded = true;
  } else {
    pageImages.forEach((img) => {
      if (img.complete) {
        loadedImgCount++;
        if (loadedImgCount >= totalImgs * 0.8) imagesLoaded = true;
      } else {
        img.addEventListener('load', () => {
          loadedImgCount++;
          if (loadedImgCount >= totalImgs * 0.8) imagesLoaded = true;
        }, { once: true });
        img.addEventListener('error', () => {
          loadedImgCount++;
          if (loadedImgCount >= totalImgs * 0.8) imagesLoaded = true;
        }, { once: true });
      }
    });
  }

  if (!windowLoaded) {
    window.addEventListener('load', () => {
      windowLoaded = true;
      imagesLoaded = true;
    }, { once: true });
  }

  // ─── 17. Botanical Stage Timeline & Interactive Controller ────────────────
  function botanicalTimeline(tNorm) {
    tNorm = Math.max(0, Math.min(1.0, tNorm));
    const wave = -0.024 * Math.sin(8.0 * Math.PI * tNorm);
    return Math.max(0, Math.min(1.0, tNorm + wave));
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

  // ─── 17B. Seasonal Scroll Architecture (Printemps, Été, Automne, Hiver) ────
  // Section pairing:
  // Home => Printemps (0.0)
  // About => Été (1.0)
  // Experience => Automne (2.0)
  // Projects => Hiver (3.0)
  // Contact => Reste en Hiver (3.0) pour préserver la future idée de Gabriel
  let currentSeason = 0.0;
  let targetSeason = 0.0;
  let manualSeason = null;

  function getSeasonFromScroll() {
    if (!isRevealed) return 0.0; // Pendant l'intro, rester au printemps

    const home = document.getElementById('home');
    const about = document.getElementById('about');
    const exp = document.getElementById('experience');
    const proj = document.getElementById('projects');
    const contact = document.getElementById('contact');

    if (!home || !about || !exp || !proj) return 0.0;

    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    const focal = vh * 0.40;

    // Tout en haut de la page (Home)
    if (scrollY <= 40) return 0.0;

    const rHome = home.getBoundingClientRect();
    const rAbout = about.getBoundingClientRect();
    const rExp = exp.getBoundingClientRect();
    const rProj = proj.getBoundingClientRect();
    const rContact = contact ? contact.getBoundingClientRect() : null;

    // Section Contact atteinte => Hiver (3.0) maintenu
    if (rContact && rContact.top <= focal) {
      return 3.0;
    }

    // Section Projects atteinte => Hiver (3.0)
    if (rProj.top <= focal) {
      return 3.0;
    }

    // Entre Experience et Projects : 2.0 (Automne) -> 3.0 (Hiver)
    if (rExp.top <= focal) {
      const span = rProj.top - rExp.top;
      if (span <= 0) return 3.0;
      const t = (focal - rExp.top) / span;
      return 2.0 + Math.max(0.0, Math.min(1.0, t));
    }

    // Entre About et Experience : 1.0 (Été) -> 2.0 (Automne)
    if (rAbout.top <= focal) {
      const span = rExp.top - rAbout.top;
      if (span <= 0) return 2.0;
      const t = (focal - rAbout.top) / span;
      return 1.0 + Math.max(0.0, Math.min(1.0, t));
    }

    // Entre Home et About : 0.0 (Printemps) -> 1.0 (Été)
    const span = rAbout.top - rHome.top;
    if (span <= 0) return 1.0;
    const t = (focal - rHome.top) / span;
    return Math.max(0.0, Math.min(1.0, t));
  }

  window.treeSeasonController = {
    setSeason(s) {
      if (typeof s === 'number' && s >= 0 && s <= 3) {
        manualSeason = s;
        console.log(`[Tree 3D] Season set to ${['Printemps (0)', 'Été (1)', 'Automne (2)', 'Hiver (3)'][s]}`);
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
  }, 400);

  // ── Render Loop Lifecycle (The tree stays continuously visible across the entire site) ──
  let rafId = null;
  let lastFrameTime = 0;

  function stopTreeLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

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

    // Throttle background idle animation to ~30 FPS on mobile / low-power after tree is fully grown
    if (isLowPower && isRevealed) {
      if (now - lastFrameTime < 32) return;
    }
    lastFrameTime = now;

    const elapsed = now - startTime;
    const elapsedSec = elapsed / 1000;

    // Pendant les premiers introDelay ms, la croissance reste à 0 (l'écran prépare l'apparition)
    const growthElapsed = Math.max(0, elapsed - introDelay);
    const rawTimeProgress = Math.min(1.0, growthElapsed / minDuration);

    const organicTimeProgress = botanicalTimeline(rawTimeProgress);

    let targetProgress = organicTimeProgress;
    if (growthElapsed >= minDuration) {
      targetProgress = 1.0;
    }

    if (manualLockedProgress !== null) {
      targetProgress = manualLockedProgress;
    } else if (isPaused) {
      targetProgress = currentProgress;
    }

    // Convergence fluide vers 100% sans blocage artificiel
    const lerpSpeed = (targetProgress >= 0.98) ? 0.09 : 0.07;
    currentProgress += (targetProgress - currentProgress) * lerpSpeed;

    // Verrouillage net et garanti à 100%
    if (manualLockedProgress === null && (rawTimeProgress >= 1.0 || (1.0 - currentProgress) < 0.008)) {
      currentProgress = 1.0;
    }

    const progress = currentProgress;
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // ── Seasonal Architecture & Scroll Transition ──
    targetSeason = (manualSeason !== null) ? manualSeason : getSeasonFromScroll();
    currentSeason += (targetSeason - currentSeason) * 0.06;

    // Mise à jour chromatique des matériaux de feuilles (Printemps -> Été -> Automne -> Hiver)
    for (let i = 0; i < leafMaterials.length; i++) {
      interpolateSeasonColor(leafMaterials[i].color, leafSeasonPalettes[i], currentSeason);
    }

    // Mise à jour sol, mousses & herbes
    interpolateSeasonColor(groundMat.color, groundSeasonColors, currentSeason);
    groundMat.roughness = interpolateSeasonScalar([0.92, 0.95, 0.88, 0.55], currentSeason);

    for (let m = 0; m < mossMats.length; m++) {
      interpolateSeasonColor(mossMats[m].color, mossSeasonPalettes[m], currentSeason);
    }
    for (let g = 0; g < grassMaterials.length; g++) {
      interpolateSeasonColor(grassMaterials[g].color, grassSeasonPalettes[g], currentSeason);
    }

    // Tapis de feuilles mortes d'automne éparpillées sur le sol
    if (fallenLeaves.length > 0) {
      let fallenScale = 0.0001;
      if (currentSeason >= 1.3 && currentSeason <= 2.85) {
        if (currentSeason < 1.8) {
          // Apparition progressive en automne
          fallenScale = (currentSeason - 1.3) / 0.5;
        } else if (currentSeason <= 2.3) {
          // Plein automne : sol tapissé de feuilles dorées et rousses
          fallenScale = 1.0;
        } else {
          // Recouvert par la neige en arrivant en hiver
          fallenScale = Math.max(0.0001, 1.0 - (currentSeason - 2.3) / 0.45);
        }
      }
      fallenLeaves.forEach(fl => {
        const s = fl.baseScale * fallenScale;
        fl.mesh.scale.set(s, s, s);
        fl.mesh.visible = (fallenScale > 0.02);
      });
      for (let f = 0; f < fallenMats.length; f++) {
        interpolateSeasonColor(fallenMats[f].color, fallenSeasonPalettes[f], currentSeason);
      }
    }

    // Mise à jour fleurs & trèfles (repos végétatif en hiver)
    if (seasonalFloraGroups.length > 0) {
      const floraScale = currentSeason >= 2.2 ? Math.max(0.0001, 1.0 - (currentSeason - 2.2) / 0.6) : 1.0;
      seasonalFloraGroups.forEach(fg => {
        fg.scale.set(floraScale, floraScale, floraScale);
        fg.visible = (floraScale > 0.02);
      });
    }

    // Mise à jour dynamique de l'éclairage selon la saison
    if (isRevealed) {
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

    // ── Live Top Loader Capsule Update ──
    const loaderFill = document.getElementById('nav-loader-fill');
    const loaderPercent = document.getElementById('nav-loader-percent');

    if (loaderFill) {
      loaderFill.style.transform = `scaleX(${progress})`;
    }
    if (loaderPercent) {
      loaderPercent.textContent = `${Math.round(progress * 100)}%`;
    }

    // ── Étape Terminé : logo vert, bordure et fond vert, puis transition vers le site ──
    if (progress >= 1.0 && !isCompleteTriggered && manualLockedProgress === null) {
      isCompleteTriggered = true;

      // Garantir l'affichage 100%
      if (loaderFill) loaderFill.style.transform = 'scaleX(1)';
      if (loaderPercent) loaderPercent.textContent = '100%';

      // 1. Apparition immédiate de l'état "is-complete" (texte Loaded et styles verts)
      const navBar = document.getElementById('navBar');
      if (navBar) navBar.classList.add('is-complete');

      // 2. Rétractation de nav close dès l'apparition de (loaded)
      retractSubNavLoading();

      // 3. Après 1600ms (temps d'admirer la rentrée et le Loaded vert), lancer la transition vers le site
      setTimeout(() => {
        if (!isRevealed) {
          isRevealed = true;
          const preloader = document.getElementById('preloader');
          if (preloader) {
            preloader.classList.add('preloader-zoom-morph');
            setTimeout(() => {
              preloader.remove();
            }, 1000);
          }
          document.body.classList.add('site-revealed', 'site-revealing');
          const navShowEl = document.getElementById('nav-show');
          if (navShowEl) navShowEl.classList.remove('sub-nav-retract');
          setTimeout(() => {
            document.body.classList.remove('site-revealing');
          }, 1200);
          if (typeof onComplete === 'function') onComplete();
        }
      }, 1600);
    }

    // Multi-Harmonic Wind Simulation
    const windGust = Math.sin(elapsedSec * 0.5) * 0.5 + Math.sin(elapsedSec * 0.22) * 0.35 + 0.5;

    // ── Root Buttresses Growth (Emerges naturally starting in Stage 2/3) ──
    if (progress >= 0.35) {
      const rootP = Math.min(1.0, (progress - 0.35) / 0.52);
      const rEase = rootP * rootP * (3 - 2 * rootP);
      rootButtresses.forEach((rb) => {
        const s = 0.9 * rEase;
        rb.mesh.scale.set(s, s * 1.15, s);
        if (progress >= 1.0 && isRevealed) {
          interpolateSeasonColor(rb.mat.color, matureBarkSeasonColors, currentSeason);
          rb.mat.roughness = interpolateSeasonScalar([0.75, 0.85, 0.82, 0.92], currentSeason);
        }
      });
    }

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
    updateContinuousTrunk(progress, trunkThicknessFactor);

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
          const currentTip = new THREE.Vector3().copy(b.start).addScaledVector(b.dir, b.len * easeLen);
          b.tipCapMesh.position.copy(currentTip);
          const capScale = b.rEnd * currentThickness;
          b.tipCapMesh.scale.set(capScale, capScale * 0.8, capScale);
        }

        // Texture and Material Transition: Fresh clean young stem -> Warm Hazel Sapling -> Ancient Oak
        if (progress < 0.25) {
          b.mat.color.copy(sproutGreenColor);
          b.mat.roughness = 0.35;
          if (b.isTextureMatured) {
            b.mat.map = youngStemTexture;
            b.mat.needsUpdate = true;
            b.isTextureMatured = false;
          }
        } else if (progress < 0.50) {
          b.mat.color.copy(sproutGreenColor);
          b.mat.roughness = 0.38;
        } else if (progress >= b.turnBrownP) {
          const brownP = Math.min(1.0, (progress - b.turnBrownP) / 0.22);
          b.mat.color.lerpColors(youngHazelBarkColor, barkDarkBrownColor, brownP);
          b.mat.roughness = THREE.MathUtils.lerp(0.58, 0.85, brownP);

          if (!b.isTextureMatured && progress >= 0.55) {
            b.mat.map = matureBarkTexture;
            b.mat.needsUpdate = true;
            b.isTextureMatured = true;
          }

          if (progress >= 1.0 && isRevealed) {
            interpolateSeasonColor(b.mat.color, matureBarkSeasonColors, currentSeason);
            b.mat.roughness = interpolateSeasonScalar([0.75, 0.85, 0.82, 0.92], currentSeason);
          }
        }
      }
    });

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
      leaves.forEach((l) => {
        if (progress < l.leafStartP) {
          l.mesh.scale.set(0.0001, 0.0001, 0.0001);
          l.mesh.visible = false;
        } else {
          l.mesh.visible = true;
          if (progress < 1.0) {
            const p = Math.min(1.0, (progress - l.leafStartP) / l.leafDuration);
            let currentScale;
            let unfoldProg;

            if (p <= 0.35) {
              const u = p / 0.35;
              const unfurlEase = u * u * (3 - 2 * u);
              currentScale = l.targetScale * 0.72 * unfurlEase;
              unfoldProg = unfurlEase;
            } else {
              const m = (p - 0.35) / 0.65;
              const matureEase = m * m * (3 - 2 * m);
              currentScale = l.targetScale * (0.72 + 0.28 * matureEase);
              unfoldProg = 1.0;
            }

            const s = Math.max(0.0001, currentScale);
            l.mesh.scale.set(s, s, s);

            const unfoldRotOffset = (1.0 - unfoldProg) * l.unfurlAngle;
            const flutter = Math.sin(elapsedSec * l.swaySpeed + l.swayPhase) * (0.03 + windGust * 0.045);
            const twist = Math.cos(elapsedSec * (l.swaySpeed * 0.8) + l.swayPhase) * (0.02 + windGust * 0.025);
            l.mesh.rotation.z = l.origRot.z + flutter + unfoldRotOffset * 0.5;
            l.mesh.rotation.x = l.origRot.x + twist + unfoldRotOffset;
          } else {
            // Arbre adulte mature : adaptation saisonnière dynamique
            let seasonScale = 1.0;
            if (currentSeason < 1.0) {
              // Printemps (0.0) -> Été (1.0) : feuilles printanières tendres (~0.85) s'épanouissant en plein été (1.08)
              seasonScale = THREE.MathUtils.lerp(0.85, 1.08, currentSeason);
              l.mesh.visible = true;
            } else if (currentSeason <= 2.15) {
              // Été (1.0) -> Début Automne (2.15) : pleine canopée dorée et flamboyante
              const t = (currentSeason - 1.0) / 1.15;
              seasonScale = THREE.MathUtils.lerp(1.08, 1.00, t);
              l.mesh.visible = true;
            } else {
              // Automne tardif (2.15) -> Hiver (3.0) : chute progressive des feuilles
              if (l.isClinger) {
                // Quelques rares feuilles fanées persistantes sur les branches en hiver
                const t = (currentSeason - 2.15) / 0.85;
                seasonScale = THREE.MathUtils.lerp(0.95, 0.45, t);
                l.mesh.visible = true;
              } else if (currentSeason >= l.dropSeasonThreshold) {
                // La feuille est tombée
                const dropP = Math.min(1.0, (currentSeason - l.dropSeasonThreshold) / 0.15);
                seasonScale = (1.0 - dropP) * 0.95;
                if (dropP >= 0.98) {
                  seasonScale = 0.0001;
                  l.mesh.visible = false;
                } else {
                  l.mesh.visible = true;
                }
              } else {
                seasonScale = 0.95;
                l.mesh.visible = true;
              }
            }

            const finalScale = Math.max(0.0001, l.targetScale * seasonScale);
            l.mesh.scale.set(finalScale, finalScale, finalScale);

            const flutter = Math.sin(elapsedSec * l.swaySpeed + l.swayPhase) * (0.02 + windGust * 0.03);
            l.mesh.rotation.z = l.origRot.z + flutter;
          }
        }
      });
    }

    // ── Ground Grass Blades Breeze Swaying & Winter Dormancy ──
    const grassWinterFactor = currentSeason >= 2.2 ? Math.max(0.65, 1.0 - (currentSeason - 2.2) * 0.35) : 1.0;
    groundBlades.forEach((gb) => {
      gb.mesh.rotation.z = gb.baseRotZ + Math.sin(elapsedSec * gb.swaySpeed + gb.phase) * (0.03 + windGust * 0.025);
      if (gb.baseScaleY) {
        gb.mesh.scale.set(gb.baseScaleXZ * grassWinterFactor, gb.baseScaleY * grassWinterFactor, gb.baseScaleXZ * grassWinterFactor);
      }
    });

    // ── Floating Breeze Leaves (Flamboyant Autumn Gusts & Winter Drop) ──
    floatingLeaves.forEach((fl) => {
      if (progress >= fl.spawnP) {
        // En Hiver (saison > 2.6), les feuilles au vent disparaissent
        const winterFade = currentSeason >= 2.6 ? Math.max(0.0001, 1.0 - (currentSeason - 2.6) / 0.3) : 1.0;
        // En Automne (1.5 -> 2.5), bourrasques de feuilles vives tourbillonnantes
        const autumnBoost = (currentSeason >= 1.5 && currentSeason <= 2.5) ? 1.35 : 1.0;

        if (winterFade <= 0.005) {
          fl.mesh.visible = false;
        } else {
          fl.mesh.visible = true;
          const flP = Math.min(1.0, (progress - fl.spawnP) / 0.04);
          const flScale = 0.38 * flP * flP * (3 - 2 * flP) * winterFade * autumnBoost;
          fl.mesh.scale.set(flScale, flScale, flScale);

          const speedMult = (currentSeason >= 1.5 && currentSeason <= 2.5) ? 1.45 : 1.0;
          fl.mesh.position.y += fl.vy * speedMult;
          fl.mesh.position.x += fl.vx * (0.8 + windGust * 0.4) * speedMult;
          fl.mesh.rotation.z += fl.rotSpeed * speedMult;
          fl.mesh.rotation.x += fl.rotSpeed * 0.7 * speedMult;

          if (fl.mesh.position.y < -4.3) {
            fl.mesh.position.y = 5.0;
            fl.mesh.position.x = (Math.random() - 0.5) * 9;
          }
        }
      } else {
        fl.mesh.visible = false;
      }
    });

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
      if (currentSeason >= 2.0) {
        pollenSeasonFade = Math.max(0.0, 1.0 - (currentSeason - 2.0) / 0.8);
      }
      pollenMat.opacity = Math.min(0.75, (progress - 0.20) / 0.40) * pollenSeasonFade;
    } else {
      pollenMat.opacity = 0;
    }

    // ── Winter Snowflakes Animation (Douce chute de neige cotonneuse) ──
    if (currentSeason >= 2.1) {
      const snowFade = Math.min(0.85, (currentSeason - 2.1) / 0.7);
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
    camCurve.getPointAt(smoothProg, targetCamPos);
    lookCurve.getPointAt(smoothProg, targetLookPos);

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
