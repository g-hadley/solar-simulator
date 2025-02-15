export class Sun {
    constructor(x, y, radius = 80) {
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.health = 10;
        this.targetRadius = radius;
        this.redShift = 0;
        this.brightness = 1;
        this.isSupernova = false;
        this.supernovaTime = 0;
        this.supernovaParticles = [];
    }

    draw(ctx) {
        if (this.isSupernova) {
            this.drawSupernova(ctx);
            return;
        }

        this.radius += (this.targetRadius - this.radius) * 0.1;

        const innerRadius = this.radius * 0.1;
        const outerRadius = this.radius * (1 + 0.2 * this.brightness);
        const grad = ctx.createRadialGradient(this.x, this.y, innerRadius, this.x, this.y, outerRadius);
        const coreColor = this.interpolateColor("yellow", "red", this.redShift);
        const midColor = this.interpolateColor("orange", "darkred", this.redShift);

        grad.addColorStop(0, coreColor);
        grad.addColorStop(0.5, midColor);
        grad.addColorStop(1, `rgba(255,${69 * (1 - this.redShift)},0,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add extra glow effect
        const glowGrad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 1.5);
        glowGrad.addColorStop(0, `rgba(255,${150 * (1 - this.redShift)},0,${0.2 * this.brightness})`);
        glowGrad.addColorStop(1, "rgba(255,69,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSupernova(ctx) {
        this.supernovaTime += 0.016;
        const maxRadius = Math.max(ctx.canvas.width, ctx.canvas.height);

        if (this.supernovaTime < 1) {
            for (let i = 0; i < 10; i++) {
                this.createSupernovaParticle();
            }
        }

        const shockwaveRadius = this.radius + (maxRadius - this.radius) * Math.min(this.supernovaTime, 1);
        const shockwaveGrad = ctx.createRadialGradient(this.x, this.y, shockwaveRadius * 0.9, this.x, this.y, shockwaveRadius);
        shockwaveGrad.addColorStop(0, "rgba(255,255,255,0)");
        shockwaveGrad.addColorStop(0.5, `rgba(255,200,100,${0.5 * (1 - this.supernovaTime)})`);
        shockwaveGrad.addColorStop(1, "rgba(255,69,0,0)");
        ctx.fillStyle = shockwaveGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, shockwaveRadius, 0, Math.PI * 2);
        ctx.fill();

        for (let i = this.supernovaParticles.length - 1; i >= 0; i--) {
            const p = this.supernovaParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01;
            p.size *= 0.99;

            if (p.life <= 0) {
                this.supernovaParticles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.supernovaTime < 2 && Math.random() < 0.3) {
            this.createSupernovaParticle();
        }
    }

    createSupernovaParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const size = Math.random() * 20 + 10;
        const life = Math.random() * 0.5 + 0.5;
        const colors = [
            { r: 255, g: 200, b: 100 }, // Orange
            { r: 255, g: 255, b: 255 }, // White
            { r: 255, g: 100, b: 100 }, // Red
            { r: 255, g: 255, b: 200 }, // Yellow
            { r: 100, g: 200, b: 255 }, // Blue
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.supernovaParticles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life,
            color,
        });
    }

    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return `rgb(${r},${g},${b})`;
    }

    hexToRgb(color) {
        const colors = {
            yellow: { r: 255, g: 255, b: 0 },
            red: { r: 255, g: 0, b: 0 },
            orange: { r: 255, g: 165, b: 0 },
            darkred: { r: 139, g: 0, b: 0 },
        };
        return colors[color] || { r: 255, g: 255, b: 255 };
    }

    drawHealth(ctx, canvasWidth) {
        if (this.isSupernova) return;

        const barWidth = 200;
        const barHeight = 20;
        const x = canvasWidth - barWidth - 20;
        const y = 20;

        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, barWidth, barHeight);

        const healthWidth = (this.health / 10) * barWidth;
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, healthWidth, barHeight);

        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    takeDamage() {
        this.health -= 1;

        this.targetRadius = this.baseRadius * (1 + 0.1 * (10 - this.health));

        this.redShift = Math.min(1, (10 - this.health) / 10);
        this.brightness = Math.max(0.4, 1 - ((10 - this.health) / 10) * 0.6);

        if (this.health <= 0 && !this.isSupernova) {
            this.triggerSupernova();
        }
    }

    triggerSupernova() {
        this.isSupernova = true;
        this.supernovaTime = 0;
        this.supernovaParticles = [];
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.health = 10;
        this.radius = this.baseRadius;
        this.targetRadius = this.baseRadius;
        this.redShift = 0;
        this.brightness = 1;
        this.isSupernova = false;
        this.supernovaTime = 0;
        this.supernovaParticles = [];
    }
}
