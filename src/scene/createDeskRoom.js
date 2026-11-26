import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  createDeskMatTexture,
  createMonitorScreenTexture,
  createPosterTexture,
  createWoodTexture,
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

function buildRoomShell(floorTexture) {
  const shell = new THREE.Group();

  floorTexture.repeat.set(3, 3);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.72,
    metalness: 0.08,
  });

  const floor = new THREE.Mesh(
    new RoundedBoxGeometry(5.8, 0.28, 5.4, 2, 0.06),
    floorMat
  );
  floor.position.set(0, -0.14, 0);
  floor.receiveShadow = true;
  shell.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x161b26,
    roughness: 0.85,
    metalness: 0.05,
  });

  // Back wall
  const backWall = new THREE.Mesh(
    new RoundedBoxGeometry(5.8, 3.6, 0.24, 2, 0.05),
    wallMat
  );
  backWall.position.set(0, 1.66, -2.58);
  backWall.receiveShadow = true;
  backWall.castShadow = true;
  shell.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 3.6, 5.4, 2, 0.05),
    wallMat
  );
  leftWall.position.set(-2.78, 1.66, 0);
  leftWall.receiveShadow = true;
  leftWall.castShadow = true;
  shell.add(leftWall);

  // Baseboard trim
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0f131c,
    roughness: 0.6,
  });
  const backTrim = new THREE.Mesh(new THREE.BoxGeometry(5.55, 0.12, 0.05), trimMat);
  backTrim.position.set(0.05, 0.06, -2.44);
  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 5.15), trimMat);
  leftTrim.position.set(-2.64, 0.06, 0.05);
  shell.add(backTrim, leftTrim);

  // Acoustic wood slats on back wall
  const slatMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.65,
    metalness: 0.05,
  });
  const slatGroup = new THREE.Group();
  for (let i = 0; i < 19; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.75, 0.05), slatMat);
    slat.position.set(-1.7 + i * 0.19, 1.68, -2.43);
    slat.castShadow = true;
    slat.receiveShadow = true;
    slatGroup.add(slat);
  }
  shell.add(slatGroup);

  // Floating wall shelf + under-shelf LED strip
  const shelf = new THREE.Mesh(
    new RoundedBoxGeometry(2.25, 0.07, 0.36, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x3b2b22, roughness: 0.55 })
  );
  shelf.position.set(-0.2, 2.76, -2.28);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  shell.add(shelf);

  const shelfLedMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.6,
    roughness: 0.2,
  });
  const shelfLed = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.018, 0.03), shelfLedMat);
  shelfLed.position.set(-0.2, 2.72, -2.38);
  shell.add(shelfLed);

  // Books & sculpture on shelf
  const bookColors = [0x38bdf8, 0xf472b6, 0x818cf8, 0x34d399];
  bookColors.forEach((hex, i) => {
    const book = new THREE.Mesh(
      new RoundedBoxGeometry(0.07, 0.26 + (i % 2) * 0.05, 0.22, 1, 0.01),
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 })
    );
    book.position.set(-0.98 + i * 0.085, 2.93 + (i % 2) * 0.025, -2.28);
    book.castShadow = true;
    shell.add(book);
  });

  const miniSculpture = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.11, 0),
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.75,
      roughness: 0.22,
    })
  );
  miniSculpture.position.set(0.55, 2.91, -2.26);
  miniSculpture.castShadow = true;
  shell.add(miniSculpture);

  // Framed poster on left wall
  const posterGroup = new THREE.Group();
  const frame = new THREE.Mesh(
    new RoundedBoxGeometry(0.05, 1.32, 0.96, 2, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.4 })
  );
  const artwork = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 1.2),
    new THREE.MeshStandardMaterial({
      map: createPosterTexture(),
      roughness: 0.35,
    })
  );
  artwork.rotation.y = Math.PI / 2;
  artwork.position.x = 0.028;
  posterGroup.add(frame, artwork);
  posterGroup.position.set(-2.63, 2.05, -0.55);
  shell.add(posterGroup);

  // Round studio rug under chair
  const rug = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 1.45, 0.025, 48),
    new THREE.MeshStandardMaterial({ color: 0x1e2536, roughness: 0.95 })
  );
  rug.position.set(0.05, 0.012, 1.28);
  rug.receiveShadow = true;
  shell.add(rug);

  return { shell, wallMat, shelfLedMat };
}

function buildDeskAndMat(deskWoodTexture) {
  const group = new THREE.Group();

  deskWoodTexture.repeat.set(2, 1);
  const deskTop = new THREE.Mesh(
    new RoundedBoxGeometry(4.4, 0.09, 1.72, 3, 0.03),
    new THREE.MeshStandardMaterial({
      map: deskWoodTexture,
      roughness: 0.48,
      metalness: 0.08,
    })
  );
  deskTop.position.set(0, 0.955, -0.45);
  group.add(deskTop);

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.72,
  });

  const legPositions = [
    [-2.02, 0.455, -1.16],
    [2.02, 0.455, -1.16],
    [-2.02, 0.455, 0.24],
    [2.02, 0.455, 0.24],
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.91, 0.09, 2, 0.02), legMat);
    leg.position.set(lx, ly, lz);
    group.add(leg);
  });

  // Side crossbar stabilizers
  [-2.02, 2.02].forEach((sx) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.4), legMat);
    bar.position.set(sx, 0.22, -0.46);
    group.add(bar);
  });

  // Desk mat
  const mat = new THREE.Mesh(
    new RoundedBoxGeometry(2.25, 0.014, 0.92, 2, 0.007),
    new THREE.MeshStandardMaterial({
      map: createDeskMatTexture(),
      roughness: 0.88,
      metalness: 0.05,
    })
  );
  mat.position.set(-0.15, 1.007, -0.14);
  group.add(mat);

  enableShadows(group);
  return group;
}

function buildMonitor() {
  const monitor = new THREE.Group();
  const screenTextureControl = createMonitorScreenTexture();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.75,
  });

  // Base & arm
  const standBase = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.03, 0.32, 2, 0.01), metalMat);
  standBase.position.set(0, 1.015, -0.96);

  const standNeck = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.72, 0.07, 2, 0.02), metalMat);
  standNeck.position.set(0, 1.38, -0.98);
  standNeck.rotation.x = -0.06;

  // Bezel chassis
  const bezel = new THREE.Mesh(
    new RoundedBoxGeometry(2.04, 0.9, 0.065, 3, 0.025),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.5 })
  );
  bezel.position.set(0, 1.78, -0.84);

  // Active OLED screen
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.94, 0.8),
    new THREE.MeshStandardMaterial({
      map: screenTextureControl.texture,
      emissiveMap: screenTextureControl.texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.88,
      roughness: 0.2,
    })
  );
  screen.position.set(0, 1.78, -0.805);

  // Rear RGB bias glow strip
  const biasStripMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });
  const biasStrip = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.045, 0.02, 1, 0.01), biasStripMat);
  biasStrip.position.set(0, 1.78, -0.88);

  monitor.add(standBase, standNeck, bezel, screen, biasStrip);
  tagInteractive(monitor, 'monitor');

  return { monitor, screenTextureControl, biasStripMat };
}

function buildKeyboardAndMouse() {
  const inputGroup = new THREE.Group();

  // Keyboard housing
  const kbGroup = new THREE.Group();
  const chassis = new THREE.Mesh(
    new RoundedBoxGeometry(1.02, 0.044, 0.36, 2, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.65 })
  );
  kbGroup.add(chassis);

  // RGB Underglow bar
  const rgbRim = new THREE.Mesh(
    new RoundedBoxGeometry(1.03, 0.012, 0.37, 1, 0.005),
    new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xf472b6,
      emissiveIntensity: 1.8,
    })
  );
  rgbRim.position.y = -0.014;
  kbGroup.add(rgbRim);

  // Keycaps via InstancedMesh (5 rows x 15 cols)
  const cols = 15;
  const rows = 5;
  const keyGeo = new RoundedBoxGeometry(0.052, 0.024, 0.052, 1, 0.006);
  const keyMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 });
  const keyMesh = new THREE.InstancedMesh(keyGeo, keyMat, cols * rows);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(-0.44 + c * 0.062, 0.028, -0.125 + r * 0.062);
      dummy.updateMatrix();
      keyMesh.setMatrixAt(idx, dummy.matrix);

      if (r === 0 && c === 0) {
        color.set(0xf472b6); // Accent Esc
      } else if (r === 2 && c === cols - 1) {
        color.set(0x38bdf8); // Accent Enter
      } else if (r === 4 && c >= 4 && c <= 9) {
        color.set(0x38bdf8); // Spacebar accent
      } else if (r === 0 || c === 0 || c === cols - 1) {
        color.set(0x334155); // Modifiers
      } else {
        color.set(0x94a3b8); // Alphas
      }
      keyMesh.setColorAt(idx, color);
      idx++;
    }
  }
  keyMesh.instanceMatrix.needsUpdate = true;
  if (keyMesh.instanceColor) keyMesh.instanceColor.needsUpdate = true;
  kbGroup.add(keyMesh);

  kbGroup.position.set(-0.28, 1.04, 0.02);
  kbGroup.rotation.x = 0.05;
  inputGroup.add(kbGroup);

  // Wireless ergonomic mouse
  const mouseGroup = new THREE.Group();
  const mouseBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.055, 0.24, 3, 0.028),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 })
  );
  const mouseWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.025, 16),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.5,
    })
  );
  mouseWheel.rotation.z = Math.PI / 2;
  mouseWheel.position.set(0, 0.022, -0.055);
  mouseGroup.add(mouseBody, mouseWheel);
  mouseGroup.position.set(0.55, 1.042, 0.04);
  inputGroup.add(mouseGroup);

  tagInteractive(inputGroup, 'keyboard');
  return inputGroup;
}

function buildPCTower() {
  const pc = new THREE.Group();
  const animatedFans = [];

  const caseMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.42,
    metalness: 0.65,
  });

  // Back, top, bottom, right frame enclosing the chamber
  const backPanel = new THREE.Mesh(new RoundedBoxGeometry(0.54, 1.08, 0.06, 2, 0.015), caseMat);
  backPanel.position.set(0, 0.56, -0.49);

  const rightPanel = new THREE.Mesh(new RoundedBoxGeometry(0.05, 1.08, 1.04, 2, 0.015), caseMat);
  rightPanel.position.set(0.245, 0.56, 0);

  const topPanel = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.06, 1.04, 2, 0.015), caseMat);
  topPanel.position.set(0, 1.07, 0);

  const bottomPanel = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.08, 1.04, 2, 0.015), caseMat);
  bottomPanel.position.set(0, 0.05, 0);

  // Tempered glass panel on left (-x) side
  const glassPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.96, 0.94),
    new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.24,
      roughness: 0.08,
      metalness: 0.1,
    })
  );
  glassPanel.position.set(-0.255, 0.56, 0);

  // Motherboard plate
  const mobo = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.68, 0.56),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  mobo.position.set(0.18, 0.62, -0.1);

  // CPU AIO Pump Ring
  const pumpRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 12, 28),
    new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x8b5cf6,
      emissiveIntensity: 2.2,
    })
  );
  pumpRing.rotation.y = Math.PI / 2;
  pumpRing.position.set(0.14, 0.72, -0.1);

  // GPU Block + RGB Bar
  const gpu = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.08, 0.52, 2, 0.015),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
  );
  gpu.position.set(0.06, 0.44, -0.05);

  const gpuStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.018, 0.44),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.5,
    })
  );
  gpuStrip.position.set(-0.035, 0.44, -0.05);

  // Helper to create spinning RGB fan
  function makeFan(radius = 0.11, ringColor = 0xa78bfa) {
    const fanGroup = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.014, 10, 24),
      new THREE.MeshStandardMaterial({
        color: ringColor,
        emissive: ringColor,
        emissiveIntensity: 2.0,
      })
    );
    const blades = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.2,
    });
    for (let b = 0; b < 5; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.025, radius * 1.45, 0.008), bladeMat);
      blade.rotation.z = (b * Math.PI) / 5;
      blades.add(blade);
    }
    fanGroup.add(ring, blades);
    animatedFans.push(blades);
    return fanGroup;
  }

  // Two front intake fans
  [0.34, 0.64].forEach((fy, idx) => {
    const fan = makeFan(0.115, idx === 0 ? 0x38bdf8 : 0xa78bfa);
    fan.position.set(0, fy, 0.48);
    pc.add(fan);
  });

  // One rear exhaust fan
  const rearFan = makeFan(0.1, 0xf472b6);
  rearFan.position.set(-0.02, 0.78, -0.44);
  pc.add(rearFan);

  pc.add(backPanel, rightPanel, topPanel, bottomPanel, glassPanel, mobo, pumpRing, gpu, gpuStrip);
  pc.position.set(1.72, 1.0, -0.42);
  tagInteractive(pc, 'pc');

  return { pc, animatedFans };
}

function buildDeskLamp() {
  const lampGroup = new THREE.Group();

  const matteBlack = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.42,
    metalness: 0.55,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.28,
    metalness: 0.85,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 32), matteBlack);
  base.position.set(0, 0.02, 0);

  const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 16), matteBlack);
  lowerArm.position.set(-0.06, 0.34, -0.05);
  lowerArm.rotation.z = 0.22;
  lowerArm.rotation.x = -0.15;

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), brassMat);
  joint.position.set(-0.14, 0.64, -0.1);

  const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 16), matteBlack);
  upperArm.position.set(0.05, 0.84, 0.04);
  upperArm.rotation.z = -0.78;
  upperArm.rotation.x = 0.45;

  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 28, 1, true), matteBlack);
  shade.material = matteBlack.clone();
  shade.material.side = THREE.DoubleSide;
  shade.position.set(0.24, 0.98, 0.16);
  shade.rotation.z = -0.45;
  shade.rotation.x = 0.28;

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfbbf24,
    emissiveIntensity: 2.8,
    roughness: 0.15,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), bulbMat);
  bulb.position.set(0.26, 0.92, 0.18);

  lampGroup.add(base, lowerArm, joint, upperArm, shade, bulb);
  lampGroup.position.set(-1.82, 1.0, -0.62);
  tagInteractive(lampGroup, 'lamp');

  // Actual Spotlight emitting warm tungsten glow onto desk
  const lampSpot = new THREE.SpotLight(0xffcb77, 11, 6, Math.PI / 4, 0.55, 1.4);
  lampSpot.position.set(-1.56, 1.9, -0.44);
  lampSpot.castShadow = true;
  lampSpot.shadow.mapSize.set(1024, 1024);
  lampSpot.shadow.bias = -0.0005;
  lampSpot.target.position.set(-1.05, 1.0, -0.05);

  return { lampGroup, lampSpot, bulbMat };
}

function buildSpeakers() {
  const speakersGroup = new THREE.Group();

  const cabMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    roughness: 0.52,
    metalness: 0.22,
  });
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.35,
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.5,
  });

  function makeSpeaker(x, z, rotY) {
    const sp = new THREE.Group();
    const stand = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.05, 0.26, 1, 0.01), coneMat);
    stand.position.y = 0.025;

    const cabinet = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.42, 0.26, 2, 0.02), cabMat);
    cabinet.position.y = 0.26;

    const wooferRing = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.01, 10, 28), ringMat);
    wooferRing.position.set(0, 0.21, 0.132);

    const wooferCone = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.03, 0.025, 24), coneMat);
    wooferCone.rotation.x = Math.PI / 2;
    wooferCone.position.set(0, 0.21, 0.125);

    const tweeter = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 20), coneMat);
    tweeter.rotation.x = Math.PI / 2;
    tweeter.position.set(0, 0.37, 0.128);

    sp.add(stand, cabinet, wooferRing, wooferCone, tweeter);
    sp.position.set(x, 1.0, z);
    sp.rotation.y = rotY;
    return sp;
  }

  speakersGroup.add(makeSpeaker(-1.26, -0.84, 0.28));
  speakersGroup.add(makeSpeaker(1.2, -0.84, -0.24));
  tagInteractive(speakersGroup, 'speakers');

  return speakersGroup;
}

function buildChair() {
  const chair = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.6,
  });
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x252f42,
    roughness: 0.8,
    metalness: 0.1,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });

  // 5-star base + wheels
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.04, 0.42, 1, 0.01), frameMat);
    arm.position.set(Math.sin(angle) * 0.2, 0.08, Math.cos(angle) * 0.2);
    arm.rotation.y = angle;

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 14), frameMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(angle) * 0.39, 0.035, Math.cos(angle) * 0.39);
    chair.add(arm, wheel);
  }

  // Gas cylinder
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 16), frameMat);
  cylinder.position.y = 0.3;

  // Seat cushion
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.1, 0.64, 3, 0.035), meshMat);
  seat.position.y = 0.54;

  // Backrest & lumbar accent
  const spine = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.72, 0.06, 2, 0.02), frameMat);
  spine.position.set(0, 0.88, 0.31);
  spine.rotation.x = 0.12;

  const backrest = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.74, 0.07, 3, 0.03), meshMat);
  backrest.position.set(0, 1.0, 0.28);
  backrest.rotation.x = 0.12;

  const lumbarStrip = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.04, 0.02, 1, 0.01), accentMat);
  lumbarStrip.position.set(0, 0.82, 0.325);
  lumbarStrip.rotation.x = 0.12;

  // Armrests
  [-0.38, 0.38].forEach((ax) => {
    const post = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.24, 0.05, 1, 0.01), frameMat);
    post.position.set(ax, 0.65, 0.04);
    const pad = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.035, 0.32, 2, 0.015), frameMat);
    pad.position.set(ax, 0.77, 0.02);
    chair.add(post, pad);
  });

  chair.add(cylinder, seat, spine, backrest, lumbarStrip);
  chair.position.set(0.05, 0, 1.38);
  chair.rotation.y = -0.18;
  tagInteractive(chair, 'chair');

  return chair;
}

function buildCozyAccessories() {
  const accessories = new THREE.Group();

  // Terracotta plant pot on left corner of desk
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.09, 0.18, 20),
    new THREE.MeshStandardMaterial({ color: 0xc26d48, roughness: 0.72 })
  );
  pot.position.set(-1.84, 1.09, 0.08);
  accessories.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), leafMat);
    leaf.scale.set(0.7, 1.45, 0.45);
    leaf.position.set(-1.84 + Math.cos(a) * 0.065, 1.24 + (i % 2) * 0.04, 0.08 + Math.sin(a) * 0.065);
    leaf.rotation.z = Math.cos(a) * 0.4;
    leaf.rotation.x = Math.sin(a) * 0.4;
    accessories.add(leaf);
  }

  // Coffee mug
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.05, 0.11, 20),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 })
  );
  mug.position.set(-0.98, 1.055, 0.14);
  accessories.add(mug);

  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.01, 16),
    new THREE.MeshStandardMaterial({ color: 0x3f2314, roughness: 0.2 })
  );
  coffee.position.set(-0.98, 1.106, 0.14);
  accessories.add(coffee);

  // Subtle floating steam particles above mug
  const steamGroup = new THREE.Group();
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.28,
  });
  const steamWisps = [];
  for (let s = 0; s < 5; s++) {
    const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), steamMat.clone());
    wisp.position.set(-0.98 + (s % 2 === 0 ? -0.012 : 0.012), 1.14 + s * 0.055, 0.14);
    wisp.userData.phase = s * 1.1;
    steamGroup.add(wisp);
    steamWisps.push(wisp);
  }
  accessories.add(steamGroup);

  enableShadows(accessories);
  return { accessories, steamWisps };
}

/**
 * Builds the complete isometric 3D desk setup scene and returns update & theme hooks.
 */
export function createDeskRoom(scene) {
  const root = new THREE.Group();
  scene.add(root);

  const floorTexture = createWoodTexture({
    baseColor: '#241c18',
    grainColor: '#17110e',
    highlightColor: '#312520',
    planks: 8,
  });
  const deskTexture = createWoodTexture({
    baseColor: '#5c3d2e',
    grainColor: '#3e271c',
    highlightColor: '#724c3a',
    planks: 5,
  });

  const { shell, wallMat, shelfLedMat } = buildRoomShell(floorTexture);
  const desk = buildDeskAndMat(deskTexture);
  const { monitor, screenTextureControl, biasStripMat } = buildMonitor();
  const keyboard = buildKeyboardAndMouse();
  const { pc, animatedFans } = buildPCTower();
  const { lampGroup, lampSpot, bulbMat } = buildDeskLamp();
  const speakers = buildSpeakers();
  const chair = buildChair();
  const { accessories, steamWisps } = buildCozyAccessories();

  root.add(shell, desk, monitor, keyboard, pc, lampGroup, lampSpot, lampSpot.target, speakers, chair, accessories);

  // Studio Lighting Setup
  const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e1b4b, 0.65);
  root.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xe0f2fe, 1.35);
  keyLight.position.set(5.5, 8.5, 5.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 22;
  const d = 5.5;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  root.add(keyLight);

  // RGB Monitor Backlight PointLight
  const monitorGlowLight = new THREE.PointLight(0x38bdf8, 3.8, 4.5, 1.5);
  monitorGlowLight.position.set(0, 1.85, -1.25);
  root.add(monitorGlowLight);

  // PC Tower Interior RGB Glow
  const pcGlowLight = new THREE.PointLight(0xa78bfa, 2.8, 3.5, 1.5);
  pcGlowLight.position.set(1.45, 1.55, -0.35);
  root.add(pcGlowLight);

  // Shelf warm accent light
  const shelfGlowLight = new THREE.PointLight(0xf59e0b, 1.8, 3.2, 1.6);
  shelfGlowLight.position.set(-0.2, 2.55, -2.05);
  root.add(shelfGlowLight);

  const interactiveGroups = {
    monitor,
    keyboard,
    pc,
    lamp: lampGroup,
    speakers,
    chair,
  };

  function setLightingMode(mode) {
    const isDay = mode === 'day';
    if (isDay) {
      scene.background = new THREE.Color(0xe6dfd5);
      scene.fog = new THREE.FogExp2(0xe6dfd5, 0.025);
      wallMat.color.setHex(0xd8cfc4);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0xb8aea2);
      hemiLight.intensity = 1.15;
      keyLight.color.setHex(0xfff7ed);
      keyLight.intensity = 2.1;
      monitorGlowLight.intensity = 1.6;
      pcGlowLight.intensity = 1.3;
      shelfGlowLight.intensity = 0.9;
      shelfLedMat.emissiveIntensity = 0.8;
      biasStripMat.emissiveIntensity = 1.3;
    } else {
      scene.background = new THREE.Color(0x070a13);
      scene.fog = new THREE.FogExp2(0x070a13, 0.032);
      wallMat.color.setHex(0x161b26);
      hemiLight.color.setHex(0x93c5fd);
      hemiLight.groundColor.setHex(0x1e1b4b);
      hemiLight.intensity = 0.65;
      keyLight.color.setHex(0xe0f2fe);
      keyLight.intensity = 1.35;
      monitorGlowLight.intensity = 3.8;
      pcGlowLight.intensity = 2.8;
      shelfGlowLight.intensity = 1.8;
      shelfLedMat.emissiveIntensity = 1.6;
      biasStripMat.emissiveIntensity = 2.2;
    }
  }

  function update(elapsed, delta) {
    // Spin PC fans smoothly
    for (const blades of animatedFans) {
      blades.rotation.z -= delta * 7.5;
    }

    // Animate mug steam wisps
    for (const wisp of steamWisps) {
      const cycle = ((elapsed * 0.45 + wisp.userData.phase) % 1);
      wisp.position.y = 1.13 + cycle * 0.28;
      wisp.position.x = -0.98 + Math.sin(elapsed * 2.2 + wisp.userData.phase) * 0.018;
      wisp.scale.setScalar(0.6 + cycle * 0.8);
      wisp.material.opacity = (1 - cycle) * 0.28;
    }

    // Refresh animated monitor display ~30fps equivalent efficiently
    if (Math.floor(elapsed * 24) !== Math.floor((elapsed - delta) * 24)) {
      screenTextureControl.update(elapsed);
    }
  }

  setLightingMode('night');

  return {
    root,
    interactiveGroups,
    lampSpot,
    bulbMat,
    setLightingMode,
    update,
  };
}
