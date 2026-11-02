import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ModelFactory } from './models';
import { sound } from './audio';

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
  multiplier: number;
  speed: number;
  activePowerup: {
    type: 'magnet' | 'shield' | 'boost' | 'multiplier' | null;
    remaining: number;
  };
  highScore: number;
}

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

interface ObstacleEntity {
  group: THREE.Group;
  type: 'LOW_BARRICADE' | 'HIGH_LASER' | 'TRAIN' | 'TALL_PILLAR';
  lane: number;
  z: number;
  length?: number;
  height?: number;
  speed?: number;
  hit: boolean;
}

interface CoinEntity {
  group: THREE.Group;
  lane: number;
  z: number;
  y: number;
  collected: boolean;
}

interface PowerupEntity {
  group: THREE.Group;
  type: 'magnet' | 'shield' | 'boost' | 'multiplier';
  lane: number;
  z: number;
  y: number;
  collected: boolean;
}

interface ParticleEntity {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class RunnerEngine {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Callbacks to React HUD
  public onStatsUpdate?: (stats: GameStats) => void;
  public onStateChange?: (state: GameState) => void;

  // Game Lifecycle State
  private state: GameState = 'TITLE';
  private highScore: number = 0;
  private score: number = 0;
  private coins: number = 0;
  private distance: number = 0;
  private multiplier: number = 1;
  private baseSpeed: number = 24; // m/s
  private currentSpeed: number = 24;
  private boostTimer: number = 0;
  private magnetTimer: number = 0;
  private shieldTimer: number = 0;
  private multiplierTimer: number = 0;

  // Lane Configuration (-3.2m, 0m, +3.2m)
  private readonly LANE_WIDTH = 3.2;
  private currentLane: number = 0; // -1, 0, 1
  private targetX: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private verticalVelocity: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private groundHeight: number = 0; // 0 on track, or 2.8 on top of train
  private currentStandingTrain: ObstacleEntity | null = null;

  // Visuals & Rig
  private runnerRig!: ReturnType<typeof ModelFactory.createRunner>;
  private droneRig!: ReturnType<typeof ModelFactory.createChasingDrone>;
  private droneDistance: number = 6.0;
  private droneTargetDistance: number = 6.0;

  // Track & Environment Chunks
  private trackChunks: THREE.Group[] = [];
  private readonly CHUNK_LENGTH = 50;
  private readonly NUM_CHUNKS = 8;
  private nextSpawnZ: number = -40;

  // Entities
  private obstacles: ObstacleEntity[] = [];
  private coinEntities: CoinEntity[] = [];
  private powerupEntities: PowerupEntity[] = [];
  private particles: ParticleEntity[] = [];

  // Hitstop & Camera Juice
  private hitstopTimer: number = 0;
  private cameraShakeIntensity: number = 0;
  private runCycle: number = 0;

  // Reusable math objects
  private _camTarget = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.container = container;
    try {
      this.highScore = parseInt(localStorage.getItem('cybersurge_highscore') || '0', 10);
    } catch {
      this.highScore = 0;
    }

    this.initWebGL();
    this.initLightingAndEnv();
    this.initPlayer();
    this.initDrone();
    this.initTrackPool();
    this.initInput();
    this.startLoop();
  }

  private initWebGL() {
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913); // Deep night cyber sky
    this.scene.fog = new THREE.FogExp2(0x060913, 0.012);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 400);
    this.camera.position.set(0, 4.5, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private initLightingAndEnv() {
    // Studio Environment map via PMREMGenerator
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Directional Key Light (Sun/Moonlight casting crisp shadows)
    const keyLight = new THREE.DirectionalLight(0xfff1e6, 1.4);
    keyLight.position.set(15, 30, 20);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      const d = 16;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 80;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Cool Cyber Sky & Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x00f5ff, 0x1e1b4b, 0.7);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    // Warm Ambient Light
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(amb);
  }

  private initPlayer() {
    this.runnerRig = ModelFactory.createRunner();
    this.scene.add(this.runnerRig.root);
    this.resetPlayerPosition();
  }

  private resetPlayerPosition() {
    this.currentLane = 0;
    this.targetX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.groundHeight = 0;
    this.currentStandingTrain = null;

    if (this.runnerRig) {
      this.runnerRig.root.position.set(0, 0, 0);
      this.runnerRig.root.rotation.set(0, 0, 0);
      this.runnerRig.root.scale.set(1, 1, 1);
      this.runnerRig.shieldMesh.visible = false;
      this.runnerRig.magnetRing.visible = false;
      this.runnerRig.hoverboard.visible = false;
    }
  }

  private initDrone() {
    this.droneRig = ModelFactory.createChasingDrone();
    this.scene.add(this.droneRig.root);
    this.droneRig.root.position.set(0, 2.2, 6.0);
  }

  // Procedural Track Builder
  private createTrackChunk(zPos: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = zPos;

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d, // Dark metallic subway bed
      roughness: 0.8,
      metalness: 0.3,
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.4,
    });

    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.9,
      metalness: 0.2,
    });

    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Main 3-Lane Road Surface
    const roadWidth = this.LANE_WIDTH * 3 + 2.5; // ~12m wide
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.4, this.CHUNK_LENGTH),
      roadMat
    );
    road.position.set(0, -0.2, -this.CHUNK_LENGTH / 2);
    road.receiveShadow = true;
    chunk.add(road);

    // Neon Track Divider Lines
    [-this.LANE_WIDTH / 2, this.LANE_WIDTH / 2].forEach((x) => {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, this.CHUNK_LENGTH),
        railMat
      );
      line.rotateX(-Math.PI / 2);
      line.position.set(x, 0.01, -this.CHUNK_LENGTH / 2);
      chunk.add(line);
    });

    // Outer Neon Power Rails
    [-this.LANE_WIDTH * 1.5 - 0.2, this.LANE_WIDTH * 1.5 + 0.2].forEach((x) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.25, this.CHUNK_LENGTH),
        railMat
      );
      rail.position.set(x, 0.12, -this.CHUNK_LENGTH / 2);
      chunk.add(rail);

      // Guardrail barrier
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 1.2, this.CHUNK_LENGTH),
        sideMat
      );
      barrier.position.set(x > 0 ? x + 0.6 : x - 0.6, 0.6, -this.CHUNK_LENGTH / 2);
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      chunk.add(barrier);
    });

    // Cyberpunk Skyline Buildings along the flanks
    [-14, 14].forEach((bldgX) => {
      const bldgH = 25 + Math.random() * 35;
      const bldgW = 10 + Math.random() * 8;
      const bldgD = 18 + Math.random() * 12;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(bldgW, bldgH, bldgD),
        bldgMat
      );
      building.position.set(bldgX + (bldgX > 0 ? 5 : -5), bldgH / 2 - 2, -this.CHUNK_LENGTH / 2);
      chunk.add(building);

      // Random glowing holographic window bands
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(bldgW + 0.1, 0.4, bldgD * 0.7),
        windowMat
      );
      band.position.set(bldgX + (bldgX > 0 ? 5 : -5), bldgH * 0.6, -this.CHUNK_LENGTH / 2);
      chunk.add(band);
    });

    // Overhead Neon Cyber Arch spanning the road
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.9,
    });
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth + 1.2, 0.4, 0.6),
      archMat
    );
    arch.position.set(0, 6.5, -this.CHUNK_LENGTH * 0.75);
    chunk.add(arch);

    this.scene.add(chunk);
    return chunk;
  }

  private initTrackPool() {
    this.trackChunks = [];
    for (let i = 0; i < this.NUM_CHUNKS; i++) {
      const zPos = 20 - i * this.CHUNK_LENGTH;
      const chunk = this.createTrackChunk(zPos);
      this.trackChunks.push(chunk);
    }
    this.nextSpawnZ = -30;
  }

  // Obstacle & Coin Spawning Logic
  private spawnTrackSectionEntities(startZ: number, endZ: number) {
    if (this.state !== 'PLAYING') return;

    let currentZ = startZ;
    while (currentZ > endZ) {
      currentZ -= 22 + Math.random() * 12; // Spacing between obstacle gates

      const rand = Math.random();
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

      // 1. MagLev Train (Barrels towards player or provides roof platform)
      if (rand < 0.28) {
        const trainGroup = ModelFactory.createTrain(26);
        trainGroup.position.set(lane * this.LANE_WIDTH, 0, currentZ);
        this.scene.add(trainGroup);

        const trainSpeed = Math.random() < 0.4 ? 8.0 : 0; // 40% chance of moving train!
        this.obstacles.push({
          group: trainGroup,
          type: 'TRAIN',
          lane,
          z: currentZ,
          length: 28,
          height: 2.8,
          speed: trainSpeed,
          hit: false,
        });

        // Spawn a string of coins on top of the train roof!
        for (let cz = -10; cz <= 10; cz += 3) {
          const coinGroup = ModelFactory.createCoin();
          coinGroup.position.set(lane * this.LANE_WIDTH, 3.2, currentZ + cz);
          this.scene.add(coinGroup);
          this.coinEntities.push({
            group: coinGroup,
            lane,
            z: currentZ + cz,
            y: 3.2,
            collected: false,
          });
        }
      }
      // 2. High Laser Barricade (Slide Under)
      else if (rand < 0.54) {
        const laserGroup = ModelFactory.createHighLaserBarricade();
        laserGroup.position.set(lane * this.LANE_WIDTH, 0, currentZ);
        this.scene.add(laserGroup);

        this.obstacles.push({
          group: laserGroup,
          type: 'HIGH_LASER',
          lane,
          z: currentZ,
          length: 1.0,
          height: 2.8,
          hit: false,
        });

        // Spawn low sliding coins underneath
        for (let cz = -2; cz <= 2; cz += 2) {
          const coinGroup = ModelFactory.createCoin();
          coinGroup.position.set(lane * this.LANE_WIDTH, 0.4, currentZ + cz);
          this.scene.add(coinGroup);
          this.coinEntities.push({
            group: coinGroup,
            lane,
            z: currentZ + cz,
            y: 0.4,
            collected: false,
          });
        }
      }
      // 3. Low Roadblock Barricade (Jump Over)
      else if (rand < 0.82) {
        const barrierGroup = ModelFactory.createLowBarricade();
        barrierGroup.position.set(lane * this.LANE_WIDTH, 0, currentZ);
        this.scene.add(barrierGroup);

        this.obstacles.push({
          group: barrierGroup,
          type: 'LOW_BARRICADE',
          lane,
          z: currentZ,
          length: 1.0,
          height: 0.9,
          hit: false,
        });

        // Spawn high coin arc over the jump hurdle!
        [-2.5, 0, 2.5].forEach((cz, i) => {
          const y = i === 1 ? 2.4 : 1.6;
          const coinGroup = ModelFactory.createCoin();
          coinGroup.position.set(lane * this.LANE_WIDTH, y, currentZ + cz);
          this.scene.add(coinGroup);
          this.coinEntities.push({
            group: coinGroup,
            lane,
            z: currentZ + cz,
            y,
            collected: false,
          });
        });
      }
      // 4. Tall Signal Pillar (Lane change required)
      else {
        const pillarGroup = ModelFactory.createTallPillar();
        pillarGroup.position.set(lane * this.LANE_WIDTH, 0, currentZ);
        this.scene.add(pillarGroup);

        this.obstacles.push({
          group: pillarGroup,
          type: 'TALL_PILLAR',
          lane,
          z: currentZ,
          length: 1.5,
          height: 5.0,
          hit: false,
        });
      }

      // 12% chance to spawn a Power-up in an open adjacent lane
      if (Math.random() < 0.14) {
        const pLane = (lane + 1 > 1 ? -1 : lane + 1);
        const types: ('magnet' | 'shield' | 'boost' | 'multiplier')[] = [
          'magnet',
          'shield',
          'boost',
          'multiplier',
        ];
        const pType = types[Math.floor(Math.random() * types.length)];
        const pGroup = ModelFactory.createPowerup(pType);
        pGroup.position.set(pLane * this.LANE_WIDTH, 1.2, currentZ - 8);
        this.scene.add(pGroup);

        this.powerupEntities.push({
          group: pGroup,
          type: pType,
          lane: pLane,
          z: currentZ - 8,
          y: 1.2,
          collected: false,
        });
      }
    }
  }

  // Input Handlers
  private initInput() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('blur', this.handleBlur);

    // Touch swipe handling for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dt = Date.now() - touchStartTime;

        if (dt < 400) {
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
            if (dx > 0) this.moveRight();
            else this.moveLeft();
          } else if (Math.abs(dy) > 30) {
            if (dy < 0) this.jump();
            else this.slide();
          } else {
            // Tap to start if on title
            if (this.state === 'TITLE') this.startRun();
            else if (this.state === 'GAMEOVER') this.startRun();
          }
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.state === 'TITLE') {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startRun();
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startRun();
      }
      return;
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      this.togglePause();
      return;
    }

    if (this.state !== 'PLAYING') return;

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      e.preventDefault();
      this.moveLeft();
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      e.preventDefault();
      this.moveRight();
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      e.preventDefault();
      this.jump();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      this.slide();
    }
  };

  private handleBlur = () => {
    if (this.state === 'PLAYING') {
      this.togglePause();
    }
  };

  // Player Actions
  public moveLeft() {
    if (this.currentLane > -1) {
      this.currentLane--;
      this.targetX = this.currentLane * this.LANE_WIDTH;
      sound.playLaneSwitch();
      this.spawnFootstepSparks(-0.6);
    }
  }

  public moveRight() {
    if (this.currentLane < 1) {
      this.currentLane++;
      this.targetX = this.currentLane * this.LANE_WIDTH;
      sound.playLaneSwitch();
      this.spawnFootstepSparks(0.6);
    }
  }

  public jump() {
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.verticalVelocity = 14.5;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isSliding = false;
      this.slideTimer = 0;

      // Squash and stretch
      this.runnerRig.root.scale.set(0.85, 1.25, 0.85);
      sound.playJump();
      this.spawnFootstepSparks(0);
    } else {
      // Buffer jump for responsive landing input
      this.jumpBufferTimer = 0.16;
    }
  }

  public slide() {
    if (!this.isGrounded) {
      // Fast fall down slam
      this.verticalVelocity = -22;
    }
    this.isSliding = true;
    this.slideTimer = 0.65;
    sound.playSlide();
    this.spawnSlideDust();
  }

  // Particle Effects
  private spawnFootstepSparks(xOffset: number) {
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        this.playerX + xOffset + (Math.random() - 0.5) * 0.4,
        this.playerY + 0.1,
        this.playerZ + 0.3
      );
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        vz: 3 + Math.random() * 4,
        life: 0,
        maxLife: 0.35,
      });
    }
  }

  private spawnSlideDust() {
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        this.playerX + (Math.random() - 0.5) * 0.6,
        this.playerY + 0.05,
        this.playerZ + (Math.random() - 0.5) * 0.4
      );
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 5,
        vy: 1.5 + Math.random() * 2,
        vz: 6 + Math.random() * 5,
        life: 0,
        maxLife: 0.45,
      });
    }
  }

  private spawnCoinSparks(x: number, y: number, z: number) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 0.4,
      });
    }
  }

  // Game Loop
  private startLoop() {
    this.clock.start();
    const tick = () => {
      this.animFrameId = requestAnimationFrame(tick);
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

      this.update(dt);
      this.render();
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    // Hitstop handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Title Screen Idle Pan
    if (this.state === 'TITLE') {
      const time = this.clock.getElapsedTime();
      this.camera.position.x = Math.sin(time * 0.5) * 2.5;
      this.camera.position.y = 3.2 + Math.cos(time * 0.4) * 0.6;
      this.camera.position.z = 6.0;
      this.camera.lookAt(0, 1.4, -2.5);

      // Gentle breathing idle
      this.runnerRig.root.position.y = Math.sin(time * 2.5) * 0.04;
      this.runnerRig.spine.rotation.x = Math.sin(time * 2.5) * 0.03;
      return;
    }

    if (this.state === 'PAUSED') return;

    if (this.state === 'PLAYING') {
      // Speed Ramp over distance (starts at 24 m/s, gradually scales to 42 m/s)
      const targetSpeed = Math.min(24 + (this.distance / 180), 44);
      this.currentSpeed = this.boostTimer > 0 ? targetSpeed * 1.5 : targetSpeed;

      // Update distance and score
      this.distance += this.currentSpeed * dt;
      this.score += Math.floor(this.currentSpeed * dt * this.multiplier * 2);

      // Power-up Timers
      if (this.boostTimer > 0) {
        this.boostTimer -= dt;
        this.runnerRig.hoverboard.visible = true;
        if (this.boostTimer <= 0) this.runnerRig.hoverboard.visible = false;
      }
      if (this.magnetTimer > 0) {
        this.magnetTimer -= dt;
        this.runnerRig.magnetRing.visible = true;
        this.runnerRig.magnetRing.rotation.z += dt * 6;
        if (this.magnetTimer <= 0) this.runnerRig.magnetRing.visible = false;
      }
      if (this.shieldTimer > 0) {
        this.shieldTimer -= dt;
        this.runnerRig.shieldMesh.visible = true;
        this.runnerRig.shieldMesh.rotation.y += dt * 2;
        if (this.shieldTimer <= 0) this.runnerRig.shieldMesh.visible = false;
      }
      if (this.multiplierTimer > 0) {
        this.multiplierTimer -= dt;
        this.multiplier = 2;
        if (this.multiplierTimer <= 0) this.multiplier = 1;
      }

      // Move player forward in world space
      this.playerZ -= this.currentSpeed * dt;

      // Smooth Lane Switching with Exponential Damping
      this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, 22, dt);
      const laneDelta = this.targetX - this.playerX;
      this.runnerRig.root.rotation.z = -laneDelta * 0.15; // Realistic banking tilt

      // Jump & Gravity Simulation
      this.updateVerticalPhysics(dt);

      // Slide Timer
      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // Check standing on top of trains
      this.updateTrainSurfing();

      // Running Animation Cycles
      this.updateRunnerBones(dt);

      // Update Chasing Security Drone
      this.updateDrone(dt);

      // Recycle and spawn track chunks ahead
      this.updateTrackChunks();

      // Update obstacles (moving trains) and collisions
      this.updateObstacles(dt);

      // Magnet Coin Attraction & Collection
      this.updateCoins(dt);

      // Powerup Collection
      this.updatePowerups(dt);

      // Particles
      this.updateParticles(dt);

      // Camera Tracking with dynamic lean and shake
      this.updateCamera(dt);

      // Send HUD stats to React
      this.emitStats();
    }
  }

  private updateVerticalPhysics(dt: number) {
    const gravity = -42; // m/s²

    if (!this.isGrounded) {
      this.verticalVelocity += gravity * dt;
      this.playerY += this.verticalVelocity * dt;

      // Check landing on ground or train roof
      if (this.playerY <= this.groundHeight) {
        this.playerY = this.groundHeight;
        this.verticalVelocity = 0;
        this.isGrounded = true;

        // Landing squash
        this.runnerRig.root.scale.set(1.2, 0.78, 1.2);
        this.spawnFootstepSparks(0);

        // Execute buffered jump if pressed just before landing
        if (this.jumpBufferTimer > 0) {
          this.jump();
        }
      }
    } else {
      this.playerY = this.groundHeight;
      this.coyoteTimer = 0.12; // Allow jump for 120ms after running off edge
    }

    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.coyoteTimer > 0 && !this.isGrounded) this.coyoteTimer -= dt;

    // Smoothly restore mesh scale from squash/stretch
    this.runnerRig.root.scale.x = THREE.MathUtils.damp(this.runnerRig.root.scale.x, 1, 14, dt);
    this.runnerRig.root.scale.y = THREE.MathUtils.damp(this.runnerRig.root.scale.y, 1, 14, dt);
    this.runnerRig.root.scale.z = THREE.MathUtils.damp(this.runnerRig.root.scale.z, 1, 14, dt);

    this.runnerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
  }

  private updateTrainSurfing() {
    // Check if player is positioned directly over a train in the same lane
    let onTrain: ObstacleEntity | null = null;

    for (const obs of this.obstacles) {
      if (obs.type === 'TRAIN') {
        const trainHalfLength = (obs.length || 26) / 2;
        const trainZ = obs.group.position.z;
        const dz = Math.abs(this.playerZ - trainZ);
        const sameLane = Math.abs(this.playerX - obs.group.position.x) < 1.4;

        if (sameLane && dz < trainHalfLength + 0.5) {
          // If player was jumping above train roof (height = 2.8m)
          if (this.playerY >= 2.5) {
            onTrain = obs;
            break;
          }
        }
      }
    }

    if (onTrain) {
      this.groundHeight = 2.8;
      this.currentStandingTrain = onTrain;
    } else {
      this.groundHeight = 0;
      this.currentStandingTrain = null;
      if (this.playerY > 0 && this.isGrounded) {
        // Player ran off the edge of train roof!
        this.isGrounded = false;
        this.verticalVelocity = 0;
      }
    }
  }

  private updateRunnerBones(dt: number) {
    this.runCycle += dt * this.currentSpeed * 0.45;
    const sin = Math.sin(this.runCycle);
    const cos = Math.cos(this.runCycle);

    if (this.isSliding) {
      // Low Slide Posture
      this.runnerRig.spine.position.y = 0.45;
      this.runnerRig.spine.rotation.x = 0.95; // Lean chest far forward
      this.runnerRig.head.rotation.x = -0.7; // Look up while sliding
      this.runnerRig.leftLeg.rotation.x = -1.2;
      this.runnerRig.rightLeg.rotation.x = 1.1;
      this.runnerRig.leftArm.rotation.x = 0.8;
      this.runnerRig.rightArm.rotation.x = 0.8;
    } else if (!this.isGrounded) {
      // In-Air Leap Posture
      this.runnerRig.spine.position.y = 0.95;
      this.runnerRig.spine.rotation.x = -0.15;
      this.runnerRig.head.rotation.x = -0.1;
      this.runnerRig.leftLeg.rotation.x = -0.6;
      this.runnerRig.rightLeg.rotation.x = 0.8;
      this.runnerRig.leftArm.rotation.x = 1.2;
      this.runnerRig.rightArm.rotation.x = -0.9;
    } else {
      // Running Strides
      this.runnerRig.spine.position.y = 0.95 + Math.abs(sin) * 0.08;
      this.runnerRig.spine.rotation.x = 0.18; // Athletic forward lean
      this.runnerRig.head.rotation.x = 0;

      this.runnerRig.leftLeg.rotation.x = sin * 0.9;
      this.runnerRig.rightLeg.rotation.x = -sin * 0.9;

      this.runnerRig.leftArm.rotation.x = -sin * 0.8;
      this.runnerRig.rightArm.rotation.x = sin * 0.8;
    }
  }

  private updateDrone(dt: number) {
    // Drone trails behind player smoothly
    const droneZ = this.playerZ + this.droneDistance;
    this.droneRig.root.position.x = THREE.MathUtils.damp(
      this.droneRig.root.position.x,
      this.playerX * 0.8,
      12,
      dt
    );
    this.droneRig.root.position.y = THREE.MathUtils.damp(
      this.droneRig.root.position.y,
      this.playerY + 2.4,
      10,
      dt
    );
    this.droneRig.root.position.z = THREE.MathUtils.damp(
      this.droneRig.root.position.z,
      droneZ,
      10,
      dt
    );

    // Spin quadrotor blades
    this.droneRig.rotors.forEach((rotor, i) => {
      rotor.rotation.y += (i % 2 === 0 ? 35 : -35) * dt;
    });

    // Flashing red siren
    const time = this.clock.getElapsedTime();
    const sirenColor = Math.sin(time * 16) > 0 ? 0xff0033 : 0x00f5ff;
    (this.droneRig.siren.material as THREE.MeshBasicMaterial).color.setHex(sirenColor);

    // Restore drone distance over time if safe
    this.droneDistance = THREE.MathUtils.damp(
      this.droneDistance,
      this.droneTargetDistance,
      2.0,
      dt
    );
  }

  private updateTrackChunks() {
    // When player gets near the end of track, recycle oldest chunk behind player
    for (const chunk of this.trackChunks) {
      if (chunk.position.z > this.playerZ + 40) {
        // Find furthest chunk ahead
        let minZ = this.playerZ;
        for (const c of this.trackChunks) {
          if (c.position.z < minZ) minZ = c.position.z;
        }

        const newZ = minZ - this.CHUNK_LENGTH;
        chunk.position.z = newZ;

        // Spawn new obstacles & coins on this recycled chunk
        this.spawnTrackSectionEntities(newZ + this.CHUNK_LENGTH / 2, newZ - this.CHUNK_LENGTH / 2);
      }
    }
  }

  private updateObstacles(dt: number) {
    const playerHitboxRadius = 0.45;
    const playerHeight = this.isSliding ? 0.75 : 1.8;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Move moving trains towards player!
      if (obs.speed && obs.speed > 0) {
        obs.group.position.z += obs.speed * dt;
      }

      const obsZ = obs.group.position.z;

      // Dispose if far behind
      if (obsZ > this.playerZ + 30) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
        continue;
      }

      if (obs.hit) continue;

      // Collision Check
      const sameLane = Math.abs(this.playerX - obs.group.position.x) < 1.1;
      const obsHalfLength = (obs.length || 1.2) / 2;
      const zOverlap = Math.abs(this.playerZ - obsZ) < obsHalfLength + playerHitboxRadius;

      if (sameLane && zOverlap) {
        // Check Obstacle Types:
        // 1. Train front crash
        if (obs.type === 'TRAIN') {
          // If player is on roof, no crash!
          if (this.playerY >= 2.5) {
            continue; // Safely surfing on train roof!
          } else {
            this.handlePlayerHit(obs);
          }
        }
        // 2. High Laser (Can slide underneath!)
        else if (obs.type === 'HIGH_LASER') {
          // Laser beam starts at y = 1.0m to 2.2m.
          // If player is sliding, player height is 0.75m -> SAFE!
          if (this.isSliding) {
            continue; // Successfully slid under!
          } else {
            this.handlePlayerHit(obs);
          }
        }
        // 3. Low Barricade (Can jump over!)
        else if (obs.type === 'LOW_BARRICADE') {
          // Barricade is height 0.85m.
          // If player is jumping above 0.95m -> SAFE!
          if (this.playerY > 0.95) {
            continue; // Successfully jumped over!
          } else {
            this.handlePlayerHit(obs);
          }
        }
        // 4. Tall Pillar (Must switch lane)
        else if (obs.type === 'TALL_PILLAR') {
          this.handlePlayerHit(obs);
        }
      }
    }
  }

  private handlePlayerHit(obs: ObstacleEntity) {
    obs.hit = true;

    // If player has Rocket Boost active, smash right through obstacle!
    if (this.boostTimer > 0) {
      sound.playCrash();
      this.triggerHitstop(0.04);
      this.triggerCameraShake(0.3);
      this.spawnCoinSparks(obs.group.position.x, 1.2, obs.group.position.z);
      this.scene.remove(obs.group);
      return;
    }

    // If player has Shield active, break shield and survive!
    if (this.shieldTimer > 0) {
      this.shieldTimer = 0;
      this.runnerRig.shieldMesh.visible = false;
      sound.playShieldBreak();
      this.triggerHitstop(0.08);
      this.triggerCameraShake(0.5);
      this.spawnFootstepSparks(0);

      // Drone closes in dangerously!
      this.droneDistance = 2.4;
      return;
    }

    // Fatal Crash: Game Over!
    this.gameOver();
  }

  private updateCoins(dt: number) {
    const magnetRadius = this.magnetTimer > 0 ? 12 : 1.2;

    for (let i = this.coinEntities.length - 1; i >= 0; i--) {
      const coin = this.coinEntities[i];

      // Spin coin
      coin.group.rotation.y += dt * 5;

      // Dispose if behind
      if (coin.z > this.playerZ + 20) {
        this.scene.remove(coin.group);
        this.coinEntities.splice(i, 1);
        continue;
      }

      if (coin.collected) continue;

      const dx = this.playerX - coin.group.position.x;
      const dy = this.playerY + 0.8 - coin.y;
      const dz = this.playerZ - coin.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Magnet Pull
      if (this.magnetTimer > 0 && dist < magnetRadius) {
        coin.group.position.x += dx * dt * 8;
        coin.group.position.y += dy * dt * 8;
        coin.group.position.z += dz * dt * 8;
      }

      // Collect Check
      if (dist < 1.4) {
        coin.collected = true;
        this.coins += 1 * this.multiplier;
        this.score += 50 * this.multiplier;
        sound.playCoin();
        this.spawnCoinSparks(coin.group.position.x, coin.y, coin.z);
        this.scene.remove(coin.group);
        this.coinEntities.splice(i, 1);
      }
    }
  }

  private updatePowerups(dt: number) {
    for (let i = this.powerupEntities.length - 1; i >= 0; i--) {
      const p = this.powerupEntities[i];

      // Floating bob and spin
      p.group.rotation.y += dt * 3.5;
      p.group.position.y = p.y + Math.sin(this.clock.getElapsedTime() * 4) * 0.15;

      if (p.z > this.playerZ + 20) {
        this.scene.remove(p.group);
        this.powerupEntities.splice(i, 1);
        continue;
      }

      if (p.collected) continue;

      const sameLane = Math.abs(this.playerX - p.group.position.x) < 1.2;
      const zOverlap = Math.abs(this.playerZ - p.z) < 1.4;

      if (sameLane && zOverlap) {
        p.collected = true;
        this.activatePowerup(p.type);
        this.scene.remove(p.group);
        this.powerupEntities.splice(i, 1);
      }
    }
  }

  private activatePowerup(type: 'magnet' | 'shield' | 'boost' | 'multiplier') {
    sound.playPowerup();
    this.triggerCameraShake(0.2);

    if (type === 'magnet') {
      this.magnetTimer = 10;
    } else if (type === 'shield') {
      this.shieldTimer = 15;
    } else if (type === 'boost') {
      this.boostTimer = 6;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else if (type === 'multiplier') {
      this.multiplierTimer = 12;
      this.multiplier = 2;
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 9.8 * dt; // Particle gravity

      const progress = p.life / p.maxLife;
      p.mesh.scale.setScalar(1 - progress);
    }
  }

  private updateCamera(dt: number) {
    // Camera follow with dynamic lag & cinematic elevation
    const targetCamX = this.playerX * 0.45;
    const targetCamY = Math.max(this.playerY + 3.8, 3.8);
    const targetCamZ = this.playerZ + 6.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 16, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 20, dt);

    // Apply Camera Shake
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = THREE.MathUtils.damp(this.cameraShakeIntensity, 0, 10, dt);
    }

    this._camTarget.set(this.playerX * 0.2, this.playerY + 1.4, this.playerZ - 14);
    this.camera.lookAt(this._camTarget);
  }

  private triggerHitstop(duration: number) {
    this.hitstopTimer = duration;
  }

  private triggerCameraShake(intensity: number) {
    this.cameraShakeIntensity = intensity;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private emitStats() {
    let activePowerupType: 'magnet' | 'shield' | 'boost' | 'multiplier' | null = null;
    let maxRemaining = 0;

    if (this.boostTimer > maxRemaining) {
      activePowerupType = 'boost';
      maxRemaining = this.boostTimer;
    }
    if (this.shieldTimer > maxRemaining) {
      activePowerupType = 'shield';
      maxRemaining = this.shieldTimer;
    }
    if (this.magnetTimer > maxRemaining) {
      activePowerupType = 'magnet';
      maxRemaining = this.magnetTimer;
    }
    if (this.multiplierTimer > maxRemaining) {
      activePowerupType = 'multiplier';
      maxRemaining = this.multiplierTimer;
    }

    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        score: this.score,
        coins: this.coins,
        distance: Math.floor(this.distance),
        multiplier: this.multiplier,
        speed: Math.floor(this.currentSpeed * 3.6), // km/h
        activePowerup: {
          type: activePowerupType,
          remaining: maxRemaining,
        },
        highScore: this.highScore,
      });
    }
  }

  // State Transitions
  public startRun() {
    // Clear existing entities
    this.obstacles.forEach((o) => this.scene.remove(o.group));
    this.coinEntities.forEach((c) => this.scene.remove(c.group));
    this.powerupEntities.forEach((p) => this.scene.remove(p.group));
    this.particles.forEach((p) => this.scene.remove(p.mesh));

    this.obstacles = [];
    this.coinEntities = [];
    this.powerupEntities = [];
    this.particles = [];

    // Reset scores & speeds
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.multiplier = 1;
    this.currentSpeed = this.baseSpeed;
    this.boostTimer = 0;
    this.magnetTimer = 0;
    this.shieldTimer = 0;
    this.multiplierTimer = 0;

    this.resetPlayerPosition();

    // Rebuild track around 0
    this.trackChunks.forEach((chunk, i) => {
      chunk.position.z = 20 - i * this.CHUNK_LENGTH;
    });

    // Populate initial entities ahead of player
    this.spawnTrackSectionEntities(-20, -180);

    this.state = 'PLAYING';
    if (this.onStateChange) this.onStateChange('PLAYING');
    sound.playPowerup();
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (this.onStateChange) this.onStateChange('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.onStateChange) this.onStateChange('PLAYING');
    }
  }

  public resumeRun() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.onStateChange) this.onStateChange('PLAYING');
    }
  }

  public gameOver() {
    this.state = 'GAMEOVER';
    sound.playCrash();
    this.triggerHitstop(0.08);
    this.triggerCameraShake(0.8);

    // Tumble ragdoll rotation
    this.runnerRig.root.rotation.x = Math.PI / 2;
    this.runnerRig.root.position.y = 0.2;

    // Check new high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('cybersurge_highscore', String(this.highScore));
      } catch {}
    }

    if (this.onStateChange) this.onStateChange('GAMEOVER');
  }

  public getState(): GameState {
    return this.state;
  }

  public getStats(): GameStats {
    return {
      score: this.score,
      coins: this.coins,
      distance: Math.floor(this.distance),
      multiplier: this.multiplier,
      speed: Math.floor(this.currentSpeed * 3.6),
      activePowerup: {
        type: null,
        remaining: 0,
      },
      highScore: this.highScore,
    };
  }

  public dispose() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleBlur);
    this.renderer.dispose();
  }
}
