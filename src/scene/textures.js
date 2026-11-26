import * as THREE from 'three';

/**
 * Generates clean interior porcelain floor tile texture for the 3D floor plan.
 */
export function createFloorTileTexture({
  baseColor = '#e7e5e4',
  groutColor = '#cbd5e1',
  tiles = 8,
  size = 512,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const step = size / tiles;
  ctx.strokeStyle = groutColor;
  ctx.lineWidth = 2;
  for (let i = 0; i <= tiles; i++) {
    const p = i * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates landscaped garden grass texture around the house plot.
 */
export function createLawnTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3f6f3e';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 650; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 130, 72, 0.4)' : 'rgba(42, 85, 42, 0.35)';
    ctx.fillRect(x, y, 4 + Math.random() * 8, 4 + Math.random() * 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates interlocking paving stone texture for the driveway and walkways.
 */
export function createPaverTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 12;
  const cw = size / cols;
  const ch = size / rows;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw * 0.5);
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#7c8798' : '#8a95a6';
      ctx.fillRect(c * cw + offset + 2, r * ch + 2, cw - 4, ch - 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates warm architectural timber texture for doors, stairs, decks, and pergolas.
 */
export function createTimberTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#855233';
  ctx.fillRect(0, 0, size, size);

  const planks = 10;
  const h = size / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#965e3c' : '#77482b';
    ctx.fillRect(0, i * h, size, h - 2);
    ctx.fillStyle = '#53301b';
    ctx.fillRect(0, (i + 1) * h - 2, size, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates pitched roof shingle / standing seam texture for gable roofs.
 */
export function createRoofTileTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, size, size);

  const rows = 14;
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = r % 2 === 0 ? '#3b495e' : '#2d394b';
    ctx.fillRect(0, r * rh, size, rh - 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, (r + 1) * rh - 2, size, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
