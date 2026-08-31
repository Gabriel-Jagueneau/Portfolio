// ─── 3D WebGL Cartoon Tree (Smooth Short-Segment Growth & Seamless Wood) ──────
// 1. Trunk and limbs subdivided into short, continuous, incremental segments.
// 2. Buttery-smooth progression without long popping chunks.
// 3. Branches sprout organically from leaf buds.
// 4. Knuckle joint spheres at every node for 100% seamless sculpted wood.
// 5. 800+ dense cartoon leaves blooming in layered volumes.

export function initWebGLTree(onComplete) {
  const canvas = document.getElementById('webgl-tree-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // ─── 1. Scene, Camera & Renderer ──────────────────────────────────────────
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ─── 2. Cartoon Lighting ──────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.95);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
  sunLight.position.set(12, 22, 16);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x81c784, 0.7);
  rimLight.position.set(-16, 10, -10);
  scene.add(rimLight);

  // ─── 3. Colors & Materials ────────────────────────────────────────────────
  const sproutGreen = new THREE.Color(0x66bb6a);
  const barkDarkBrown = new THREE.Color(0x5d4037);
  const barkLightBrown = new THREE.Color(0x6d4c41);

  const soilMat = new THREE.MeshLambertMaterial({
    color: 0x3e2723
  });

  // Natural Botanical Leaf Color Palette (7 Tones)
  const leafColors = [
    0x4caf50, // Fresh Grass Green
    0x2e7d32, // Deep Forest Green
    0x8bc34a, // Vibrant Spring Lime
    0x66bb6a, // Bright Foliage Green
    0x388e3c, // Lush Oak Green
    0xaed581, // Sunlit Tender Green
    0x1b5e20  // Deep Canopy Shadow Green
  ];

  const leafMaterials = leafColors.map(c => new THREE.MeshLambertMaterial({
    color: c,
    side: THREE.DoubleSide
  }));

  // Pointed Cartoon Leaf Geometry
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(-0.38, 0.55, 0, 1.25);
  leafShape.quadraticCurveTo(0.38, 0.55, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);

  // ─── 4. Scene Objects Hierarchy ───────────────────────────────────────────
  const treeGroup = new THREE.Group();
  scene.add(treeGroup);

  // Organic Mossy Green Ground Mound with Radial Alpha Gradient Fade
  const groundCanvas = document.createElement('canvas');
  groundCanvas.width = 512;
  groundCanvas.height = 512;
  const gCtx = groundCanvas.getContext('2d');

  const radGrad = gCtx.createRadialGradient(256, 256, 15, 256, 256, 250);
  radGrad.addColorStop(0.0, 'rgba(46, 125, 50, 0.95)');   // Rich deep mossy forest green
  radGrad.addColorStop(0.25, 'rgba(67, 160, 71, 0.85)');  // Lush botanical green
  radGrad.addColorStop(0.55, 'rgba(76, 175, 80, 0.50)');  // Fresh grassy green
  radGrad.addColorStop(0.80, 'rgba(129, 199, 132, 0.20)'); // Soft edge feathering
  radGrad.addColorStop(1.0, 'rgba(46, 125, 50, 0.00)');   // Completely seamless transparent!

  gCtx.fillStyle = radGrad;
  gCtx.fillRect(0, 0, 512, 512);

  const groundTexture = new THREE.CanvasTexture(groundCanvas);
  const groundMat = new THREE.MeshBasicMaterial({
    map: groundTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), groundMat);
  groundPlane.rotation.x = -Math.PI * 0.5;
  groundPlane.position.set(0, -4.41, 0);
  treeGroup.add(groundPlane);

  // ─── Detailed Ground Flora ────────────────────────────────────────────────
  const groundBlades = [];

  // 1. Multi-Layered Grass Tufts (90+ Blades in natural clumps)
  const grassGeo = new THREE.ConeGeometry(0.06, 0.42, 4);
  grassGeo.translate(0, 0.21, 0); // pivot at base

  for (let i = 0; i < 95; i++) {
    const grassMat = leafMaterials[i % leafMaterials.length];
    const grass = new THREE.Mesh(grassGeo, grassMat);

    // Clustered distribution around trunk base and fading outward
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

  // 2. 3D Moss Pillows / Cushions (Low soft mounds around roots)
  const mossGeo = new THREE.SphereGeometry(1, 8, 8);
  const mossMats = [
    new THREE.MeshLambertMaterial({ color: 0x2e7d32 }),
    new THREE.MeshLambertMaterial({ color: 0x388e3c }),
    new THREE.MeshLambertMaterial({ color: 0x558b2f }),
    new THREE.MeshLambertMaterial({ color: 0x689f38 })
  ];

  for (let m = 0; m < 14; m++) {
    const mMat = mossMats[m % mossMats.length];
    const moss = new THREE.Mesh(mossGeo, mMat);
    const mAngle = (m / 14) * Math.PI * 2 + Math.random() * 0.3;
    const mRad = 0.35 + Math.random() * 1.8;
    const sX = 0.22 + Math.random() * 0.28;
    const sY = 0.08 + Math.random() * 0.10;
    const sZ = 0.22 + Math.random() * 0.28;

    moss.position.set(Math.cos(mAngle) * mRad, -4.41 + sY * 0.5, Math.sin(mAngle) * mRad);
    moss.scale.set(sX, sY, sZ);
    treeGroup.add(moss);
  }

  // 3. Woodland 3-Leaf Clovers
  const cloverGeo = new THREE.ShapeGeometry(leafShape);
  for (let c = 0; c < 8; c++) {
    const cloverGroup = new THREE.Group();
    const cAngle = Math.random() * Math.PI * 2;
    const cRad = 0.6 + Math.random() * 1.6;
    cloverGroup.position.set(Math.cos(cAngle) * cRad, -4.40, Math.sin(cAngle) * cRad);

    const cMat = leafMaterials[(c * 2) % leafMaterials.length];
    for (let k = 0; k < 3; k++) {
      const leaflet = new THREE.Mesh(cloverGeo, cMat);
      leaflet.rotation.set(Math.PI * 0.45, 0, (k * Math.PI * 2) / 3);
      leaflet.scale.set(0.12, 0.12, 0.12);
      cloverGroup.add(leaflet);
    }
    treeGroup.add(cloverGroup);
  }

  // 4. Tiny Woodland Wildflowers (White & Yellow Petals with Golden Stamen)
  const petalGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const petalMat = new THREE.MeshLambertMaterial({ color: 0xfff9c4 });
  const centerMat = new THREE.MeshLambertMaterial({ color: 0xffd54f });

  for (let f = 0; f < 7; f++) {
    const flowerGroup = new THREE.Group();
    const fAngle = Math.random() * Math.PI * 2;
    const fRad = 0.7 + Math.random() * 1.5;
    flowerGroup.position.set(Math.cos(fAngle) * fRad, -4.38, Math.sin(fAngle) * fRad);

    // Center pistil
    const center = new THREE.Mesh(petalGeo, centerMat);
    center.scale.set(1.1, 0.8, 1.1);
    flowerGroup.add(center);

    // 5 Petals
    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const pAngle = (p / 5) * Math.PI * 2;
      petal.position.set(Math.cos(pAngle) * 0.07, 0, Math.sin(pAngle) * 0.07);
      petal.scale.set(1.3, 0.4, 0.9);
      flowerGroup.add(petal);
    }
    treeGroup.add(flowerGroup);
  }

  // 5. Cute Cartoon Forest Mushrooms (Red with white spots)
  const capGeo = new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.16, 6);
  const shroomCapMat = new THREE.MeshLambertMaterial({ color: 0xe53935 });
  const shroomStemMat = new THREE.MeshLambertMaterial({ color: 0xfff8e1 });

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
    shroom.add(stem);

    const cap = new THREE.Mesh(capGeo, shroomCapMat);
    cap.position.y = 0.16;
    shroom.add(cap);

    shroom.rotation.z = (Math.random() - 0.5) * 0.3;
    treeGroup.add(shroom);
  });

  // ─── 5. Seamless Branch & Node Hierarchy Engine ───────────────────────────
  const branches = [];
  const nodeLeafBuds = [];
  const leaves = [];

  function createNodeLeafBud(pos, startP, endP, scale = 0.35) {
    const budGroup = new THREE.Group();
    budGroup.position.copy(pos);
    budGroup.scale.set(0.0001, 0.0001, 0.0001);

    // 2-3 leaves around the node bud
    const numLeaves = 2 + Math.floor(Math.random() * 2);
    for (let k = 0; k < numLeaves; k++) {
      const mat = leafMaterials[k % leafMaterials.length];
      const leafMesh = new THREE.Mesh(leafGeo, mat);
      const angle = (k / numLeaves) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      leafMesh.rotation.set(
        0.35 + (Math.random() - 0.5) * 0.2,
        angle,
        (Math.random() - 0.5) * 0.3
      );
      leafMesh.scale.set(scale, scale, scale);
      budGroup.add(leafMesh);
    }

    treeGroup.add(budGroup);
    nodeLeafBuds.push({ group: budGroup, startP, endP, targetScale: scale });
    return budGroup;
  }

  function createBranch({ start, end, rStart, rEnd, startP, endP, turnBrownP = 1.0, isMainTrunk = false, hasNodeBud = false, nodeBudScale = 0.35 }) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();

    // Natural seamless cylinder base without bulbous swelling
    const overlap = Math.min(len * 0.15, rStart * 0.4);
    const geo = new THREE.CylinderGeometry(rEnd, rStart, len + overlap, 8);
    geo.translate(0, (len + overlap) * 0.5 - overlap, 0);

    const mat = new THREE.MeshLambertMaterial({
      color: sproutGreen.clone()
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(start);

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
    mesh.quaternion.copy(quat);

    mesh.scale.set(0.0001, 0.0001, 0.0001);
    treeGroup.add(mesh);

    // Add leaf bud at the branch node
    if (hasNodeBud) {
      createNodeLeafBud(start, Math.max(0, startP - 0.03), endP, nodeBudScale);
    }

    const branchObj = {
      mesh,
      mat,
      startP,
      endP,
      turnBrownP,
      isMainTrunk,
      rStart,
      rEnd,
      start,
      end,
      len,
      dir: dir.clone().normalize()
    };
    branches.push(branchObj);
    return branchObj;
  }

  // ─── 6. Continuous Fine Multi-Segment Trunk Spine (12 Short Segments) ─────
  // Progressive height steps from y = -4.40 to y = 2.80
  const trunkNodes = [
    new THREE.Vector3(0.00, -4.40, 0.00),  // 0
    new THREE.Vector3(0.01, -3.95, 0.01),  // 1
    new THREE.Vector3(0.02, -3.45, 0.02),  // 2
    new THREE.Vector3(0.03, -2.90, 0.03),  // 3
    new THREE.Vector3(0.02, -2.30, 0.04),  // 4
    new THREE.Vector3(-0.01, -1.65, 0.06), // 5 (First main branch fork!)
    new THREE.Vector3(-0.03, -0.95, 0.07), // 6
    new THREE.Vector3(0.02, -0.20, 0.02),  // 7 (Mid front/back fork!)
    new THREE.Vector3(0.08, 0.55, -0.02),  // 8
    new THREE.Vector3(0.14, 1.30, -0.04),  // 9
    new THREE.Vector3(0.18, 2.05, -0.02),  // 10
    new THREE.Vector3(0.21, 2.80, 0.00)   // 11 (Crown fork!)
  ];

  // Chained overlapping growth intervals along the 12 short spine segments
  const trunkRadii = [
    0.62, 0.58, 0.54, 0.50, 0.46, 0.42, 0.38, 0.34, 0.30, 0.26, 0.22, 0.18
  ];
  const trunkIntervals = [
    [0.00, 0.08, 0.30],
    [0.05, 0.13, 0.32],
    [0.10, 0.18, 0.35],
    [0.15, 0.24, 0.38],
    [0.20, 0.30, 0.42],
    [0.26, 0.37, 0.46],
    [0.33, 0.44, 0.50],
    [0.40, 0.52, 0.55],
    [0.48, 0.60, 0.62],
    [0.56, 0.68, 0.68],
    [0.64, 0.75, 0.74],
    [0.71, 0.82, 0.78]
  ];

  for (let s = 0; s < 11; s++) {
    createBranch({
      start: trunkNodes[s],
      end: trunkNodes[s + 1],
      rStart: trunkRadii[s],
      rEnd: trunkRadii[s + 1],
      startP: trunkIntervals[s][0],
      endP: trunkIntervals[s][1],
      turnBrownP: trunkIntervals[s][2],
      isMainTrunk: true,
      hasNodeBud: false
    });
  }

  // ─── 7. Progressive Multi-Segment Primary & Secondary Branches ───────────
  // Left Bough (Sprouting from node 5 at y = -1.65, from between leaves!)
  const bL_nodes = [
    trunkNodes[5],
    new THREE.Vector3(-0.8, -1.1, 0.3),
    new THREE.Vector3(-1.7, -0.4, 0.5),
    new THREE.Vector3(-2.6, 0.6, 0.7),
    new THREE.Vector3(-3.6, 1.8, 0.5)
  ];
  const bL_rad = [0.32, 0.26, 0.20, 0.15, 0.09];
  const bL_times = [
    [0.30, 0.42, 0.50],
    [0.38, 0.50, 0.56],
    [0.46, 0.58, 0.62],
    [0.54, 0.66, 0.70]
  ];
  for (let k = 0; k < 4; k++) {
    createBranch({
      start: bL_nodes[k],
      end: bL_nodes[k + 1],
      rStart: bL_rad[k],
      rEnd: bL_rad[k + 1],
      startP: bL_times[k][0],
      endP: bL_times[k][1],
      turnBrownP: bL_times[k][2],
      hasNodeBud: k === 0 || k === 2,
      nodeBudScale: 0.32
    });
  }

  // Right Bough (Sprouting from node 5 at y = -1.65, from between leaves!)
  const bR_nodes = [
    trunkNodes[5],
    new THREE.Vector3(0.9, -1.0, -0.2),
    new THREE.Vector3(2.0, -0.2, -0.4),
    new THREE.Vector3(3.2, 0.8, -0.5),
    new THREE.Vector3(4.3, 1.8, -0.2),
    new THREE.Vector3(5.1, 2.7, 0.1)
  ];
  const bR_rad = [0.34, 0.28, 0.22, 0.16, 0.11, 0.06];
  const bR_times = [
    [0.30, 0.42, 0.50],
    [0.38, 0.50, 0.56],
    [0.46, 0.58, 0.62],
    [0.54, 0.66, 0.70],
    [0.62, 0.74, 0.76]
  ];
  for (let k = 0; k < 5; k++) {
    createBranch({
      start: bR_nodes[k],
      end: bR_nodes[k + 1],
      rStart: bR_rad[k],
      rEnd: bR_rad[k + 1],
      startP: bR_times[k][0],
      endP: bR_times[k][1],
      turnBrownP: bR_times[k][2],
      hasNodeBud: k === 0 || k === 2,
      nodeBudScale: 0.32
    });
  }

  // Front & Back Mid Boughs (From node 7 at y = -0.20)
  const bF_nodes = [
    trunkNodes[7],
    new THREE.Vector3(0.6, 0.4, 1.0),
    new THREE.Vector3(1.2, 1.2, 1.8),
    new THREE.Vector3(1.7, 2.1, 2.5)
  ];
  const bF_rad = [0.26, 0.20, 0.14, 0.08];
  const bF_times = [
    [0.44, 0.56, 0.60],
    [0.52, 0.64, 0.66],
    [0.60, 0.72, 0.74]
  ];
  for (let k = 0; k < 3; k++) {
    createBranch({
      start: bF_nodes[k],
      end: bF_nodes[k + 1],
      rStart: bF_rad[k],
      rEnd: bF_rad[k + 1],
      startP: bF_times[k][0],
      endP: bF_times[k][1],
      turnBrownP: bF_times[k][2],
      hasNodeBud: k === 0,
      nodeBudScale: 0.30
    });
  }

  const bB_nodes = [
    trunkNodes[7],
    new THREE.Vector3(-0.6, 0.5, -0.9),
    new THREE.Vector3(-1.2, 1.3, -1.7),
    new THREE.Vector3(-1.7, 2.2, -2.4)
  ];
  const bB_rad = [0.26, 0.20, 0.14, 0.08];
  const bB_times = [
    [0.44, 0.56, 0.60],
    [0.52, 0.64, 0.66],
    [0.60, 0.72, 0.74]
  ];
  for (let k = 0; k < 3; k++) {
    createBranch({
      start: bB_nodes[k],
      end: bB_nodes[k + 1],
      rStart: bB_rad[k],
      rEnd: bB_rad[k + 1],
      startP: bB_times[k][0],
      endP: bB_times[k][1],
      turnBrownP: bB_times[k][2],
      hasNodeBud: k === 0,
      nodeBudScale: 0.30
    });
  }

  // Top Crown Limbs (From node 11 at y = 2.80)
  const bTop1_end = new THREE.Vector3(-0.7, 4.0, 0.2);
  const bTop2_end = new THREE.Vector3(0.9, 4.2, -0.3);
  const bTopCrown_end = new THREE.Vector3(0.2, 4.8, 0.0);
  createBranch({ start: trunkNodes[11], end: bTop1_end, rStart: 0.18, rEnd: 0.10, startP: 0.68, endP: 0.80, turnBrownP: 0.80, hasNodeBud: true });
  createBranch({ start: trunkNodes[11], end: bTop2_end, rStart: 0.18, rEnd: 0.10, startP: 0.70, endP: 0.82, turnBrownP: 0.80, hasNodeBud: true });
  createBranch({ start: trunkNodes[11], end: bTopCrown_end, rStart: 0.18, rEnd: 0.09, startP: 0.72, endP: 0.84, turnBrownP: 0.82, hasNodeBud: true });

  // ─── 8. Twigs (Short Delicate Sub-Branches) ──────────────────────────────
  const twigs = [
    [bL_nodes[2], new THREE.Vector3(-2.2, 0.0, 0.9), 0.58, 0.72],
    [bL_nodes[3], new THREE.Vector3(-3.2, 1.2, 1.2), 0.66, 0.80],
    [bL_nodes[4], new THREE.Vector3(-4.4, 2.6, 0.6), 0.74, 0.88],
    [bR_nodes[2], new THREE.Vector3(2.6, 0.4, 0.6), 0.58, 0.72],
    [bR_nodes[3], new THREE.Vector3(3.8, 1.4, -1.0), 0.66, 0.80],
    [bR_nodes[4], new THREE.Vector3(4.8, 2.6, -0.7), 0.74, 0.88],
    [bR_nodes[5], new THREE.Vector3(5.7, 3.3, 0.2), 0.78, 0.92],
    [bF_nodes[2], new THREE.Vector3(0.6, 1.9, 2.1), 0.68, 0.82],
    [bF_nodes[3], new THREE.Vector3(2.3, 2.8, 2.8), 0.76, 0.90],
    [bB_nodes[2], new THREE.Vector3(-1.7, 1.9, -1.2), 0.68, 0.82],
    [bB_nodes[3], new THREE.Vector3(-2.3, 3.0, -2.7), 0.76, 0.90],
    [bTop1_end, new THREE.Vector3(-1.4, 4.7, 0.7), 0.78, 0.92],
    [bTop1_end, new THREE.Vector3(-0.3, 5.0, -0.5), 0.80, 0.94],
    [bTop2_end, new THREE.Vector3(1.6, 4.9, 0.3), 0.78, 0.92],
    [bTop2_end, new THREE.Vector3(0.5, 5.1, -1.0), 0.80, 0.94],
    [bTopCrown_end, new THREE.Vector3(-0.5, 5.5, 0.3), 0.82, 0.95],
    [bTopCrown_end, new THREE.Vector3(0.6, 5.6, -0.4), 0.82, 0.95]
  ];

  twigs.forEach(([start, end, startP, endP]) => {
    createBranch({ start, end, rStart: 0.09, rEnd: 0.03, startP, endP, turnBrownP: 0.88, hasNodeBud: true, nodeBudScale: 0.22 });
  });

  // ─── 9. High-Density Foliage Canopy (800+ Leaves across 24 Volumes) ────────
  function addDenseCanopyCluster(center, count, radiusX, radiusY, radiusZ, bloomStartP, bloomEndP) {
    for (let i = 0; i < count; i++) {
      const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
      const leaf = new THREE.Mesh(leafGeo, mat);

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
        bloomStartP: bloomStartP + (Math.random() - 0.5) * 0.05,
        bloomEndP: bloomEndP + (Math.random() - 0.5) * 0.05,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.5 + Math.random() * 1.8,
        origRot: leaf.rotation.clone()
      });
    }
  }

  // 24 Dense Canopy Cloud Volumes:
  // Phase A (50% -> 75%): First lower canopy leaves bloom
  addDenseCanopyCluster(bL_nodes[3], 45, 1.2, 1.0, 1.2, 0.52, 0.68);
  addDenseCanopyCluster(bL_nodes[4], 50, 1.3, 1.1, 1.3, 0.58, 0.74);
  addDenseCanopyCluster(bR_nodes[2], 35, 1.1, 0.9, 1.1, 0.52, 0.68);
  addDenseCanopyCluster(bR_nodes[3], 55, 1.3, 1.1, 1.3, 0.56, 0.72);
  addDenseCanopyCluster(bF_nodes[2], 35, 1.1, 0.9, 1.1, 0.54, 0.70);
  addDenseCanopyCluster(bB_nodes[2], 35, 1.1, 0.9, 1.1, 0.54, 0.70);
  addDenseCanopyCluster(new THREE.Vector3(0.0, 1.8, 0.0), 45, 1.4, 1.2, 1.4, 0.56, 0.72);

  // Phase B (75% -> 100%): Full massive crown and sprawling branches bloom
  addDenseCanopyCluster(bTopCrown_end, 65, 1.4, 1.3, 1.4, 0.74, 0.92);
  addDenseCanopyCluster(new THREE.Vector3(0.0, 4.8, 0.0), 60, 1.5, 1.2, 1.5, 0.76, 0.94);
  addDenseCanopyCluster(bTop1_end, 45, 1.2, 1.0, 1.2, 0.74, 0.90);
  addDenseCanopyCluster(bTop2_end, 45, 1.2, 1.0, 1.2, 0.75, 0.91);
  addDenseCanopyCluster(new THREE.Vector3(-1.0, 4.2, 0.4), 50, 1.3, 1.1, 1.3, 0.76, 0.92);
  addDenseCanopyCluster(new THREE.Vector3(1.2, 4.3, -0.3), 50, 1.3, 1.1, 1.3, 0.77, 0.93);
  addDenseCanopyCluster(bF_nodes[3], 45, 1.2, 1.0, 1.2, 0.72, 0.88);
  addDenseCanopyCluster(new THREE.Vector3(1.8, 2.8, 2.4), 40, 1.1, 1.0, 1.1, 0.75, 0.91);
  addDenseCanopyCluster(bB_nodes[3], 45, 1.2, 1.0, 1.2, 0.72, 0.88);
  addDenseCanopyCluster(new THREE.Vector3(-2.0, 3.0, -2.2), 40, 1.1, 1.0, 1.1, 0.75, 0.91);
  addDenseCanopyCluster(bR_nodes[4], 65, 1.4, 1.2, 1.4, 0.72, 0.88);
  addDenseCanopyCluster(bR_nodes[5], 60, 1.4, 1.2, 1.4, 0.75, 0.92);
  addDenseCanopyCluster(new THREE.Vector3(4.2, 3.5, -0.4), 55, 1.3, 1.1, 1.3, 0.78, 0.94);
  addDenseCanopyCluster(new THREE.Vector3(5.2, 2.4, 0.4), 50, 1.2, 1.0, 1.2, 0.78, 0.94);
  addDenseCanopyCluster(new THREE.Vector3(-3.2, 2.8, 0.7), 40, 1.1, 1.0, 1.1, 0.76, 0.92);
  addDenseCanopyCluster(new THREE.Vector3(1.5, 3.0, 0.2), 50, 1.5, 1.3, 1.5, 0.75, 0.91);
  addDenseCanopyCluster(new THREE.Vector3(-1.0, 2.8, -0.2), 45, 1.4, 1.2, 1.4, 0.74, 0.90);

  // ─── 10. Floating Breeze Leaves ───────────────────────────────────────────
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
    treeGroup.add(fLeaf);

    floatingLeaves.push({
      mesh: fLeaf,
      vy: -0.012 - Math.random() * 0.02,
      vx: 0.008 + Math.random() * 0.02,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      spawnP: 0.72 + Math.random() * 0.22
    });
  }

  // ─── 11. Mouse Parallax & Resizing ────────────────────────────────────────
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

  // ─── 12. Real Page Loading State & Staging Caps ───────────────────────────
  let domReady = (document.readyState === 'interactive' || document.readyState === 'complete');
  let windowLoaded = (document.readyState === 'complete');
  let imagesLoaded = false;

  if (!domReady) {
    document.addEventListener('DOMContentLoaded', () => { domReady = true; }, { once: true });
  }

  // Preload and monitor critical images on page
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

  // ─── 13. Animation Loop (Minimum 5.0s & Hold Caps) ─────────────────────────
  const startTime = performance.now();
  const minDuration = 5000; // Minimum 5.0s duration
  let currentProgress = 0.0;
  let isRevealed = false;
  let animId = null;

  function animate(now) {
    animId = requestAnimationFrame(animate);

    const elapsed = now - startTime; // in ms
    const elapsedSec = elapsed / 1000; // in seconds for physics & smooth wind sway
    const timeProgress = Math.min(1.0, elapsed / minDuration); // 0.0 -> 1.0 over 5.0s

    // Real-time Loading Caps:
    // 0% -> 25%: Initial sprout always grows freely.
    // Cap at 25% if DOM is not ready.
    // Cap at 50% if critical scripts/DOM still processing.
    // Cap at 75% if images/fonts not loaded.
    // Cap at 99% until window is completely loaded AND at least 5.0s have elapsed.
    let maxAllowedCap = 0.25;
    if (domReady) maxAllowedCap = 0.50;
    if (domReady && (imagesLoaded || loadedImgCount >= Math.max(1, totalImgs * 0.5))) maxAllowedCap = 0.75;
    if (domReady && imagesLoaded && windowLoaded) maxAllowedCap = 1.0;

    const targetProgress = Math.min(timeProgress, maxAllowedCap);

    // Smooth botanical interpolation
    const lerpSpeed = (targetProgress >= 0.99 && currentProgress >= 0.98) ? 0.05 : 0.08;
    currentProgress += (targetProgress - currentProgress) * lerpSpeed;

    // Hard threshold for completion: must have elapsed >= 5000ms and windowLoaded
    let progress = currentProgress;
    if (timeProgress >= 1.0 && windowLoaded && (1.0 - progress) < 0.005) {
      progress = 1.0;
      currentProgress = 1.0;
    }

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // ── Live Top Loader Capsule Bar & Percentage Update ──
    const loaderFill = document.getElementById('nav-loader-fill');
    const loaderPercent = document.getElementById('nav-loader-percent');
    if (loaderFill) {
      loaderFill.style.width = (progress * 100).toFixed(0) + '%';
    }
    if (loaderPercent) {
      loaderPercent.textContent = (progress * 100).toFixed(0) + '%';
    }

    // ── Milestone Growth: Trunk & Branch Cylinders ──
    branches.forEach((b) => {
      if (progress < b.startP) {
        b.mesh.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        const span = b.endP - b.startP;
        const localP = Math.min(1.0, (progress - b.startP) / span);
        // Smooth progressive growth along length (Y)
        const easeLen = localP * localP * (3 - 2 * localP);

        // Continuous thickness expansion
        let thicknessFactor = 0.05 + 0.95 * Math.max(0, (progress - b.startP) / (1.0 - b.startP));
        if (b.isMainTrunk) {
          if (progress < 0.25) {
            // Ultra-fine delicate green sprout strand (starts at 0.015 radius)
            thicknessFactor = 0.015 + 0.035 * (progress / 0.25);
          } else if (progress < 0.50) {
            // Growing shoot expanding from 0.05 to 0.30
            thicknessFactor = 0.05 + 0.25 * ((progress - 0.25) / 0.25);
          } else if (progress < 0.75) {
            // Thickening into oak trunk (0.30 -> 0.70)
            thicknessFactor = 0.30 + 0.40 * ((progress - 0.50) / 0.25);
          } else {
            // Full massive oak trunk (0.70 -> 1.0)
            thicknessFactor = 0.70 + 0.30 * ((progress - 0.75) / 0.25);
          }
        }
        b.mesh.scale.set(thicknessFactor, easeLen, thicknessFactor);

        // Dynamic Color Transition: Stays green at <25%, turns brown progressively
        if (progress < 0.25) {
          b.mat.color.copy(sproutGreen);
        } else if (progress >= b.turnBrownP) {
          const brownP = Math.min(1.0, (progress - b.turnBrownP) / 0.20);
          b.mat.color.lerpColors(sproutGreen, b.isMainTrunk ? barkDarkBrown : barkLightBrown, brownP);
        }
      }
    });

    // ── Node Leaf Buds (Branches visually sprout from these leaves!) ──
    nodeLeafBuds.forEach((bud) => {
      if (progress < bud.startP) {
        bud.group.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        const span = Math.max(0.04, bud.endP - bud.startP);
        const p = Math.min(1.0, (progress - bud.startP) / span);
        const ease = p * p * (3 - 2 * p);
        const s = bud.targetScale * ease;
        bud.group.scale.set(s, s, s);
      }
    });

    // ── Dense Leaf Canopy Blooms (50% -> 100%) ──
    leaves.forEach((l) => {
      if (progress < l.bloomStartP) {
        l.mesh.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        const span = Math.max(0.05, l.bloomEndP - l.bloomStartP);
        const p = Math.min(1.0, (progress - l.bloomStartP) / span);
        // Elastic cartoon pop overshoot
        const overshoot = Math.sin(p * Math.PI * 0.5) * (1 + 0.22 * (1 - p));
        const s = l.targetScale * overshoot;
        l.mesh.scale.set(s, s, s);

        // Soft gentle leaf fluttering in wind
        l.mesh.rotation.z = l.origRot.z + Math.sin(elapsedSec * l.swaySpeed + l.swayPhase) * 0.05;
        l.mesh.rotation.x = l.origRot.x + Math.cos(elapsedSec * (l.swaySpeed * 0.8) + l.swayPhase) * 0.03;
      }
    });

    // ── Soft Ground Grass Blades Swaying in Breeze ──
    groundBlades.forEach((gb) => {
      gb.mesh.rotation.z = gb.baseRotZ + Math.sin(elapsedSec * gb.swaySpeed + gb.phase) * 0.04;
    });

    // ── Floating Breeze Leaves (75% -> 100%) ──
    floatingLeaves.forEach((fl) => {
      if (progress >= fl.spawnP) {
        fl.mesh.visible = true;
        fl.mesh.position.y += fl.vy;
        fl.mesh.position.x += fl.vx;
        fl.mesh.rotation.z += fl.rotSpeed;
        fl.mesh.rotation.x += fl.rotSpeed * 0.7;

        if (fl.mesh.position.y < -4.3) {
          fl.mesh.position.y = 5.0;
          fl.mesh.position.x = (Math.random() - 0.5) * 9;
        }
      }
    });

    // ── Camera Choreography tailored to the 4 Milestones ──
    let targetCamX = 0;
    let targetCamY = -3.8;
    let targetCamZ = 4.8;
    let targetLookX = 0;
    let targetLookY = -4.0;

    if (progress < 0.25) {
      // Macro close-up on the tiny green sprout
      const p = progress / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = 0;
      targetCamY = THREE.MathUtils.lerp(-4.0, -3.6, ease);
      targetCamZ = THREE.MathUtils.lerp(4.2, 5.2, ease);
      targetLookX = 0;
      targetLookY = THREE.MathUtils.lerp(-4.3, -3.6, ease);
    } else if (progress < 0.50) {
      // 25% -> 50%: Pull back as first branches emerge and base thickens
      const p = (progress - 0.25) / 0.25;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0, 0.15, ease);
      targetCamY = THREE.MathUtils.lerp(-3.6, -1.8, ease);
      targetCamZ = THREE.MathUtils.lerp(5.2, 9.0, ease);
      targetLookX = THREE.MathUtils.lerp(0, 0.1, ease);
      targetLookY = THREE.MathUtils.lerp(-3.6, -1.2, ease);
    } else if (progress < 0.80) {
      // 50% -> 80%: Framing the expanding branching and canopy foliage
      const p = (progress - 0.50) / 0.30;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0.15, 0.35, ease);
      targetCamY = THREE.MathUtils.lerp(-1.8, 0.4, ease);
      targetCamZ = THREE.MathUtils.lerp(9.0, 14.5, ease);
      targetLookX = THREE.MathUtils.lerp(0.1, 0.15, ease);
      targetLookY = THREE.MathUtils.lerp(-1.2, 1.0, ease);
    } else {
      // 80% -> 100%: Long, gentle, silky transition (over 1.0s) to the left background framing
      const p = (progress - 0.80) / 0.20;
      const ease = p * p * (3 - 2 * p);
      targetCamX = THREE.MathUtils.lerp(0.35, -3.2, ease);
      targetCamY = THREE.MathUtils.lerp(0.4, 0.9, ease);
      targetCamZ = THREE.MathUtils.lerp(14.5, 14.2, ease);
      targetLookX = THREE.MathUtils.lerp(0.15, -1.2, ease);
      targetLookY = THREE.MathUtils.lerp(1.0, 1.5, ease);
    }

    // Mouse parallax
    camera.position.x += (targetCamX + mouse.x * 0.35 - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - mouse.y * 0.25 - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;

    camera.lookAt(targetLookX + mouse.x * 0.15, targetLookY - mouse.y * 0.15, 0);

    // ── Reveal Site at 100% (Minimum 5.0s & Full Load Guaranteed) ──
    if (!isRevealed && progress >= 1.0 && windowLoaded && elapsed >= minDuration) {
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

  requestAnimationFrame(animate);
}
