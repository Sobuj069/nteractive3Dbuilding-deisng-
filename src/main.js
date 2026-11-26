import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate, frame } from 'motion';
import { threeEffect } from 'motion/three';
import {
  AGGREGATE_OPTIONS,
  CEMENT_OPTIONS,
  DEFAULT_CUSTOM_RATES,
  FINISH_TIERS,
  FOUNDATION_TYPES,
  MASONRY_OPTIONS,
  REBAR_OPTIONS,
  SOIL_TYPES,
} from './data/ingredients.js';
import { EXTERIOR_DESIGNS, FLOOR_DESIGNS } from './data/designsLibrary.js';
import { PLAN_CATEGORIES, PLANS_LIBRARY } from './data/plansLibrary.js';
import {
  calculateBOQ,
  estimatePlanCost,
  formatBDTExact,
  formatBDTShort,
} from './engine/costEngine.js';
import { FLOOR_HEIGHT, FT_TO_UNIT, createHouseModel } from './scene/createHouseModel.js';

// Enable Motion's Three.js integration
animate.addEffect(threeEffect);

const DEFAULT_CAMERA = { position: [14.5, 10.6, 15.8], target: [0, 2.2, 0] };

// DOM References
const canvasWrap = document.getElementById('canvas-wrap');
const hotspotsLayer = document.getElementById('hotspots-layer');
const hoverTooltip = document.getElementById('hover-tooltip');
const tooltipLabel = document.getElementById('tooltip-label');

const hudPlanTitle = document.getElementById('hud-plan-title');
const hudCostPill = document.getElementById('hud-cost-pill');
const hudBudgetBadge = document.getElementById('hud-budget-badge');
const btnViewTop = document.getElementById('btn-view-top');

const studioPanel = document.getElementById('studio-panel');
const btnTogglePanel = document.getElementById('btn-toggle-panel');

// Budget & Ingredients Controls
const budgetDisplay = document.getElementById('budget-display');
const inpBudget = document.getElementById('inp-budget');
const valBudget = document.getElementById('val-budget');
const btnAutoFit = document.getElementById('btn-auto-fit');
const inpWidth = document.getElementById('inp-width');
const inpDepth = document.getElementById('inp-depth');
const valWidth = document.getElementById('val-width');
const valDepth = document.getElementById('val-depth');
const sumShotok = document.getElementById('sum-shotok');
const sumKatha = document.getElementById('sum-katha');
const sumSqFt = document.getElementById('sum-sqft');

const selMasonry = document.getElementById('sel-masonry');
const rateMasonry = document.getElementById('rate-masonry');
const selCement = document.getElementById('sel-cement');
const rateCement = document.getElementById('rate-cement');
const selRebar = document.getElementById('sel-rebar');
const rateRebar = document.getElementById('rate-rebar');
const selAggregate = document.getElementById('sel-aggregate');
const rateAggregate = document.getElementById('rate-aggregate');
const rateSand = document.getElementById('rate-sand');
const rateLabor = document.getElementById('rate-labor');
const grpFinish = document.getElementById('grp-finish');

// Foundation Controls
const selSoil = document.getElementById('sel-soil');
const foundationCards = document.getElementById('foundation-cards');
const fCols = document.getElementById('f-cols');
const fDepth = document.getElementById('f-depth');
const fCap = document.getElementById('f-cap');
const btnOpenXray = document.getElementById('btn-open-xray');

// Plans & 2D Blueprint Controls
const blueprintCanvas = document.getElementById('blueprint-canvas');
const bpUpperBtn = document.getElementById('bp-upper-btn');
const inpPlanSearch = document.getElementById('inp-plan-search');
const planCatChips = document.getElementById('plan-cat-chips');
const plansList = document.getElementById('plans-list');

// Designs Controls
const exteriorGrid = document.getElementById('exterior-grid');
const floorGrid = document.getElementById('floor-grid');
const inpCustomColor = document.getElementById('inp-custom-color');
const inpFurniture = document.getElementById('inp-furniture');

// BOQ & Print Controls
const boqTotalShort = document.getElementById('boq-total-short');
const boqTotalExact = document.getElementById('boq-total-exact');
const boqPerSqFt = document.getElementById('boq-per-sqft');
const boqBuiltArea = document.getElementById('boq-built-area');
const boqBudgetNote = document.getElementById('boq-budget-note');
const boqTbody = document.getElementById('boq-tbody');
const btnPrintBoq = document.getElementById('btn-print-boq');
const printSheet = document.getElementById('print-sheet');

// Top Scene Controls & Detail Card
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
const btnCloseDetail = document.getElementById('btn-close-detail');

// ==================== THREE.JS SCENE ====================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
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
controls.maxDistance = 36.0;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = Math.PI / 2 + 0.32; // Allows slight dip below ground during Foundation X-Ray!
controls.update();

const house = createHouseModel(scene);

// ==================== APPLICATION STATE ====================
const initialPlan = PLANS_LIBRARY.find((p) => p.id === 'pln-13') || PLANS_LIBRARY[0];

const state = {
  planId: initialPlan.id,
  exteriorId: initialPlan.defaultExteriorId,
  floorDesignId: initialPlan.defaultFloorDesignId,
  budgetLakh: 70,
  widthFt: initialPlan.widthFt,
  depthFt: initialPlan.depthFt,
  floors: initialPlan.floors,
  foundationFloors: initialPlan.foundationFloors,
  soilType: 'normal',
  foundationType: 'isolated',
  masonryId: 'brick_1st',
  cementId: 'opc_prem',
  rebarId: 'rod_500w',
  aggregateId: 'brick_khoa',
  finishTierId: 'standard',
  rates: { ...DEFAULT_CUSTOM_RATES },
  customRoofStyle: null,
  overrideWallPattern: null,
  customWallColor: null,
  showFurniture: true,
};

let viewMode = 'full'; // 'full' | 'top' | 'ground' | 'explode' | 'xray'
let bpFloor = 'ground'; // 'ground' | 'upper'
let planCategory = 'all';
let planSearch = '';
let lightingMode = 'day';
let activeRoom = null;
let hoveredRoom = null;
let viewToken = 0;

let cameraAnimations = [];
let tierAnimations = [];
let pointerDownPos = { x: 0, y: 0 };
const roomPins = new Map();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function getActivePlan() {
  return PLANS_LIBRARY.find((p) => p.id === state.planId) || PLANS_LIBRARY[0];
}
function getActiveExterior() {
  return EXTERIOR_DESIGNS.find((d) => d.id === state.exteriorId) || EXTERIOR_DESIGNS[0];
}
function getActiveFloorDesign() {
  return FLOOR_DESIGNS.find((d) => d.id === state.floorDesignId) || FLOOR_DESIGNS[0];
}

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

// ==================== 3D VIEW MODES & ANIMATIONS ====================
function applyViewMode(nextMode, moveCamera = true) {
  viewMode = nextMode;
  viewToken++;
  const token = viewToken;
  cancelTierMotion();

  if (state.floors === 1 && viewMode === 'top') {
    viewMode = 'ground';
  }

  document.querySelectorAll('[data-view]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.view === viewMode);
  });

  const floorGroups = house.getFloorGroups();
  const roofGroup = house.roofGroup;
  const ease = [0.22, 1, 0.36, 1];
  const dur = 0.6;

  house.setXRayGround(viewMode === 'xray');

  if (viewMode === 'full' || viewMode === 'xray') {
    floorGroups.forEach((fg) => {
      fg.visible = true;
      tierAnimations.push(animate(fg, { y: 0 }, { duration: dur, ease }));
    });
    roofGroup.visible = true;
    tierAnimations.push(animate(roofGroup, { y: 0 }, { duration: dur, ease }));

    if (moveCamera) {
      if (viewMode === 'xray') {
        flyCameraTo([12.5, 2.2, 14.5], [0, -1.2, 0]);
      } else {
        const yFocus = 1.5 + state.floors * 0.9;
        flyCameraTo([14.5 + state.floors * 0.8, 9.5 + state.floors * 1.4, 15.8 + state.floors * 0.8], [0, yFocus, 0]);
      }
    }
  } else if (viewMode === 'ground') {
    floorGroups.forEach((fg, idx) => {
      if (idx === 0) {
        fg.visible = true;
        tierAnimations.push(animate(fg, { y: 0 }, { duration: dur, ease }));
      } else {
        const a = animate(fg, { y: 8 + idx * 2 }, { duration: 0.45, ease });
        a.then(() => {
          if (token === viewToken && viewMode === 'ground') fg.visible = false;
        });
        tierAnimations.push(a);
      }
    });
    const rAnim = animate(roofGroup, { y: 12 }, { duration: 0.45, ease });
    rAnim.then(() => {
      if (token === viewToken && viewMode === 'ground') roofGroup.visible = false;
    });
    tierAnimations.push(rAnim);
    if (moveCamera) flyCameraTo([0.5, 12.2, 10.2], [0, 0.4, 0]);
  } else if (viewMode === 'top') {
    floorGroups.forEach((fg) => {
      fg.visible = true;
      tierAnimations.push(animate(fg, { y: 0 }, { duration: dur, ease }));
    });
    const rAnim = animate(roofGroup, { y: 9.5 }, { duration: 0.45, ease });
    rAnim.then(() => {
      if (token === viewToken && viewMode === 'top') roofGroup.visible = false;
    });
    tierAnimations.push(rAnim);
    const topY = (state.floors - 1) * FLOOR_HEIGHT;
    if (moveCamera) flyCameraTo([0.6, topY + 10.5, 10.5], [0, topY + 0.5, 0]);
  } else if (viewMode === 'explode') {
    floorGroups.forEach((fg, idx) => {
      fg.visible = true;
      tierAnimations.push(animate(fg, { y: idx * 2.1 }, { duration: dur, ease }));
    });
    roofGroup.visible = true;
    tierAnimations.push(animate(roofGroup, { y: floorGroups.length * 2.1 + 0.4 }, { duration: dur, ease }));
    if (moveCamera) flyCameraTo([16.5, 12 + state.floors * 2.2, 18.0], [0, state.floors * 2.2, 0]);
  }
}

function playBuildAnimation() {
  viewToken++;
  cancelTierMotion();
  viewMode = 'full';
  house.setXRayGround(false);
  document.querySelectorAll('[data-view]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.view === 'full');
  });

  const ease = [0.22, 1, 0.36, 1];
  const floorGroups = house.getFloorGroups();
  floorGroups.forEach((fg, idx) => {
    fg.visible = true;
    fg.position.y = 7.5 + idx * 3.0;
    tierAnimations.push(animate(fg, { y: 0 }, { duration: 0.8, delay: idx * 0.16, ease }));
  });
  house.roofGroup.visible = true;
  house.roofGroup.position.y = 10 + floorGroups.length * 3.0;
  tierAnimations.push(
    animate(house.roofGroup, { y: 0 }, { duration: 0.85, delay: floorGroups.length * 0.16 + 0.08, ease })
  );
}

// ==================== UI RENDERERS ====================
function updateBOQAndHUD() {
  const boq = calculateBOQ(state);
  const plan = getActivePlan();

  hudPlanTitle.textContent = `${plan.nameBn} (${state.widthFt}×${state.depthFt} ft)`;
  hudCostPill.textContent = formatBDTShort(boq.totalCost);
  hudBudgetBadge.textContent = boq.withinBudget
    ? `✓ বাজেটের ভেতর (${formatBDTShort(boq.diffBDT)} সাশ্রয়)`
    : `! বাজেট ${formatBDTShort(Math.abs(boq.diffBDT))} বেশি`;
  hudBudgetBadge.className = `status-pill ${boq.withinBudget ? 'is-ok' : 'is-over'}`;

  budgetDisplay.textContent = formatBDTShort(boq.budgetBDT);
  valBudget.textContent = `৳ ${state.budgetLakh} লাখ`;
  valWidth.textContent = `${state.widthFt} ft`;
  valDepth.textContent = `${state.depthFt} ft`;
  sumShotok.textContent = `${boq.plotShotok} শতক`;
  sumKatha.textContent = `${boq.plotKatha} কাঠা`;
  sumSqFt.textContent = `${boq.totalSqFt.toLocaleString('en-IN')} sq ft`;

  fCols.textContent = `${boq.colGrid.totalColumns} Columns`;
  fDepth.textContent = `${boq.foundationDepthFt} ft`;
  fCap.textContent = `${state.foundationFloors}-Story Base`;

  boqTotalShort.textContent = formatBDTShort(boq.totalCost);
  boqTotalExact.textContent = formatBDTExact(boq.totalCost);
  boqPerSqFt.textContent = `৳ ${boq.costPerSqFt.toLocaleString('en-IN')}`;
  boqBuiltArea.textContent = `${boq.totalSqFt.toLocaleString('en-IN')} sq ft (${state.floors} তলা)`;

  boqBudgetNote.className = `boq-status-box ${boq.withinBudget ? 'is-ok' : 'is-over'}`;
  boqBudgetNote.textContent = boq.withinBudget
    ? `✓ আপনার ৳ ${state.budgetLakh} লাখ বাজেটের ভেতর এই বাড়িটি তৈরি সম্ভব (আনুমানিক সাশ্রয় ${formatBDTShort(boq.diffBDT)})।`
    : `⚠️ বর্তমান বাজেট ৳ ${state.budgetLakh} লাখ—এই ডিজাইন করতে আরও প্রায় ${formatBDTShort(Math.abs(boq.diffBDT))} লাগবে। “বাজেট অনুযায়ী প্ল্যান সাজাও” ক্লিক করে ম্যাচিং প্ল্যান দেখতে পারেন।`;

  boqTbody.innerHTML = boq.items
    .map(
      (item) => `
      <tr>
        <td>${item.label}</td>
        <td>${item.qty}</td>
        <td>${formatBDTExact(item.cost)}</td>
      </tr>
    `
    )
    .join('');

  // Update printable report HTML
  const ext = getActiveExterior();
  const flr = getActiveFloorDesign();
  printSheet.innerHTML = `
    <h1>বাড়ি প্ল্যান 3D স্টুডিও — প্রাক্কলিত নির্মাণ বাজেট (BOQ Estimate)</h1>
    <p><strong>প্ল্যান:</strong> ${plan.nameBn} (${plan.nameEn}) &nbsp;|&nbsp; <strong>এক্সটেরিয়র:</strong> ${ext.nameBn} &nbsp;|&nbsp; <strong>ফ্লোর:</strong> ${flr.nameBn}</p>
    <div class="print-meta">
      <div><strong>জমির মাপ:</strong> ${state.widthFt}' × ${state.depthFt}' (${boq.plotShotok} শতক)</div>
      <div><strong>তলা ও ফাউন্ডেশন:</strong> ${state.floors} তলা (${state.foundationFloors} তলা ${state.foundationType.toUpperCase()} বেস)</div>
      <div><strong>মোট বিল্ড-আপ এরিয়া:</strong> ${boq.totalSqFt.toLocaleString('en-IN')} sq ft</div>
      <div><strong>কলাম সংখ্যা:</strong> ${boq.colGrid.totalColumns} টি (${boq.foundationDepthFt} ft গভীরতা)</div>
      <div><strong>প্রতি Sq Ft খরচ:</strong> ৳ ${boq.costPerSqFt.toLocaleString('en-IN')}</div>
      <div><strong>মোট আনুমানিক খরচ:</strong> ${formatBDTExact(boq.totalCost)} (${formatBDTShort(boq.totalCost)})</div>
    </div>
    <table class="print-table">
      <thead>
        <tr>
          <th>নির্মাণ সামগ্রী / খাত (Item)</th>
          <th>পরিমাণ (Quantity)</th>
          <th>একক দর (Rate)</th>
          <th>মোট টাকা (BDT)</th>
        </tr>
      </thead>
      <tbody>
        ${boq.items
          .map(
            (i) =>
              `<tr><td>${i.label}</td><td>${i.qty}</td><td>${i.rate}</td><td>${formatBDTExact(i.cost)}</td></tr>`
          )
          .join('')}
        <tr>
          <td colspan="3"><strong>সর্বমোট আনুমানিক খরচ (Grand Total)</strong></td>
          <td><strong>${formatBDTExact(boq.totalCost)}</strong></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top:16px;font-size:12px;color:#475569;">* নোট: বাজারদর ও মাটির সয়েল টেস্ট অনুযায়ী প্রকৃত খরচ কম-বেশি হতে পারে। চূড়ান্ত নির্মাণের আগে রেজিস্টার্ড সিভিল ইঞ্জিনিয়ারের পরামর্শ নিন।</p>
  `;

  btnViewTop.disabled = state.floors === 1;
  bpUpperBtn.disabled = state.floors === 1;
  if (state.floors === 1 && bpFloor === 'upper') bpFloor = 'ground';

  // Enforce foundationFloors >= floors buttons
  document.querySelectorAll('[data-ff]').forEach((btn) => {
    const val = Number(btn.dataset.ff);
    btn.disabled = val < state.floors;
    btn.classList.toggle('is-active', val === state.foundationFloors);
  });
  document.querySelectorAll('[data-floors]').forEach((btn) => {
    btn.classList.toggle('is-active', Number(btn.dataset.floors) === state.floors);
  });
}

function renderBlueprintAndPins() {
  const plan = getActivePlan();
  const W = state.widthFt * FT_TO_UNIT;
  const D = state.depthFt * FT_TO_UNIT;

  document.querySelectorAll('[data-bp-floor]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.bpFloor === bpFloor);
  });

  // 2D Blueprint
  blueprintCanvas.innerHTML = '';
  const list = bpFloor === 'ground' ? plan.rooms.ground : plan.rooms.upper;
  list.forEach((room) => {
    const rwFt = Math.round((room.w / 100) * state.widthFt);
    const rdFt = Math.round((room.h / 100) * state.depthFt);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bp-room';
    if (activeRoom?.id === room.id && activeRoom?.floor === bpFloor) btn.classList.add('is-active');
    btn.style.left = `${room.x}%`;
    btn.style.top = `${room.y}%`;
    btn.style.width = `${room.w}%`;
    btn.style.height = `${room.h}%`;
    btn.innerHTML = `
      <span class="bp-room-name">${room.nameBn}</span>
      <span class="bp-room-dims">${rwFt}'×${rdFt}'</span>
    `;
    btn.addEventListener('click', () => selectRoom(room, bpFloor === 'ground' ? 0 : state.floors - 1));
    blueprintCanvas.appendChild(btn);
  });

  // 3D Projected Pins
  hotspotsLayer.innerHTML = '';
  roomPins.clear();
  const pinFloors = state.floors === 1 ? [0] : [0, state.floors - 1];
  let pinIdx = 1;
  pinFloors.forEach((fIdx) => {
    const rooms = fIdx === 0 ? plan.rooms.ground : plan.rooms.upper;
    rooms.forEach((room) => {
      const rx = ((room.x + room.w / 2) / 100 - 0.5) * (W - 0.32);
      const rz = ((room.y + room.h / 2) / 100 - 0.5) * (D - 0.32);
      const ry = 0.9 + fIdx * FLOOR_HEIGHT;

      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'hotspot-pin';
      pin.style.setProperty('--pin-color', room.accent);
      pin.innerHTML = `<span class="pin-dot">${pinIdx++}</span><span class="pin-label">${room.nameBn}</span>`;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        selectRoom(room, fIdx);
      });
      hotspotsLayer.appendChild(pin);
      roomPins.set(`${fIdx}:${room.id}`, {
        el: pin,
        room,
        floorIndex: fIdx,
        anchor: new THREE.Vector3(rx, ry, rz),
      });
    });
  });
}

function renderPlansList() {
  const budgetBDT = state.budgetLakh * 100000;
  const query = planSearch.trim().toLowerCase();

  const filtered = PLANS_LIBRARY.filter((p) => {
    const est = estimatePlanCost(p, state);
    if (planCategory === 'budget' && est.totalCost > budgetBDT) return false;
    if (planCategory !== 'all' && planCategory !== 'budget' && p.category !== planCategory) return false;
    if (query) {
      const hay = `${p.nameBn} ${p.nameEn} ${p.widthFt}x${p.depthFt} ${p.bedrooms}bed`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  plansList.innerHTML = '';
  if (filtered.length === 0) {
    plansList.innerHTML = `<p style="font-size:12px;color:var(--text-muted);padding:10px;text-align:center;">এই ফিল্টারে কোনো প্ল্যান পাওয়া যায়নি—বাজেট বাড়িয়ে বা "সব (45)" সিলেক্ট করে দেখুন।</p>`;
    return;
  }

  filtered.forEach((p) => {
    const est = estimatePlanCost(p, state);
    const ok = est.totalCost <= budgetBDT;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `plan-card ${p.id === state.planId ? 'is-active' : ''}`;
    card.innerHTML = `
      <div class="plan-card-top">
        <strong>${p.nameBn}</strong>
        <span class="plan-cost ${ok ? 'is-ok' : 'is-over'}">${formatBDTShort(est.totalCost)}</span>
      </div>
      <div class="plan-meta">
        ${p.widthFt}'×${p.depthFt}' (${est.plotShotok} শতক) • ${p.floors} তলা (${p.foundationFloors}F বেস) • ${p.bedrooms} বেড • ${p.facing} মুখী
      </div>
    `;
    card.addEventListener('click', () => applyPlanTemplate(p));
    plansList.appendChild(card);
  });
}

function renderDesignGrids() {
  exteriorGrid.innerHTML = '';
  EXTERIOR_DESIGNS.forEach((d) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `design-card ${d.id === state.exteriorId ? 'is-active' : ''}`;
    card.innerHTML = `
      <span class="d-swatch" style="background:${d.wallColor};--sw-accent:${d.accentColor}"></span>
      <span class="d-text">
        <strong>${d.nameBn}</strong>
        <small>${d.category} • ${d.roofStyle}</small>
      </span>
    `;
    card.addEventListener('click', () => {
      state.exteriorId = d.id;
      state.customRoofStyle = null;
      state.overrideWallPattern = null;
      state.customWallColor = null;
      inpCustomColor.value = d.wallColor;
      syncCustomDesignButtons();
      renderDesignGrids();
      rebuildScene();
    });
    exteriorGrid.appendChild(card);
  });

  floorGrid.innerHTML = '';
  FLOOR_DESIGNS.forEach((d) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `design-card ${d.id === state.floorDesignId ? 'is-active' : ''}`;
    card.innerHTML = `
      <span class="d-swatch" style="background:${d.base};--sw-accent:${d.accent}"></span>
      <span class="d-text">
        <strong>${d.nameBn}</strong>
        <small>${d.pattern}</small>
      </span>
    `;
    card.addEventListener('click', () => {
      state.floorDesignId = d.id;
      renderDesignGrids();
      rebuildScene();
    });
    floorGrid.appendChild(card);
  });
}

function syncCustomDesignButtons() {
  const ext = getActiveExterior();
  const roof = state.customRoofStyle || ext.roofStyle;
  const wpat = state.overrideWallPattern || ext.wallPattern;
  document.querySelectorAll('[data-roof]').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.roof === roof)
  );
  document.querySelectorAll('[data-wpat]').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.wpat === wpat)
  );
}

function applyPlanTemplate(p) {
  state.planId = p.id;
  state.widthFt = p.widthFt;
  state.depthFt = p.depthFt;
  state.floors = p.floors;
  state.foundationFloors = Math.max(p.floors, p.foundationFloors);
  state.exteriorId = p.defaultExteriorId;
  state.floorDesignId = p.defaultFloorDesignId;
  state.customRoofStyle = null;
  state.overrideWallPattern = null;
  state.customWallColor = null;

  inpWidth.value = state.widthFt;
  inpDepth.value = state.depthFt;
  inpCustomColor.value = getActiveExterior().wallColor;
  activeRoom = null;
  hideDetailCard();

  syncCustomDesignButtons();
  renderDesignGrids();
  rebuildScene();
  playBuildAnimation();
}

function selectRoom(room, floorIndex) {
  activeRoom = { id: room.id, floor: floorIndex === 0 ? 'ground' : 'upper' };
  controls.autoRotate = false;
  btnAutoRotate.classList.remove('is-active');

  bpFloor = activeRoom.floor;
  if (floorIndex === 0 && (viewMode === 'full' || viewMode === 'top' || viewMode === 'xray')) {
    applyViewMode('ground', false);
  } else if (floorIndex > 0 && (viewMode === 'full' || viewMode === 'xray')) {
    applyViewMode('top', false);
  }

  renderBlueprintAndPins();

  const W = state.widthFt * FT_TO_UNIT;
  const D = state.depthFt * FT_TO_UNIT;
  const rx = ((room.x + room.w / 2) / 100 - 0.5) * (W - 0.32);
  const rz = ((room.y + room.h / 2) / 100 - 0.5) * (D - 0.32);
  const fg = house.getFloorGroups()[floorIndex];
  const baseY = 0.8 + floorIndex * FLOOR_HEIGHT + (fg ? fg.position.y : 0);

  flyCameraTo([rx + 4.2, baseY + 6.2, rz + 5.8], [rx, baseY, rz]);

  const rwFt = Math.round((room.w / 100) * state.widthFt);
  const rdFt = Math.round((room.h / 100) * state.depthFt);
  detailFloorTag.textContent = floorIndex === 0 ? 'নিচতলা (Ground Floor)' : `তলা ${floorIndex + 1} (Upper Floor)`;
  detailTitle.textContent = `${room.nameBn} (${room.nameEn})`;
  detailDims.textContent = `${rwFt}' × ${rdFt}'`;
  detailArea.textContent = `প্রায় ${rwFt * rdFt} sq ft`;
  detailDesc.textContent = `প্লটের মাপ (${state.widthFt}' × ${state.depthFt}') অনুযায়ী স্বয়ংক্রিয়ভাবে রুমটির প্রপোরশনাল সাইজ ও ৩D ফার্নিচার সাজানো হয়েছে।`;

  detailCard.classList.add('is-open');
  detailCard.setAttribute('aria-hidden', 'false');
  animate(detailCard, { opacity: [0, 1], x: [20, 0] }, { duration: 0.28 });
}

function hideDetailCard() {
  detailCard.classList.remove('is-open');
  detailCard.setAttribute('aria-hidden', 'true');
  animate(detailCard, { opacity: 0, x: 20 }, { duration: 0.2 });
}

function rebuildScene() {
  house.rebuild({
    config: state,
    planTemplate: getActivePlan(),
    exteriorDesign: getActiveExterior(),
    floorDesign: getActiveFloorDesign(),
  });
  updateBOQAndHUD();
  renderBlueprintAndPins();
  renderPlansList();
  applyViewMode(viewMode, false);
}

// ==================== POPULATE STATIC SELECTORS ====================
function initControls() {
  MASONRY_OPTIONS.forEach((m) => selMasonry.add(new Option(m.nameBn, m.id)));
  CEMENT_OPTIONS.forEach((c) => selCement.add(new Option(c.nameBn, c.id)));
  REBAR_OPTIONS.forEach((r) => selRebar.add(new Option(r.nameBn, r.id)));
  AGGREGATE_OPTIONS.forEach((a) => selAggregate.add(new Option(a.nameBn, a.id)));
  SOIL_TYPES.forEach((s) => selSoil.add(new Option(s.nameBn, s.id)));

  selMasonry.value = state.masonryId;
  rateMasonry.value = state.rates.masonryPrice;
  selCement.value = state.cementId;
  rateCement.value = state.rates.cementPrice;
  selRebar.value = state.rebarId;
  rateRebar.value = state.rates.rebarPrice;
  selAggregate.value = state.aggregateId;
  rateAggregate.value = state.rates.aggregatePrice;
  rateSand.value = state.rates.sandCft;
  rateLabor.value = state.rates.laborPerSqFt;

  // Finish Tier buttons
  FINISH_TIERS.forEach((ft) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `choice-btn ${ft.id === state.finishTierId ? 'is-active' : ''}`;
    btn.textContent = ft.nameBn.split(' ')[0];
    btn.addEventListener('click', () => {
      state.finishTierId = ft.id;
      state.rates.laborPerSqFt = ft.laborPerSqFt;
      rateLabor.value = ft.laborPerSqFt;
      grpFinish.querySelectorAll('.choice-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      updateBOQAndHUD();
      renderPlansList();
    });
    grpFinish.appendChild(btn);
  });

  // Foundation Type cards
  function renderFoundationCards() {
    foundationCards.innerHTML = '';
    FOUNDATION_TYPES.forEach((ft) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `f-card ${ft.id === state.foundationType ? 'is-active' : ''}`;
      card.innerHTML = `<strong>${ft.nameBn}</strong><small>${ft.soilMatch} • গভীরতা ~${ft.depthFt} ft</small>`;
      card.addEventListener('click', () => {
        state.foundationType = ft.id;
        renderFoundationCards();
        rebuildScene();
      });
      foundationCards.appendChild(card);
    });
  }
  renderFoundationCards();

  // Plan category chips
  PLAN_CATEGORIES.forEach((cat) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip-btn ${cat.id === planCategory ? 'is-active' : ''}`;
    chip.textContent = cat.labelBn;
    chip.addEventListener('click', () => {
      planCategory = cat.id;
      planCatChips.querySelectorAll('.chip-btn').forEach((c) => c.classList.toggle('is-active', c === chip));
      renderPlansList();
    });
    planCatChips.appendChild(chip);
  });

  // Soil selector auto-recommends foundation type
  selSoil.addEventListener('change', () => {
    state.soilType = selSoil.value;
    const soil = SOIL_TYPES.find((s) => s.id === state.soilType);
    if (soil) {
      state.foundationType = soil.recommendedFoundation;
      renderFoundationCards();
      rebuildScene();
    }
  });
}

// ==================== EVENT LISTENERS ====================
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.tab-pane').forEach((p) => p.classList.toggle('is-active', p.id === `tab-${t}`));
  });
});

btnTogglePanel.addEventListener('click', () => {
  const c = studioPanel.classList.toggle('is-collapsed');
  btnTogglePanel.textContent = c ? '+' : '−';
});

document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeRoom = null;
    hideDetailCard();
    applyViewMode(btn.dataset.view, true);
  });
});

btnOpenXray.addEventListener('click', () => applyViewMode('xray', true));

inpBudget.addEventListener('input', (e) => {
  state.budgetLakh = Number(e.target.value);
  updateBOQAndHUD();
  renderPlansList();
});

btnAutoFit.addEventListener('click', () => {
  const budgetBDT = state.budgetLakh * 100000;
  // Find best plan closest to (and <=) user's budget
  let best = PLANS_LIBRARY[0];
  let bestCost = -1;
  PLANS_LIBRARY.forEach((p) => {
    const est = estimatePlanCost(p, state);
    if (est.totalCost <= budgetBDT && est.totalCost > bestCost) {
      bestCost = est.totalCost;
      best = p;
    }
  });
  if (bestCost === -1) {
    // Pick lowest-cost plan overall
    best = [...PLANS_LIBRARY].sort(
      (a, b) => estimatePlanCost(a, state).totalCost - estimatePlanCost(b, state).totalCost
    )[0];
  }
  applyPlanTemplate(best);
});

inpWidth.addEventListener('input', (e) => {
  state.widthFt = Number(e.target.value);
  rebuildScene();
});
inpDepth.addEventListener('input', (e) => {
  state.depthFt = Number(e.target.value);
  rebuildScene();
});

selMasonry.addEventListener('change', () => {
  state.masonryId = selMasonry.value;
  const m = MASONRY_OPTIONS.find((x) => x.id === state.masonryId);
  if (m) {
    state.rates.masonryPrice = m.defaultPrice;
    rateMasonry.value = m.defaultPrice;
    state.overrideWallPattern = m.wallTexture;
    syncCustomDesignButtons();
  }
  rebuildScene();
});
rateMasonry.addEventListener('input', () => {
  state.rates.masonryPrice = Number(rateMasonry.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});

selCement.addEventListener('change', () => {
  state.cementId = selCement.value;
  const c = CEMENT_OPTIONS.find((x) => x.id === state.cementId);
  if (c) {
    state.rates.cementPrice = c.defaultPrice;
    rateCement.value = c.defaultPrice;
  }
  updateBOQAndHUD();
  renderPlansList();
});
rateCement.addEventListener('input', () => {
  state.rates.cementPrice = Number(rateCement.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});

selRebar.addEventListener('change', () => {
  state.rebarId = selRebar.value;
  const r = REBAR_OPTIONS.find((x) => x.id === state.rebarId);
  if (r) {
    state.rates.rebarPrice = r.defaultPrice;
    rateRebar.value = r.defaultPrice;
  }
  updateBOQAndHUD();
  renderPlansList();
});
rateRebar.addEventListener('input', () => {
  state.rates.rebarPrice = Number(rateRebar.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});

selAggregate.addEventListener('change', () => {
  state.aggregateId = selAggregate.value;
  const a = AGGREGATE_OPTIONS.find((x) => x.id === state.aggregateId);
  if (a) {
    state.rates.aggregatePrice = a.defaultPrice;
    rateAggregate.value = a.defaultPrice;
  }
  updateBOQAndHUD();
  renderPlansList();
});
rateAggregate.addEventListener('input', () => {
  state.rates.aggregatePrice = Number(rateAggregate.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});

rateSand.addEventListener('input', () => {
  state.rates.sandCft = Number(rateSand.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});
rateLabor.addEventListener('input', () => {
  state.rates.laborPerSqFt = Number(rateLabor.value) || 0;
  updateBOQAndHUD();
  renderPlansList();
});

document.querySelectorAll('[data-floors]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.floors = Number(btn.dataset.floors);
    if (state.foundationFloors < state.floors) state.foundationFloors = state.floors;
    rebuildScene();
  });
});

document.querySelectorAll('[data-ff]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.foundationFloors = Number(btn.dataset.ff);
    rebuildScene();
  });
});

document.querySelectorAll('[data-bp-floor]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    bpFloor = btn.dataset.bpFloor;
    renderBlueprintAndPins();
  });
});

inpPlanSearch.addEventListener('input', (e) => {
  planSearch = e.target.value;
  renderPlansList();
});

document.querySelectorAll('[data-dtab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isExt = btn.dataset.dtab === 'exterior';
    document.querySelectorAll('[data-dtab]').forEach((b) => b.classList.toggle('is-active', b === btn));
    exteriorGrid.style.display = isExt ? 'grid' : 'none';
    floorGrid.style.display = isExt ? 'none' : 'grid';
  });
});

document.querySelectorAll('[data-roof]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.customRoofStyle = btn.dataset.roof;
    syncCustomDesignButtons();
    rebuildScene();
  });
});

document.querySelectorAll('[data-wpat]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.overrideWallPattern = btn.dataset.wpat;
    syncCustomDesignButtons();
    rebuildScene();
  });
});

inpCustomColor.addEventListener('input', (e) => {
  state.customWallColor = e.target.value;
  rebuildScene();
});

inpFurniture.addEventListener('change', (e) => {
  state.showFurniture = e.target.checked;
  rebuildScene();
});

btnPrintBoq.addEventListener('click', () => window.print());
btnAssemble.addEventListener('click', playBuildAnimation);

btnTime.addEventListener('click', () => {
  lightingMode = lightingMode === 'day' ? 'evening' : 'day';
  document.body.setAttribute('data-theme', lightingMode);
  house.setLightingMode(lightingMode);
  timeIcon.textContent = lightingMode === 'day' ? '☀️' : '🌆';
  timeLabel.textContent = lightingMode === 'day' ? 'দিন' : 'সন্ধ্যা';
});

btnAutoRotate.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  btnAutoRotate.classList.toggle('is-active', controls.autoRotate);
});

btnReset.addEventListener('click', () => {
  activeRoom = null;
  hideDetailCard();
  applyViewMode('full', true);
});
btnCloseDetail.addEventListener('click', hideDetailCard);

// Raycaster 3D Room Selection
function pickRoomHit(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(house.getInteractiveMeshes(), false);
  for (const hit of hits) {
    let visible = true;
    let obj = hit.object;
    while (obj) {
      if (!obj.visible) {
        visible = false;
        break;
      }
      obj = obj.parent;
    }
    if (!visible) continue;
    if (hit.object.userData?.roomId) {
      return {
        roomId: hit.object.userData.roomId,
        floorIndex: hit.object.userData.floorIndex,
      };
    }
  }
  return null;
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointermove', (e) => {
  const hit = pickRoomHit(e);
  const key = hit ? `${hit.floorIndex}:${hit.roomId}` : null;
  if (key !== hoveredRoom) {
    hoveredRoom = key;
    if (hit) {
      const plan = getActivePlan();
      const list = hit.floorIndex === 0 ? plan.rooms.ground : plan.rooms.upper;
      const room = list.find((r) => r.id === hit.roomId);
      if (room) {
        tooltipLabel.textContent = `${room.nameBn} (${room.nameEn})`;
        hoverTooltip.querySelector('.tooltip-dot').style.background = room.accent;
        canvasWrap.classList.add('is-hovering');
        animate(hoverTooltip, { opacity: 1, scale: 1 }, { duration: 0.15 });
      }
    } else {
      canvasWrap.classList.remove('is-hovering');
      animate(hoverTooltip, { opacity: 0, scale: 0.94 }, { duration: 0.14 });
    }
  }
  if (hoveredRoom) {
    hoverTooltip.style.left = `${e.clientX}px`;
    hoverTooltip.style.top = `${e.clientY}px`;
  }
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
  const hit = pickRoomHit(e);
  if (hit) {
    const plan = getActivePlan();
    const list = hit.floorIndex === 0 ? plan.rooms.ground : plan.rooms.upper;
    const room = list.find((r) => r.id === hit.roomId);
    if (room) selectRoom(room, hit.floorIndex);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Project 3D Room Pins
const projVec = new THREE.Vector3();
function updatePins() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fGroups = house.getFloorGroups();

  roomPins.forEach(({ el, floorIndex, anchor }) => {
    const show =
      viewMode === 'explode' ||
      (viewMode === 'ground' && floorIndex === 0) ||
      (viewMode === 'top' && floorIndex === state.floors - 1);

    if (!show) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const fg = fGroups[floorIndex];
    projVec.set(anchor.x, anchor.y + (fg ? fg.position.y : 0), anchor.z).project(camera);
    if (projVec.z > 1) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }
    el.style.left = `${(projVec.x * 0.5 + 0.5) * w}px`;
    el.style.top = `${(-projVec.y * 0.5 + 0.5) * h}px`;
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  });
}

// Boot Studio
initControls();
syncCustomDesignButtons();
renderDesignGrids();
rebuildScene();
playBuildAnimation();

frame.render(() => {
  controls.update();
  updatePins();
  renderer.render(scene, camera);
}, true);
