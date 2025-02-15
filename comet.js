export class Comet {
    constructor(x, y, vx, vy, radius = 16) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.toDelete = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static spawn(sunX, sunY, canvasWidth, canvasHeight) {
        const margin = 50;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(canvasWidth, canvasHeight) / 2 + margin;
        const x = sunX + dist * Math.cos(angle);
        const y = sunY + dist * Math.sin(angle);

        const dx = sunX - x;
        const dy = sunY - y;
        const mag = Math.hypot(dx, dy);
        const speed = 1;
        const vx = (dx / mag) * speed;
        const vy = (dy / mag) * speed;

        return new Comet(x, y, vx, vy);
    }

    checkSunCollision(sun) {
        const dx = this.x - sun.x;
        const dy = this.y - sun.y;
        const distance = Math.hypot(dx, dy);
        return distance < sun.radius + this.radius;
    }

    checkFlareCollision(flare) {
        const dx = this.x - flare.x;
        const dy = this.y - flare.y;
        const distance = Math.hypot(dx, dy);
        return distance < this.radius + flare.radius;
    }
}
