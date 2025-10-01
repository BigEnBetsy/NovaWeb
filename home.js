// Header hide-on-scroll
let lastScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 50) {
    // Naar beneden scrollen (en al 50px voorbij)
    header.classList.add("hide");
  } else {
    // Naar boven scrollen
    header.classList.remove("hide");
  }

  lastScroll = currentScroll;
});

// Shooting stars (jouw code)
class ShootingStars {
  constructor() {
    this.canvas = document.getElementById('shootingStarCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.shootingStars = [];
    this.animationId = null;
    this.lastShootingStarTime = 0;
    this.shootingStarInterval = 5000;
    this.isAnimating = true;
    this.init();
  }

  init() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.startAnimation();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startAnimation() {
    const animate = () => {
      this.clearCanvas();
      this.updateShootingStars();
      this.maybeCreateShootingStar();

      if (this.isAnimating) {
        this.animationId = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  maybeCreateShootingStar() {
    const now = Date.now();

    if (now - this.lastShootingStarTime > this.shootingStarInterval) {
      this.createShootingStar();
      this.lastShootingStarTime = now;
      this.shootingStarInterval = Math.random() * 4000 + 3000;
    }
  }

  createShootingStar() {
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * this.canvas.height / 4;

    const angle = Math.random() * Math.PI / 3 + Math.PI / 6;
    const length = Math.random() * 80 + 120;
    const speed = Math.random() * 2 + 1.5;

    this.shootingStars.push({
      x: startX,
      y: startY,
      length: length,
      angle: angle,
      speed: speed,
      progress: 0
    });
  }

  updateShootingStars() {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.progress += star.speed / 100;

      if (star.progress >= 1) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.drawShootingStar(star);
    }
  }

  drawShootingStar(star) {
    const endX = star.x + Math.cos(star.angle) * star.length * star.progress;
    const endY = star.y + Math.sin(star.angle) * star.length * star.progress;

    const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.5)');
    gradient.addColorStop(0.7, 'rgba(150, 180, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(star.x, star.y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }

  setFrequency(intervalMs) {
    this.shootingStarInterval = intervalMs;
  }

  toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    if (this.isAnimating) {
      this.startAnimation();
    }
  }
}

let shootingStars;

window.addEventListener('load', () => {
  shootingStars = new ShootingStars();
});

window.changeStarFrequency = (interval) => {
  if (shootingStars) shootingStars.setFrequency(interval);
};

window.toggleStars = () => {
  if (shootingStars) shootingStars.toggleAnimation();
};


