/* ═══════════════════════════════════════════════════
   app.js — Navegação IFCE Maracanaú
   ═══════════════════════════════════════════════════ */

'use strict';

// ─── DESTINATION DATA ────────────────────────────────────────────────────────

const DESTINATIONS = {
  entrada: {
    name:     'Entrada Principal',
    subtitle: 'Entrada',
    desc:     'Acesso principal do campus. Ponto de referência para visitantes e início de todas as rotas.',
    distance: '5m',
    color:    '#22c55e',
  },
  restaurante: {
    name:     'Restaurante Universitário',
    subtitle: 'Restaurante',
    desc:     'Restaurante que oferece refeições para alunos e servidores do campus durante os dias letivos.',
    distance: '85m',
    color:    '#f59e0b',
  },
  quadra: {
    name:     'Quadra Esportiva',
    subtitle: 'Quadra',
    desc:     'A Quadra possui a prática de esportes e lutas marciais, além da academia.',
    distance: '120m',
    color:    '#38bdf8',
  },
  labs: {
    name:     'Laboratórios',
    subtitle: 'Labs.',
    desc:     'Complexo de laboratórios de informática, eletrônica e engenharia do campus.',
    distance: '60m',
    color:    '#a78bfa',
  },
};

// ─── STATE ───────────────────────────────────────────────────────────────────

let currentDest  = 'quadra';
let videoStream  = null;
let arAnimFrame  = null;
let arrivalTimer = null;

// ─── SCREEN TRANSITIONS ──────────────────────────────────────────────────────

/**
 * Activates the given screen and dismisses all others.
 * @param {string} id  — the id of the screen element to show
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'out');
    s.classList.add('out');
  });
  const el = document.getElementById(id);
  el.classList.remove('out');
  el.classList.add('active');
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────

setTimeout(() => showScreen('home'), 2500);

// ─── HOME: TABS & MAP PINS ───────────────────────────────────────────────────

document.querySelectorAll('.dest-tab').forEach(btn => {
  btn.addEventListener('click', () => selectDest(btn.dataset.dest));
});

document.querySelectorAll('.dest-pin').forEach(pin => {
  pin.addEventListener('click', () => selectDest(pin.dataset.dest));
});

/**
 * Selects a destination: updates tabs, highlights the pin,
 * toggles the path overlay, then navigates to the detail screen.
 * @param {string} key — destination key from DESTINATIONS
 */
function selectDest(key) {
  currentDest = key;

  // Update tabs
  document.querySelectorAll('.dest-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.dest === key)
  );

  // Highlight pin
  document.querySelectorAll('.dest-pin').forEach(p =>
    p.classList.toggle('highlighted', p.dataset.dest === key)
  );

  // Show path only for quadra (example)
  const pathOverlay = document.getElementById('path-overlay');
  if (pathOverlay) pathOverlay.style.opacity = (key === 'quadra') ? '1' : '0';

  showDetailScreen(key);
}

// ─── HOME: VIEW BUTTONS ──────────────────────────────────────────────────────

document.getElementById('homeMapBtn').addEventListener('click', () => {
  setHomeView('map');
});

document.getElementById('homeCamBtn').addEventListener('click', () => {
  goToPermission();
});

/**
 * Toggles the active state of the map/camera view buttons on the home screen.
 * @param {'map'|'camera'} view
 */
function setHomeView(view) {
  const mapBtn = document.getElementById('homeMapBtn');
  const camBtn = document.getElementById('homeCamBtn');
  mapBtn.classList.toggle('active',   view === 'map');
  mapBtn.classList.toggle('inactive', view !== 'map');
  camBtn.classList.toggle('active',   view === 'camera');
  camBtn.classList.toggle('inactive', view !== 'camera');
}

// ─── DETAIL SCREEN ───────────────────────────────────────────────────────────

/**
 * Populates and displays the detail screen for the given destination.
 * @param {string} key
 */
function showDetailScreen(key) {
  const d = DESTINATIONS[key];
  document.getElementById('detailTitle').textContent = d.subtitle;
  document.getElementById('detailName').textContent  = d.name;
  document.getElementById('detailDesc').textContent  = d.desc;
  showScreen('detail');
}

document.getElementById('detailBack').addEventListener('click', () => {
  showScreen('home');
});

document.getElementById('detailGoBtn').addEventListener('click', () => {
  goToPermission();
});

// ─── PERMISSION SCREEN ───────────────────────────────────────────────────────

/**
 * Navigates to the camera permission screen for the current destination.
 */
function goToPermission() {
  const d = DESTINATIONS[currentDest];
  document.getElementById('permDest').textContent =
    'Em direção à ' + d.subtitle.toLowerCase();
  showScreen('permission');
}

document.getElementById('permBack').addEventListener('click', () => {
  showScreen('home');
});

document.getElementById('permAllow').addEventListener('click', () => {
  startAR();
});

document.getElementById('permDeny').addEventListener('click', () => {
  showScreen('home');
});

// ─── AR SCREEN ───────────────────────────────────────────────────────────────

document.getElementById('arBack').addEventListener('click', () => stopAR());
document.getElementById('arMapBtn').addEventListener('click', () => stopAR());

/**
 * Requests camera access, starts the AR canvas loop, and sets an
 * arrival timer based on the destination's simulated distance.
 */
async function startAR() {
  const d = DESTINATIONS[currentDest];

  document.getElementById('arDestTitle').textContent = d.subtitle;
  document.getElementById('arLabel').textContent     = `→ ${d.subtitle} (${d.distance})`;
  document.getElementById('arrivalDest').textContent = d.subtitle;
  document.getElementById('arrivalBanner').classList.remove('show');

  showScreen('ar');

  await initCamera();
  startARDraw();

  // Simulate arrival time based on distance (5 m/s walking speed)
  const walkMs = (parseInt(d.distance) / 5) * 1000 + 4000;
  arrivalTimer = setTimeout(() => {
    document.getElementById('arrivalBanner').classList.add('show');
    document.getElementById('arLabel').textContent = '✓ Destino alcançado!';
  }, Math.min(walkMs, 14000));
}

/**
 * Stops the camera stream, cancels the AR draw loop, and returns to home.
 */
function stopAR() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }
  if (arAnimFrame) {
    cancelAnimationFrame(arAnimFrame);
    arAnimFrame = null;
  }
  if (arrivalTimer) {
    clearTimeout(arrivalTimer);
    arrivalTimer = null;
  }
  showScreen('home');
}

/**
 * Requests the rear camera. Falls back gracefully if permission is denied
 * or the device has no camera, showing the no-camera message.
 */
async function initCamera() {
  const video = document.getElementById('arVideo');
  const noMsg = document.getElementById('noCameraMsg');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    videoStream     = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    noMsg.style.display = 'none';
  } catch {
    video.style.display = 'none';
    noMsg.style.display = 'flex';
  }
}

// ─── AR CANVAS DRAW ──────────────────────────────────────────────────────────

/**
 * Initialises the canvas and kicks off the requestAnimationFrame loop.
 * The canvas is resized to match its CSS dimensions on every window resize.
 */
function startARDraw() {
  const canvas = document.getElementById('arCanvas');
  const ctx    = canvas.getContext('2d');
  const color  = DESTINATIONS[currentDest].color;

  const resizeCanvas = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const draw = (timestamp) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawARPath(ctx, canvas.width, canvas.height, color, timestamp);
    arAnimFrame = requestAnimationFrame(draw);
  };

  arAnimFrame = requestAnimationFrame(draw);
}

/**
 * Renders the perspective AR path overlay onto the canvas.
 *
 * The path is made up of:
 *  - Animated trapezoid "stepping stones" that scroll toward the viewer.
 *  - A pulsing direction arrow near the horizon.
 *  - A soft horizon glow line.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width   — canvas width in px
 * @param {number} height  — canvas height in px
 * @param {string} color   — destination accent color (CSS color string)
 * @param {number} timestamp — DOMHighResTimeStamp from rAF
 */
function drawARPath(ctx, width, height, color, timestamp) {
  const phase    = (timestamp * 0.001) % 1;
  const vanishX  = width  * 0.5;
  const vanishY  = height * 0.45;
  const baseY    = height * 1.05;
  const baseHW   = width  * 0.275;       // half-width of the widest stone
  const NUM_STONES = 10;

  ctx.save();

  // Stepping-stone markers
  for (let i = 0; i < NUM_STONES; i++) {
    const tRaw = (i + phase) / NUM_STONES;
    const t    = Math.pow(tRaw, 1.4);   // perspective compression
    if (t >= 1) continue;

    const y  = baseY + (vanishY - baseY) * t;
    const hw = baseHW * (1 - t);
    const h  = hw * 0.28 + 2;

    ctx.save();
    ctx.globalAlpha  = (1 - t) * 0.85;
    ctx.fillStyle    = color;
    ctx.shadowColor  = color;
    ctx.shadowBlur   = 14 * (1 - t);

    ctx.beginPath();
    ctx.moveTo(vanishX - hw * 0.7, y - h * 0.5);
    ctx.lineTo(vanishX + hw * 0.7, y - h * 0.5);
    ctx.lineTo(vanishX + hw,       y + h * 0.5);
    ctx.lineTo(vanishX - hw,       y + h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Direction arrow (pulsing)
  const arrowY     = height * 0.6;
  const arrowAlpha = 0.5 + 0.4 * Math.sin(timestamp * 0.003);
  const arrowSize  = 16;

  ctx.globalAlpha = arrowAlpha;
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 20;

  ctx.beginPath();
  ctx.moveTo(vanishX,              arrowY - arrowSize * 1.5);
  ctx.lineTo(vanishX + arrowSize,  arrowY + arrowSize * 0.5);
  ctx.lineTo(vanishX,              arrowY);
  ctx.lineTo(vanishX - arrowSize,  arrowY + arrowSize * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Horizon glow line
  ctx.save();
  const grad = ctx.createLinearGradient(0, vanishY, width, vanishY);
  grad.addColorStop(0,   'transparent');
  grad.addColorStop(0.3, color + '44');
  grad.addColorStop(0.5, color + '99');
  grad.addColorStop(0.7, color + '44');
  grad.addColorStop(1,   'transparent');

  ctx.fillStyle   = grad;
  ctx.globalAlpha = 0.6 + 0.3 * Math.sin(timestamp * 0.002);
  ctx.fillRect(0, vanishY - 1, width, 2);
  ctx.restore();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

// Highlight the default destination pin on load
document.getElementById('pin-quadra').classList.add('highlighted');
