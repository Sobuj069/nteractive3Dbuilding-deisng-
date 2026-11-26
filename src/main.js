import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate, frame } from 'motion';
import { threeEffect } from 'motion/three';
import { BUILDING_TIERS, DEFAULT_CAMERA, HOTSPOTS } from './data/hotspots.js';
import { createBuildingScene } from './scene/createBuildingScene.js';

// Register Motion's Three.js integration
animate.addEffect(threeEffect);

const canvasWrap = document.getElementById('canvas-wrap');
const hotspotsLayer = document.getElementById('hotspots-layer');
const hoverTooltip = document.getElementById('hover-tooltip');
const tooltipLabel = document.getElementById('tooltip-label');
const quickDock = document.getElementById('quick-dock');

const detailCard = document.getElementById('detail-card');
const detailCategory = document.getElementById('detail-category');
const detailTitle = document.getElementById('detail-title');
const detailMetric = document.getElementById('detail-metric');
const detailBadge = document.getElementById('detail-badge');
const detailDesc = document.getElementById('detail-desc');
const detailSpecs = document.getElementById('detail-specs');

const btnExplode = document.getElementById('btn-explode');
const explodeLabel = document.getElementById('explode-label');
const btnAssemble = document.getElementById('btn-assemble');
const btnTime = document.getElementById('btn-time');
const timeIcon = document.getElementById('time-icon');
const timeLabel = document.getElementById('time-label');
const btnAutoRotate = document.getElementById('btn-autorotate');
const btnReset = document.getElementById('btn-reset');
const btnCloseDetail = document.getElementById('btn-close-detail');
const btnPrevItem = document.getElementById('btn-prev-item');
const btnNextItem = document.getElementById('btn-next-item');

// Core Three.js Renderer, Scene, Camera
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  90
);
camera.position.set(...DEFAULT_CAMERA.position);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
canvasWrap.appendChild(renderer.domElement);

// 360 OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...DEFAULT_CAMERA.target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4.5;
controls.maxDistance = 28.0;
controls.minPolarAngle = 0.16;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.update();

btnAutoRotate.classList.add('is-active');

// Build the 3D Architectural Building Scene
const building = createBuildingScene(scene);

// Application State
let activeId = null;
let hoveredId = null;
let isExploded = false;
const TIME_MODES = [
  { key: 'sunset', icon: '🌇', label: 'Golden Hour' },
  { key: 'night', icon: '🌙', label: 'Night Skyline' },
  { key: 'day', icon: '☀️', label: 'Daylight' },
];
let timeIndex = 0;
let cameraAnimations = [];
let tierAnimations = [];
let pointerDownPos = { x: 0, y: 0 };

// Raycaster setup
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactiveMeshes = Object.values(building.interactiveGroups);

// Build Hotspot Pins + Bottom Dock Buttons
const hotspotPins = new Map();
const dockButtons = new Map();

HOTSPOTS.forEach((item, index) => {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'hotspot-pin';
  pin.style.setProperty('--pin-color', item.accent);
  pin.innerHTML = `
    <span class="pin-dot">${index + 1}</span>
    <span class="pin-label">${item.shortName}</span>
  `;
  pin.addEventListener('click', (e) => {
    e.stopPropagation();
    selectHotspot(item.id);
  });
  hotspotsLayer.appendChild(pin);
  hotspotPins.set(item.id, {
    el: pin,
    anchor: new THREE.Vector3(...item.anchor),
    tierKey: item.id in building.tierGroups ? item.id : null,
  });

  const dockBtn = document.createElement('button');
  dockBtn.type = 'button';
  dockBtn.className = 'dock-btn';
  dockBtn.textContent = item.shortName;
  dockBtn.dataset.target = item.id;
  dockBtn.addEventListener('click', () => selectHotspot(item.id));
  quickDock.appendChild(dockBtn);
  dockButtons.set(item.id, dockBtn);
});

const overviewDockBtn = quickDock.querySelector('[data-target="overview"]');
overviewDockBtn.addEventListener('click', () => resetView());
dockButtons.set('overview', overviewDockBtn);

function cancelCameraMotion() {
  cameraAnimations.forEach((ctrl) => ctrl.stop());
  cameraAnimations = [];
}

function cancelTierMotion() {
  tierAnimations.forEach((ctrl) => ctrl.stop());
  tierAnimations = [];
}

function flyCameraTo(pos, target) {
  cancelCameraMotion();
  const transition = { duration: 1.0, ease: [0.22, 1, 0.36, 1] };

  cameraAnimations.push(
    animate(camera, { x: pos[0], y: pos[1], z: pos[2] }, transition),
    animate(controls.target, { x: target[0], y: target[1], z: target[2] }, transition)
  );
}

controls.addEventListener('start', cancelCameraMotion);

// Staggered Architectural Building Assembly Animation via Motion
function playAssemblyAnimation() {
  cancelTierMotion();
  isExploded = false;
  btnExplode.classList.remove('is-active');
  explodeLabel.textContent = 'Explode Floors';

  BUILDING_TIERS.forEach((tier, idx) => {
    const group = building.tierGroups[tier.key];
    group.position.y = tier.baseY + 8.5 + idx * 1.4;
    const ctrl = animate(
      group,
      { y: tier.baseY },
      {
        duration: 0.95,
        delay: idx * 0.14,
        ease: [0.22, 1, 0.36, 1],
      }
    );
    tierAnimations.push(ctrl);
  });
}

// Exploded Structural View Toggle via Motion
function toggleExplodeView() {
  cancelTierMotion();
  isExploded = !isExploded;
  btnExplode.classList.toggle('is-active', isExploded);
  explodeLabel.textContent = isExploded ? 'Assemble Floors' : 'Explode Floors';

  BUILDING_TIERS.forEach((tier, idx) => {
    const group = building.tierGroups[tier.key];
    const targetY = isExploded ? tier.baseY + tier.explodeOffset : tier.baseY;
    const ctrl = animate(
      group,
      { y: targetY },
      {
        duration: 0.85,
        delay: idx * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }
    );
    tierAnimations.push(ctrl);
  });

  if (isExploded && !activeId) {
    flyCameraTo([14.2, 10.6, 15.2], [0, 5.2, 0]);
  } else if (!isExploded && !activeId) {
    flyCameraTo(DEFAULT_CAMERA.position, DEFAULT_CAMERA.target);
  }
}

function updateActiveStates(id) {
  hotspotPins.forEach(({ el }, key) => {
    el.classList.toggle('is-active', key === id);
  });
  dockButtons.forEach((btn, key) => {
    btn.classList.toggle('is-active', key === (id ?? 'overview'));
  });
}

function showDetailCard(item) {
  detailCategory.textContent = item.category;
  detailCategory.style.color = item.accent;
  detailTitle.textContent = item.label;
  detailMetric.textContent = item.metric;
  detailMetric.style.color = item.accent;
  detailBadge.textContent = item.badge;
  detailDesc.textContent = item.description;

  detailSpecs.innerHTML = item.specs
    .map(
      (s) => `
      <div class="spec-box">
        <span class="spec-key">${s.key}</span>
        <span class="spec-val">${s.value}</span>
      </div>
    `
    )
    .join('');

  detailCard.classList.add('is-open');
  detailCard.setAttribute('aria-hidden', 'false');
  animate(
    detailCard,
    { opacity: [0, 1], x: [24, 0], scale: [0.97, 1] },
    { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
  );
}

function hideDetailCard() {
  detailCard.classList.remove('is-open');
  detailCard.setAttribute('aria-hidden', 'true');
  animate(detailCard, { opacity: 0, x: 24 }, { duration: 0.25, ease: 'easeOut' });
}

function selectHotspot(id) {
  const item = HOTSPOTS.find((h) => h.id === id);
  if (!item) return;

  activeId = id;
  controls.autoRotate = false;
  btnAutoRotate.classList.remove('is-active');

  const tierGroup = building.tierGroups[id];
  const yOffset = tierGroup ? tierGroup.position.y : 0;

  updateActiveStates(id);
  flyCameraTo(
    [item.cameraPos[0], item.cameraPos[1] + yOffset, item.cameraPos[2]],
    [item.cameraTarget[0], item.cameraTarget[1] + yOffset, item.cameraTarget[2]]
  );
  showDetailCard(item);
}

function resetView() {
  activeId = null;
  updateActiveStates(null);
  flyCameraTo(
    DEFAULT_CAMERA.position,
    [DEFAULT_CAMERA.target[0], DEFAULT_CAMERA.target[1] + (isExploded ? 1.4 : 0), DEFAULT_CAMERA.target[2]]
  );
  hideDetailCard();
}

function cycleTimeOfDay() {
  timeIndex = (timeIndex + 1) % TIME_MODES.length;
  const mode = TIME_MODES[timeIndex];
  document.body.setAttribute('data-theme', mode.key);
  building.setTimeOfDay(mode.key);
  timeIcon.textContent = mode.icon;
  timeLabel.textContent = mode.label;
}

function toggleAutoRotate() {
  controls.autoRotate = !controls.autoRotate;
  btnAutoRotate.classList.toggle('is-active', controls.autoRotate);
}

// Raycaster Hover & Click Detection
function updatePointerCoords(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickHotspot(event) {
  updatePointerCoords(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactiveMeshes, true);
  for (const hit of hits) {
    if (hit.object.userData?.hotspotId) {
      return hit.object.userData.hotspotId;
    }
  }
  return null;
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointermove', (e) => {
  const hitId = pickHotspot(e);
  if (hitId !== hoveredId) {
    hoveredId = hitId;
    if (hoveredId) {
      const item = HOTSPOTS.find((h) => h.id === hoveredId);
      tooltipLabel.textContent = item.label;
      hoverTooltip.querySelector('.tooltip-dot').style.background = item.accent;
      canvasWrap.classList.add('is-hovering');
      animate(hoverTooltip, { opacity: 1, scale: 1 }, { duration: 0.18 });
    } else {
      canvasWrap.classList.remove('is-hovering');
      animate(hoverTooltip, { opacity: 0, scale: 0.94 }, { duration: 0.15 });
    }
  }

  if (hoveredId) {
    hoverTooltip.style.left = `${e.clientX}px`;
    hoverTooltip.style.top = `${e.clientY}px`;
  }
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  if (Math.hypot(dx, dy) > 6) return;

  const hitId = pickHotspot(e);
  if (hitId) {
    selectHotspot(hitId);
  }
});

// UI Button Listeners
btnExplode.addEventListener('click', toggleExplodeView);
btnAssemble.addEventListener('click', () => {
  resetView();
  playAssemblyAnimation();
});
btnTime.addEventListener('click', cycleTimeOfDay);
btnAutoRotate.addEventListener('click', toggleAutoRotate);
btnReset.addEventListener('click', resetView);
btnCloseDetail.addEventListener('click', resetView);

btnPrevItem.addEventListener('click', () => {
  const idx = HOTSPOTS.findIndex((h) => h.id === activeId);
  const prevIdx = idx <= 0 ? HOTSPOTS.length - 1 : idx - 1;
  selectHotspot(HOTSPOTS[prevIdx].id);
});

btnNextItem.addEventListener('click', () => {
  const idx = HOTSPOTS.findIndex((h) => h.id === activeId);
  const nextIdx = (idx + 1) % HOTSPOTS.length;
  selectHotspot(HOTSPOTS[nextIdx].id);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeId) {
    resetView();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Project 3D anchors (tracking tier Y movement) to 2D screen coordinates
const projectedVec = new THREE.Vector3();
function updateHotspotPins() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  hotspotPins.forEach(({ el, anchor, tierKey }) => {
    const tierY = tierKey ? building.tierGroups[tierKey].position.y : 0;
    projectedVec.set(anchor.x, anchor.y + tierY, anchor.z).project(camera);

    if (projectedVec.z > 1) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const x = (projectedVec.x * 0.5 + 0.5) * width;
    const y = (-projectedVec.y * 0.5 + 0.5) * height;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  });
}

// Kick off cinematic architectural assembly on initial load
playAssemblyAnimation();

// Motion's frame.render loop
let lastTime = performance.now();
const startTime = lastTime;

frame.render(() => {
  const now = performance.now();
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  const elapsed = (now - startTime) / 1000;
  lastTime = now;

  controls.update();
  building.update(elapsed, delta);
  updateHotspotPins();
  renderer.render(scene, camera);
}, true);
