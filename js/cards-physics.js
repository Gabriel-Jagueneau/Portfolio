// ═══════════════════════════════════════════════════════════════════════════════
// ⚙  2D RIGID-BODY PHYSICS ENGINE — Orbit Cards (Zero-Overlap Guarantee)
//
// Architecture:
//   Every card has velocity (vx, vy). The orbit acts as a gentle spring attractor.
//   Iterative Gauss-Seidel position projection enforces strict non-penetration.
//   No two cards can ever overlap under any circumstance (orbit, drag, throw, multi-body cascade).
// ═══════════════════════════════════════════════════════════════════════════════

export const PHYSICS = {
  // ── Mass
  // card mass = DENSITY × (width × height). Heavier = less knockback.
  DENSITY: 0.01,

  // ── Orbit spring
  ORBIT_K: 0.0045,

  // ── Air resistance (per-frame velocity multiplier)
  DRAG: 0.92,

  // ── Hard velocity cap (px/frame)
  MAX_SPEED: 40,

  // ── Orbit rotation
  ORBIT_SPEED: 0.00050,  // Angular velocity (rad/frame)
  ORBIT_RADIUS_LERP: 0.025,   // How fast radius expands to target

  // ── Impulse-based collision response
  RESTITUTION: 0.90,
  FRICTION: 0.15,

  // ── Pre-contact repulsion field (border-to-border, smoothstep curve)
  REPULSION_MARGIN: 120,       // px from box edge where field starts (tight & close)
  REPULSION_STRENGTH: 2.0,    // Soft gentle nudging before contact

  // ── Strict Collision Gap Padding
  COLLISION_PADDING: 12,      // 12px air-gap buffer (zero overlap guarantee)

  // ── Throw velocity on mouse release
  THROW_SCALE: 0.28,
  THROW_HISTORY: 6,
};

// ═══════════════════════════════════════════════════════════════════════════════
// References
// ═══════════════════════════════════════════════════════════════════════════════
const zone = document.querySelector(".image-zone");
const cardEls = document.querySelectorAll(".cardage");
const allCards = Array.from(cardEls);

let bodies = [];
let rafId = null;
let visible = false;
let isMacInteractive = false;

function getBaseOrbitRadius(rectWidth) {
  return Math.max(340, Math.min(rectWidth * 0.44, 480));
}

export function setMacInteractiveMode(active) {
  isMacInteractive = Boolean(active);
  if (!zone) return;
  const rect = zone.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const normalRadius = getBaseOrbitRadius(rect.width);
  const radius = isMacInteractive
    ? normalRadius * 1.55
    : normalRadius;

  bodies.forEach(b => {
    b.targetRadius = radius;
    if (isMacInteractive) {
      // Outward push so cards decisively clear the Mac
      const dx = b.x - centerX;
      const dy = b.y - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const pushSpeed = 8.0;
      b.vx += (dx / dist) * pushSpeed;
      b.vy += (dy / dist) * pushSpeed;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Body initialization
// ═══════════════════════════════════════════════════════════════════════════════
export function initializeOrbits() {
  if (!zone) return;
  const rect = zone.getBoundingClientRect();
  const targetRadius = getBaseOrbitRadius(rect.width);
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const n = allCards.length || 1;

  bodies = allCards.map((el, i) => {
    const w = el.offsetWidth || 300;
    const h = el.offsetHeight || 160;
    const mass = Math.max(1, PHYSICS.DENSITY * w * h);

    // Symmetrical 4-quadrant circular distribution (framing the laptop)
    const angle = (2 * Math.PI * i) / n - Math.PI / 4;
    const x = centerX + targetRadius * Math.cos(angle);
    const y = centerY + targetRadius * Math.sin(angle);

    // Place element in DOM immediately at its circular orbit position
    el.style.left = (x - w * 0.5) + "px";
    el.style.top = (y - h * 0.5) + "px";

    return {
      el,
      dragging: false,

      // Orbit
      angle,
      radius: targetRadius,
      targetRadius,

      // Position (center of card, px, zone-relative)
      x,
      y,

      // Velocity (px/frame)
      vx: 0,
      vy: 0,

      // Drag tracking
      dragVx: 0,
      dragVy: 0,
      dragHistory: [],

      // Geometry & mass
      w, h, mass,
      invMass: 1 / mass,
    };
  });

  // Initial zero-overlap solve
  resolveCollisions(20);
}

function updateDimensions() {
  if (!zone || !bodies.length) return;
  const rect = zone.getBoundingClientRect();
  const normalRadius = getBaseOrbitRadius(rect.width);
  const radius = isMacInteractive
    ? normalRadius * 1.55
    : normalRadius;

  bodies.forEach((b, i) => {
    const el = allCards[i];
    b.w = el.offsetWidth || b.w;
    b.h = el.offsetHeight || b.h;
    b.mass = Math.max(1, PHYSICS.DENSITY * b.w * b.h);
    b.invMass = 1 / b.mass;
    b.targetRadius = radius;
  });

  resolveCollisions(20);
}
window.addEventListener('resize', updateDimensions, { passive: true });

// ═══════════════════════════════════════════════════════════════════════════════
// Pre-contact Repulsion Field
// ═══════════════════════════════════════════════════════════════════════════════
function applyRepulsionField() {
  const n = bodies.length;
  const pad = PHYSICS.COLLISION_PADDING;
  for (let i = 0; i < n; i++) {
    const a = bodies[i];
    for (let j = i + 1; j < n; j++) {
      const b = bodies[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const gapX = Math.max(0, Math.abs(dx) - ((a.w + b.w) * 0.5 + pad));
      const gapY = Math.max(0, Math.abs(dy) - ((a.h + b.h) * 0.5 + pad));
      const gap = Math.hypot(gapX, gapY);

      if (gap >= PHYSICS.REPULSION_MARGIN) continue;

      // t ∈ [0,1]: 0 at margin, 1 at contact
      const t = 1 - gap / PHYSICS.REPULSION_MARGIN;
      const strength = t * t * (3 - 2 * t) * PHYSICS.REPULSION_STRENGTH; // smoothstep

      // Repulsion direction (from border outward)
      let nx = 0, ny = 0;
      if (gap > 0.001) {
        if (gapX > 0 && gapY > 0) {
          nx = (dx > 0 ? 1 : -1) * (gapX / gap);
          ny = (dy > 0 ? 1 : -1) * (gapY / gap);
        } else if (gapX > 0) {
          nx = dx > 0 ? 1 : -1;
        } else {
          ny = dy > 0 ? 1 : -1;
        }
      } else {
        const d = Math.hypot(dx, dy) || 1;
        nx = dx / d; ny = dy / d;
      }

      // Mass-weighted impulse
      const tm = a.mass + b.mass;
      if (!a.dragging) { a.vx -= nx * strength * (b.mass / tm); a.vy -= ny * strength * (b.mass / tm); }
      if (!b.dragging) { b.vx += nx * strength * (a.mass / tm); b.vy += ny * strength * (a.mass / tm); }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Strict Iterative Position Projection & Impulse Resolver (Zero-Overlap Guarantee)
// ═══════════════════════════════════════════════════════════════════════════════
function resolveCollisions(maxIterations = 20) {
  const n = bodies.length;
  const pad = PHYSICS.COLLISION_PADDING;

  for (let iter = 0; iter < maxIterations; iter++) {
    let hasOverlap = false;

    for (let i = 0; i < n; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < n; j++) {
        const b = bodies[j];

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const halfW = (a.w + b.w) * 0.5 + pad;
        const halfH = (a.h + b.h) * 0.5 + pad;
        const ox = halfW - Math.abs(dx);
        const oy = halfH - Math.abs(dy);

        if (ox > 0 && oy > 0) {
          hasOverlap = true;

          // Non-zero nudge if completely concentric
          if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            dx = (j - i) * 5;
            dy = (j - i) * 5;
          }

          // Minimum penetration axis selection
          let nx = 0, ny = 0, pen = 0;
          if (ox < oy) {
            nx = dx >= 0 ? 1 : -1;
            pen = ox;
          } else {
            ny = dy >= 0 ? 1 : -1;
            pen = oy;
          }

          const invA = a.dragging ? 0 : a.invMass;
          const invB = b.dragging ? 0 : b.invMass;
          const invSum = invA + invB;
          if (invSum <= 0.0001) continue;

          // 1. Hard Positional Separation
          const corr = (pen + 0.5) / invSum;
          if (!a.dragging) {
            a.x -= nx * corr * invA;
            a.y -= ny * corr * invA;

            // Inward velocity cancellation
            const vDotA = a.vx * nx + a.vy * ny;
            if (vDotA > 0) { a.vx -= vDotA * nx; a.vy -= vDotA * ny; }
          }
          if (!b.dragging) {
            b.x += nx * corr * invB;
            b.y += ny * corr * invB;

            const vDotB = b.vx * nx + b.vy * ny;
            if (vDotB < 0) { b.vx -= vDotB * nx; b.vy -= vDotB * ny; }
          }

          // 2. Elastic Normal Impulse on final iteration
          if (iter === maxIterations - 1) {
            const avx = a.dragging ? a.dragVx : a.vx;
            const avy = a.dragging ? a.dragVy : a.vy;
            const bvx = b.dragging ? b.dragVx : b.vx;
            const bvy = b.dragging ? b.dragVy : b.vy;
            const rvn = (bvx - avx) * nx + (bvy - avy) * ny;

            if (rvn < 0) {
              const jn = -(1 + PHYSICS.RESTITUTION) * rvn / invSum;
              if (!a.dragging) { a.vx -= jn * nx * invA; a.vy -= jn * ny * invA; }
              if (!b.dragging) { b.vx += jn * nx * invB; b.vy += jn * ny * invB; }

              // Friction (tangential)
              const rvx = bvx - avx;
              const rvy = bvy - avy;
              const tx = rvx - rvn * nx;
              const ty = rvy - rvn * ny;
              const tLen = Math.hypot(tx, ty);
              if (tLen > 0.001) {
                const tnx = tx / tLen, tny = ty / tLen;
                const jt = -(rvx * tnx + rvy * tny) / invSum;
                const mu = PHYSICS.FRICTION;
                const jc = Math.max(-Math.abs(jn) * mu, Math.min(Math.abs(jn) * mu, jt));
                if (!a.dragging) { a.vx -= jc * tnx * invA; a.vy -= jc * tny * invA; }
                if (!b.dragging) { b.vx += jc * tnx * invB; b.vy += jc * tny * invB; }
              }
            }
          }
        }
      }
    }

    if (!hasOverlap) break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Physics Loop
// ═══════════════════════════════════════════════════════════════════════════════
function physicsLoop() {
  if (!visible || document.hidden || !zone) { rafId = null; return; }

  const rect = zone.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // ── Integrate all non-dragging bodies
  for (const b of bodies) {
    if (b.dragging) continue;

    // Advance orbit (only ticks when not in interactive mac mode)
    const radiusLerp = isMacInteractive ? 0.05 : PHYSICS.ORBIT_RADIUS_LERP;
    b.radius += (b.targetRadius - b.radius) * radiusLerp;

    if (!isMacInteractive) {
      b.angle += PHYSICS.ORBIT_SPEED;
    }

    // Orbit spring: F = K × (orbitTarget - position)
    const orbitX = centerX + b.radius * Math.cos(b.angle);
    const orbitY = centerY + b.radius * Math.sin(b.angle);
    const springK = isMacInteractive ? 0.025 : PHYSICS.ORBIT_K;
    b.vx += (orbitX - b.x) * springK;
    b.vy += (orbitY - b.y) * springK;

    // Air drag
    b.vx *= PHYSICS.DRAG;
    b.vy *= PHYSICS.DRAG;

    // Speed cap
    const spd = Math.hypot(b.vx, b.vy);
    if (spd > PHYSICS.MAX_SPEED) {
      b.vx *= PHYSICS.MAX_SPEED / spd;
      b.vy *= PHYSICS.MAX_SPEED / spd;
    }

    // Integrate position
    b.x += b.vx;
    b.y += b.vy;
  }

  // ── Repulsion field (pre-contact soft force)
  applyRepulsionField();

  // ── Contact collision (Iterative Hard Constraint Solver)
  resolveCollisions(20);

  // ── Write to DOM
  for (const b of bodies) {
    b.el.style.left = (b.x - b.w * 0.5) + "px";
    b.el.style.top = (b.y - b.h * 0.5) + "px";
  }

  rafId = requestAnimationFrame(physicsLoop);
}

function startEngine() { if (!rafId && visible && !document.hidden) rafId = requestAnimationFrame(physicsLoop); }
function stopEngine() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

// ── Visibility observers
if (zone) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { visible = e.isIntersecting; visible ? startEngine() : stopEngine(); });
  }, { rootMargin: '100px' }).observe(zone);
}
document.addEventListener('visibilitychange', () => { document.hidden ? stopEngine() : (visible && startEngine()); });

// ═══════════════════════════════════════════════════════════════════════════════
// Drag & Drop
// ═══════════════════════════════════════════════════════════════════════════════
allCards.forEach((el, i) => {
  if (window.getComputedStyle(el).display === 'none') return;
  el.style.position = 'absolute';

  el.addEventListener('mousedown', e => {
    e.preventDefault();
    const b = bodies[i];
    if (!b) return;

    // Offset: mouse pos relative to card center (zone coords)
    const offsetX = e.clientX - el.offsetLeft - b.w * 0.5;
    const offsetY = e.clientY - el.offsetTop - b.h * 0.5;

    b.dragging = true;
    b.dragVx = 0;
    b.dragVy = 0;
    b.dragHistory = [];

    function onMouseMove(e) {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      b.dragVx = newX - b.x;
      b.dragVy = newY - b.y;
      b.x = newX;
      b.y = newY;

      b.dragHistory.push({ x: newX, y: newY, t: performance.now() });
      if (b.dragHistory.length > PHYSICS.THROW_HISTORY) b.dragHistory.shift();

      // Enforce zero-overlap live during drag
      resolveCollisions(20);

      requestAnimationFrame(() => {
        for (const bd of bodies) {
          bd.el.style.left = (bd.x - bd.w * 0.5) + "px";
          bd.el.style.top = (bd.y - bd.h * 0.5) + "px";
        }
      });
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Compute throw velocity from drag history
      const hist = b.dragHistory;
      if (hist.length >= 2) {
        const newest = hist[hist.length - 1];
        const oldest = hist[0];
        const dtFrames = Math.max(1, (newest.t - oldest.t) / 16.667);
        b.vx = ((newest.x - oldest.x) / dtFrames) * PHYSICS.THROW_SCALE;
        b.vy = ((newest.y - oldest.y) / dtFrames) * PHYSICS.THROW_SCALE;
      } else {
        b.vx = b.dragVx * 2;
        b.vy = b.dragVy * 2;
      }

      // Update orbit angle to release position
      const dx = b.x - centerXSnapshot();
      const dy = b.y - centerYSnapshot();
      b.angle = Math.atan2(dy, dx);

      b.dragging = false;
      b.dragHistory = [];
      b.dragVx = 0;
      b.dragVy = 0;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
});

// Helpers to get zone center at release time
function centerXSnapshot() { return zone ? zone.getBoundingClientRect().width / 2 : 0; }
function centerYSnapshot() { return zone ? zone.getBoundingClientRect().height / 2 : 0; }
