'use strict';

const Utils = window.MindCare?.Utils;
const normalizeMood = window.MindCare?.normalizeMood;
const initAdminThemeSync = () => {
  const updateMoodLabel = (mood) => {
    const label = document.querySelector('[data-current-mood]');
    if (!label) return;
    const normalized = normalizeMood(mood);
    label.textContent = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  updateMoodLabel(Utils.storage.get('wellness:mood'));

  document.addEventListener('theme:change', (e) => updateMoodLabel(e.detail?.mood));

  window.addEventListener('storage', (e) => {
    if (e.key === 'wellness:mood') updateMoodLabel(Utils.storage.get('wellness:mood'));
    if (e.key === ACTIVITY_KEY) renderAll();
  });
};

/* =============================================================================
 * Activity logging system
 * ------------------------------------------------------------------------
 * logActivity(activityName) is the single reusable function every page in
 * MindCare Hub should call. It writes a small record to localStorage; this
 * dashboard reads that same record.
 *
 * Where to call it on each page (add <script> hooks like these):
 *   Home page        → logActivity('Visited Home Page');
 *   About page        → logActivity('Visited About Page');
 *   Contact page       → logActivity('Started Contact Form');
 *                        logActivity('Submitted Contact Form');
 *   Assessment wizard  → logActivity('Started Assessment');
 *                        logActivity('Completed Assessment');
 *   Profile page      → logActivity('Visited Profile');
 *   Mood Garden       → logActivity('Changed Mood'); (theme is captured automatically)
 *   Login / Logout    → logActivity('User Logged In'); / logActivity('User Logged Out');
 * ========================================================================== */
const ACTIVITY_KEY = 'mc_activity_log';
const MAX_LOG_SIZE = 500;

function logActivity(activityName) {
  if (!activityName) return;
  const currentMood = normalizeMood(Utils.storage.get('wellness:mood') || 'calm');
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(activityName),
    theme: currentMood,
    ts: Date.now(),
  };
  const log = Utils.storage.get(ACTIVITY_KEY, []);
  log.unshift(entry);
  if (log.length > MAX_LOG_SIZE) log.length = MAX_LOG_SIZE;
  Utils.storage.set(ACTIVITY_KEY, log);
  document.dispatchEvent(new CustomEvent('activity:logged', { detail: entry }));
  return entry;
}
window.logActivity = logActivity;

/* Categorize a free-text activity name into an icon + filter bucket. */
const ACTIVITY_RULES = [
  [/logged in|login/i,        { icon: 'bi-box-arrow-in-right', category: 'login' }],
  [/logged out|logout/i,       { icon: 'bi-box-arrow-right',   category: 'login' }],
  [/theme/i,                   { icon: 'bi-palette-fill',      category: 'theme' }],
  [/assessment/i,               { icon: 'bi-clipboard2-pulse-fill', category: 'assessment' }],
  [/contact|validation/i,       { icon: 'bi-envelope-fill',     category: 'contact' }],
  [/profile/i,                  { icon: 'bi-person-circle',     category: 'profile' }],
  [/mood/i,                     { icon: 'bi-emoji-smile-fill',  category: 'mood' }],
  [/home/i,                     { icon: 'bi-house-heart-fill',  category: 'home' }],
  [/about/i,                    { icon: 'bi-info-circle-fill',  category: 'about' }],
  [/resource/i,                 { icon: 'bi-collection-fill',   category: 'resources' }],
  [/relax/i,                    { icon: 'bi-cloud-moon-fill',   category: 'relaxation' }],
  [/music/i,                    { icon: 'bi-music-note-beamed', category: 'music' }],
  [/faq/i,                      { icon: 'bi-question-circle-fill', category: 'faq' }],
];
const categorize = (name) => {
  for (const [pattern, meta] of ACTIVITY_RULES) if (pattern.test(name)) return meta;
  return { icon: 'bi-activity', category: 'other' };
};

/* =============================================================================
 * Formatting helpers
 * ========================================================================== */
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (ts) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString();
const isThisWeek = (ts) => {
  const now = new Date(); const d = new Date(ts);
  const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
  return d >= start;
};

/* =============================================================================
 * Live clock
 * ========================================================================== */
const initClock = () => {
  const timeEl = document.querySelector('[data-live-time]');
  const dateEl = document.querySelector('[data-live-date]');
  const tick = () => {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  tick();
  setInterval(tick, 1000);
};

/* =============================================================================
 * Animated counters
 * ========================================================================== */
const animateCount = (el, to) => {
  const from = Number(el.textContent) || 0;
  if (from === to) { el.textContent = to; return; }
  const duration = 600;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* =============================================================================
 * State
 * ========================================================================== */
let currentFilter = 'all';
let currentSearch = '';

const getLog = () => Utils.storage.get(ACTIVITY_KEY, []);

/* =============================================================================
 * Render: stat cards
 * ========================================================================== */
const renderStats = (log) => {
  const count = (rx) => log.filter((e) => rx.test(e.name)).length;
  const values = {
    total: log.length,
    home: count(/home/i),
    about: count(/about/i),
    contact: count(/contact/i),
    assessment: count(/completed assessment/i) || count(/assessment/i),
    theme: count(/theme/i),
    profile: count(/profile/i),
    mood: count(/mood/i),
  };
  Object.entries(values).forEach(([key, val]) => {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (el) animateCount(el, val);
  });
};

/* =============================================================================
 * Render: statistics / facts panel
 * ========================================================================== */
const renderFacts = (log) => {
  const pageNames = { home: 'Home Page', about: 'About Page', contact: 'Contact Page', resources: 'Resources', assessment: 'Assessment', profile: 'Profile' };
  const pageCounts = {};
  log.forEach((e) => {
    const { category } = categorize(e.name);
    if (pageNames[category]) pageCounts[category] = (pageCounts[category] || 0) + 1;
  });
  const topPageKey = Object.keys(pageCounts).sort((a, b) => pageCounts[b] - pageCounts[a])[0];

  const themeCounts = {};
  log.forEach((e) => { themeCounts[e.theme] = (themeCounts[e.theme] || 0) + 1; });
  const topThemeKey = Object.keys(themeCounts).sort((a, b) => themeCounts[b] - themeCounts[a])[0];

  const set = (key, val) => { const el = document.querySelector(`[data-fact="${key}"]`); if (el) el.textContent = val; };

  set('mostPage', topPageKey ? pageNames[topPageKey] : '—');
  set('mostTheme', topThemeKey || '—');
  set('recent', log.length ? log[0].name : '—');
  set('visits', log.filter((e) => /visited/i.test(e.name)).length);
  set('contactForms', log.filter((e) => /submitted contact form/i.test(e.name)).length);
  set('assessments', log.filter((e) => /completed assessment/i.test(e.name)).length);
};

/* =============================================================================
 * Render: timeline
 * ========================================================================== */
const applyFilters = (log) => {
  let result = log;
  if (currentFilter === 'today') result = result.filter((e) => isToday(e.ts));
  else if (currentFilter === 'week') result = result.filter((e) => isThisWeek(e.ts));
  else if (['theme', 'assessment', 'contact', 'login', 'profile'].includes(currentFilter)) {
    result = result.filter((e) => categorize(e.name).category === currentFilter);
  }
  if (currentSearch.trim()) {
    const q = currentSearch.trim().toLowerCase();
    result = result.filter((e) => e.name.toLowerCase().includes(q));
  }
  return result;
};

const renderTimeline = (log) => {
  const container = document.querySelector('[data-timeline]');
  const emptyState = document.querySelector('[data-empty-state]');
  if (!container) return;

  const filtered = applyFilters(log).slice(0, 20);
  container.innerHTML = '';

  if (log.length === 0) {
    container.hidden = true;
    emptyState.hidden = false;
    return;
  }
  container.hidden = false;
  emptyState.hidden = true;

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:var(--mc-text-muted); font-size:var(--mc-fs-sm); padding: 1rem 0;">No activities match your search or filter.</p>`;
    return;
  }

  filtered.forEach((entry, i) => {
    const { icon, category } = categorize(entry.name);
    const item = Utils.createEl('div', 'mc-timeline-item');
    item.style.animationDelay = `${Math.min(i * 0.04, 0.6)}s`;
    item.innerHTML = `
      <span class="mc-timeline-item__icon"><i class="bi ${icon}" aria-hidden="true"></i></span>
      <span class="mc-timeline-item__body">
        <span class="mc-timeline-item__name">${entry.name}</span>
        <span class="mc-timeline-item__meta">
          <span>${fmtDate(entry.ts)}</span>
          <span>${fmtTime(entry.ts)}</span>
          <span class="mc-timeline-item__tag">${category}</span>
        </span>
      </span>
    `;
    container.appendChild(item);
  });
};

/* =============================================================================
 * Filters + search wiring
 * ========================================================================== */
const initFilters = () => {
  const bar = document.getElementById('filterBar');
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('.mc-filter-chip');
    if (!chip) return;
    bar.querySelectorAll('.mc-filter-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    currentFilter = chip.dataset.filter;
    renderTimeline(getLog());
  });

  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('input', Utils.debounce((e) => {
      currentSearch = e.target.value;
      renderTimeline(getLog());
    }, 150));
  }
};

/* =============================================================================
 * Notification bell
 * ========================================================================== */
const NOTIF_SEEN_KEY = 'mc_admin_last_seen_count';

const updateBell = (log) => {
  const lastSeen = Number(localStorage.getItem(NOTIF_SEEN_KEY) || log.length);
  const unseen = Math.max(0, log.length - lastSeen);
  const countEl = document.querySelector('[data-bell-count]');
  if (!countEl) return;
  if (unseen > 0) { countEl.hidden = false; countEl.textContent = unseen > 99 ? '99+' : unseen; }
  else { countEl.hidden = true; }
};

const initBell = () => {
  const bell = document.getElementById('bellBtn');
  if (!bell) return;
  bell.addEventListener('click', () => {
    localStorage.setItem(NOTIF_SEEN_KEY, String(getLog().length));
    updateBell(getLog());
  });
};

const showToast = (entry) => {
  const layer = document.querySelector('[data-toast-layer]');
  if (!layer) return;
  const { icon } = categorize(entry.name);
  const toast = Utils.createEl('div', 'mc-toast');
  toast.innerHTML = `
    <span class="mc-toast__icon"><i class="bi ${icon}"></i></span>
    <span>
      <span class="mc-toast__title">New activity</span><br>
      <span class="mc-toast__text">${entry.name}</span>
    </span>
  `;
  layer.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(24px)'; toast.style.transition = 'all .3s ease'; setTimeout(() => toast.remove(), 300); }, 4000);

  const bell = document.getElementById('bellBtn');
  if (bell) { bell.classList.remove('is-ringing'); void bell.offsetWidth; bell.classList.add('is-ringing'); }
};

/* =============================================================================
 * Clear logs + export CSV
 * ========================================================================== */
const initDataActions = () => {
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');

  clearBtn?.addEventListener('click', () => {
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    Utils.storage.set(ACTIVITY_KEY, []);
    localStorage.setItem(NOTIF_SEEN_KEY, '0');
    renderAll();
  });

  exportBtn?.addEventListener('click', () => {
    const log = getLog();
    if (!log.length) { alert('There is no activity to export yet.'); return; }
    const rows = [['Activity', 'Theme', 'Date', 'Time'].join(',')];
    log.forEach((e) => {
      rows.push([`"${e.name.replace(/"/g, '""')}"`, e.theme, fmtDate(e.ts), fmtTime(e.ts)].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mindcare-activity-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logActivity('User Logged Out');
  });
};

/* =============================================================================
 * Ripple + button feedback for .mc-btn / sidebar quick actions
 * ========================================================================== */
const initRipple = () => {
  document.querySelectorAll('.mc-btn, .mc-sidebar__link, .mc-filter-chip').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = Utils.createEl('span', 'ripple');
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
};

/* Mouse glow, mobile nav toggle, and back-to-top are all handled by the
 * shared chrome script above (initMouseGlow / initNavbar copied verbatim
 * from index.html, plus a tiny back-to-top wire-up in initAdminThemeSync's
 * neighbourhood below) — no duplicate implementations needed here. */

/* =============================================================================
 * Render orchestration
 * ========================================================================== */
const renderAll = () => {
  const log = getLog();
  renderStats(log);
  renderFacts(log);
  renderTimeline(log);
  updateBell(log);
};

/* Listen for new activity logged in THIS tab (e.g. via logActivity() calls
 * from demo buttons, or future pages loaded into an iframe/SPA shell). */
document.addEventListener('activity:logged', (e) => {
  renderAll();
  showToast(e.detail);
});

/* =============================================================================
 * Bootstrap
 * ========================================================================== */
const initAdminApp = () => {
  // Admin-only pieces (shared chrome handled by component.js).
  initAdminThemeSync();
  initClock();
  initFilters();
  initBell();
  initDataActions();
  renderAll();
  initRipple();

  // Log this visit itself so "Visited Admin" style tracking works too.
  logActivity('Visited Admin Dashboard');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
  initAdminApp();
}