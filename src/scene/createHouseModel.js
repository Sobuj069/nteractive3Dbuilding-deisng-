import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { computeHouseMetrics } from '../data/housePlan.js';
import {
  createFloorTileTexture,
  createLawnTexture,
  createPaverTexture,
  createRoofTileTexture,
  createTimberTexture,
} from './textures.js';

function tagRoom(obj, roomId) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.userData.roomId = roomId;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function enableShadows(obj, cast = true, receive = true) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
    }
  });
  group.clear();
}

/**
 * Adds a wall segment along X (axis='x') or Z (axis='z') with an optional glass window cutout.
 */
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
  const group = new THREE.Group();

  if (!hasWindow || length < 1.6) {
    const geo =
      axis === 'x'
        ? new THREE.BoxGeometry(length, height, thickness)
        : new THREE.BoxGeometry(thickness, height, length);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    parent.add(group);
    return;
  }

  const winLen = Math.min(length * 0.48, 2.4);
  const sideLen = (length - winLen) / 2;
  const sillH = height * 0.34;
  const winH = height * 0.46;
  const headerH = height - sillH - winH;

  const makeBox = (w, h, d, ox, oy, oz, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x + ox, y + oy, z + oz);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };

  const offset = winLen / 2 + sideLen / 2;
  if (axis === 'x') {
    makeBox(sideLen, height, thickness, -offset, height / 2, 0, wallMat);
    makeBox(sideLen, height, thickness, offset, height / 2, 0, wallMat);
    makeBox(winLen, sillH, thickness, 0, sillH / 2, 0, wallMat);
    makeBox(winLen, headerH, thickness, 0, sillH + winH + headerH / 2, 0, wallMat);
    // Window frame & glass
    makeBox(winLen, 0.05, thickness + 0.02, 0, sillH + 0.025, 0, frameMat);
    makeBox(winLen, 0.05, thickness + 0.02, 0, sillH + winH - 0.025, 0, frameMat);
    makeBox(0.05, winH, thickness + 0.02, 0, sillH + winH / 2, 0, frameMat);
    makeBox(winLen - 0.06, winH - 0.06, 0.03, 0, sillH + winH / 2, 0, glassMat);
  } else {
    makeBox(thickness, height, sideLen, 0, height / 2, -offset, wallMat);
    makeBox(thickness, height, sideLen, 0, height / 2, offset, wallMat);
    makeBox(thickness, sillH, winLen, 0, sillH / 2, 0, wallMat);
    makeBox(thickness, headerH, winLen, 0, sillH + winH + headerH / 2, 0, wallMat);
    makeBox(thickness + 0.02, 0.05, winLen, 0, sillH + 0.025, 0, frameMat);
    makeBox(thickness + 0.02, 0.05, winLen, 0, sillH + winH - 0.025, 0, frameMat);
    makeBox(thickness + 0.02, winH, 0.05, 0, sillH + winH / 2, 0, frameMat);
    makeBox(0.03, winH - 0.06, winLen - 0.06, 0, sillH + winH / 2, 0, glassMat);
  }

  parent.add(group);
}

/**
 * Adds an interior partition wall with an open doorway gap in the center.
 */
function addPartitionWithDoor({
  parent,
  axis = 'x',
  length,
  height,
  thickness = 0.11,
  x,
  y,
  z,
  wallMat,
  doorWidth = 0.85,
}) {
  if (length <= doorWidth + 0.3) return;
  const side = (length - doorWidth) / 2;
  const offset = doorWidth / 2 + side / 2;

  [-offset, offset].forEach((pos) => {
    const geo =
      axis === 'x'
        ? new THREE.BoxGeometry(side, height, thickness)
        : new THREE.BoxGeometry(thickness, height, side);
    const m = new THREE.Mesh(geo, wallMat);
    m.position.set(axis === 'x' ? x + pos : x, y + height / 2, axis === 'z' ? z + pos : z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
  });

  // Door lintel above opening
  const lintelH = 0.35;
  const lintelGeo =
    axis === 'x'
      ? new THREE.BoxGeometry(doorWidth, lintelH, thickness)
      : new THREE.BoxGeometry(thickness, lintelH, doorWidth);
  const lintel = new THREE.Mesh(lintelGeo, wallMat);
  lintel.position.set(x, y + height - lintelH / 2, z);
  lintel.castShadow = true;
  parent.add(lintel);
}

function buildBed(width = 1.25, depth = 1.55, accentColor = 0x38bdf8) {
  const bed = new THREE.Group();
  const base = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.24, depth, 1, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.6 })
  );
  base.position.y = 0.12;

  const mattress = new THREE.Mesh(
    new RoundedBoxGeometry(width - 0.08, 0.16, depth - 0.1, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 })
  );
  mattress.position.y = 0.31;

  const blanket = new THREE.Mesh(
    new RoundedBoxGeometry(width - 0.05, 0.06, depth * 0.6, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.75 })
  );
  blanket.position.set(0, 0.39, depth * 0.18);

  const headboard = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.56, 0.08, 1, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x3f2e25, roughness: 0.5 })
  );
  headboard.position.set(0, 0.42, -depth / 2 + 0.04);

  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
  [-width * 0.22, width * 0.22].forEach((px) => {
    const p = new THREE.Mesh(new RoundedBoxGeometry(width * 0.34, 0.08, 0.24, 2, 0.03), pillowMat);
    p.position.set(px, 0.43, -depth / 2 + 0.26);
    bed.add(p);
  });

  bed.add(base, mattress, blanket, headboard);
  return bed;
}

function buildSedanCar(accentHex = '#38bdf8') {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    roughness: 0.25,
    metalness: 0.65,
  });
  const cabinMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.4,
  });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });

  const chassis = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.42, 2.75, 2, 0.08), bodyMat);
  chassis.position.y = 0.34;

  const cabin = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.38, 1.48, 2, 0.1), cabinMat);
  cabin.position.set(0, 0.68, -0.05);

  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 18);
  [
    [-0.68, 0.2, 0.82],
    [0.68, 0.2, 0.82],
    [-0.68, 0.2, -0.82],
    [0.68, 0.2, -0.82],
  ].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, wy, wz);
    car.add(w);
  });

  // Headlights
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfde68a,
    emissiveIntensity: 1.5,
  });
  [-0.45, 0.45].forEach((lx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.04), lightMat);
    hl.position.set(lx, 0.38, 1.38);
    car.add(hl);
  });

  car.add(chassis, cabin);
  return car;
}

/**
 * Creates the parametric residential house builder supporting live plan rebuilds and floor cutaways.
 */
export function createHouseModel(scene) {
  const root = new THREE.Group();
  scene.add(root);

  const siteGroup = new THREE.Group();
  const groundGroup = new THREE.Group();
  const firstFloorGroup = new THREE.Group();
  const roofGroup = new THREE.Group();

  root.add(siteGroup, groundGroup, firstFloorGroup, roofGroup);

  // Shared procedural textures
  const tileTex = createFloorTileTexture();
  const lawnTex = createLawnTexture();
  const paverTex = createPaverTexture();
  const timberTex = createTimberTexture();
  const roofTileTex = createRoofTileTexture();

  // Lighting Setup
  const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.9);
  root.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
  sunLight.position.set(14, 18, 12);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 48;
  const d = 13;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  root.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  fillLight.position.set(-12, 10, -10);
  root.add(fillLight);

  const interiorWarmLight = new THREE.PointLight(0xfbbf24, 2.4, 16, 1.4);
  interiorWarmLight.position.set(0, 1.65, 0);
  groundGroup.add(interiorWarmLight);

  const upperWarmLight = new THREE.PointLight(0xfde68a, 2.2, 14, 1.4);
  upperWarmLight.position.set(0, 3.85, 0);
  firstFloorGroup.add(upperWarmLight);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.34,
    roughness: 0.08,
    metalness: 0.1,
  });

  let roomHitGroups = [];

  function rebuild(plan) {
    // Clear previous geometry (preserving the 2 interior point lights)
    disposeGroup(siteGroup);
    disposeGroup(groundGroup);
    disposeGroup(firstFloorGroup);
    disposeGroup(roofGroup);
    groundGroup.add(interiorWarmLight);
    firstFloorGroup.add(upperWarmLight);
    roomHitGroups = [];

    const metrics = computeHouseMetrics(plan);
    const W = metrics.widthUnits;
    const D = metrics.depthUnits;
    const WH = 2.15;
    const WT = 0.14;
    const groundTopY = 0.16;
    const firstTopY = 2.42;

    const wallMat = new THREE.MeshStandardMaterial({
      color: plan.wallColor,
      roughness: 0.72,
      metalness: 0.04,
    });
    const interiorWallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.78,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: plan.accentColor,
      roughness: 0.45,
      metalness: 0.3,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.6,
    });

    tileTex.repeat.set(Math.max(3, Math.round(W)), Math.max(3, Math.round(D)));
    const floorMat = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.42,
      metalness: 0.05,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: timberTex,
      roughness: 0.58,
    });

    // ==================== 1. SITE & GARDEN ====================
    const plotW = W + 6.4;
    const plotD = D + 6.8;

    const basePlinth = new THREE.Mesh(
      new RoundedBoxGeometry(plotW, 0.42, plotD, 2, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
    );
    basePlinth.position.set(0, -0.22, 0.25);
    basePlinth.receiveShadow = true;
    siteGroup.add(basePlinth);

    lawnTex.repeat.set(4, 4);
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(plotW - 0.3, 0.04, plotD - 0.3),
      new THREE.MeshStandardMaterial({ map: lawnTex, roughness: 0.92 })
    );
    lawn.position.set(0, 0.01, 0.25);
    lawn.receiveShadow = true;
    siteGroup.add(lawn);

    // Compound perimeter wall
    const boundaryMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const rearFence = new THREE.Mesh(new THREE.BoxGeometry(plotW - 0.4, 0.58, 0.14), boundaryMat);
    rearFence.position.set(0, 0.29, -plotD / 2 + 0.42);
    const leftFence = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, plotD - 0.4), boundaryMat);
    leftFence.position.set(-plotW / 2 + 0.42, 0.29, 0.25);
    const rightFence = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, plotD - 0.4), boundaryMat);
    rightFence.position.set(plotW / 2 - 0.42, 0.29, 0.25);
    siteGroup.add(rearFence, leftFence, rightFence);

    // Driveway paving leading to Car Porch
    paverTex.repeat.set(2, 3);
    const drivewayW = W * 0.42;
    const drivewayD = D * 0.42 + 2.8;
    const driveway = new THREE.Mesh(
      new THREE.BoxGeometry(drivewayW, 0.06, drivewayD),
      new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.82 })
    );
    driveway.position.set(W * 0.29, 0.04, D * 0.29 + 1.35);
    driveway.receiveShadow = true;
    siteGroup.add(driveway);

    // Front Entry Walkway
    const walkway = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.06, 2.7),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 })
    );
    walkway.position.set(-W * 0.05, 0.04, D / 2 + 1.35);
    walkway.receiveShadow = true;
    siteGroup.add(walkway);

    // Landscaped Trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.72 });
    [
      [-plotW / 2 + 1.3, 0, plotD / 2 - 1.1],
      [-plotW / 2 + 1.3, 0, -plotD / 2 + 1.4],
      [plotW / 2 - 1.2, 0, -plotD / 2 + 1.4],
    ].forEach(([tx, ty, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.9, 10), trunkMat);
      trunk.position.set(tx, ty + 0.45, tz);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), leafMat);
      crown.position.set(tx, ty + 1.15, tz);
      siteGroup.add(trunk, crown);
    });

    enableShadows(siteGroup, true, true);

    // ==================== 2. GROUND FLOOR PLAN ====================
    // Main indoor floor slab (excluding open front-right porch zone)
    const groundSlab = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.16, D),
      floorMat
    );
    groundSlab.position.set(0, 0.08, 0);
    groundSlab.receiveShadow = true;
    groundGroup.add(groundSlab);

    // Partition Z split between rear rooms & front living/porch
    const splitZ = -D * 0.12;
    const rearDepth = D * 0.38;
    const frontDepth = D * 0.62;
    const splitXGuestBath = -W * 0.05;
    const splitXBathKitchen = W * 0.1;
    const porchSplitZ = D * 0.08;

    // Exterior Walls (with architectural windows!)
    // Rear wall
    addWallSegment({
      parent: groundGroup,
      axis: 'x',
      length: W,
      height: WH,
      thickness: WT,
      x: 0,
      y: groundTopY,
      z: -D / 2 + WT / 2,
      wallMat,
      frameMat,
      glassMat,
      hasWindow: true,
    });
    // Left exterior wall
    addWallSegment({
      parent: groundGroup,
      axis: 'z',
      length: D,
      height: WH,
      thickness: WT,
      x: -W / 2 + WT / 2,
      y: groundTopY,
      z: 0,
      wallMat,
      frameMat,
      glassMat,
      hasWindow: true,
    });
    // Right exterior wall (from rear to porch opening)
    addWallSegment({
      parent: groundGroup,
      axis: 'z',
      length: D * 0.58,
      height: WH,
      thickness: WT,
      x: W / 2 - WT / 2,
      y: groundTopY,
      z: -D * 0.21,
      wallMat,
      frameMat,
      glassMat,
      hasWindow: true,
    });
    // Front wall for Living Room (left side up to entry door & porch divider)
    addWallSegment({
      parent: groundGroup,
      axis: 'x',
      length: W * 0.56,
      height: WH,
      thickness: WT,
      x: -W * 0.22,
      y: groundTopY,
      z: D / 2 - WT / 2,
      wallMat,
      frameMat,
      glassMat,
      hasWindow: true,
    });

    // Front Porch Columns (right front corner)
    const porchCol = new THREE.Mesh(new THREE.BoxGeometry(0.24, WH, 0.24), accentMat);
    porchCol.position.set(W / 2 - 0.14, groundTopY + WH / 2, D / 2 - 0.14);
    const porchColMid = new THREE.Mesh(new THREE.BoxGeometry(0.22, WH, 0.22), accentMat);
    porchColMid.position.set(splitXBathKitchen, groundTopY + WH / 2, D / 2 - 0.14);
    groundGroup.add(porchCol, porchColMid);

    // Front Wooden Main Entrance Door
    const entryDoor = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.85, 0.08), woodMat);
    entryDoor.position.set(-W * 0.04, groundTopY + 0.92, D / 2 - 0.06);
    groundGroup.add(entryDoor);

    // Interior Partition Walls (with doorways!)
    // Rear horizontal partition separating Guest/Bath/Kitchen from Living/Porch
    addPartitionWithDoor({
      parent: groundGroup,
      axis: 'x',
      length: W * 0.45,
      height: WH,
      x: -W * 0.275,
      y: groundTopY,
      z: splitZ,
      wallMat: interiorWallMat,
    });
    addPartitionWithDoor({
      parent: groundGroup,
      axis: 'x',
      length: W * 0.4,
      height: WH,
      x: W * 0.3,
      y: groundTopY,
      z: splitZ,
      wallMat: interiorWallMat,
    });
    // Vertical wall between Guest Bed & Bath
    const bathWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, WH, rearDepth),
      interiorWallMat
    );
    bathWall.position.set(splitXGuestBath, groundTopY + WH / 2, -D / 2 + rearDepth / 2);
    groundGroup.add(bathWall);

    // Vertical wall between Bath & Kitchen
    addPartitionWithDoor({
      parent: groundGroup,
      axis: 'z',
      length: rearDepth,
      height: WH,
      x: splitXBathKitchen,
      y: groundTopY,
      z: -D / 2 + rearDepth / 2,
      wallMat: interiorWallMat,
      doorWidth: 0.75,
    });

    // Wall separating Living Hall from Car Porch
    addPartitionWithDoor({
      parent: groundGroup,
      axis: 'z',
      length: D - rearDepth,
      height: WH,
      x: splitXBathKitchen,
      y: groundTopY,
      z: splitZ + (D - rearDepth) / 2,
      wallMat,
      doorWidth: 0.9,
    });

    // Interactive Room Hit Pads (clickable floors for every Ground Room)
    const addRoomHitZone = (id, x, y, z, rw, rd, targetGroup) => {
      const hitMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const pad = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.25, rd), hitMat);
      pad.position.set(x, y + 0.14, z);
      pad.userData.roomId = id;
      targetGroup.add(pad);
      roomHitGroups.push(pad);
    };

    // Room Hit Zones for Ground Floor
    addRoomHitZone('living', -W * 0.2, groundTopY, D * 0.15, W * 0.56, frontDepth * 0.9, groundGroup);
    addRoomHitZone('kitchen', W * 0.3, groundTopY, -D * 0.31, W * 0.38, rearDepth * 0.9, groundGroup);
    addRoomHitZone('guest_bed', -W * 0.27, groundTopY, -D * 0.31, W * 0.42, rearDepth * 0.9, groundGroup);
    addRoomHitZone('bath_ground', W * 0.025, groundTopY, -D * 0.31, W * 0.14, rearDepth * 0.9, groundGroup);
    addRoomHitZone('porch', W * 0.3, groundTopY, porchSplitZ + 0.6, W * 0.38, frontDepth * 0.85, groundGroup);

    // Interior Staircase (when 2-story)
    if (plan.floors === 2) {
      const stairGroup = new THREE.Group();
      const steps = 10;
      for (let s = 0; s < steps; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.28), woodMat);
        step.position.set(0, s * 0.21 + 0.1, -s * 0.24);
        stairGroup.add(step);
      }
      const stairRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 2.5), glassMat);
      stairRail.position.set(-0.44, 1.35, -1.1);
      stairRail.rotation.x = 0.7;
      stairGroup.add(stairRail);
      stairGroup.position.set(splitXBathKitchen - 0.6, groundTopY, D * 0.12);
      tagRoom(stairGroup, 'living');
      groundGroup.add(stairGroup);
    }

    // Ground Floor Furniture (toggled by plan.showFurniture)
    if (plan.showFurniture) {
      // Living Room L-Sofa + Coffee Table + TV + Dining
      const livingFurn = new THREE.Group();
      const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
      const sofaMain = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.48, 0.82, 2, 0.05), sofaMat);
      sofaMain.position.set(-W * 0.26, groundTopY + 0.24, D * 0.08);
      const sofaSide = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.48, 1.4, 2, 0.05), sofaMat);
      sofaSide.position.set(-W * 0.26 - 0.64, groundTopY + 0.24, D * 0.08 + 0.45);
      const coffeeTable = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.28, 0.55, 1, 0.03), woodMat);
      coffeeTable.position.set(-W * 0.22, groundTopY + 0.14, D * 0.08 + 0.92);
      const rug = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.02, 1.75),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.95 })
      );
      rug.position.set(-W * 0.25, groundTopY + 0.015, D * 0.14);

      // Dining Table & Chairs
      const diningTable = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.06, 0.85, 1, 0.02), woodMat);
      diningTable.position.set(-W * 0.28, groundTopY + 0.58, D * 0.34);
      const diningLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.56, 0.35), frameMat);
      diningLeg.position.set(-W * 0.28, groundTopY + 0.28, D * 0.34);
      livingFurn.add(rug, sofaMain, sofaSide, coffeeTable, diningTable, diningLeg);
      tagRoom(livingFurn, 'living');
      groundGroup.add(livingFurn);

      // Kitchen Counters & Island & Fridge
      const kitchenFurn = new THREE.Group();
      const counterMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45 });
      const backCounter = new THREE.Mesh(new THREE.BoxGeometry(W * 0.33, 0.68, 0.58), cabMat);
      backCounter.position.set(W * 0.31, groundTopY + 0.34, -D / 2 + 0.48);
      const backTop = new THREE.Mesh(new THREE.BoxGeometry(W * 0.34, 0.06, 0.62), counterMat);
      backTop.position.set(W * 0.31, groundTopY + 0.71, -D / 2 + 0.48);
      const island = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.68, 0.65, 1, 0.02), cabMat);
      island.position.set(W * 0.28, groundTopY + 0.34, -D * 0.25);
      const fridge = new THREE.Mesh(
        new RoundedBoxGeometry(0.65, 1.55, 0.62, 1, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 })
      );
      fridge.position.set(W / 2 - 0.48, groundTopY + 0.78, -D * 0.26);
      kitchenFurn.add(backCounter, backTop, island, fridge);
      tagRoom(kitchenFurn, 'kitchen');
      groundGroup.add(kitchenFurn);

      // Guest Bedroom Bed & Wardrobe
      const guestFurn = new THREE.Group();
      const gBed = buildBed(1.25, 1.55, 0xf472b6);
      gBed.position.set(-W * 0.27, groundTopY, -D / 2 + 1.0);
      const gWardrobe = new THREE.Mesh(new RoundedBoxGeometry(0.45, 1.65, 1.25, 1, 0.02), woodMat);
      gWardrobe.position.set(-W / 2 + 0.42, groundTopY + 0.82, -D * 0.28);
      guestFurn.add(gBed, gWardrobe);
      tagRoom(guestFurn, 'guest_bed');
      groundGroup.add(guestFurn);

      // Bath Vanity
      const bathFurn = new THREE.Group();
      const vanity = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.42),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
      );
      vanity.position.set(W * 0.025, groundTopY + 0.28, -D / 2 + 0.4);
      bathFurn.add(vanity);
      tagRoom(bathFurn, 'bath_ground');
      groundGroup.add(bathFurn);

      // Car inside Porch
      const car = buildSedanCar('#38bdf8');
      car.position.set(W * 0.3, groundTopY, D * 0.26);
      tagRoom(car, 'porch');
      groundGroup.add(car);
    }

    // ==================== 3. FIRST FLOOR (DUPLEX) ====================
    if (plan.floors === 2) {
      const firstSlab = new THREE.Mesh(
        new RoundedBoxGeometry(W + 0.3, 0.18, D + 0.35, 2, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
      );
      firstSlab.position.set(0, 2.33, 0.05);
      firstSlab.castShadow = true;
      firstSlab.receiveShadow = true;
      firstFloorGroup.add(firstSlab);

      // Upper floor interior tiled slab
      const upperFloorTiles = new THREE.Mesh(
        new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1),
        floorMat
      );
      upperFloorTiles.position.set(0, firstTopY + 0.01, 0);
      upperFloorTiles.receiveShadow = true;
      firstFloorGroup.add(upperFloorTiles);

      const upperSplitZ = D * 0.06;
      const upperRearDepth = D * 0.56;

      // Exterior walls covering Master + Bedroom 2 + Lounge rear/sides
      addWallSegment({
        parent: firstFloorGroup,
        axis: 'x',
        length: W,
        height: WH,
        thickness: WT,
        x: 0,
        y: firstTopY,
        z: -D / 2 + WT / 2,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });
      addWallSegment({
        parent: firstFloorGroup,
        axis: 'z',
        length: upperRearDepth + 0.7,
        height: WH,
        thickness: WT,
        x: -W / 2 + WT / 2,
        y: firstTopY,
        z: -D / 2 + (upperRearDepth + 0.7) / 2,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });
      addWallSegment({
        parent: firstFloorGroup,
        axis: 'z',
        length: upperRearDepth + 0.7,
        height: WH,
        thickness: WT,
        x: W / 2 - WT / 2,
        y: firstTopY,
        z: -D / 2 + (upperRearDepth + 0.7) / 2,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });

      // Front glass sliding wall separating upper rooms from open Balcony Terrace
      addWallSegment({
        parent: firstFloorGroup,
        axis: 'x',
        length: W - 0.2,
        height: WH,
        thickness: 0.1,
        x: 0,
        y: firstTopY,
        z: upperSplitZ,
        wallMat,
        frameMat,
        glassMat,
        hasWindow: true,
      });

      // Partition between Master Suite & Bedroom 2
      const upperDiv = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, WH, upperRearDepth),
        interiorWallMat
      );
      upperDiv.position.set(W * 0.04, firstTopY + WH / 2, -D / 2 + upperRearDepth / 2);
      firstFloorGroup.add(upperDiv);

      // Cantilevered Balcony Glass Guardrail along front & sides
      const frontBalconyRail = new THREE.Mesh(new THREE.BoxGeometry(W + 0.15, 0.72, 0.04), glassMat);
      frontBalconyRail.position.set(0, firstTopY + 0.36, D / 2 + 0.16);
      const leftBalconyRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, D * 0.4), glassMat);
      leftBalconyRail.position.set(-W / 2 - 0.05, firstTopY + 0.36, D * 0.3);
      const rightBalconyRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, D * 0.4), glassMat);
      rightBalconyRail.position.set(W / 2 + 0.05, firstTopY + 0.36, D * 0.3);
      firstFloorGroup.add(frontBalconyRail, leftBalconyRail, rightBalconyRail);

      // Timber decking on open Balcony
      const balconyDeck = new THREE.Mesh(
        new THREE.BoxGeometry(W - 0.1, 0.03, D * 0.38),
        woodMat
      );
      balconyDeck.position.set(0, firstTopY + 0.02, D * 0.31);
      firstFloorGroup.add(balconyDeck);

      // Hit zones for First Floor rooms
      addRoomHitZone('master_suite', -W * 0.23, firstTopY, -D * 0.22, W * 0.48, upperRearDepth * 0.9, firstFloorGroup);
      addRoomHitZone('kid_bed', W * 0.27, firstTopY, -D * 0.22, W * 0.44, upperRearDepth * 0.9, firstFloorGroup);
      addRoomHitZone('balcony', 0, firstTopY, D * 0.3, W * 0.92, D * 0.36, firstFloorGroup);

      if (plan.showFurniture) {
        // Master Bed
        const mFurn = new THREE.Group();
        const mBed = buildBed(1.48, 1.75, 0xa78bfa);
        mBed.position.set(-W * 0.23, firstTopY, -D / 2 + 1.15);
        const mWardrobe = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.7, 0.45, 1, 0.02), woodMat);
        mWardrobe.position.set(-W * 0.23, firstTopY + 0.85, upperSplitZ - 0.38);
        mFurn.add(mBed, mWardrobe);
        tagRoom(mFurn, 'master_suite');
        firstFloorGroup.add(mFurn);

        // Bedroom 2 Bed + Study Desk
        const kFurn = new THREE.Group();
        const kBed = buildBed(1.15, 1.55, 0xf472b6);
        kBed.position.set(W * 0.28, firstTopY, -D / 2 + 1.05);
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.56, 0.52), woodMat);
        desk.position.set(W * 0.28, firstTopY + 0.28, upperSplitZ - 0.4);
        kFurn.add(kBed, desk);
        tagRoom(kFurn, 'kid_bed');
        firstFloorGroup.add(kFurn);

        // Balcony Lounge Chairs & Table
        const bFurn = new THREE.Group();
        const chairMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
        [-1.1, 1.1].forEach((bx) => {
          const ch = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.42, 0.72, 2, 0.04), chairMat);
          ch.position.set(bx, firstTopY + 0.22, D * 0.32);
          bFurn.add(ch);
        });
        const bTable = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.32, 16), woodMat);
        bTable.position.set(0, firstTopY + 0.18, D * 0.32);
        bFurn.add(bTable);
        tagRoom(bFurn, 'balcony');
        firstFloorGroup.add(bFurn);
      }
    }

    // ==================== 4. ROOF LEVEL ====================
    const roofBaseY = plan.floors === 2 ? 4.6 : 2.34;
    const roofW = W + 0.55;
    const roofD = D + 0.55;

    if (plan.roofStyle === 'gable') {
      // Classic Pitched Gable Roof
      const gableShape = new THREE.Shape();
      const ridgeH = 1.65;
      gableShape.moveTo(-roofW / 2, 0);
      gableShape.lineTo(roofW / 2, 0);
      gableShape.lineTo(0, ridgeH);
      gableShape.closePath();

      const gableGeo = new THREE.ExtrudeGeometry(gableShape, {
        depth: roofD - 0.2,
        bevelEnabled: false,
      });
      const gableMesh = new THREE.Mesh(gableGeo, wallMat);
      gableMesh.position.set(0, roofBaseY, -(roofD - 0.2) / 2);
      roofGroup.add(gableMesh);

      const slopeLen = Math.hypot(roofW / 2, ridgeH) + 0.35;
      const slopeAngle = Math.atan2(ridgeH, roofW / 2);
      roofTileTex.repeat.set(3, 3);
      const slopeMat = new THREE.MeshStandardMaterial({
        map: roofTileTex,
        roughness: 0.62,
      });

      const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.1, roofD + 0.25), slopeMat);
      leftSlope.position.set(-roofW / 4 - 0.05, roofBaseY + ridgeH / 2 + 0.04, 0);
      leftSlope.rotation.z = slopeAngle;

      const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.1, roofD + 0.25), slopeMat);
      rightSlope.position.set(roofW / 4 + 0.05, roofBaseY + ridgeH / 2 + 0.04, 0);
      rightSlope.rotation.z = -slopeAngle;

      roofGroup.add(leftSlope, rightSlope);
    } else {
      // Flat Modern Roof Slab + Parapet
      const slab = new THREE.Mesh(
        new RoundedBoxGeometry(roofW, 0.18, roofD, 2, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 })
      );
      slab.position.set(0, roofBaseY, 0.05);
      roofGroup.add(slab);

      const parapetH = plan.roofStyle === 'terrace' ? 0.52 : 0.32;
      const parapetMat = wallMat;
      const frontP = new THREE.Mesh(new THREE.BoxGeometry(roofW, parapetH, 0.14), parapetMat);
      frontP.position.set(0, roofBaseY + parapetH / 2, roofD / 2 - 0.02);
      const backP = new THREE.Mesh(new THREE.BoxGeometry(roofW, parapetH, 0.14), parapetMat);
      backP.position.set(0, roofBaseY + parapetH / 2, -roofD / 2 + 0.12);
      const leftP = new THREE.Mesh(new THREE.BoxGeometry(0.14, parapetH, roofD), parapetMat);
      leftP.position.set(-roofW / 2 + 0.07, roofBaseY + parapetH / 2, 0.05);
      const rightP = new THREE.Mesh(new THREE.BoxGeometry(0.14, parapetH, roofD), parapetMat);
      rightP.position.set(roofW / 2 - 0.07, roofBaseY + parapetH / 2, 0.05);
      roofGroup.add(frontP, backP, leftP, rightP);

      if (plan.roofStyle === 'terrace') {
        // Timber Pergola & Garden Lounge on Roof
        const rDeck = new THREE.Mesh(new THREE.BoxGeometry(roofW - 0.6, 0.03, roofD - 0.6), woodMat);
        rDeck.position.set(0, roofBaseY + 0.1, 0.05);
        roofGroup.add(rDeck);

        const pPostCoords = [
          [-roofW * 0.34, -roofD * 0.3],
          [roofW * 0.25, -roofD * 0.3],
          [-roofW * 0.34, roofD * 0.18],
          [roofW * 0.25, roofD * 0.18],
        ];
        pPostCoords.forEach(([px, pz]) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), accentMat);
          post.position.set(px, roofBaseY + 0.72, pz);
          roofGroup.add(post);
        });
        for (let b = 0; b < 6; b++) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, roofD * 0.52), woodMat);
          beam.position.set(-roofW * 0.32 + b * (roofW * 0.11), roofBaseY + 1.38, -roofD * 0.06);
          roofGroup.add(beam);
        }
      } else {
        // Flat Modern Solar Panel Array + Overhead Water Tank Enclosure
        const solarMat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          metalness: 0.75,
          roughness: 0.2,
        });
        for (let s = 0; s < 3; s++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.95), solarMat);
          panel.position.set(-W * 0.16, roofBaseY + 0.2, -D * 0.2 + s * 1.15);
          panel.rotation.x = 0.18;
          roofGroup.add(panel);
        }
        const waterBox = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.85, 1.3, 1, 0.04), accentMat);
        waterBox.position.set(W * 0.28, roofBaseY + 0.5, -D * 0.26);
        roofGroup.add(waterBox);
      }
    }

    enableShadows(groundGroup, true, true);
    enableShadows(firstFloorGroup, true, true);
    enableShadows(roofGroup, true, true);
  }

  function setLightingMode(mode) {
    if (mode === 'evening') {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.016);
      hemiLight.color.setHex(0x93c5fd);
      hemiLight.groundColor.setHex(0x1e293b);
      hemiLight.intensity = 0.65;
      sunLight.color.setHex(0xfb923c);
      sunLight.position.set(16, 7, 10);
      sunLight.intensity = 1.65;
      interiorWarmLight.intensity = 4.6;
      upperWarmLight.intensity = 4.2;
    } else {
      scene.background = new THREE.Color(0xdbeafe);
      scene.fog = new THREE.FogExp2(0xdbeafe, 0.012);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x94a3b8);
      hemiLight.intensity = 1.05;
      sunLight.color.setHex(0xfffbeb);
      sunLight.position.set(14, 18, 12);
      sunLight.intensity = 2.35;
      interiorWarmLight.intensity = 1.8;
      upperWarmLight.intensity = 1.5;
    }
  }

  setLightingMode('day');

  return {
    root,
    siteGroup,
    groundGroup,
    firstFloorGroup,
    roofGroup,
    getInteractiveObjects: () => [...roomHitGroups, groundGroup, firstFloorGroup],
    rebuild,
    setLightingMode,
  };
}
