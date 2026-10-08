(() => {
  'use strict';

  /* =========================================================
   * Small shared utils (subset of Home page's Utils module)
   * ========================================================= */
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    }
  };

  const raf = (() => {
    const callbacks = [];
    const tick = (time) => {
      callbacks.forEach((cb) => cb(time));
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
    return { add: (cb) => callbacks.push(cb) };
  })();

  /* =========================================================
   * THEME — single source of truth lives on the Home page.
   *
   * Home's mood-garden UI is the only place a theme is ever
   * chosen, and the only place that ever WRITES the
   * 'wellness:mood' key to localStorage. This page has no mood
   * switcher, no settings panel, and never writes that key —
   * it only reads it and re-applies the identical palette table
   * and the same CSS custom properties (--mc-theme-*,
   * --mc-accent-*, --mc-glow-*) that Home's own theme engine
   * sets on <html>, plus the same `theme-*` class on <body>.
   * Every themed surface on this page (background, glass cards,
   * bubble inputs, buttons, icons, mouse glow, blobs) reads from
   * those same variables, so there is one theme system for the
   * whole site — this is just the code that lets Contact render
   * it, not a second theme system.
   * ========================================================= */
  const MOODS = ['happy', 'calm', 'peaceful', 'focused', 'hopeful', 'tired', 'anxious'];

  const MOOD_PALETTES = {
    happy:    { bgA:'#FFF8D6', bgB:'#FFE9A8', bgC:'#FFF4D4', accent:'#E8C787', accentDark:'#D2A24E', secondary:'#F1D8A7', gold:'#F0B84D', glow:'rgba(236,200,129,0.45)' },
    calm:     { bgA:'#E6F4EC', bgB:'#D9F0E6', bgC:'#F8FCF9', accent:'#8FBFA4', accentDark:'#6FA487', secondary:'#B9DCC6', gold:'#E4C06B', glow:'rgba(159,210,181,0.45)' },
    peaceful: { bgA:'#EAF8F0', bgB:'#E2F2F0', bgC:'#F9FCFB', accent:'#7FAF94', accentDark:'#568C6F', secondary:'#B5D5C3', gold:'#E4C06B', glow:'rgba(143,191,164,0.40)' },
    focused:  { bgA:'#EAF2FB', bgB:'#DCEBFA', bgC:'#F5F9FD', accent:'#7AA7D9', accentDark:'#4B87C9', secondary:'#A6C4E8', gold:'#E6B04E', glow:'rgba(122,167,217,0.40)' },
    hopeful:  { bgA:'#F7F0FB', bgB:'#EEEAF6', bgC:'#FCFAFD', accent:'#B6A7D8', accentDark:'#9E8BC0', secondary:'#D3C7E8', gold:'#E8C787', glow:'rgba(182,167,216,0.40)' },
    tired:    { bgA:'#F3F3F3', bgB:'#ECECEC', bgC:'#FAFAFA', accent:'#A8AAA7', accentDark:'#8A8E8B', secondary:'#CFCFCF', gold:'#D0B06F', glow:'rgba(180,180,180,0.35)' },
    anxious:  { bgA:'#F2EDFA', bgB:'#E9E2F8', bgC:'#FBF9FE', accent:'#9B86C8', accentDark:'#7D67B2', secondary:'#CBBEE8', gold:'#E4B15B', glow:'rgba(155,134,200,0.40)' },
  };

  const normalizeMood = (mood) => {
    if (!mood) return 'calm';
    const key = String(mood).toLowerCase();
    if (key === 'relaxed') return 'peaceful';
    if (key === 'sad') return 'tired';
    if (key === 'stressed') return 'anxious';
    return MOODS.includes(key) ? key : 'calm';
  };

  const applyThemePalette = (mood) => {
    const normalized = normalizeMood(mood);
    const palette = MOOD_PALETTES[normalized] || MOOD_PALETTES.calm;
    const root = document.documentElement;
    root.style.setProperty('--mc-theme-bg-a', palette.bgA);
    root.style.setProperty('--mc-theme-bg-b', palette.bgB);
    root.style.setProperty('--mc-theme-bg-c', palette.bgC);
    root.style.setProperty('--mc-accent-primary', palette.accent);
    root.style.setProperty('--mc-accent-primary-dark', palette.accentDark);
    root.style.setProperty('--mc-accent-secondary', palette.secondary);
    root.style.setProperty('--mc-accent-gold', palette.gold);
    root.style.setProperty('--mc-glow-mint', palette.glow);
    root.style.setProperty('--mc-theme-accent', palette.accent);
    root.style.setProperty('--mc-theme-glow', palette.glow);

    MOODS.forEach((item) => document.body.classList.remove(`theme-${item}`));
    document.body.classList.add(`theme-${normalized}`);
  };

  const initThemeSync = () => {
    const saved = storage.get('wellness:mood');
    if (saved) applyThemePalette(saved);

    // If Home (open in another tab/window) changes the mood, this
    // page updates instantly too — both tabs are reading the one
    // shared key, not running separate theme systems.
    window.addEventListener('storage', (event) => {
      if (event.key === 'wellness:mood' && event.newValue) {
        try { applyThemePalette(JSON.parse(event.newValue)); } catch {}
      }
    });
  };

  /* =========================================================
   * Mouse glow
   * ========================================================= */
  const initMouseGlow = () => {
    const glow = document.querySelector('[data-mouse-glow]');
    if (!glow || prefersReducedMotion()) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    raf.add(() => {
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    });
  };

  /* =========================================================
   * Ambient floating particles
   * ========================================================= */
  const initParticles = () => {
    const layer = document.querySelector('[data-particles]');
    if (!layer || prefersReducedMotion()) return;
    const count = Number(layer.getAttribute('data-particle-count')) || 20;
    const fragment = document.createDocumentFragment();
    const particles = [];

    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = 'particle';
      const size = randomBetween(2, 5);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${randomBetween(0, 100)}%`;
      el.style.top = `${randomBetween(0, 100)}%`;
      fragment.appendChild(el);
      particles.push({ el, speed: randomBetween(0.02, 0.08), phase: randomBetween(0, Math.PI * 2), amplitude: randomBetween(6, 18) });
    }
    layer.appendChild(fragment);

    raf.add((time) => {
      particles.forEach((p) => {
        const t = time * 0.001 * p.speed + p.phase;
        const y = Math.sin(t) * p.amplitude;
        const opacity = 0.3 + Math.sin(t * 1.3) * 0.2;
        p.el.style.transform = `translate3d(0, ${y}px, 0)`;
        p.el.style.opacity = String(clamp(opacity, 0.08, 0.5));
      });
    });
  };

  /* =========================================================
   * Scroll reveal for the glass cards
   * ========================================================= */
  const initScrollReveal = () => {
    const cards = document.querySelectorAll('.contact-layout .mc-glass-card');
    if (!cards.length) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('is-visible'));
      return;
    }
    cards.forEach((c) => c.classList.add('mc-glass-card--reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach((c) => observer.observe(c));
  };

  /* =========================================================
   * Back to top
   * ========================================================= */
  const initBackToTop = () => {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  };

  /* =========================================================
   * FORM — floating labels, live validation, submit experience
   * ========================================================= */
  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
      name: form.querySelector('[data-field="name"]'),
      email: form.querySelector('[data-field="email"]'),
      phone: form.querySelector('[data-field="phone"]'),
      subject: form.querySelector('[data-field="subject"]'),
      message: form.querySelector('[data-field="message"]'),
    };

    const NAME_RE = /^[A-Za-z\s]+$/;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const PHONE_DIGITS_RE = /^\+?[0-9]+$/;

    const validators = {
      name(value) {
        if (!value) return { valid: false, message: 'Please enter a valid name.' };
        if (!NAME_RE.test(value)) return { valid: false, message: 'Please enter a valid name.' };
        if (value.trim().replace(/\s/g, '').length < 3) return { valid: false, message: 'Name should contain at least 3 letters.' };
        return { valid: true, message: 'Looks good.' };
      },
      email(value) {
        if (!value || !EMAIL_RE.test(value)) return { valid: false, message: 'Please enter a valid email address.' };
        return { valid: true, message: 'Looks good.' };
      },
      phone(value) {
        if (!value) return { valid: false, message: 'Please enter a valid phone number.' };
        if (!PHONE_DIGITS_RE.test(value)) return { valid: false, message: 'Please enter a valid phone number.' };
        const digitCount = value.replace(/\D/g, '').length;
        if (digitCount < 7 || digitCount > 15) return { valid: false, message: 'Please enter a valid phone number.' };
        return { valid: true, message: 'Looks good.' };
      },
      subject(value) {
        const trimmed = value.trim();
        if (trimmed.length < 4) return { valid: false, message: 'Subject should be at least 4 characters.' };
        if (!/[A-Za-z0-9]/.test(trimmed)) return { valid: false, message: 'Please enter a meaningful subject.' };
        return { valid: true, message: 'Looks good.' };
      },
      message(value) {
        const trimmed = value.trim();
        if (trimmed.length < 20) return { valid: false, message: 'Please describe your message.' };
        return { valid: true, message: 'Looks good.' };
      },
    };

    const setFieldState = (key, result, { showMessage = true } = {}) => {
      const wrap = fields[key];
      if (!wrap) return;
      const status = wrap.querySelector('[data-status]');
      const msg = wrap.querySelector('[data-message]');

      wrap.classList.remove('is-valid', 'is-invalid');
      if (status) status.className = 'bubble-field__status';
      if (msg) { msg.classList.remove('is-visible', 'is-success'); msg.textContent = ''; }

      if (result.valid) {
        wrap.classList.add('is-valid');
        if (status) { status.classList.add('is-valid'); status.innerHTML = '<i class="bi bi-check-circle-fill"></i>'; }
      } else if (showMessage) {
        wrap.classList.add('is-invalid');
        if (status) { status.classList.add('is-invalid'); status.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i>'; }
        if (msg) { msg.textContent = result.message; msg.classList.add('is-visible'); }
      }

    };

    const shake = (key) => {
      const wrap = fields[key];
      if (!wrap) return;
      wrap.classList.remove('is-shaking');
      // eslint-disable-next-line no-unused-expressions
      void wrap.offsetWidth;
      wrap.classList.add('is-shaking');
    };

    // Floating label state + counter + live validation
    Object.entries(fields).forEach(([key, wrap]) => {
      if (!wrap) return;
      const control = wrap.querySelector('.bubble-field__control');
      if (!control) return;

      const sync = () => control.classList.toggle('has-value', control.value.trim().length > 0);
      sync();

      control.addEventListener('input', () => {
        sync();
        if (key === 'message') {
          const counter = wrap.querySelector('[data-counter]');
          const len = control.value.trim().length;
          if (counter) {
            counter.textContent = `${len} / 20`;
            counter.classList.toggle('is-ok', len >= 20);
          }
        }
        const result = validators[key](control.value.trim());
        if (control.value.trim().length === 0) {
          wrap.classList.remove('is-valid', 'is-invalid');
          const status = wrap.querySelector('[data-status]');
          const msg = wrap.querySelector('[data-message]');
          if (status) status.className = 'bubble-field__status';
          if (msg) { msg.classList.remove('is-visible'); msg.textContent = ''; }
          return;
        }
        setFieldState(key, result);
      });

      control.addEventListener('blur', () => {
        if (control.value.trim().length === 0) return;
        setFieldState(key, validators[key](control.value.trim()));
      });

      // Ripple effect on the bubble shell itself, matching the submit button.
      const shell = wrap.querySelector('.bubble-field__shell');
      if (shell) {
        shell.addEventListener('pointerdown', (event) => {
          const rect = shell.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'bubble-field__ripple';
          const size = Math.max(rect.width, rect.height) * 1.2;
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
          ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
          shell.appendChild(ripple);
          window.setTimeout(() => ripple.remove(), 600);
        });
      }
    });

    // Ripple effect on submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', (event) => {
      const rect = submitBtn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'premium-submit__ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      submitBtn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });

    const banner = document.getElementById('successBanner');
    const showBanner = () => {
      banner.classList.add('is-visible');
      window.setTimeout(() => banner.classList.remove('is-visible'), 4000);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let allValid = true;
      Object.entries(fields).forEach(([key, wrap]) => {
        const control = wrap.querySelector('.bubble-field__control');
        const result = validators[key](control.value.trim());
        setFieldState(key, result);
        if (!result.valid) {
          allValid = false;
          shake(key);
        }
      });

      if (!allValid) return;

      const textEl = submitBtn.querySelector('.premium-submit__text');
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      textEl.textContent = 'Sending...';

      window.setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-success');
        textEl.textContent = 'Message sent successfully';
        submitBtn.querySelector('.premium-submit__icon').innerHTML = '<i class="bi bi-check-circle-fill"></i>';
        submitBtn.querySelector('.premium-submit__icon').style.display = 'inline-flex';

        showBanner();

        window.setTimeout(() => {
          form.reset();
          Object.values(fields).forEach((wrap) => {
            wrap.classList.remove('is-valid', 'is-invalid');
            const control = wrap.querySelector('.bubble-field__control');
            control.classList.remove('has-value');
            const status = wrap.querySelector('[data-status]');
            const msg = wrap.querySelector('[data-message]');
            if (status) status.className = 'bubble-field__status';
            if (msg) { msg.classList.remove('is-visible'); msg.textContent = ''; }
          });
          const counter = form.querySelector('[data-counter]');
          if (counter) { counter.textContent = '0 / 20'; counter.classList.remove('is-ok'); }
          submitBtn.classList.remove('is-success');
          submitBtn.disabled = false;
          textEl.textContent = 'Send message';
          submitBtn.querySelector('.premium-submit__icon').innerHTML = '<i class="bi bi-send-fill"></i>';
        }, 2600);
      }, 1400);
    });
  };

  const initApp = () => {
    initThemeSync();
    initMouseGlow();
    initParticles();
    initScrollReveal();
    initBackToTop();
    initContactForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();