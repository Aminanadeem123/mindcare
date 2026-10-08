/* ==========================================================================
   MindCare Hub — Component JS (Navbar + Footer)
   Self-injecting: add <script src="component.js"> to any page.
   Automatically injects navbar + footer HTML and initializes all behavior.
   ========================================================================== */
;(function () {
  "use strict";

  /* ========================================================================
     1. UTILITIES
     ======================================================================== */
  const Utils = (() => {
    const prefersReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const throttle = (fn, limit = 100) => {
      let inThrottle = false;
      return (...args) => {
        if (inThrottle) return;
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      };
    };

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
        } catch { /* silent */ }
      },
    };

    const createEl = (tag, className, html) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (html !== undefined) el.innerHTML = html;
      return el;
    };

    const escapeHTML = (str) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };
      return String(str || "").replace(/[&<>"']/g, (c) => map[c]);
    };

    return { prefersReducedMotion, throttle, storage, createEl, escapeHTML };
  })();

  /* ========================================================================
     2. CURRENT PAGE HELPER
     ======================================================================== */
  const getCurrentPage = () => {
    try {
      const raw = decodeURIComponent(window.location.pathname.split("/").pop() || "");
      return raw || "index.html";
    } catch {
      return window.location.pathname.split("/").pop() || "index.html";
    }
  };

  const NAV_ITEMS = [
    { href: "index.html",        label: "Home" },
    { href: "relaxation 1.html", label: "Relaxation" },
    { href: "tracker.html?redirect=activity.html", label: "Activities" },
    { href: "journal.html",      label: "Journal" },
    {
      href: "patient-assessment.html",
      label: "Assessments",
      dropdown: [
        { href: "patient-assessment.html", label: "Patient Assessment" },
        { href: "student-assesment.html",  label: "Student Assessment" },
        { href: "doctor-assessment.html",  label: "Doctor Assessment" },
        { href: "parent-assessment.html",  label: "Parent Assessment" },
      ],
    },
    { href: "gallery.html",        label: "Gallery" },
    { href: "psychiatrists.html", label: "Psychiatrists" },
    { href: "contact.html",       label: "Contact" },
    { href: "about.html",         label: "About" },
  ];

  const ALL_MOBILE_LINKS = [
    { href: "index.html",               label: "Home" },
    { href: "about.html",               label: "About" },
    { href: "relaxation 1.html",        label: "Relaxation" },
    { href: "activity.html",            label: "Activities" },
    { href: "journal.html",             label: "Journal" },
    { href: "patient-assessment.html",  label: "Patient Assessment" },
    { href: "student-assesment.html",   label: "Student Assessment" },
    { href: "doctor-assessment.html",   label: "Doctor Assessment" },
    { href: "parent-assessment.html",   label: "Parent Assessment" },
    { href: "contact.html",             label: "Contact" },
    { href: "gallery.html",             label: "Gallery" },
    { href: "psychiatrists.html",       label: "Psychiatrists" },
  ];

  /* ========================================================================
     3. NAVBAR HTML
     ======================================================================== */
  function buildNavbarHTML(currentPage) {
    let desktopLinks = "";
    NAV_ITEMS.forEach((item) => {
      if (item.dropdown) {
        let ddItems = "";
        item.dropdown.forEach((d) => {
          ddItems += `<li><a href="${d.href}">${d.label}</a></li>`;
        });
        desktopLinks += `
        <li class="mc-dropdown">
          <a href="#" class="mc-navbar__link mc-navbar__link--dropdown" onclick="return false;">
            ${item.label}
            <i class="bi bi-chevron-down"></i>
          </a>
          <ul class="mc-dropdown__menu">${ddItems}</ul>
        </li>`;
      } else {
        const activeClass = item.href === currentPage ? " active" : "";
        desktopLinks += `
        <li><a href="${item.href}" class="mc-navbar__link${activeClass}">${item.label}</a></li>`;
      }
    });

    let mobileLinks = "";
    ALL_MOBILE_LINKS.forEach((item) => {
      const activeClass = item.href === currentPage ? " active" : "";
      mobileLinks += `
        <li>
          <a href="${item.href}" class="mc-navbar__mobile-link${activeClass}">
            ${item.label}
          </a>
        </li>`;
    });

    const user = getCurrentUser();
    const isAdmin = user && user.role === "admin";
    const adminLinkHTML = isAdmin
      ? `<li><a href="admin.html" class="mc-navbar__link${currentPage === "admin.html" ? " active" : ""}">Admin Panel</a></li>`
      : "";
    const adminMobileLinkHTML = isAdmin
      ? `<li><a href="admin.html" class="mc-navbar__mobile-link${currentPage === "admin.html" ? " active" : ""}">Admin Panel</a></li>`
      : "";

    return `
  <header class="mc-navbar" data-navbar role="banner">
    <div class="mc-navbar__inner">
      <a href="index.html" class="mc-navbar__logo" aria-label="MindCare Hub home">
        <span class="mc-navbar__logo-icon">
          <i class="bi bi-flower1" aria-hidden="true"></i>
        </span>
        <span class="mc-navbar__logo-text">MindCare&nbsp;Hub</span>
      </a>

      <nav class="mc-navbar__nav" aria-label="Primary navigation">
        <ul class="mc-navbar__list">${desktopLinks}${adminLinkHTML}
        </ul>
      </nav>

      <div class="mc-navbar__actions">
        <button type="button" class="mc-navbar__action mc-navbar__profile" aria-label="Open profile menu">
          <i class="bi bi-person-circle" aria-hidden="true"></i>
        </button>
        <button type="button" class="mc-navbar__action mc-navbar__menu-toggle" data-nav-toggle aria-label="Open mobile menu" aria-expanded="false" aria-controls="mc-mobile-menu">
          <span class="mc-navbar__menu-bar" aria-hidden="true"></span>
          <span class="mc-navbar__menu-bar" aria-hidden="true"></span>
          <span class="mc-navbar__menu-bar" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div id="mc-mobile-menu" class="mc-navbar__mobile-menu" data-nav-menu hidden>
      <ul class="mc-navbar__mobile-list">${mobileLinks}${adminMobileLinkHTML}
      </ul>
    </div>
  </header>`;
  }

  /* ========================================================================
     4. FOOTER HTML
     ======================================================================== */
  function buildFooterHTML() {
    return `
  <footer id="contact" class="mc-footer" aria-labelledby="mc-footer-heading">
    <h2 id="mc-footer-heading" class="mc-footer__visually-hidden-heading">Site footer</h2>

    <div class="mc-footer__decor" aria-hidden="true">
      <span class="mc-footer__decor-leaf mc-footer__decor-leaf--one"></span>
      <span class="mc-footer__decor-leaf mc-footer__decor-leaf--two"></span>
      <span class="mc-footer__decor-glow"></span>
    </div>

    <div class="mc-footer__grid">
      <div class="mc-footer__brand">
        <div class="mc-footer__logo">
          <span class="mc-footer__logo-icon"><i class="bi bi-flower1" aria-hidden="true"></i></span>
          <span class="mc-footer__logo-text">MindCare&nbsp;Hub</span>
        </div>
        <p class="mc-footer__about">A calm digital space dedicated to helping you understand, track, and nurture your emotional wellbeing, one gentle step at a time.</p>
      </div>

      <nav class="mc-footer__column" aria-labelledby="mc-footer-quick-links">
        <h3 id="mc-footer-quick-links" class="mc-footer__column-title">Quick Links</h3>
        <ul class="mc-footer__list">
          <li><a href="#home" class="mc-footer__link">Home</a></li>
          <li><a href="#mood" class="mc-footer__link">Mood</a></li>
          <li><a href="#relax" class="mc-footer__link">Relax</a></li>
          <li><a href="#activities" class="mc-footer__link">Activities</a></li>
          <li><a href="#journal" class="mc-footer__link">Journal</a></li>
        </ul>
      </nav>

      <nav class="mc-footer__column" aria-labelledby="mc-footer-resources">
        <h3 id="mc-footer-resources" class="mc-footer__column-title">Resources</h3>
        <ul class="mc-footer__list">
          <li><a href="about.html" class="mc-footer__link">About MindCare</a></li>
          <li><a href="relaxation 1.html" class="mc-footer__link">Guided Sessions</a></li>
          <li><a href="patient-assessment.html" class="mc-footer__link">Assessment</a></li>
          <li><a href="contact.html" class="mc-footer__link">Community</a></li>
        </ul>
      </nav>

      <nav class="mc-footer__column" aria-labelledby="mc-footer-support">
        <h3 id="mc-footer-support" class="mc-footer__column-title">Support</h3>
        <ul class="mc-footer__list">
          <li><a href="contact.html" class="mc-footer__link">Contact Us</a></li>
          <li><a href="about.html" class="mc-footer__link">Help Center</a></li>
          <li><a href="contact.html" class="mc-footer__link">Emergency Support</a></li>
          <li><a href="about.html" class="mc-footer__link">Privacy Policy</a></li>
        </ul>
      </nav>

      <div class="mc-footer__column mc-footer__socials-column">
        <h3 class="mc-footer__column-title">Follow Along</h3>
        <ul class="mc-footer__socials">
          <li><a href="javascript:void(0)" class="mc-footer__social-link" aria-label="MindCare Hub on Instagram"><i class="bi bi-instagram" aria-hidden="true"></i></a></li>
          <li><a href="javascript:void(0)" class="mc-footer__social-link" aria-label="MindCare Hub on Twitter"><i class="bi bi-twitter-x" aria-hidden="true"></i></a></li>
          <li><a href="javascript:void(0)" class="mc-footer__social-link" aria-label="MindCare Hub on Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a></li>
          <li><a href="javascript:void(0)" class="mc-footer__social-link" aria-label="MindCare Hub on YouTube"><i class="bi bi-youtube" aria-hidden="true"></i></a></li>
        </ul>
      </div>
    </div>

    <div class="mc-footer__bottom">
      <p class="mc-footer__copyright">&copy; 2026 MindCare Hub. All rights reserved.</p>
      <button type="button" class="mc-footer__back-to-top" aria-label="Back to top">
        <i class="bi bi-arrow-up" aria-hidden="true"></i>
      </button>
    </div>
  </footer>`;
  }

  /* ========================================================================
     5. PROFILE / AUTH HELPERS
     ======================================================================== */
  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "{}"); }
    catch { return {}; }
  };

  const getInitials = (name) =>
    (name || "User")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  /* ========================================================================
     6. MODAL SYSTEM
     ======================================================================== */
  const buildModal = (id, titleText, bodyHTML) => {
    let overlay = document.getElementById(id);
    if (overlay) return overlay;

    overlay = Utils.createEl("div", "mc-modal-overlay");
    overlay.id = id;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="mc-modal">
        <div class="mc-modal__header">
          <span class="mc-modal__title">${titleText}</span>
          <button type="button" class="mc-modal__close" aria-label="Close">&times;</button>
        </div>
        <div class="mc-modal__body">${bodyHTML}</div>
      </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.classList.remove("is-open");
    overlay.querySelector(".mc-modal__close")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    return overlay;
  };

  const openModal = (overlay) => overlay.classList.add("is-open");

  const openProfileModal = () => {
    const user = getCurrentUser();
    const safeName = Utils.escapeHTML(user.name);
    const safeEmail = Utils.escapeHTML(user.email);
    const roleLabel = Utils.escapeHTML((user.role || "user").charAt(0).toUpperCase() + (user.role || "user").slice(1));
    const regDate = Utils.escapeHTML(localStorage.getItem("registrationDate") || "Unknown");

    const body = `
      <div class="mc-modal__profile-header">
        <div class="mc-profile-avatar">${Utils.escapeHTML(getInitials(user.name))}</div>
        <div>
          <p class="mc-profile-menu__title">${safeName || "MindCare Member"}</p>
          <p class="mc-profile-menu__meta">${roleLabel}</p>
        </div>
      </div>
      <div class="mc-modal__field" data-field="name">
        <label>Full Name</label>
        <p data-view>${safeName || "\u2014"}</p>
        <input type="text" hidden value="${safeName}" />
      </div>
      <div class="mc-modal__field" data-field="email">
        <label>Email</label>
        <p data-view>${safeEmail || "\u2014"}</p>
        <input type="email" hidden value="${safeEmail}" />
      </div>
      <div class="mc-modal__field">
        <label>Role</label>
        <p>${roleLabel}</p>
      </div>
      <div class="mc-modal__field">
        <label>Registration Status</label>
        <p>Registered on ${regDate}</p>
      </div>
      <div class="mc-modal__actions">
        <button type="button" class="mc-modal__btn mc-modal__btn--ghost" data-action="cancel">Cancel</button>
        <button type="button" class="mc-modal__btn mc-modal__btn--primary" data-action="edit">Edit Profile</button>
      </div>`;

    const overlay = buildModal("mc-profile-modal", "My Profile", body);
    overlay.querySelector(".mc-modal__body").innerHTML = body;

    const editBtn = overlay.querySelector('[data-action="edit"]');
    const cancelBtn = overlay.querySelector('[data-action="cancel"]');
    const fields = overlay.querySelectorAll(".mc-modal__field[data-field]");
    let editing = false;

    const setEditing = (value) => {
      editing = value;
      fields.forEach((field) => {
        field.querySelector("[data-view]").hidden = value;
        field.querySelector("input").hidden = !value;
      });
      editBtn.textContent = value ? "Save Changes" : "Edit Profile";
    };

    editBtn.addEventListener("click", () => {
      if (!editing) { setEditing(true); return; }
      const updated = { ...getCurrentUser() };
      fields.forEach((field) => {
        const key = field.getAttribute("data-field");
        updated[key] = field.querySelector("input").value.trim() || updated[key];
      });
      localStorage.setItem("currentUser", JSON.stringify(updated));
      if (updated.name) localStorage.setItem("userName", updated.name);
      if (updated.email) localStorage.setItem("userEmail", updated.email);
      fields.forEach((field) => {
        const key = field.getAttribute("data-field");
        field.querySelector("[data-view]").textContent = updated[key] || "\u2014";
      });
      setEditing(false);
      document.dispatchEvent(new CustomEvent("mc:user-updated"));
    });

    cancelBtn.addEventListener("click", () => {
      setEditing(false);
      overlay.classList.remove("is-open");
    });

    openModal(overlay);
  };

  const openSettingsModal = () => {
    const user = getCurrentUser();
    const body = `
      <div class="mc-modal__field">
        <label>Name</label>
        <input type="text" data-setting-name value="${Utils.escapeHTML(user.name)}" />
      </div>
      <div class="mc-modal__field">
        <label>Email</label>
        <input type="email" data-setting-email value="${Utils.escapeHTML(user.email)}" />
      </div>
      <div class="mc-modal__actions">
        <button type="button" class="mc-modal__btn mc-modal__btn--ghost" data-action="cancel">Cancel</button>
        <button type="button" class="mc-modal__btn mc-modal__btn--primary" data-action="save">Save Changes</button>
      </div>`;
    const overlay = buildModal("mc-settings-modal", "Settings", body);
    overlay.querySelector(".mc-modal__body").innerHTML = body;

    overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      overlay.classList.remove("is-open");
    });
    overlay.querySelector('[data-action="save"]').addEventListener("click", () => {
      const name = overlay.querySelector("[data-setting-name]").value.trim();
      const email = overlay.querySelector("[data-setting-email]").value.trim();
      const updated = { ...getCurrentUser() };
      if (name) updated.name = name;
      if (email) updated.email = email;
      localStorage.setItem("currentUser", JSON.stringify(updated));
      if (name) localStorage.setItem("userName", name);
      if (email) localStorage.setItem("userEmail", email);
      overlay.classList.remove("is-open");
      document.dispatchEvent(new CustomEvent("mc:user-updated"));
    });

    openModal(overlay);
  };

  const openHelpModal = () => {
    const body = `
      <h4>What is MindCare Hub?</h4>
      <p>MindCare Hub is a wellness companion for mood tracking, guided relaxation, mindful activities, and daily reflection, built for students, patients, doctors, and parents.</p>
      <h4>Getting started</h4>
      <p>Create an account with Login / Sign Up, then explore the Mood Garden, Journal, and Activities from the navigation bar.</p>
      <h4>Need more help?</h4>
      <p>Reach out through the Contact page and our team will get back to you.</p>`;
    openModal(buildModal("mc-help-modal", "Help Center", body));
  };

  const openPrivacyModal = () => {
    const body = `
      <h4>Data we store</h4>
      <p>Your name, email, role, and wellness activity are stored locally in your browser so MindCare Hub can personalize your experience across visits.</p>
      <h4>How it's used</h4>
      <p>This information is only used to run your dashboard, remember your preferences, and tailor content to your selected role. It is not sold or shared with third parties.</p>
      <h4>Your control</h4>
      <p>You can update your name and email at any time from Settings, and Sign Out to clear your locally stored session from this device.</p>`;
    openModal(buildModal("mc-privacy-modal", "Privacy Policy", body));
  };

  /* ========================================================================
     7. INIT: NAVBAR (mobile menu, scroll, smooth scroll)
     ======================================================================== */
  const initNavbar = () => {
    const nav = document.querySelector("[data-navbar]");
    if (!nav) return;

    const toggle = nav.querySelector("[data-nav-toggle]");
    const menu = nav.querySelector("[data-nav-menu]");

    const onScroll = Utils.throttle(() => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }, 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const openMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      const firstFocusable = menu.querySelector("a, button");
      firstFocusable?.focus();
    };

    const closeMenu = () => {
      if (!menu || !toggle) return;
      if (!menu.classList.contains("is-open")) return;
      menu.classList.remove("is-open");
      menu.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    if (toggle && menu) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        menu.classList.contains("is-open") ? closeMenu() : openMenu();
      });

      document.addEventListener("click", (e) => {
        if (!menu.classList.contains("is-open")) return;
        if (menu.contains(e.target) || toggle.contains(e.target)) return;
        closeMenu();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });
    }
  };

  /* ========================================================================
     7b. DROPDOWN CLICK TOGGLE (for touch devices)
     ======================================================================== */
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".mc-navbar__link--dropdown");
    if (!trigger) return;
    e.preventDefault();
    const dropdown = trigger.closest(".mc-dropdown");
    if (!dropdown) return;
    const wasOpen = dropdown.classList.contains("is-open");
    document.querySelectorAll(".mc-dropdown.is-open").forEach((d) => d.classList.remove("is-open"));
    if (!wasOpen) dropdown.classList.add("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".mc-dropdown")) {
      document.querySelectorAll(".mc-dropdown.is-open").forEach((d) => d.classList.remove("is-open"));
    }
  });

  /* ========================================================================
     8. INIT: SEARCH
     ======================================================================== */
  const initSearch = () => {
    const trigger = document.querySelector(".mc-navbar__search");
    if (!trigger) return;

    const searchPanel = document.createElement("div");
    searchPanel.className = "mc-navbar__search-panel";
    searchPanel.setAttribute("role", "search");
    searchPanel.innerHTML =
      '<input type="search" aria-label="Search navigation" placeholder="Search" /><button type="button" aria-label="Close search">\u2715</button>';

    const actions = document.querySelector(".mc-navbar__actions");
    if (actions) actions.appendChild(searchPanel);

    const input = searchPanel.querySelector("input");
    const closeButton = searchPanel.querySelector("button");
    const links = Array.from(
      document.querySelectorAll(
        ".mc-navbar__link, .mc-navbar__mobile-link, .mc-dropdown__menu a"
      )
    );

    const clearHighlights = () =>
      links.forEach((link) => link.classList.remove("is-search-match"));

    const performSearch = (value) => {
      const query = value.trim().toLowerCase();
      clearHighlights();
      if (!query) return;
      links
        .filter((link) => (link.textContent || "").toLowerCase().includes(query))
        .forEach((link) => link.classList.add("is-search-match"));
    };

    const openSearch = () => {
      searchPanel.classList.add("is-open");
      input?.focus();
      input?.select();
    };

    const closeSearch = () => {
      searchPanel.classList.remove("is-open");
      clearHighlights();
      if (input) input.value = "";
    };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      searchPanel.classList.contains("is-open") ? closeSearch() : openSearch();
    });

    closeButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSearch();
    });

    input?.addEventListener("input", (e) => performSearch(e.target.value));
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
    });

    document.addEventListener("click", (e) => {
      if (!searchPanel.contains(e.target) && e.target !== trigger) closeSearch();
    });
  };

  /* ========================================================================
     9. INIT: PROFILE MENU
     ======================================================================== */
  const initProfileMenu = () => {
    const trigger = document.querySelector(".mc-navbar__profile");
    if (!trigger) return;

    const parent =
      trigger.closest(".mc-navbar__actions") || trigger.parentNode;
    let menu = parent.querySelector(".mc-profile-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "mc-profile-menu";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-hidden", "true");
      parent.appendChild(menu);
    }

    const renderTrigger = () => {
      const user = getCurrentUser();
      const isRegistered =
        localStorage.getItem("isRegistered") === "true";

      if (isRegistered && user.name) {
        trigger.classList.add("is-user");
        trigger.classList.remove("is-guest");
        trigger.setAttribute("aria-label", `Profile for ${Utils.escapeHTML(user.name)}`);
        trigger.innerHTML = Utils.escapeHTML(getInitials(user.name));
        return;
      }

      trigger.classList.add("is-guest");
      trigger.classList.remove("is-user");
      trigger.setAttribute("aria-label", "Login or Sign Up");
      trigger.innerHTML =
        '<i class="bi bi-person-circle" aria-hidden="true"></i><span>Login / Sign Up</span>';
    };

    const closeMenu = () => {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    };

    const openMenu = () => {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
    };

    const renderMenu = () => {
      const user = getCurrentUser();
      const isRegistered =
        localStorage.getItem("isRegistered") === "true";

      if (!isRegistered || !user.name) {
        menu.innerHTML = "";
        closeMenu();
        return;
      }

      const isAdmin = user.role === "admin";

      menu.innerHTML = `
        <div class="mc-profile-menu__list">
          <button type="button" class="mc-profile-menu__button" data-action="profile" role="menuitem">\uD83D\uDC64 My Profile</button>
          ${isAdmin ? '<button type="button" class="mc-profile-menu__button" data-action="admin" role="menuitem">\uD83D\uDED2 Admin Dashboard</button>' : ""}
          <button type="button" class="mc-profile-menu__button" data-action="settings" role="menuitem">\u2699 Settings</button>
          <button type="button" class="mc-profile-menu__button" data-action="help" role="menuitem">\u2753 Help</button>
          <button type="button" class="mc-profile-menu__button" data-action="privacy" role="menuitem">\uD83D\uDD12 Privacy Policy</button>
          <div class="mc-profile-menu__divider"></div>
          <button type="button" class="mc-profile-menu__button" data-action="signout" role="menuitem">\uD83D\uDEAA Sign Out</button>
        </div>`;

      menu.querySelector('[data-action="profile"]')?.addEventListener("click", () => {
        closeMenu();
        openProfileModal();
      });
      menu.querySelector('[data-action="admin"]')?.addEventListener("click", () => {
        closeMenu();
        window.location.href = "admin.html";
      });
      menu.querySelector('[data-action="settings"]')?.addEventListener("click", () => {
        closeMenu();
        openSettingsModal();
      });
      menu.querySelector('[data-action="help"]')?.addEventListener("click", () => {
        closeMenu();
        openHelpModal();
      });
      menu.querySelector('[data-action="privacy"]')?.addEventListener("click", () => {
        closeMenu();
        openPrivacyModal();
      });
      menu.querySelector('[data-action="signout"]')?.addEventListener("click", () => {
        closeMenu();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("completed");
        localStorage.removeItem("isRegistered");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("registrationDate");
        localStorage.removeItem("redirectAfterForm");
        localStorage.removeItem("redirectAfterLogin");
        sessionStorage.clear();
        renderTrigger();
        renderMenu();
        window.location.assign("index.html");
      });
    };

    const handleClick = (e) => {
      e?.stopPropagation();
      const user = getCurrentUser();
      const isRegistered =
        localStorage.getItem("isRegistered") === "true";

      if (!isRegistered || !user.name) {
        localStorage.setItem(
          "redirectAfterForm",
          window.location.pathname.split("/").pop() || "index.html"
        );
        window.location.assign("form.html");
        return;
      }

      if (menu.classList.contains("is-open")) {
        closeMenu();
        return;
      }

      renderMenu();
      openMenu();
    };

    trigger.addEventListener("click", handleClick);
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== trigger) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    document.addEventListener("mc:user-updated", () => {
      renderTrigger();
      renderMenu();
    });
    window.addEventListener("storage", () => {
      renderTrigger();
      renderMenu();
    });

    renderTrigger();
    closeMenu();
  };

  /* ========================================================================
     10. INIT: FOOTER LINKS
     ======================================================================== */
  const initFooterLinks = () => {
    const links = Array.from(
      document.querySelectorAll(".mc-footer__link, .mc-footer__social-link")
    );
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const text = (link.textContent || "").trim().toLowerCase();

        if (href && href.startsWith("#")) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }

        if (
          !href ||
          href === "#" ||
          href === "javascript:void(0)" ||
          href === 'javascript:void(0)"'
        ) {
          e.preventDefault();
          let targetPage = "index.html";
          if (text.includes("article")) targetPage = "about.html";
          else if (text.includes("guid")) targetPage = "relaxation 1.html";
          else if (
            text.includes("community") ||
            text.includes("support") ||
            text.includes("help") ||
            text.includes("privacy")
          )
            targetPage = "contact.html";
          window.location.assign(targetPage);
          return;
        }

        const protectedPages = [
          "patient-assessment.html",
          "doctor-assessment.html",
          "student-assesment.html",
          "parent-assessment.html",
          "patient-dashboard.html",
          "doctor-dashboard.html",
          "admin.html",
        ];
        const pageName = href.split("/").pop();
        if (protectedPages.includes(pageName)) {
          const registered =
            localStorage.getItem("isRegistered") === "true";
          if (!registered) {
            e.preventDefault();
            localStorage.setItem("redirectAfterForm", href);
            window.location.assign("form.html");
          }
        }
      });
    });
  };

  /* ========================================================================
     11. INIT: AUTH REDIRECT
     ======================================================================== */
  const initAuthRedirect = () => {
    const currentPage = window.location.pathname.split("/").pop();
    const returnedFromForm =
      sessionStorage.getItem("mindcare:returnFromForm") === "true";
    const registered =
      localStorage.getItem("isRegistered") === "true";
    const redirectTarget =
      localStorage.getItem("redirectAfterForm") ||
      localStorage.getItem("redirectAfterLogin");

    if (
      !returnedFromForm ||
      !registered ||
      currentPage !== "index.html"
    )
      return;

    sessionStorage.removeItem("mindcare:returnFromForm");
    localStorage.removeItem("redirectAfterForm");
    localStorage.removeItem("redirectAfterLogin");

    const target =
      redirectTarget &&
      redirectTarget !== "index.html" &&
      redirectTarget !== "form.html"
        ? redirectTarget
        : "index.html";

    window.location.assign(target);
  };

  /* ========================================================================
     12. INIT: ACCESSIBILITY (keyboard focus + live region)
     ======================================================================== */
  const initAccessibility = () => {
    const onFirstTab = (e) => {
      if (e.key !== "Tab") return;
      document.body.classList.add("user-is-tabbing");
      window.removeEventListener("keydown", onFirstTab);
      window.addEventListener("mousedown", onMouseDown);
    };
    const onMouseDown = () => {
      document.body.classList.remove("user-is-tabbing");
      window.removeEventListener("mousedown", onMouseDown);
      window.addEventListener("keydown", onFirstTab);
    };
    window.addEventListener("keydown", onFirstTab);

    let liveRegion = document.querySelector("[data-live-region]");
    if (!liveRegion) {
      liveRegion = Utils.createEl("div", "sr-only");
      liveRegion.setAttribute("data-live-region", "");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("role", "status");
      document.body.appendChild(liveRegion);
    }
  };

  /* ========================================================================
     13. INIT: BACK TO TOP
     ======================================================================== */
  const initBackToTop = () => {
    const btn = document.querySelector(".mc-footer__back-to-top");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: Utils.prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  };

  /* ========================================================================
     14. AUTO-INIT: INJECT + BOOTSTRAP
     ======================================================================== */
  const initComponent = () => {
    const currentPage = getCurrentPage();

    /* Skip injection on form.html — it has its own header */
    if (currentPage === "form.html") return;

    /* --- Inject Navbar --- */
    const existingNav = document.querySelector("[data-navbar]");
    if (!existingNav) {
      const navWrapper = document.createElement("div");
      navWrapper.innerHTML = buildNavbarHTML(currentPage);
      const navEl = navWrapper.firstElementChild;
      document.body.prepend(navEl);
    } else {
      /* Page already has a navbar with [data-navbar] — don't inject, just init */
    }

    /* --- Inject Footer --- */
    const existingFooter = document.querySelector(".mc-footer");
    if (!existingFooter) {
      const footerWrapper = document.createElement("div");
      footerWrapper.innerHTML = buildFooterHTML();
      const footerEl = footerWrapper.firstElementChild;
      document.body.appendChild(footerEl);
    }

    /* --- Initialize behavior --- */
    initAccessibility();
    initNavbar();
    initSearch();
    initProfileMenu();
    initFooterLinks();
    initBackToTop();
    initAuthRedirect();
  };

  /* ========================================================================
     15. GLOBAL EXPORTS (for page scripts that need shared utilities)
     ======================================================================== */
  window.MindCare = window.MindCare || {};
  window.MindCare.Utils = Utils;

  /* ========================================================================
     16. BOOT
     ======================================================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComponent);
  } else {
    initComponent();
  }
})();
