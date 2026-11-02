import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ModelFactory } from './models';
import { sound } from './audio';

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameStats {
  score: number;
  coins: number;
  samosas: number;
  distance: number;
  multiplier: number;
  speed: number;
  difficulty: GameDifficulty;
  activePowerup: {
    type: 'magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa' | null;
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
  isSamosa?: boolean;
}

interface PowerupEntity {
  group: THREE.Group;
  type: 'magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa';
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

  // Game Lifecycle State & Difficulty
  private state: GameState = 'TITLE';
  private difficulty: GameDifficulty = 'MEDIUM';
  private highScore: number = 0;
  private score: number = 0;
  private coins: number = 0;
  private samosas: number = 0;
  private distance: number = 0;
  private baseMultiplier: number = 1.5;
  private activeMultiplier: number = 1;
  private baseSpeed: number = 25;
  private maxSpeedRamp: number = 42;
  private currentSpeed: number = 25;

  private boostTimer: number = 0;
  private magnetTimer: number = 0;
  private shieldTimer: number = 0;
  private multiplierTimer: number = 0;
  private samosaBoostTimer: number = 0;

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
  private groundHeight: number = 0;

  // Motu Rig & Inspector Chingum Police Drone
  private motuRig!: ReturnType<typeof ModelFactory.createRunner>;
  private droneRig!: ReturnType<typeof ModelFactory.createChasingDrone>;
  private droneDistance: number = 6.0;
  private droneTargetDistance: number = 6.0;

  // Track & Environment Chunks
  private trackChunks: THREE.Group[] = [];
  private readonly CHUNK_LENGTH = 50;
  private readonly NUM_CHUNKS = 8;

  // Entities
  private obstacles: ObstacleEntity[] = [];
  private coinEntities: CoinEntity[] = [];
  private powerupEntities: PowerupEntity[] = [];
  private particles: ParticleEntity[] = [];

  // Hitstop & Camera Juice
  private hitstopTimer: number = 0;
  private cameraShakeIntensity: number = 0;
  private runCycle: number = 0;
  private baseFov: number = 62;

  // Reusable math objects
  private _camTarget = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadSavedSettings();
    this.initWebGL();
    this.initLightingAndEnv();
    this.initPlayer();
    this.initDrone();
    this.initTrackPool();
    this.initInput();
    this.startLoop();
  }

  private loadSavedSettings() {
    try {
      this.highScore = parseInt(localStorage.getItem('cybersurge_highscore') || '0', 10);
      const savedDiff = localStorage.getItem('cybersurge_diff') as GameDifficulty;
      if (savedDiff && (savedDiff === 'EASY' || savedDiff === 'MEDIUM' || savedDiff === 'HARD')) {
        this.difficulty = savedDiff;
      }
    } catch {
      this.highScore = 0;
      this.difficulty = 'MEDIUM';
    }
    this.applyDifficultyParameters();
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
    try {
      localStorage.setItem('cybersurge_diff', diff);
    } catch {}
    this.applyDifficultyParameters();
    this.emitStats();
  }

  public getDifficulty(): GameDifficulty {
    return this.difficulty;
  }

  private applyDifficultyParameters() {
    if (this.difficulty === 'EASY') {
      this.baseSpeed = 18;
      this.maxSpeedRamp = 28;
      this.baseMultiplier = 1.0;
    } else if (this.difficulty === 'MEDIUM') {
      this.baseSpeed = 25;
      this.maxSpeedRamp = 42;
      this.baseMultiplier = 1.5;
    } else {
      // HARD (Realistic High-Octane Rush)
      this.baseSpeed = 34; // Starts very fast!
      this.maxSpeedRamp = 56; // Extreme hyper-speed!
      this.baseMultiplier = 3.0; // High reward for hard difficulty
    }
    this.currentSpeed = this.baseSpeed;
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
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.012);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(this.baseFov, width / height, 0.1, 400);
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
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

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

    const hemiLight = new THREE.HemisphereLight(0x00f5ff, 0x1e1b4b, 0.7);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(amb);
  }

  private initPlayer() {
    this.motuRig = ModelFactory.createRunner();
    this.scene.add(this.motuRig.root);
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

    if (this.motuRig) {
      this.motuRig.root.position.set(0, 0, 0);
      this.motuRig.root.rotation.set(0, 0, 0);
      this.motuRig.root.scale.set(1, 1, 1);
      this.motuRig.shieldMesh.visible = false;
      this.motuRig.magnetRing.visible = false;
      this.motuRig.hoverboard.visible = false;
      this.motuRig.samosaAura.visible = false;
    }
  }

  private initDrone() {
    this.droneRig = ModelFactory.createChasingDrone();
    this.scene.add(this.droneRig.root);
    this.droneRig.root.position.set(0, 2.2, 6.0);
  }

  private createTrackChunk(zPos: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = zPos;

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
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

    const roadWidth = this.LANE_WIDTH * 3 + 2.5;
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.4, this.CHUNK_LENGTH),
      roadMat
    );
    road.position.set(0, -0.2, -this.CHUNK_LENGTH / 2);
    road.receiveShadow = true;
    chunk.add(road);

    [-this.LANE_WIDTH / 2, this.LANE_WIDTH / 2].forEach((x) => {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, this.CHUNK_LENGTH),
        railMat
      );
      line.rotateX(-Math.PI / 2);
      line.position.set(x, 0.01, -this.CHUNK_LENGTH / 2);
      chunk.add(line);
    });

    [-this.LANE_WIDTH * 1.5 - 0.2, this.LANE_WIDTH * 1.5 + 0.2].forEach((x) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.25, this.CHUNK_LENGTH),
        railMat
      );
      rail.position.set(x, 0.12, -this.CHUNK_LENGTH / 2);
      chunk.add(rail);

      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 1.2, this.CHUNK_LENGTH),
        sideMat
      );
      barrier.position.set(x > 0 ? x + 0.6 : x - 0.6, 0.6, -this.CHUNK_LENGTH / 2);
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      chunk.add(barrier);
    });

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

      const band = new THREE.Mesh(
        new THREE.BoxGeometry(bldgW + 0.1, 0.4, bldgD * 0.7),
        windowMat
      );
      band.position.set(bldgX + (bldgX > 0 ? 5 : -5), bldgH * 0.6, -this.CHUNK_LENGTH / 2);
      chunk.add(band);
    });

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
  }

  private spawnTrackSectionEntities(startZ: number, endZ: number) {
    if (this.state !== 'PLAYING') return;

    let currentZ = startZ;
    // Spacing depends on difficulty:
    // Easy: 34-46m spacing
    // Medium: 22-32m spacing
    // Hard: 14-22m spacing (Tight, high reaction required!)
    const minSpacing = this.difficulty === 'EASY' ? 34 : this.difficulty === 'MEDIUM' ? 22 : 14;
    const varSpacing = this.difficulty === 'EASY' ? 12 : this.difficulty === 'MEDIUM' ? 10 : 8;

    while (currentZ > endZ) {
      currentZ -= minSpacing + Math.random() * varSpacing;

      const rand = Math.random();
      const lane = Math.floor(Math.random() * 3) - 1;

      // 1. MagLev Subway Train
      if (rand < 0.32) {
        const trainGroup = ModelFactory.createTrain(26);
        trainGroup.position.set(lane * this.LANE_WIDTH, 0, currentZ);
        this.scene.add(trainGroup);

        // Moving train probability:
        // Easy: 0%
        // Medium: 35% (8 m/s)
        // Hard: 65% (14 m/s oncoming speed!)
        let trainSpeed = 0;
        if (this.difficulty === 'HARD') {
          trainSpeed = Math.random() < 0.65 ? 14.0 : 0;
        } else if (this.difficulty === 'MEDIUM') {
          trainSpeed = Math.random() < 0.35 ? 8.0 : 0;
        }

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

        // Samosa on train roof!
        const samosaPickup = ModelFactory.createSamosa();
        samosaPickup.position.set(lane * this.LANE_WIDTH, 3.4, currentZ);
        this.scene.add(samosaPickup);
        this.coinEntities.push({
          group: samosaPickup,
          lane,
          z: currentZ,
          y: 3.4,
          collected: false,
          isSamosa: true,
        });

        // Coin row along roof
        for (let cz = -8; cz <= 8; cz += 4) {
          if (cz === 0) continue;
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
      // 2. High Laser Barricade (Motu slides under)
      else if (rand < 0.58) {
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

        // Low sliding coins
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
      // 3. Low Barricade (Motu jumps over)
      else if (rand < 0.84) {
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

        // Jump arc coins
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

      // 16% chance to spawn Powerup / Samosa in adjacent lane
      if (Math.random() < 0.16) {
        const pLane = (lane + 1 > 1 ? -1 : lane + 1);
        const types: ('magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa')[] = [
          'samosa',
          'samosa',
          'magnet',
          'shield',
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

  private initInput() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('blur', this.handleBlur);

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
            if (this.state === 'TITLE' || this.state === 'GAMEOVER') this.startRun();
          }
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.state === 'TITLE' || this.state === 'GAMEOVER') {
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

      this.motuRig.root.scale.set(0.88, 1.22, 0.88);
      sound.playJump();
      this.spawnFootstepSparks(0);
    } else {
      this.jumpBufferTimer = 0.16;
    }
  }

  public slide() {
    if (!this.isGrounded) {
      this.verticalVelocity = -22;
    }
    this.isSliding = true;
    this.slideTimer = 0.65;
    sound.playSlide();
    this.spawnSlideDust();
  }

  private spawnFootstepSparks(xOffset: number) {
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
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
    const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
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

  private spawnCoinSparks(x: number, y: number, z: number, color = 0xffd700) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color });
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

  private startLoop() {
    this.clock.start();
    const tick = () => {
      this.animFrameId = requestAnimationFrame(tick);
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.state === 'TITLE') {
      const time = this.clock.getElapsedTime();
      this.camera.position.x = Math.sin(time * 0.5) * 2.5;
      this.camera.position.y = 3.2 + Math.cos(time * 0.4) * 0.6;
      this.camera.position.z = 6.0;
      this.camera.lookAt(0, 1.4, -2.5);

      this.motuRig.root.position.y = Math.sin(time * 2.5) * 0.04;
      this.motuRig.spine.rotation.x = Math.sin(time * 2.5) * 0.03;
      // Gentle belly breathing
      this.motuRig.belly.scale.set(
        1.15 + Math.sin(time * 2.5) * 0.03,
        1.05 + Math.sin(time * 2.5) * 0.03,
        1.25
      );
      return;
    }

    if (this.state === 'PAUSED') return;

    if (this.state === 'PLAYING') {
      // Speed ramp based on difficulty and distance
      const rampScale = this.difficulty === 'HARD' ? 100 : this.difficulty === 'MEDIUM' ? 180 : 250;
      const targetSpeed = Math.min(this.baseSpeed + (this.distance / rampScale), this.maxSpeedRamp);

      const isTurbo = this.boostTimer > 0 || this.samosaBoostTimer > 0;
      this.currentSpeed = isTurbo ? targetSpeed * 1.5 : targetSpeed;

      // Distance and score
      this.distance += this.currentSpeed * dt;
      const effectiveMultiplier = this.baseMultiplier * this.activeMultiplier;
      this.score += Math.floor(this.currentSpeed * dt * effectiveMultiplier * 2);

      // Power-up Timers
      if (this.samosaBoostTimer > 0) {
        this.samosaBoostTimer -= dt;
        this.motuRig.samosaAura.visible = true;
        this.motuRig.samosaAura.rotation.y += dt * 4;
        if (this.samosaBoostTimer <= 0) this.motuRig.samosaAura.visible = false;
      }

      if (this.boostTimer > 0) {
        this.boostTimer -= dt;
        this.motuRig.hoverboard.visible = true;
        if (this.boostTimer <= 0) this.motuRig.hoverboard.visible = false;
      }

      if (this.magnetTimer > 0) {
        this.magnetTimer -= dt;
        this.motuRig.magnetRing.visible = true;
        this.motuRig.magnetRing.rotation.z += dt * 6;
        if (this.magnetTimer <= 0) this.motuRig.magnetRing.visible = false;
      }

      if (this.shieldTimer > 0) {
        this.shieldTimer -= dt;
        this.motuRig.shieldMesh.visible = true;
        this.motuRig.shieldMesh.rotation.y += dt * 2;
        if (this.shieldTimer <= 0) this.motuRig.shieldMesh.visible = false;
      }

      if (this.multiplierTimer > 0) {
        this.multiplierTimer -= dt;
        this.activeMultiplier = 2;
        if (this.multiplierTimer <= 0) this.activeMultiplier = 1;
      }

      // Move player forward
      this.playerZ -= this.currentSpeed * dt;

      // Smooth Lane Switching
      const laneLerpSpeed = this.difficulty === 'HARD' ? 26 : 22;
      this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, laneLerpSpeed, dt);
      const laneDelta = this.targetX - this.playerX;
      this.motuRig.root.rotation.z = -laneDelta * 0.15;

      // Physics
      this.updateVerticalPhysics(dt);

      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      this.updateTrainSurfing();
      this.updateMotuAnimation(dt);
      this.updateDrone(dt);
      this.updateTrackChunks();
      this.updateObstacles(dt);
      this.updateCoins(dt);
      this.updatePowerups(dt);
      this.updateParticles(dt);
      this.updateCamera(dt);
      this.emitStats();
    }
  }

  private updateVerticalPhysics(dt: number) {
    const gravity = -42;

    if (!this.isGrounded) {
      this.verticalVelocity += gravity * dt;
      this.playerY += this.verticalVelocity * dt;

      if (this.playerY <= this.groundHeight) {
        this.playerY = this.groundHeight;
        this.verticalVelocity = 0;
        this.isGrounded = true;

        this.motuRig.root.scale.set(1.22, 0.76, 1.22);
        this.spawnFootstepSparks(0);

        if (this.jumpBufferTimer > 0) {
          this.jump();
        }
      }
    } else {
      this.playerY = this.groundHeight;
      const baseCoyote = this.difficulty === 'EASY' ? 0.18 : this.difficulty === 'MEDIUM' ? 0.12 : 0.06;
      this.coyoteTimer = baseCoyote;
    }

    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.coyoteTimer > 0 && !this.isGrounded) this.coyoteTimer -= dt;

    this.motuRig.root.scale.x = THREE.MathUtils.damp(this.motuRig.root.scale.x, 1, 14, dt);
    this.motuRig.root.scale.y = THREE.MathUtils.damp(this.motuRig.root.scale.y, 1, 14, dt);
    this.motuRig.root.scale.z = THREE.MathUtils.damp(this.motuRig.root.scale.z, 1, 14, dt);

    this.motuRig.root.position.set(this.playerX, this.playerY, this.playerZ);
  }

  private updateTrainSurfing() {
    let onTrain: ObstacleEntity | null = null;

    for (const obs of this.obstacles) {
      if (obs.type === 'TRAIN') {
        const trainHalfLength = (obs.length || 26) / 2;
        const trainZ = obs.group.position.z;
        const dz = Math.abs(this.playerZ - trainZ);
        const sameLane = Math.abs(this.playerX - obs.group.position.x) < 1.4;

        if (sameLane && dz < trainHalfLength + 0.5) {
          if (this.playerY >= 2.5) {
            onTrain = obs;
            break;
          }
        }
      }
    }

    if (onTrain) {
      this.groundHeight = 2.8;
    } else {
      this.groundHeight = 0;
      if (this.playerY > 0 && this.isGrounded) {
        this.isGrounded = false;
        this.verticalVelocity = 0;
      }
    }
  }

  // Realistic Motu Running Animation with Chubby Belly Jiggle & Moustache Bob!
  private updateMotuAnimation(dt: number) {
    this.runCycle += dt * this.currentSpeed * 0.45;
    const sin = Math.sin(this.runCycle);
    const cos = Math.cos(this.runCycle);

    // Iconic Potbelly Jiggle
    const bellyJiggle = Math.sin(this.runCycle * 2) * 0.06;
    this.motuRig.belly.scale.set(1.15 + bellyJiggle, 1.05 - bellyJiggle * 0.5, 1.25 + bellyJiggle);

    if (this.isSliding) {
      // Motu Rolls forward into a round ball
      this.motuRig.spine.position.y = 0.45;
      this.motuRig.spine.rotation.x = 1.0;
      this.motuRig.head.rotation.x = -0.7;
      this.motuRig.leftLeg.rotation.x = -1.2;
      this.motuRig.rightLeg.rotation.x = 1.1;
      this.motuRig.leftArm.rotation.x = 0.8;
      this.motuRig.rightArm.rotation.x = 0.8;
    } else if (!this.isGrounded) {
      // Big Airborne Leap
      this.motuRig.spine.position.y = 0.85;
      this.motuRig.spine.rotation.x = -0.15;
      this.motuRig.head.rotation.x = -0.1;
      this.motuRig.leftLeg.rotation.x = -0.6;
      this.motuRig.rightLeg.rotation.x = 0.8;
      this.motuRig.leftArm.rotation.x = 1.2;
      this.motuRig.rightArm.rotation.x = -0.9;
    } else {
      // Energetic Chubby Running Strides
      this.motuRig.spine.position.y = 0.85 + Math.abs(sin) * 0.1;
      this.motuRig.spine.rotation.x = 0.22; // Motu leans forward enthusiastically
      this.motuRig.head.rotation.x = Math.sin(this.runCycle) * 0.05;

      this.motuRig.leftLeg.rotation.x = sin * 0.95;
      this.motuRig.rightLeg.rotation.x = -sin * 0.95;

      this.motuRig.leftArm.rotation.x = -sin * 0.85;
      this.motuRig.rightArm.rotation.x = sin * 0.85;
    }
  }

  // Inspector Chingum's Police Quadcopter Pursuit
  private updateDrone(dt: number) {
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

    this.droneRig.rotors.forEach((rotor, i) => {
      rotor.rotation.y += (i % 2 === 0 ? 35 : -35) * dt;
    });

    const time = this.clock.getElapsedTime();
    const isRed = Math.sin(time * 16) > 0;
    (this.droneRig.sirenL.material as THREE.MeshBasicMaterial).color.setHex(isRed ? 0xef4444 : 0x1e3a8a);
    (this.droneRig.sirenR.material as THREE.MeshBasicMaterial).color.setHex(isRed ? 0x1e3a8a : 0x3b82f6);

    this.droneDistance = THREE.MathUtils.damp(
      this.droneDistance,
      this.droneTargetDistance,
      2.0,
      dt
    );
  }

  private updateTrackChunks() {
    for (const chunk of this.trackChunks) {
      if (chunk.position.z > this.playerZ + 40) {
        let minZ = this.playerZ;
        for (const c of this.trackChunks) {
          if (c.position.z < minZ) minZ = c.position.z;
        }

        const newZ = minZ - this.CHUNK_LENGTH;
        chunk.position.z = newZ;
        this.spawnTrackSectionEntities(newZ + this.CHUNK_LENGTH / 2, newZ - this.CHUNK_LENGTH / 2);
      }
    }
  }

  private updateObstacles(dt: number) {
    const playerHitboxRadius = 0.52; // Slightly wider for Motu's potbelly
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      if (obs.speed && obs.speed > 0) {
        obs.group.position.z += obs.speed * dt;
      }

      const obsZ = obs.group.position.z;
      if (obsZ > this.playerZ + 30) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
        continue;
      }

      if (obs.hit) continue;

      const sameLane = Math.abs(this.playerX - obs.group.position.x) < 1.15;
      const obsHalfLength = (obs.length || 1.2) / 2;
      const zOverlap = Math.abs(this.playerZ - obsZ) < obsHalfLength + playerHitboxRadius;

      if (sameLane && zOverlap) {
        if (obs.type === 'TRAIN') {
          if (this.playerY >= 2.5) {
            continue;
          } else {
            this.handlePlayerHit(obs);
          }
        } else if (obs.type === 'HIGH_LASER') {
          if (this.isSliding) {
            continue;
          } else {
            this.handlePlayerHit(obs);
          }
        } else if (obs.type === 'LOW_BARRICADE') {
          if (this.playerY > 0.95) {
            continue;
          } else {
            this.handlePlayerHit(obs);
          }
        } else if (obs.type === 'TALL_PILLAR') {
          this.handlePlayerHit(obs);
        }
      }
    }
  }

  private handlePlayerHit(obs: ObstacleEntity) {
    obs.hit = true;

    if (this.boostTimer > 0 || this.samosaBoostTimer > 0) {
      sound.playCrash();
      this.triggerHitstop(0.04);
      this.triggerCameraShake(0.3);
      this.spawnCoinSparks(obs.group.position.x, 1.2, obs.group.position.z, 0xf59e0b);
      this.scene.remove(obs.group);
      return;
    }

    if (this.shieldTimer > 0) {
      this.shieldTimer = 0;
      this.motuRig.shieldMesh.visible = false;
      sound.playShieldBreak();
      this.triggerHitstop(0.08);
      this.triggerCameraShake(0.5);
      this.spawnFootstepSparks(0);
      this.droneDistance = 2.2;
      return;
    }

    this.gameOver();
  }

  private updateCoins(dt: number) {
    const magnetRadius = this.magnetTimer > 0 ? 12 : 1.2;

    for (let i = this.coinEntities.length - 1; i >= 0; i--) {
      const coin = this.coinEntities[i];
      coin.group.rotation.y += dt * 5;

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

      if (this.magnetTimer > 0 && dist < magnetRadius) {
        coin.group.position.x += dx * dt * 8;
        coin.group.position.y += dy * dt * 8;
        coin.group.position.z += dz * dt * 8;
      }

      if (dist < 1.45) {
        coin.collected = true;

        if (coin.isSamosa) {
          // Motu's Crispy Samosa Grab!
          this.samosas++;
          this.score += 200 * this.activeMultiplier;
          this.samosaBoostTimer = 6;
          sound.playSamosa();
          this.spawnCoinSparks(coin.group.position.x, coin.y, coin.z, 0xffbb00);
        } else {
          this.coins += 1 * this.activeMultiplier;
          this.score += 50 * this.activeMultiplier;
          sound.playCoin();
          this.spawnCoinSparks(coin.group.position.x, coin.y, coin.z, 0xffd700);
        }

        this.scene.remove(coin.group);
        this.coinEntities.splice(i, 1);
      }
    }
  }

  private updatePowerups(dt: number) {
    for (let i = this.powerupEntities.length - 1; i >= 0; i--) {
      const p = this.powerupEntities[i];
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

  private activatePowerup(type: 'magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa') {
    if (type === 'samosa' || type === 'boost') {
      this.samosas++;
      this.samosaBoostTimer = 7;
      sound.playSamosa();
      this.triggerCameraShake(0.35);
      return;
    }

    sound.playPowerup();
    this.triggerCameraShake(0.2);

    if (type === 'magnet') {
      this.magnetTimer = 10;
    } else if (type === 'shield') {
      this.shieldTimer = 15;
    } else if (type === 'multiplier') {
      this.multiplierTimer = 12;
      this.activeMultiplier = 2;
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
      p.vy -= 9.8 * dt;

      const progress = p.life / p.maxLife;
      p.mesh.scale.setScalar(1 - progress);
    }
  }

  // Realistic Dynamic Camera with Speed Warp FOV
  private updateCamera(dt: number) {
    const targetCamX = this.playerX * 0.45;
    const targetCamY = Math.max(this.playerY + 3.8, 3.8);
    const targetCamZ = this.playerZ + 6.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 16, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 12, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 20, dt);

    // Realistic Speed Warp FOV (expands up to 74 degrees on Hard mode or Turbo Samosa!)
    const targetFov = this.baseFov + (this.currentSpeed - 24) * 0.55;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, Math.min(targetFov, 76), 6, dt);
    this.camera.updateProjectionMatrix();

    // High Speed Vibration / Rumble on Hard mode
    if (this.difficulty === 'HARD' && this.currentSpeed > 32) {
      const rumble = (this.currentSpeed - 32) * 0.003;
      this.camera.position.x += (Math.random() - 0.5) * rumble;
      this.camera.position.y += (Math.random() - 0.5) * rumble;
    }

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
    let activePowerupType: 'magnet' | 'shield' | 'boost' | 'multiplier' | 'samosa' | null = null;
    let maxRemaining = 0;

    if (this.samosaBoostTimer > maxRemaining) {
      activePowerupType = 'samosa';
      maxRemaining = this.samosaBoostTimer;
    }
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
        samosas: this.samosas,
        distance: Math.floor(this.distance),
        multiplier: Math.round(this.baseMultiplier * this.activeMultiplier * 10) / 10,
        speed: Math.floor(this.currentSpeed * 3.6),
        difficulty: this.difficulty,
        activePowerup: {
          type: activePowerupType,
          remaining: maxRemaining,
        },
        highScore: this.highScore,
      });
    }
  }

  public startRun() {
    this.obstacles.forEach((o) => this.scene.remove(o.group));
    this.coinEntities.forEach((c) => this.scene.remove(c.group));
    this.powerupEntities.forEach((p) => this.scene.remove(p.group));
    this.particles.forEach((p) => this.scene.remove(p.mesh));

    this.obstacles = [];
    this.coinEntities = [];
    this.powerupEntities = [];
    this.particles = [];

    this.score = 0;
    this.coins = 0;
    this.samosas = 0;
    this.distance = 0;
    this.activeMultiplier = 1;
    this.boostTimer = 0;
    this.samosaBoostTimer = 0;
    this.magnetTimer = 0;
    this.shieldTimer = 0;
    this.multiplierTimer = 0;

    this.applyDifficultyParameters();
    this.resetPlayerPosition();

    this.trackChunks.forEach((chunk, i) => {
      chunk.position.z = 20 - i * this.CHUNK_LENGTH;
    });

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

    this.motuRig.root.rotation.x = Math.PI / 2;
    this.motuRig.root.position.y = 0.2;

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

  public dispose() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleBlur);
    this.renderer.dispose();
  }
}
