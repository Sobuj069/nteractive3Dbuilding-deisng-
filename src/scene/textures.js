import * as THREE from 'three';

/**
 * Generates procedural exterior wall texture: smooth plaster, exposed red brick, or hollow concrete block.
 */
export function createWallTexture(pattern = 'plaster', baseColor = '#f4f0e8', size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  if (pattern === 'brick') {
    const rows = 16;
    const cols = 8;
    const rh = size / rows;
    const cw = size / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw * 0.5);
      for (let c = -1; c <= cols; c++) {
        ctx.fillStyle = (r + c) % 3 === 0 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(c * cw + offset + 3, r * rh + 3, cw - 6, rh - 6);
        ctx.strokeStyle = 'rgba(235, 225, 215, 0.55)';
        ctx.lineWidth = 3;
        ctx.strokeRect(c * cw + offset, r * rh, cw, rh);
      }
    }
  } else if (pattern === 'block') {
    const rows = 10;
    const cols = 5;
    const rh = size / rows;
    const cw = size / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw * 0.5);
      for (let c = -1; c <= cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(c * cw + offset + 2, r * rh + 2, cw - 4, rh - 4);
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.lineWidth = 3;
        ctx.strokeRect(c * cw + offset, r * rh, cw, rh);
      }
    }
  } else {
    // Subtle plaster stucco grain
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(Math.random() * size, Math.random() * size, 6, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates procedural interior floor textures for all 21 Floor Designs.
 */
export function createFloorDesignTexture(design, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const { pattern = 'grid', base = '#ece7df', accent = '#cbd5e1' } = design || {};
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  if (pattern === 'grid') {
    const tiles = 8;
    const step = size / tiles;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(size, i * step);
      ctx.stroke();
    }
  } else if (pattern === 'checker') {
    const tiles = 8;
    const step = size / tiles;
    ctx.fillStyle = accent;
    for (let r = 0; r < tiles; r++) {
      for (let c = 0; c < tiles; c++) {
        if ((r + c) % 2 === 1) {
          ctx.fillRect(c * step, r * step, step, step);
        }
      }
    }
  } else if (pattern === 'wood') {
    const planks = 12;
    const h = size / planks;
    for (let i = 0; i < planks; i++) {
      ctx.fillStyle = i % 2 === 0 ? base : accent;
      ctx.globalAlpha = i % 2 === 0 ? 1 : 0.25;
      ctx.fillRect(0, i * h, size, h - 2);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = accent;
      ctx.fillRect(0, (i + 1) * h - 2, size, 2);
    }
    ctx.globalAlpha = 1;
  } else if (pattern === 'marble') {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.35;
    for (let v = 0; v < 14; v++) {
      ctx.lineWidth = 1.5 + (v % 3);
      ctx.beginPath();
      let x = (v * 67) % size;
      let y = 0;
      ctx.moveTo(x, y);
      for (let s = 0; s < 8; s++) {
        x += (Math.sin(v * 2 + s) * 45);
        y += size / 8;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size / 2, size / 2);
    ctx.strokeRect(size / 2, size / 2, size / 2, size / 2);
    ctx.globalAlpha = 1;
  } else if (pattern === 'terrazzo') {
    for (let i = 0; i < 360; i++) {
      ctx.fillStyle = i % 3 === 0 ? accent : i % 3 === 1 ? '#94a3b8' : '#ffffff';
      ctx.globalAlpha = 0.55;
      const rx = (i * 97) % size;
      const ry = (i * 53) % size;
      const rw = 4 + (i % 7);
      const rh = 4 + ((i * 3) % 7);
      ctx.fillRect(rx, ry, rw, rh);
    }
    ctx.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLawnTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3f6f3e';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 130, 72, 0.35)' : 'rgba(42, 85, 42, 0.3)';
    ctx.fillRect((i * 83) % size, (i * 47) % size, 6, 6);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

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

export function createRoofTileTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(0, 0, size, size);
  const rows = 14;
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = r % 2 === 0 ? '#9a3412' : '#7c2d12';
    ctx.fillRect(0, r * rh, size, rh - 2);
    ctx.fillStyle = '#431407';
    ctx.fillRect(0, (r + 1) * rh - 2, size, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
