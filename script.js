const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("year");
const particleCanvas = document.getElementById("particle-canvas");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (particleCanvas) {
  const context = particleCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let particles = [];
  let animationFrameId;
  let canvasWidth = 0;
  let canvasHeight = 0;

  const createParticles = () => {
    const particleCount = Math.min(
      86,
      Math.max(34, Math.floor(window.innerWidth / 22))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 1.3 + 0.45,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.44 + 0.24,
    }));
  };

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    particleCanvas.width = Math.floor(canvasWidth * ratio);
    particleCanvas.height = Math.floor(canvasHeight * ratio);
    particleCanvas.style.width = `${canvasWidth}px`;
    particleCanvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const drawParticles = () => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle, index) => {
      if (!reducedMotion.matches) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvasWidth) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > canvasHeight) {
          particle.vy *= -1;
        }
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(148, 163, 184, ${particle.alpha})`;
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const nextParticle = particles[nextIndex];
        const distanceX = particle.x - nextParticle.x;
        const distanceY = particle.y - nextParticle.y;
        const distance = Math.hypot(distanceX, distanceY);

        if (distance < 125) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(nextParticle.x, nextParticle.y);
          context.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - distance / 125)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    if (!reducedMotion.matches) {
      animationFrameId = window.requestAnimationFrame(drawParticles);
    }
  };

  const restartParticles = () => {
    window.cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    drawParticles();
  };

  restartParticles();
  window.addEventListener("resize", restartParticles);
  reducedMotion.addEventListener("change", restartParticles);
}
