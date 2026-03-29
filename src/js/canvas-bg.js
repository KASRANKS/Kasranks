(function initBackgroundNetwork() {
  const canvas = document.getElementById('bgc');

  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const kasColor = 'rgba(73,234,203,';
  const goldColor = 'rgba(240,192,64,';
  const blueColor = 'rgba(100,180,252,';
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const connectionDistance = 210;

  let width = 0;
  let height = 0;
  let particles = [];

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.005 + Math.random() * 0.012;

      const roll = Math.random();

      if (roll < 0.68) {
        this.color = kasColor;
        this.radius = 2 + Math.random() * 1.6;
      } else if (roll < 0.86) {
        this.color = goldColor;
        this.radius = 1.6 + Math.random() * 1.2;
      } else {
        this.color = blueColor;
        this.radius = 1.4 + Math.random();
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.speed;

      const isOut =
        this.x < -70 ||
        this.x > width + 70 ||
        this.y < -70 ||
        this.y > height + 70;

      if (isOut) {
        this.reset();
      }
    }

    draw() {
      const alpha = 0.38 + 0.3 * Math.sin(this.phase);

      context.beginPath();
      context.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
      context.fillStyle = `${this.color}${alpha * 0.12})`;
      context.fill();

      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = `${this.color}${alpha})`;
      context.fill();
    }
  }

  function createParticles() {
    const count = isTouchDevice
      ? Math.min(20, Math.floor((width * height) / 25000))
      : Math.min(100, Math.floor((width * height) / 12000));

    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= connectionDistance) {
          continue;
        }

        const intensity = 1 - distance / connectionDistance;

        context.beginPath();
        context.moveTo(particles[i].x, particles[i].y);
        context.lineTo(particles[j].x, particles[j].y);
        context.strokeStyle = `${kasColor}${intensity * 0.28})`;
        context.lineWidth = intensity * 1.6;
        context.stroke();
      }
    }
  }

  function render() {
    context.clearRect(0, 0, width, height);

    drawConnections();

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(render);
  }

  function boot() {
    resizeCanvas();
    createParticles();
    render();
  }

  resizeCanvas();
  createParticles();
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  render();
})();

function _initWhenReady(id, callback) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  if (element.offsetWidth > 0 && element.offsetHeight > 0) {
    callback(element);
    return;
  }

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        observer.disconnect();
        callback(element);
      }
    });

    observer.observe(element);
    return;
  }

  const timer = window.setInterval(() => {
    if (element.offsetWidth > 0 && element.offsetHeight > 0) {
      window.clearInterval(timer);
      callback(element);
    }
  }, 50);
}

(function emptyBackgroundHook() {})();
