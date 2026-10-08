/**
 * =============================================================================
 * Premium Mental Wellness Homepage — Application Script
 * -----------------------------------------------------------------------------
 * Modern vanilla ES6+ JavaScript. No frameworks, no animation libraries.
 * Every module is self-contained, lazily initialized where appropriat
 * respects prefers-reduced-motion. Motion is calm by design: gentle easing,
 * slow drift, nothing sudden.
 *
 * Expected markup contracts are documented at the top of each module via
 * `selectors` constants — adjust those if your HTML uses different hooks.
 * =============================================================================
 */

'use strict';

/* =============================================================================
 * Shared utilities
 * ========================================================================== */

const Utils = (() => {
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Debounce: fires once after `wait` ms of silence. */
  const debounce = (fn, wait = 150) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  /** Throttle: fires at most once per `limit` ms. */
  const throttle = (fn, limit = 100) => {
    let inThrottle = false;
    return (...args) => {
      if (inThrottle) return;
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    };
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const lerp = (start, end, t) => start + (end - start) * t;

  /** Ease-out-cubic, used throughout for "settling" motion. */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable (private mode, quota) — fail silently */
      }
    },
  };

  const createEl = (tag, className, html) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  };

  /** requestAnimationFrame-driven ticker with automatic pause when hidden. */
  const raf = {
    _callbacks: new Set(),
    _running: false,
    _tick(time) {
      raf._callbacks.forEach((cb) => cb(time));
      if (raf._callbacks.size > 0) {
        raf._handle = requestAnimationFrame(raf._tick);
      } else {
        raf._running = false;
      }
    },
    add(cb) {
      raf._callbacks.add(cb);
      if (!raf._running) {
        raf._running = true;
        raf._handle = requestAnimationFrame(raf._tick);
      }
      return cb;
    },
    remove(cb) {
      raf._callbacks.delete(cb);
    },
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf._handle);
      raf._running = false;
    } else if (raf._callbacks.size > 0 && !raf._running) {
      raf._running = true;
      raf._handle = requestAnimationFrame(raf._tick);
    }
  });

  return {
    prefersReducedMotion,
    debounce,
    throttle,
    clamp,
    lerp,
    easeOutCubic,
    randomBetween,
    randomChoice,
    todayKey,
    storage,
    createEl,
    raf,
  };
})();

/* =============================================================================
 * Preloader
 * ========================================================================== */

const initPreloader = () => {
  const root = document.querySelector('[data-preloader]');
  if (!root) return;

  const textEl = root.querySelector('[data-preloader-text]');
  const messages = [
    'Preparing your peaceful space...',
    'Creating calm...',
    'Almost ready...',
  ];

  let index = 0;
  const showNext = () => {
    if (!textEl) return;
    textEl.style.opacity = '0';
    window.setTimeout(() => {
      textEl.textContent = messages[index];
      textEl.style.opacity = '1';
      index += 1;
    }, 250);
  };

  showNext();
  const interval = window.setInterval(() => {
    if (index >= messages.length) {
      window.clearInterval(interval);
      finish();
      return;
    }
    showNext();
  }, 900);

  const finish = () => {
    window.setTimeout(() => {
      root.classList.add('is-hidden');
      root.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => root.remove(), 800);
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    }, 500);
  };

  // Safety net: never let the preloader trap the page.
 window.setTimeout(finish, 2500);
};

/* =============================================================================
 * Navbar — moved to component.js
 * ========================================================================== */

/* =============================================================================
 * Hero — parallax, aurora, floating illustration, ripple buttons
 * ========================================================================== */

const initHero = () => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const illustration = hero.querySelector('[data-hero-illustration]');
  const aurora = hero.querySelector('[data-hero-aurora]');
  const MAX_OFFSET = 15;

  if (!Utils.prefersReducedMotion()) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = Utils.throttle((event) => {
      const rect = hero.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * MAX_OFFSET;
      targetY = relY * MAX_OFFSET;
    }, 32);

    hero.addEventListener('pointermove', onPointerMove);

    Utils.raf.add(() => {
      currentX = Utils.lerp(currentX, targetX, 0.06);
      currentY = Utils.lerp(currentY, targetY, 0.06);
      if (illustration) {
        illustration.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (aurora) {
        aurora.style.transform = `translate3d(${currentX * -0.6}px, ${currentY * -0.6}px, 0)`;
      }
    });
  }

  initRippleButtons(hero);
};

/** Ripple effect for any [data-ripple] button, scoped to an optional root. */
const initRippleButtons = (root = document) => {
  const buttons = root.querySelectorAll('[data-ripple]');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (Utils.prefersReducedMotion()) return;
      const rect = button.getBoundingClientRect();
      const ripple = Utils.createEl('span', 'ripple');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
};

/* =============================================================================
 * Mood Garden + Theme Engine
 * ========================================================================== */

const MOODS = ['happy', 'calm', 'peaceful', 'focused', 'hopeful', 'tired', 'anxious'];

const MOOD_MESSAGES = {
  happy: 'Joy looks good on you today.',
  calm: 'Stillness is a place you can return to anytime.',
  peaceful: 'Let this moment be enough.',
  focused: 'One breath, one thought, one step.',
  hopeful: 'Tomorrow is already listening.',
  tired: 'Rest is productive too.',
  anxious: 'You are safe right now, in this moment.',
};

const MOOD_PALETTES = {
  happy: {
    bgA: '#FFF8D6', bgB: '#FFE9A8', bgC: '#FFF4D4',
    accent: '#E8C787', accentDark: '#D2A24E', secondary: '#F1D8A7', gold: '#F0B84D',
    glow: 'rgba(236, 200, 129, 0.45)', glowLavender: 'rgba(243, 219, 173, 0.42)', glowAqua: 'rgba(255, 240, 206, 0.38)', glowGold: 'rgba(240, 184, 77, 0.45)',
  },
  calm: {
    bgA: '#E6F4EC', bgB: '#D9F0E6', bgC: '#F8FCF9',
    accent: '#8FBFA4', accentDark: '#6FA487', secondary: '#B9DCC6', gold: '#E4C06B',
    glow: 'rgba(159, 210, 181, 0.45)', glowLavender: 'rgba(183, 214, 199, 0.42)', glowAqua: 'rgba(140, 205, 205, 0.4)', glowGold: 'rgba(232, 199, 135, 0.55)',
  },
  peaceful: {
    bgA: '#EAF8F0', bgB: '#E2F2F0', bgC: '#F9FCFB',
    accent: '#7FAF94', accentDark: '#568C6F', secondary: '#B5D5C3', gold: '#E4C06B',
    glow: 'rgba(143, 191, 164, 0.40)', glowLavender: 'rgba(188, 215, 203, 0.4)', glowAqua: 'rgba(140, 205, 205, 0.4)', glowGold: 'rgba(232, 199, 135, 0.55)',
  },
  focused: {
    bgA: '#EAF2FB', bgB: '#DCEBFA', bgC: '#F5F9FD',
    accent: '#7AA7D9', accentDark: '#4B87C9', secondary: '#A6C4E8', gold: '#E6B04E',
    glow: 'rgba(122, 167, 217, 0.40)', glowLavender: 'rgba(140, 169, 217, 0.4)', glowAqua: 'rgba(128, 183, 222, 0.36)', glowGold: 'rgba(232, 199, 135, 0.55)',
  },
  hopeful: {
    bgA: '#F7F0FB', bgB: '#EEEAF6', bgC: '#FCFAFD',
    accent: '#B6A7D8', accentDark: '#9E8BC0', secondary: '#D3C7E8', gold: '#E8C787',
    glow: 'rgba(182, 167, 216, 0.40)', glowLavender: 'rgba(190, 173, 222, 0.40)', glowAqua: 'rgba(215, 205, 241, 0.38)', glowGold: 'rgba(236, 200, 129, 0.55)',
  },
  tired: {
    bgA: '#F3F3F3', bgB: '#ECECEC', bgC: '#FAFAFA',
    accent: '#A8AAA7', accentDark: '#8A8E8B', secondary: '#CFCFCF', gold: '#D0B06F',
    glow: 'rgba(180, 180, 180, 0.35)', glowLavender: 'rgba(200, 200, 200, 0.32)', glowAqua: 'rgba(210, 210, 210, 0.3)', glowGold: 'rgba(208, 176, 111, 0.4)',
  },
  anxious: {
    bgA: '#F2EDFA', bgB: '#E9E2F8', bgC: '#FBF9FE',
    accent: '#9B86C8', accentDark: '#7D67B2', secondary: '#CBBEE8', gold: '#E4B15B',
    glow: 'rgba(155, 134, 200, 0.40)', glowLavender: 'rgba(184, 152, 232, 0.34)', glowAqua: 'rgba(235, 228, 252, 0.36)', glowGold: 'rgba(228, 177, 91, 0.44)',
  },
};

const normalizeMood = (mood) => {
  if (!mood) return 'calm';
  const key = String(mood).toLowerCase();
  if (key === 'relaxed') return 'peaceful';
  if (key === 'sad') return 'tired';
  if (key === 'stressed') return 'anxious';
  return MOODS.includes(key) ? key : 'calm';
};

const applyThemePalette = (mood, { persist = true } = {}) => {
  const palette = MOOD_PALETTES[normalizeMood(mood)] || MOOD_PALETTES.calm;
  const root = document.documentElement;

  root.style.setProperty('--mc-theme-bg-a', palette.bgA);
  root.style.setProperty('--mc-theme-bg-b', palette.bgB);
  root.style.setProperty('--mc-theme-bg-c', palette.bgC);
  root.style.setProperty('--mc-accent-primary', palette.accent);
  root.style.setProperty('--mc-accent-primary-dark', palette.accentDark);
  root.style.setProperty('--mc-accent-secondary', palette.secondary);
  root.style.setProperty('--mc-accent-gold', palette.gold);
  root.style.setProperty('--mc-glow-mint', palette.glow);
  root.style.setProperty('--mc-glow-lavender', palette.glowLavender);
  root.style.setProperty('--mc-glow-aqua', palette.glowAqua);
  root.style.setProperty('--mc-glow-gold', palette.glowGold);
  root.style.setProperty('--mc-theme-accent', palette.accent);
  root.style.setProperty('--mc-theme-glow', palette.glow);

  document.documentElement.classList.add('is-theme-transitioning');
  MOODS.forEach((item) => document.body.classList.remove(`theme-${item}`));
  document.body.classList.add(`theme-${normalizeMood(mood)}`);

  if (persist) Utils.storage.set('wellness:mood', normalizeMood(mood));

  window.setTimeout(() => {
    document.documentElement.classList.remove('is-theme-transitioning');
  }, 1200);

  document.dispatchEvent(new CustomEvent('theme:change', { detail: { mood: normalizeMood(mood) } }));
};

const initThemeEngine = () => {
  const apply = (mood, options = {}) => applyThemePalette(mood, options);

  const restore = () => {
    const saved = Utils.storage.get('wellness:mood');
    if (saved) apply(saved, { persist: false });
  };

  restore();
  return { apply };
};

const initMoodGarden = (themeEngine) => {
  const garden = document.querySelector('.mc-mood-garden');
  if (!garden) return;

  const lotuses = Array.from(garden.querySelectorAll('.mc-mood-garden__lotus'));
  const responseText = garden.querySelector('.mc-mood-garden__response-text');

  const selectMood = (mood, lotus) => {
    const normalizedMood = normalizeMood(mood);
    lotuses.forEach((el) => {
      el.classList.remove('is-selected');
      const button = el.querySelector('.mc-mood-garden__lotus-button');
      if (button) button.setAttribute('aria-pressed', 'false');
    });

    lotus?.classList.add('is-selected');
    const button = lotus?.querySelector('.mc-mood-garden__lotus-button');
    if (button) button.setAttribute('aria-pressed', 'true');

    if (responseText) {
      responseText.textContent = MOOD_MESSAGES[normalizedMood] ?? 'A gentle mood shift can soften the entire day.';
    }

    themeEngine?.apply(normalizedMood);
    Achievements.unlock('moodLogged');
  };

  lotuses.forEach((lotus) => {
    const mood = lotus.getAttribute('data-mood');
    const button = lotus.querySelector('.mc-mood-garden__lotus-button');
    if (button) {
      button.addEventListener('click', () => selectMood(mood, lotus));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectMood(mood, lotus);
        }
      });
    }
  });

  const savedMood = Utils.storage.get('wellness:mood');
  if (savedMood) {
    const match = lotuses.find((el) => normalizeMood(el.getAttribute('data-mood')) === normalizeMood(savedMood));
    if (match) selectMood(savedMood, match);
  }
};

/* =============================================================================
 * Background effects: aurora / mist / floating circles / light rays / dust
 * ========================================================================== */

const initBackgroundEffects = () => {
  const layers = document.querySelectorAll('[data-bg-effect]');
  if (!layers.length || Utils.prefersReducedMotion()) return;

  layers.forEach((layer, i) => {
    const speed = Number(layer.getAttribute('data-speed')) || Utils.randomBetween(0.2, 0.6);
    const phase = Utils.randomBetween(0, Math.PI * 2);
    const amplitude = Number(layer.getAttribute('data-amplitude')) || 12;

    Utils.raf.add((time) => {
      const t = time * 0.0002 * speed + phase + i;
      const x = Math.sin(t) * amplitude;
      const y = Math.cos(t * 0.8) * amplitude * 0.6;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });
};

/* =============================================================================
 * Leaves — slow, natural drifting
 * ========================================================================== */

const initLeaves = () => {
  const layer = document.querySelector('[data-leaves]');
  if (!layer || Utils.prefersReducedMotion()) return;

  const leaves = Array.from(layer.querySelectorAll('[data-leaf]')).map((el) => ({
    el,
    x: Utils.randomBetween(0, 100),
    y: Utils.randomBetween(0, 100),
    driftSpeed: Utils.randomBetween(0.05, 0.15),
    rotateSpeed: Utils.randomBetween(0.02, 0.06),
    direction: Utils.randomChoice([-1, 1]),
    phase: Utils.randomBetween(0, Math.PI * 2),
  }));

  Utils.raf.add((time) => {
    leaves.forEach((leaf) => {
      const t = time * 0.001;
      const sway = Math.sin(t * leaf.driftSpeed + leaf.phase) * 6;
      const rotate = Math.sin(t * leaf.rotateSpeed + leaf.phase) * 12 * leaf.direction;
      const drift = ((t * leaf.driftSpeed * leaf.direction) % 20);
      leaf.el.style.transform =
        `translate3d(${sway + drift}px, ${Math.cos(t * leaf.driftSpeed) * 8}px, 0) rotate(${rotate}deg)`;
    });
  });
};

/* =============================================================================
 * Particles — tiny glowing, slow, never distracting
 * ========================================================================== */

const initParticles = () => {
  const layer = document.querySelector('[data-particles]');
  if (!layer || Utils.prefersReducedMotion()) return;

  const COUNT = Number(layer.getAttribute('data-particle-count')) || 24;
  const fragment = document.createDocumentFragment();
  const particles = [];

  for (let i = 0; i < COUNT; i += 1) {
    const el = Utils.createEl('span', 'particle');
    const size = Utils.randomBetween(2, 5);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Utils.randomBetween(0, 100)}%`;
    el.style.top = `${Utils.randomBetween(0, 100)}%`;
    fragment.appendChild(el);
    particles.push({
      el,
      speed: Utils.randomBetween(0.02, 0.08),
      phase: Utils.randomBetween(0, Math.PI * 2),
      amplitude: Utils.randomBetween(6, 18),
    });
  }
  layer.appendChild(fragment);

  Utils.raf.add((time) => {
    particles.forEach((p) => {
      const t = time * 0.001 * p.speed + p.phase;
      const y = Math.sin(t) * p.amplitude;
      const opacity = 0.35 + Math.sin(t * 1.3) * 0.25;
      p.el.style.transform = `translate3d(0, ${y}px, 0)`;
      p.el.style.opacity = String(Utils.clamp(opacity, 0.1, 0.6));
    });
  });
};

/* =============================================================================
 * Mouse Glow
 * ========================================================================== */

const initMouseGlow = () => {
  const glow = document.querySelector('[data-mouse-glow]');
  if (!glow || Utils.prefersReducedMotion()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    },
    { passive: true }
  );

  Utils.raf.add(() => {
    currentX = Utils.lerp(currentX, targetX, 0.15);
    currentY = Utils.lerp(currentY, targetY, 0.15);
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  });
};

/* =============================================================================
 * Parallax — generic [data-parallax] elements (background, illustration, etc.)
 * ========================================================================== */

const initParallax = () => {
  const elements = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!elements.length || Utils.prefersReducedMotion()) return;

  const MAX_OFFSET = 15;

  const onScroll = Utils.throttle(() => {
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    elements.forEach((el) => {
      const depth = Number(el.getAttribute('data-parallax')) || 0.2;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + window.scrollY + rect.height / 2;
      const distance = Utils.clamp((viewportCenter - elCenter) * depth * 0.05, -MAX_OFFSET, MAX_OFFSET);
      el.style.transform = `translate3d(0, ${distance}px, 0)`;
    });
  }, 16);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/* =============================================================================
 * Feature Islands — hover lift, glow, icon rotation, particle burst
 * ========================================================================== */

const initFeatureIslands = () => {
  const islands = document.querySelectorAll('[data-feature-island]');
  if (!islands.length) return;

  islands.forEach((island) => {
    const icon = island.querySelector('[data-feature-icon]');

    const onEnter = () => {
      island.classList.add('is-hovered');
      if (icon) icon.style.transform = 'rotate(12deg) scale(1.08)';
      if (!Utils.prefersReducedMotion()) burstParticles(island);
    };

    const onLeave = () => {
      island.classList.remove('is-hovered');
      if (icon) icon.style.transform = '';
    };

    island.addEventListener('pointerenter', onEnter);
    island.addEventListener('pointerleave', onLeave);
    island.addEventListener('focusin', onEnter);
    island.addEventListener('focusout', onLeave);
  });
};

const burstParticles = (container) => {
  const burstLayer = container.querySelector('[data-feature-burst]') || container;
  const count = 6;
  for (let i = 0; i < count; i += 1) {
    const spark = Utils.createEl('span', 'feature-spark');
    const angle = (Math.PI * 2 * i) / count;
    spark.style.setProperty('--spark-x', `${Math.cos(angle) * 24}px`);
    spark.style.setProperty('--spark-y', `${Math.sin(angle) * 24}px`);
    burstLayer.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
};

/* =============================================================================
 * Journey — step-based scroll narrative (fade/slide/scale via IO)
 * ========================================================================== */

const initJourney = () => {
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;
  const steps = journey.querySelectorAll('[data-journey-step]');
  if (!('IntersectionObserver' in window) || !steps.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  steps.forEach((step) => observer.observe(step));
};

/* =============================================================================
 * Scroll Animations — fade / slide / scale / rotate via IntersectionObserver
 * ========================================================================== */

const initScrollAnimations = () => {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || Utils.prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => observer.observe(el));
};

/* =============================================================================
 * Animated Counters
 * ========================================================================== */

const initCounters = () => {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-counter')) || 0;
    const duration = Number(el.getAttribute('data-counter-duration')) || 1600;
    const start = performance.now();

    if (Utils.prefersReducedMotion()) {
      el.textContent = target.toLocaleString();
      return;
    }

    const step = (now) => {
      const progress = Utils.clamp((now - start) / duration, 0, 1);
      const eased = Utils.easeOutCubic(progress);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => observer.observe(el));
  } else {
    counters.forEach(animateCounter);
  }
};

/* =============================================================================
 * Navbar search + profile menu + footer routing — moved to component.js
 * ========================================================================== */

/* =============================================================================
 * Notifications — stackable, glass, auto-dismiss, unread indicator
 * ========================================================================== */

const Notifications = (() => {
  let container = null;
  let unreadCount = 0;

  const ensureContainer = () => {
    if (container) return container;
    container = document.querySelector('[data-notifications]');
    if (!container) {
      container = Utils.createEl('div', 'notifications');
      container.setAttribute('data-notifications', '');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  };

  const updateIndicator = () => {
    const indicator = document.querySelector('[data-notification-indicator]');
    if (!indicator) return;
    indicator.textContent = String(unreadCount);
    indicator.classList.toggle('is-visible', unreadCount > 0);
  };

  const show = (message, { type = 'info', duration = 5000 } = {}) => {
    const root = ensureContainer();
    const note = Utils.createEl(
      'div',
      `notification notification--${type}`,
      `<p class="notification__message"></p><button class="notification__close" aria-label="Dismiss notification">&times;</button>`
    );
    note.querySelector('.notification__message').textContent = message;
    root.appendChild(note);

    unreadCount += 1;
    updateIndicator();

    requestAnimationFrame(() => note.classList.add('is-visible'));

    const dismiss = () => {
      note.classList.remove('is-visible');
      note.addEventListener('transitionend', () => note.remove(), { once: true });
      unreadCount = Math.max(0, unreadCount - 1);
      updateIndicator();
    };

    note.querySelector('.notification__close').addEventListener('click', dismiss);
    if (duration > 0) window.setTimeout(dismiss, duration);

    return { dismiss };
  };

  return { show };
})();

const initNotifications = () => {
  // Wires up any static [data-notify] triggers already in the markup for demos.
  document.querySelectorAll('[data-notify]').forEach((el) => {
    el.addEventListener('click', () => {
      Notifications.show(el.getAttribute('data-notify') || 'Notification', {
        type: el.getAttribute('data-notify-type') || 'info',
      });
    });
  });
};

/* =============================================================================
 * Settings — theme, language, notification toggle, privacy mode
 * ========================================================================== */

const initSettings = (themeEngine) => {
  const panel = document.querySelector('[data-settings-panel]');
  const trigger = document.querySelector('[data-settings-trigger]');
  if (!panel) return;

  const defaults = {
    theme: 'calm',
    language: 'en',
    notifications: true,
    privacyMode: false,
  };

  const settings = { ...defaults, ...Utils.storage.get('wellness:settings', {}) };

  const applyToDom = () => {
    document.documentElement.setAttribute('lang', settings.language);
    document.body.classList.toggle('privacy-mode', settings.privacyMode);
  };

  const persist = () => Utils.storage.set('wellness:settings', settings);

  trigger?.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!isOpen));
  });

  const themeSelect = panel.querySelector('[data-setting="theme"]');
  const languageSelect = panel.querySelector('[data-setting="language"]');
  const notificationsToggle = panel.querySelector('[data-setting="notifications"]');
  const privacyToggle = panel.querySelector('[data-setting="privacyMode"]');

  if (themeSelect) {
    themeSelect.value = settings.theme;
    themeSelect.addEventListener('change', (event) => {
      settings.theme = event.target.value;
      themeEngine?.apply(settings.theme);
      persist();
    });
  }

  if (languageSelect) {
    languageSelect.value = settings.language;
    languageSelect.addEventListener('change', (event) => {
      settings.language = event.target.value;
      applyToDom();
      persist();
    });
  }

  if (notificationsToggle) {
    notificationsToggle.checked = settings.notifications;
    notificationsToggle.addEventListener('change', (event) => {
      settings.notifications = event.target.checked;
      persist();
    });
  }

  if (privacyToggle) {
    privacyToggle.checked = settings.privacyMode;
    privacyToggle.addEventListener('change', (event) => {
      settings.privacyMode = event.target.checked;
      applyToDom();
      persist();
    });
  }

  applyToDom();
  return settings;
};

/* =============================================================================
 * Achievements
 * ========================================================================== */

const ACHIEVEMENT_DEFS = {
  firstVisit: { label: 'First Visit', description: 'You found your way here.' },
  moodLogged: { label: 'Mood Logged', description: 'You checked in with yourself.' },
  journalOpened: { label: 'Journal Opened', description: 'You gave your thoughts a home.' },
  journeyCompleted: { label: 'Completed Journey', description: 'You walked the whole path.' },
  explorer: { label: 'Explorer', description: 'You looked into every corner.' },
  bubbleFinder: { label: 'Bubble Finder', description: 'You found the golden firefly.' },
};

const Achievements = (() => {
  const STORAGE_KEY = 'wellness:achievements';
  let unlocked = new Set(Utils.storage.get(STORAGE_KEY, []));

  const persist = () => Utils.storage.set(STORAGE_KEY, Array.from(unlocked));

  const showPopup = (key) => {
    const def = ACHIEVEMENT_DEFS[key];
    if (!def) return;
    const popup = Utils.createEl(
      "div",
      "mc-secret__popup is-active",
       `
        <div class="mc-secret__message">
            <p class="mc-secret__tip"></p>

            <button
                class="mc-secret__close"
                aria-label="Close">
                &times;
            </button>
        </div>
    `
     );
    const tipEl = popup.querySelector('.mc-secret__tip');
    if (tipEl) {
      tipEl.textContent = `${def.label}: ${def.description}`;
    }

    const labelEl = popup.querySelector('.achievement-popup__label');
    if (labelEl) {
      labelEl.textContent = def.label;
    }

    const descriptionEl = popup.querySelector('.achievement-popup__description');
    if (descriptionEl) {
      descriptionEl.textContent = def.description;
    }

    document.body.appendChild(popup);

    requestAnimationFrame(() => popup.classList.add('is-visible'));
    window.setTimeout(() => {
      popup.classList.remove('is-visible');
      popup.addEventListener('transitionend', () => popup.remove(), { once: true });
    }, 4000);
  };

  const unlock = (key) => {
    if (!ACHIEVEMENT_DEFS[key] || unlocked.has(key)) return;
    unlocked.add(key);
    persist();
    showPopup(key);
    document.dispatchEvent(new CustomEvent('achievement:unlock', { detail: { key } }));
  };

  const has = (key) => unlocked.has(key);

  return { unlock, has };
})();

const initAchievements = () => {
  Achievements.unlock('firstVisit');

  document.querySelector('[data-journal]')?.addEventListener(
    'focusin',
    () => Achievements.unlock('journalOpened'),
    { once: true }
  );

  document.querySelector('[data-journey]')?.addEventListener('journey:complete', () => {
    Achievements.unlock('journeyCompleted');
  });

  const explorableSections = document.querySelectorAll('[data-explorable]');
  if (explorableSections.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) seen.add(entry.target);
      });
      if (seen.size === explorableSections.length) {
        Achievements.unlock('explorer');
      }
    }, { threshold: 0.5 });
    explorableSections.forEach((section) => observer.observe(section));
  }
};

/* =============================================================================
 * Daily Content — quote / tip / challenge / affirmation, once per day
 * ========================================================================== */

const DAILY_CONTENT_POOL = {
  quote: [
    'Peace begins with a single breath.',
    'The quieter you become, the more you can hear.',
    'Slowness is not weakness.',
  ],
  tip: [
    'Try inhaling for four counts, holding for four, exhaling for six.',
    'Step outside for two seconds without your phone.',
    'Drink a full glass of water before your next task.',
  ],
  challenge: [
    'Write down one thing you are grateful for today.',
    'Sit in silence for sixty seconds before checking your phone.',
    'Send a kind message to someone you have not spoken to in a while.',
  ],
  affirmation: [
    'I am allowed to move at my own pace.',
    'I am doing better than I think I am.',
    'This moment is enough.',
  ],
};

const initDailyContent = () => {
  const mount = document.querySelector('[data-daily-content]');
  if (!mount) return;

  const STORAGE_KEY = 'wellness:dailyContent';
  const saved = Utils.storage.get(STORAGE_KEY);
  const today = Utils.todayKey();

  let content;
  if (saved && saved.date === today) {
    content = saved;
  } else {
    const types = Object.keys(DAILY_CONTENT_POOL);
    const type = Utils.randomChoice(types);
    const text = Utils.randomChoice(DAILY_CONTENT_POOL[type]);
    content = { date: today, type, text };
    Utils.storage.set(STORAGE_KEY, content);
  }

  const typeEl = mount.querySelector('[data-daily-type]');
  const textEl = mount.querySelector('[data-daily-text]');
  if (typeEl) typeEl.textContent = content.type;
  if (textEl) textEl.textContent = content.text;
};

/* =============================================================================
 * Secret Golden Firefly
 * ========================================================================== */

const initGoldenFirefly = () => {
  const layer = document.querySelector("[data-firefly-layer]");
  if (!layer) return;

  const TIPS = [
    "A five-minute walk resets more than you think.",
    "Naming a feeling out loud can loosen its grip.",
    "You do not have to earn rest.",
    "Small, consistent care beats occasional intensity.",
  ];

  const showFireflyPopup = (tip) => {
    const popup = Utils.createEl(
      "div",
      "mc-secret__popup",
      `
        <div class="mc-secret__message">
          <p class="mc-secret__tip">${tip}</p>
          <button type="button" class="mc-secret__close" aria-label="Close">
            &times;
          </button>
        </div>
      `
    );

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
      popup.classList.add("is-active");
    });

    const close = () => {
      popup.classList.remove("is-active");

      setTimeout(() => {
        popup.remove();
      }, 300);

      document.removeEventListener("keydown", onEscape);
    };

    const onEscape = (e) => {
      if (e.key === "Escape") {
        close();
      }
    };

    popup.querySelector(".mc-secret__close").addEventListener("click", close);

    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        close();
      }
    });

    document.addEventListener("keydown", onEscape);

    setTimeout(close, 6000);
  };

  const scheduleNext = () => {
    const delay = Utils.randomBetween(45000, 90000);
    setTimeout(spawnFirefly, delay);
  };

  const spawnFirefly = () => {
    if (document.hidden) {
      scheduleNext();
      return;
    }

    const firefly = Utils.createEl("span", "firefly");
    firefly.setAttribute(
      "aria-hidden",
      "true"
    );

    firefly.style.top = `${Utils.randomBetween(10, 80)}%`;
    firefly.style.left = `${Utils.randomBetween(5, 95)}%`;

    layer.appendChild(firefly);

    setTimeout(() => {
      firefly.remove();
    }, Utils.randomBetween(8000, 14000));

    scheduleNext();
  };

  scheduleNext();
};


/* =============================================================================
 * Accessibility
 * ========================================================================== */

const initAccessibility = () => {
  // Reveal focus rings only for keyboard users.
  const onFirstTab = (event) => {
    if (event.key !== 'Tab') return;
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', onFirstTab);
    window.addEventListener('mousedown', onMouseDown);
  };

  const onMouseDown = () => {
    document.body.classList.remove('user-is-tabbing');
    window.removeEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onFirstTab);
  };

  window.addEventListener('keydown', onFirstTab);

  // Live region for polite announcements from any module.
  let liveRegion = document.querySelector('[data-live-region]');
  if (!liveRegion) {
    liveRegion = Utils.createEl('div', 'sr-only');
    liveRegion.setAttribute('data-live-region', '');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);
  }

  document.addEventListener('a11y:announce', (event) => {
    liveRegion.textContent = event.detail?.message || '';
  });

  // Reduced-motion flag as a body class so CSS can key off it too.
  document.body.classList.toggle('reduced-motion', Utils.prefersReducedMotion());
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (event) => {
      document.body.classList.toggle('reduced-motion', event.matches);
    });
};

/* =============================================================================
 * App bootstrap
 * ========================================================================== */

const initApp = () => {
  document.body.classList.add('is-loading');

  initAccessibility();
  initPreloader();
  initHero();

  const themeEngine = initThemeEngine();
  initMoodGarden(themeEngine);

  initJourney();
  initFeatureIslands();

  initBackgroundEffects();
  initLeaves();
  initParticles();

  initMouseGlow();
  initParallax();

  initNotifications();
  initSettings(themeEngine);

  initAchievements();
  initDailyContent();
  initGoldenFirefly();

  initScrollAnimations();
  initCounters();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}