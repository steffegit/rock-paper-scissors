const canvas = document.getElementById("rock-paper-scissors-canvas");
const ctx = canvas.getContext("2d");
const itemRadius = 10;
const emojis = ["🪨", "📄", "✂️"];
const itemCount = 15;
let speed = 1;
let items = [];
let gameInterval;
let timeInterval;
let paused = false;
let lastDefeated = null;
let startTime = Date.now();
let totalTime = 0;

const speedDisplay = document.querySelector("[data-speed]");
const scoreDisplay = document.querySelector("[data-score]");

function startGame() {
  lastDefeated = null;
  items = [];
  for (let i = 0; i < emojis.length; i++) {
    for (let j = 0; j < itemCount; j++) {
      const angle = Math.random() * 2 * Math.PI;
      items.push({
        emoji: emojis[i],
        x: Math.random() * (canvas.width - 2 * itemRadius) + itemRadius,
        y: Math.random() * (canvas.height - 2 * itemRadius) + itemRadius,
        dx: speed * Math.cos(angle),
        dy: speed * Math.sin(angle),
      });
    }
  }
}

function drawText(item) {
  ctx.font = "30px 'IBM Plex Mono'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.emoji, item.x, item.y);
}

function detectCollision(item1, item2) {
  const dx = item1.x - item2.x;
  const dy = item1.y - item2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < itemRadius * 2;
}

function resolveCollision(item1, item2) {
  const rules = {
    "🪨": "✂️",
    "✂️": "📄",
    "📄": "🪨",
  };

  if (rules[item1.emoji] === item2.emoji) {
    // Record where item2 lost and which element was defeated
    lastDefeated = { x: item2.x, y: item2.y, emoji: item2.emoji };
    item2.emoji = item1.emoji;
  } else if (rules[item2.emoji] === item1.emoji) {
    // Record where item1 lost and which element was defeated
    lastDefeated = { x: item1.x, y: item1.y, emoji: item1.emoji };
    item1.emoji = item2.emoji;
  }
}

function displayMessage(message, defeatedElement) {
  // Draw a translucent overlay
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Draw the winner message
  ctx.font = "30px 'IBM Plex Mono'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);

  // If a defeated element is provided, draw a red border around it.
  if (defeatedElement) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Draw a circle with a fixed radius around the defeat location
    ctx.arc(defeatedElement.x, defeatedElement.y, 20, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function draw() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.backgroundColor = "white";

  items.forEach((item, index) => {
    drawText(item);

    if (
      item.x + item.dx > canvas.width - itemRadius ||
      item.x + item.dx < itemRadius
    ) {
      item.dx = -item.dx;
    }
    if (
      item.y + item.dy > canvas.height - itemRadius ||
      item.y + item.dy < itemRadius
    ) {
      item.dy = -item.dy;
    }

    item.x += item.dx;
    item.y += item.dy;

    // Check for collisions
    for (let j = index + 1; j < items.length; j++) {
      if (detectCollision(item, items[j])) {
        resolveCollision(item, items[j]);
      }
    }
  });

  // Check if only one emoji remains and display winner
  const remainingEmojis = new Set(items.map((item) => item.emoji));
  if (remainingEmojis.size === 1) {
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    const winner = [...remainingEmojis][0];
    // Capture the final lastDefeated into a local constant so it doesn't change.
    const finalDefeated = lastDefeated;
    displayMessage(`${winner} won`, finalDefeated);
  }
}

function updateSpeed() {
  speedDisplay.textContent = speed;
  items.forEach((item) => {
    const angle = Math.atan2(item.dy, item.dx);
    item.dx = speed * Math.cos(angle);
    item.dy = speed * Math.sin(angle);
  });
}

function togglePause() {
  paused = !paused;
  const pauseButton = document.getElementById("pause");
  if (paused) {
    totalTime += (Date.now() - startTime) / 1000; // removed * speed
    clearInterval(timeInterval);
    pauseButton.textContent = "▶️";
  } else {
    startTime = Date.now();
    timeInterval = setInterval(updateTime, 100);
    pauseButton.textContent = "⏸";
  }
}

function updateTime() {
  const currentTime = (Date.now() - startTime) / 1000;
  scoreDisplay.textContent = (totalTime + currentTime).toFixed(1); // removed * speed
}

function resizeCanvas() {
  const canvasWidth = Math.min(window.innerWidth * 0.9, 600);
  const canvasHeight = canvasWidth * 0.75;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gameInterval = setInterval(draw, 10);
timeInterval = setInterval(updateTime, 100);

document.getElementById("increase-speed").addEventListener("click", () => {
  if (speed < 5) {
    speed += 0.5;
    updateSpeed();
  }
});

document.getElementById("decrease-speed").addEventListener("click", () => {
  if (speed > 0.5) {
    speed -= 0.5;
    updateSpeed();
  }
});

document.getElementById("restart").addEventListener("click", () => {
  clearInterval(gameInterval);
  clearInterval(timeInterval);
  paused = false;
  totalTime = 0;
  lastDefeated = null;
  speed = 1;
  updateSpeed();
  startTime = Date.now();
  startGame();
  gameInterval = setInterval(draw, 10);
  timeInterval = setInterval(updateTime, 100);
});

document.getElementById("pause").addEventListener("click", togglePause);

startGame();
