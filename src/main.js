import * as THREE from 'three';

// =========================================================
// 1. HỆ THỐNG ÂM THANH ĐA VŨ KHÍ (WEB AUDIO SYNTHESIZER)
// =========================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioClass();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playWeaponSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'operator') {
      // Tiếng đại bác Operator nổ rền vang
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(18, now + 0.32);
      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'phantom' || type === 'spectre') {
      // Tiếng giảm thanh êm ái (Silenced Pew)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.07);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'sheriff') {
      // Tiếng côn xoay Sheriff đanh gọn
      osc.type = 'square';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      // Tiếng Vandal đanh thép
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(155, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.11);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  } catch (e) {}
}

function playHeadshotSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [1520, 3040].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    });
  } catch (e) {}
}

// =========================================================
// 2. THÔNG SỐ 5 VŨ KHÍ CHUẨN VALORANT
// =========================================================
const WEAPONS = {
  vandal: {
    name: 'VANDAL',
    auto: true,           // Cho phép giữ chuột sấy
    fireRate: 0.102,      // ~9.75 viên/giây
    magSize: 25,
    headDmg: 160,
    bodyDmg: 40,
    recoilKick: 0.018,    // Độ giật mỗi viên khi sấy
    moveSpeed: 5.4,       // Tốc độ chạy chuẩn
    adsType: 'ads',       // Ngắm ADS 1.25x
    adsFov: 56,
    color: 0x00f0ff,
    scaleZ: 1.0,
  },
  phantom: {
    name: 'PHANTOM',
    auto: true,
    fireRate: 0.09,       // 11 viên/giây (Sấy cực nhanh)
    magSize: 30,
    headDmg: 140,
    bodyDmg: 35,
    recoilKick: 0.013,    // Ít giật hơn Vandal
    moveSpeed: 5.4,
    adsType: 'ads',
    adsFov: 56,
    color: 0x38ef7d,
    scaleZ: 1.12,         // Nòng giảm thanh dài hơn
  },
  operator: {
    name: 'OPERATOR',
    auto: false,          // Bắn từng viên (Bolt-action)
    fireRate: 0.75,
    magSize: 5,
    headDmg: 255,
    bodyDmg: 150,         // 1 viên vào thân cũng chết
    recoilKick: 0.09,
    moveSpeed: 4.5,       // Súng ngắm nặng chạy chậm hơn
    adsType: 'scope',     // Ống ngắm Sniper Scope 2.5x
    adsFov: 28,
    color: 0xffb703,
    scaleZ: 1.4,
  },
  sheriff: {
    name: 'SHERIFF',
    auto: false,          // Lục côn xoay Tap từng viên
    fireRate: 0.22,
    magSize: 6,
    headDmg: 159,
    bodyDmg: 55,
    recoilKick: 0.04,
    moveSpeed: 5.9,       // Cầm súng lục chạy nhanh
    adsType: 'ads',
    adsFov: 60,
    color: 0xff4655,
    scaleZ: 0.55,
  },
  spectre: {
    name: 'SPECTRE',
    auto: true,           // Tiểu liên SMG sấy tầm gần
    fireRate: 0.075,      // 13.33 viên/giây
    magSize: 30,
    headDmg: 78,
    bodyDmg: 26,
    recoilKick: 0.011,
    moveSpeed: 5.8,
    adsType: 'ads',
    adsFov: 58,
    color: 0xa855f7,
    scaleZ: 0.75,
  },
};

let currentWeaponKey = 'vandal';
let currentWeapon = WEAPONS[currentWeaponKey];
let currentAmmo = currentWeapon.magSize;
let isReloading = false;
let isADS = false;       // Trạng thái Bật/Tắt ngắm chuột phải
let isMouseDown = false; // Giữ chuột trái để sấy
let lastShotTime = 0;
let sprayCount = 0;      // Đếm số viên đang sấy liên tục để tính độ giật

// =========================================================
// 3. KHỞI TẠO SCENE, CAMERA & MÔI TRƯỜNG
// =========================================================
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d14);
scene.fog = new THREE.FogExp2(0x080d14, 0.01);

const DEFAULT_FOV = 70.53; // 103° Horizontal FOV chuẩn Valorant
const camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 0.05, 300);
camera.rotation.order = 'YXZ';

const player = {
  position: new THREE.Vector3(0, 1.65, 10),
  velocity: new THREE.Vector3(0, 0, 0),
  pitch: 0,
  yaw: 0,
  recoilPitch: 0,
  recoilYaw: 0,
  isGrounded: true,
  hp: 100,
  shield: 50,
};
camera.position.copy(player.position);
scene.add(camera);

const ambientLight = new THREE.HemisphereLight(0xdbe9f4, 0x111c26, 1.15);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(15, 35, 20);
scene.add(keyLight);

// Sàn và kiến trúc phòng tập
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f1822, roughness: 0.3, metalness: 0.3 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 140), floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const gridHelper = new THREE.GridHelper(90, 90, 0xff4655, 0x182635);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Tường bao quanh đấu trường
const backWall = new THREE.Mesh(
  new THREE.BoxGeometry(56, 22, 2),
  new THREE.MeshStandardMaterial({ color: 0x121d28, roughness: 0.5 })
);
backWall.position.set(0, 11, -52);
scene.add(backWall);

// Group chứa các Chướng Ngại Vật (Tường chắn, Thùng Radianite cho Phòng 3 & Phòng 4)
const obstaclesGroup = new THREE.Group();
scene.add(obstaclesGroup);
const obstacleMeshes = [];

function buildObstacles() {
  // Xóa vật cản cũ nếu có
  while (obstaclesGroup.children.length > 0) {
    obstaclesGroup.remove(obstaclesGroup.children[0]);
  }
  obstacleMeshes.length = 0;

  const boxMat = new THREE.MeshStandardMaterial({ color: 0x19323c, roughness: 0.3, metalness: 0.5 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x222f3e, roughness: 0.4 });

  // 1. Tường chắn thấp trước mặt người chơi để nấp (Cover Wall)
  const playerCover = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.25, 0.5), wallMat);
  playerCover.position.set(-2.5, 0.625, 5);
  obstaclesGroup.add(playerCover);
  obstacleMeshes.push(playerCover);

  // 2. Các thùng Radianite và vách tường ở khu vực giữa sân để Bot lấp ló (Peek)
  const positions = [
    { x: -5, z: -12, w: 2.2, h: 2.2 },
    { x: 5, z: -14, w: 2.2, h: 2.2 },
    { x: 0, z: -20, w: 3.0, h: 2.4 },
    { x: -7, z: -24, w: 2.4, h: 2.4 },
    { x: 7, z: -24, w: 2.4, h: 2.4 },
  ];

  positions.forEach((p) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, 1.2), boxMat);
    crate.position.set(p.x, p.h / 2, p.z);
    obstaclesGroup.add(crate);
    obstacleMeshes.push(crate);

    // Viền sáng Radianite trên thùng
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(p.w + 0.05, 0.08, 1.25),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    rim.position.set(p.x, p.h - 0.1, p.z);
    obstaclesGroup.add(rim);
  });
}

buildObstacles();
obstaclesGroup.visible = false; // Mặc định Phòng 1 không hiện vật cản

// =========================================================
// 4. MÔ HÌNH VŨ KHÍ 3D BIẾN HÌNH THEO LOẠI SÚNG
// =========================================================
const gunGroup = new THREE.Group();
camera.add(gunGroup);

const gunBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.09, 0.13, 0.58),
  new THREE.MeshStandardMaterial({ color: 0x141b22, roughness: 0.2, metalness: 0.85 })
);
gunGroup.add(gunBody);

const radianiteCore = new THREE.Mesh(
  new THREE.BoxGeometry(0.095, 0.028, 0.28),
  new THREE.MeshBasicMaterial({ color: 0x00f0ff })
);
radianiteCore.position.set(0, 0.04, -0.02);
gunGroup.add(radianiteCore);

const gunBarrel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.02, 0.02, 0.45, 12),
  new THREE.MeshStandardMaterial({ color: 0x090d12, metalness: 0.95 })
);
gunBarrel.rotation.x = Math.PI / 2;
gunBarrel.position.set(0, 0.02, -0.48);
gunGroup.add(gunBarrel);

// Ống ngắm 3D trên thân súng (Hiện rõ khi cầm Operator)
const scopeTube = new THREE.Mesh(
  new THREE.CylinderGeometry(0.032, 0.038, 0.32, 14),
  new THREE.MeshStandardMaterial({ color: 0x11161d, metalness: 0.9 })
);
scopeTube.rotation.x = Math.PI / 2;
scopeTube.position.set(0, 0.11, -0.05);
scopeTube.visible = false;
gunGroup.add(scopeTube);

const gunMag = new THREE.Mesh(
  new THREE.BoxGeometry(0.065, 0.24, 0.11),
  new THREE.MeshStandardMaterial({ color: 0xff4655, roughness: 0.35 })
);
gunMag.position.set(0, -0.15, -0.05);
gunMag.rotation.x = 0.26;
gunGroup.add(gunMag);

const muzzleFlash = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.12, 0),
  new THREE.MeshBasicMaterial({ color: 0xffd000 })
);
muzzleFlash.position.set(0, 0.02, -0.78);
muzzleFlash.visible = false;
gunGroup.add(muzzleFlash);

const hipGunPos = new THREE.Vector3(0.24, -0.22, -0.56);
const adsGunPos = new THREE.Vector3(0.0, -0.135, -0.42); // Đưa súng vào giữa mắt khi bật ngắm ADS
let targetGunPos = hipGunPos.clone();
let recoilOffset = 0;

function selectWeapon(key) {
  if (!WEAPONS[key]) return;
  currentWeaponKey = key;
  currentWeapon = WEAPONS[key];
  currentAmmo = currentWeapon.magSize;
  isReloading = false;
  sprayCount = 0;

  // Tắt ngắm khi đổi súng
  if (isADS) toggleADS(false);

  // Đổi hình dáng và màu lõi năng lượng của súng
  radianiteCore.material.color.setHex(currentWeapon.color);
  gunGroup.scale.set(1, 1, currentWeapon.scaleZ);
  scopeTube.visible = key === 'operator';
  gunMag.visible = key !== 'sheriff';

  // Cập nhật HUD
  document.getElementById('ammo-curr').textContent = currentAmmo;
  document.getElementById('ammo-max').textContent = currentWeapon.magSize;
  document.querySelectorAll('.w-slot').forEach((el) => {
    el.classList.toggle('active', el.dataset.wep === key);
  });
}

// =========================================================
// 5. BẬT / TẮT NGẮM CHUỘT PHẢI (TOGGLE ADS / SNIPER SCOPE)
// =========================================================
const sniperScopeEl = document.getElementById('sniper-scope');
const crosshairEl = document.getElementById('crosshair-container');
const adsIndicatorEl = document.getElementById('ads-indicator');

function toggleADS(forceState) {
  isADS = typeof forceState === 'boolean' ? forceState : !isADS;

  if (isADS) {
    camera.fov = currentWeapon.adsFov;
    targetGunPos.copy(adsGunPos);
    adsIndicatorEl.textContent = currentWeapon.adsType === 'scope' ? 'SNIPER SCOPE 2.5X' : 'ADS 1.25X';

    if (currentWeapon.adsType === 'scope') {
      // Súng ngắm Operator: Hiện ống ngắm Sniper, ẩn súng 3D
      sniperScopeEl.classList.remove('hidden');
      crosshairEl.style.opacity = '0';
      gunGroup.visible = false;
    }
  } else {
    camera.fov = DEFAULT_FOV;
    targetGunPos.copy(hipGunPos);
    adsIndicatorEl.textContent = 'HIPFIRE';
    sniperScopeEl.classList.add('hidden');
    crosshairEl.style.opacity = '1';
    gunGroup.visible = true;
  }
  camera.updateProjectionMatrix();
}

// Chặn menu chuột phải của trình duyệt
window.addEventListener('contextmenu', (e) => e.preventDefault());

// =========================================================
// 6. HỆ THỐNG 4 PHÒNG TẬP (ROOMS) & BOT AI 5 LEVEL
// =========================================================
let currentRoom = 'range'; // 'range' | 'reflex' | 'obstacle' | 'combat'
let combatLevel = 1;       // Level 1 -> Level 5 (Boss)

const LEVEL_CONFIGS = {
  1: { title: 'LEVEL 1 // IRON BOT (Tập Sự)', hp: 100, speed: 2.0, fireInterval: 1.4, accuracy: 0.25, dmg: 12 },
  2: { title: 'LEVEL 2 // GOLD BOT (Biết Strafe)', hp: 125, speed: 4.0, fireInterval: 1.0, accuracy: 0.4, dmg: 16 },
  3: { title: 'LEVEL 3 // IMMORTAL BOT (Peek Vật Cản)', hp: 150, speed: 5.5, fireInterval: 0.75, accuracy: 0.55, dmg: 20 },
  4: { title: 'LEVEL 4 // RADIANT BOT (Siêu Tốc)', hp: 220, speed: 7.2, fireInterval: 0.55, accuracy: 0.7, dmg: 25 },
  5: { title: 'LEVEL 5 // FINAL BOSS: ULTRA RADIANT AI', hp: 350, speed: 9.2, fireInterval: 0.38, accuracy: 0.85, dmg: 32 },
};

const bots = [];
const botHeadList = [];
const botBodyList = [];

function createValorantBot(x, z) {
  const botGroup = new THREE.Group();
  botGroup.position.set(x, 0, z);

  // Thân Bot
  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.1, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x1f2b38, roughness: 0.3, metalness: 0.7 })
  );
  bodyMesh.position.y = 0.95;
  botGroup.add(bodyMesh);

  // Giáp ngực
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.45, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xff4655, roughness: 0.3 })
  );
  chestPlate.position.set(0, 1.05, 0.2);
  botGroup.add(chestPlate);

  // Súng của Bot (Khi ở phòng Đấu Súng)
  const botGun = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.12, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xffb703 })
  );
  botGun.position.set(0.38, 1.1, 0.3);
  botGroup.add(botGun);

  // Đầu Bot (Hitbox Headshot)
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff4655, roughness: 0.15, metalness: 0.4 })
  );
  headMesh.position.y = 1.72;
  botGroup.add(headMesh);

  // Kính Visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.09, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  visor.position.set(0, 1.74, 0.19);
  botGroup.add(visor);

  scene.add(botGroup);

  const botObj = {
    group: botGroup,
    head: headMesh,
    body: bodyMesh,
    gun: botGun,
    alive: true,
    hp: 100,
    maxHp: 100,
    spawnTime: performance.now(),
    strafeDir: Math.random() > 0.5 ? 1 : -1,
    nextStrafeFlip: performance.now() + 800,
    lastBotShot: performance.now(),
  };

  headMesh.userData = { parentBot: botObj, isHead: true };
  bodyMesh.userData = { parentBot: botObj, isHead: false };

  bots.push(botObj);
  botHeadList.push(headMesh);
  botBodyList.push(bodyMesh);
}

// Khởi tạo 4 Bot trong pool
createValorantBot(0, -12);
createValorantBot(-4.5, -18);
createValorantBot(4.5, -18);
createValorantBot(0, -25);

function switchRoom(roomName) {
  currentRoom = roomName;
  document.querySelectorAll('.arena-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.room === roomName);
  });

  const levelBar = document.getElementById('combat-level-bar');

  // Thay đổi ánh sáng & vật cản theo từng phòng
  if (roomName === 'range') {
    scene.background.setHex(0x080d14);
    obstaclesGroup.visible = false;
    levelBar.classList.add('hidden');
  } else if (roomName === 'reflex') {
    // Phòng Phản Xạ: Tối tập trung cao độ, chỉ hiện 1 con Bot mỗi lần
    scene.background.setHex(0x040609);
    obstaclesGroup.visible = false;
    levelBar.classList.add('hidden');
  } else if (roomName === 'obstacle') {
    // Phòng Vật Cản: Hiện tường chắn & thùng Radianite, Bot Strafe & Peek
    scene.background.setHex(0x0c1620);
    obstaclesGroup.visible = true;
    levelBar.classList.add('hidden');
  } else if (roomName === 'combat') {
    // Phòng Đấu Súng AI 5 Level
    scene.background.setHex(0x160a0e);
    obstaclesGroup.visible = true;
    levelBar.classList.remove('hidden');
    healPlayerFull();
  }

  // Đặt lại vị trí các Bot
  bots.forEach((bot, idx) => {
    if (roomName === 'reflex' && idx > 0) {
      bot.alive = false;
      bot.group.visible = false;
    } else if (roomName === 'combat' && combatLevel === 5 && idx > 0) {
      // Level 5 Boss: Đấu 1v1 hoặc 2 Boss siêu mạnh
      bot.alive = idx < 2;
      bot.group.visible = idx < 2;
      if (bot.alive) respawnBot(bot);
    } else {
      respawnBot(bot);
    }
  });
}

function respawnBot(bot) {
  bot.alive = true;
  bot.group.visible = true;
  bot.spawnTime = performance.now();
  bot.lastBotShot = performance.now() + 500;

  if (currentRoom === 'combat') {
    const cfg = LEVEL_CONFIGS[combatLevel];
    bot.hp = cfg.hp;
    bot.maxHp = cfg.hp;
    updateBossHpBar();
  } else {
    bot.hp = 100;
    bot.maxHp = 100;
  }

  const rx = (Math.random() - 0.5) * 16;
  const rz = -11 - Math.random() * 18;
  bot.group.position.set(rx, 0, rz);
}

function updateBossHpBar() {
  if (currentRoom !== 'combat') return;
  const totalHp = bots.reduce((sum, b) => sum + (b.alive ? Math.max(0, b.hp) : 0), 0);
  const totalMax = bots.reduce((sum, b) => sum + (b.alive ? b.maxHp : 0), 0);
  const pct = totalMax > 0 ? (totalHp / totalMax) * 100 : 0;
  document.getElementById('boss-hp-fill').style.width = `${pct}%`;
  document.getElementById('level-title').textContent = LEVEL_CONFIGS[combatLevel].title;
}

function healPlayerFull() {
  player.hp = 100;
  player.shield = 50;
  document.getElementById('player-hp').textContent = player.hp;
  document.getElementById('player-shield').textContent = player.shield;
}

// =========================================================
// 7. HIỆU ỨNG TIA ĐẠN (TRACER) & HẠT NỔ SPARKS
// =========================================================
const TRACER_COUNT = 14;
const tracers = [];
const tracerGeo = new THREE.CylinderGeometry(0.012, 0.012, 3.0, 6);

for (let i = 0; i < TRACER_COUNT; i++) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
  const mesh = new THREE.Mesh(tracerGeo, mat);
  mesh.visible = false;
  scene.add(mesh);
  tracers.push({ mesh, active: false, life: 0 });
}

function spawnTracer(startPos, endPos, colorHex = 0xffd000) {
  const t = tracers.find((item) => !item.active) || tracers[0];
  t.active = true;
  t.life = 0.09;
  t.mesh.material.color.setHex(colorHex);
  t.mesh.visible = true;

  const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
  t.mesh.position.copy(mid);
  t.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endPos.clone().sub(startPos).normalize());
}

const PARTICLE_COUNT = 45;
const particles = [];
const pGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
const pMat = new THREE.MeshBasicMaterial({ color: 0xff4655 });

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const mesh = new THREE.Mesh(pGeo, pMat);
  mesh.visible = false;
  scene.add(mesh);
  particles.push({ mesh, vel: new THREE.Vector3(), life: 0 });
}

function spawnHeadshotSparks(pos) {
  for (let i = 0; i < 18; i++) {
    const p = particles.find((item) => item.life <= 0);
    if (!p) break;
    p.mesh.position.copy(pos);
    p.mesh.visible = true;
    p.life = 0.42;
    p.vel.set((Math.random() - 0.5) * 12, Math.random() * 8 + 3, (Math.random() - 0.5) * 12);
  }
}

// =========================================================
// 8. CƠ CHẾ BẮN SÚNG (TAP & SẤY SPRAY RECOIL)
// =========================================================
const raycaster = new THREE.Raycaster();
let totalShots = 0;
let totalHits = 0;
let totalKills = 0;
let headshotKills = 0;

const killCountEl = document.getElementById('kill-count');
const hsRateEl = document.getElementById('hs-rate');
const accRateEl = document.getElementById('acc-rate');
const reactionEl = document.getElementById('reaction-time');
const hitmarkerEl = document.getElementById('hitmarker');
const killBannerEl = document.getElementById('kill-banner');
const bannerTextEl = document.getElementById('banner-text');

function showBanner(text) {
  if (!killBannerEl) return;
  bannerTextEl.textContent = text;
  killBannerEl.classList.remove('hidden');
  setTimeout(() => killBannerEl.classList.add('hidden'), 550);
}

function triggerHitmarker(isHeadshot) {
  if (!hitmarkerEl) return;
  hitmarkerEl.classList.remove('hidden', 'active');
  void hitmarkerEl.offsetWidth;
  hitmarkerEl.classList.add('active');

  const color = isHeadshot ? '#ff4655' : '#00f0ff';
  hitmarkerEl.querySelector('.hm-1').style.background = color;
  hitmarkerEl.querySelector('.hm-2').style.background = color;

  if (isHeadshot) showBanner('HEADSHOT');

  setTimeout(() => {
    hitmarkerEl.classList.remove('active');
    hitmarkerEl.classList.add('hidden');
  }, 90);
}

function reloadWeapon() {
  if (isReloading || currentAmmo === currentWeapon.magSize) return;
  isReloading = true;
  document.getElementById('ammo-curr').textContent = 'RLD';
  setTimeout(() => {
    currentAmmo = currentWeapon.magSize;
    isReloading = false;
    document.getElementById('ammo-curr').textContent = currentAmmo;
  }, 900);
}

function fireSingleBullet(nowSec) {
  if (document.pointerLockElement !== canvas || isReloading) return;
  if (currentAmmo <= 0) {
    reloadWeapon();
    return;
  }

  lastShotTime = nowSec;
  currentAmmo--;
  document.getElementById('ammo-curr').textContent = currentAmmo;
  totalShots++;
  playWeaponSound(currentWeaponKey);

  // Tăng chỉ số sấy liên thanh (Spray Recoil)
  sprayCount++;
  const adsMult = isADS ? 0.65 : 1.0;
  player.recoilPitch += currentWeapon.recoilKick * adsMult;
  if (sprayCount > 4) {
    // Sấy sang viên thứ 5 trở đi bắt đầu lắc ngang như Valorant
    player.recoilYaw += Math.sin(sprayCount * 1.1) * currentWeapon.recoilKick * 0.75 * adsMult;
  }

  recoilOffset = 0.12;
  muzzleFlash.visible = !isADS || currentWeapon.adsType !== 'scope';
  setTimeout(() => { muzzleFlash.visible = false; }, 32);

  // Độ lệch đạn khi vừa chạy vừa bắn hoặc sấy quá dài
  const speedPenalty = player.velocity.length() > 1.2 ? 0.035 : 0;
  const spraySpread = Math.min(0.04, Math.max(0, (sprayCount - 3) * 0.004)) * adsMult;
  const spreadX = (Math.random() - 0.5) * (speedPenalty + spraySpread);
  const spreadY = (Math.random() - 0.5) * (speedPenalty + spraySpread);

  raycaster.setFromCamera(new THREE.Vector2(spreadX, spreadY), camera);

  // Kiểm tra xem đạn có bị tường chắn cản lại không
  const allTargets = obstaclesGroup.visible
    ? [...obstacleMeshes, ...botHeadList, ...botBodyList]
    : [...botHeadList, ...botBodyList];

  const intersects = raycaster.intersectObjects(allTargets);
  let targetPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(55));

  if (intersects.length > 0) {
    const hit = intersects[0];
    targetPoint = hit.point;
    const hitObj = hit.object;

    // Nếu trúng Bot (không bị tường che)
    if (hitObj.userData && hitObj.userData.parentBot) {
      totalHits++;
      const bot = hitObj.userData.parentBot;

      if (bot.alive) {
        const isHead = hitObj.userData.isHead;
        const dmg = isHead ? currentWeapon.headDmg : currentWeapon.bodyDmg;
        bot.hp -= dmg;

        if (isHead) {
          playHeadshotSound();
          triggerHitmarker(true);
          spawnHeadshotSparks(hit.point);
        } else {
          triggerHitmarker(false);
        }

        if (bot.hp <= 0) {
          totalKills++;
          if (isHead) headshotKills++;

          const reactMs = Math.round(performance.now() - bot.spawnTime);
          if (reactionEl) reactionEl.innerHTML = `${reactMs}<small>ms</small>`;

          bot.alive = false;
          bot.group.visible = false;
          setTimeout(() => respawnBot(bot), currentRoom === 'reflex' ? 250 : 400);
        }
        updateBossHpBar();
      }
    }
  }

  const gunMuzzleWorld = new THREE.Vector3(0.2, -0.18, -1.2).applyMatrix4(camera.matrixWorld);
  spawnTracer(gunMuzzleWorld, targetPoint, currentWeapon.color);

  if (killCountEl) killCountEl.textContent = totalKills;
  const hsPct = totalKills > 0 ? Math.round((headshotKills / totalKills) * 100) : 100;
  const accPct = totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 100;
  if (hsRateEl) hsRateEl.textContent = `${hsPct}%`;
  if (accRateEl) accRateEl.textContent = `${accPct}%`;
}

// Sự kiện Chuột Trái (Bắn/Sấy) & Chuột Phải (Bật/Tắt Ngắm)
window.addEventListener('mousedown', (e) => {
  if (document.pointerLockElement !== canvas) return;
  if (e.button === 0) {
    isMouseDown = true;
    const nowSec = performance.now() / 1000;
    if (nowSec - lastShotTime >= currentWeapon.fireRate) {
      fireSingleBullet(nowSec);
    }
  } else if (e.button === 2) {
    // Chuột phải: BẬT / TẮT NGẮM (Toggle)
    toggleADS();
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) isMouseDown = false;
});

// =========================================================
// 9. TRÍ TUỆ NHÂN TẠO CỦA BOT (DI CHUYỂN STRAFE, PEEK & BẮN TRẢ)
// =========================================================
const damageVignette = document.getElementById('damage-vignette');

function updateBotsAI(currentTime, deltaSec) {
  bots.forEach((bot) => {
    if (!bot.alive) return;

    // 1. Phòng Phản Xạ (Reflex): Bot tự biến mất sau 650ms nếu người chơi không kịp bắn!
    if (currentRoom === 'reflex') {
      if (currentTime - bot.spawnTime > 650) {
        bot.alive = false;
        bot.group.visible = false;
        setTimeout(() => respawnBot(bot), 250);
      }
      return;
    }

    // 2. Phòng Vật Cản (Obstacle) & Phòng Đấu Súng (Combat): Bot di chuyển Strafe & Peek
    if (currentRoom === 'obstacle' || currentRoom === 'combat') {
      const speed = currentRoom === 'combat' ? LEVEL_CONFIGS[combatLevel].speed : 4.8;

      if (currentTime > bot.nextStrafeFlip) {
        bot.strafeDir *= -1;
        // Level 5 Boss đổi hướng cực kỳ khó đoán (Jiggle Peek)
        bot.nextStrafeFlip = currentTime + (combatLevel === 5 ? 250 + Math.random() * 450 : 600 + Math.random() * 800);
      }

      bot.group.position.x += bot.strafeDir * speed * deltaSec;
      if (bot.group.position.x > 11) {
        bot.group.position.x = 11;
        bot.strafeDir = -1;
      } else if (bot.group.position.x < -11) {
        bot.group.position.x = -11;
        bot.strafeDir = 1;
      }
    }

    // 3. Phòng Đấu Súng (Combat): Bot ngắm và bắn trả người chơi!
    if (currentRoom === 'combat' && document.pointerLockElement === canvas) {
      const cfg = LEVEL_CONFIGS[combatLevel];
      if ((currentTime - bot.lastBotShot) / 1000 >= cfg.fireInterval) {
        bot.lastBotShot = currentTime;

        const botMuzzle = bot.group.position.clone().add(new THREE.Vector3(0, 1.4, 0.3));
        const toPlayer = player.position.clone().sub(botMuzzle).normalize();

        // Kiểm tra xem người chơi có đang nấp sau tường chắn không
        raycaster.set(botMuzzle, toPlayer);
        const hits = raycaster.intersectObjects(obstacleMeshes);
        const distToPlayer = botMuzzle.distanceTo(player.position);
        const isBlockedByCover = hits.length > 0 && hits[0].distance < distToPlayer;

        // Vẽ tia đạn laser đỏ của Bot bắn về phía người chơi
        const endLaser = isBlockedByCover ? hits[0].point : player.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, -0.2, 0));
        spawnTracer(botMuzzle, endLaser, 0xff2233);

        // Nếu người chơi không nấp sau vật cản và Bot bắn trúng
        if (!isBlockedByCover && Math.random() < cfg.accuracy) {
          let dmg = cfg.dmg;
          if (player.shield > 0) {
            const absorb = Math.min(player.shield, Math.round(dmg * 0.66));
            player.shield -= absorb;
            dmg -= absorb;
          }
          player.hp = Math.max(0, player.hp - dmg);

          document.getElementById('player-hp').textContent = player.hp;
          document.getElementById('player-shield').textContent = player.shield;

          damageVignette.classList.add('hit');
          setTimeout(() => damageVignette.classList.remove('hit'), 160);

          if (player.hp <= 0) {
            showBanner('BẠN ĐÃ GỤC - HỒI SINH!');
            healPlayerFull();
          }
        }
      }
    }
  });
}

// =========================================================
// 10. DI CHUYỂN & GÓC NHÌN CHUỘT + PHÍM TẮT ĐỔI SÚNG/PHÒNG
// =========================================================
let valorantSens = 0.35;
const VALORANT_YAW_DEG = 0.07;
const DEG_TO_RAD = Math.PI / 180;

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  const dx = e.movementX || 0;
  const dy = e.movementY || 0;

  // Khi bật ngắm Scope/ADS thì tốc độ chuột giảm tương ứng theo tỉ lệ Zoom
  const zoomSensMult = isADS ? (currentWeapon.adsFov / DEFAULT_FOV) : 1.0;

  player.yaw -= dx * valorantSens * zoomSensMult * VALORANT_YAW_DEG * DEG_TO_RAD;
  player.pitch -= dy * valorantSens * zoomSensMult * VALORANT_YAW_DEG * DEG_TO_RAD;
  player.pitch = Math.max(-89 * DEG_TO_RAD, Math.min(89 * DEG_TO_RAD, player.pitch));
});

const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;

  // Nhảy
  if (k === ' ' && player.isGrounded && document.pointerLockElement === canvas) {
    player.velocity.y = 5.4;
    player.isGrounded = false;
  }

  // Nạp đạn
  if (k === 'r') reloadWeapon();

  // Đổi 5 loại súng bằng phím 1 -> 5
  if (k === '1') selectWeapon('vandal');
  if (k === '2') selectWeapon('phantom');
  if (k === '3') selectWeapon('operator');
  if (k === '4') selectWeapon('sheriff');
  if (k === '5') selectWeapon('spectre');

  // Đổi 4 Phòng tập bằng F1 -> F4
  if (e.key === 'F1') { e.preventDefault(); switchRoom('range'); }
  if (e.key === 'F2') { e.preventDefault(); switchRoom('reflex'); }
  if (e.key === 'F3') { e.preventDefault(); switchRoom('obstacle'); }
  if (e.key === 'F4') { e.preventDefault(); switchRoom('combat'); }

  // Tăng Level Bot ở Phòng 4 bằng phím G, hồi máu bằng phím H
  if (k === 'g' && currentRoom === 'combat') {
    combatLevel = (combatLevel % 5) + 1;
    showBanner(`LEVEL ${combatLevel} ACTIVATED`);
    switchRoom('combat');
  }
  if (k === 'h') healPlayerFull();
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// Cho phép click trực tiếp vào nút chọn phòng trên thanh Top Bar
document.querySelectorAll('.arena-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    switchRoom(btn.dataset.room);
    lockMouse();
  });
});

function updateMovement(deltaSec) {
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

  const moveDir = new THREE.Vector3(0, 0, 0);
  if (keys.w) moveDir.add(forward);
  if (keys.s) moveDir.sub(forward);
  if (keys.d) moveDir.add(right);
  if (keys.a) moveDir.sub(right);

  // Tốc độ di chuyển phụ thuộc vào loại súng đang cầm và trạng thái ngắm ADS (chuẩn Valorant)
  const adsSlowdown = isADS ? 0.76 : 1.0;
  const accel = currentWeapon.moveSpeed * 14 * adsSlowdown;

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    player.velocity.x += moveDir.x * accel * deltaSec;
    player.velocity.z += moveDir.z * accel * deltaSec;
  }

  player.velocity.x *= 0.82;
  player.velocity.z *= 0.82;

  if (!player.isGrounded) player.velocity.y -= 18.0 * deltaSec;

  player.position.addScaledVector(player.velocity, deltaSec);
  if (player.position.y <= 1.65) {
    player.position.y = 1.65;
    player.velocity.y = 0;
    player.isGrounded = true;
  }
  camera.position.copy(player.position);
}

// =========================================================
// 11. KHÓA CHUỘT & SETTINGS
// =========================================================
const lobbyOverlay = document.getElementById('lobby-overlay');
const btnEnter = document.getElementById('btn-enter-range');
const settingsModal = document.getElementById('settings-modal');
const btnResume = document.getElementById('btn-resume');
const sensInput = document.getElementById('sens-input');
const sensSlider = document.getElementById('sens-slider');

function lockMouse() {
  getAudioContext();
  if (canvas.requestPointerLock) {
    const p = canvas.requestPointerLock({ unadjustedMovement: true });
    if (p && p.catch) p.catch(() => canvas.requestPointerLock());
  }
}

if (btnEnter) {
  btnEnter.addEventListener('click', () => {
    lobbyOverlay.style.display = 'none';
    lockMouse();
  });
}

if (btnResume) {
  btnResume.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    lockMouse();
  });
}

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas) {
    isMouseDown = false;
    if (lobbyOverlay.style.display === 'none') settingsModal.classList.remove('hidden');
  } else {
    settingsModal.classList.add('hidden');
  }
});

if (sensInput && sensSlider) {
  sensInput.addEventListener('input', (e) => {
    valorantSens = parseFloat(e.target.value) || 0.1;
    sensSlider.value = valorantSens;
  });
  sensSlider.addEventListener('input', (e) => {
    valorantSens = parseFloat(e.target.value);
    sensInput.value = valorantSens;
  });
}

// =========================================================
// 12. TELEMETRY & VÒNG LẶP GAME LOOP 144HZ+
// =========================================================
const fpsEl = document.getElementById('fps-val');
const ftEl = document.getElementById('ft-val');
const lowFpsEl = document.getElementById('low-fps-val');
const graphCanvas = document.getElementById('frametime-graph');
const ctx = graphCanvas ? graphCanvas.getContext('2d') : null;

const HISTORY_SIZE = 115;
const frameHistory = new Float32Array(HISTORY_SIZE);
let historyIndex = 0;
let lastTime = performance.now();
let lastHudUpdate = performance.now();
let framesSinceUpdate = 0;
let maxDeltaInWindow = 0;

function updateTelemetry(currentTime, deltaMs) {
  frameHistory[historyIndex] = deltaMs;
  historyIndex = (historyIndex + 1) % HISTORY_SIZE;
  framesSinceUpdate++;
  if (deltaMs > maxDeltaInWindow) maxDeltaInWindow = deltaMs;

  if (currentTime - lastHudUpdate >= 200) {
    const elapsed = currentTime - lastHudUpdate;
    const avgFps = Math.round((framesSinceUpdate * 1000) / elapsed);
    const onePercentLow = maxDeltaInWindow > 0 ? Math.round(1000 / maxDeltaInWindow) : avgFps;

    if (fpsEl) fpsEl.textContent = avgFps;
    if (ftEl) ftEl.textContent = deltaMs.toFixed(2);
    if (lowFpsEl) lowFpsEl.textContent = onePercentLow;

    framesSinceUpdate = 0;
    maxDeltaInWindow = 0;
    lastHudUpdate = currentTime;
  }

  if (ctx && graphCanvas) {
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(graphCanvas.width, 20);
    ctx.stroke();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < HISTORY_SIZE; i++) {
      const idx = (historyIndex + i) % HISTORY_SIZE;
      const ft = frameHistory[idx];
      const x = i * 2;
      const y = Math.max(2, Math.min(34, 36 - (ft / 16.6) * 24));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(currentTime) {
  requestAnimationFrame(animate);

  const deltaMs = currentTime - lastTime;
  lastTime = currentTime;
  const deltaSec = Math.min(deltaMs / 1000, 0.1);
  const nowSec = currentTime / 1000;

  // 1. Xử lý Sấy Liên Thanh (Full-Auto Spray khi giữ chuột trái)
  if (isMouseDown && currentWeapon.auto) {
    if (nowSec - lastShotTime >= currentWeapon.fireRate) {
      fireSingleBullet(nowSec);
    }
  } else if (!isMouseDown) {
    // Nhả chuột ra -> Hồi tâm Recoil mượt mà về 0
    player.recoilPitch *= Math.pow(0.001, deltaSec);
    player.recoilYaw *= Math.pow(0.001, deltaSec);
    if (nowSec - lastShotTime > 0.18) sprayCount = 0;
  }

  // Cộng độ giật nòng vào hướng nhìn của Camera
  camera.rotation.x = Math.max(-1.5, Math.min(1.5, player.pitch + player.recoilPitch));
  camera.rotation.y = player.yaw + player.recoilYaw;

  // 2. Chuyển động súng (ADS + Recoil)
  if (recoilOffset > 0) recoilOffset = Math.max(0, recoilOffset - 1.5 * deltaSec);
  gunGroup.position.x += (targetGunPos.x - gunGroup.position.x) * 0.25;
  gunGroup.position.y += (targetGunPos.y - gunGroup.position.y) * 0.25;
  gunGroup.position.z = targetGunPos.z + recoilOffset * 0.35;
  gunGroup.rotation.x = -recoilOffset * 0.6;

  // 3. Cập nhật Tia đạn & Hạt nổ
  tracers.forEach((t) => {
    if (t.active) {
      t.life -= deltaSec;
      if (t.life <= 0) {
        t.active = false;
        t.mesh.visible = false;
      }
    }
  });

  particles.forEach((p) => {
    if (p.life > 0) {
      p.life -= deltaSec;
      p.vel.y -= 16 * deltaSec;
      p.mesh.position.addScaledVector(p.vel, deltaSec);
      if (p.life <= 0) p.mesh.visible = false;
    }
  });

  // 4. Cập nhật AI của Bot, Di chuyển và Telemetry
  updateBotsAI(currentTime, deltaSec);
  updateMovement(deltaSec);
  updateTelemetry(currentTime, deltaMs);
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);