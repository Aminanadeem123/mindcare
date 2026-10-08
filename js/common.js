/* ===========================================================
   MindCare Hub - Common JS
   Used on every page except form.html
=========================================================== */

function safeGetStorage(key, fallback = "") {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch { return fallback; }
}

function safeSetStorage(key, value) {
    try { localStorage.setItem(key, String(value)); } catch {}
}

function safeRemoveStorage(key) {
    try { localStorage.removeItem(key); } catch {}
}

function normalizePage(page) {
    if (!page || page === "null" || page === "undefined") return "index.html";
    return page;
}

function rememberRequestedPage(page) {
    const targetPage = normalizePage(page);
    if (targetPage === "form.html") return;
    safeSetStorage("redirectAfterForm", targetPage);
    safeSetStorage("requestedPage", targetPage);
}

function resolveTargetPage(defaultPage = "index.html") {
    const savedTarget = safeGetStorage("redirectAfterForm", "") || safeGetStorage("requestedPage", "");
    const candidate = normalizePage(savedTarget);
    if (!candidate || candidate === "form.html") return defaultPage;
    return candidate;
}

const SESSION_KEYS = ["completed","isRegistered","currentUser","role","userName","userEmail","userRole","registrationDate","redirectAfterForm","requestedPage"];

function clearSession() {
    SESSION_KEYS.forEach(safeRemoveStorage);
}

function cleanOldSession() {
    const VALID = ["user", "admin"];
    const role = safeGetStorage("role");
    let user = {};
    try { user = JSON.parse(safeGetStorage("currentUser", "{}")); } catch {}
    const reg = safeGetStorage("isRegistered") === "true";
    const comp = safeGetStorage("completed");

    const bad = (role && !VALID.includes(role)) ||
                (user.role && !VALID.includes(user.role)) ||
                (reg && !user.name) ||
                comp === "no";

    if (bad) clearSession();
}

cleanOldSession();

(() => {
    "use strict";

    const PUBLIC_PAGES = [
        "index.html", "about.html", "contact.html", "relaxation 1.html",
        "activity.html", "movement.html", "gallery.html", "psychiatrists.html",
        "journal.html", "tracker.html", "form.html"
    ];

    const PAGE_ROLES = {
        "patient-assessment.html": ["user", "admin"],
        "doctor-assessment.html": ["user", "admin"],
        "student-assesment.html": ["user", "admin"],
        "parent-assessment.html": ["user", "admin"],
        "admin.html": ["admin"],
        "journal.html": ["user", "admin"],
        "tracker.html": ["user", "admin"],
        "relaxation 1.html": ["user", "admin"],
        "activity.html": ["user", "admin"],
        "movement.html": ["user", "admin"],
        "patient-dashboard.html": ["user", "admin"],
        "doctor-dashboard.html": ["user", "admin"]
    };

    let currentPage = "index.html";
    try {
        currentPage = normalizePage(decodeURIComponent(window.location.pathname.split("/").pop() || ""));
    } catch { currentPage = normalizePage(window.location.pathname.split("/").pop() || ""); }

    const completed = safeGetStorage("completed") === "yes";
    const registered = safeGetStorage("isRegistered") === "true";

    function highlightNavbar() {
        document.querySelectorAll(".nav-link, .mc-navbar__link, .mc-navbar__mobile-link").forEach((link) => {
            const href = (link.getAttribute("href") || "").split("#")[0];
            const isHomeLink = href === "" || href === "index.html";
            const isCurrentHome = currentPage === "index.html" || currentPage === "";
            if ((isHomeLink && isCurrentHome) || href === currentPage) link.classList.add("active");
        });
    }

    if (currentPage === "form.html") {
        if (completed) {
            const targetPage = resolveTargetPage("index.html");
            safeRemoveStorage("redirectAfterForm");
            safeRemoveStorage("requestedPage");
            window.location.replace(targetPage);
            return;
        }
        highlightNavbar();
        return;
    }

    if (PUBLIC_PAGES.includes(currentPage)) { highlightNavbar(); return; }

    if (!completed && !registered) {
        rememberRequestedPage(currentPage);
        window.location.replace("form.html");
        return;
    }

    let currentUser = {};
    try { currentUser = JSON.parse(safeGetStorage("currentUser", "{}")); } catch { currentUser = {}; }

    const role = currentUser.role || safeGetStorage("role", "");

    if (PAGE_ROLES[currentPage] && !PAGE_ROLES[currentPage].includes(role)) { highlightNavbar(); return; }

    window.currentUser = currentUser;
    highlightNavbar();
})();

function logout() {
    clearSession();
    window.location.href = "form.html";
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".protected-link").forEach((link) => {
        link.addEventListener("click", function (event) {
            if (safeGetStorage("isRegistered") !== "true" && safeGetStorage("completed") !== "yes") {
                event.preventDefault();
                rememberRequestedPage(this.getAttribute("href") || "");
                window.location.href = "form.html";
            }
        });
    });

    const assessmentLinks = document.querySelectorAll(".assessment-link");
    if (assessmentLinks.length) {
        const role = safeGetStorage("role", "");
        assessmentLinks.forEach((link) => {
            const allowed = link.getAttribute("data-role") || "";
            if (role !== "admin" && allowed !== role) {
                const parent = link.parentElement;
                if (parent) parent.style.display = "none";
            }
        });
    }
});

function openProtectedPage(page) {
    const targetPage = normalizePage(page);
    if (safeGetStorage("completed") !== "yes" && safeGetStorage("isRegistered") !== "true") {
        rememberRequestedPage(targetPage);
        window.location.href = "form.html";
        return;
    }
    window.location.href = targetPage;
}

/* ===========================================================
   MindCare Hub - Global Mood Theme Sync
   Restores the color theme selected on the home page (Mood
   Garden) on every OTHER page that loads common.js. Reads the
   same "wellness:mood" localStorage key that js/index.js
   writes to (via Utils.storage, which JSON-stringifies values),
   so it must be read back with JSON.parse to match.
   This block only READS from storage - it never overwrites the
   mood, so the home page's own theme logic is unaffected.
=========================================================== */
(() => {
    "use strict";

    const MC_MOODS = ["happy", "calm", "peaceful", "focused", "hopeful", "tired", "anxious"];

    const MC_MOOD_PALETTES = {
        happy: {
            bgA: "#FFF8D6", bgB: "#FFE9A8", bgC: "#FFF4D4",
            accent: "#E8C787", accentDark: "#D2A24E", secondary: "#F1D8A7", gold: "#F0B84D",
            glow: "rgba(236, 200, 129, 0.45)", glowLavender: "rgba(243, 219, 173, 0.42)", glowAqua: "rgba(255, 240, 206, 0.38)", glowGold: "rgba(240, 184, 77, 0.45)"
        },
        calm: {
            bgA: "#E6F4EC", bgB: "#D9F0E6", bgC: "#F8FCF9",
            accent: "#8FBFA4", accentDark: "#6FA487", secondary: "#B9DCC6", gold: "#E4C06B",
            glow: "rgba(159, 210, 181, 0.45)", glowLavender: "rgba(183, 214, 199, 0.42)", glowAqua: "rgba(140, 205, 205, 0.4)", glowGold: "rgba(232, 199, 135, 0.55)"
        },
        peaceful: {
            bgA: "#EAF8F0", bgB: "#E2F2F0", bgC: "#F9FCFB",
            accent: "#7FAF94", accentDark: "#568C6F", secondary: "#B5D5C3", gold: "#E4C06B",
            glow: "rgba(143, 191, 164, 0.40)", glowLavender: "rgba(188, 215, 203, 0.4)", glowAqua: "rgba(140, 205, 205, 0.4)", glowGold: "rgba(232, 199, 135, 0.55)"
        },
        focused: {
            bgA: "#EAF2FB", bgB: "#DCEBFA", bgC: "#F5F9FD",
            accent: "#7AA7D9", accentDark: "#4B87C9", secondary: "#A6C4E8", gold: "#E6B04E",
            glow: "rgba(122, 167, 217, 0.40)", glowLavender: "rgba(140, 169, 217, 0.4)", glowAqua: "rgba(128, 183, 222, 0.36)", glowGold: "rgba(232, 199, 135, 0.55)"
        },
        hopeful: {
            bgA: "#F7F0FB", bgB: "#EEEAF6", bgC: "#FCFAFD",
            accent: "#B6A7D8", accentDark: "#9E8BC0", secondary: "#D3C7E8", gold: "#E8C787",
            glow: "rgba(182, 167, 216, 0.40)", glowLavender: "rgba(190, 173, 222, 0.40)", glowAqua: "rgba(215, 205, 241, 0.38)", glowGold: "rgba(236, 200, 129, 0.55)"
        },
        tired: {
            bgA: "#F3F3F3", bgB: "#ECECEC", bgC: "#FAFAFA",
            accent: "#A8AAA7", accentDark: "#8A8E8B", secondary: "#CFCFCF", gold: "#D0B06F",
            glow: "rgba(180, 180, 180, 0.35)", glowLavender: "rgba(200, 200, 200, 0.32)", glowAqua: "rgba(210, 210, 210, 0.3)", glowGold: "rgba(208, 176, 111, 0.4)"
        },
        anxious: {
            bgA: "#F2EDFA", bgB: "#E9E2F8", bgC: "#FBF9FE",
            accent: "#9B86C8", accentDark: "#7D67B2", secondary: "#CBBEE8", gold: "#E4B15B",
            glow: "rgba(155, 134, 200, 0.40)", glowLavender: "rgba(184, 152, 232, 0.34)", glowAqua: "rgba(235, 228, 252, 0.36)", glowGold: "rgba(228, 177, 91, 0.44)"
        }
    };

    function mcNormalizeMood(mood) {
        if (!mood) return "calm";
        const key = String(mood).toLowerCase();
        if (key === "relaxed") return "peaceful";
        if (key === "sad") return "tired";
        if (key === "stressed") return "anxious";
        return MC_MOODS.includes(key) ? key : "calm";
    }

    function mcApplyThemePalette(mood) {
        const normalized = mcNormalizeMood(mood);
        const palette = MC_MOOD_PALETTES[normalized];
        if (!palette) return;
        const root = document.documentElement;

        root.style.setProperty("--mc-theme-bg-a", palette.bgA);
        root.style.setProperty("--mc-theme-bg-b", palette.bgB);
        root.style.setProperty("--mc-theme-bg-c", palette.bgC);
        root.style.setProperty("--mc-accent-primary", palette.accent);
        root.style.setProperty("--mc-accent-primary-dark", palette.accentDark);
        root.style.setProperty("--mc-accent-secondary", palette.secondary);
        root.style.setProperty("--mc-accent-gold", palette.gold);
        root.style.setProperty("--mc-glow-mint", palette.glow);
        root.style.setProperty("--mc-glow-lavender", palette.glowLavender);
        root.style.setProperty("--mc-glow-aqua", palette.glowAqua);
        root.style.setProperty("--mc-glow-gold", palette.glowGold);
        root.style.setProperty("--mc-theme-accent", palette.accent);
        root.style.setProperty("--mc-theme-glow", palette.glow);

        if (document.body) {
            MC_MOODS.forEach((item) => document.body.classList.remove(`theme-${item}`));
            document.body.classList.add(`theme-${normalized}`);
        }
    }

    function mcRestoreThemeFromStorage() {
        let savedMood = null;
        try {
            const raw = localStorage.getItem("wellness:mood");
            savedMood = raw === null ? null : JSON.parse(raw);
        } catch {
            savedMood = null;
        }
        if (savedMood) mcApplyThemePalette(savedMood);
    }

    mcRestoreThemeFromStorage();
})();