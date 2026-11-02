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

  // 1. MOTU RUNNER MODEL (From Motu Patlu)
  // Procedural 18-part rigged composite character with potbelly, moustache, kurta, choti & mojari shoes
  public static createRunner(): {
    root: THREE.Group;
    spine: THREE.Group;
    head: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    belly: THREE.Mesh;
    shieldMesh: THREE.Mesh;
    magnetRing: THREE.Mesh;
    hoverboard: THREE.Group;
    samosaAura: THREE.Mesh;
  } {
    const root = new THREE.Group();
    root.name = 'MotuRunner';

    // Materials with PBR variation
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9f71, // Warm Indian skin tone
      roughness: 0.65,
      metalness: 0.05,
    });

    const redKurtaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Motu's signature rich red vest / sleeveless kurta
      roughness: 0.45,
      metalness: 0.15,
    });

    const yellowShirtMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Warm yellow/cream undershirt over big belly
      roughness: 0.7,
      metalness: 0.05,
    });

    const bluePantsMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Motu's iconic royal blue salwar/pajama pants
      roughness: 0.6,
      metalness: 0.1,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Deep black for moustache and hair tuft (choti)
      roughness: 0.3,
      metalness: 0.2,
    });

    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });

    const mojariMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm traditional brown leather mojari shoes
      roughness: 0.5,
      metalness: 0.3,
    });

    // Spine & Hip Group (Pivoted at hip height = 0.85m)
    const spine = new THREE.Group();
    spine.position.y = 0.85;
    root.add(spine);

    // MOTU'S BIG ROUND POTBELLY (Yellow shirt)
    const bellyGeo = new THREE.SphereGeometry(0.38, 20, 20);
    bellyGeo.scale(1.15, 1.05, 1.25);
    const belly = new THREE.Mesh(bellyGeo, yellowShirtMat);
    belly.position.set(0, 0.28, 0.14);
    belly.castShadow = true;
    spine.add(belly);

    // Torso Core Frame
    const torsoCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.35, 0.55, 16),
      yellowShirtMat
    );
    torsoCore.position.y = 0.28;
    torsoCore.castShadow = true;
    spine.add(torsoCore);

    // RED SLEEVELESS KURTA / VEST OVER SHOULDERS & SIDES
    const vestBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.55, 0.24),
      redKurtaMat
    );
    vestBack.position.set(0, 0.3, -0.06);
    vestBack.castShadow = true;
    spine.add(vestBack);

    // Left & Right Kurta Flaps framing the big belly
    const vestFlapL = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.5, 0.3),
      redKurtaMat
    );
    vestFlapL.position.set(-0.31, 0.28, 0.1);
    vestFlapL.castShadow = true;
    const vestFlapR = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.5, 0.3),
      redKurtaMat
    );
    vestFlapR.position.set(0.31, 0.28, 0.1);
    vestFlapR.castShadow = true;
    spine.add(vestFlapL, vestFlapR);

    // Gold Kurta Buttons on belly
    [-0.04, 0.12, 0.28].forEach((btnY) => {
      const btn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8),
        goldMat
      );
      btn.rotateX(Math.PI / 2);
      btn.position.set(0, btnY, 0.56);
      spine.add(btn);
    });

    // HEAD GROUP (Pivoted at neck = 0.62m)
    const head = new THREE.Group();
    head.position.set(0, 0.62, 0.05);
    spine.add(head);

    // Chubby Round Head
    const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
    headGeo.scale(1.15, 1.1, 1.1);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.2;
    headMesh.castShadow = true;
    head.add(headMesh);

    // Chubby Cheeks
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
    cheekL.position.set(-0.2, 0.15, 0.14);
    const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
    cheekR.position.set(0.2, 0.15, 0.14);
    head.add(cheekL, cheekR);

    // Round Bulbous Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
    nose.position.set(0, 0.2, 0.32);
    head.add(nose);

    // MOTU'S SIGNATURE THICK BLACK CURVED MOUSTACHE
    const moustGeo = new THREE.TorusGeometry(0.14, 0.04, 8, 16, Math.PI * 0.9);
    const moustL = new THREE.Mesh(moustGeo, hairMat);
    moustL.rotation.set(0.1, 0.2, -Math.PI / 4);
    moustL.position.set(-0.11, 0.14, 0.28);
    const moustR = new THREE.Mesh(moustGeo, hairMat);
    moustR.rotation.set(0.1, -0.2, Math.PI / 4 + Math.PI);
    moustR.position.set(0.11, 0.14, 0.28);
    head.add(moustL, moustR);

    // Cheerful Smile Line
    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI * 0.7),
      new THREE.MeshBasicMaterial({ color: 0x831843 })
    );
    mouth.rotation.set(0, 0, -Math.PI * 0.85);
    mouth.position.set(0, 0.09, 0.28);
    head.add(mouth);

    // Big Expressive Cartoon Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
    eyeGeo.scale(1, 1.25, 0.8);
    const eyeL = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeL.position.set(-0.11, 0.26, 0.27);
    const eyeR = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeR.position.set(0.11, 0.26, 0.27);

    const pupilGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const pupilL = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilL.position.set(-0.11, 0.26, 0.32);
    const pupilR = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupilR.position.set(0.11, 0.26, 0.32);

    head.add(eyeL, eyeR, pupilL, pupilR);

    // Black Eyebrows
    const browGeo = new THREE.BoxGeometry(0.12, 0.028, 0.02);
    const browL = new THREE.Mesh(browGeo, hairMat);
    browL.rotation.z = 0.2;
    browL.position.set(-0.12, 0.36, 0.28);
    const browR = new THREE.Mesh(browGeo, hairMat);
    browR.rotation.z = -0.2;
    browR.position.set(0.12, 0.36, 0.28);
    head.add(browL, browR);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.32, 0.2, 0);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.32, 0.2, 0);
    head.add(earL, earR);

    // MOTU'S ICONIC CHOTI / TOPKNOT HAIR TUFT ON BALD HEAD
    const chotiGeo = new THREE.ConeGeometry(0.045, 0.16, 8);
    const choti = new THREE.Mesh(chotiGeo, hairMat);
    choti.position.set(0, 0.54, -0.05);
    choti.rotation.x = -0.25;
    head.add(choti);

    // LEFT ARM (Plump, with red sleeve cuff)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 0.5, 0);
    spine.add(leftArm);
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.14, 12), redKurtaMat);
    sleeveL.position.y = -0.06;
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 12), skinMat);
    armL.position.y = -0.25;
    armL.castShadow = true;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
    handL.position.y = -0.48;
    leftArm.add(sleeveL, armL, handL);

    // RIGHT ARM (Plump, with red sleeve cuff)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 0.5, 0);
    spine.add(rightArm);
    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.14, 12), redKurtaMat);
    sleeveR.position.y = -0.06;
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 12), skinMat);
    armR.position.y = -0.25;
    armR.castShadow = true;
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
    handR.position.y = -0.48;
    rightArm.add(sleeveR, armR, handR);

    // LEFT LEG (Baggy Blue Salwar / Pajama + Brown Mojari Shoe)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.2, 0.85, 0);
    root.add(leftLeg);
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.45, 12), bluePantsMat);
    thighL.position.y = -0.22;
    thighL.castShadow = true;
    const calfL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.4, 12), bluePantsMat);
    calfL.position.y = -0.58;
    calfL.castShadow = true;

    // Traditional Mojari Shoe with curved pointed toe
    const mojariL = new THREE.Group();
    mojariL.position.set(0, -0.82, 0.06);
    const shoeBodyL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.32), mojariMat);
    const shoeToeL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), mojariMat);
    shoeToeL.rotation.x = -Math.PI / 2.5;
    shoeToeL.position.set(0, 0.04, 0.22);
    mojariL.add(shoeBodyL, shoeToeL);
    leftLeg.add(thighL, calfL, mojariL);

    // RIGHT LEG (Baggy Blue Salwar / Pajama + Brown Mojari Shoe)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.2, 0.85, 0);
    root.add(rightLeg);
    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.45, 12), bluePantsMat);
    thighR.position.y = -0.22;
    thighR.castShadow = true;
    const calfR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.4, 12), bluePantsMat);
    calfR.position.y = -0.58;
    calfR.castShadow = true;

    const mojariR = new THREE.Group();
    mojariR.position.set(0, -0.82, 0.06);
    const shoeBodyR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.32), mojariMat);
    const shoeToeR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), mojariMat);
    shoeToeR.rotation.x = -Math.PI / 2.5;
    shoeToeR.position.set(0, 0.04, 0.22);
    mojariR.add(shoeBodyR, shoeToeR);
    rightLeg.add(thighR, calfR, mojariR);

    // SHIELD DOME (Emerald Green)
    const shieldGeo = new THREE.SphereGeometry(1.25, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
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

    // MAGNET TORUS FIELD
    const magnetGeo = new THREE.TorusGeometry(0.85, 0.04, 12, 32);
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

    // HOVERBOARD / SAMOSA POWER ROCKET
    const hoverboard = new THREE.Group();
    hoverboard.position.y = 0.08;
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 1.4), deckMat);
    deck.castShadow = true;
    hoverboard.add(deck);
    hoverboard.visible = false;
    root.add(hoverboard);

    // SAMOSA ENERGY AURA (Pulsing golden aura when Samosa Boost is active)
    const auraGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffbb00,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const samosaAura = new THREE.Mesh(auraGeo, auraMat);
    samosaAura.position.y = 0.9;
    samosaAura.visible = false;
    root.add(samosaAura);

    return {
      root,
      spine,
      head,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      belly,
      shieldMesh,
      magnetRing,
      hoverboard,
      samosaAura,
    };
  }

  // 2. MOTU'S GOLDEN CRISPY SAMOSA (Collectible & Power-Up)
  public static createSamosa(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CrispySamosa';

    const samosaMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Crispy fried golden brown
      emissive: 0xb45309,
      emissiveIntensity: 0.5,
      roughness: 0.35,
      metalness: 0.15,
    });

    const crustEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, // Deep browned fried crust edge
      roughness: 0.5,
    });

    // Triangular Tetrahedron Shape for Samosa
    const samosaGeo = new THREE.ConeGeometry(0.36, 0.45, 3);
    samosaGeo.rotateX(Math.PI / 2);
    const samosa = new THREE.Mesh(samosaGeo, samosaMat);
    samosa.scale.set(1.2, 0.7, 1.0);
    samosa.castShadow = true;
    group.add(samosa);

    // Crimped Pastry Fold Edge along base
    const crimpGeo = new THREE.TorusGeometry(0.3, 0.04, 6, 12, Math.PI * 0.9);
    const crimp = new THREE.Mesh(crimpGeo, crustEdgeMat);
    crimp.rotation.x = Math.PI / 2;
    crimp.position.set(0, -0.05, -0.15);
    group.add(crimp);

    // Golden Glow Ring
    const glowGeo = new THREE.TorusGeometry(0.48, 0.025, 8, 20);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.rotation.x = Math.PI / 3;
    group.add(glowRing);

    return group;
  }

  // 3. High-Speed MagLev Subway Train
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

    // Rooftop Walkway
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

    // Rear Entrance Ramp
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

  // 4. High Laser Barricade (Slide Underneath Required)
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
      opacity: 0.85,
    });

    const postGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
    const postL = new THREE.Mesh(postGeo, pillarMat);
    postL.position.set(-1.4, 1.6, 0);
    postL.castShadow = true;
    const postR = new THREE.Mesh(postGeo, pillarMat);
    postR.position.set(1.4, 1.6, 0);
    postR.castShadow = true;
    group.add(postL, postR);

    // Overhead Heavy Beam (Gap is 1.0m from ground — Motu rolls under!)
    const beamGeo = new THREE.BoxGeometry(3.1, 0.6, 0.45);
    const beam = new THREE.Mesh(beamGeo, hazardMat);
    beam.position.set(0, 2.5, 0);
    beam.castShadow = true;
    group.add(beam);

    const laserGeo = new THREE.PlaneGeometry(2.7, 1.2);
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0, 1.6, 0);
    group.add(laser);

    return group;
  }

  // 5. Low Barricade / Roadblock (Jump Over Required)
  public static createLowBarricade(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'LowBarricade';

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
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

    const footGeo = new THREE.BoxGeometry(0.4, 0.2, 0.7);
    const footL = new THREE.Mesh(footGeo, barrierMat);
    footL.position.set(-1.1, 0.1, 0);
    footL.castShadow = true;
    const footR = new THREE.Mesh(footGeo, barrierMat);
    footR.position.set(1.1, 0.1, 0);
    footR.castShadow = true;
    group.add(footL, footR);

    const barGeo = new THREE.BoxGeometry(2.6, 0.55, 0.25);
    const bar = new THREE.Mesh(barGeo, hazardMat);
    bar.position.set(0, 0.6, 0);
    bar.castShadow = true;
    group.add(bar);

    const lightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.08, 0.27),
      glowBarMat
    );
    lightStrip.position.set(0, 0.85, 0);
    group.add(lightStrip);

    return group;
  }

  // 6. Tall Signal Column
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

    const signGeo = new THREE.BoxGeometry(0.9, 0.9, 0.3);
    const sign = new THREE.Mesh(signGeo, neonMat);
    sign.position.set(0, 3.2, 0.35);
    group.add(sign);

    return group;
  }

  // 7. Gold Cyber-Coin
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

    const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.castShadow = true;
    group.add(coin);

    const innerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 6);
    innerGeo.rotateX(Math.PI / 2);
    const inner = new THREE.Mesh(innerGeo, coreMat);
    group.add(inner);

    return group;
  }

  // 8. Power-up Collectibles (Including Hot Crispy Samosa!)
  public static createPowerup(type: 'magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa'): THREE.Group {
    if (type === 'samosa' || type === 'boost') {
      return this.createSamosa();
    }

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

  // 9. INSPECTOR CHINGUM'S POLICE DRONE
  // Trailing police quadcopter with red/blue flashing lights and police badge
  public static createChasingDrone(): {
    root: THREE.Group;
    rotors: THREE.Mesh[];
    searchlight: THREE.SpotLight;
    sirenL: THREE.Mesh;
    sirenR: THREE.Mesh;
  } {
    const root = new THREE.Group();
    root.name = 'ChingumPoliceDrone';

    const policeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Police navy blue
      roughness: 0.35,
      metalness: 0.7,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.3,
    });

    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Center Pod Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), policeBodyMat);
    body.scale.set(1.2, 0.75, 1.4);
    body.castShadow = true;
    root.add(body);

    // Police White Chevron Stripe on sides
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 1.1), whiteMat);
    stripe.position.set(0, 0.05, 0);
    root.add(stripe);

    // Police Gold Badge in front
    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    badge.rotateX(Math.PI / 2);
    badge.position.set(0, 0.1, 0.65);
    root.add(badge);

    // 4 Quadrotor Arms & Blades
    const rotors: THREE.Mesh[] = [];
    const offsets = [
      [-0.72, 0.1, 0.6],
      [0.72, 0.1, 0.6],
      [-0.72, 0.1, -0.6],
      [0.72, 0.1, -0.6],
    ];

    offsets.forEach(([x, y, z]) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), policeBodyMat);
      arm.position.set(x * 0.5, y, z * 0.5);
      arm.lookAt(x, y, z);
      arm.rotateX(Math.PI / 2);
      root.add(arm);

      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 12), whiteMat);
      motor.position.set(x, y + 0.05, z);
      root.add(motor);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.015, 0.08), rotorMat);
      blade.position.set(x, y + 0.13, z);
      root.add(blade);
      rotors.push(blade);
    });

    // Dual Police Sirens (Red & Blue flashing)
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

    const sirenL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12), sirenRedMat);
    sirenL.position.set(-0.2, 0.44, 0);
    const sirenR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12), sirenBlueMat);
    sirenR.position.set(0.2, 0.44, 0);
    root.add(sirenL, sirenR);

    // Forward Searchlight
    const searchlight = new THREE.SpotLight(0x00f5ff, 3.0, 35, Math.PI / 6, 0.4, 1.2);
    searchlight.position.set(0, 0, 0.4);
    searchlight.target.position.set(0, -1.2, 8);
    root.add(searchlight);
    root.add(searchlight.target);

    return { root, rotors, searchlight, sirenL, sirenR };
  }
}
