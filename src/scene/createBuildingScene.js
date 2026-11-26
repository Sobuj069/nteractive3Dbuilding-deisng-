import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  createArchitecturalStoneTexture,
  createFacadeGlassTexture,
  createTimberDeckTexture,
  createWaterTexture,
} from './textures.js';

function tagInteractive(root, hotspotId) {
  root.userData.hotspotId = hotspotId;
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.userData.hotspotId = hotspotId;
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

function enableShadows(root, cast = true, receive = true) {
  root.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = cast;
      obj.receiveShadow = receive;
    }
  });
}

function buildPlaza(stoneTex, waterTex) {
  const plaza = new THREE.Group();

  // Base site plinth
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    roughness: 0.78,
    metalness: 0.12,
  });
  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(11.8, 0.46, 11.8, 2, 0.08),
    plinthMat
  );
  plinth.position.set(0, -0.23, 0);
  plinth.receiveShadow = true;
  plaza.add(plinth);

  // Travertine podium deck
  stoneTex.repeat.set(4, 4);
  const podiumMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    color: 0xe7e2d8,
    roughness: 0.68,
    metalness: 0.05,
  });
  const podium = new THREE.Mesh(
    new RoundedBoxGeometry(9.2, 0.24, 9.2, 2, 0.05),
    podiumMat
  );
  podium.position.set(0, 0.12, 0.35);
  podium.receiveShadow = true;
  podium.castShadow = true;
  plaza.add(podium);

  // Reflecting pool basin + animated water surface
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.2 });
  const poolCurb = new THREE.Mesh(
    new RoundedBoxGeometry(3.6, 0.12, 4.3, 2, 0.02),
    curbMat
  );
  poolCurb.position.set(2.45, 0.25, 2.35);
  plaza.add(poolCurb);

  const waterSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(3.34, 4.02),
    new THREE.MeshStandardMaterial({
      map: waterTex.texture,
      emissiveMap: waterTex.texture,
      emissive: new THREE.Color(0x0ea5e9),
      emissiveIntensity: 0.28,
      roughness: 0.12,
      metalness: 0.45,
    })
  );
  waterSurface.rotation.x = -Math.PI / 2;
  waterSurface.position.set(2.45, 0.315, 2.35);
  plaza.add(waterSurface);

  // Stepping stone walkway + architectural bollards
  const stepMat = new THREE.MeshStandardMaterial({ color: 0xf1ede6, roughness: 0.55 });
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.05, 0.56, 1, 0.015), stepMat);
    step.position.set(0, 0.25, 2.55 + i * 0.72);
    plaza.add(step);
  }

  const bollardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 });
  const bollardGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
  });

  [-1.25, 1.25].forEach((bx) => {
    [2.7, 3.65, 4.6].forEach((bz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.46, 12), bollardMat);
      post.position.set(bx, 0.47, bz);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.08, 12), bollardGlowMat);
      cap.position.set(bx, 0.66, bz);
      plaza.add(post, cap);
    });
  });

  // Minimalist sculpted architectural trees
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f6f4e, roughness: 0.68 });
  const treePositions = [
    [-3.55, 0.24, 3.65],
    [-3.65, 0.24, 1.55],
    [-3.45, 0.24, -2.55],
    [3.85, 0.24, -2.65],
  ];

  treePositions.forEach(([tx, ty, tz], idx) => {
    const planter = new THREE.Mesh(
      new RoundedBoxGeometry(0.92, 0.24, 0.92, 2, 0.03),
      curbMat
    );
    planter.position.set(tx, ty + 0.12, tz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.85, 10), trunkMat);
    trunk.position.set(tx, ty + 0.66, tz);

    const canopy1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.56 + (idx % 2) * 0.08, 1), foliageMat);
    canopy1.position.set(tx, ty + 1.25, tz);

    const canopy2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), foliageMat);
    canopy2.position.set(tx + 0.22, ty + 1.05, tz - 0.16);

    plaza.add(planter, trunk, canopy1, canopy2);
  });

  tagInteractive(plaza, 'plaza');
  return { plaza, bollardGlowMat, waterSurface };
}

function buildLobby(stoneTex, timberTex) {
  const lobby = new THREE.Group();

  // Glass atrium shell
  const lobbyGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.36,
    roughness: 0.08,
    metalness: 0.12,
    transmission: 0.25,
  });
  const atrium = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.92, 4.2), lobbyGlassMat);
  atrium.position.set(0, 1.2, 0.05);
  lobby.add(atrium);

  // Warm illuminated interior reception core
  const lobbyInteriorMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.5,
  });
  const warmCore = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.68, 2.2, 2, 0.05), lobbyInteriorMat);
  warmCore.position.set(0, 1.12, -0.2);
  lobby.add(warmCore);

  // Perimeter structural brushed steel columns
  const colMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.28 });
  const colCoords = [
    [-2.42, 2.1],
    [-0.95, 2.1],
    [0.95, 2.1],
    [2.42, 2.1],
    [-2.42, -2.0],
    [2.42, -2.0],
  ];
  colCoords.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 1.98, 14), colMat);
    col.position.set(cx, 1.22, cz);
    lobby.add(col);
  });

  // Cantilevered entry canopy with oak wood soffit & LED rim
  const canopy = new THREE.Mesh(
    new RoundedBoxGeometry(4.8, 0.16, 2.1, 2, 0.03),
    new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xe2e8f0, roughness: 0.55 })
  );
  canopy.position.set(0, 2.12, 2.48);

  const canopySoffit = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.03, 1.85),
    new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.6 })
  );
  canopySoffit.position.set(0, 2.03, 2.46);

  const canopyLedMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.8,
  });
  const canopyLed = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.025, 0.04), canopyLedMat);
  canopyLed.position.set(0, 2.08, 3.52);

  lobby.add(canopy, canopySoffit, canopyLed);
  tagInteractive(lobby, 'lobby');
  return { lobby, lobbyInteriorMat, canopyLedMat };
}

function buildSuites(stoneTex, timberTex, facadeMat) {
  const suites = new THREE.Group();

  const slabMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    color: 0xf1efe9,
    roughness: 0.58,
    metalness: 0.06,
  });
  const soffitMat = new THREE.MeshStandardMaterial({
    map: timberTex,
    roughness: 0.6,
  });
  const railMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.32,
    roughness: 0.1,
    metalness: 0.1,
  });
  const edgeLedMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.15,
  });

  const floorHeight = 0.7;
  const startY = 2.24;

  for (let i = 0; i < 5; i++) {
    const floorGroup = new THREE.Group();
    const y = startY + i * floorHeight;

    // Sculptural cantilevered horizontal shifts per level
    const ox = Math.sin(i * 1.15) * 0.42;
    const oz = Math.cos(i * 0.9) * 0.32;

    const slab = new THREE.Mesh(new RoundedBoxGeometry(5.15, 0.13, 4.35, 2, 0.03), slabMat);
    slab.position.set(ox, y, oz);

    const soffit = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.02, 4.1), soffitMat);
    soffit.position.set(ox, y - 0.07, oz);

    const glassCore = new THREE.Mesh(
      new RoundedBoxGeometry(4.15, floorHeight - 0.13, 3.45, 1, 0.02),
      facadeMat
    );
    glassCore.position.set(ox * 0.55, y + floorHeight * 0.5, oz * 0.55);

    // Front & side glass balcony guardrails
    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(5.05, 0.22, 0.03), railMat);
    frontRail.position.set(ox, y + 0.17, oz + 2.14);

    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 4.25), railMat);
    leftRail.position.set(ox - 2.54, y + 0.17, oz);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 4.25), railMat);
    rightRail.position.set(ox + 2.54, y + 0.17, oz);

    floorGroup.add(slab, soffit, glassCore, frontRail, leftRail, rightRail);

    if (i % 2 === 1) {
      const accentStrip = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.02, 0.03), edgeLedMat);
      accentStrip.position.set(ox, y - 0.04, oz + 2.17);
      floorGroup.add(accentStrip);
    }

    suites.add(floorGroup);
  }

  tagInteractive(suites, 'suites');
  return { suites, edgeLedMat };
}

function buildSkyDeck(stoneTex, timberTex, waterTex) {
  const skydeck = new THREE.Group();
  const baseY = 5.74;

  // Main terrace structural slab
  const deckSlab = new THREE.Mesh(
    new RoundedBoxGeometry(5.9, 0.18, 4.85, 2, 0.04),
    new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xebe7df, roughness: 0.58 })
  );
  deckSlab.position.set(0.18, baseY, 0.12);
  skydeck.add(deckSlab);

  // Teak timber terrace surface
  timberTex.repeat.set(3, 3);
  const timberTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.03, 4.35),
    new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.65 })
  );
  timberTop.position.set(-0.9, baseY + 0.1, 0.12);
  skydeck.add(timberTop);

  // Cantilevered Infinity Pool on right side of Level 8
  const poolShell = new THREE.Mesh(
    new RoundedBoxGeometry(2.35, 0.28, 3.6, 2, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.35 })
  );
  poolShell.position.set(1.92, baseY + 0.08, 0.2);

  const poolWater = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 3.35),
    new THREE.MeshStandardMaterial({
      map: waterTex.texture,
      emissiveMap: waterTex.texture,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.45,
      roughness: 0.1,
      metalness: 0.4,
    })
  );
  poolWater.rotation.x = -Math.PI / 2;
  poolWater.position.set(1.92, baseY + 0.23, 0.2);

  const poolGlassEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.32, 3.55),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
    })
  );
  poolGlassEdge.position.set(3.08, baseY + 0.12, 0.2);

  skydeck.add(poolShell, poolWater, poolGlassEdge);

  // Architectural Steel & Timber Pergola Canopy
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.72, roughness: 0.3 });
  const postCoords = [
    [-2.45, -1.75],
    [0.55, -1.75],
    [-2.45, 1.85],
    [0.55, 1.85],
  ];
  postCoords.forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 0.08), steelMat);
    post.position.set(px, baseY + 0.66, pz);
    skydeck.add(post);
  });

  // Perimeter pergola beams + 7 louvers
  [-1.75, 1.85].forEach((bz) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.08, 0.08), steelMat);
    beam.position.set(-0.95, baseY + 1.24, bz);
    skydeck.add(beam);
  });

  const louverMat = new THREE.MeshStandardMaterial({ color: 0x9a6440, roughness: 0.55 });
  for (let l = 0; l < 7; l++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 3.65), louverMat);
    louver.position.set(-2.25 + l * 0.43, baseY + 1.25, 0.05);
    skydeck.add(louver);
  }

  // Lounge daybeds
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
  [-0.35, 0.55].forEach((lz) => {
    const bed = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.14, 0.52, 2, 0.03), cushionMat);
    bed.position.set(-1.15, baseY + 0.19, lz);
    skydeck.add(bed);
  });

  // Perimeter glass railing
  const railMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.32,
    roughness: 0.08,
  });
  const frontRail = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.26, 0.03), railMat);
  frontRail.position.set(0.18, baseY + 0.22, 2.52);
  skydeck.add(frontRail);

  tagInteractive(skydeck, 'skydeck');
  return skydeck;
}

function buildPenthouse(stoneTex, timberTex, facadeMat) {
  const penthouse = new THREE.Group();
  const baseY = 6.95;

  // Penthouse lower base slab
  const baseSlab = new THREE.Mesh(
    new RoundedBoxGeometry(4.4, 0.18, 3.75, 2, 0.04),
    new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xf1efe9, roughness: 0.55 })
  );
  baseSlab.position.set(-0.2, baseY, -0.1);
  penthouse.add(baseSlab);

  // Two-level luxury glass penthouse pavilion
  const pavilion = new THREE.Mesh(
    new RoundedBoxGeometry(3.75, 1.56, 3.05, 2, 0.04),
    facadeMat
  );
  pavilion.position.set(-0.2, baseY + 0.85, -0.1);
  penthouse.add(pavilion);

  // Diagonal exterior steel diagrid accents
  const diagMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.25 });
  [-1.72, 1.32].forEach((dx) => {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.66, 0.1), diagMat);
    strut.position.set(dx, baseY + 0.86, 1.44);
    strut.rotation.z = dx < 0 ? -0.12 : 0.12;
    penthouse.add(strut);
  });

  // Sculptural angled Solar Roof Canopy
  const roofGroup = new THREE.Group();
  const roofSlab = new THREE.Mesh(
    new RoundedBoxGeometry(4.85, 0.16, 4.05, 2, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.38, metalness: 0.65 })
  );
  const roofSoffit = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.03, 3.8),
    new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.58 })
  );
  roofSoffit.position.y = -0.09;

  // BIPV Solar Panels on top
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x172554,
    roughness: 0.18,
    metalness: 0.82,
  });
  for (let row = 0; row < 3; row++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.15, 0.025, 0.95), solarMat);
    panel.position.set(0, 0.095, -1.18 + row * 1.18);
    roofGroup.add(panel);
  }

  // Illuminated Crown LED Halo
  const crownLedMat = new THREE.MeshStandardMaterial({
    color: 0xc4b5fd,
    emissive: 0x8b5cf6,
    emissiveIntensity: 2.3,
    roughness: 0.2,
  });
  const crownHalo = new THREE.Mesh(new THREE.BoxGeometry(4.88, 0.045, 4.08), crownLedMat);
  crownHalo.position.y = -0.01;

  roofGroup.add(roofSlab, roofSoffit, crownHalo);
  roofGroup.position.set(-0.2, baseY + 1.72, -0.1);
  roofGroup.rotation.z = -0.06;
  roofGroup.rotation.x = 0.04;
  penthouse.add(roofGroup);

  // Architectural Rooftop Spire + Pulsing Beacon
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.075, 1.35, 12), diagMat);
  spire.position.set(-0.4, baseY + 2.45, -0.25);

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xec4899,
    emissiveIntensity: 3.0,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), beaconMat);
  beacon.position.set(-0.4, baseY + 3.12, -0.25);

  penthouse.add(spire, beacon);
  tagInteractive(penthouse, 'penthouse');
  return { penthouse, crownLedMat, beaconMat };
}

function buildCoreAndFins(stoneTex) {
  const core = new THREE.Group();

  // Central high-strength concrete elevator spine rising through all levels
  const spine = new THREE.Mesh(
    new RoundedBoxGeometry(1.75, 7.35, 1.65, 2, 0.04),
    new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: 0x475569,
      roughness: 0.75,
      metalness: 0.15,
    })
  );
  spine.position.set(-0.15, 3.92, -0.35);
  core.add(spine);

  // Vertical anodized bronze architectural shading fins on left & rear facades
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x926843,
    roughness: 0.34,
    metalness: 0.78,
  });

  // Left side vertical fins
  for (let i = 0; i < 6; i++) {
    const fin = new THREE.Mesh(new RoundedBoxGeometry(0.28, 6.2, 0.06, 1, 0.01), finMat);
    fin.position.set(-2.55, 4.15, -1.45 + i * 0.56);
    core.add(fin);
  }

  // Rear vertical fins
  for (let i = 0; i < 6; i++) {
    const fin = new THREE.Mesh(new RoundedBoxGeometry(0.06, 6.6, 0.28, 1, 0.01), finMat);
    fin.position.set(-1.65 + i * 0.62, 4.35, -2.25);
    core.add(fin);
  }

  tagInteractive(core, 'core');
  return core;
}

/**
 * Builds the complete animated 3D architectural building showcase.
 */
export function createBuildingScene(scene) {
  const root = new THREE.Group();
  scene.add(root);

  const stoneTex = createArchitecturalStoneTexture();
  const timberTex = createTimberDeckTexture();
  const waterTex = createWaterTexture();
  const dayGlassTex = createFacadeGlassTexture({ isNight: false });
  const nightGlassTex = createFacadeGlassTexture({ isNight: true });

  const facadeMat = new THREE.MeshPhysicalMaterial({
    map: dayGlassTex,
    emissiveMap: nightGlassTex,
    emissive: new THREE.Color(0xfde68a),
    emissiveIntensity: 0.15,
    roughness: 0.12,
    metalness: 0.35,
    clearcoat: 0.8,
  });

  // Subtle architectural site grid around the plaza
  const grid = new THREE.GridHelper(34, 34, 0x38bdf8, 0x1e293b);
  grid.position.y = -0.45;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  root.add(grid);

  const { plaza, bollardGlowMat } = buildPlaza(stoneTex, waterTex);
  const { lobby, lobbyInteriorMat, canopyLedMat } = buildLobby(stoneTex, timberTex);
  const { suites, edgeLedMat } = buildSuites(stoneTex, timberTex, facadeMat);
  const core = buildCoreAndFins(stoneTex);
  const skydeck = buildSkyDeck(stoneTex, timberTex, waterTex);
  const { penthouse, crownLedMat, beaconMat } = buildPenthouse(stoneTex, timberTex, facadeMat);

  root.add(plaza, core, lobby, suites, skydeck, penthouse);

  // Subtle floating atmospheric light motes
  const particleCount = 45;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 18;
    particlePositions[i * 3 + 1] = 0.6 + Math.random() * 10.5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.085,
    transparent: true,
    opacity: 0.45,
  });
  const dustMotes = new THREE.Points(particleGeo, particleMat);
  root.add(dustMotes);

  // Studio / Sky Lighting Setup
  const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
  root.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
  sunLight.position.set(11, 16, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 42;
  const d = 10.5;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  root.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.75);
  rimLight.position.set(-10, 8, -10);
  root.add(rimLight);

  // Warm interior lobby point light
  const lobbyPointLight = new THREE.PointLight(0xfbbf24, 4.2, 8, 1.5);
  lobbyPointLight.position.set(0, 1.35, 0.6);
  root.add(lobbyPointLight);

  // Sky pool turquoise bounce light
  const poolPointLight = new THREE.PointLight(0x38bdf8, 2.5, 5.5, 1.5);
  poolPointLight.position.set(2.1, 6.45, 0.3);
  root.add(poolPointLight);

  const tierGroups = { plaza, lobby, suites, skydeck, penthouse };
  const interactiveGroups = { plaza, lobby, suites, skydeck, penthouse, core };

  function setTimeOfDay(mode) {
    if (mode === 'day') {
      scene.background = new THREE.Color(0xdbe7f3);
      scene.fog = new THREE.FogExp2(0xdbe7f3, 0.015);
      grid.material.opacity = 0.14;
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x94a3b8);
      hemiLight.intensity = 1.1;
      sunLight.color.setHex(0xfffbeb);
      sunLight.position.set(11, 16, 10);
      sunLight.intensity = 2.45;
      rimLight.color.setHex(0x93c5fd);
      rimLight.intensity = 0.65;
      facadeMat.map = dayGlassTex;
      facadeMat.emissiveIntensity = 0.08;
      facadeMat.needsUpdate = true;
      lobbyInteriorMat.emissiveIntensity = 0.25;
      canopyLedMat.emissiveIntensity = 0.6;
      edgeLedMat.emissiveIntensity = 0.3;
      crownLedMat.emissiveIntensity = 0.75;
      bollardGlowMat.emissiveIntensity = 0.5;
      lobbyPointLight.intensity = 1.5;
      poolPointLight.intensity = 0.8;
      particleMat.opacity = 0.18;
    } else if (mode === 'sunset') {
      scene.background = new THREE.Color(0x281b2d);
      scene.fog = new THREE.FogExp2(0x281b2d, 0.019);
      grid.material.opacity = 0.2;
      hemiLight.color.setHex(0xfdba74);
      hemiLight.groundColor.setHex(0x312e81);
      hemiLight.intensity = 0.85;
      sunLight.color.setHex(0xfb923c);
      sunLight.position.set(14, 5.5, 7);
      sunLight.intensity = 2.15;
      rimLight.color.setHex(0xc084fc);
      rimLight.intensity = 0.9;
      facadeMat.map = nightGlassTex;
      facadeMat.emissiveIntensity = 0.72;
      facadeMat.needsUpdate = true;
      lobbyInteriorMat.emissiveIntensity = 0.9;
      canopyLedMat.emissiveIntensity = 1.8;
      edgeLedMat.emissiveIntensity = 1.25;
      crownLedMat.emissiveIntensity = 2.1;
      bollardGlowMat.emissiveIntensity = 1.9;
      lobbyPointLight.intensity = 4.0;
      poolPointLight.intensity = 2.4;
      particleMat.opacity = 0.35;
    } else {
      // Night Skyline
      scene.background = new THREE.Color(0x060a14);
      scene.fog = new THREE.FogExp2(0x060a14, 0.022);
      grid.material.opacity = 0.24;
      hemiLight.color.setHex(0x60a5fa);
      hemiLight.groundColor.setHex(0x0f172a);
      hemiLight.intensity = 0.58;
      sunLight.color.setHex(0x93c5fd);
      sunLight.position.set(9, 14, 11);
      sunLight.intensity = 1.05;
      rimLight.color.setHex(0x818cf8);
      rimLight.intensity = 0.95;
      facadeMat.map = nightGlassTex;
      facadeMat.emissiveIntensity = 0.92;
      facadeMat.needsUpdate = true;
      lobbyInteriorMat.emissiveIntensity = 1.15;
      canopyLedMat.emissiveIntensity = 2.2;
      edgeLedMat.emissiveIntensity = 1.5;
      crownLedMat.emissiveIntensity = 2.6;
      bollardGlowMat.emissiveIntensity = 2.4;
      lobbyPointLight.intensity = 4.8;
      poolPointLight.intensity = 3.2;
      particleMat.opacity = 0.45;
    }
  }

  function update(elapsed, delta) {
    // Subtle shimmering infinity & reflecting water
    if (Math.floor(elapsed * 20) !== Math.floor((elapsed - delta) * 20)) {
      waterTex.update(elapsed);
    }

    // Gentle rooftop aviation beacon pulse
    beaconMat.emissiveIntensity = 1.4 + Math.abs(Math.sin(elapsed * 2.6)) * 2.8;

    // Slow ambient rotation of floating atmospheric light motes
    dustMotes.rotation.y = elapsed * 0.035;
  }

  setTimeOfDay('sunset');

  return {
    root,
    tierGroups,
    interactiveGroups,
    setTimeOfDay,
    update,
  };
}
