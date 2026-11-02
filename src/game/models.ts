import * as THREE from 'three';

// Shared materials cache to minimize draw calls and shader recompilation
export class ModelFactory {
  private static pbrMaterials: Record<string, THREE.Material> = {};

  public static getMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
    if (!this.pbrMaterials[key]) {
      this.pbrMaterials[key] = createFn();
    }
    return this.pbrMaterials[key];
  }

  // Procedural Hazard Stripe Texture
  public static createHazardTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f59e0b'; // Amber yellow
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#0f172a'; // Dark slate
    ctx.beginPath();
    for (let i = -128; i < 256; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 16 + 128, 128);
      ctx.lineTo(i + 128, 128);
    }
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 1. Hero Cyber Runner (Multi-part rigged group with 12 distinct components)
  public static createRunner(): {
    root: THREE.Group;
    spine: THREE.Group;
    head: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    shieldMesh: THREE.Mesh;
    magnetRing: THREE.Mesh;
    hoverboard: THREE.Group;
  } {
    const root = new THREE.Group();
    root.name = 'Runner';

    // Materials with varied roughness and metalness
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate tech fabric
      roughness: 0.7,
      metalness: 0.1,
    });

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant crimson armor plates
      roughness: 0.35,
      metalness: 0.8,
    });

    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5ff, // Cyber cyan visor
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0099cc,
      emissiveIntensity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const glowNeonMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.5,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Spine & Torso Group (Pivoted at hip height = 0.95m)
    const spine = new THREE.Group();
    spine.position.y = 0.95;
    root.add(spine);

    // Torso Base
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.55, 0.3);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 0.28;
    torso.castShadow = true;
    spine.add(torso);

    // Chestplate Armor
    const chestGeo = new THREE.BoxGeometry(0.52, 0.32, 0.12);
    const chest = new THREE.Mesh(chestGeo, armorMat);
    chest.position.set(0, 0.34, 0.12);
    chest.castShadow = true;
    spine.add(chest);

    // Cyber Reactor Core
    const coreGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, glowNeonMat);
    core.position.set(0, 0.34, 0.19);
    spine.add(core);

    // Jetpack / Backpack
    const packGeo = new THREE.BoxGeometry(0.36, 0.42, 0.18);
    const backpack = new THREE.Mesh(packGeo, armorMat);
    backpack.position.set(0, 0.32, -0.2);
    backpack.castShadow = true;
    spine.add(backpack);

    // Dual Thruster Nozzles
    const nozzleGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.12, 12);
    const nozzleL = new THREE.Mesh(nozzleGeo, glowNeonMat);
    nozzleL.position.set(-0.11, 0.1, -0.2);
    const nozzleR = new THREE.Mesh(nozzleGeo, glowNeonMat);
    nozzleR.position.set(0.11, 0.1, -0.2);
    spine.add(nozzleL, nozzleR);

    // Head Group (Pivoted at neck)
    const head = new THREE.Group();
    head.position.set(0, 0.6, 0);
    spine.add(head);

    // Helmet
    const helmetGeo = new THREE.SphereGeometry(0.2, 16, 16);
    helmetGeo.scale(1, 1.15, 1.05);
    const helmet = new THREE.Mesh(helmetGeo, suitMat);
    helmet.position.y = 0.18;
    helmet.castShadow = true;
    head.add(helmet);

    // Curved Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.14, 0.14);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.2, 0.14);
    head.add(visor);

    // Left Arm (Pivoted at shoulder)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.32, 0.5, 0);
    spine.add(leftArm);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), suitMat);
    armL.position.y = -0.22;
    armL.castShadow = true;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armorMat);
    handL.position.y = -0.48;
    leftArm.add(armL, handL);

    // Right Arm (Pivoted at shoulder)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.32, 0.5, 0);
    spine.add(rightArm);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), suitMat);
    armR.position.y = -0.22;
    armR.castShadow = true;
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armorMat);
    handR.position.y = -0.48;
    rightArm.add(armR, handR);

    // Left Leg (Pivoted at hip)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.16, 0.95, 0);
    root.add(leftLeg);
    const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), armorMat);
    thighL.position.y = -0.25;
    thighL.castShadow = true;
    const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), suitMat);
    shinL.position.y = -0.65;
    shinL.castShadow = true;
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28), shoeMat);
    footL.position.set(0, -0.9, 0.06);
    footL.castShadow = true;
    const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.29), glowNeonMat);
    soleL.position.set(0, -0.96, 0.06);
    leftLeg.add(thighL, shinL, footL, soleL);

    // Right Leg (Pivoted at hip)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.16, 0.95, 0);
    root.add(rightLeg);
    const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), armorMat);
    thighR.position.y = -0.25;
    thighR.castShadow = true;
    const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), suitMat);
    shinR.position.y = -0.65;
    shinR.castShadow = true;
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28), shoeMat);
    footR.position.set(0, -0.9, 0.06);
    footR.castShadow = true;
    const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.29), glowNeonMat);
    soleR.position.set(0, -0.96, 0.06);
    rightLeg.add(thighR, shinR, footR, soleR);

    // Shield Dome Mesh (Initially hidden)
    const shieldGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald green
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
      depthWrite: false,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 0.9;
    shieldMesh.visible = false;
    root.add(shieldMesh);

    // Magnet Torus Field (Initially hidden)
    const magnetGeo = new THREE.TorusGeometry(0.8, 0.04, 12, 32);
    const magnetMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const magnetRing = new THREE.Mesh(magnetGeo, magnetMat);
    magnetRing.rotation.x = Math.PI / 2;
    magnetRing.position.y = 0.9;
    magnetRing.visible = false;
    root.add(magnetRing);

    // Cyber Hoverboard (Toggled during rocket / hover mode)
    const hoverboard = new THREE.Group();
    hoverboard.position.y = 0.08;
    const deckGeo = new THREE.BoxGeometry(0.65, 0.08, 1.4);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.4,
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.castShadow = true;
    const hoverGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.02, 1.3),
      glowNeonMat
    );
    hoverGlow.position.y = -0.05;
    hoverboard.add(deck, hoverGlow);
    hoverboard.visible = false;
    root.add(hoverboard);

    return {
      root,
      spine,
      head,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      shieldMesh,
      magnetRing,
      hoverboard,
    };
  }

  // 2. High-Speed MagLev Subway Train (3-12 parts)
  public static createTrain(length = 26): THREE.Group {
    const train = new THREE.Group();
    train.name = 'MagLevTrain';

    const trainBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan/blue train
      roughness: 0.3,
      metalness: 0.7,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.4,
    });

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });

    const hazardMat = new THREE.MeshStandardMaterial({
      map: this.createHazardTexture(),
      roughness: 0.5,
    });

    const width = 2.4;
    const height = 2.8;

    // Main Car Body
    const bodyGeo = new THREE.BoxGeometry(width, height, length);
    const body = new THREE.Mesh(bodyGeo, trainBodyMat);
    body.position.set(0, height / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    train.add(body);

    // Nose Wedge (front facing towards +Z)
    const noseGeo = new THREE.BoxGeometry(width * 0.98, height * 0.92, 2.5);
    const nose = new THREE.Mesh(noseGeo, darkTrimMat);
    nose.position.set(0, height / 2 - 0.1, length / 2 + 1.25);
    nose.castShadow = true;
    train.add(nose);

    // Front Bumper / Hazard Stripe
    const bumperGeo = new THREE.BoxGeometry(width * 1.02, 0.6, 0.4);
    const bumper = new THREE.Mesh(bumperGeo, hazardMat);
    bumper.position.set(0, 0.4, length / 2 + 2.5);
    train.add(bumper);

    // Dual High-Beam Headlights
    const hlGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
    hlGeo.rotateX(Math.PI / 2);
    const hlL = new THREE.Mesh(hlGeo, headlightMat);
    hlL.position.set(-0.7, 1.2, length / 2 + 2.55);
    const hlR = new THREE.Mesh(hlGeo, headlightMat);
    hlR.position.set(0.7, 1.2, length / 2 + 2.55);
    train.add(hlL, hlR);

    // Rooftop Walkway (so player can run smoothly on top!)
    const roofWalkway = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.75, 0.12, length + 2),
      darkTrimMat
    );
    roofWalkway.position.set(0, height + 0.06, 0);
    roofWalkway.receiveShadow = true;
    train.add(roofWalkway);

    // Side Windows Glow Stripes
    const windowStripGeo = new THREE.BoxGeometry(width + 0.05, 0.6, length * 0.85);
    const windows = new THREE.Mesh(windowStripGeo, windowMat);
    windows.position.set(0, height * 0.65, 0);
    train.add(windows);

    // Rear Entrance Ramp (helps jump up onto train roof from behind)
    const rampGeo = new THREE.BoxGeometry(width * 0.8, 0.8, 2.2);
    rampGeo.rotateX(-0.35);
    const ramp = new THREE.Mesh(rampGeo, darkTrimMat);
    ramp.position.set(0, height * 0.7, -length / 2 - 0.8);
    train.add(ramp);

    // Levitation Ground Glow Underneath
    const glowGeo = new THREE.PlaneGeometry(width * 0.9, length * 0.9);
    glowGeo.rotateX(-Math.PI / 2);
    const levMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const levGlow = new THREE.Mesh(glowGeo, levMat);
    levGlow.position.y = 0.04;
    train.add(levGlow);

    return train;
  }

  // 3. High Laser Barricade (Slide Underneath Required)
  public static createHighLaserBarricade(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'HighLaserBarricade';

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.3,
    });

    const hazardMat = new THREE.MeshStandardMaterial({
      map: this.createHazardTexture(),
      roughness: 0.5,
    });

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.8,
    });

    // Left and Right support posts
    const postGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
    const postL = new THREE.Mesh(postGeo, pillarMat);
    postL.position.set(-1.4, 1.6, 0);
    postL.castShadow = true;
    const postR = new THREE.Mesh(postGeo, pillarMat);
    postR.position.set(1.4, 1.6, 0);
    postR.castShadow = true;
    group.add(postL, postR);

    // Overhead Heavy Beam (at height 2.2m to 2.8m)
    const beamGeo = new THREE.BoxGeometry(3.1, 0.6, 0.45);
    const beam = new THREE.Mesh(beamGeo, hazardMat);
    beam.position.set(0, 2.5, 0);
    beam.castShadow = true;
    group.add(beam);

    // Pulsing Laser Curtain (from height 1.0m to 2.2m — leaving 1.0m gap at bottom to slide!)
    const laserGeo = new THREE.PlaneGeometry(2.7, 1.2);
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0, 1.6, 0);
    group.add(laser);

    // Warning Beacons on Top
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0xff0033,
      emissiveIntensity: 1.2,
    });
    const beaconL = new THREE.Mesh(beaconGeo, beaconMat);
    beaconL.position.set(-1.2, 2.9, 0);
    const beaconR = new THREE.Mesh(beaconGeo, beaconMat);
    beaconR.position.set(1.2, 2.9, 0);
    group.add(beaconL, beaconR);

    return group;
  }

  // 4. Low Barricade / Roadblock (Jump Over Required)
  public static createLowBarricade(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'LowBarricade';

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Rose red barrier
      roughness: 0.4,
      metalness: 0.6,
    });

    const hazardMat = new THREE.MeshStandardMaterial({
      map: this.createHazardTexture(),
      roughness: 0.5,
    });

    const glowBarMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    // Concrete Footers
    const footGeo = new THREE.BoxGeometry(0.4, 0.2, 0.7);
    const footL = new THREE.Mesh(footGeo, barrierMat);
    footL.position.set(-1.1, 0.1, 0);
    footL.castShadow = true;
    const footR = new THREE.Mesh(footGeo, barrierMat);
    footR.position.set(1.1, 0.1, 0);
    footR.castShadow = true;
    group.add(footL, footR);

    // Main Horizontal Crossbar (Height = 0.85m)
    const barGeo = new THREE.BoxGeometry(2.6, 0.55, 0.25);
    const bar = new THREE.Mesh(barGeo, hazardMat);
    bar.position.set(0, 0.6, 0);
    bar.castShadow = true;
    group.add(bar);

    // Neon Warning Light Strip
    const lightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.08, 0.27),
      glowBarMat
    );
    lightStrip.position.set(0, 0.85, 0);
    group.add(lightStrip);

    return group;
  }

  // 5. Tall Signal Column (Full Lane Blocker)
  public static createTallPillar(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'TallPillar';

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3,
    });

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    const colGeo = new THREE.CylinderGeometry(0.5, 0.55, 5, 16);
    const col = new THREE.Mesh(colGeo, pillarMat);
    col.position.set(0, 2.5, 0);
    col.castShadow = true;
    group.add(col);

    // Flashing Arrow Signal
    const signGeo = new THREE.BoxGeometry(0.9, 0.9, 0.3);
    const sign = new THREE.Mesh(signGeo, neonMat);
    sign.position.set(0, 3.2, 0.35);
    group.add(sign);

    return group;
  }

  // 6. Gold Cyber-Coin
  public static createCoin(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Coin';

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      metalness: 0.95,
      roughness: 0.15,
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2,
    });

    // Outer Coin Rim
    const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.castShadow = true;
    group.add(coin);

    // Inner Embossed Star / Hex Core
    const innerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 6);
    innerGeo.rotateX(Math.PI / 2);
    const inner = new THREE.Mesh(innerGeo, coreMat);
    group.add(inner);

    return group;
  }

  // 7. Power-up Collectibles
  public static createPowerup(type: 'magnet' | 'shield' | 'boost' | 'multiplier'): THREE.Group {
    const group = new THREE.Group();
    group.name = `Powerup_${type}`;

    if (type === 'magnet') {
      const magMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      });
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x93c5fd,
        emissiveIntensity: 0.8,
      });

      // U-Shape Torus Slice
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.1, 12, 16, Math.PI),
        magMat
      );
      arch.position.y = 0.15;
      const poleL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), poleMat);
      poleL.position.set(-0.35, 0.15, 0);
      const poleR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), poleMat);
      poleR.position.set(0.35, 0.15, 0);
      group.add(arch, poleL, poleR);
    } else if (type === 'shield') {
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
      });
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x34d399,
        emissiveIntensity: 0.5,
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), crystalMat);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 24), ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(crystal, ring);
    } else if (type === 'boost') {
      const rocketMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.8,
      });
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const rocket = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 12), rocketMat);
      rocket.rotation.z = Math.PI;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 8), flameMat);
      flame.position.y = 0.45;
      group.add(rocket, flame);
    } else {
      // 2X Multiplier Star
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.1,
      });
      const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38), starMat);
      group.add(star);
    }

    return group;
  }

  // 8. Chasing Drone ("The Enforcer" - Security Drone trailing behind)
  public static createChasingDrone(): {
    root: THREE.Group;
    rotors: THREE.Mesh[];
    searchlight: THREE.SpotLight;
    siren: THREE.Mesh;
  } {
    const root = new THREE.Group();
    root.name = 'ChasingDrone';

    const droneMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Crimson warning stripes
      roughness: 0.3,
      metalness: 0.6,
    });

    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.2,
      metalness: 0.9,
    });

    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    // Center Pod Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), droneMat);
    body.scale.set(1.2, 0.7, 1.4);
    body.castShadow = true;
    root.add(body);

    // Front Optical Eye / Visor
    const eye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff })
    );
    eye.rotateX(Math.PI / 2);
    eye.position.set(0, 0, 0.55);
    root.add(eye);

    // 4 Quadrotor Arms & Blades
    const rotors: THREE.Mesh[] = [];
    const offsets = [
      [-0.7, 0.1, 0.6],
      [0.7, 0.1, 0.6],
      [-0.7, 0.1, -0.6],
      [0.7, 0.1, -0.6],
    ];

    offsets.forEach(([x, y, z]) => {
      // Arm spar
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), droneMat);
      arm.position.set(x * 0.5, y, z * 0.5);
      arm.lookAt(x, y, z);
      arm.rotateX(Math.PI / 2);
      root.add(arm);

      // Motor Pod
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 12), armorMat);
      motor.position.set(x, y + 0.05, z);
      root.add(motor);

      // Spinning Rotor Blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.015, 0.08), rotorMat);
      blade.position.set(x, y + 0.13, z);
      root.add(blade);
      rotors.push(blade);
    });

    // Top Siren Light
    const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12), sirenMat);
    siren.position.set(0, 0.42, 0);
    root.add(siren);

    // Forward Searchlight
    const searchlight = new THREE.SpotLight(0x00f5ff, 2.5, 30, Math.PI / 6, 0.4, 1.2);
    searchlight.position.set(0, 0, 0.4);
    searchlight.target.position.set(0, -1.2, 8);
    root.add(searchlight);
    root.add(searchlight.target);

    return { root, rotors, searchlight, siren };
  }
}
