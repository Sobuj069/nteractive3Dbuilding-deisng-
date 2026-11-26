import * as THREE from 'three';

/**
 * Generates a subtle procedural hardwood plank texture for the room floor & desk.
 */
export function createWoodTexture({
  baseColor = '#2a201b',
  grainColor = '#1e1612',
  highlightColor = '#382b24',
  planks = 6,
  size = 512,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const plankHeight = size / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * plankHeight;
    ctx.fillStyle = i % 2 === 0 ? baseColor : highlightColor;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, y, size, plankHeight);

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = grainColor;
    ctx.fillRect(0, y, size, 2);

    // Subtle horizontal wood grain streaks
    for (let g = 0; g < 18; g++) {
      const gy = y + Math.random() * plankHeight;
      const gw = 40 + Math.random() * 180;
      const gx = Math.random() * size;
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = g % 2 === 0 ? grainColor : highlightColor;
      ctx.fillRect(gx, gy, gw, 1.5);
    }
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates a dark woven topographic/grid desk mat texture.
 */
export function createDeskMatTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#131722';
  ctx.fillRect(0, 0, size, size);

  // Fine grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  const step = 32;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Accent corner stripes
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, size - 28, size - 28);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates a minimalist geometric framed poster texture for the left wall.
 */
export function createPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 512, 680);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 680);

  // Glowing sun/orb
  const orb = ctx.createRadialGradient(256, 260, 18, 256, 260, 160);
  orb.addColorStop(0, '#f472b6');
  orb.addColorStop(0.5, '#6366f1');
  orb.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(256, 260, 160, 0, Math.PI * 2);
  ctx.fill();

  // Isometric wireframe diamond
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.88)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(256, 130);
  ctx.lineTo(376, 260);
  ctx.lineTo(256, 390);
  ctx.lineTo(136, 260);
  ctx.closePath();
  ctx.stroke();

  // Horizon lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 2;
  for (let y = 440; y < 600; y += 22) {
    ctx.beginPath();
    ctx.moveTo(72, y);
    ctx.lineTo(440, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPATIAL STUDIO // 04', 256, 628);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates an animated ultrawide monitor screen texture (code + 3D telemetry + visualizer).
 */
export function createMonitorScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 440;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const codeWidths = [165, 220, 135, 260, 180, 110, 240, 195, 145, 210];

  function update(elapsed) {
    // Deep OLED background
    const grad = ctx.createLinearGradient(0, 0, 1024, 440);
    grad.addColorStop(0, '#070b18');
    grad.addColorStop(0.55, '#0b132b');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 440);

    // Ambient glow blob
    const glow = ctx.createRadialGradient(540, 210, 10, 540, 210, 220);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.14)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1024, 440);

    // Top bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(16, 14, 992, 34);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.strokeRect(16, 14, 992, 34);

    // Window traffic lights
    ['#fb7185', '#fbbf24', '#34d399'].forEach((color, idx) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(38 + idx * 18, 31, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px monospace';
    ctx.fillText('STUDIO_SCENE.GLSL  •  120 FPS  •  MOTION/THREE', 110, 35);

    // Left panel: Code lines
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(16, 58, 318, 364);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.strokeRect(16, 58, 318, 364);

    codeWidths.forEach((w, idx) => {
      const y = 84 + idx * 30;
      const pulse = 0.75 + 0.25 * Math.sin(elapsed * 2 + idx * 0.7);
      ctx.fillStyle =
        idx % 3 === 0
          ? `rgba(56, 189, 248, ${0.8 * pulse})`
          : idx % 3 === 1
            ? `rgba(244, 114, 182, ${0.75 * pulse})`
            : 'rgba(148, 163, 184, 0.45)';
      ctx.fillRect(36 + (idx % 2) * 18, y, w * 0.85, 10);
    });

    // Center panel: Rotating 3D wireframe preview
    ctx.fillStyle = 'rgba(15, 23, 42, 0.52)';
    ctx.fillRect(346, 58, 380, 364);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.24)';
    ctx.strokeRect(346, 58, 380, 364);

    const cx = 536;
    const cy = 236;
    const angle = elapsed * 0.9;
    const radius = 84;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = angle + (i * Math.PI) / 3;
      pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * 0.56]);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py - 38) : ctx.lineTo(px, py - 38)));
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#a78bfa';
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py + 38) : ctx.lineTo(px, py + 38)));
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(244, 114, 182, 0.75)';
    pts.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.moveTo(px, py - 38);
      ctx.lineTo(px, py + 38);
      ctx.stroke();
    });

    // Right panel: Audio / GPU telemetry bars
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(738, 58, 270, 364);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.strokeRect(738, 58, 270, 364);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('GPU RENDER PIPELINE', 758, 90);

    for (let b = 0; b < 14; b++) {
      const barH = 26 + Math.abs(Math.sin(elapsed * 3.2 + b * 0.45)) * 125;
      const bx = 758 + b * 17;
      const by = 270 - barH;
      const barGrad = ctx.createLinearGradient(0, by, 0, 270);
      barGrad.addColorStop(0, '#38bdf8');
      barGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = barGrad;
      ctx.fillRect(bx, by, 10, barH);
    }

    ctx.fillStyle = '#34d399';
    ctx.font = '600 13px monospace';
    ctx.fillText('RAYCASTER: ACTIVE', 758, 326);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('THERMALS: 49°C OPTIMAL', 758, 354);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('VRAM: 11.4 / 16.0 GB', 758, 382);

    texture.needsUpdate = true;
  }

  update(0);
  return { texture, update };
}
