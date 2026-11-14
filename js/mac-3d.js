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

// ═══════════════════════════════════════════════════════════════════════════════
//  3D Keyboard Interactive Hover Aura (Per-Key & Radial Backlight Halo)
// ═══════════════════════════════════════════════════════════════════════════════

// ⚙️ PARAMÈTRES AJUSTABLES DE L'AURA & DES GOD RAYS DU CLAVIER 3D
export const KEYBOARD_AURA_CONFIG = {
  // 1. Rayons de détection et d'étendue du halo autour de la souris
  keyRadius: 1.45,           // Rayon d'activation des touches voisines
  radialRadius: 2.05,        // Rayon du halo diffus global autour du curseur
  coreRadius: 0.95,          // Rayon du cœur lumineux directement sous la souris
  keyPressDepth: 0.014,      // Enfoncement mécanique des touches au survol (0 = désactivé)

  // 2. Faisceaux volumétriques "God Rays" droits centrés aux coins avec pont lumineux entre les pics
  rayHeight: 0.88,           // Hauteur de montée des faisceaux au-dessus des touches (augmenter = monte plus haut)
  raySpread: 0.025,          // Ouverture latérale très discrète pour garder les faisceaux droits
  rayCrepuscularTilt: 0.045, // Inclinaison radiale légère (évite que les rayons penchent sur les bords)
  rayBaseZ: -0.258,          // Hauteur d'ancrage de la base du rayon dans l'interstice entre les touches
  rayBaseOpacity: 0.48,      // Opacité de la base brillante au pied de la touche (-20%)
  rayTopOpacity: 0.0,        // Opacité au sommet du faisceau (0.0 = fondu complet en montant)
  rayFalloffPower: 1.45,     // Courbe de diminution de l'opacité en montant (1.0 = linéaire, >1 = base dense + haut doux)
  rayBrightness: 1.08,       // Intensité lumineuse à la base des God Rays (-20%)
  rayCornerBoost: 1.55,      // Renforcement des faisceaux aux coins / intersections entre les touches
  rayEdgeAttenuation: 0.28,  // Intensité douce du pont lumineux reliant deux pics le long de l'arête
  rayEdgeBridgeHeight: 0.38, // Hauteur relative du voile lumineux entre deux pics (creux de la courbe)
  rayMergedCornerScale: 1.18,// Élargissement quand ≥2 coins se touchent (1 seul faisceau unifié)
  rayMergedCornerHeight: 1.10,// Hauteur supplémentaire quand ≥2 coins se touchent

  // 3. Intensités des autres éléments du clavier & multiplicateur global (-20%)
  globalIntensity: 1.0,      // Multiplicateur maître de la puissance lumineuse globale
  bevelIntensity: 0.095,     // Lueur subtile sur le biseau inférieur des touches (plateau supérieur = toujours 0)
  legendsIntensity: 0.44,    // Rétroéclairage blanc des lettres et symboles gravés
  wellIntensity: 0.44,       // Halo lumineux au fond des interstices (puits du clavier)

  // 4. Couleur de la lumière (RVB linéaire — blanc pur légèrement cristallin)
  colorR: 0.97,
  colorG: 0.99,
  colorB: 1.04
};

const KEYBOARD_CORNER_COORDS = [
  { x: -13.65, y: -9.64, z: -0.34 }, // Haut-Gauche (Esc)
  { x: 13.65, y: -9.64, z: -0.34 }, // Haut-Droite (Touch ID)
  { x: -13.65, y: 1.27, z: -0.34 }, // Bas-Gauche (Fn)
  { x: 13.65, y: 1.27, z: -0.34 }  // Bas-Droite (Flèche Droite)
];

/** Échantillonne un point et sa normale sortante le long du périmètre arrondi d'une touche (t ∈ [0, 1]). */
function evalRoundedKeyPerimeter(cx, cy, rx, ry, cr, t) {
  const ix = Math.max(0.01, rx - cr);
  const iy = Math.max(0.01, ry - cr);
  const arcLen = 0.5 * Math.PI * cr;
  const segments = [
    { len: 2 * iy, fn: (u) => [cx + rx, cy - iy + u * 2 * iy, 1, 0] },
    { len: arcLen, fn: (u) => { const a = u * Math.PI * 0.5; const c = Math.cos(a), s = Math.sin(a); return [cx + ix + cr * c, cy + iy + cr * s, c, s]; } },
    { len: 2 * ix, fn: (u) => [cx + ix - u * 2 * ix, cy + ry, 0, 1] },
    { len: arcLen, fn: (u) => { const a = (0.5 + u * 0.5) * Math.PI; const c = Math.cos(a), s = Math.sin(a); return [cx - ix + cr * c, cy + iy + cr * s, c, s]; } },
    { len: 2 * iy, fn: (u) => [cx - rx, cy + iy - u * 2 * iy, -1, 0] },
    { len: arcLen, fn: (u) => { const a = (1.0 + u * 0.5) * Math.PI; const c = Math.cos(a), s = Math.sin(a); return [cx - ix + cr * c, cy - iy + cr * s, c, s]; } },
    { len: 2 * ix, fn: (u) => [cx - ix + u * 2 * ix, cy - ry, 0, -1] },
    { len: arcLen, fn: (u) => { const a = (1.5 + u * 0.5) * Math.PI; const c = Math.cos(a), s = Math.sin(a); return [cx + ix + cr * c, cy - iy + cr * s, c, s]; } }
  ];
  const totalLen = segments.reduce((acc, s) => acc + s.len, 0);
  let target = (((t % 1) + 1) % 1) * totalLen;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (target <= seg.len || i === segments.length - 1) {
      return seg.fn(seg.len > 1e-6 ? Math.min(1, target / seg.len) : 0);
    }
    target -= seg.len;
  }
  return segments[0].fn(0);
}

/** Construit le mesh volumétrique procédural des God Rays en fusionnant les coins adjacents. */
function createKeyboardGodRays(keys, keycaps, BufferAttributeCtor, baseMaterial) {
  const MeshCtor = keycaps.constructor;
  const BufferGeometryCtor = keycaps.geometry.constructor;
  if (!MeshCtor || !BufferGeometryCtor) return null;

  const CURTAIN_SEGMENTS = 48;
  const BLADE_HALF_W = 0.24;
  const MERGE_DIST_SQ = 0.52 * 0.52;
  const s45 = Math.SQRT1_2;
  const vertices = [];
  const indices = [];

  const pushVertex = (kIdx, clIdx, ax, ay, ox, oy, nx, ny, u, v, isTop, cornerBoost, isBlade) => {
    const idx = vertices.length;
    vertices.push({ kIdx, clIdx, ax, ay, ox, oy, nx, ny, u, v, isTop, cornerBoost, isBlade });
    return idx;
  };

  // 1. Collecte et fusion spatiale des coins de touches qui se touchent (<= 0.52 unité)
  const cornerClusters = [];
  const keyQuadClusters = new Array(keys.length);

  for (let kIdx = 0; kIdx < keys.length; kIdx++) {
    const k = keys[kIdx];
    if (!k.isEmitter) continue;

    const gapX = 0.045;
    const gapY = k.hy < 0.5 ? 0.018 : 0.045;
    const rx = k.hx + gapX;
    const ry = k.hy + gapY;

    // 4 coins externes ordonnés par quadrant : 0:(+x,+y), 1:(-x,+y), 2:(-x,-y), 3:(+x,-y)
    const rawCorners = [
      [k.cx + rx, k.cy + ry, s45, s45],
      [k.cx - rx, k.cy + ry, -s45, s45],
      [k.cx - rx, k.cy - ry, -s45, -s45],
      [k.cx + rx, k.cy - ry, s45, -s45]
    ];

    const quads = new Array(4);
    for (let q = 0; q < 4; q++) {
      const [qx, qy, nx, ny] = rawCorners[q];
      let bestCluster = null;
      let bestDistSq = MERGE_DIST_SQ;

      for (let c = 0; c < cornerClusters.length; c++) {
        const cl = cornerClusters[c];
        if (cl.keyIndices.includes(kIdx)) continue;
        const dx = qx - cl.cx;
        const dy = qy - cl.cy;
        const dSq = dx * dx + dy * dy;
        if (dSq <= bestDistSq) {
          bestDistSq = dSq;
          bestCluster = cl;
        }
      }

      if (bestCluster) {
        bestCluster.keyIndices.push(kIdx);
        bestCluster.rawCount += 1;
        bestCluster.sumX += qx;
        bestCluster.sumY += qy;
        bestCluster.sumNx += nx;
        bestCluster.sumNy += ny;
        bestCluster.cx = bestCluster.sumX / bestCluster.rawCount;
        bestCluster.cy = bestCluster.sumY / bestCluster.rawCount;
        bestCluster.outX = (bestCluster.sumNx / bestCluster.rawCount) * 0.25;
        bestCluster.outY = (bestCluster.sumNy / bestCluster.rawCount) * 0.25;
        bestCluster.touchCount = bestCluster.keyIndices.length;
        quads[q] = bestCluster;
      } else {
        const cl = {
          index: cornerClusters.length,
          cx: qx,
          cy: qy,
          outX: nx * 0.25,
          outY: ny * 0.25,
          sumX: qx,
          sumY: qy,
          sumNx: nx,
          sumNy: ny,
          rawCount: 1,
          keyIndices: [kIdx],
          touchCount: 1,
          currentGlow: 0
        };
        cornerClusters.push(cl);
        quads[q] = cl;
      }
    }
    keyQuadClusters[kIdx] = quads;
  }

  // 2. Couche A : Rideau continu reliant les pics entre eux (courbe douce le long des arêtes)
  for (let kIdx = 0; kIdx < keys.length; kIdx++) {
    const k = keys[kIdx];
    if (!k.isEmitter) continue;

    const gapX = 0.045;
    const gapY = k.hy < 0.5 ? 0.018 : 0.045;
    const rx = k.hx + gapX;
    const ry = k.hy + gapY;
    const cr = Math.min(0.14, rx * 0.35, ry * 0.35);
    const ix = Math.max(0.01, rx - cr);
    const iy = Math.max(0.01, ry - cr);
    const cornerSpan = Math.min(0.32, Math.min(rx, ry) * 0.45);
    const twoSpanSq = 2 * cornerSpan * cornerSpan;

    const baseVert = vertices.length;
    for (let s = 0; s <= CURTAIN_SEGMENTS; s++) {
      const u = s / CURTAIN_SEGMENTS;
      const [px, py, nx, ny] = evalRoundedKeyPerimeter(k.cx, k.cy, rx, ry, cr, u);
      const dCorner = Math.hypot(
        Math.max(0, ix - Math.abs(px - k.cx)),
        Math.max(0, iy - Math.abs(py - k.cy))
      );
      const rawCorner = Math.exp(-(dCorner * dCorner) / twoSpanSq);
      pushVertex(kIdx, -1, px, py, 0, 0, nx, ny, rawCorner, 0, 0, rawCorner, 0);
      pushVertex(kIdx, -1, px, py, 0, 0, nx, ny, rawCorner, 1, 1, rawCorner, 0);
    }
    for (let s = 0; s < CURTAIN_SEGMENTS; s++) {
      const b0 = baseVert + s * 2;
      const t0 = b0 + 1;
      const b1 = b0 + 2;
      const t1 = b0 + 3;
      indices.push(b0, b1, t0, t0, b1, t1);
    }
  }

  // 3. Couche B : Un seul faisceau volumétrique unifié par cluster de coins qui se touchent
  const bladeAxes = [
    [1, 0],       // Lame face caméra (±X)
    [s45, s45],   // Lame diagonale à 45° NE-SO
    [-s45, s45]   // Lame diagonale à 45° NO-SE
  ];
  for (let c = 0; c < cornerClusters.length; c++) {
    const cl = cornerClusters[c];
    const leadKey = cl.keyIndices[0];
    for (let b = 0; b < bladeAxes.length; b++) {
      const ox = bladeAxes[b][0] * BLADE_HALF_W;
      const oy = bladeAxes[b][1] * BLADE_HALF_W;
      const vBL = pushVertex(leadKey, c, cl.cx, cl.cy, -ox, -oy, cl.outX, cl.outY, -1, 0, 0, 1.0, 1);
      const vBR = pushVertex(leadKey, c, cl.cx, cl.cy, ox, oy, cl.outX, cl.outY, 1, 0, 0, 1.0, 1);
      const vTR = pushVertex(leadKey, c, cl.cx, cl.cy, ox, oy, cl.outX, cl.outY, 1, 1, 1, 1.0, 1);
      const vTL = pushVertex(leadKey, c, cl.cx, cl.cy, -ox, -oy, cl.outX, cl.outY, -1, 1, 1, 1.0, 1);
      indices.push(vBL, vBR, vTR, vBL, vTR, vTL);
    }
  }

  const count = vertices.length;
  const posArr = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 4);
  const uvArr = new Float32Array(count * 3);
  const keyIdx = new Uint16Array(count);
  const clusterIdx = new Int16Array(count);
  const anchorX = new Float32Array(count);
  const anchorY = new Float32Array(count);
  const offsetX = new Float32Array(count);
  const offsetY = new Float32Array(count);
  const outX = new Float32Array(count);
  const outY = new Float32Array(count);
  const isTop = new Uint8Array(count);
  const cornerBoost = new Float32Array(count);
  const bladeFlag = new Uint8Array(count);

  const baseZ = KEYBOARD_AURA_CONFIG.rayBaseZ;
  for (let i = 0; i < count; i++) {
    const v = vertices[i];
    keyIdx[i] = v.kIdx;
    clusterIdx[i] = v.clIdx;
    anchorX[i] = v.ax;
    anchorY[i] = v.ay;
    offsetX[i] = v.ox;
    offsetY[i] = v.oy;
    outX[i] = v.nx;
    outY[i] = v.ny;
    isTop[i] = v.isTop;
    cornerBoost[i] = v.cornerBoost;
    bladeFlag[i] = v.isBlade;

    const cl = v.clIdx >= 0 ? cornerClusters[v.clIdx] : null;
    const initScale = cl && cl.touchCount > 1
      ? (1.0 + (KEYBOARD_AURA_CONFIG.rayMergedCornerScale - 1.0) * (1.0 + 0.15 * Math.min(2, cl.touchCount - 2)))
      : 1.0;

    posArr[i * 3] = v.ax + v.ox * initScale;
    posArr[i * 3 + 1] = v.ay + v.oy * initScale;
    posArr[i * 3 + 2] = baseZ;

    uvArr[i * 3] = v.u;
    uvArr[i * 3 + 1] = v.v;
    uvArr[i * 3 + 2] = v.isBlade;
  }

  const geom = new BufferGeometryCtor();
  const posAttr = new BufferAttributeCtor(posArr, 3);
  const colorAttr = new BufferAttributeCtor(colorArr, 4);
  const uvAttr = new BufferAttributeCtor(uvArr, 3);
  geom.setAttribute('position', posAttr);
  geom.setAttribute('color', colorAttr);
  geom.setAttribute('aRayUV', uvAttr);
  geom.setIndex(new BufferAttributeCtor(new Uint16Array(indices), 1));

  const mat = baseMaterial.clone();
  mat.name = 'keyboard-god-rays-mat';
  mat.color.setHex(0xffffff);
  mat.emissive.setHex(0x000000);
  mat.map = null;
  mat.normalMap = null;
  mat.roughnessMap = null;
  mat.metalnessMap = null;
  mat.emissiveMap = null;
  mat.aoMap = null;
  mat.alphaMap = null;
  mat.vertexColors = true;
  mat.transparent = true;
  mat.opacity = 1.0;
  mat.alphaTest = 0;
  mat.depthWrite = false;
  mat.depthTest = true;
  mat.blending = 2; // THREE.AdditiveBlending
  mat.side = 2;     // THREE.DoubleSide

  const uniforms = {
    uRayFalloffPower: { value: KEYBOARD_AURA_CONFIG.rayFalloffPower },
    uRayBaseOpacity: { value: KEYBOARD_AURA_CONFIG.rayBaseOpacity },
    uRayTopOpacity: { value: KEYBOARD_AURA_CONFIG.rayTopOpacity },
    uRayEdgeAttenuation: { value: KEYBOARD_AURA_CONFIG.rayEdgeAttenuation }
  };

  mat.customProgramCacheKey = () => 'mac-kb-godrays-volumetric-v2';
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRayFalloffPower = uniforms.uRayFalloffPower;
    shader.uniforms.uRayBaseOpacity = uniforms.uRayBaseOpacity;
    shader.uniforms.uRayTopOpacity = uniforms.uRayTopOpacity;
    shader.uniforms.uRayEdgeAttenuation = uniforms.uRayEdgeAttenuation;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute vec3 aRayUV;
         varying vec3 vRayUV;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vRayUV = aRayUV;`
      );

    const rayFragmentBody = `
      #if defined( USE_COLOR_ALPHA )
        vec4 rayCol = vColor;
      #elif defined( USE_COLOR )
        vec4 rayCol = vec4(vColor.rgb, 1.0);
      #else
        vec4 rayCol = vec4(1.0);
      #endif
      float rU = vRayUV.x;
      float rV = clamp(vRayUV.y, 0.0, 1.0);
      float bladeMode = vRayUV.z;

      float vAtten;
      float slitCore;
      float hProfile;
      if (bladeMode > 0.5) {
        vAtten = pow(clamp(1.0 - rV, 0.0, 1.0), max(0.25, uRayFalloffPower)) * smoothstep(1.0, 0.72, rV);
        slitCore = exp(-rV * 16.0) * 0.55;
        hProfile = exp(-3.8 * rU * rU) * clamp(1.0 - rU * rU, 0.0, 1.0);
      } else {
        float cProx = clamp(rU, 0.0, 1.0);
        float effFalloff = mix(max(0.25, uRayFalloffPower) * 1.55, max(0.25, uRayFalloffPower), cProx);
        vAtten = pow(clamp(1.0 - rV, 0.0, 1.0), effFalloff) * smoothstep(1.0, 0.72, rV);
        slitCore = exp(-rV * 12.0) * mix(0.38, 0.55, cProx);
        hProfile = mix(uRayEdgeAttenuation, 0.88, pow(cProx, 1.25));
      }

      float heightOpacity = mix(uRayTopOpacity, uRayBaseOpacity, clamp(vAtten + slitCore * 0.35, 0.0, 1.0));
      float rayAlpha = clamp(rayCol.a * heightOpacity * hProfile, 0.0, 1.0);
      float beamEnergy = clamp(vAtten + slitCore, 0.0, 1.35);
      gl_FragColor = vec4(rayCol.rgb * beamEnergy, rayAlpha);`;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uRayFalloffPower;
       uniform float uRayBaseOpacity;
       uniform float uRayTopOpacity;
       uniform float uRayEdgeAttenuation;
       varying vec3 vRayUV;`
    );

    if (shader.fragmentShader.includes('#include <opaque_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `#include <opaque_fragment>\n${rayFragmentBody}`
      );
    } else if (shader.fragmentShader.includes('#include <output_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `#include <output_fragment>\n${rayFragmentBody}`
      );
    } else {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `${rayFragmentBody}\n#include <dithering_fragment>`
      );
    }
  };
  mat.needsUpdate = true;

  const mesh = new MeshCtor(geom, mat);
  mesh.name = 'keyboard-god-rays';
  mesh.renderOrder = 25;
  mesh.frustumCulled = false;
  mesh.visible = false;

  const host = keycaps.parent;
  if (host && typeof host.add === 'function') {
    host.add(mesh);
  } else {
    return null;
  }

  return {
    mesh,
    uniforms,
    posAttr,
    posArr,
    colorAttr,
    colorArr,
    count,
    keyIdx,
    clusterIdx,
    cornerClusters,
    anchorX,
    anchorY,
    offsetX,
    offsetY,
    outX,
    outY,
    isTop,
    cornerBoost,
    bladeFlag
  };
}

function setupKeyboardHoverAura(keyboardMeshes, threeScene, modelViewer) {
  const { keycaps, touchIdCap, legends, skirts, touchIdSkirt, well } = keyboardMeshes;
  if (!keycaps || !keycaps.geometry || !threeScene) return () => { };

  // Permet aussi de modifier les réglages à chaud depuis la console via window.KEYBOARD_AURA_CONFIG
  if (typeof window !== 'undefined') {
    window.KEYBOARD_AURA_CONFIG = KEYBOARD_AURA_CONFIG;
  }

  const posAttr = keycaps.geometry.attributes.position;
  if (!posAttr) return () => { };

  const BufferAttribute = posAttr.constructor;
  const Vector3 = keycaps.position.constructor;

  // 1. Segmentation automatique des 80 îlots de touches physiques (Object_84) + Touch ID (Object_58)
  const vCount = posAttr.count;
  const posArr = posAttr.array;
  const idxAttr = keycaps.geometry.index;
  const parent = new Int32Array(vCount);
  for (let i = 0; i < vCount; i++) parent[i] = i;

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  // Soudure spatiale des sommets coïncidents
  const coordMap = new Map();
  for (let i = 0; i < vCount; i++) {
    const x = posArr[i * 3];
    const y = posArr[i * 3 + 1];
    const z = posArr[i * 3 + 2];
    const key = `${Math.round(x * 250)},${Math.round(y * 250)},${Math.round(z * 250)}`;
    const prev = coordMap.get(key);
    if (prev !== undefined) union(i, prev);
    else coordMap.set(key, i);
  }

  if (idxAttr && idxAttr.array) {
    const indices = idxAttr.array;
    for (let i = 0; i < indices.length; i += 3) {
      union(indices[i], indices[i + 1]);
      union(indices[i + 1], indices[i + 2]);
    }
  }

  const rootToKeyIdx = new Map();
  const keys = [];
  const keycapKeyIndices = new Uint16Array(vCount);

  for (let i = 0; i < vCount; i++) {
    const r = find(i);
    let kIdx = rootToKeyIdx.get(r);
    const vx = posArr[i * 3];
    const vy = posArr[i * 3 + 1];
    if (kIdx === undefined) {
      kIdx = keys.length;
      rootToKeyIdx.set(r, kIdx);
      keys.push({
        minX: vx, maxX: vx,
        minY: vy, maxY: vy,
        cx: vx, cy: vy,
        hx: 0.5, hy: 0.5,
        isEmitter: true,
        hostIdx: -1,
        currentGlow: 0,
        targetGlow: 0,
        currentPress: 0
      });
    } else {
      const k = keys[kIdx];
      if (vx < k.minX) k.minX = vx;
      if (vx > k.maxX) k.maxX = vx;
      if (vy < k.minY) k.minY = vy;
      if (vy > k.maxY) k.maxY = vy;
    }
    keycapKeyIndices[i] = kIdx;
  }

  // Finalisation des boîtes englobantes (exclut les 2 ergots tactiles F/J de l'émission directe)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    k.cx = (k.minX + k.maxX) * 0.5;
    k.cy = (k.minY + k.maxY) * 0.5;
    k.hx = Math.max(0.05, (k.maxX - k.minX) * 0.5);
    k.hy = Math.max(0.05, (k.maxY - k.minY) * 0.5);
    k.isEmitter = k.hx >= 0.35 && k.hy >= 0.30;
  }

  // Rattache les ergots tactiles F/J à leur touche hôte pour conserver un enfoncement synchrone sans halo parasite
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k.isEmitter) continue;
    let bestHost = -1;
    let bestDistSq = Infinity;
    for (let j = 0; j < keys.length; j++) {
      const host = keys[j];
      if (!host.isEmitter) continue;
      const dx = Math.max(0, Math.abs(k.cx - host.cx) - host.hx);
      const dy = Math.max(0, Math.abs(k.cy - host.cy) - host.hy);
      const dSq = dx * dx + dy * dy;
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestHost = j;
      }
    }
    k.hostIdx = bestHost;
  }

  // Ajout de l'îlot Touch ID (Object_58) dans son logement déjà couvert par la touche #13 de Object_84
  const touchIdKeyIdx = keys.length;
  keys.push({
    minX: 12.33, maxX: 13.26,
    minY: -9.26, maxY: -8.33,
    cx: 12.79, cy: -8.80,
    hx: 0.47, hy: 0.47,
    isEmitter: false,
    hostIdx: -1,
    currentGlow: 0,
    targetGlow: 0,
    currentPress: 0
  });

  // Fonction utilitaire associant un point (vx, vy) à sa touche émettrice la plus proche
  const findNearestKeyIndex = (vx, vy) => {
    let bestIdx = 0;
    let bestDistSq = Infinity;
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      if (!key.isEmitter && k !== touchIdKeyIdx) continue;
      const dx = Math.max(0, Math.abs(vx - key.cx) - key.hx);
      const dy = Math.max(0, Math.abs(vy - key.cy) - key.hy);
      const dSq = dx * dx + dy * dy;
      if (dSq === 0) return k;
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestIdx = k;
      }
    }
    return bestIdx;
  };

  // 2. Préparation des attributs par mesh du clavier :
  //    On préserve à 100% la couleur et le PBR d'origine (mat.color, roughness, metalness, normalMap)
  //    et on utilise l'attribut `color` (RGB stride 3) uniquement comme radiance émissive additionnelle
  const attachAuraMaterial = (mesh, tag) => {
    if (!mesh || !mesh.geometry || !mesh.material) return null;
    const mat = mesh.material.clone();
    mat.vertexColors = true;
    mat.customProgramCacheKey = () => `mac-kb-aura-v5-${tag}`;
    mat.onBeforeCompile = (shader) => {
      // Neutralise diffuseColor *= vColor pour garder la couleur native exacte de la touche
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        ''
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         #if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
           totalEmissiveRadiance += vColor.rgb;
         #endif`
      );
    };
    mat.needsUpdate = true;
    mesh.material = mat;

    const pAttr = mesh.geometry.attributes.position;
    const nAttr = mesh.geometry.attributes.normal;
    const count = pAttr.count;
    const colorArr = new Float32Array(count * 3);
    const colorAttr = new BufferAttribute(colorArr, 3);
    mesh.geometry.setAttribute('color', colorAttr);

    const origZ = new Float32Array(count);
    for (let i = 0; i < count; i++) origZ[i] = pAttr.array[i * 3 + 2];

    return {
      mesh,
      posAttr: pAttr,
      posArr: pAttr.array,
      origZ,
      normArr: nAttr ? nAttr.array : null,
      colorArr,
      colorAttr,
      count
    };
  };

  // Masque définitivement Object_80 et Object_60 (normales inversées dans le GLB)
  if (skirts) skirts.visible = false;
  if (touchIdSkirt) touchIdSkirt.visible = false;

  const keycapsData = attachAuraMaterial(keycaps, 'keycaps');
  const touchIdCapData = attachAuraMaterial(touchIdCap, 'touchid-cap');
  const legendsData = attachAuraMaterial(legends, 'legends');
  const wellData = attachAuraMaterial(well, 'well');

  // Mesh procédural propre pour les God Rays volumétriques sortant d'entre les touches
  const baseRayMat = (legends && legends.material) || (skirts && skirts.material) || keycaps.material;
  const godRays = createKeyboardGodRays(keys, keycaps, BufferAttribute, baseRayMat);

  // Pré-calcul du facteur de chanfrein (rim/bevel) sur les touches principales (Object_84)
  // Seule l'arête inférieure capte un discret reflet du rétroéclairage ; le plateau reste 100% noir natif
  const keycapRimFactor = new Float32Array(vCount);
  if (keycapsData) {
    const nArr = keycapsData.normArr;
    for (let i = 0; i < vCount; i++) {
      const vz = posArr[i * 3 + 2];
      let nx = 0, ny = 0;
      if (nArr) {
        nx = nArr[i * 3];
        ny = nArr[i * 3 + 1];
      }
      const nHoriz = Math.hypot(nx, ny);
      const zRim = Math.max(0, (vz - (-0.330)) * 10.5);
      keycapRimFactor[i] = Math.min(1, Math.max(0, nHoriz - 0.16) * 1.35 + zRim);
    }
  }

  // Association des sommets des légendes (Object_76) et du puits (Object_34) à leur touche
  let legendsKeyIndices = null;
  if (legendsData) {
    legendsKeyIndices = new Uint16Array(legendsData.count);
    const lPos = legendsData.posArr;
    for (let i = 0; i < legendsData.count; i++) {
      legendsKeyIndices[i] = findNearestKeyIndex(lPos[i * 3], lPos[i * 3 + 1]);
    }
  }

  let wellKeyIndices = null;
  if (wellData) {
    wellKeyIndices = new Uint16Array(wellData.count);
    const wPos = wellData.posArr;
    for (let i = 0; i < wellData.count; i++) {
      wellKeyIndices[i] = findNearestKeyIndex(wPos[i * 3], wPos[i * 3 + 1]);
    }
  }

  // Au repos : émission 0.0 partout + God Rays masqués -> rendu 100% identique à l'original
  const resetColorsToBase = () => {
    if (keycapsData) {
      keycapsData.colorArr.fill(0);
      const p = keycapsData.posArr;
      const oz = keycapsData.origZ;
      for (let i = 0; i < keycapsData.count; i++) p[i * 3 + 2] = oz[i];
      keycapsData.colorAttr.needsUpdate = true;
      keycapsData.posAttr.needsUpdate = true;
    }
    if (touchIdCapData) {
      touchIdCapData.colorArr.fill(0);
      touchIdCapData.colorAttr.needsUpdate = true;
    }
    if (legendsData) {
      legendsData.colorArr.fill(0);
      const p = legendsData.posArr;
      const oz = legendsData.origZ;
      for (let i = 0; i < legendsData.count; i++) p[i * 3 + 2] = oz[i];
      legendsData.colorAttr.needsUpdate = true;
      legendsData.posAttr.needsUpdate = true;
    }
    if (wellData) {
      wellData.colorArr.fill(0);
      wellData.colorAttr.needsUpdate = true;
    }
    if (godRays) {
      godRays.colorArr.fill(0);
      godRays.colorAttr.needsUpdate = true;
      godRays.mesh.visible = false;
      for (let c = 0; c < godRays.cornerClusters.length; c++) {
        godRays.cornerClusters[c].currentGlow = 0;
      }
    }
  };

  resetColorsToBase();

  // 3. Suivi de la souris et projection homographique vers le plan 3D du clavier
  let targetKx = 0;
  let targetKy = -4.2;
  let pointerKx = 0;
  let pointerKy = -4.2;
  let targetPresence = 0;
  let auraPresence = 0;
  let isAtRest = true;

  const mapPointerToKeyboard = (clientX, clientY) => {
    const rect = modelViewer.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    if (mx < -20 || mx > rect.width + 20 || my < -20 || my > rect.height + 20) {
      return false;
    }

    keycaps.updateWorldMatrix(true, false);
    const proj2D = KEYBOARD_CORNER_COORDS.map((c) => {
      const v = new Vector3(c.x, c.y, c.z);
      v.applyMatrix4(keycaps.matrixWorld);
      v.project(threeScene.camera);
      return {
        x: (v.x * 0.5 + 0.5) * rect.width,
        y: (-v.y * 0.5 + 0.5) * rect.height
      };
    });

    const m = solvePerspectiveTransform(proj2D, KEYBOARD_CORNER_COORDS);
    if (!m) return false;

    const denom = m[3] * mx + m[7] * my + 1;
    if (Math.abs(denom) < 1e-5) return false;

    const kx = (m[0] * mx + m[4] * my + m[12]) / denom;
    const ky = (m[1] * mx + m[5] * my + m[13]) / denom;

    // Zone active du clavier avec une marge douce autour du périmètre des touches
    const MARGIN_X = 1.65;
    const MARGIN_Y = 1.45;
    if (
      kx >= -13.65 - MARGIN_X &&
      kx <= 13.65 + MARGIN_X &&
      ky >= -9.64 - MARGIN_Y &&
      ky <= 1.27 + MARGIN_Y
    ) {
      targetKx = kx;
      targetKy = ky;
      return true;
    }
    return false;
  };

  window.addEventListener('pointermove', (e) => {
    if (!document.body.classList.contains('site-revealed')) return;
    const hit = mapPointerToKeyboard(e.clientX, e.clientY);
    if (hit) {
      if (targetPresence < 0.01) {
        pointerKx = targetKx;
        pointerKy = targetKy;
      }
      targetPresence = 1;
    } else {
      targetPresence = 0;
    }
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    targetPresence = 0;
  }, { passive: true });

  // 4. Boucle de mise à jour temps réel (appelée à chaque frame de animateHingeOnScroll)
  return function updateKeyboardAura(lidRotationAngle = 0) {
    const cfg = KEYBOARD_AURA_CONFIG;
    const lidOpenFactor = Math.max(0, Math.min(1, 1 - lidRotationAngle / 1.15));
    const effectiveTarget = targetPresence * lidOpenFactor;

    pointerKx += (targetKx - pointerKx) * 0.34;
    pointerKy += (targetKy - pointerKy) * 0.34;
    auraPresence += (effectiveTarget - auraPresence) * (effectiveTarget > auraPresence ? 0.24 : 0.14);

    // Illumination et réponse mécanique par touche (radii lus en direct depuis KEYBOARD_AURA_CONFIG)
    let maxKeyGlow = 0;
    const keyR = Math.max(0.2, cfg.keyRadius);
    const KEY_SIGMA_SQ = keyR * keyR;
    const PRESS_SIGMA_SQ = Math.max(0.16, keyR * 0.5) ** 2;

    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      if (!key.isEmitter && key.hostIdx >= 0) {
        key.currentGlow = keys[key.hostIdx].currentGlow;
        key.currentPress = keys[key.hostIdx].currentPress;
        continue;
      }
      const dx = Math.max(0, Math.abs(pointerKx - key.cx) - key.hx);
      const dy = Math.max(0, Math.abs(pointerKy - key.cy) - key.hy);
      const dSq = dx * dx + dy * dy;

      const spatial = auraPresence > 0.002 ? Math.exp(-dSq / (2 * KEY_SIGMA_SQ)) * auraPresence : 0;
      const directHit = (dSq < 0.08 ? 1.0 : 0.0) * auraPresence;
      key.targetGlow = Math.min(1, spatial * 0.85 + directHit * 0.30);

      const lerpRate = key.targetGlow > key.currentGlow ? 0.34 : 0.14;
      key.currentGlow += (key.targetGlow - key.currentGlow) * lerpRate;
      if (key.currentGlow < 0.001) key.currentGlow = 0;
      if (key.currentGlow > maxKeyGlow) maxKeyGlow = key.currentGlow;

      const pressTarget = Math.exp(-dSq / (2 * PRESS_SIGMA_SQ)) * auraPresence;
      key.currentPress += (pressTarget - key.currentPress) * 0.28;
    }

    if (auraPresence < 0.002 && maxKeyGlow < 0.002) {
      if (!isAtRest) {
        resetColorsToBase();
        isAtRest = true;
        threeScene.queueRender();
      }
      return;
    }

    isAtRest = false;
    const RADIAL_SIGMA_SQ = Math.max(0.25, cfg.radialRadius) ** 2;
    const CORE_SIGMA_SQ = Math.max(0.15, cfg.coreRadius) ** 2;
    const globalMul = cfg.globalIntensity ?? 1.0;

    // A. Touches principales (Object_84) : plateau supérieur 100% noir natif + discret reflet sur le chanfrein
    if (keycapsData) {
      const c = keycapsData.colorArr;
      const p = keycapsData.posArr;
      const oz = keycapsData.origZ;
      const nArr = keycapsData.normArr;

      for (let i = 0; i < keycapsData.count; i++) {
        const key = keys[keycapKeyIndices[i]];
        const idx3 = i * 3;
        p[idx3 + 2] = oz[i] + key.currentPress * cfg.keyPressDepth;

        const kGlow = key.currentGlow;
        const rim = keycapRimFactor[i];
        if (!key.isEmitter || kGlow < 0.002 || rim < 0.10) {
          c[idx3] = 0;
          c[idx3 + 1] = 0;
          c[idx3 + 2] = 0;
          continue;
        }

        const vx = p[idx3];
        const vy = p[idx3 + 1];
        const dvx = pointerKx - vx;
        const dvy = pointerKy - vy;
        const vDistSq = dvx * dvx + dvy * dvy;

        const radial = Math.exp(-vDistSq / (2 * RADIAL_SIGMA_SQ)) * auraPresence;
        const core = Math.exp(-vDistSq / (2 * CORE_SIGMA_SQ)) * auraPresence;

        let bevelCatch = 0.85;
        if (nArr && vDistSq > 0.0001) {
          const invDist = 1 / Math.sqrt(vDistSq);
          const dot = (nArr[idx3] * dvx + nArr[idx3 + 1] * dvy) * invDist;
          bevelCatch = 0.65 + Math.max(0, dot) * 0.90;
        }

        const rimIntensity = (kGlow * 0.35 + radial * 0.45 + core * 0.40) * (rim * rim) * bevelCatch * cfg.bevelIntensity * globalMul;
        c[idx3] = rimIntensity * cfg.colorR;
        c[idx3 + 1] = rimIntensity * cfg.colorG;
        c[idx3 + 2] = rimIntensity * cfg.colorB;
      }
      keycapsData.colorAttr.needsUpdate = true;
      keycapsData.posAttr.needsUpdate = true;
    }

    // B. Capuchon Touch ID (Object_58) : reste strictement de sa couleur noire d'origine
    if (touchIdCapData) {
      touchIdCapData.colorArr.fill(0);
      touchIdCapData.colorAttr.needsUpdate = true;
    }

    // C. Légendes / caractères gravés sur les touches (Object_76) : rétroéclairage blanc Apple
    if (legendsData && legendsKeyIndices) {
      const c = legendsData.colorArr;
      const p = legendsData.posArr;
      const oz = legendsData.origZ;
      for (let i = 0; i < legendsData.count; i++) {
        const key = keys[legendsKeyIndices[i]];
        const kGlow = key.currentGlow;
        const idx3 = i * 3;
        p[idx3 + 2] = oz[i] + key.currentPress * cfg.keyPressDepth;

        if (kGlow < 0.002) {
          c[idx3] = 0;
          c[idx3 + 1] = 0;
          c[idx3 + 2] = 0;
          continue;
        }

        const vx = p[idx3];
        const vy = p[idx3 + 1];
        const vDistSq = (pointerKx - vx) ** 2 + (pointerKy - vy) ** 2;
        const core = Math.exp(-vDistSq / (2 * CORE_SIGMA_SQ)) * auraPresence;
        const boost = (kGlow * 0.60 + core * 0.75) * cfg.legendsIntensity * globalMul;

        c[idx3] = boost * cfg.colorR;
        c[idx3 + 1] = boost * cfg.colorG;
        c[idx3 + 2] = boost * cfg.colorB;
      }
      legendsData.colorAttr.needsUpdate = true;
      legendsData.posAttr.needsUpdate = true;
    }

    // D. Puits du clavier (Object_34) : halo dans le fond des fentes uniquement (z > -0.29)
    if (wellData && wellKeyIndices) {
      const c = wellData.colorArr;
      const p = wellData.posArr;
      const oz = wellData.origZ;
      for (let i = 0; i < wellData.count; i++) {
        const kGlow = keys[wellKeyIndices[i]].currentGlow;
        const idx3 = i * 3;
        if (kGlow < 0.002 || oz[i] <= -0.29) {
          c[idx3] = 0;
          c[idx3 + 1] = 0;
          c[idx3 + 2] = 0;
          continue;
        }
        const vx = p[idx3];
        const vy = p[idx3 + 1];
        const vDistSq = (pointerKx - vx) ** 2 + (pointerKy - vy) ** 2;
        const radial = Math.exp(-vDistSq / (2 * RADIAL_SIGMA_SQ)) * auraPresence;
        const core = Math.exp(-vDistSq / (2 * CORE_SIGMA_SQ)) * auraPresence;
        const wellGlow = (kGlow * 0.45 + radial * 0.60 + core * 0.70) * cfg.wellIntensity * globalMul;

        c[idx3] = wellGlow * cfg.colorR;
        c[idx3 + 1] = wellGlow * cfg.colorG;
        c[idx3 + 2] = wellGlow * cfg.colorB;
      }
      wellData.colorAttr.needsUpdate = true;
    }

    // E. Faisceaux volumétriques "God Rays" fusionnés aux coins avec atténuation sur les arêtes
    if (godRays) {
      godRays.mesh.visible = true;
      godRays.uniforms.uRayFalloffPower.value = cfg.rayFalloffPower;
      godRays.uniforms.uRayBaseOpacity.value = cfg.rayBaseOpacity;
      godRays.uniforms.uRayTopOpacity.value = cfg.rayTopOpacity;
      godRays.uniforms.uRayEdgeAttenuation.value = cfg.rayEdgeAttenuation;

      const p = godRays.posArr;
      const c = godRays.colorArr;
      const {
        keyIdx, clusterIdx, cornerClusters, anchorX, anchorY, offsetX, offsetY, outX, outY,
        isTop, cornerBoost, bladeFlag, count
      } = godRays;
      const cornerExtra = Math.max(0, cfg.rayCornerBoost - 1.0);
      const bridgeH = Math.max(0.15, Math.min(0.85, cfg.rayEdgeBridgeHeight ?? 0.38));
      const mergedScaleExtra = Math.max(0, (cfg.rayMergedCornerScale ?? 1.18) - 1.0);
      const mergedHeightExtra = Math.max(0, (cfg.rayMergedCornerHeight ?? 1.10) - 1.0);
      const colR = cfg.colorR * cfg.rayBrightness * globalMul;
      const colG = cfg.colorG * cfg.rayBrightness * globalMul;
      const colB = cfg.colorB * cfg.rayBrightness * globalMul;

      // Éclairement unifié de chaque groupe de coins qui se touchent (1 seul faisceau par intersection)
      for (let ci = 0; ci < cornerClusters.length; ci++) {
        const cl = cornerClusters[ci];
        let maxG = 0;
        let secG = 0;
        const clKeys = cl.keyIndices;
        for (let m = 0; m < clKeys.length; m++) {
          const g = keys[clKeys[m]].currentGlow;
          if (g > maxG) {
            secG = maxG;
            maxG = g;
          } else if (g > secG) {
            secG = g;
          }
        }
        cl.currentGlow = Math.min(1.12, maxG + secG * 0.14);
      }

      for (let i = 0; i < count; i++) {
        const clId = clusterIdx[i];
        const cl = clId >= 0 ? cornerClusters[clId] : null;
        const kGlow = cl ? cl.currentGlow : keys[keyIdx[i]].currentGlow;
        const idx4 = i * 4;
        if (kGlow < 0.002) {
          c[idx4] = 0;
          c[idx4 + 1] = 0;
          c[idx4 + 2] = 0;
          c[idx4 + 3] = 0;
          continue;
        }

        const idx3 = i * 3;
        const ax = anchorX[i];
        const ay = anchorY[i];
        let wScale = 1.0;
        let hScale = 1.0;
        if (cl && cl.touchCount > 1) {
          const mult = 1.0 + 0.15 * Math.min(2, cl.touchCount - 2);
          wScale = 1.0 + mergedScaleExtra * mult;
          hScale = 1.0 + mergedHeightExtra * mult;
        }
        const ox = offsetX[i] * wScale;
        const oy = offsetY[i] * wScale;
        const dvx = ax - pointerKx;
        const dvy = ay - pointerKy;
        const vDistSq = dvx * dvx + dvy * dvy;

        const radial = Math.exp(-vDistSq / (2 * RADIAL_SIGMA_SQ)) * auraPresence;
        const core = Math.exp(-vDistSq / (2 * CORE_SIGMA_SQ)) * auraPresence;
        const rayFactor = Math.min(1, kGlow * 0.72 + radial * 0.45 + core * 0.55);

        if (isTop[i]) {
          const dist = Math.sqrt(vDistSq);
          const invDist = dist > 0.001 ? 1 / dist : 0;
          const tiltMag = cfg.rayCrepuscularTilt * rayFactor * Math.min(1.0, dist * 0.45);
          const spreadMag = cfg.raySpread * rayFactor * wScale;
          const edgeHFactor = bladeFlag[i]
            ? 1.0
            : bridgeH + (0.86 - bridgeH) * Math.pow(cornerBoost[i], 1.35);
          p[idx3] = ax + ox + outX[i] * spreadMag + dvx * invDist * tiltMag;
          p[idx3 + 1] = ay + oy + outY[i] * spreadMag + dvy * invDist * tiltMag;
          p[idx3 + 2] = cfg.rayBaseZ - cfg.rayHeight * hScale * rayFactor * edgeHFactor * (0.72 + core * 0.45);
        } else {
          p[idx3] = ax + ox;
          p[idx3 + 1] = ay + oy;
          p[idx3 + 2] = cfg.rayBaseZ;
        }

        const cScale = 1.0 + cornerBoost[i] * cornerExtra;
        const edgeIntFactor = bladeFlag[i] ? 0.92 : 0.68;
        const localIntensity = Math.min(1.0, (kGlow * 0.55 + radial * 0.55 + core * 0.65) * cScale * edgeIntFactor);

        c[idx4] = colR;
        c[idx4 + 1] = colG;
        c[idx4 + 2] = colB;
        c[idx4 + 3] = localIntensity;
      }
      godRays.posAttr.needsUpdate = true;
      godRays.colorAttr.needsUpdate = true;
    }

    threeScene.queueRender();
  };
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

    const keyboardMeshes = {
      keycaps: null,      // Object_84 (80 touches principales)
      touchIdCap: null,   // Object_58 (capuchon Touch ID)
      legends: null,      // Object_76 (lettres & symboles gravés)
      skirts: null,       // Object_80 (jupes de rétroéclairage sous chaque touche)
      touchIdSkirt: null, // Object_60 (anneau lumineux sous Touch ID)
      well: null          // Object_34 (puits sombre du clavier)
    };

    if (threeScene) {
      // 1. Application de la finition Space Grey / Midnight mat anti-reflet
      applyMidnightFinish(threeScene);

      // 2. Recherche du nœud d'articulation de l'écran, du mesh d'affichage, du clavier et des matériaux de coque
      threeScene.traverse((obj) => {
        if (obj.name === 'VCQqxpxkUlzqcJI_62') {
          screenMesh = obj;
        }
        if (obj.isMesh) {
          if (obj.name === 'Object_84') keyboardMeshes.keycaps = obj;
          else if (obj.name === 'Object_58') keyboardMeshes.touchIdCap = obj;
          else if (obj.name === 'Object_76') keyboardMeshes.legends = obj;
          else if (obj.name === 'Object_80') keyboardMeshes.skirts = obj;
          else if (obj.name === 'Object_60') keyboardMeshes.touchIdSkirt = obj;
          else if (obj.name === 'Object_34') keyboardMeshes.well = obj;
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

    // 3b. Aura lumineuse interactive sur les touches du clavier 3D au survol
    const updateKeyboardAura = setupKeyboardHoverAura(keyboardMeshes, threeScene, modelViewer);

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
        updateKeyboardAura(currentRotation);

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
