import { Sun } from "./sun.js";
import { Comet } from "./comet.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sun = new Sun(0, 0);

let gameOver = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    sun.updatePosition(canvas.width / 2, canvas.height / 2);
}

const comets = [];
const flares = [];
const particles = [];

let lastSpawn = 0;
const cometSpawnInterval = 2000;

let score = 0;

let mouseX = sun.x;
let mouseY = sun.y;

const retryButton = document.createElement("button");
retryButton.textContent = "Try Again?";
retryButton.style.position = "absolute";
retryButton.style.left = "50%";
retryButton.style.top = "60%";
retryButton.style.transform = "translate(-50%, -50%)";
retryButton.style.padding = "15px 30px";
retryButton.style.fontSize = "24px";
retryButton.style.backgroundColor = "#FF4500";
retryButton.style.color = "white";
retryButton.style.border = "none";
retryButton.style.borderRadius = "8px";
retryButton.style.cursor = "pointer";
retryButton.style.display = "none";
retryButton.style.fontFamily = "Arial, sans-serif";
retryButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
retryButton.onmouseover = () => (retryButton.style.backgroundColor = "#FF6347");
retryButton.onmouseout = () => (retryButton.style.backgroundColor = "#FF4500");
document.body.appendChild(retryButton);

retryButton.addEventListener("click", () => {
    resetGame();
    retryButton.style.display = "none";
    gameOver = false;
});

function resetGame() {
    score = 0;
    lastSpawn = 0;
    comets.length = 0;
    flares.length = 0;
    particles.length = 0;
    sun.reset();
}

function spawnFlare() {
    const dx = mouseX - sun.x;
    const dy = mouseY - sun.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return;
    const flareSpeed = 8;
    const vx = (dx / mag) * flareSpeed;
    const vy = (dy / mag) * flareSpeed;
    flares.push({ x: sun.x, y: sun.y, vx, vy, radius: 8, life: 100 });
}

function spawnParticle(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1 + 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const life = Math.random() * 30 + 30;
    const size = Math.random() * 2 + 1;
    particles.push({ x, y, vx, vy, life, size, color });
}

function explodeComet(comet) {
    for (let i = 0; i < 20; i++) {
        spawnParticle(comet.x, comet.y, "orange");
    }
}

function update(dt) {
    if (gameOver) return;

    if (!sun.isSupernova) {
        for (let comet of comets) {
            comet.update(dt);
            let trailColor = Math.random() < 0.5 ? "blue" : "white";
            spawnParticle(comet.x, comet.y, trailColor);

            if (comet.checkSunCollision(sun)) {
                explodeComet(comet);
                sun.takeDamage();
                comet.toDelete = true;
            }
        }

        for (let i = comets.length - 1; i >= 0; i--) {
            if (comets[i].toDelete) {
                comets.splice(i, 1);
            }
        }

        for (let i = flares.length - 1; i >= 0; i--) {
            const flare = flares[i];
            flare.x += flare.vx * dt;
            flare.y += flare.vy * dt;
            flare.life -= dt;
            flare.glow = Math.sin((flare.life / 100) * Math.PI);

            if (flare.life <= 0) {
                flares.splice(i, 1);
                continue;
            }

            for (let j = comets.length - 1; j >= 0; j--) {
                const comet = comets[j];
                if (comet.checkFlareCollision(flare)) {
                    explodeComet(comet);
                    comets.splice(j, 1);
                    flares.splice(i, 1);
                    score += 1;
                    break;
                }
            }
        }

        lastSpawn += dt * 16.67;
        if (lastSpawn > cometSpawnInterval) {
            comets.push(Comet.spawn(sun.x, sun.y, canvas.width, canvas.height));
            lastSpawn = 0;
        }
    } else {
        if (!gameOver) {
            gameOver = true;
            retryButton.style.display = "block";
        }
        for (let i = comets.length - 1; i >= 0; i--) {
            explodeComet(comets[i]);
            comets.splice(i, 1);
        }
        flares.length = 0;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawFlares() {
    flares.forEach((flare) => {
        ctx.save();
        let gradient = ctx.createRadialGradient(flare.x, flare.y, flare.radius * 0.1, flare.x, flare.y, flare.radius * 2);
        gradient.addColorStop(0, `rgba(255,215,0,${0.8 * flare.glow})`);
        gradient.addColorStop(1, "rgba(255,69,0,0)");
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20 * flare.glow;
        ctx.shadowColor = "rgba(255,215,0,1)";
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, flare.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach((p) => {
        ctx.fillStyle = `rgba(135,206,235,${p.life / 60})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawScore() {
    if (!sun.isSupernova) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score}`, 20, 30);
    }
}

function drawGameOver() {
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = "24px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.textAlign = "left";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sun.draw(ctx);
    drawParticles();
    comets.forEach((comet) => comet.draw(ctx));
    drawFlares();
    drawScore();
    sun.drawHealth(ctx, canvas.width);
    drawGameOver();
}

function initGame() {
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && !sun.isSupernova && !gameOver) {
            spawnFlare();
        }
    });

    resize();

    let lastTime = null;
    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 16.67;
        lastTime = timestamp;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

window.initGame = initGame;
