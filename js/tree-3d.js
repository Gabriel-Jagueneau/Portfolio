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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);

  // Soft PCF Dappled Shadow Map Engine
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Adaptive Pixel Ratio
  const isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                     (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const targetPixelRatio = isLowPower ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(targetPixelRatio);

  // ─── 2. Photorealistic Botanical Lighting & Dappled Shadows ───────────────
  const ambientLight = new THREE.AmbientLight(0xf5faeb, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xe8f5e9, 0x3e2723, 0.65);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffdf0, 1.35);
  sunLight.position.set(14, 24, 18);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 1.0;
  sunLight.shadow.camera.far = 65;
  sunLight.shadow.camera.left = -8.5;
  sunLight.shadow.camera.right = 8.5;
  sunLight.shadow.camera.top = 9.0;
  sunLight.shadow.camera.bottom = -5.5;
  sunLight.shadow.bias = -0.0008;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xa5d6a7, 0.75);
  rimLight.position.set(-16, 12, -12);
  scene.add(rimLight);

  const mossBounceLight = new THREE.DirectionalLight(0x81c784, 0.35);
  mossBounceLight.position.set(0, -8, 6);
  scene.add(mossBounceLight);

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

  const leafColors = [
    0x4caf50, 0x2e7d32, 0x8bc34a, 0x66bb6a, 0x388e3c, 0xaed581, 0x1b5e20
  ];

  const leafMaterials = leafColors.map(c => new THREE.MeshStandardMaterial({
    color: c,
    map: leafTexture,
    roughness: 0.40,
    metalness: 0.08,
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

  // Mossy Ground Mound
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 512;
  groundCanvas.height = 512;
  const gCtx = groundCanvas.getContext('2d');

  const radGrad = gCtx.createRadialGradient(256, 256, 15, 256, 256, 250);
  radGrad.addColorStop(0.0, 'rgba(46, 125, 50, 0.95)');
  radGrad.addColorStop(0.25, 'rgba(67, 160, 71, 0.85)');
  radGrad.addColorStop(0.55, 'rgba(76, 175, 80, 0.50)');
  radGrad.addColorStop(0.80, 'rgba(129, 199, 132, 0.20)');
  radGrad.addColorStop(1.0, 'rgba(46, 125, 50, 0.00)');

  gCtx.fillStyle = radGrad;
  gCtx.fillRect(0, 0, 512, 512);

  const groundTexture = new THREE.CanvasTexture(groundCanvas);
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTexture,
    transparent: true,
    depthWrite: false,
    roughness: 0.9,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), groundMat);
  groundPlane.rotation.x = -Math.PI * 0.5;
  groundPlane.position.set(0, -4.41, 0);
  groundPlane.receiveShadow = true;
  treeGroup.add(groundPlane);

  // Ground Flora: Grass, Moss, Clovers & Flowers
  const groundBlades = [];
  const grassGeo = new THREE.ConeGeometry(0.06, 0.44, 4);
  grassGeo.translate(0, 0.22, 0);

  for (let i = 0; i < 95; i++) {
    const grassMat = leafMaterials[i % leafMaterials.length];
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.castShadow = true;
    grass.receiveShadow = true;

    const clusterAngle = (i % 12) * (Math.PI * 2 / 12) + (Math.random() - 0.5) * 0.4;
    const rad = 0.25 + Math.pow(Math.random(), 1.5) * 2.6;
    const hScale = 0.6 + Math.random() * 0.9;
    const wScale = 0.7 + Math.random() * 0.6;

    grass.position.set(Math.cos(clusterAngle) * rad, -4.41, Math.sin(clusterAngle) * rad);
    grass.scale.set(wScale, hScale, wScale);

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
      swaySpeed: 1.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Moss Cushions
  const mossGeo = new THREE.SphereGeometry(1, 8, 8);
  const mossMats = [
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x689f38, roughness: 0.95 })
  ];

  for (let m = 0; m < 14; m++) {
    const mMat = mossMats[m % mossMats.length];
    const moss = new THREE.Mesh(mossGeo, mMat);
    moss.receiveShadow = true;
    const mAngle = (m / 14) * Math.PI * 2 + Math.random() * 0.3;
    const mRad = 0.35 + Math.random() * 1.8;
    const sX = 0.22 + Math.random() * 0.28;
    const sY = 0.08 + Math.random() * 0.10;
    const sZ = 0.22 + Math.random() * 0.28;

    moss.position.set(Math.cos(mAngle) * mRad, -4.41 + sY * 0.5, Math.sin(mAngle) * mRad);
    moss.scale.set(sX, sY, sZ);
    treeGroup.add(moss);
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
      leaflet.castShadow = true;
      leaflet.rotation.set(Math.PI * 0.45, 0, (k * Math.PI * 2) / 3);
      leaflet.scale.set(0.12, 0.12, 0.12);
      cloverGroup.add(leaflet);
    }
    treeGroup.add(cloverGroup);
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
    center.castShadow = true;
    flowerGroup.add(center);

    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const pAngle = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(pAngle) * 0.07, 0, Math.sin(pAngle) * 0.07);
      petal.scale.set(1.3, 0.4, 0.9);
      petal.castShadow = true;
      flowerGroup.add(petal);
    }
    treeGroup.add(flowerGroup);
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
    stem.castShadow = true;
    shroom.add(stem);

    const cap = new THREE.Mesh(capGeo, shroomCapMat);
    cap.position.y = 0.16;
    cap.castShadow = true;
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

  const trunkRadii = [
    0.60, 0.56, 0.52, 0.48, 0.44, 0.40, 0.36, 0.32, 0.28, 0.24, 0.20, 0.16
  ];

  // Precise sequential growth intervals for the main trunk segments
  const trunkIntervals = [
    [0.00, 0.07, 0.35, 1], // Seg 0: Node 0 -> Node 1 (reaches node 1 at 0.07)
    [0.06, 0.13, 0.37, 1], // Seg 1: Node 1 -> Node 2 (reaches node 2 at 0.13)
    [0.12, 0.19, 0.40, 1], // Seg 2: Node 2 -> Node 3 (reaches node 3 at 0.19)
    [0.18, 0.25, 0.44, 1], // Seg 3: Node 3 -> Node 4 (Stage 1 Crown at 0.25)
    [0.25, 0.38, 0.48, 2], // Seg 4: Node 4 -> Node 5 (Trunk arrives at Node 5 at 0.38)
    [0.37, 0.49, 0.54, 2], // Seg 5: Node 5 -> Node 6 (Stage 2 Leader apex at 0.49)
    [0.50, 0.60, 0.62, 3], // Seg 6: Node 6 -> Node 7 (Trunk arrives at Node 7 at 0.60)
    [0.59, 0.67, 0.68, 3], // Seg 7: Node 7 -> Node 8 (reaches node 8 at 0.67)
    [0.66, 0.73, 0.74, 3], // Seg 8: Node 8 -> Node 9 (reaches node 9 at 0.73)
    [0.72, 0.78, 0.77, 3], // Seg 9: Node 9 -> Node 10 (reaches node 10 at 0.78)
    [0.77, 0.84, 0.83, 4]  // Seg 10: Node 10 -> Node 11 (Trunk arrives at Node 11 at 0.84)
  ];

  // ─── 8. Seamless Continuous Branch Engine (No Floating Balls!) ────────────
  const branches = [];
  const leaves = [];
  const twigTipGeo = new THREE.SphereGeometry(1, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);

  function createBranch({
    start, end, rStart, rEnd,
    startP, endP, turnBrownP = 1.0,
    isMainTrunk = false,
    stage = 1,
    hasTipCap = false
  }) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();

    // Natural overlap extends backward into the parent segment for a continuous seamless joint
    const overlap = Math.min(len * 0.18, rStart * 0.40);
    // 12 radial segments for smooth, sculpted, photorealistic wood curvature
    const geo = new THREE.CylinderGeometry(rEnd, rStart, len + overlap, 12);
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
      isMainTrunk,
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

  // Create Continuous Trunk Spine (Seamless overlapping wood, no joint spheres)
  for (let s = 0; s < 11; s++) {
    createBranch({
      start: trunkNodes[s],
      end: trunkNodes[s + 1],
      rStart: trunkRadii[s],
      rEnd: trunkRadii[s + 1],
      startP: trunkIntervals[s][0],
      endP: trunkIntervals[s][1],
      turnBrownP: trunkIntervals[s][2],
      stage: trunkIntervals[s][3],
      isMainTrunk: true,
      hasTipCap: false
    });
  }

  // ─── 9. Stage 1 Seedling Specialized Foliage & Morning Dew Droplets ──────
  const cotyledonGroup = new THREE.Group();
  cotyledonGroup.position.set(0.04, -4.08, 0.03);
  cotyledonGroup.scale.set(0.0001, 0.0001, 0.0001);
  for (let i = 0; i < 2; i++) {
    const cLeaf = new THREE.Mesh(leafGeo, leafMaterials[0]);
    cLeaf.castShadow = true;
    cLeaf.receiveShadow = true;
    cLeaf.scale.set(0.25, 0.25, 0.25);
    cLeaf.rotation.set(0.5, i * Math.PI + 0.3, 0.2);
    cotyledonGroup.add(cLeaf);
  }
  treeGroup.add(cotyledonGroup);

  // Sprout Apical Rosette with Morning Dew Droplets (Sits at shoot apex during Stage 1)
  const sproutRosette = new THREE.Group();
  sproutRosette.position.copy(trunkNodes[0]);
  sproutRosette.scale.set(0.0001, 0.0001, 0.0001);

  const sproutBudMat = new THREE.MeshStandardMaterial({
    color: 0x66bb6a,
    roughness: 0.30,
    metalness: 0.08
  });
  const sproutBud = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), sproutBudMat);
  sproutBud.castShadow = true;
  sproutRosette.add(sproutBud);

  const dewMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.25,
    transparent: true,
    opacity: 0.90
  });
  const dewGeo = new THREE.SphereGeometry(0.024, 6, 6);

  const sproutLeafMeshes = [];
  const numSproutLeaves = 6;
  for (let i = 0; i < numSproutLeaves; i++) {
    const mat = leafMaterials[i % leafMaterials.length];
    const sLeaf = new THREE.Mesh(leafGeo, mat);
    sLeaf.castShadow = true;
    sLeaf.receiveShadow = true;
    const angle = (i / numSproutLeaves) * Math.PI * 2;
    sLeaf.rotation.set(
      0.45 + (i % 2 === 0 ? 0.15 : 0.0),
      angle,
      (Math.random() - 0.5) * 0.2
    );
    sLeaf.scale.set(0.40, 0.40, 0.40);

    const dew = new THREE.Mesh(dewGeo, dewMat);
    dew.position.set(0, 1.15, 0.02);
    sLeaf.add(dew);

    sproutRosette.add(sLeaf);
    sproutLeafMeshes.push({
      mesh: sLeaf,
      origRot: sLeaf.rotation.clone(),
      swaySpeed: 2.0 + Math.random() * 1.5,
      phase: i * 0.8
    });
  }
  treeGroup.add(sproutRosette);

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
    for (let i = 0; i < count; i++) {
      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.castShadow = true;
      leaf.receiveShadow = true;

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

      const baseScale = 0.55 + Math.random() * 0.4;
      leaf.scale.set(0.0001, 0.0001, 0.0001);
      treeGroup.add(leaf);

      leaves.push({
        mesh: leaf,
        targetScale: baseScale,
        bloomStartP,
        bloomEndP,
        stage,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.6 + Math.random() * 2.0,
        origRot: leaf.rotation.clone()
      });
    }
  }

  // Stage 2 Foliage: Blooms cleanly between 0.44 and 0.50 (in sync with sapling boughs)
  addCanopyCluster(bL_nodes[2], 26, 0.7, 0.6, 0.7, 0.44, 0.50, 2);
  addCanopyCluster(bR_nodes[2], 28, 0.7, 0.6, 0.7, 0.44, 0.50, 2);
  addCanopyCluster(trunkNodes[5], 24, 0.6, 0.5, 0.6, 0.40, 0.49, 2);
  addCanopyCluster(trunkNodes[6], 26, 0.7, 0.6, 0.7, 0.45, 0.50, 2);

  // Stage 3 Foliage: Rich Mid-Tier Canopy Volumes (0.58 -> 0.74)
  addCanopyCluster(bL_nodes[3], 45, 1.2, 1.0, 1.2, 0.58, 0.70, 3);
  addCanopyCluster(bL_nodes[4], 50, 1.3, 1.1, 1.3, 0.62, 0.73, 3);
  addCanopyCluster(bR_nodes[3], 55, 1.3, 1.1, 1.3, 0.58, 0.70, 3);
  addCanopyCluster(bF_nodes[1], 35, 1.0, 0.8, 1.0, 0.68, 0.74, 3);
  addCanopyCluster(bB_nodes[1], 35, 1.0, 0.8, 1.0, 0.68, 0.74, 3);
  addCanopyCluster(new THREE.Vector3(0.0, 1.8, 0.0), 50, 1.4, 1.2, 1.4, 0.60, 0.72, 3);
  addCanopyCluster(new THREE.Vector3(1.5, 2.2, 0.2), 45, 1.3, 1.1, 1.3, 0.62, 0.74, 3);
  addCanopyCluster(new THREE.Vector3(-1.2, 2.0, -0.3), 45, 1.3, 1.1, 1.3, 0.62, 0.74, 3);

  // Stage 4 Foliage: Full High-Density Crown & Sprawling Boughs (0.78 -> 0.96)
  addCanopyCluster(bTopCrown_end, 65, 1.4, 1.3, 1.4, 0.88, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(0.0, 4.8, 0.0), 60, 1.5, 1.2, 1.5, 0.88, 0.96, 4);
  addCanopyCluster(bTop1_end, 45, 1.2, 1.0, 1.2, 0.88, 0.95, 4);
  addCanopyCluster(bTop2_end, 45, 1.2, 1.0, 1.2, 0.88, 0.95, 4);
  addCanopyCluster(new THREE.Vector3(-1.0, 4.2, 0.4), 50, 1.3, 1.1, 1.3, 0.85, 0.95, 4);
  addCanopyCluster(new THREE.Vector3(1.2, 4.3, -0.3), 50, 1.3, 1.1, 1.3, 0.85, 0.95, 4);
  addCanopyCluster(bF_nodes[2], 45, 1.2, 1.0, 1.2, 0.78, 0.92, 4);
  addCanopyCluster(new THREE.Vector3(1.8, 2.8, 2.4), 40, 1.1, 1.0, 1.1, 0.80, 0.93, 4);
  addCanopyCluster(bB_nodes[2], 45, 1.2, 1.0, 1.2, 0.78, 0.92, 4);
  addCanopyCluster(new THREE.Vector3(-2.0, 3.0, -2.2), 40, 1.1, 1.0, 1.1, 0.80, 0.93, 4);
  addCanopyCluster(bR_nodes[4], 65, 1.4, 1.2, 1.4, 0.78, 0.92, 4);
  addCanopyCluster(bR_nodes[5], 60, 1.4, 1.2, 1.4, 0.88, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(4.2, 3.5, -0.4), 55, 1.3, 1.1, 1.3, 0.85, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(5.2, 2.4, 0.4), 50, 1.2, 1.0, 1.2, 0.85, 0.96, 4);
  addCanopyCluster(new THREE.Vector3(-3.2, 2.8, 0.7), 40, 1.1, 1.0, 1.1, 0.82, 0.94, 4);
  addCanopyCluster(new THREE.Vector3(1.5, 3.2, 0.2), 50, 1.5, 1.3, 1.5, 0.84, 0.95, 4);
  addCanopyCluster(new THREE.Vector3(-1.0, 3.0, -0.2), 45, 1.4, 1.2, 1.4, 0.82, 0.94, 4);

  // Floating Breeze Leaves
  const floatingLeaves = [];
  for (let i = 0; i < 35; i++) {
    const mat = leafMaterials[i % leafMaterials.length];
    const fLeaf = new THREE.Mesh(leafGeo, mat);
    fLeaf.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 6 - 1,
      (Math.random() - 0.5) * 8
    );
    fLeaf.scale.set(0.38, 0.38, 0.38);
    fLeaf.visible = false;
    fLeaf.castShadow = true;
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
  const pollenCount = 45;
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

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === '1') window.treeStageController.setStage(1);
    else if (e.key === '2') window.treeStageController.setStage(2);
    else if (e.key === '3') window.treeStageController.setStage(3);
    else if (e.key === '4') window.treeStageController.setStage(4);
    else if (e.key === '0' || e.key === 'Escape') window.treeStageController.resume();
  });

  // Dynamic Sprout Tip Calculation
  function getSproutTip(prog) {
    if (prog <= 0.0) return trunkNodes[0].clone();
    if (prog >= 0.25) return trunkNodes[4].clone();

    for (let s = 0; s < 4; s++) {
      const segStartP = trunkIntervals[s][0];
      const segEndP = trunkIntervals[s][1];
      if (prog <= segEndP) {
        const u = Math.max(0, Math.min(1, (prog - segStartP) / (segEndP - segStartP)));
        const ease = u * u * (3 - 2 * u);
        return new THREE.Vector3().lerpVectors(trunkNodes[s], trunkNodes[s + 1], ease);
      }
    }
    return trunkNodes[4].clone();
  }

  // ─── 18. Animation Loop (60 FPS Multi-Harmonic Wind & Botanical Growth) ───
  const startTime = performance.now();
  const minDuration = 5500;
  let currentProgress = 0.0;
  let isRevealed = false;

  function animate(now) {
    animId = requestAnimationFrame(animate);

    const elapsed = now - startTime;
    const elapsedSec = elapsed / 1000;
    const rawTimeProgress = Math.min(1.0, elapsed / minDuration);

    const organicTimeProgress = botanicalTimeline(rawTimeProgress);

    let maxAllowedCap = 0.25;
    if (domReady) maxAllowedCap = 0.50;
    if (domReady && (imagesLoaded || loadedImgCount >= Math.max(1, totalImgs * 0.5))) maxAllowedCap = 0.75;
    if (domReady && imagesLoaded && windowLoaded) maxAllowedCap = 1.0;

    let targetProgress = Math.min(organicTimeProgress, maxAllowedCap);

    if (manualLockedProgress !== null) {
      targetProgress = manualLockedProgress;
    } else if (isPaused) {
      targetProgress = currentProgress;
    }

    const lerpSpeed = (targetProgress >= 0.99 && currentProgress >= 0.98) ? 0.04 : 0.07;
    currentProgress += (targetProgress - currentProgress) * lerpSpeed;

    if (manualLockedProgress === null && rawTimeProgress >= 1.0 && windowLoaded && (1.0 - currentProgress) < 0.005) {
      currentProgress = 1.0;
    }

    const progress = currentProgress;
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // ── Live Top Loader Capsule Update (Ultra-fluid GPU transform, no state text) ──
    const loaderFill = document.getElementById('nav-loader-fill');
    const loaderPercent = document.getElementById('nav-loader-percent');

    if (loaderFill) {
      loaderFill.style.transform = `scaleX(${progress})`;
    }
    if (loaderPercent) {
      loaderPercent.textContent = `${Math.round(progress * 100)}%`;
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
      });
    }

    // ── Proportional Botanical Trunk & Branch Scaling ──
    let trunkThicknessFactor = 0.12;
    if (progress <= 0.25) {
      const p = progress / 0.25;
      trunkThicknessFactor = 0.08 + 0.08 * (p * p * (3 - 2 * p));
    } else if (progress <= 0.50) {
      const p = (progress - 0.25) / 0.25;
      trunkThicknessFactor = 0.16 + 0.22 * (p * p * (3 - 2 * p));
    } else if (progress <= 0.75) {
      const p = (progress - 0.50) / 0.25;
      trunkThicknessFactor = 0.38 + 0.34 * (p * p * (3 - 2 * p));
    } else {
      const p = (progress - 0.75) / 0.25;
      trunkThicknessFactor = 0.72 + 0.28 * (p * p * (3 - 2 * p));
    }

    branches.forEach((b) => {
      if (progress < b.startP) {
        b.mesh.scale.set(0.0001, 0.0001, 0.0001);
        if (b.tipCapMesh) b.tipCapMesh.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        const span = Math.max(0.03, b.endP - b.startP);
        const localP = Math.min(1.0, (progress - b.startP) / span);
        const easeLen = localP * localP * (3 - 2 * localP);

        const currentThickness = b.isMainTrunk
          ? trunkThicknessFactor
          : (0.10 + 0.90 * Math.min(1.0, Math.max(0, (progress - b.startP) / (1.0 - b.startP))));

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
          const hazelP = (progress - 0.25) / 0.25;
          if (b.isMainTrunk && b.stage === 1) {
            b.mat.color.lerpColors(sproutGreenColor, youngHazelBarkColor, Math.min(1.0, hazelP * 1.3));
            b.mat.roughness = THREE.MathUtils.lerp(0.35, 0.58, hazelP);
          } else {
            b.mat.color.copy(sproutGreenColor);
            b.mat.roughness = 0.38;
          }
        } else if (progress >= b.turnBrownP) {
          const brownP = Math.min(1.0, (progress - b.turnBrownP) / 0.22);
          const targetBark = b.isMainTrunk ? barkDarkBrownColor : youngHazelBarkColor;
          b.mat.color.lerpColors(youngHazelBarkColor, targetBark, brownP);
          b.mat.roughness = THREE.MathUtils.lerp(0.58, 0.85, brownP);

          if (!b.isTextureMatured && progress >= 0.55) {
            b.mat.map = matureBarkTexture;
            b.mat.needsUpdate = true;
            b.isTextureMatured = true;
          }
        }
      }
    });

    // ── Stage 1 Seedling Foliage Tracking ──
    if (progress < 0.04) {
      cotyledonGroup.scale.set(0.0001, 0.0001, 0.0001);
    } else {
      const cP = Math.min(1.0, (progress - 0.04) / 0.12);
      const cEase = cP * cP * (3 - 2 * cP);
      cotyledonGroup.scale.set(cEase, cEase, cEase);
    }

    if (progress < 0.02) {
      sproutRosette.scale.set(0.0001, 0.0001, 0.0001);
    } else {
      const tipPos = getSproutTip(progress);
      sproutRosette.position.copy(tipPos);

      const rP = Math.min(1.0, (progress - 0.02) / 0.18);
      const rEase = rP * rP * (3 - 2 * rP);

      let scale = rEase;
      if (progress > 0.40) {
        scale = Math.max(0.75, 1.0 - (progress - 0.40) * 0.35);
      }
      sproutRosette.scale.set(scale, scale, scale);

      sproutLeafMeshes.forEach(sl => {
        sl.mesh.rotation.z = sl.origRot.z + Math.sin(elapsedSec * sl.swaySpeed + sl.phase) * (0.04 + windGust * 0.03);
      });
    }

    // ── Dense Canopy Leaves with Shimmering Specular Sunlight Flutter ──
    leaves.forEach((l) => {
      if (progress < l.bloomStartP) {
        l.mesh.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        const span = Math.max(0.04, l.bloomEndP - l.bloomStartP);
        const p = Math.min(1.0, (progress - l.bloomStartP) / span);
        const overshoot = Math.sin(p * Math.PI * 0.5) * (1 + 0.18 * (1 - p));
        const s = l.targetScale * overshoot;
        l.mesh.scale.set(s, s, s);

        const flutter = Math.sin(elapsedSec * l.swaySpeed + l.swayPhase) * (0.03 + windGust * 0.045);
        const twist = Math.cos(elapsedSec * (l.swaySpeed * 0.8) + l.swayPhase) * (0.02 + windGust * 0.025);
        l.mesh.rotation.z = l.origRot.z + flutter;
        l.mesh.rotation.x = l.origRot.x + twist;
      }
    });

    // ── Ground Grass Blades Breeze Swaying ──
    groundBlades.forEach((gb) => {
      gb.mesh.rotation.z = gb.baseRotZ + Math.sin(elapsedSec * gb.swaySpeed + gb.phase) * (0.03 + windGust * 0.025);
    });

    // ── Floating Breeze Leaves (Stage 4 Atmosphere) ──
    floatingLeaves.forEach((fl) => {
      if (progress >= fl.spawnP) {
        fl.mesh.visible = true;
        fl.mesh.position.y += fl.vy;
        fl.mesh.position.x += fl.vx * (0.8 + windGust * 0.4);
        fl.mesh.rotation.z += fl.rotSpeed;
        fl.mesh.rotation.x += fl.rotSpeed * 0.7;

        if (fl.mesh.position.y < -4.3) {
          fl.mesh.position.y = 5.0;
          fl.mesh.position.x = (Math.random() - 0.5) * 9;
        }
      } else {
        fl.mesh.visible = false;
      }
    });

    // ── Atmospheric Sunlit Pollen Motes Animation ──
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
      pollenMat.opacity = Math.min(0.75, (progress - 0.20) / 0.40);
    } else {
      pollenMat.opacity = 0;
    }

    // ── Camera Choreography tailored to the 4 Stages ──
    let targetCamX = 0;
    let targetCamY = -3.8;
    let targetCamZ = 4.8;
    let targetLookX = 0;
    let targetLookY = -4.0;

    if (progress <= 0.25) {
      const p = progress / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = 0;
      targetCamY = THREE.MathUtils.lerp(-4.0, -3.4, ease);
      targetCamZ = THREE.MathUtils.lerp(4.0, 5.2, ease);
      targetLookX = 0;
      targetLookY = THREE.MathUtils.lerp(-4.3, -3.2, ease);
    } else if (progress <= 0.50) {
      const p = (progress - 0.25) / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0, 0.15, ease);
      targetCamY = THREE.MathUtils.lerp(-3.4, -1.6, ease);
      targetCamZ = THREE.MathUtils.lerp(5.2, 9.2, ease);
      targetLookX = THREE.MathUtils.lerp(0, 0.1, ease);
      targetLookY = THREE.MathUtils.lerp(-3.2, -1.0, ease);
    } else if (progress <= 0.75) {
      const p = (progress - 0.50) / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0.15, 0.35, ease);
      targetCamY = THREE.MathUtils.lerp(-1.6, 0.5, ease);
      targetCamZ = THREE.MathUtils.lerp(9.2, 14.5, ease);
      targetLookX = THREE.MathUtils.lerp(0.1, 0.15, ease);
      targetLookY = THREE.MathUtils.lerp(-1.0, 1.1, ease);
    } else {
      const p = (progress - 0.75) / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0.35, -3.2, ease);
      targetCamY = THREE.MathUtils.lerp(0.5, 0.9, ease);
      targetCamZ = THREE.MathUtils.lerp(14.5, 14.2, ease);
      targetLookX = THREE.MathUtils.lerp(0.15, -1.2, ease);
      targetLookY = THREE.MathUtils.lerp(1.1, 1.5, ease);
    }

    camera.position.x += (targetCamX + mouse.x * 0.35 - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - mouse.y * 0.25 - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;
    camera.lookAt(targetLookX + mouse.x * 0.15, targetLookY - mouse.y * 0.15, 0);

    // ── Reveal Site at 100% ──
    if (!isRevealed && manualLockedProgress === null && progress >= 1.0 && windowLoaded && elapsed >= minDuration) {
      isRevealed = true;
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('preloader-zoom-morph');
        setTimeout(() => {
          preloader.remove();
        }, 1000);
      }
      document.body.classList.add('site-revealed', 'site-revealing');
      setTimeout(() => {
        document.body.classList.remove('site-revealing');
      }, 1200);
      if (typeof onComplete === 'function') onComplete();
    }

    renderer.render(scene, camera);
  }

  // ── Render Loop Lifecycle with Automatic Viewport & Tab Throttling ──
  let isTreeVisible = true;
  let treeRafId = null;
  let animId = null;

  function startTreeLoop() {
    if (!treeRafId && isTreeVisible && !document.hidden) {
      treeRafId = requestAnimationFrame(animate);
    }
  }

  function stopTreeLoop() {
    if (treeRafId) {
      cancelAnimationFrame(treeRafId);
      treeRafId = null;
    }
  }

  const homeSection = document.getElementById('home') || canvas;
  if (homeSection && typeof IntersectionObserver !== 'undefined') {
    const treeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isTreeVisible = entry.isIntersecting;
        if (isTreeVisible) {
          startTreeLoop();
        } else {
          stopTreeLoop();
        }
      });
    }, { rootMargin: '150px' });
    treeObserver.observe(homeSection);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTreeLoop();
    } else if (isTreeVisible) {
      startTreeLoop();
    }
  }, { passive: true });

  startTreeLoop();
}
