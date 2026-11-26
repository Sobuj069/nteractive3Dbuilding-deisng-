import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate, frame } from 'motion';
import { threeEffect } from 'motion/three';
import {
  DEFAULT_CAMERA,
  DEFAULT_PLAN,
  WALL_SWATCHES,
  computeHouseMetrics,
} from './data/housePlan.js';
import { createHouseModel } from './scene/createHouseModel.js';

// Register Motion's Three.js integration
animate.addEffect(threeEffect);

const canvasWrap = document.getElementById('canvas-wrap');
const hotspotsLayer = document.getElementById('hotspots-layer');
const hoverTooltip = document.getElementById('hover-tooltip');
const tooltipLabel = document.getElementById('tooltip-label');

const hudProjectName = document.getElementById('hud-project-name');
const hudSummaryPill = document.getElementById('hud-summary-pill');

const studioPanel = document.getElementById('studio-panel');
const btnTogglePanel = document.getElementById('btn-toggle-panel');
const blueprintCanvas = document.getElementById('blueprint-canvas');
const bpFirstBtn = document.getElementById('bp-first-btn');
const btnViewFirst = document.getElementById('btn-view-first');

const metricSqFt = document.getElementById('m-sqft');
const metricShotok = document.getElementById('m-shotok');
const metricKatha = document.getElementById('m-katha');

const inpName = document.getElementById('inp-name');
const inpWidth = document.getElementById('inp-width');
const inpDepth = document.getElementById('inp-depth');
const valWidth = document.getElementById('val-width');
const valDepth = document.getElementById('val-depth');
const inpFurniture = document.getElementById('inp-furniture');
const swatchRow = document.getElementById('swatch-row');
const btnResetPlan = document.getElementById('btn-reset-plan');

const btnAssemble = document.getElementById('btn-assemble');
const btnTime = document.getElementById('btn-time');
const timeIcon = document.getElementById('time-icon');
const timeLabel = document.getElementById('time-label');
const btnAutoRotate = document.getElementById('btn-autorotate');
const btnReset = document.getElementById('btn-reset');

const detailCard = document.getElementById('detail-card');
const detailFloorTag = document.getElementById('detail-floor-tag');
const detailTitle = document.getElementById('detail-title');
const detailDims = document.getElementById('detail-dims');
const detailArea = document.getElementById('detail-area');
const detailDesc = document.getElementById('detail-desc');
const detailFeatures = document.getElementById('detail-features');
const btnCloseDetail = document.getElementById('btn-close-detail');
const btnPrevRoom = document.getElementById('btn-prev-room');
const btnNextRoom = document.getElementById('btn-next-room');

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(...DEFAULT_CAMERA.position);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
canvasWrap.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...DEFAULT_CAMERA.target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4.5;
controls.maxDistance = 30.0;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.65;
controls.update();

// Build Parametric House Model
const house = createHouseModel(scene);

// Application State
let plan = { ...DEFAULT_PLAN };
let metrics = computeHouseMetrics(plan);
let viewMode = 'full'; // 'full' | 'first' | 'ground' | 'explode'
let bpFloor = 'ground'; // 'ground' | 'first'
let activeRoomId = null;
let hoveredRoomId = null;
let lightingMode = 'day';
let viewToken = 0;

let cameraAnimations = [];
let tierAnimations = [];
let pointerDownPos = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const roomPins = new Map();

function cancelCameraMotion() {
  cameraAnimations.forEach((c) => c.stop());
  cameraAnimations = [];
}

function cancelTierMotion() {
  tierAnimations.forEach((c) => c.stop());
  tierAnimations = [];
}

controls.addEventListener('start', cancelCameraMotion);

function flyCameraTo(pos, target) {
  cancelCameraMotion();
  const transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
  cameraAnimations.push(
    animate(camera, { x: pos[0], y: pos[1], z: pos[2] }, transition),
    animate(controls.target, { x: target[0], y: target[1], z: target[2] }, transition)
  );
}

// Floor Cutaway & Explode View Transitions via Motion
function applyViewMode(nextMode, adjustCamera = true) {
  viewMode = nextMode;
  viewToken++;
  const token = viewToken;
  cancelTierMotion();

  if (plan.floors === 1 && viewMode === 'first') {
    viewMode = 'ground';
  }

  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === viewMode);
  });

  const ease = [0.22, 1, 0.36, 1];
  const duration = 0.65;

  const { groundGroup, firstFloorGroup, roofGroup } = house;

  if (viewMode === 'full') {
    groundGroup.visible = true;
    firstFloorGroup.visible = plan.floors === 2;
    roofGroup.visible = true;
    tierAnimations.push(
      animate(groundGroup, { y: 0 }, { duration, ease }),
      animate(firstFloorGroup, { y: 0 }, { duration, ease }),
      animate(roofGroup, { y: 0 }, { duration, ease })
    );
    if (adjustCamera && !activeRoomId) {
      flyCameraTo(DEFAULT_CAMERA.position, DEFAULT_CAMERA.target);
    }
  } else if (viewMode === 'first') {
    groundGroup.visible = true;
    firstFloorGroup.visible = true;
    tierAnimations.push(
      animate(groundGroup, { y: 0 }, { duration, ease }),
      animate(firstFloorGroup, { y: 0 }, { duration, ease })
    );
    const roofAnim = animate(roofGroup, { y: 6.5 }, { duration: 0.55, ease });
    roofAnim.then(() => {
      if (token === viewToken && viewMode === 'first') roofGroup.visible = false;
    });
    tierAnimations.push(roofAnim);

    if (adjustCamera && !activeRoomId) {
      flyCameraTo([0.5, 11.8, 9.8], [0, 2.5, 0]);
    }
  } else if (viewMode === 'ground') {
    groundGroup.visible = true;
    tierAnimations.push(animate(groundGroup, { y: 0 }, { duration, ease }));

    const firstAnim = animate(firstFloorGroup, { y: 6.5 }, { duration: 0.5, ease });
    firstAnim.then(() => {
      if (token === viewToken && viewMode === 'ground') firstFloorGroup.visible = false;
    });
    const roofAnim = animate(roofGroup, { y: 8.5 }, { duration: 0.5, ease });
    roofAnim.then(() => {
      if (token === viewToken && viewMode === 'ground') roofGroup.visible = false;
    });
    tierAnimations.push(firstAnim, roofAnim);

    if (adjustCamera && !activeRoomId) {
      flyCameraTo([0.4, 11.2, 9.5], [0, 0.4, 0]);
    }
  } else if (viewMode === 'explode') {
    groundGroup.visible = true;
    firstFloorGroup.visible = plan.floors === 2;
    roofGroup.visible = true;
    const roofTargetY = plan.floors === 2 ? 4.4 : 2.5;
    tierAnimations.push(
      animate(groundGroup, { y: 0 }, { duration, ease }),
      animate(firstFloorGroup, { y: 2.2 }, { duration, ease }),
      animate(roofGroup, { y: roofTargetY }, { duration, ease })
    );
    if (adjustCamera && !activeRoomId) {
      flyCameraTo([15.2, 12.2, 16.0], [0, 3.8, 0]);
    }
  }
}

function playBuildAnimation() {
  viewToken++;
  cancelTierMotion();
  viewMode = 'full';
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === 'full');
  });

  const { groundGroup, firstFloorGroup, roofGroup } = house;
  groundGroup.visible = true;
  firstFloorGroup.visible = plan.floors === 2;
  roofGroup.visible = true;

  groundGroup.position.y = 7.5;
  firstFloorGroup.position.y = 10.5;
  roofGroup.position.y = 13.5;

  const ease = [0.22, 1, 0.36, 1];
  tierAnimations.push(
    animate(groundGroup, { y: 0 }, { duration: 0.85, delay: 0.05, ease }),
    animate(firstFloorGroup, { y: 0 }, { duration: 0.85, delay: 0.22, ease }),
    animate(roofGroup, { y: 0 }, { duration: 0.85, delay: plan.floors === 2 ? 0.4 : 0.24, ease })
  );
}

// Render 2D Blueprint Rooms & 3D Room Pins
function renderBlueprintAndPins() {
  // Update Metrics UI
  hudProjectName.textContent = plan.projectName || 'Custom House Plan';
  hudSummaryPill.textContent = `${plan.widthFt}' × ${plan.depthFt}' • ${metrics.totalSqFt.toLocaleString()} sq ft`;
  metricSqFt.textContent = `${metrics.totalSqFt.toLocaleString()} sq ft`;
  metricShotok.textContent = metrics.shotok;
  metricKatha.textContent = metrics.katha;

  // Disable 1st-floor buttons if 1-story
  const isSingle = plan.floors === 1;
  btnViewFirst.disabled = isSingle;
  bpFirstBtn.disabled = isSingle;
  if (isSingle && bpFloor === 'first') {
    bpFloor = 'ground';
  }

  document.querySelectorAll('[data-bp-floor]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.bpFloor === bpFloor);
  });

  // Render 2D Blueprint Boxes
  blueprintCanvas.innerHTML = '';
  metrics.rooms
    .filter((r) => r.floor === bpFloor)
    .forEach((room) => {
      const box = document.createElement('button');
      box.type = 'button';
      box.className = 'bp-room';
      if (room.id === activeRoomId) box.classList.add('is-active');
      box.style.setProperty('--room-color', room.accent);
      box.style.left = `${room.blueprint.x}%`;
      box.style.top = `${room.blueprint.y}%`;
      box.style.width = `${room.blueprint.w}%`;
      box.style.height = `${room.blueprint.h}%`;
      box.innerHTML = `
        <span class="bp-room-name">${room.shortName}</span>
        <span class="bp-room-dims">${room.dimsFt}</span>
      `;
      box.addEventListener('click', () => selectRoom(room.id));
      blueprintCanvas.appendChild(box);
    });

  // Rebuild 3D Room Pins
  hotspotsLayer.innerHTML = '';
  roomPins.clear();
  metrics.rooms.forEach((room, idx) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'hotspot-pin';
    if (room.id === activeRoomId) pin.classList.add('is-active');
    pin.style.setProperty('--pin-color', room.accent);
    pin.innerHTML = `
      <span class="pin-dot">${idx + 1}</span>
      <span class="pin-label">${room.shortName}</span>
    `;
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectRoom(room.id);
    });
    hotspotsLayer.appendChild(pin);
    roomPins.set(room.id, {
      el: pin,
      room,
      anchor: new THREE.Vector3(...room.localAnchor),
    });
  });
}

function showRoomDetails(room) {
  detailFloorTag.textContent = room.floor === 'ground' ? 'Ground Floor Plan' : '1st Floor Plan';
  detailFloorTag.style.color = room.accent;
  detailTitle.textContent = room.label;
  detailDims.textContent = room.dimsFt;
  detailDims.style.color = room.accent;
  detailArea.textContent = `${room.areaSqFt} sq ft`;
  detailDesc.textContent = room.description;
  detailFeatures.innerHTML = room.features
    .map((feat) => `<div class="spec-box">${feat}</div>`)
    .join('');

  detailCard.classList.add('is-open');
  detailCard.setAttribute('aria-hidden', 'false');
  animate(
    detailCard,
    { opacity: [0, 1], x: [20, 0], scale: [0.97, 1] },
    { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
  );
}

function hideRoomDetails() {
  detailCard.classList.remove('is-open');
  detailCard.setAttribute('aria-hidden', 'true');
  animate(detailCard, { opacity: 0, x: 20 }, { duration: 0.22 });
}

function selectRoom(roomId) {
  const room = metrics.rooms.find((r) => r.id === roomId);
  if (!room) return;

  activeRoomId = roomId;
  controls.autoRotate = false;
  btnAutoRotate.classList.remove('is-active');

  // Switch 2D blueprint tab floor & 3D cutaway automatically so the room interior is visible!
  bpFloor = room.floor;
  if (room.floor === 'ground' && (viewMode === 'full' || viewMode === 'first')) {
    applyViewMode('ground', false);
  } else if (room.floor === 'first' && viewMode === 'full') {
    applyViewMode('first', false);
  }

  renderBlueprintAndPins();

  const tierGroup = room.floor === 'ground' ? house.groundGroup : house.firstFloorGroup;
  const yOff = tierGroup.position.y;

  flyCameraTo(
    [room.cameraOffset[0], room.cameraOffset[1] + yOff, room.cameraOffset[2]],
    [room.localAnchor[0], room.localAnchor[1] + yOff, room.localAnchor[2]]
  );
  showRoomDetails(room);
}

function resetView() {
  activeRoomId = null;
  hideRoomDetails();
  renderBlueprintAndPins();
  applyViewMode('full', true);
}

function rebuildFromPlan() {
  metrics = computeHouseMetrics(plan);
  house.rebuild(plan);
  if (activeRoomId && !metrics.rooms.some((r) => r.id === activeRoomId)) {
    activeRoomId = null;
    hideRoomDetails();
  }
  renderBlueprintAndPins();
  applyViewMode(viewMode, false);
}

// Build Paint Swatches UI
function renderSwatches() {
  swatchRow.innerHTML = '';
  WALL_SWATCHES.forEach((sw) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-btn';
    if (plan.wallColor === sw.hex) btn.classList.add('is-active');
    btn.style.background = sw.hex;
    btn.title = sw.name;
    btn.addEventListener('click', () => {
      plan.wallColor = sw.hex;
      renderSwatches();
      rebuildFromPlan();
    });
    swatchRow.appendChild(btn);
  });
}

// UI Event Wiring
document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeRoomId = null;
    hideRoomDetails();
    renderBlueprintAndPins();
    applyViewMode(btn.dataset.view, true);
  });
});

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('is-active', pane.id === `tab-${target}`);
    });
  });
});

document.querySelectorAll('[data-bp-floor]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    bpFloor = btn.dataset.bpFloor;
    renderBlueprintAndPins();
  });
});

btnTogglePanel.addEventListener('click', () => {
  const collapsed = studioPanel.classList.toggle('is-collapsed');
  btnTogglePanel.textContent = collapsed ? '+' : '−';
});

inpName.addEventListener('input', (e) => {
  plan.projectName = e.target.value;
  hudProjectName.textContent = plan.projectName || 'Custom House Plan';
});

inpWidth.addEventListener('input', (e) => {
  plan.widthFt = Number(e.target.value);
  valWidth.textContent = `${plan.widthFt} ft`;
  rebuildFromPlan();
});

inpDepth.addEventListener('input', (e) => {
  plan.depthFt = Number(e.target.value);
  valDepth.textContent = `${plan.depthFt} ft`;
  rebuildFromPlan();
});

document.querySelectorAll('[data-floors]').forEach((btn) => {
  btn.addEventListener('click', () => {
    plan.floors = Number(btn.dataset.floors);
    document.querySelectorAll('[data-floors]').forEach((b) => b.classList.toggle('is-active', b === btn));
    rebuildFromPlan();
  });
});

document.querySelectorAll('[data-roof]').forEach((btn) => {
  btn.addEventListener('click', () => {
    plan.roofStyle = btn.dataset.roof;
    document.querySelectorAll('[data-roof]').forEach((b) => b.classList.toggle('is-active', b === btn));
    rebuildFromPlan();
  });
});

inpFurniture.addEventListener('change', (e) => {
  plan.showFurniture = e.target.checked;
  rebuildFromPlan();
});

btnResetPlan.addEventListener('click', () => {
  plan = { ...DEFAULT_PLAN };
  inpName.value = plan.projectName;
  inpWidth.value = plan.widthFt;
  inpDepth.value = plan.depthFt;
  valWidth.textContent = `${plan.widthFt} ft`;
  valDepth.textContent = `${plan.depthFt} ft`;
  inpFurniture.checked = plan.showFurniture;
  document.querySelectorAll('[data-floors]').forEach((b) =>
    b.classList.toggle('is-active', Number(b.dataset.floors) === plan.floors)
  );
  document.querySelectorAll('[data-roof]').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.roof === plan.roofStyle)
  );
  renderSwatches();
  rebuildFromPlan();
});

btnAssemble.addEventListener('click', () => {
  activeRoomId = null;
  hideRoomDetails();
  flyCameraTo(DEFAULT_CAMERA.position, DEFAULT_CAMERA.target);
  playBuildAnimation();
});

btnTime.addEventListener('click', () => {
  lightingMode = lightingMode === 'day' ? 'evening' : 'day';
  document.body.setAttribute('data-theme', lightingMode);
  house.setLightingMode(lightingMode);
  timeIcon.textContent = lightingMode === 'day' ? '☀️' : '🌆';
  timeLabel.textContent = lightingMode === 'day' ? 'Daylight' : 'Evening';
});

btnAutoRotate.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  btnAutoRotate.classList.toggle('is-active', controls.autoRotate);
});

btnReset.addEventListener('click', resetView);
btnCloseDetail.addEventListener('click', () => {
  activeRoomId = null;
  hideRoomDetails();
  renderBlueprintAndPins();
});

btnPrevRoom.addEventListener('click', () => {
  const idx = metrics.rooms.findIndex((r) => r.id === activeRoomId);
  const prev = idx <= 0 ? metrics.rooms.length - 1 : idx - 1;
  selectRoom(metrics.rooms[prev].id);
});

btnNextRoom.addEventListener('click', () => {
  const idx = metrics.rooms.findIndex((r) => r.id === activeRoomId);
  const next = (idx + 1) % metrics.rooms.length;
  selectRoom(metrics.rooms[next].id);
});

// Raycaster 3D Room Selection
function updatePointerCoords(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickRoom(event) {
  updatePointerCoords(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(house.getInteractiveObjects(), true);
  for (const hit of hits) {
    if (!hit.object.visible) continue;
    // Skip invisible hidden floor objects
    let obj = hit.object;
    let visibleChain = true;
    while (obj) {
      if (!obj.visible) {
        visibleChain = false;
        break;
      }
      obj = obj.parent;
    }
    if (!visibleChain) continue;
    if (hit.object.userData?.roomId) {
      return hit.object.userData.roomId;
    }
  }
  return null;
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointermove', (e) => {
  const hitId = pickRoom(e);
  if (hitId !== hoveredRoomId) {
    hoveredRoomId = hitId;
    if (hoveredRoomId) {
      const room = metrics.rooms.find((r) => r.id === hoveredRoomId);
      if (room) {
        tooltipLabel.textContent = `${room.label} (${room.dimsFt})`;
        hoverTooltip.querySelector('.tooltip-dot').style.background = room.accent;
        canvasWrap.classList.add('is-hovering');
        animate(hoverTooltip, { opacity: 1, scale: 1 }, { duration: 0.16 });
      }
    } else {
      canvasWrap.classList.remove('is-hovering');
      animate(hoverTooltip, { opacity: 0, scale: 0.94 }, { duration: 0.14 });
    }
  }
  if (hoveredRoomId) {
    hoverTooltip.style.left = `${e.clientX}px`;
    hoverTooltip.style.top = `${e.clientY}px`;
  }
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
  const hitId = pickRoom(e);
  if (hitId) selectRoom(hitId);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeRoomId) resetView();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Project 3D Room Pins accurately onto Screen
const projectedVec = new THREE.Vector3();
function updateRoomPins() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  roomPins.forEach(({ el, room, anchor }) => {
    const showForMode =
      viewMode === 'explode' ||
      (room.floor === 'ground' && (viewMode === 'ground' || viewMode === 'full')) ||
      (room.floor === 'first' && (viewMode === 'first' || viewMode === 'full'));

    if (!showForMode) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const tierGroup = room.floor === 'ground' ? house.groundGroup : house.firstFloorGroup;
    projectedVec.set(anchor.x, anchor.y + tierGroup.position.y, anchor.z).project(camera);

    if (projectedVec.z > 1) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    el.style.left = `${(projectedVec.x * 0.5 + 0.5) * width}px`;
    el.style.top = `${(-projectedVec.y * 0.5 + 0.5) * height}px`;
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  });
}

// Initialize App
renderSwatches();
house.rebuild(plan);
renderBlueprintAndPins();
playBuildAnimation();

frame.render(() => {
  controls.update();
  updateRoomPins();
  renderer.render(scene, camera);
}, true);
