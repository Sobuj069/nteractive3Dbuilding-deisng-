import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { getColumnGrid } from '../engine/costEngine.js';
import {
  createFloorDesignTexture,
  createLawnTexture,
  createPaverTexture,
  createRoofTileTexture,
  createTimberTexture,
  createWallTexture,
} from './textures.js';

export const FT_TO_UNIT = 1 / 4.5;
export const FLOOR_HEIGHT = 2.28;

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
    }
  });
  group.clear();
}

function enableShadows(obj, cast = true, receive = true) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

function addWallSegment({
  parent,
  axis = 'x',
  length,
  height,
  thickness,
  x,
  y,
  z,
  wallMat,
  frameMat,
  glassMat,
  hasWindow = false,
}) {
  if (!hasWindow || length < 1.8) {
    const geo =
      axis === 'x'
        ? new THREE.BoxGeometry(length, height, thickness)
        : new THREE.BoxGeometry(thickness, height, length);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, y + height / 2, z);
    parent.add(mesh);
    return;
  }

  const winLen = Math.min(length * 0.46, 2.3);
  const sideLen = (length - winLen) / 2;
  const sillH = height * 0.34;
  const winH = height * 0.45;
  const headerH = height - sillH - winH;
  const offset = winLen / 2 + sideLen / 2;

  const box = (w, h, d, ox, oy, oz, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x + ox, y + oy, z + oz);
    parent.add(m);
  };

  if (axis === 'x') {
    box(sideLen, height, thickness, -offset, height / 2, 0, wallMat);
    box(sideLen, height, thickness, offset, height / 2, 0, wallMat);
    box(winLen, sillH, thickness, 0, sillH / 2, 0, wallMat);
    box(winLen, headerH, thickness, 0, sillH + winH + headerH / 2, 0, wallMat);
    box(winLen, 0.05, thickness + 0.02, 0, sillH + 0.025, 0, frameMat);
    box(winLen, 0.05, thickness + 0.02, 0, sillH + winH - 0.025, 0, frameMat);
    box(0.05, winH, thickness + 0.02, 0, sillH + winH / 2, 0, frameMat);
    box(winLen - 0.06, winH - 0.06, 0.03, 0, sillH + winH / 2, 0, glassMat);
  } else {
    box(thickness, height, sideLen, 0, height / 2, -offset, wallMat);
    box(thickness, height, sideLen, 0, height / 2, offset, wallMat);
    box(thickness, sillH, winLen, 0, sillH / 2, 0, wallMat);
    box(thickness, headerH, winLen, 0, sillH + winH + headerH / 2, 0, wallMat);
    box(thickness + 0.02, 0.05, winLen, 0, sillH + 0.025, 0, frameMat);
    box(thickness + 0.02, 0.05, winLen, 0, sillH + winH - 0.025, 0, frameMat);
    box(thickness + 0.02, winH, 0.05, 0, sillH + winH / 2, 0, frameMat);
    box(0.03, winH - 0.06, winLen - 0.06, 0, sillH + winH / 2, 0, glassMat);
  }
}

function buildBed(w, d, color) {
  const g = new THREE.Group();
  const bw = Math.min(1.45, Math.max(0.85, w * 0.52));
  const bd = Math.min(1.75, Math.max(1.15, d * 0.58));

  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(bw, 0.22, bd, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.65 })
  );
  frame.position.y = 0.11;

  const mattress = new THREE.Mesh(
    new RoundedBoxGeometry(bw - 0.06, 0.14, bd - 0.08, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 })
  );
  mattress.position.y = 0.28;

  const blanket = new THREE.Mesh(
    new RoundedBoxGeometry(bw - 0.04, 0.05, bd * 0.56, 1, 0.02),
    new THREE.MeshStandardMaterial({ color, roughness: 0.78 })
  );
  blanket.position.set(0, 0.36, bd * 0.18);

  const head = new THREE.Mesh(
    new RoundedBoxGeometry(bw, 0.5, 0.07, 1, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x3b261d, roughness: 0.55 })
  );
  head.position.set(0, 0.38, -bd / 2 + 0.04);

  g.add(frame, mattress, blanket, head);
  return g;
}

function buildSedan(colorHex = '#38bdf8') {
  const car = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.28, 0.38, 2.45, 2, 0.07),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.26, metalness: 0.65 })
  );
  body.position.y = 0.3;

  const cabin = new THREE.Mesh(
    new RoundedBoxGeometry(1.08, 0.34, 1.32, 2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.18, metalness: 0.45 })
  );
  cabin.position.set(0, 0.62, -0.05);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
  const wGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 14);
  [
    [-0.62, 0.18, 0.72],
    [0.62, 0.18, 0.72],
    [-0.62, 0.18, -0.72],
    [0.62, 0.18, -0.72],
  ].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, wy, wz);
    car.add(w);
  });

  car.add(body, cabin);
  return car;
}

/**
 * Populates room-type-specific interior furniture cleanly inside a room's world box.
 */
function buildRoomFurniture(room, cx, floorY, cz, rw, rd, woodMat, frameMat) {
  const g = new THREE.Group();
  g.position.set(cx, floorY, cz);

  if (room.type === 'bedroom') {
    const bed = buildBed(rw, rd, room.accent || '#a78bfa');
    bed.position.set(0, 0, -rd * 0.08);
    g.add(bed);

    const wardrobe = new THREE.Mesh(
      new RoundedBoxGeometry(Math.min(0.42, rw * 0.22), 1.55, Math.min(1.15, rd * 0.45), 1, 0.02),
      woodMat
    );
    wardrobe.position.set(-rw * 0.36, 0.78, 0);
    g.add(wardrobe);
  } else if (room.type === 'living') {
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sw = Math.min(2.0, rw * 0.56);
    const sofa = new THREE.Mesh(new RoundedBoxGeometry(sw, 0.46, 0.72, 2, 0.04), sofaMat);
    sofa.position.set(-rw * 0.1, 0.23, -rd * 0.12);

    const table = new THREE.Mesh(
      new RoundedBoxGeometry(Math.min(1.0, rw * 0.34), 0.28, 0.52, 1, 0.02),
      woodMat
    );
    table.position.set(-rw * 0.1, 0.14, rd * 0.15);

    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(2.2, rw * 0.68), 0.02, Math.min(1.5, rd * 0.5)),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 })
    );
    rug.position.set(-rw * 0.1, 0.015, rd * 0.04);
    g.add(rug, sofa, table);
  } else if (room.type === 'kitchen') {
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const cw = Math.max(0.8, rw * 0.78);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.66, 0.52), cabMat);
    counter.position.set(0, 0.33, -rd * 0.32);
    const top = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.04, 0.05, 0.56), topMat);
    top.position.set(0, 0.68, -rd * 0.32);

    const fridge = new THREE.Mesh(
      new RoundedBoxGeometry(0.56, 1.48, 0.54, 1, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.55, roughness: 0.32 })
    );
    fridge.position.set(rw * 0.28, 0.74, rd * 0.12);
    g.add(counter, top, fridge);
  } else if (room.type === 'bath') {
    const vanity = new THREE.Mesh(
      new THREE.BoxGeometry(Math.min(0.65, rw * 0.6), 0.52, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    );
    vanity.position.set(0, 0.26, -rd * 0.28);
    g.add(vanity);
  } else if (room.type === 'porch') {
    if (rw >= 1.6 && rd >= 2.6) {
      const car = buildSedan('#38bdf8');
      car.position.set(0, 0, 0.1);
      g.add(car);
    }
  } else if (room.type === 'balcony') {
    const chairMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    [-Math.min(1.1, rw * 0.2), Math.min(1.1, rw * 0.2)].forEach((bx) => {
      const ch = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.4, 0.62, 1, 0.04), chairMat);
      ch.position.set(bx, 0.2, 0);
      g.add(ch);
    });
    const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 14), frameMat);
    tbl.position.set(0, 0.16, 0);
    g.add(tbl);
  }

  return g;
}

/**
 * Builds the 3D Underground Structural Foundation (Isolated, Combined, Mat/Raft, or Deep Piles).
 */
function buildUndergroundFoundation({
  parent,
  W,
  D,
  widthFt,
  depthFt,
  foundationType,
  foundationFloors,
}) {
  const { colsX, colsZ } = getColumnGrid(widthFt, depthFt);
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.82,
    metalness: 0.08,
  });
  const footingMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.85,
  });
  const rebarAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.65,
    roughness: 0.35,
  });

  const padScale = 0.8 + foundationFloors * 0.14;
  const depthScale = foundationType === 'pile' ? 3.2 + foundationFloors * 0.32 : 1.15 + foundationFloors * 0.14;

  // Column X & Z coordinates inside the footprint
  const xs = [];
  const zs = [];
  for (let i = 0; i < colsX; i++) {
    xs.push(-W / 2 + 0.35 + (i * (W - 0.7)) / (colsX - 1));
  }
  for (let j = 0; j < colsZ; j++) {
    zs.push(-D / 2 + 0.35 + (j * (D - 0.7)) / (colsZ - 1));
  }

  // Grade Beams connecting all columns at y = -0.18
  zs.forEach((z) => {
    const beamX = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.24, 0.2), concreteMat);
    beamX.position.set(0, -0.18, z);
    parent.add(beamX);
  });
  xs.forEach((x) => {
    const beamZ = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, D - 0.4), concreteMat);
    beamZ.position.set(x, -0.18, 0);
    parent.add(beamZ);
  });

  if (foundationType === 'mat') {
    // Full solid Mat / Raft Foundation Slab
    const matThickness = 0.38 + foundationFloors * 0.06;
    const matSlab = new THREE.Mesh(
      new RoundedBoxGeometry(W + 0.8, matThickness, D + 0.8, 1, 0.04),
      footingMat
    );
    matSlab.position.set(0, -depthScale, 0);
    parent.add(matSlab);

    // Highlight steel rebar mesh perimeter band
    const steelBand = new THREE.Mesh(
      new THREE.BoxGeometry(W + 0.84, 0.06, D + 0.84),
      rebarAccentMat
    );
    steelBand.position.set(0, -depthScale, 0);
    parent.add(steelBand);
  } else if (foundationType === 'combined') {
    // Strip / Combined footings along rows
    zs.forEach((z) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(W + 0.4, 0.34, 0.75 * padScale),
        footingMat
      );
      strip.position.set(0, -depthScale, z);
      parent.add(strip);
    });
  }

  // Column Pedestals + Isolated Footings / Deep Piles
  xs.forEach((x) => {
    zs.forEach((z) => {
      const colSize = 0.22 + foundationFloors * 0.025;
      const pedH = foundationType === 'pile' ? 1.2 : depthScale;
      const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(colSize, pedH, colSize),
        concreteMat
      );
      pedestal.position.set(x, -pedH / 2 - 0.05, z);
      parent.add(pedestal);

      if (foundationType === 'isolated') {
        const padW = 0.82 * padScale;
        const pad = new THREE.Mesh(new THREE.BoxGeometry(padW, 0.3, padW), footingMat);
        pad.position.set(x, -depthScale, z);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(padW * 0.65, 0.16, padW * 0.65), rebarAccentMat);
        cap.position.set(x, -depthScale + 0.22, z);
        parent.add(pad, cap);
      } else if (foundationType === 'pile') {
        // Pile Cap + 2 Deep Cylindrical Cast-in-Situ Piles
        const pileCap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.75), footingMat);
        pileCap.position.set(x, -1.25, z);
        const capRing = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.06, 0.78), rebarAccentMat);
        capRing.position.set(x, -1.25, z);
        parent.add(pileCap, capRing);

        const pileLen = depthScale - 1.1;
        [-0.24, 0.24].forEach((px) => {
          const pile = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.12, pileLen, 12),
            concreteMat
          );
          pile.position.set(x + px, -1.42 - pileLen / 2, z);
          parent.add(pile);
        });
      }
    });
  });

  // Translucent Soil Excavation Cutaway Box (visible during X-Ray)
  const soilBox = new THREE.Mesh(
    new THREE.BoxGeometry(W + 2.8, depthScale + 0.6, D + 2.8),
    new THREE.MeshStandardMaterial({
      color: 0x3b2f26,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })
  );
  soilBox.position.set(0, -(depthScale + 0.6) / 2 - 0.06, 0);
  parent.add(soilBox);
}

/**
 * Main Parametric 3D House + Foundation X-Ray Scene Controller
 */
export function createHouseModel(scene) {
  const root = new THREE.Group();
  scene.add(root);

  const foundationGroup = new THREE.Group();
  const siteGroup = new THREE.Group();
  const buildingContainer = new THREE.Group();
  const roofGroup = new THREE.Group();

  root.add(foundationGroup, siteGroup, buildingContainer, roofGroup);

  // Shared static textures
  const lawnTex = createLawnTexture();
  const paverTex = createPaverTexture();
  const timberTex = createTimberTexture();
  const roofTileTex = createRoofTileTexture();

  // Dynamic materials for X-Ray toggling
  let siteSurfaceMats = [];
  let floorGroups = [];
  let roomHitMeshes = [];
  let cachedTextures = [];

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.95);
  root.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.25);
  sunLight.position.set(15, 20, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 55;
  const d = 14;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  root.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  fillLight.position.set(-14, 10, -12);
  root.add(fillLight);

  const interiorLight = new THREE.PointLight(0xfbbf24, 2.0, 20, 1.3);
  interiorLight.position.set(0, 2.5, 0);
  root.add(interiorLight);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.34,
    roughness: 0.08,
    metalness: 0.1,
  });

  function setXRayGround(enabled) {
    siteSurfaceMats.forEach((mat) => {
      mat.transparent = enabled;
      mat.opacity = enabled ? 0.16 : 1.0;
      mat.depthWrite = !enabled;
      mat.needsUpdate = true;
    });
    foundationGroup.visible = enabled;
  }

  function rebuild({ config, planTemplate, exteriorDesign, floorDesign }) {
    // Cleanup previous scene objects & dynamic textures
    disposeGroup(foundationGroup);
    disposeGroup(siteGroup);
    disposeGroup(buildingContainer);
    disposeGroup(roofGroup);
    cachedTextures.forEach((t) => t.dispose());
    cachedTextures = [];
    siteSurfaceMats = [];
    floorGroups = [];
    roomHitMeshes = [];

    const W = config.widthFt * FT_TO_UNIT;
    const D = config.depthFt * FT_TO_UNIT;
    const floors = Math.max(1, Math.min(4, Number(config.floors)));
    const WH = FLOOR_HEIGHT - 0.14;
    const WT = 0.14;

    // Generate live wall & floor textures from selected Exterior + Floor Design
    const activeWallPattern = config.overrideWallPattern || exteriorDesign.wallPattern || 'plaster';
    const activeWallColor = config.customWallColor || exteriorDesign.wallColor;
    const activeRoofStyle = config.customRoofStyle || exteriorDesign.roofStyle;

    const wallTex = createWallTexture(activeWallPattern, activeWallColor);
    wallTex.repeat.set(Math.max(2, Math.round(W / 2)), 1.5);
    const floorTex = createFloorDesignTexture(floorDesign);
    floorTex.repeat.set(Math.max(3, Math.round(W)), Math.max(3, Math.round(D)));
    cachedTextures.push(wallTex, floorTex);

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.72, metalness: 0.04 });
    const innerWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.78 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: exteriorDesign.accentColor,
      roughness: 0.45,
      metalness: 0.3,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: exteriorDesign.frameColor || '#1e293b',
      roughness: 0.35,
      metalness: 0.6,
    });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0.06 });
    const woodMat = new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.58 });

    // ==================== 1. UNDERGROUND FOUNDATION ====================
    buildUndergroundFoundation({
      parent: foundationGroup,
      W,
      D,
      widthFt: config.widthFt,
      depthFt: config.depthFt,
      foundationType: config.foundationType,
      foundationFloors: Math.max(floors, Number(config.foundationFloors)),
    });
    foundationGroup.visible = false;

    // ==================== 2. SITE PLOT & LANDSCAPE ====================
    const plotW = W + 6.2;
    const plotD = D + 6.6;

    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const lawnMat = new THREE.MeshStandardMaterial({ map: lawnTex, roughness: 0.92 });
    const paverMat = new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.82 });
    siteSurfaceMats.push(plinthMat, lawnMat, paverMat);

    const plinth = new THREE.Mesh(new RoundedBoxGeometry(plotW, 0.36, plotD, 2, 0.06), plinthMat);
    plinth.position.set(0, -0.2, 0.25);
    siteGroup.add(plinth);

    lawnTex.repeat.set(4, 4);
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(plotW - 0.25, 0.04, plotD - 0.25), lawnMat);
    lawn.position.set(0, 0.0, 0.25);
    siteGroup.add(lawn);

    paverTex.repeat.set(2, 3);
    const drive = new THREE.Mesh(new THREE.BoxGeometry(W * 0.38, 0.05, D * 0.44 + 2.8), paverMat);
    drive.position.set(W * 0.3, 0.03, D * 0.3 + 1.3);
    siteGroup.add(drive);

    // Boundary walls & trees
    const boundaryMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
    siteSurfaceMats.push(boundaryMat);
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(plotW - 0.3, 0.52, 0.14), boundaryMat);
    rearWall.position.set(0, 0.26, -plotD / 2 + 0.38);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, plotD - 0.3), boundaryMat);
    leftWall.position.set(-plotW / 2 + 0.38, 0.26, 0.25);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, plotD - 0.3), boundaryMat);
    rightWall.position.set(plotW / 2 - 0.38, 0.26, 0.25);
    siteGroup.add(rearWall, leftWall, rightWall);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.72 });
    [
      [-plotW / 2 + 1.25, plotD / 2 - 1.0],
      [-plotW / 2 + 1.25, -plotD / 2 + 1.25],
      [plotW / 2 - 1.25, -plotD / 2 + 1.25],
    ].forEach(([tx, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.9, 10), trunkMat);
      trunk.position.set(tx, 0.45, tz);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), leafMat);
      crown.position.set(tx, 1.15, tz);
      siteGroup.add(trunk, crown);
    });
    enableShadows(siteGroup, true, true);

    // ==================== 3. DYNAMIC MULTI-STORY FLOORS ====================
    for (let f = 0; f < floors; f++) {
      const fg = new THREE.Group();
      const baseY = 0.14 + f * FLOOR_HEIGHT;
      const roomList = f === 0 ? planTemplate.rooms.ground : planTemplate.rooms.upper;

      // Floor structural slab
      const slab = new THREE.Mesh(
        new RoundedBoxGeometry(W + (f > 0 ? 0.28 : 0), 0.16, D + (f > 0 ? 0.32 : 0), 1, 0.03),
        f === 0 ? floorMat : new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
      );
      slab.position.set(0, baseY - 0.08, 0);
      fg.add(slab);

      if (f > 0) {
        const innerTile = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.02, D - 0.12), floorMat);
        innerTile.position.set(0, baseY + 0.01, 0);
        fg.add(innerTile);
      }

      // Outer Perimeter Architectural Walls
      addWallSegment({
        parent: fg,
        axis: 'x',
        length: W,
        height: WH,
        thickness: WT,
        x: 0,
        y: baseY,
        z: -D / 2 + WT / 2,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });

      const hasOpenFrontBalcony = f > 0 && roomList.some((r) => r.type === 'balcony');
      const sideWallLen = hasOpenFrontBalcony ? D * 0.62 : D;
      const sideWallZ = hasOpenFrontBalcony ? -D / 2 + sideWallLen / 2 : 0;

      addWallSegment({
        parent: fg,
        axis: 'z',
        length: sideWallLen,
        height: WH,
        thickness: WT,
        x: -W / 2 + WT / 2,
        y: baseY,
        z: sideWallZ,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });

      const rightLen = f === 0 ? D * 0.56 : sideWallLen;
      const rightZ = f === 0 ? -D / 2 + rightLen / 2 : sideWallZ;
      addWallSegment({
        parent: fg,
        axis: 'z',
        length: rightLen,
        height: WH,
        thickness: WT,
        x: W / 2 - WT / 2,
        y: baseY,
        z: rightZ,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });

      if (f === 0) {
        // Front living wall + entry door + porch columns
        addWallSegment({
          parent: fg,
          axis: 'x',
          length: W * 0.58,
          height: WH,
          thickness: WT,
          x: -W * 0.21,
          y: baseY,
          z: D / 2 - WT / 2,
          wallMat,
          frameMat,
          glassMat,
          hasWindow: true,
        });
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.82, 0.08), woodMat);
        door.position.set(-W * 0.02, baseY + 0.91, D / 2 - 0.06);
        fg.add(door);

        const colGeo =
          exteriorDesign.porchColumns === 'round'
            ? new THREE.CylinderGeometry(0.13, 0.14, WH, 16)
            : new THREE.BoxGeometry(0.24, WH, 0.24);
        const pCol1 = new THREE.Mesh(colGeo, accentMat);
        pCol1.position.set(W / 2 - 0.16, baseY + WH / 2, D / 2 - 0.16);
        const pCol2 = new THREE.Mesh(colGeo, accentMat);
        pCol2.position.set(W * 0.12, baseY + WH / 2, D / 2 - 0.16);
        fg.add(pCol1, pCol2);
      } else if (hasOpenFrontBalcony) {
        // Upper sliding glass facade wall + cantilevered glass balcony railing
        addWallSegment({
          parent: fg,
          axis: 'x',
          length: W - 0.2,
          height: WH,
          thickness: 0.1,
          x: 0,
          y: baseY,
          z: D * 0.08,
          wallMat,
          frameMat,
          glassMat,
          hasWindow: true,
        });
        const frontRail = new THREE.Mesh(new THREE.BoxGeometry(W + 0.18, 0.72, 0.04), glassMat);
        frontRail.position.set(0, baseY + 0.36, D / 2 + 0.14);
        const railCap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.05, 0.08), accentMat);
        railCap.position.set(0, baseY + 0.72, D / 2 + 0.14);
        fg.add(frontRail, railCap);
      }

      // Optional Facade Louver Fins from Exterior Design
      if (exteriorDesign.louvers) {
        for (let l = 0; l < 4; l++) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, WH, 0.24), accentMat);
          fin.position.set(-W / 2 + 0.45 + l * 0.34, baseY + WH / 2, D / 2 + 0.12);
          fg.add(fin);
        }
      }

      // Render Each Room's Interior Partitions, Furniture, and Clickable Hitbox
      roomList.forEach((room) => {
        const rx = ((room.x + room.w / 2) / 100 - 0.5) * (W - 0.32);
        const rz = ((room.y + room.h / 2) / 100 - 0.5) * (D - 0.32);
        const rw = (room.w / 100) * (W - 0.32);
        const rd = (room.h / 100) * (D - 0.32);

        // Low/full clean interior partition frame borders for visual room clarity
        if (room.type !== 'porch' && room.type !== 'balcony') {
          const pH = WH * 0.92;
          // Right divider if not at right edge
          if (room.x + room.w < 92) {
            const pR = new THREE.Mesh(new THREE.BoxGeometry(0.09, pH, rd * 0.78), innerWallMat);
            pR.position.set(rx + rw / 2, baseY + pH / 2, rz);
            fg.add(pR);
          }
          // Bottom divider if not at front edge
          if (room.y + room.h < 90) {
            const pB = new THREE.Mesh(new THREE.BoxGeometry(rw * 0.72, pH, 0.09), innerWallMat);
            pB.position.set(rx - rw * 0.06, baseY + pH / 2, rz + rd / 2);
            fg.add(pB);
          }
        }

        if (config.showFurniture) {
          const furn = buildRoomFurniture(room, rx, baseY + 0.02, rz, rw, rd, woodMat, frameMat);
          fg.add(furn);
        }

        // Clickable Invisible Room Hitpad
        const hitPad = new THREE.Mesh(
          new THREE.BoxGeometry(rw * 0.9, 0.4, rd * 0.9),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        hitPad.position.set(rx, baseY + 0.22, rz);
        hitPad.userData.roomId = room.id;
        hitPad.userData.floorIndex = f;
        fg.add(hitPad);
        roomHitMeshes.push(hitPad);
      });

      // Internal Staircase when multi-story
      if (floors > 1 && f < floors - 1) {
        const stairs = new THREE.Group();
        for (let s = 0; s < 9; s++) {
          const st = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.24), woodMat);
          st.position.set(0, s * 0.22 + 0.1, -s * 0.22);
          stairs.add(st);
        }
        stairs.position.set(W * 0.05, baseY, D * 0.14);
        fg.add(stairs);
      }

      enableShadows(fg, true, true);
      buildingContainer.add(fg);
      floorGroups.push(fg);
    }

    // ==================== 4. ROOF LEVEL ====================
    const roofBaseY = 0.14 + floors * FLOOR_HEIGHT;
    const roofW = W + 0.52;
    const roofD = D + 0.56;

    if (activeRoofStyle === 'gable') {
      const ridgeH = 1.65;
      const shape = new THREE.Shape();
      shape.moveTo(-roofW / 2, 0);
      shape.lineTo(roofW / 2, 0);
      shape.lineTo(0, ridgeH);
      shape.closePath();

      const gable = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: roofD - 0.15, bevelEnabled: false }),
        wallMat
      );
      gable.position.set(0, roofBaseY, -(roofD - 0.15) / 2);
      roofGroup.add(gable);

      const slopeLen = Math.hypot(roofW / 2, ridgeH) + 0.35;
      const angle = Math.atan2(ridgeH, roofW / 2);
      roofTileTex.repeat.set(3, 3);
      const slopeMat = new THREE.MeshStandardMaterial({ map: roofTileTex, roughness: 0.6 });

      const sL = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.1, roofD + 0.2), slopeMat);
      sL.position.set(-roofW / 4 - 0.04, roofBaseY + ridgeH / 2 + 0.04, 0);
      sL.rotation.z = angle;

      const sR = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.1, roofD + 0.2), slopeMat);
      sR.position.set(roofW / 4 + 0.04, roofBaseY + ridgeH / 2 + 0.04, 0);
      sR.rotation.z = -angle;
      roofGroup.add(sL, sR);
    } else {
      const slab = new THREE.Mesh(
        new RoundedBoxGeometry(roofW, 0.18, roofD, 1, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
      );
      slab.position.set(0, roofBaseY, 0);
      roofGroup.add(slab);

      const pH = activeRoofStyle === 'terrace' ? 0.54 : 0.34;
      const pF = new THREE.Mesh(new THREE.BoxGeometry(roofW, pH, 0.14), wallMat);
      pF.position.set(0, roofBaseY + pH / 2, roofD / 2 - 0.07);
      const pB = new THREE.Mesh(new THREE.BoxGeometry(roofW, pH, 0.14), wallMat);
      pB.position.set(0, roofBaseY + pH / 2, -roofD / 2 + 0.07);
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.14, pH, roofD), wallMat);
      pL.position.set(-roofW / 2 + 0.07, roofBaseY + pH / 2, 0);
      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.14, pH, roofD), wallMat);
      pR.position.set(roofW / 2 - 0.07, roofBaseY + pH / 2, 0);
      roofGroup.add(pF, pB, pL, pR);

      // Overhead water tank / stair mumty room (authentic BD rooftop detail!)
      const mumty = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.2, 1.9, 1, 0.03), accentMat);
      mumty.position.set(W * 0.18, roofBaseY + 0.65, -D * 0.22);
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.85, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
      );
      tank.position.set(W * 0.18, roofBaseY + 1.65, -D * 0.22);
      roofGroup.add(mumty, tank);

      if (activeRoofStyle === 'terrace') {
        const deck = new THREE.Mesh(new THREE.BoxGeometry(roofW - 0.6, 0.03, roofD - 0.6), woodMat);
        deck.position.set(0, roofBaseY + 0.1, 0);
        roofGroup.add(deck);

        [-roofW * 0.32, roofW * 0.1].forEach((px) => {
          [-roofD * 0.26, roofD * 0.22].forEach((pz) => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.25, 0.09), accentMat);
            post.position.set(px, roofBaseY + 0.72, pz);
            roofGroup.add(post);
          });
        });
        for (let b = 0; b < 5; b++) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, roofD * 0.52), woodMat);
          beam.position.set(-roofW * 0.3 + b * (roofW * 0.1), roofBaseY + 1.35, -roofD * 0.02);
          roofGroup.add(beam);
        }
      } else {
        const solarMat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          metalness: 0.78,
          roughness: 0.2,
        });
        for (let s = 0; s < 3; s++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.85), solarMat);
          panel.position.set(-W * 0.2, roofBaseY + 0.2, -D * 0.18 + s * 1.05);
          panel.rotation.x = 0.18;
          roofGroup.add(panel);
        }
      }
    }
    enableShadows(roofGroup, true, true);
  }

  function setLightingMode(mode) {
    if (mode === 'evening') {
      scene.background = new THREE.Color(0x0b1222);
      scene.fog = new THREE.FogExp2(0x0b1222, 0.015);
      hemiLight.color.setHex(0x93c5fd);
      hemiLight.groundColor.setHex(0x1e293b);
      hemiLight.intensity = 0.68;
      sunLight.color.setHex(0xfb923c);
      sunLight.position.set(16, 7, 10);
      sunLight.intensity = 1.65;
      interiorLight.intensity = 4.5;
    } else {
      scene.background = new THREE.Color(0xdbeafe);
      scene.fog = new THREE.FogExp2(0xdbeafe, 0.011);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x94a3b8);
      hemiLight.intensity = 1.05;
      sunLight.color.setHex(0xfffbeb);
      sunLight.position.set(15, 20, 14);
      sunLight.intensity = 2.35;
      interiorLight.intensity = 1.8;
    }
  }

  setLightingMode('day');

  return {
    root,
    foundationGroup,
    siteGroup,
    roofGroup,
    getFloorGroups: () => floorGroups,
    getInteractiveMeshes: () => roomHitMeshes,
    setXRayGround,
    rebuild,
    setLightingMode,
  };
}
