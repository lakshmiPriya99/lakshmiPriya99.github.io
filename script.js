const menuToggle = document.getElementById("menuToggle");
const siteNav = document.querySelector(".nav-links");
const navLinks = document.querySelectorAll(".nav-links a");
const revealItems = document.querySelectorAll(".reveal");
const timelineBlocks = document.querySelectorAll(".timeline-block");
const experienceTimeline = document.querySelector(".experience-timeline");
const yearNode = document.getElementById("year");
const particleCanvas = document.getElementById("particle-canvas");
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
const typingTitle = document.querySelector(".typing-title");
let requestTimelineUpdate = () => {};
let requestActiveNavUpdate = () => {};

const createLucideIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

createLucideIcons();
window.addEventListener("load", createLucideIcons);

if (typingTitle) {
  const titleText = typingTitle.dataset.typeText || typingTitle.textContent.trim();
  const reducedTypingMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  typingTitle.setAttribute("aria-label", titleText);

  if (reducedTypingMotion) {
    typingTitle.textContent = titleText;
    typingTitle.classList.add("typing-complete");
  } else {
    let currentIndex = 0;
    typingTitle.textContent = "";

    const typeNextCharacter = () => {
      typingTitle.textContent = titleText.slice(0, currentIndex);
      currentIndex += 1;

      if (currentIndex <= titleText.length + 1) {
        window.setTimeout(typeNextCharacter, 72);
      } else {
        typingTitle.classList.add("typing-complete");
      }
    };

    window.setTimeout(typeNextCharacter, 360);
  }
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-visible");
    menuToggle.classList.toggle("is-active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-visible");
      menuToggle.classList.remove("is-active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const navSectionLinks = Array.from(navLinks)
  .map((link) => {
    const hash = link.getAttribute("href");

    if (!hash || !hash.startsWith("#")) {
      return null;
    }

    const section = document.getElementById(hash.slice(1));

    if (!section) {
      return null;
    }

    return { link, section };
  })
  .filter(Boolean);

if (navSectionLinks.length) {
  let activeNavTicking = false;

  const updateActiveNav = () => {
    const marker = window.innerHeight * 0.32;
    let activeLink = null;

    navSectionLinks.forEach(({ link, section }) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= marker && rect.bottom > marker) {
        activeLink = link;
      }
    });

    if (!activeLink) {
      const passedSections = navSectionLinks.filter(
        ({ section }) => section.getBoundingClientRect().top <= marker
      );
      const lastPassedSection = passedSections[passedSections.length - 1];

      activeLink = lastPassedSection?.link || null;
    }

    navSectionLinks.forEach(({ link }) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    activeNavTicking = false;
  };

  requestActiveNavUpdate = () => {
    if (activeNavTicking) {
      return;
    }

    activeNavTicking = true;
    window.requestAnimationFrame(updateActiveNav);
  };

  updateActiveNav();
  window.addEventListener("scroll", requestActiveNavUpdate, { passive: true });
  window.addEventListener("resize", requestActiveNavUpdate);
  window.addEventListener("load", requestActiveNavUpdate);
  window.addEventListener("hashchange", requestActiveNavUpdate);
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
      threshold: 0.14,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  timelineBlocks.forEach((block) => block.classList.add("is-lit"));
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const scrollToCurrentHash = () => {
  const targetId = window.location.hash.slice(1);

  if (!targetId) {
    return;
  }

  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
    requestTimelineUpdate();
    requestActiveNavUpdate();
  });
};

if (experienceTimeline) {
  let ticking = false;

  const updateTimelineProgress = () => {
    const rect = experienceTimeline.getBoundingClientRect();
    const viewportAnchor = window.innerHeight * 0.58;
    const progress = (viewportAnchor - rect.top) / Math.max(rect.height, 1);
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    experienceTimeline.style.setProperty(
      "--timeline-progress",
      `${Math.round(clampedProgress * 100)}%`
    );

    timelineBlocks.forEach((block) => {
      const blockRect = block.getBoundingClientRect();

      if (blockRect.top < window.innerHeight * 0.68) {
        block.classList.add("is-lit");
      }
    });

    ticking = false;
  };

  requestTimelineUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateTimelineProgress);
  };

  updateTimelineProgress();
  window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
  window.addEventListener("resize", requestTimelineUpdate);
}

window.addEventListener("load", scrollToCurrentHash);
window.addEventListener("hashchange", scrollToCurrentHash);

if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  const updateCursorDot = () => {
    const hoverScale = document.body.classList.contains("cursor-hovering")
      ? " scale(0.94)"
      : "";
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)${hoverScale}`;
    cursorOutline.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  };

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateCursorDot();
    },
    { passive: true }
  );

  document
    .querySelectorAll("a, button, .interactive-card, .btn-primary, .btn-secondary, .menu-toggle")
    .forEach((element) => {
      element.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hovering");
        updateCursorDot();
      });

      element.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hovering");
        updateCursorDot();
      });
    });
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
      54,
      Math.max(22, Math.floor(window.innerWidth / 34))
    );

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 1.6 + 0.5,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.24 + 0.1,
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
      context.fillStyle = `rgba(245, 158, 11, ${particle.alpha})`;
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const nextParticle = particles[nextIndex];
        const distanceX = particle.x - nextParticle.x;
        const distanceY = particle.y - nextParticle.y;
        const distance = Math.hypot(distanceX, distanceY);

        if (distance < 145) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(nextParticle.x, nextParticle.y);
          context.strokeStyle = `rgba(180, 83, 9, ${0.08 * (1 - distance / 145)})`;
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

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", restartParticles);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(restartParticles);
  }
}
