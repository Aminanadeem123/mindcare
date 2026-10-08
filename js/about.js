'use strict';

/* =============================================================================
 * Shared utilities (mirrors Home Page's Utils module)
 * ========================================================================== */
const Utils = (() => {
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    },
  };

  const createEl = (tag, className, html) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  };

  const raf = {
    _callbacks: new Set(), _running: false,
    _tick(time) {
      raf._callbacks.forEach((cb) => cb(time));
      if (raf._callbacks.size > 0) raf._handle = requestAnimationFrame(raf._tick);
      else raf._running = false;
    },
    add(cb) {
      raf._callbacks.add(cb);
      if (!raf._running) { raf._running = true; raf._handle = requestAnimationFrame(raf._tick); }
      return cb;
    },
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf._handle); raf._running = false; }
    else if (raf._callbacks.size > 0 && !raf._running) { raf._running = true; raf._handle = requestAnimationFrame(raf._tick); }
  });

  return { prefersReducedMotion, throttle, clamp, lerp, randomBetween, storage, createEl, raf };
})();

/* =============================================================================
 * Theme Engine — byte-for-byte compatible with the Home Page's implementation.
 * Reads/writes the same `wellness:mood` localStorage key, so a mood chosen on
 * either page instantly carries over to the other.
 * ========================================================================== */
const MOODS = ['happy', 'calm', 'peaceful', 'focused', 'hopeful', 'tired', 'anxious'];

const MOOD_PALETTES = {
  happy:    { bgA:'#FFF8D6', bgB:'#FFE9A8', bgC:'#FFF4D4', accent:'#E8C787', accentDark:'#D2A24E', secondary:'#F1D8A7', gold:'#F0B84D', glow:'rgba(236,200,129,.45)', glowLavender:'rgba(243,219,173,.42)', glowAqua:'rgba(255,240,206,.38)', glowGold:'rgba(240,184,77,.45)' },
  calm:     { bgA:'#E6F4EC', bgB:'#D9F0E6', bgC:'#F8FCF9', accent:'#8FBFA4', accentDark:'#6FA487', secondary:'#B9DCC6', gold:'#E4C06B', glow:'rgba(159,210,181,.45)', glowLavender:'rgba(183,214,199,.42)', glowAqua:'rgba(140,205,205,.4)', glowGold:'rgba(232,199,135,.55)' },
  peaceful: { bgA:'#EAF8F0', bgB:'#E2F2F0', bgC:'#F9FCFB', accent:'#7FAF94', accentDark:'#568C6F', secondary:'#B5D5C3', gold:'#E4C06B', glow:'rgba(143,191,164,.40)', glowLavender:'rgba(188,215,203,.4)', glowAqua:'rgba(140,205,205,.4)', glowGold:'rgba(232,199,135,.55)' },
  focused:  { bgA:'#EAF2FB', bgB:'#DCEBFA', bgC:'#F5F9FD', accent:'#7AA7D9', accentDark:'#4B87C9', secondary:'#A6C4E8', gold:'#E6B04E', glow:'rgba(122,167,217,.40)', glowLavender:'rgba(140,169,217,.4)', glowAqua:'rgba(128,183,222,.36)', glowGold:'rgba(232,199,135,.55)' },
  hopeful:  { bgA:'#F7F0FB', bgB:'#EEEAF6', bgC:'#FCFAFD', accent:'#B6A7D8', accentDark:'#9E8BC0', secondary:'#D3C7E8', gold:'#E8C787', glow:'rgba(182,167,216,.40)', glowLavender:'rgba(190,173,222,.40)', glowAqua:'rgba(215,205,241,.38)', glowGold:'rgba(236,200,129,.55)' },
  tired:    { bgA:'#F3F3F3', bgB:'#ECECEC', bgC:'#FAFAFA', accent:'#A8AAA7', accentDark:'#8A8E8B', secondary:'#CFCFCF', gold:'#D0B06F', glow:'rgba(180,180,180,.35)', glowLavender:'rgba(200,200,200,.32)', glowAqua:'rgba(210,210,210,.3)', glowGold:'rgba(208,176,111,.4)' },
  anxious:  { bgA:'#F2EDFA', bgB:'#E9E2F8', bgC:'#FBF9FE', accent:'#9B86C8', accentDark:'#7D67B2', secondary:'#CBBEE8', gold:'#E4B15B', glow:'rgba(155,134,200,.40)', glowLavender:'rgba(184,152,232,.34)', glowAqua:'rgba(235,228,252,.36)', glowGold:'rgba(228,177,91,.44)' },
};

const normalizeMood = (mood) => {
  if (!mood) return 'calm';
  const key = String(mood).toLowerCase();
  if (key === 'relaxed') return 'peaceful';
  if (key === 'sad') return 'tired';
  if (key === 'stressed') return 'anxious';
  if (key === 'angry') return 'anxious';
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

  window.setTimeout(() => document.documentElement.classList.remove('is-theme-transitioning'), 1200);
  document.dispatchEvent(new CustomEvent('theme:change', { detail: { mood: normalizeMood(mood) } }));
};

const initThemeEngine = () => {
  const restore = () => {
    const saved = Utils.storage.get('wellness:mood');
    if (saved) applyThemePalette(saved, { persist: false });
  };
  restore();
  return { apply: (mood, options = {}) => applyThemePalette(mood, options) };
};

/* =============================================================================
 * Navbar (mirrors Home Page's initNavbar)
 * ========================================================================== */
const initNavbar = () => {
  const nav = document.querySelector('[data-navbar]');
  if (!nav) return;
  const toggle = nav.querySelector('[data-nav-toggle]');
  const menu = nav.querySelector('[data-nav-menu]');

  const onScroll = Utils.throttle(() => nav.classList.toggle('is-scrolled', window.scrollY > 24), 100);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const openMenu = () => {
    if (!menu || !toggle) return;
    menu.hidden = false;
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = () => {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 300);
  };

  if (toggle && menu) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  }

  // Smooth in-page scroll for footer / hero anchors.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      const target = id && id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  });
};

/* =============================================================================
 * Mouse Glow (mirrors Home Page's initMouseGlow)
 * ========================================================================== */
const initMouseGlow = () => {
  const glow = document.querySelector('[data-mouse-glow]');
  if (!glow || Utils.prefersReducedMotion()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let currentX = targetX, currentY = targetY;

  window.addEventListener('pointermove', (e) => { targetX = e.clientX; targetY = e.clientY; }, { passive: true });
  Utils.raf.add(() => {
    currentX = Utils.lerp(currentX, targetX, 0.15);
    currentY = Utils.lerp(currentY, targetY, 0.15);
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  });
};

/* =============================================================================
 * Ripple buttons (mirrors Home Page's initRippleButtons)
 * ========================================================================== */
const initRippleButtons = (root = document) => {
  root.querySelectorAll('[data-ripple]').forEach((button) => {
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
 * Scroll reveal — generic [data-reveal] fade/scale-up on intersection
 * ========================================================================== */
const initScrollReveal = () => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window) || Utils.prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => observer.observe(el));
};

/* =============================================================================
 * Typewriter — used by the hero headline and the positivity wall
 * ========================================================================== */
const typeText = (el, text, { speed = 55, onDone } = {}) => {
  const cursor = el.querySelector('.cursor');
  if (Utils.prefersReducedMotion()) {
    el.textContent = text;
    if (cursor) el.appendChild(cursor);
    onDone?.();
    return;
  }
  let i = 0;
  el.textContent = '';
  if (cursor) el.appendChild(cursor);
  const step = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      if (cursor) el.appendChild(cursor);
      i += 1;
      window.setTimeout(step, speed);
    } else {
      onDone?.();
    }
  };
  step();
};

const initHeroTypewriter = () => {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;
  typeText(el, el.getAttribute('data-text') || '', { speed: 60 });
};

/* =============================================================================
 * Feelings — mood bubbles that open a glass popup and sync the site theme
 * ========================================================================== */
const FEELING_MESSAGES = {
  happy: 'Joy looks good on you today.',
  calm: 'Stillness is a place you can return to anytime.',
  sad: 'It is okay to not be okay. This moment will pass.',
  stressed: 'One breath, one thought, one step at a time.',
  angry: 'Your feelings are valid. Let them move through you gently.',
  tired: 'Rest is productive too.',
};
const FEELING_ICONS = {
  happy: 'bi-emoji-smile', calm: 'bi-emoji-sunglasses', sad: 'bi-emoji-frown',
  stressed: 'bi-emoji-dizzy', angry: 'bi-emoji-angry', tired: 'bi-moon-stars',
};

const initFeelings = (themeEngine) => {
  const bubbles = document.querySelectorAll('[data-feeling]');
  const modal = document.querySelector('[data-feelings-modal]');
  if (!bubbles.length || !modal) return;

  const messageEl = modal.querySelector('[data-feelings-message]');
  const iconEl = modal.querySelector('.mc-feelings__modal-icon i');

  const open = (feeling) => {
    messageEl.textContent = FEELING_MESSAGES[feeling] || 'A gentle shift can soften the whole day.';
    if (iconEl) iconEl.className = `bi ${FEELING_ICONS[feeling] || 'bi-heart'}`;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    themeEngine?.apply(feeling);
  };
  const close = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  };

  bubbles.forEach((bubble) => bubble.addEventListener('click', () => open(bubble.getAttribute('data-feeling'))));
  modal.querySelectorAll('[data-feelings-close]').forEach((btn) => btn.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
};

/* =============================================================================
 * Positivity Wall — auto-rotating quotes with a typewriter effect
 * ========================================================================== */
const POSITIVITY_QUOTES = [
  'Healing takes time.',
  'You matter.',
  'It is okay to pause.',
  'One small step every day.',
  'You are allowed to rest.',
  'This feeling is not forever.',
];

const initPositivityWall = () => {
  const el = document.querySelector('[data-quote-wall]');
  const dotsHolder = document.querySelector('[data-quote-dots]');
  if (!el) return;

  POSITIVITY_QUOTES.forEach((_, i) => {
    const dot = Utils.createEl('span', 'mc-positivity__dot' + (i === 0 ? ' is-active' : ''));
    dotsHolder?.appendChild(dot);
  });
  const dots = dotsHolder ? Array.from(dotsHolder.children) : [];

  let index = 0;
  const showNext = () => {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    typeText(el, POSITIVITY_QUOTES[index], {
      speed: 45,
      onDone: () => {
        window.setTimeout(() => {
          index = (index + 1) % POSITIVITY_QUOTES.length;
          showNext();
        }, 2600);
      },
    });
  };
  showNext();
};

/* =============================================================================
 * Breathing exercise — inhale / hold / exhale, forever
 * ========================================================================== */
const initBreathing = () => {
  const circle = document.querySelector('[data-breathe-circle]');
  if (!circle) return;

  const steps = [
    { label: 'Breathe In', cls: 'is-inhale', duration: 4000 },
    { label: 'Hold', cls: 'is-hold', duration: 4000 },
    { label: 'Breathe Out', cls: 'is-exhale', duration: 6000 },
  ];
  let i = 0;

  const run = () => {
    const step = steps[i];
    circle.textContent = step.label;
    circle.classList.remove('is-inhale', 'is-hold', 'is-exhale');
    void circle.offsetWidth; // restart transition
    circle.classList.add(step.cls);
    i = (i + 1) % steps.length;
    window.setTimeout(run, step.duration);
  };
  run();
};

/* =============================================================================
 * Growth tree — leaves grow in one by one as the tree scrolls into view
 * ========================================================================== */
const initGrowthTree = () => {
  const wrapper = document.querySelector('[data-tree]');
  const leaves = document.querySelectorAll('[data-tree-leaf]');
  if (!wrapper || !leaves.length) return;

  const grow = () => {
    leaves.forEach((leaf, i) => {
      window.setTimeout(() => leaf.classList.add('is-grown'), i * 260);
    });
  };

  if (!('IntersectionObserver' in window)) { grow(); return; }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      grow();
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  observer.observe(wrapper);
};

/* =============================================================================
 * Footer back-to-top
 * ========================================================================== */
const initBackToTop = () => {
  const btn = document.querySelector('[data-back-to-top]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth' });
  });
};

/* =============================================================================
 * App bootstrap
 * ========================================================================== */
const initApp = () => {
  initNavbar();
  const themeEngine = initThemeEngine();
  initMouseGlow();
  initRippleButtons();
  initScrollReveal();
  initHeroTypewriter();
  initFeelings(themeEngine);
  initPositivityWall();
  initBreathing();
  initGrowthTree();
  initBackToTop();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}