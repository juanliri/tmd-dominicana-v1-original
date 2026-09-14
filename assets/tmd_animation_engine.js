/**
 * TMD TITAN LUXURY ANIMATION & ATMOSPHERIC ENGINE 2026
 * 3-Mode Adaptive Particle System, Smooth Parallax, Reveal Physics & Number Counters
 * Modes:
 *   - 'dust': Atmospheric micro-dust (0.6px, zero distraction, behind content cards)
 *   - 'bokeh': Cinematic frosted glass bokeh (soft diffused light blooms on Hero)
 *   - 'vignette': Peripheral reading mask (center 65% completely cleared for vehicle specs)
 */

(function () {
  'use strict';

  // Respect user reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    console.log('[TMD Animation] Reduced motion active, skipping complex animations.');
    return;
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 1. PARALLAX SCROLL ENGINE (Vertical Scroll only)                   */
  /* ══════════════════════════════════════════════════════════════════ */
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;

  function updateParallax() {
    const currentY = window.scrollY;
    scrollVelocity = Math.abs(currentY - lastScrollY);
    lastScrollY = currentY;
    document.documentElement.style.setProperty('--scroll-y', `${currentY}px`);
    ticking = false;
    evaluateAmbienceContext();
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════════ */
  /* 2. UNIVERSAL SCROLL-TRIGGERED REVEAL (IntersectionObserver)        */
  /* ══════════════════════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        if (entry.target.hasAttribute('data-tmd-counter')) {
          animateCounter(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  });

  function setupReveals() {
    const selector = [
      'section > div > h2',
      'section > div > h3',
      '.tmd-exec-card',
      '.tmd-tree-node-card',
      '#socios',
      'article'
    ].join(',');

    const elements = document.querySelectorAll(selector);
    const vh = window.innerHeight;

    elements.forEach((el) => {
      if (el.classList.contains('tmd-reveal') || el.closest('#todobuild-exec-portal-modal')) return;

      const rect = el.getBoundingClientRect();
      if (rect.top < vh - 20 && rect.bottom > 0) {
        el.classList.add('tmd-reveal', 'revealed');
      } else {
        el.classList.add('tmd-reveal');
        revealObserver.observe(el);
      }
    });

    setupCounters();
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 3. ANIMATED NUMBERS COUNTER ENGINE                                 */
  /* ══════════════════════════════════════════════════════════════════ */
  function animateCounter(el) {
    const rawVal = el.getAttribute('data-tmd-counter-val');
    if (!rawVal) return;

    const match = rawVal.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
    if (!match) return;

    const prefix = match[1] || '';
    const cleanNumStr = match[2].replace(/,/g, '');
    const isFloat = cleanNumStr.includes('.');
    const targetVal = parseFloat(cleanNumStr);
    const suffix = match[3] || '';

    if (isNaN(targetVal)) return;

    const duration = 1200; // ms
    const startTime = performance.now();

    function updateNumber(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = targetVal * ease;

      let displayNum = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString('en-US');
      el.textContent = `${prefix}${displayNum}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        el.textContent = `${prefix}${isFloat ? targetVal.toFixed(1) : targetVal.toLocaleString('en-US')}${suffix}`;
      }
    }

    requestAnimationFrame(updateNumber);
  }

  function setupCounters() {
    const statElements = document.querySelectorAll('[class*="text-2xl"], [class*="text-3xl"], [class*="text-4xl"], [class*="text-amber-400"]');
    statElements.forEach((el) => {
      if (el.hasAttribute('data-tmd-counter') || el.children.length > 0) return;
      const text = el.textContent.trim();
      const statPattern = /^(\+?\$?)([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|\d+)(?:\s*(HP|kg|MPa|BAR|%|\+|Años|km))?$/i;
      if (statPattern.test(text)) {
        el.setAttribute('data-tmd-counter', 'true');
        el.setAttribute('data-tmd-counter-val', text);
        animateCounter(el);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 4. 3-MODE ADAPTIVE PARTICLE ENGINE (Atmospheric Depth System)      */
  /* ══════════════════════════════════════════════════════════════════ */
  let canvas, ctx, particles = [], animationFrameId;
  let isCanvasActive = true;
  let currentMode = 'dust'; // 'dust' | 'bokeh' | 'vignette'
  let auroraPhase = 0;

  function initAmbientCanvas() {
    if (document.getElementById('tmd-ambient-canvas')) {
      canvas = document.getElementById('tmd-ambient-canvas');
      ctx = canvas.getContext('2d');
      return;
    }

    canvas = document.createElement('canvas');
    canvas.id = 'tmd-ambient-canvas';
    canvas.className = 'mode-dust';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.display = 'block';
    canvas.style.opacity = '0.95';
    document.body.prepend(canvas); // Prepend to body so content sits in front

    // Guard: re-prepend canvas if React removes it from body
    const bodyObserver = new MutationObserver(() => {
      if (!document.getElementById('tmd-ambient-canvas')) {
        document.body.prepend(canvas);
        console.log('[TMD Engine] Canvas re-attached after DOM update');
      }
    });
    bodyObserver.observe(document.body, { childList: true });
    ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Mouse tracking for fluid interactive particle responsiveness
    const mouse = { x: -9999, y: -9999, active: false };
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

    particles = [];
    // 52 particles across depth layers — delicate, non-distracting ambient atmosphere
    const count = Math.min(Math.floor(window.innerWidth / 22), 52);
    for (let i = 0; i < count; i++) {
      const isBokeh = i % 5 === 0; // 20% are soft bokeh blooms
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 0.5 + 0.6,          // 0.6px–1.1px delicate micro-dust
        targetR: Math.random() * 0.5 + 0.6,
        dx: (Math.random() - 0.5) * 0.30,
        dy: -(Math.random() * 0.45 + 0.15),    // gentle upward drift
        alpha: Math.random() * 0.20 + 0.35,    // 0.35–0.55 subtle non-distracting
        targetAlpha: Math.random() * 0.20 + 0.35,
        isBokeh: isBokeh,
        pulseSpeed: Math.random() * 0.025 + 0.012,
        pulseVal: Math.random() * Math.PI,
        speedMultiplier: 1.0
      });
    }

    setAmbienceMode(getRecommendedMode());

    function renderParticles() {
      if (!isCanvasActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = document.documentElement.classList.contains('dark');
      const particleRgb = isDark ? '245, 158, 11' : '217, 119, 6';

      // Subtle scroll velocity: gentle acceleration when scrolling
      scrollVelocity *= 0.92;
      const velocityDrift = Math.min(scrollVelocity * 0.03, 1.8);

      // In Bokeh mode (Hero section only), draw subtle ambient warm auroras
      if (currentMode === 'bokeh') {
        auroraPhase += 0.005;
        const pulse = 0.5 + 0.5 * Math.sin(auroraPhase);
        const pulse2 = 0.5 + 0.5 * Math.sin(auroraPhase * 1.3 + 1.2);

        // Left top bloom — subtle amber
        const gradLeft = ctx.createRadialGradient(
          canvas.width * 0.12, canvas.height * 0.18, 5,
          canvas.width * 0.12, canvas.height * 0.18, canvas.width * 0.40
        );
        gradLeft.addColorStop(0, `rgba(245, 158, 11, ${0.16 + pulse * 0.08})`);
        gradLeft.addColorStop(0.5, `rgba(245, 158, 11, ${0.03 + pulse * 0.02})`);
        gradLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradLeft;
        ctx.fillRect(0, 0, canvas.width * 0.55, canvas.height * 0.65);

        // Right top bloom — subtle amber
        const gradRight = ctx.createRadialGradient(
          canvas.width * 0.88, canvas.height * 0.22, 5,
          canvas.width * 0.88, canvas.height * 0.22, canvas.width * 0.38
        );
        gradRight.addColorStop(0, `rgba(217, 119, 6, ${0.12 + pulse2 * 0.07})`);
        gradRight.addColorStop(0.5, `rgba(245, 158, 11, ${0.02 + pulse2 * 0.02})`);
        gradRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradRight;
        ctx.fillRect(canvas.width * 0.45, 0, canvas.width * 0.55, canvas.height * 0.65);
      }

      // ── CONSTELLATION NET: Delicate connections that appear softly as particles approach ──
      const MAXD = 105;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAXD) {
            // Quadratic falloff: filaments only emerge gently as they actually draw near
            const ratio = 1 - (dist / MAXD);
            const lineAlpha = ratio * ratio * 0.22;
            if (lineAlpha > 0.015) {
              ctx.strokeStyle = `rgba(${particleRgb}, ${lineAlpha})`;
              ctx.lineWidth = 0.55; // Delicate hairline
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Render individual particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const spd = p.speedMultiplier || 1.0;

        // Gentle organic sway + upward drift
        p.x += (p.dx + Math.sin(p.pulseVal * 0.7) * 0.25) * spd;
        p.y += (p.dy * spd) - velocityDrift;
        p.pulseVal += p.pulseSpeed;

        // Gentle cursor push without drawing distracting lines
        if (mouse.active) {
          const dxM = p.x - mouse.x;
          const dyM = p.y - mouse.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 90 && distM > 0) {
            const force = (1 - distM / 90) * 1.5;
            p.x += (dxM / distM) * force;
            p.y += (dyM / distM) * force;
          }
        }

        // Smooth fluid morphing toward target mode
        p.r += (p.targetR - p.r) * 0.06;
        p.alpha += (p.targetAlpha - p.alpha) * 0.06;

        // Screen wrap
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;
        if (p.y < -15) {
          p.y = canvas.height + 15;
          p.x = Math.random() * canvas.width;
        }
        if (p.y > canvas.height + 15) p.y = -15;

        const currentAlpha = p.alpha * (0.85 + 0.25 * Math.sin(p.pulseVal));

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleRgb}, ${currentAlpha})`;

        if (p.isBokeh && currentMode === 'bokeh') {
          // Soft subtle halo
          ctx.shadowColor = `rgba(${particleRgb}, 0.60)`;
          ctx.shadowBlur = 8;
        } else {
          // Delicate ember point
          ctx.shadowColor = `rgba(${particleRgb}, 0.35)`;
          ctx.shadowBlur = 3;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(renderParticles);
    }

    renderParticles();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isCanvasActive = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isCanvasActive = true;
        renderParticles();
      }
    });
  }

  function setAmbienceMode(mode) {
    if (!canvas) return;
    if (currentMode === mode && canvas.classList.contains(`mode-${mode}`)) return;

    currentMode = mode;
    canvas.className = `mode-${mode}`;

    // Recalibrate target particle parameters based on active mode
    particles.forEach((p) => {
      if (mode === 'bokeh') {
        // Hero Bokeh: slightly expanded soft motes, subtle size variation
        if (p.isBokeh) {
          p.targetR    = Math.random() * 0.8 + 2.0;   // 2.0px–2.8px (delicate!)
          p.targetAlpha = Math.random() * 0.18 + 0.52; // 0.52–0.70
        } else {
          p.targetR    = Math.random() * 0.4 + 0.8;   // 0.8px–1.2px
          p.targetAlpha = Math.random() * 0.15 + 0.35; // 0.35–0.50
        }
        p.speedMultiplier = 0.85;
      } else if (mode === 'dust') {
        // Content Micro-Dust: fine golden dust specks (0.6px–1.0px), zero distraction
        if (p.isBokeh) {
          p.targetR    = Math.random() * 0.4 + 1.1;   // 1.1px–1.5px
          p.targetAlpha = Math.random() * 0.18 + 0.40; // 0.40–0.58
        } else {
          p.targetR    = Math.random() * 0.4 + 0.6;   // 0.6px–1.0px (fine micro-dust!)
          p.targetAlpha = Math.random() * 0.18 + 0.32; // 0.32–0.50
        }
        p.speedMultiplier = 1.15;
      } else if (mode === 'vignette') {
        // Vignette: extra fine peripheral motes
        p.targetR    = Math.random() * 0.4 + 0.5;     // 0.5px–0.9px
        p.targetAlpha = Math.random() * 0.15 + 0.28;   // 0.28–0.43
        p.speedMultiplier = 1.0;
      }
    });
  }

  function getRecommendedMode() {
    const hash = (window.location.hash || '').toLowerCase();
    const scrollY = window.scrollY;

    // 1. Vehicle Detail Page: Technical specs, warranty tabs, calculator
    // Requires Mode 3 (Peripheral Vignette) to keep the reading center 100% clean
    if (hash.includes('/vehicle/')) {
      return 'vignette';
    }

    // 2. Home Page: matches '', '#', '#/', '#home', '#/home', '#/home/'
    const isHome = hash === '' || hash === '#' || hash === '#/' || hash.startsWith('#home') || hash.startsWith('#/home');
    if (isHome) {
      // Top Drone Hero zone (< 620px): Cinematic Bokeh Orbs & Auroras
      if (scrollY < 620) {
        return 'bokeh';
      }
      // Lower content sections (Machinery, Repuestos, Servicios, Red, Socios): Active Micro-Dust Embers
      return 'dust';
    }

    // 3. About Page / Empresa: Bokeh on hero, vignette on directory/staff
    if (hash.includes('empresa') || hash.includes('about') || hash.includes('nosotros')) {
      if (scrollY < 520) {
        return 'bokeh';
      }
      return 'vignette'; // Keeps staff portraits and directory clear
    }

    // 4. Default for Catalog, Spare Parts, Services: Mode 1 (Micro-Dust behind cards)
    if (scrollY < 480) {
      return 'bokeh';
    }
    return 'dust';
  }

  function evaluateAmbienceContext() {
    const target = getRecommendedMode();
    if (target !== currentMode) {
      setAmbienceMode(target);
    }
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 5. MAGNETIC DRAG PURGE                                             */
  /* ══════════════════════════════════════════════════════════════════ */
  function cleanupMagneticTransforms() {
    const boundElems = document.querySelectorAll('[data-magnetic-bound]');
    boundElems.forEach((el) => {
      el.removeAttribute('data-magnetic-bound');
      el.style.transform = '';
    });
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* 6. SUITE INITIALIZATION & SPA OBSERVER                             */
  /* ══════════════════════════════════════════════════════════════════ */
  let debounceTimer;
  function debouncedRunSuite() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      cleanupMagneticTransforms();
      setupReveals();
      evaluateAmbienceContext();
    }, 60);
  }

  function initSuite() {
    initAmbientCanvas();
    cleanupMagneticTransforms();
    setupReveals();
    evaluateAmbienceContext();

    // Observe SPA DOM updates from React router/state
    const rootEl = document.getElementById('root');
    if (rootEl) {
      const observer = new MutationObserver(debouncedRunSuite);
      observer.observe(rootEl, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }

  window.addEventListener('hashchange', () => {
    setTimeout(debouncedRunSuite, 80);
  });

  window.addEventListener('popstate', () => {
    setTimeout(debouncedRunSuite, 80);
  });

  console.log('[TMD Titan Engine] 3-Mode Adaptive Atmospheric & Surface Suite active.');

  /* ══════════════════════════════════════════════════════════════════ */
  /* 6. TODOBUILD SPOTLIGHT CARD GLOW TRACKER (1:1 Instant Tracking)   */
  /* ══════════════════════════════════════════════════════════════════ */
  function initSpotlightCards() {
    const cardSelectors = [
      '.spotlight-card',
      '.tmd-spotlight-card',
      '.diamond-card',
      '.tmd-diamond-card',
      '.tmd-glass-card',
      'article'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(','));
    cards.forEach(card => {
      if (card.dataset.spotlightBound) return;
      card.dataset.spotlightBound = 'true';
      card.classList.add('tmd-spotlight-card');

      // Clear any legacy perspective transform
      if (card.style.transform && card.style.transform.includes('perspective')) {
        card.style.transform = '';
      }

      let rect = null;
      let lastScrollY = window.scrollY;

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        lastScrollY = window.scrollY;
      }, { passive: true });

      card.addEventListener('mousemove', e => {
        if (!rect || window.scrollY !== lastScrollY) {
          rect = card.getBoundingClientRect();
          lastScrollY = window.scrollY;
        }
        // Direct 1:1 instantaneous cursor position without reflow thrashing or 3D transform lag
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        rect = null;
      }, { passive: true });
    });
  }

  // Bind spotlights immediately and on DOM changes
  document.addEventListener('DOMContentLoaded', initSpotlightCards);
  setTimeout(initSpotlightCards, 500);
  setTimeout(initSpotlightCards, 1500);
  const spotObserver = new MutationObserver(() => {
    initSpotlightCards();
  });
  spotObserver.observe(document.body, { childList: true, subtree: true });

})();
