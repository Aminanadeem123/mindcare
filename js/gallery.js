/* =============================================================================
 * Relaxation Gallery ? page module
 * Vanilla ES6, no dependencies. LocalStorage only. No backend.
 * ========================================================================== */

const RG_STORAGE = {
  favorites: 'wellness:relaxationFavorites',
  feedback: 'wellness:relaxationFeedback',
  mood: 'wellness:mood',
};

const RG_ITEMS = [
  { id: 'ocean-waves',     title: 'Ocean Waves',      category: 'Ocean',       quote: 'Breathe deeply and let your thoughts drift away.', height: 'tall',  image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',  icon: 'bi-water' },
  { id: 'waterfall',       title: 'Waterfall Cascade', category: 'Nature',      quote: 'Let go, the way water always does.',                height: 'mid',   image: 'https://images.unsplash.com/photo-1494472155656-f34e81b17ddc?w=600&q=80',  icon: 'bi-droplet' },
  { id: 'forest-breeze',   title: 'Forest Breeze',    category: 'Forest',      quote: 'Nature restores the mind.',                         height: 'short', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',  icon: 'bi-tree' },
  { id: 'rain-window',     title: 'Rain on Window',   category: 'Mindfulness', quote: 'Slow down, even the sky is taking its time.',        height: 'tall',  image: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=600&q=80',  icon: 'bi-cloud-rain' },
  { id: 'clouds',          title: 'Drifting Clouds',  category: 'Nature',      quote: "You don't have to hold onto every thought.",         height: 'mid',   image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80',  icon: 'bi-cloud' },
  { id: 'cherry-blossoms', title: 'Cherry Blossoms',  category: 'Flowers',     quote: 'Impermanence is its own kind of peace.',             height: 'short', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80',  icon: 'bi-flower1' },
  { id: 'golden-sunset',   title: 'Golden Sunset',    category: 'Sunset',      quote: "Every sunset brings tomorrow's hope.",               height: 'tall',  image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&q=80',  icon: 'bi-sunset' },
  { id: 'quiet-sunrise',   title: 'Quiet Sunrise',    category: 'Sunset',      quote: 'Some days begin softly. Let this one.',              height: 'mid',   image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',  icon: 'bi-sunrise' },
  { id: 'night-sky',       title: 'Night Sky',        category: 'Mindfulness', quote: "Stillness is not empty, it's full of quiet.",        height: 'short', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',  icon: 'bi-stars' },
  { id: 'snowfall',        title: 'Snowfall',         category: 'Mountains',   quote: 'Even the coldest moment can feel gentle.',           height: 'tall',  image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',  icon: 'bi-snow' },
  { id: 'candle-flame',    title: 'Candle Flame',     category: 'Mindfulness', quote: 'One small flame is enough light to begin.',          height: 'mid',   image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=80',  icon: 'bi-fire' },
  { id: 'mountain-lake',   title: 'Mountain Lake',    category: 'Mountains',   quote: 'Movement can be peaceful too.',                      height: 'short', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',  icon: 'bi-water' },
];

const RG_MOOD_RECOMMENDATIONS = {
  happy:    ['Flowers', 'Sunset', 'Ocean'],
  calm:     ['Ocean', 'Forest', 'Mindfulness'],
  peaceful: ['Forest', 'Nature', 'Mindfulness'],
  focused:  ['Mindfulness', 'Mountains', 'Nature'],
  hopeful:  ['Sunset', 'Ocean', 'Flowers'],
  tired:    ['Mindfulness', 'Forest', 'Ocean'],
  anxious:  ['Mountains', 'Forest', 'Mindfulness'],
};

const rgStorage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable ? fail silently */ }
  },
};

let rgFavorites = new Set(rgStorage.get(RG_STORAGE.favorites, []));
let rgActiveCategory = 'All';
let rgSearchTerm = '';
let rgLightboxIndex = 0;
let rgVisibleItems = RG_ITEMS;

/* ---- Rendering ---- */

function rgCardTemplate(item, index) {
  const isFav = rgFavorites.has(item.id);
  return `
    <article class="rg-card rg-card--${item.height}" data-id="${item.id}" data-category="${item.category}" data-index="${index}" tabindex="0" role="button" aria-label="Open ${item.title}">
      <div class="rg-card__media">
        <img class="rg-card__video" loading="lazy" src="${item.image}" alt="${item.title}">
        <div class="rg-card__fallback"><i class="bi ${item.icon}" aria-hidden="true"></i></div>
        <span class="rg-card__badge">${item.category}</span>
        <button type="button" class="rg-card__favorite ${isFav ? 'is-favorited' : ''}" data-favorite="${item.id}" aria-label="Toggle favorite for ${item.title}">
          <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
        </button>
        <div class="rg-card__overlay">
          <h3 class="rg-card__title">${item.title}</h3>
          <p class="rg-card__quote">"${item.quote}"</p>
        </div>
        <span class="rg-card__view"><i class="bi bi-arrows-fullscreen" aria-hidden="true"></i></span>
      </div>
    </article>
  `;
}

function rgRenderGallery() {
  const mount = document.querySelector('[data-rg-gallery]');
  if (!mount) return;

  const term = rgSearchTerm.trim().toLowerCase();
  rgVisibleItems = RG_ITEMS.filter((item) => {
    const matchesCategory =
      rgActiveCategory === 'All' ||
      (rgActiveCategory === 'Favorites' ? rgFavorites.has(item.id) : item.category === rgActiveCategory);
    const matchesSearch = !term || item.title.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (!rgVisibleItems.length) {
    mount.innerHTML = `<p class="rg-empty">No calming scenes match that search yet. Try a different word or category.</p>`;
    return;
  }

  mount.innerHTML = rgVisibleItems.map((item, i) => rgCardTemplate(item, i)).join('');
  rgAttachCardHandlers();
  rgObserveVideos();
}

function rgAttachCardHandlers() {
  document.querySelectorAll('[data-rg-gallery] .rg-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-favorite]')) return;
      rgOpenLightbox(Number(card.dataset.index));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        rgOpenLightbox(Number(card.dataset.index));
      }
    });
  });

  document.querySelectorAll('[data-favorite]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      rgToggleFavorite(btn.dataset.favorite, btn);
    });
  });
}

function rgToggleFavorite(id, btn) {
  if (rgFavorites.has(id)) {
    rgFavorites.delete(id);
    btn.classList.remove('is-favorited');
    btn.querySelector('i').className = 'bi bi-heart';
  } else {
    rgFavorites.add(id);
    btn.classList.add('is-favorited');
    btn.querySelector('i').className = 'bi bi-heart-fill';
  }
  rgStorage.set(RG_STORAGE.favorites, Array.from(rgFavorites));
  if (rgActiveCategory === 'Favorites') rgRenderGallery();
}

/* ---- Lazy-load images ---- */

function rgObserveVideos() {
  // Images load natively with loading="lazy", no observer needed
}

function rgLoadVideo(video) {
  // No-op: images load via src attribute
}

/* ---- Filters + search ---- */

function rgInitFilters() {
  const buttons = document.querySelectorAll('[data-rg-filter]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      rgActiveCategory = btn.dataset.rgFilter;
      rgRenderGallery();
    });
  });
}

function rgInitSearch() {
  const input = document.querySelector('[data-rg-search]');
  if (!input) return;
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      rgSearchTerm = input.value;
      rgRenderGallery();
    }, 150);
  });
}

/* ---- Mood-based recommendations ---- */

function rgInitMoodRecommendations() {
  const mood = rgStorage.get(RG_STORAGE.mood, null);
  const banner = document.querySelector('[data-rg-recommend]');
  const label = document.querySelector('[data-rg-recommend-text]');
  if (!mood || !banner || !label || !RG_MOOD_RECOMMENDATIONS[mood]) return;

  const categories = RG_MOOD_RECOMMENDATIONS[mood];
  label.innerHTML = `Feeling <strong>${mood}</strong> today ? try <strong>${categories.join(', ')}</strong> scenes below.`;
  banner.classList.add('is-active');
}

/* ---- Lightbox ---- */

function rgOpenLightbox(index) {
  rgLightboxIndex = index;
  const overlay = document.querySelector('[data-rg-lightbox]');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  rgRenderLightbox();
}

function rgCloseLightbox() {
  const overlay = document.querySelector('[data-rg-lightbox]');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function rgRenderLightbox() {
  const item = rgVisibleItems[rgLightboxIndex];
  if (!item) return;
  const overlay = document.querySelector('[data-rg-lightbox]');
  const img = overlay.querySelector('[data-rg-lightbox-img]');
  const fallback = overlay.querySelector('.rg-lightbox__fallback');
  const title = overlay.querySelector('[data-rg-lightbox-title]');
  const quote = overlay.querySelector('[data-rg-lightbox-quote]');

  fallback.classList.remove('is-visible');
  fallback.innerHTML = `<i class="bi ${item.icon}" aria-hidden="true"></i>`;
  img.style.display = '';
  img.src = item.image;
  img.alt = item.title;
  img.onerror = () => {
    img.style.display = 'none';
    fallback.classList.add('is-visible');
  };

  title.textContent = item.title;
  quote.textContent = `"${item.quote}"`;
}

function rgLightboxStep(delta) {
  const total = rgVisibleItems.length;
  if (!total) return;
  rgLightboxIndex = (rgLightboxIndex + delta + total) % total;
  rgRenderLightbox();
}

function rgInitLightbox() {
  const overlay = document.querySelector('[data-rg-lightbox]');
  if (!overlay) return;

  overlay.querySelector('[data-rg-close]').addEventListener('click', rgCloseLightbox);
  overlay.querySelector('[data-rg-prev]').addEventListener('click', () => rgLightboxStep(-1));
  overlay.querySelector('[data-rg-next]').addEventListener('click', () => rgLightboxStep(1));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) rgCloseLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') rgCloseLightbox();
    if (e.key === 'ArrowLeft') rgLightboxStep(-1);
    if (e.key === 'ArrowRight') rgLightboxStep(1);
  });
}

/* ---- Relaxation timer widget ---- */

function rgInitTimer() {
  const widget = document.querySelector('[data-rg-timer]');
  if (!widget) return;

  const toggle = widget.querySelector('[data-rg-timer-toggle]');
  const options = widget.querySelectorAll('[data-rg-timer-option]');
  const startBtn = widget.querySelector('[data-rg-timer-start]');
  const ringProgress = widget.querySelector('.rg-timer__ring-progress');
  const ringLabel = widget.querySelector('[data-rg-timer-label]');
  const circumference = 2 * Math.PI * 22;

  let durationSeconds = 60;
  let remaining = durationSeconds;
  let timerInterval = null;

  ringProgress.style.strokeDasharray = `${circumference}`;
  ringProgress.style.strokeDashoffset = '0';

  toggle.addEventListener('click', () => widget.classList.toggle('is-open'));

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      durationSeconds = Number(opt.dataset.rgTimerOption);
      remaining = durationSeconds;
      clearInterval(timerInterval);
      timerInterval = null;
      startBtn.textContent = 'Start';
      rgUpdateRing(1);
      ringLabel.textContent = rgFormatTime(remaining);
    });
  });

  startBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      startBtn.textContent = 'Start';
      return;
    }
    startBtn.textContent = 'Pause';
    timerInterval = setInterval(() => {
      remaining -= 1;
      rgUpdateRing(remaining / durationSeconds);
      ringLabel.textContent = rgFormatTime(remaining);
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.textContent = 'Start';
        remaining = durationSeconds;
        rgUpdateRing(1);
        ringLabel.textContent = rgFormatTime(remaining);
      }
    }, 1000);
  });

  function rgUpdateRing(fraction) {
    ringProgress.style.strokeDashoffset = `${circumference * (1 - fraction)}`;
  }

  ringLabel.textContent = rgFormatTime(remaining);
}

function rgFormatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/* ---- Feedback ---- */

function rgInitFeedback() {
  const options = document.querySelectorAll('[data-rg-feedback]');
  const thanks = document.querySelector('[data-rg-feedback-thanks]');
  if (!options.length) return;

  options.forEach((btn) => {
    btn.addEventListener('click', () => {
      options.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      rgStorage.set(RG_STORAGE.feedback, { value: btn.dataset.rgFeedback, date: new Date().toISOString() });
      if (thanks) thanks.classList.add('is-visible');
    });
  });
}

/* ---- Bootstrap ---- */

function rgInitGallery() {
  rgRenderGallery();
  rgInitFilters();
  rgInitSearch();
  rgInitMoodRecommendations();
  rgInitLightbox();
  rgInitTimer();
  rgInitFeedback();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', rgInitGallery);
} else {
  rgInitGallery();
}