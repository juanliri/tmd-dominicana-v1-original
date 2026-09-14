/**
 * TMD TITAN ATMOSPHERIC PARTICLE & INTERACTION ENGINE (V2 PURE)
 * Ultra-lightweight, 60fps hardware-accelerated, zero-loop architecture
 * - Ambient gold/amber micro-dust (Km 22 Industrial Luxury)
 * - Safe event delegation for card spotlights (zero DOM thrashing)
 * - Intelligent pause on tab visibility change
 */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('[TMD Engine] Reduced motion active, ambient effects reduced.');
    return;
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 1. ATMOSPHERIC CANVAS PARTICLE ENGINE                              */
  /* ══════════════════════════════════════════════════════════════════ */
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationId = null;
  let isActive = true;
  const mouse = { x: -9999, y: -9999, active: false };

  function setupCanvas() {
    let existing = document.getElementById('tmd-ambient-canvas');
    if (existing) {
      canvas = existing;
    } else {
      canvas = document.createElement('canvas');
      canvas.id = 'tmd-ambient-canvas';
      document.body.appendChild(canvas);
    }

    // Apply strict styling: Fixed, non-interfering, floating behind cards but above dark body base
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '1', // Sits in layer 1; cards in #root are z-index: 2
      display: 'block',
      opacity: '0.90'
    });

    ctx = canvas.getContext('2d', { alpha: true });
    resizeCanvas();
    initParticles();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 28), 50);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 0.9 + 0.6, // 0.6px to 1.5px fine golden dust
        dx: (Math.random() - 0.5) * 0.25,
        dy: -(Math.random() * 0.35 + 0.12), // gentle upward drift
        alpha: Math.random() * 0.35 + 0.35, // 0.35 - 0.70
        pulseVal: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        isBloom: i % 6 === 0 // 16% soft light blooms
      });
    }
  }

  function renderLoop() {
    if (!isActive || !ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const isDark = document.documentElement.classList.contains('dark') || true;
    const rgb = isDark ? '245, 158, 11' : '217, 119, 6'; // TMD Industrial Gold

    // Connect close particles with delicate filaments
    const maxDist = 95;
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      for (let j = i + 1; j < pLen; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.18;
          ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Render individual particles
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];

      p.x += p.dx + Math.sin(p.pulseVal) * 0.18;
      p.y += p.dy;
      p.pulseVal += p.pulseSpeed;

      // Mouse repulsion/interaction
      if (mouse.active) {
        const dxM = p.x - mouse.x;
        const dyM = p.y - mouse.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < 100 && distM > 0) {
          const force = (1 - distM / 100) * 1.4;
          p.x += (dxM / distM) * force;
          p.y += (dyM / distM) * force;
        }
      }

      // Screen wrapping
      if (p.x < -15) p.x = window.innerWidth + 15;
      if (p.x > window.innerWidth + 15) p.x = -15;
      if (p.y < -15) {
        p.y = window.innerHeight + 15;
        p.x = Math.random() * window.innerWidth;
      }
      if (p.y > window.innerHeight + 15) p.y = -15;

      const currentAlpha = p.alpha * (0.75 + 0.25 * Math.sin(p.pulseVal));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.isBloom ? p.r * 1.4 : p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${currentAlpha})`;

      if (p.isBloom) {
        ctx.shadowColor = `rgba(${rgb}, 0.5)`;
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }

    animationId = requestAnimationFrame(renderLoop);
  }

  // Handle visibility & resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
    } else {
      isActive = true;
      animationId = requestAnimationFrame(renderLoop);
    }
  });

  /* ══════════════════════════════════════════════════════════════════ */
  /* 2. CARD SPOTLIGHT TRACKER (Delegated, 0 mutation loops)            */
  /* ══════════════════════════════════════════════════════════════════ */
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest('.spotlight-card, .tmd-spotlight-card, .diamond-card, article');
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════════ */
  /* 3. INITIALIZATION                                                  */
  /* ══════════════════════════════════════════════════════════════════ */
  function init() {
    setupCanvas();
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(renderLoop);
    console.log('[TMD Engine V2] Clean atmospheric particles active at 60fps.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
