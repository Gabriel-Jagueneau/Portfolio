/**
 * Bento Grid Auto-Layout Engine for Portfolio Projects
 * Dynamically computes a balanced, harmonious 12-column Bento arrangement
 * without any orphans or incomplete rows whenever projects are added or removed.
 */

export function getBentoRowSizes(count) {
  if (count <= 0) return [];
  if (count === 1) return [1];
  if (count === 2) return [2];
  if (count === 3) return [3];
  if (count === 4) return [2, 2];

  let numPairs = 0;
  let numTriplets = 0;

  const remainder = count % 3;
  if (remainder === 0) {
    numTriplets = count / 3;
    numPairs = 0;
  } else if (remainder === 1) {
    numPairs = 2;
    numTriplets = (count - 4) / 3;
  } else {
    numPairs = 1;
    numTriplets = (count - 2) / 3;
  }

  const rowSizes = [];
  if (numPairs === 2) {
    rowSizes.push(2);
    for (let i = 0; i < numTriplets; i++) rowSizes.push(3);
    rowSizes.push(2);
  } else if (numPairs === 1) {
    if (numTriplets === 1) {
      rowSizes.push(2, 3);
    } else if (numTriplets === 2) {
      rowSizes.push(3, 2, 3);
    } else {
      const half = Math.floor(numTriplets / 2);
      for (let i = 0; i < half; i++) rowSizes.push(3);
      rowSizes.push(2);
      for (let i = half; i < numTriplets; i++) rowSizes.push(3);
    }
  } else {
    for (let i = 0; i < numTriplets; i++) rowSizes.push(3);
  }

  return rowSizes;
}

export function getBentoSpans(count) {
  if (count <= 0) return [];
  if (count === 1) return [12];

  const rowSizes = getBentoRowSizes(count);
  const spans = [];
  let pairIndex = 0;

  rowSizes.forEach((size) => {
    if (size === 1) {
      spans.push(12);
    } else if (size === 2) {
      // Alterner [7, 5] et [5, 7] pour créer le rythme asymétrique Bento caractéristique
      if (pairIndex % 2 === 0) {
        spans.push(7, 5);
      } else {
        spans.push(5, 7);
      }
      pairIndex++;
    } else if (size === 3) {
      spans.push(4, 4, 4);
    }
  });

  return spans;
}

export function applyBentoLayout() {
  const container = document.getElementById('cards-projects');
  if (!container) return;

  const cards = Array.from(container.children).filter((el) => el.classList.contains('carder'));
  if (cards.length === 0) return;

  const spans = getBentoSpans(cards.length);

  cards.forEach((card, idx) => {
    card.classList.remove(
      'bento-large',
      'bento-medium',
      'bento-span-4',
      'bento-span-5',
      'bento-span-6',
      'bento-span-7',
      'bento-span-8',
      'bento-span-12'
    );
    const span = spans[idx] || 6;
    card.classList.add(`bento-span-${span}`);
    card.setAttribute('data-bento-span', span);
  });
}

export function initBentoGrid() {
  const container = document.getElementById('cards-projects');
  if (!container) return;

  applyBentoLayout();

  // Observer toute addition ou suppression dynamique de projets
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (const m of mutations) {
      if (m.type === 'childList') {
        shouldUpdate = true;
        break;
      }
    }
    if (shouldUpdate) {
      applyBentoLayout();
    }
  });

  observer.observe(container, { childList: true });
}

