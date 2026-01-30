// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== GUARDADO AVANZADO =====
const defaultSave = {
  level: 1,
  highScore: 0,
  sound: true
};

let saveData = JSON.parse(localStorage.getItem("saveData")) || defaultSave;

// ===== ESTADO =====
let score = 0;
let level = saveData.level;
let highScore = saveData.highScore;
let soundEnabled = saveData.sound;

let gameRunning = false;
let paused = false;

// ===== AUDIO =====
const sounds = {
  music: new Audio("audio/music.mp3"),
  hit: new Audio("audio/hit.wav"),
  gameover: new Audio("audio/gameover.wav")
};

sounds.music.loop = true;
sounds.music.volume = 0.4;

// ===== JUGADOR =====
const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  size: 30,
  speed: 7
};

// ===== ENEMIGOS =====
let enemies = [];
let enemySpeed = 2 + level * 0.5;
let spawnRate = Math.max(600, 2000 - level * 200);
let lastSpawn = 0;

// ===== FUNCIONES =====
function saveGame() {
  saveData.level = level;
  saveData.highScore = highScore;
  saveData.sound = soundEnabled;
  localStorage.setItem("saveData", JSON.stringify(saveData));
}

function updateHUD() {
  document.getElementById("score").textContent = score;
  document.getElementById("highScore").textContent = highScore;
  document.getElementById("level").textContent = level;
}

function startGame() {
  document.getElementById("menu").style.display = "none";
  score = 0;
  enemies = [];
  gameRunning = true;
  paused = false;

  if (soundEnabled) {
    sounds.music.play().catch(() => {});
  }

  updateHUD();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!gameRunning) return;
  paused = !paused;
  document.getElementById("pauseMenu").style.display = paused ? "flex" : "none";
}

function resumeGame() {
  paused = false;
  document.getElementById("pauseMenu").style.display = "none";
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";

  if (!soundEnabled) {
    sounds.music.pause();
  } else if (gameRunning && !paused) {
    sounds.music.play().catch(() => {});
  }

  saveGame();
}

function showLevelMessage() {
  const msg = document.getElementById("levelMsg");
  msg.textContent = "Nivel " + level;
  msg.style.opacity = 1;
  setTimeout(() => msg.style.opacity = 0, 1000);
}

function levelUp() {
  level++;
  enemySpeed += 0.5;
  spawnRate = Math.max(500, spawnRate - 150);
  saveGame();
  showLevelMessage();
}

function addPoint() {
  score++;

  if (soundEnabled) {
    sounds.hit.currentTime = 0;
    sounds.hit.play();
  }

  if (score % 10 === 0) {
    levelUp();
  }
}

function gameOver() {
  if (score > highScore) {
    highScore = score;
  }

  saveGame();
  sounds.music.pause();
  sounds.gameover.play();

  gameRunning = false;
  document.getElementById("menu").style.display = "flex";
}

// ===== LOOP =====
function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (!paused) {
    update(timestamp);
    draw();
  }

  requestAnimationFrame(gameLoop);
}

function update(timestamp) {
  if (timestamp - lastSpawn > spawnRate) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: -40,
      size: 30
    });
    lastSpawn = timestamp;
  }

  enemies.forEach(e => e.y += enemySpeed);

  enemies = enemies.filter(e => {
    const hit =
      Math.abs(e.x - player.x) < player.size &&
      Math.abs(e.y - player.y) < player.size;

    if (hit) {
      gameOver();
      return false;
    }

    if (e.y > canvas.height) {
      addPoint();
      return false;
    }

    return true;
  });

  updateHUD();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // jugador
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // enemigos
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });
}

// ===== CONTROLES TÁCTILES =====
canvas.addEventListener("touchmove", e => {
  player.x = e.touches[0].clientX - player.size / 2;
});