import * as THREE from 'three';

/**
 * Generates an architectural concrete / honed stone grid texture for the tower slabs & plaza.
 */
export function createArchitecturalStoneTexture({
  baseColor = '#d6d3cd',
  seamColor = '#a8a29e',
  speckColor = '#e7e5e4',
  grid = 6,
  size = 512,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const cell = size / grid;
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? baseColor : speckColor;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }

  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = seamColor;
  ctx.lineWidth = 2;
  for (let i = 0; i <= grid; i++) {
    const pos = i * cell;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates a reflective architectural curtain-wall mullion & lit interior window texture.
 */
export function createFacadeGlassTexture({
  isNight = false,
  cols = 8,
  rows = 4,
  size = 512,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base tinted glass gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  if (isNight) {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
  } else {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#0ea5e9');
    grad.addColorStop(1, '#1e3a8a');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const cellW = size / cols;
  const cellH = size / rows;

  // Subtle interior room glow variation
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = ((r * 7 + c * 11) % 5) !== 0;
      if (lit) {
        const roomGrad = ctx.createLinearGradient(0, r * cellH, 0, (r + 1) * cellH);
        if (isNight) {
          roomGrad.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
          roomGrad.addColorStop(1, 'rgba(251, 146, 60, 0.16)');
        } else {
          roomGrad.addColorStop(0, 'rgba(224, 242, 254, 0.25)');
          roomGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        }
        ctx.fillStyle = roomGrad;
        ctx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8);
      }
    }
  }

  // Mullion grid frames
  ctx.strokeStyle = isNight ? '#090d16' : '#1e293b';
  ctx.lineWidth = 6;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, size);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(size, r * cellH);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates warm architectural timber deck planks for soffits and sky terrace.
 */
export function createTimberDeckTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7c4d2f';
  ctx.fillRect(0, 0, size, size);

  const planks = 12;
  const h = size / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8c5837' : '#6f4328';
    ctx.fillRect(0, i * h, size, h - 2);
    ctx.fillStyle = '#4a2a18';
    ctx.fillRect(0, (i + 1) * h - 2, size, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates an animated architectural reflecting pool / infinity water texture.
 */
export function createWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  function update(elapsed) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 28) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 16) {
        const wave = Math.sin(x * 0.03 + elapsed * 2.1 + y * 0.05) * 5;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    texture.needsUpdate = true;
  }

  update(0);
  return { texture, update };
}
