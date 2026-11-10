// ═══════════════════════════════════════════════════════════════════════════════
//  3D MacBook Pro M3 16" (2024) — Model-Viewer & Three.js Integration
//
// Features:
//   - Three.js internal scene access via Symbol('scene')
//   - Space Grey / Matte Midnight finish (anti-reflective bead-blasted aluminum)
//   - Deep Retina Black glass display screen (no old painted background)
//   - Mathematical 4-point projective homography for sticky mini-macOS tracking
//   - Total zoom/drag interaction lock on the 3D model
//   - Smooth physical hinge rotation on page scroll with full software opacity
// ═══════════════════════════════════════════════════════════════════════════════

import { updateDimensions } from './cards-physics.js';

export const MATTE_GREY_CONFIG = {
  // Coque unibody principale et capot arrière (anodisé microbillé anti-reflet)
  mainCasing: [
    'RyKTMHTpkkwQkvB', 'lmWQsEjxpsebDlK', 'bsEIHfblEXNcUMs', 'YYwBgwvcyZVOOAA',
    'SLGkCohDDelqXBu', 'XCYkeTCxqFmKTKe', 'MycfwscjQZRVSoj'
  ],
  // Trackpad en verre dépoli
  trackpad: ['LpqXZqhaGCeSzdu'],
  // Grilles de haut-parleurs & repose-poignets
  grilles: ['gMtYExgrEUqPfln'],
  // Chanfreins, ports, encadrements et contours
  edges: [
    'iyDJFXmHelnMTbD', 'CRQixVLpahJzhJc', 'gOXiFODBFKnUyyU',
    'UBYmHfGRfHbOXyc', 'SABLxXNNESCdgUy', 'WDumMKBWVQxmraD', 'KclpPzxoRwZAoer'
  ],
  // Cylindre de charnière & garniture inférieure
  hinge: ['wjAYtisbflXilXi', 'ZCDwChwkbBfITSW', 'zobIbiekuagXEVU'],
  // Pomme Apple discrète (finition satinée anti-éblouissement)
  appleLogo: ['CdgEAaPUlrQWQuD']
};

export function applyMidnightFinish(scene, envIntensity = 0.22) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (mat.name === 'sfCQkHOWyrsLmor') {
          // Écran Retina noir d'encre pur (géré à part)
          return;
        }
        if (MATTE_GREY_CONFIG.mainCasing.includes(mat.name)) {
          mat.color.set(0x24262c); // Gris anthracite neutre et élégant
          mat.roughness = 0.85;   // Rendu mat, diffusion douce de la lumière (anti-glare)
          mat.metalness = 0.16;   // Réflectance atténuée pour éliminer tout flash
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else if (MATTE_GREY_CONFIG.trackpad.includes(mat.name)) {
          mat.color.set(0x282a30); // Contraste verre dépoli trackpad
          mat.roughness = 0.75;
          mat.metalness = 0.15;
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else if (MATTE_GREY_CONFIG.grilles.includes(mat.name)) {
          mat.color.set(0x1d1f23); // Perforations sombres
          mat.roughness = 0.85;
          mat.metalness = 0.20;
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else if (MATTE_GREY_CONFIG.edges.includes(mat.name)) {
          mat.color.set(0x1a1c20);
          mat.roughness = 0.80;
          mat.metalness = 0.20;
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else if (MATTE_GREY_CONFIG.hinge.includes(mat.name)) {
          mat.color.set(0x181a1e);
          mat.roughness = 0.75;
          mat.metalness = 0.25;
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else if (MATTE_GREY_CONFIG.appleLogo.includes(mat.name)) {
          mat.color.set(0x181a1e); // Logo discret, finition subtile sans effet miroir
          mat.roughness = 0.50;
          mat.metalness = 0.35;
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        } else {
          // Matériaux résiduels du modèle
          mat.roughness = Math.max(mat.roughness || 0.5, 0.75);
          mat.metalness = Math.min(mat.metalness || 0.2, 0.25);
          mat.envMapIntensity = envIntensity;
          mat.needsUpdate = true;
        }
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3D Screen Direct Texture Rendering (WebGL CanvasTexture)
// ═══════════════════════════════════════════════════════════════════════════════

export function drawMacScreenTexture(canvas, onReady) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  function roundRect(ctx, x, y, width, height, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  let bgImg = null;

  const render = () => {
    // 1. Fond d'écran macOS étendu jusqu'en haut sous la barre des menus
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#060812');
      bgGrad.addColorStop(0.35, '#0d1124');
      bgGrad.addColorStop(0.7, '#130d22');
      bgGrad.addColorStop(1, '#05060c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Halos lumineux diffus
      const glow1 = ctx.createRadialGradient(380, 260, 40, 380, 260, 680);
      glow1.addColorStop(0, 'rgba(99, 102, 241, 0.32)');
      glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, w, h);

      const glow2 = ctx.createRadialGradient(1720, 960, 60, 1720, 960, 720);
      glow2.addColorStop(0, 'rgba(236, 72, 153, 0.24)');
      glow2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, w, h);

      const glow3 = ctx.createRadialGradient(1024, 600, 50, 1024, 600, 750);
      glow3.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      glow3.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow3;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Barre des menus macOS (Haut - Translucide avec effet de transparence)
    ctx.fillStyle = 'rgba(12, 15, 26, 0.65)';
    ctx.fillRect(0, 0, w, 44);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(w, 44);
    ctx.stroke();

    // Menu gauche
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('', 32, 29);

    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('GabrielOS', 64, 28);

    ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const menuItems = ['Fichier', 'Édition', 'Présentation', 'Projets', 'Compétences', 'Fenêtre', 'Aide'];
    let mx = 175;
    menuItems.forEach((item) => {
      ctx.fillText(item, mx, 28);
      mx += ctx.measureText(item).width + 24;
    });

    // NOTE : Le châssis 3D physique du MacBook intègre déjà la Dynamic Island / notch au centre (x ≈ 1024, y: 0 à 42px).
    // On laisse donc cet espace central vierge pour une découpe matérielle 3D authentique !

    // Menu droite
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';

    // Batterie
    const batX = w - 240;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    roundRect(ctx, batX, 17, 24, 12, 3);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    roundRect(ctx, batX + 2, 19, 18, 8, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('100%', batX + 32, 28);

    // Wi-Fi
    const wifiX = w - 150;
    ctx.fillText('􀙇 Wi-Fi', wifiX, 28);

    // Heure
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Dim. 19:42', w - 95, 28);

    // 3. Fenêtre Terminal Authentique avec Fastfetch (miniOS de Gabriel JAGUENEAU)
    const winX = 220;
    const winY = 100;
    const winW = 1260;
    const winH = 780;
    const winRadius = 16;

    // Ombre portée profonde
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 30;
    ctx.fillStyle = '#0c0f18';
    roundRect(ctx, winX, winY, winW, winH, winRadius);
    ctx.fill();
    ctx.restore();

    // Bordure fenêtre subtile
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.2;
    roundRect(ctx, winX, winY, winW, winH, winRadius);
    ctx.stroke();

    // Header Terminal (Barre de titre macOS)
    const headerH = 48;
    ctx.fillStyle = '#141824';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(winX + winRadius, winY);
    ctx.lineTo(winX + winW - winRadius, winY);
    ctx.quadraticCurveTo(winX + winW, winY, winX + winW, winY + winRadius);
    ctx.lineTo(winX + winW, winY + headerH);
    ctx.lineTo(winX, winY + headerH);
    ctx.lineTo(winX, winY + winRadius);
    ctx.quadraticCurveTo(winX, winY, winX + winRadius, winY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Boutons macOS (Rouge, Jaune, Vert)
    const btnY = winY + 24;
    const btnRadius = 7;
    const buttons = [
      { x: winX + 28, color: '#ff5f56', border: '#e0443e' },
      { x: winX + 50, color: '#ffbd2e', border: '#dea123' },
      { x: winX + 72, color: '#27c93f', border: '#1aab29' }
    ];
    buttons.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, btnY, btnRadius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = b.border;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Titre de la fenêtre centré
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('gabriel — -zsh — 80×24', winX + winW / 2, winY + 29);
    ctx.textAlign = 'start';

    // 4. Fond sombre et vitré du Terminal
    ctx.fillStyle = '#0a0d16';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(winX, winY + headerH);
    ctx.lineTo(winX + winW, winY + headerH);
    ctx.lineTo(winX + winW, winY + winH - winRadius);
    ctx.quadraticCurveTo(winX + winW, winY + winH, winX + winW - winRadius, winY + winH);
    ctx.lineTo(winX + winRadius, winY + winH);
    ctx.quadraticCurveTo(winX, winY + winH, winX, winY + winH - winRadius);
    ctx.lineTo(winX, winY + headerH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Intérieur du Terminal : Fastfetch & Invites de commande
    const termPaddingX = winX + 40;
    let lineY = winY + headerH + 36;

    // Prompt initial
    ctx.font = '14px "SF Mono", Monaco, Menlo, Consolas, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('gabriel@macbook-pro', termPaddingX, lineY);
    let promptLen = ctx.measureText('gabriel@macbook-pro').width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(':', termPaddingX + promptLen, lineY);
    promptLen += ctx.measureText(':').width;
    ctx.fillStyle = '#6366f1';
    ctx.fillText('~', termPaddingX + promptLen, lineY);
    promptLen += ctx.measureText('~').width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('$ fastfetch', termPaddingX + promptLen, lineY);

    lineY += 36;

    // Colonne Gauche : Logo Apple ASCII artistique
    const asciiX = termPaddingX + 10;
    const asciiLines = [
      '                    .:\'',
      '                 __ :\'__',
      '              .\'`__`-\'__``.',
      '             :__________.-\'',
      '             :_________:',
      '              :_________`-;',
      '               `.__.-.__.\''
    ];
    const asciiGrad = ctx.createLinearGradient(asciiX, lineY, asciiX + 260, lineY + 220);
    asciiGrad.addColorStop(0, '#38bdf8');
    asciiGrad.addColorStop(0.5, '#6366f1');
    asciiGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = asciiGrad;
    ctx.font = 'bold 18px monospace';
    let aY = lineY + 30;
    asciiLines.forEach((al) => {
      ctx.fillText(al, asciiX, aY);
      aY += 28;
    });

    // Colonne Droite : Spécifications Fastfetch de Gabriel
    const infoX = termPaddingX + 320;
    let iY = lineY + 20;

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('gabriel@macbook-pro', infoX, iY);
    iY += 24;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(infoX, iY);
    ctx.lineTo(infoX + 380, iY);
    ctx.stroke();
    iY += 24;

    const specs = [
      { label: 'OS', val: 'macOS Sonoma 14.4.1 (23E224) aarch64' },
      { label: 'Host', val: 'MacBook Pro 16" (M3 Max, Nov 2024)' },
      { label: 'Kernel', val: 'Darwin 23.4.0' },
      { label: 'Uptime', val: '42 days, 13 hours, 28 mins' },
      { label: 'Packages', val: '112 (brew), 14 (cargo)' },
      { label: 'Shell', val: 'zsh 5.9' },
      { label: 'Display', val: '3456x2234 @ 120Hz Liquid Retina XDR' },
      { label: 'DE', val: 'Aqua (macOS)' },
      { label: 'WM', val: 'Quartz Compositor' },
      { label: 'CPU', val: 'Apple M3 Max (16 cores: 12P + 4E)' },
      { label: 'GPU', val: 'Apple M3 Max (40 cores)' },
      { label: 'Memory', val: '18.4 GiB / 36.0 GiB (Unified)' },
      { label: 'Roles', val: 'Ingénieur Agronome & Dev Multi-stack' },
      { label: 'Status', val: 'Étudiant-Entrepreneur (Disponible)' }
    ];

    ctx.font = '13.5px "SF Mono", Monaco, Menlo, Consolas, monospace';
    specs.forEach((s) => {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(s.label + ':', infoX, iY);
      ctx.fillStyle = (s.label === 'Roles' || s.label === 'Status') ? '#22c55e' : '#e2e8f0';
      ctx.fillText(s.val, infoX + 95, iY);
      iY += 24;
    });

    // Invite terminal suivante avec curseur
    iY += 22;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('gabriel@macbook-pro', infoX, iY);
    let p2 = ctx.measureText('gabriel@macbook-pro').width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(':', infoX + p2, iY);
    p2 += ctx.measureText(':').width;
    ctx.fillStyle = '#6366f1';
    ctx.fillText('~', infoX + p2, iY);
    p2 += ctx.measureText('~').width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('$ portfolio --interactive', infoX + p2, iY);
    p2 += ctx.measureText('$ portfolio --interactive').width;
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(' ▌', infoX + p2, iY);

    // 5. macOS Dock en bas
    const dockW = 540;
    const dockH = 74;
    const dockX = (w - dockW) / 2;
    const dockY = h - dockH - 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    roundRect(ctx, dockX, dockY, dockW, dockH, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const dockIcons = [
      { name: 'Finder', color: '#38bdf8', symbol: '☺' },
      { name: 'Safari', color: '#0284c7', symbol: '🧭' },
      { name: 'Terminal', color: '#1e293b', symbol: '>_' },
      { name: 'Code', color: '#2563eb', symbol: '⚡' },
      { name: 'Music', color: '#ef4444', symbol: '♫' },
      { name: 'Calculator', color: '#f59e0b', symbol: '±' },
      { name: 'Settings', color: '#64748b', symbol: '⚙' },
      { name: 'Trash', color: '#475569', symbol: '🗑' }
    ];
    const iconSize = 48;
    const spacing = (dockW - dockIcons.length * iconSize) / (dockIcons.length + 1);
    dockIcons.forEach((icon, i) => {
      const ix = dockX + spacing + i * (iconSize + spacing);
      const iy = dockY + (dockH - iconSize) / 2;
      ctx.fillStyle = icon.color;
      roundRect(ctx, ix, iy, iconSize, iconSize, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(icon.symbol, ix + iconSize / 2, iy + 32);
      ctx.textAlign = 'start';

      if (i < 4) {
        ctx.beginPath();
        ctx.arc(ix + iconSize / 2, dockY + dockH - 6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
      }
    });
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    bgImg = img;
    render();
    if (onReady) onReady();
  };
  img.onerror = () => {
    // Si l'image n'est pas trouvée, le gradient personnalisé est conservé
  };
  img.src = 'images/macos-brand-wallpaper.jpg';

  render();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3D Screen Projection & Sticky Tracking Math for Interactive miniOS
// ═══════════════════════════════════════════════════════════════════════════════

// Exact 3D local corners of the active display mesh (Object_123)
const SCREEN_CORNER_COORDS = [
  { x: -17.1925, y: -20.7582, z: -22.2069 }, // Haut de l'écran (position ouverte)
  { x: 17.1925, y: -20.7582, z: -22.2069 },
  { x: -17.1925, y: -13.1548, z: -1.2920 }, // Bas de l'écran (près de la charnière)
  { x: 17.1925, y: -13.1548, z: -1.2920 }
];

// Computes 4-point projective transform (homography) from unit rectangle to destination quad
function solvePerspectiveTransform(src, dst) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x, sy = src[i].y;
    const dx = dst[i].x, dy = dst[i].y;
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];
    if (Math.abs(A[i][i]) < 1e-9) return null;
    for (let k = i + 1; k < n; k++) {
      const c = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) A[k][j] -= c * A[i][j];
      b[k] -= c * b[i];
    }
  }
  const h = new Array(8);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) sum -= A[i][j] * h[j];
    h[i] = sum / A[i][i];
  }
  return [
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0, 0, 1, 0,
    h[2], h[5], 0, 1
  ];
}

function updateStickyScreen(screenDisplayMesh, threeScene, insideEl, modelViewer, rotationAngle = 0) {
  if (!screenDisplayMesh || !threeScene || !modelViewer || !insideEl) return;

  const mvW = modelViewer.clientWidth;
  const mvH = modelViewer.clientHeight;
  if (mvW <= 0 || mvH <= 0) return;

  const Vector3 = screenDisplayMesh.position.constructor;
  screenDisplayMesh.updateWorldMatrix(true, false);

  const projected = SCREEN_CORNER_COORDS.map((c) => {
    const v = new Vector3(c.x, c.y, c.z);
    v.applyMatrix4(screenDisplayMesh.matrixWorld);
    v.project(threeScene.camera);
    return {
      x: (v.x * 0.5 + 0.5) * mvW,
      y: (-v.y * 0.5 + 0.5) * mvH,
      z: v.z
    };
  });

  const sortedByY = [...projected].sort((a, b) => a.y - b.y);
  const topTwo = [sortedByY[0], sortedByY[1]].sort((a, b) => a.x - b.x);
  const bottomTwo = [sortedByY[2], sortedByY[3]].sort((a, b) => a.x - b.x);

  // Centrage de précision subpixel horizontal (OFFSET_X)
  const OFFSET_X = 0.5;
  const OFFSET_Y = 0;
  const pTL = { x: topTwo[0].x + OFFSET_X, y: topTwo[0].y + OFFSET_Y, z: topTwo[0].z };
  const pTR = { x: topTwo[1].x + OFFSET_X, y: topTwo[1].y + OFFSET_Y, z: topTwo[1].z };
  const pBL = { x: bottomTwo[0].x + OFFSET_X, y: bottomTwo[0].y + OFFSET_Y, z: bottomTwo[0].z };
  const pBR = { x: bottomTwo[1].x + OFFSET_X, y: bottomTwo[1].y + OFFSET_Y, z: bottomTwo[1].z };

  // Micro-ajustement (0.6px) des coins projetés pour assurer un recouvrement 100% continu sans liseré
  const cx = (pTL.x + pTR.x + pBL.x + pBR.x) * 0.25;
  const cy = (pTL.y + pTR.y + pBL.y + pBR.y) * 0.25;
  const expandCorner = (p, px = 0.6) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    return {
      x: p.x + (dx / dist) * px,
      y: p.y + (dy / dist) * px,
      z: p.z
    };
  };

  const expTL = expandCorner(pTL);
  const expTR = expandCorner(pTR);
  const expBL = expandCorner(pBL);
  const expBR = expandCorner(pBR);

  const topW = Math.hypot(pTR.x - pTL.x, pTR.y - pTL.y);
  const bottomW = Math.hypot(pBR.x - pBL.x, pBR.y - pBL.y);
  const leftH = Math.hypot(pBL.x - pTL.x, pBL.y - pTL.y);
  const rightH = Math.hypot(pBR.x - pTR.x, pBR.y - pTR.y);

  const currentW = (topW + bottomW) * 0.5;
  const currentH = (leftH + rightH) * 0.5;

  // Extinction progressive à angle aigu lorsque l'écran s'approche du clavier
  const CUTOFF_ANGLE = 1.72; // Angle aigu (~11° d'ouverture restante avant fermeture complète à 1.92 rad)
  const FADE_RANGE = 0.25;   // Fondu progressif et naturel

  // Détection de dos / inversion de perspective (backface culling pour éviter tout glitch de homographie)
  const isBackface = (pTR.x - pTL.x) * (pBL.y - pTL.y) - (pTR.y - pTL.y) * (pBL.x - pTL.x) <= 100 || currentH < 15 || currentW < 50;
  const isClosedOrNarrow = isBackface || rotationAngle >= CUTOFF_ANGLE;
  const fadeOpacity = isClosedOrNarrow ? 0 : Math.max(0, Math.min(1, (CUTOFF_ANGLE - rotationAngle) / FADE_RANGE));

  if (fadeOpacity <= 0.02) {
    insideEl.style.visibility = 'hidden';
    insideEl.style.opacity = '0';
    insideEl.style.pointerEvents = 'none';
    return;
  } else {
    insideEl.style.visibility = 'visible';
    insideEl.style.opacity = fadeOpacity.toFixed(3);
    insideEl.style.pointerEvents = fadeOpacity > 0.85 ? 'auto' : 'none';
  }

  // Synchronisation réaliste de l'aura lumineuse et du socle au sol avec l'angle de fermeture
  const auraEl = document.querySelector('.mac-ambient-aura');
  if (auraEl) {
    auraEl.style.opacity = (fadeOpacity * 0.95).toFixed(3);
  }
  const groundEl = document.querySelector('.mac-ground-plane');
  if (groundEl) {
    const shadowScale = 1 - (1 - fadeOpacity) * 0.08;
    groundEl.style.transform = `translateX(-50%) scale(${shadowScale.toFixed(3)})`;
  }

  const DESIGN_WIDTH = 960;
  const DESIGN_HEIGHT = 600;
  insideEl.style.width = `${DESIGN_WIDTH}px`;
  insideEl.style.height = `${DESIGN_HEIGHT}px`;

  const src = [
    { x: 0, y: 0 },
    { x: DESIGN_WIDTH, y: 0 },
    { x: 0, y: DESIGN_HEIGHT },
    { x: DESIGN_WIDTH, y: DESIGN_HEIGHT }
  ];
  const dst = [expTL, expTR, expBL, expBR];
  const matrix = solvePerspectiveTransform(src, dst);

  if (matrix) {
    if (!insideEl.classList.contains('is-sticky-3d')) {
      insideEl.classList.add('is-sticky-3d');
    }
    insideEl.style.transform = `matrix3d(${matrix.map((n) => Number(n.toFixed(6))).join(',')})`;
  } else {
    insideEl.style.left = `${pTL.x}px`;
    insideEl.style.top = `${pTL.y}px`;
    insideEl.style.width = `${currentW}px`;
    insideEl.style.height = `${currentH}px`;
    insideEl.style.transform = 'none';
  }
}

function lockModelViewerInteraction(modelViewer) {
  // Verrouille l'orbite et le champ de vision pour empêcher tout zoom ou déplacement de la 3D
  modelViewer.minCameraOrbit = "0deg 68deg 76%";
  modelViewer.maxCameraOrbit = "0deg 68deg 76%";
  modelViewer.minFieldOfView = "auto";
  modelViewer.maxFieldOfView = "auto";

  const blockInteraction = (e) => {
    if (e.target === modelViewer) {
      e.stopPropagation();
      if (e.cancelable && e.type !== 'wheel') {
        e.preventDefault();
      }
    }
  };

  ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup', 'wheel', 'gesturestart', 'gesturechange'].forEach((evt) => {
    modelViewer.addEventListener(evt, blockInteraction, { passive: evt === 'wheel' });
  });
}

export function initMac3D() {
  const modelViewer = document.getElementById('macbook-3d');
  if (!modelViewer) return;

  // Verrouille strictement le zoom et le déplacement de l'image 3D
  lockModelViewerInteraction(modelViewer);

  const setupMac3D = () => {
    let screenMesh = null;
    let screenDisplayMesh = null;
    const casingMats = [];

    // Récupération de la scène Three.js interne de <model-viewer>
    const sceneSymbol = Object.getOwnPropertySymbols(modelViewer).find(
      (sym) => sym.description === 'scene'
    );
    const threeScene = sceneSymbol ? modelViewer[sceneSymbol] : null;

    if (threeScene) {
      // 1. Application de la finition Space Grey / Midnight mat anti-reflet
      applyMidnightFinish(threeScene);

      // 2. Recherche du nœud d'articulation de l'écran, du mesh d'affichage et des matériaux de coque
      threeScene.traverse((obj) => {
        if (obj.name === 'VCQqxpxkUlzqcJI_62') {
          screenMesh = obj;
        }
        if (obj.isMesh && (obj.name === 'Object_123' || (obj.material && obj.material.name === 'sfCQkHOWyrsLmor'))) {
          screenDisplayMesh = obj;
        } else if (obj.isMesh && obj.material) {
          const mList = Array.isArray(obj.material) ? obj.material : [obj.material];
          mList.forEach((m) => {
            if (m.name !== 'sfCQkHOWyrsLmor') casingMats.push(m);
          });
        }
      });
    }

    // 3. Verre d'affichage Retina noir d'encre pur (Object_123) sous le miniOS interactif
    if (screenDisplayMesh && screenDisplayMesh.material) {
      const mats = Array.isArray(screenDisplayMesh.material) ? screenDisplayMesh.material : [screenDisplayMesh.material];
      mats.forEach((mat) => {
        mat.color.set(0x000000);
        mat.map = null;
        mat.emissiveMap = null;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
        mat.roughness = 0.12;
        mat.metalness = 0.85;
        mat.side = 0; // THREE.FrontSide : visible de face uniquement
        mat.needsUpdate = true;
      });

      if (threeScene) {
        threeScene.queueRender();
      }
    }

    const insideEl = document.querySelector('#imagurrrr .inside');
    const imageContainer = document.getElementById('imagurrrr');
    const rootModel = threeScene.model;

    const PIVOT_Y = -12.1;
    const PIVOT_Z = 0.1;
    const CLOSED_ANGLE = 1.92; // Angle exact d'alignement à plat sur le châssis (~112.3°)

    const isAlreadyRevealed = document.body.classList.contains('site-revealed');
    let currentRotation = CLOSED_ANGLE;
    let targetRotation = CLOSED_ANGLE;

    let introStarted = false;
    let introStartTime = 0;
    let introComplete = false;
    const INTRO_DELAY = 120;     // Courte pause de synchronisation avec la morphing tree
    const INTRO_DURATION = 1500; // Animation 3D cinématographique (rotation 360° X & Y + ouverture)

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    let lastAngle = null;
    function applyScreenRotation(angle) {
      if (!screenMesh) return;
      const perfTier = (window.getPerfTier ? window.getPerfTier() : (window.__PERF_TIER__ || 'high'));
      if (perfTier === 'potato' && introComplete && lastAngle !== null && Math.abs(angle - lastAngle) < 0.001) {
        return;
      }
      lastAngle = angle;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const ty = PIVOT_Y - (PIVOT_Y * cosA - PIVOT_Z * sinA);
      const tz = PIVOT_Z - (PIVOT_Y * sinA + PIVOT_Z * cosA);

      screenMesh.rotation.set(angle, 0, 0);
      screenMesh.position.set(0, ty, tz);
      screenMesh.updateMatrix();
      screenMesh.updateWorldMatrix(true, true);

      if (screenDisplayMesh && insideEl) {
        updateStickyScreen(screenDisplayMesh, threeScene, insideEl, modelViewer, angle);
      }

      if (threeScene) {
        threeScene.queueRender();
      }
    }

    // 4. Positionnement initial mécanique (fermé à plat au chargement + masqué avec inclinaison initiale subtile)
    const INITIAL_TILT_X = 0.26; // ~15° d'inclinaison subtile et élégante (zéro backflip)
    if (screenMesh && threeScene) {
      if (rootModel) {
        rootModel.rotation.y = 0;
        rootModel.rotation.x = INITIAL_TILT_X;
      }
      const initBlur = 'blur(28px)';
      if (imageContainer) {
        imageContainer.style.opacity = '0';
        imageContainer.style.filter = initBlur;
        imageContainer.style.webkitFilter = initBlur;
        imageContainer.style.transform = 'translateY(22px)';
      }
      if (modelViewer) {
        modelViewer.style.filter = initBlur;
        modelViewer.style.webkitFilter = initBlur;
      }
      applyScreenRotation(currentRotation);
      updateDimensions();
      window.addEventListener('resize', () => {
        if (screenDisplayMesh && insideEl) {
          updateStickyScreen(screenDisplayMesh, threeScene, insideEl, modelViewer, currentRotation);
        }
      });
    }

    // 5. Animation mécanique de la charnière : apparition 3D complète + fermeture scroll-driven
    if (screenMesh && threeScene) {
      function getScrollProgress() {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const scrollDistance = 350; // Fermeture fluide sur les premiers 350px de scroll
        return Math.max(0, Math.min(1, scrollY / scrollDistance));
      }

      let lastHingeFrame = 0;
      function animateHingeOnScroll(timestamp) {
        const perfTier = (window.getPerfTier ? window.getPerfTier() : (window.__PERF_TIER__ || 'high'));
        if (perfTier === 'low' && introComplete && timestamp - lastHingeFrame < 32) {
          requestAnimationFrame(animateHingeOnScroll);
          return;
        }
        lastHingeFrame = timestamp;

        const isRevealed = document.body.classList.contains('site-revealed');

        if (!introStarted && isRevealed) {
          introStarted = true;
          introStartTime = timestamp || performance.now();
        }

        const scrollProgress = getScrollProgress();

        if (!introComplete) {
          if (!introStarted) {
            // Avant la fin du loader tree : reste fermé et masqué avec flou
            targetRotation = CLOSED_ANGLE;
            currentRotation = CLOSED_ANGLE;
            if (rootModel) {
              rootModel.rotation.y = 0;
              rootModel.rotation.x = INITIAL_TILT_X;
            }
            const initBlur = 'blur(28px)';
            if (imageContainer) {
              imageContainer.style.opacity = '0';
              imageContainer.style.filter = initBlur;
              imageContainer.style.webkitFilter = initBlur;
              imageContainer.style.transform = 'translateY(22px)';
            }
            if (modelViewer) {
              modelViewer.style.filter = initBlur;
              modelViewer.style.webkitFilter = initBlur;
            }
          } else {
            const now = timestamp || performance.now();
            const elapsed = now - introStartTime;
            if (elapsed < INTRO_DELAY) {
              targetRotation = CLOSED_ANGLE;
              currentRotation = CLOSED_ANGLE;
              if (rootModel) {
                rootModel.rotation.y = 0;
                rootModel.rotation.x = INITIAL_TILT_X;
              }
              const initBlur = 'blur(28px)';
              if (imageContainer) {
                imageContainer.style.opacity = '0';
                imageContainer.style.filter = initBlur;
                imageContainer.style.webkitFilter = initBlur;
                imageContainer.style.transform = 'translateY(22px)';
              }
              if (modelViewer) {
                modelViewer.style.filter = initBlur;
                modelViewer.style.webkitFilter = initBlur;
              }
              for (let i = 0; i < casingMats.length; i++) {
                casingMats[i].envMapIntensity = 0.08;
              }
            } else {
              const animTime = elapsed - INTRO_DELAY;
              const ARRIVAL_DURATION = 1400; // Phase 1 : Arrivée douce avec petit mouvement et défloutage
              const OPEN_START = 550;        // L'écran commence à s'ouvrir doucement pendant l'arrivée
              const OPEN_DURATION = 2100;    // Ouverture lente, cinématique et majestueuse du capot
              const TOTAL_INTRO_DURATION = OPEN_START + OPEN_DURATION;

              // 1. Petit mouvement X doux + opacité + défloutage (aucun backflip)
              if (animTime < ARRIVAL_DURATION) {
                const tArr = Math.min(1, Math.max(0, animTime / ARRIVAL_DURATION));
                const easedArr = 1 - Math.pow(1 - tArr, 3);

                // Petit mouvement vertical subtil (15° -> 0°) et zéro rotation Y (aucun backflip)
                if (rootModel) {
                  rootModel.rotation.y = 0;
                  rootModel.rotation.x = (1 - easedArr) * INITIAL_TILT_X;
                }

                const dynEnv = 0.08 + 0.14 * tArr;
                for (let i = 0; i < casingMats.length; i++) {
                  casingMats[i].envMapIntensity = dynEnv;
                }

                // Opacité, défloutage progressif et translation douce
                const blurPx = Math.max(0, (1 - easedArr) * 28).toFixed(1);
                const blurCss = Number(blurPx) > 0.4 ? `blur(${blurPx}px)` : 'none';
                const opacCss = Math.min(1, tArr * 1.5).toFixed(3);
                const transYCss = `translateY(${((1 - easedArr) * 22).toFixed(1)}px)`;

                if (imageContainer) {
                  imageContainer.style.opacity = opacCss;
                  imageContainer.style.filter = blurCss;
                  imageContainer.style.webkitFilter = blurCss;
                  imageContainer.style.transform = transYCss;
                }
                if (modelViewer) {
                  modelViewer.style.filter = blurCss;
                  modelViewer.style.webkitFilter = blurCss;
                }
              } else {
                if (rootModel && !introComplete) {
                  rootModel.rotation.y = 0;
                  rootModel.rotation.x = 0;
                }
                for (let i = 0; i < casingMats.length; i++) {
                  casingMats[i].envMapIntensity = 0.22;
                }
                if (imageContainer) {
                  imageContainer.style.opacity = '1';
                  imageContainer.style.filter = 'none';
                  imageContainer.style.webkitFilter = 'none';
                  imageContainer.style.transform = 'none';
                }
                if (modelViewer) {
                  modelViewer.style.filter = 'none';
                  modelViewer.style.webkitFilter = 'none';
                }
              }

              // 2. Ouverture mécanique du capot
              if (animTime < OPEN_START) {
                targetRotation = CLOSED_ANGLE;
                currentRotation = CLOSED_ANGLE;
              } else if (animTime < TOTAL_INTRO_DURATION) {
                const tOpen = Math.min(1, Math.max(0, (animTime - OPEN_START) / OPEN_DURATION));
                const easedOpen = 1 - Math.pow(1 - tOpen, 3);
                targetRotation = (1 - easedOpen) * CLOSED_ANGLE;
                currentRotation = targetRotation;
              } else {
                // ── Phase 3 : Intro terminée, passage au Scroll-driven ──
                introComplete = true;
                if (imageContainer) {
                  imageContainer.style.opacity = '1';
                  imageContainer.style.filter = 'none';
                  imageContainer.style.webkitFilter = 'none';
                  imageContainer.style.transform = 'none';
                }
                if (modelViewer) {
                  modelViewer.style.filter = 'none';
                  modelViewer.style.webkitFilter = 'none';
                }
                if (rootModel) {
                  rootModel.rotation.y = 0;
                  rootModel.rotation.x = 0;
                }
                targetRotation = scrollProgress * CLOSED_ANGLE;
                currentRotation += (targetRotation - currentRotation) * 0.25;
              }
            }
          }
        } else {
          // Site révélé et intro terminée : Scroll-driven !
          // Fermeture douce du capot + rotation verticale pour mettre le Mac à plat
          targetRotation = scrollProgress * CLOSED_ANGLE;
          currentRotation += (targetRotation - currentRotation) * 0.22;

          if (rootModel) {
            // Rotation verticale progressive (jusqu'à -22° / -0.38 rad) pour mettre le Mac à plat
            const FLAT_ROT_X = -0.38;
            const targetRotX = scrollProgress * FLAT_ROT_X;
            rootModel.rotation.x += (targetRotX - rootModel.rotation.x) * 0.22;
            rootModel.rotation.y += (0 - rootModel.rotation.y) * 0.22;
          }
        }

        applyScreenRotation(currentRotation);

        requestAnimationFrame(animateHingeOnScroll);
      }

      // Écouteur direct du scroll pour synchronisation immédiate sans latence
      window.addEventListener('scroll', () => {
        if (introComplete) {
          const sp = getScrollProgress();
          targetRotation = sp * CLOSED_ANGLE;
          currentRotation += (targetRotation - currentRotation) * 0.45;
          if (rootModel) {
            const FLAT_ROT_X = -0.38;
            const targetRotX = sp * FLAT_ROT_X;
            rootModel.rotation.x += (targetRotX - rootModel.rotation.x) * 0.45;
          }
          applyScreenRotation(currentRotation);
        }
      }, { passive: true });

      requestAnimationFrame(animateHingeOnScroll);
    }
  };

  if (modelViewer.loaded) {
    setupMac3D();
  } else {
    modelViewer.addEventListener('load', setupMac3D, { once: true });
  }
}
