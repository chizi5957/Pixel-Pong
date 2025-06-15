
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = {
  width: 60,
  height: 10,
  x: canvas.width / 2 - 30,
  y: canvas.height - 20,
  speed: 6,
  dx: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 2.5,
  dx: 2.5,
  dy: -2.5
};

let score = 0;
let bestScore = 0;
let level = 1;
let trail = [];
const maxTrail = 10;
let isGameOver = false;

const playAgainBtn = document.getElementById('playAgain');
const levelText = document.getElementById('levelText');

function drawPaddle() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > maxTrail) trail.shift();
  for (let i = 0; i < trail.length; i++) {
    ctx.fillStyle = `rgba(255,255,255,${i / trail.length})`;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, ball.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText("⚽", ball.x - 6, ball.y + 6);
}

function drawScore() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.font = "10px 'Press Start 2P'";
  ctx.fillText(`Score: ${score}`, 8, 20);
  ctx.fillText(`Best: ${bestScore}`, canvas.width - 108, 20);
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // wall collisions
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  if (ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // paddle collision (top only)
  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width &&
    ball.y + ball.size >= paddle.y &&
    ball.y + ball.size <= paddle.y + paddle.height
  ) {
    ball.dy *= -1;
    ball.y = paddle.y - ball.size; // avoid sticking

    score++;
    if (score > bestScore) bestScore = score;

    if (score % 5 === 0) {
      level++;
      levelText.textContent = `Level: ${level}`;
      if (ball.dx < 0) ball.dx -= 0.3;
      else ball.dx += 0.3;
      if (ball.dy < 0) ball.dy -= 0.3;
      else ball.dy += 0.3;
    }

    changeBackground(level);
  }

  if (ball.y + ball.size > canvas.height) {
    gameOver();
  }
}

function changeBackground(level) {
  const pastelShades = [
    "#ffc5d9", "#ffeaa7", "#dff9fb", "#c8d6e5",
    "#f8a5c2", "#f6e58d", "#ffbe76", "#7ed6df"
  ];
  const index = level % pastelShades.length;
  document.body.style.backgroundColor = pastelShades[index];
}

function gameOver() {
  isGameOver = true;
  playAgainBtn.style.display = "block";
  playAgainBtn.style.top = `${canvas.offsetTop + canvas.height / 2 + 20}px`;
  playAgainBtn.style.left = `${canvas.offsetLeft + canvas.width / 2 - 70}px`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawBall();
  drawScore();
}

function update() {
  if (!isGameOver) {
    movePaddle();
    moveBall();
    draw();
    requestAnimationFrame(update);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") paddle.dx = paddle.speed;
  else if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") paddle.dx = 0;
});

// touch controls
let touchX = null;
canvas.addEventListener("touchstart", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  if (x >= paddle.x && x <= paddle.x + paddle.width) {
    touchX = x - paddle.x;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (touchX !== null) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    paddle.x = x - touchX;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
  }
});

canvas.addEventListener("touchend", () => {
  touchX = null;
});

playAgainBtn.addEventListener("click", () => {
  isGameOver = false;
  score = 0;
  level = 1;
  levelText.textContent = "Level: 1";
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 2.5;
  ball.dy = -2.5;
  playAgainBtn.style.display = "none";
  update();
});

update();
