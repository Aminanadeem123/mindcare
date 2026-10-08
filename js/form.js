/* ===================================================================
   MindCare Hub — form.js
   Handles: Login, Sign Up, tab switching, validation,
   LocalStorage persistence, loading transition, and
   reusable auth helpers (guardPage, logout).
=================================================================== */

(function () {
  "use strict";

  /* -----------------------------------------------------------------
     0. GUARD: if already logged in, redirect to app
  ----------------------------------------------------------------- */
  const completed = localStorage.getItem("completed") === "yes";
  if (completed) {
    const target = localStorage.getItem("redirectAfterForm") || localStorage.getItem("requestedPage") || "index.html";
    window.location.replace(target);
    return;
  }

  /* -----------------------------------------------------------------
     1. CONSTANTS
  ----------------------------------------------------------------- */
  const ADMIN_EMAIL = "Admin@gmail.com";
  const ADMIN_PASSWORD = "Admin123";
  const PROFILES_KEY = "mindcareProfiles";

  const RULES = {
    name: /^[A-Za-z ]{3,40}$/,
    email: /^(?!.*\.\.)[A-Za-z0-9._%+\-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/,
  };

  /* -----------------------------------------------------------------
     2. DOM REFERENCES
  ----------------------------------------------------------------- */
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authError = document.getElementById("authError");
  const authErrorText = document.getElementById("authErrorText");
  const loadingOverlay = document.getElementById("loadingOverlay");

  /* -----------------------------------------------------------------
     3. TAB SWITCHING
  ----------------------------------------------------------------- */
  function switchTab(target) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === target));
    panels.forEach((p) => {
      const isTarget = p.id === target + "Panel";
      p.classList.toggle("active", isTarget);
    });
    hideError();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.getElementById("switchToSignup")?.addEventListener("click", () => switchTab("signup"));
  document.getElementById("switchToLogin")?.addEventListener("click", () => switchTab("login"));

  /* -----------------------------------------------------------------
     4. ERROR DISPLAY
  ----------------------------------------------------------------- */
  function showError(msg) {
    authErrorText.textContent = msg;
    authError.classList.add("show");
  }

  function hideError() {
    authError.classList.remove("show");
  }

  /* -----------------------------------------------------------------
     5. VALIDATION HELPERS
  ----------------------------------------------------------------- */
  function getFeedbackElement(field) {
    return field.nextElementSibling?.classList?.contains("invalid-feedback") ? field.nextElementSibling : null;
  }

  function setFieldState(field, isValid, message = "") {
    field.classList.toggle("is-invalid", !isValid);

    const feedback = getFeedbackElement(field);
    if (feedback) {
      const fallback = feedback.dataset.defaultMessage || feedback.textContent.trim();
      feedback.textContent = isValid ? fallback : (message || fallback);
    }

    if (!isValid) {
      const wrapper = field.closest(".field-group");
      if (wrapper) {
        wrapper.classList.remove("is-shaking");
        void wrapper.offsetWidth;
        wrapper.classList.add("is-shaking");
      }
    }

    return isValid;
  }

  function validateName(field) {
    return setFieldState(field, RULES.name.test(field.value.trim()), "Name must be 3-40 characters, letters only.");
  }

  function validateEmail(field) {
    return setFieldState(field, RULES.email.test(field.value.trim()), "Enter a valid email address.");
  }

  function validatePassword(field) {
    return setFieldState(field, RULES.password.test(field.value));
  }

  function validateConfirmPassword(passwordField, confirmField) {
    const isValid = confirmField.value.length > 0 && confirmField.value === passwordField.value;
    return setFieldState(confirmField, isValid);
  }

  function validateRequired(field) {
    return setFieldState(field, field.value.trim().length > 0);
  }

  /* -----------------------------------------------------------------
     6. PASSWORD TOGGLE
  ----------------------------------------------------------------- */
  document.querySelectorAll(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".field-group").querySelector("input");
      if (!input) return;
      const willShow = input.type === "password";
      input.type = willShow ? "text" : "password";
      btn.innerHTML = willShow ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
      btn.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
      input.focus();
    });
  });

  /* -----------------------------------------------------------------
     7. FLOATING LABELS + FIELD ENHANCEMENTS
  ----------------------------------------------------------------- */
  function enhanceFieldGroup(group) {
    if (!group) return;
    const input = group.querySelector("input");
    if (!input) return;

    const syncValue = () => group.classList.toggle("has-value", input.value.trim().length > 0);
    input.addEventListener("focus", () => group.classList.add("is-focused"));
    input.addEventListener("blur", () => { group.classList.remove("is-focused"); syncValue(); });
    input.addEventListener("input", syncValue);
    syncValue();
  }

  document.querySelectorAll(".field-group").forEach(enhanceFieldGroup);

  /* -----------------------------------------------------------------
     9. LIVE VALIDATION ON INPUT
  ----------------------------------------------------------------- */
  // Login fields
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  loginEmail?.addEventListener("input", () => {
    validateEmail(loginEmail);
    updateLoginButton();
  });

  loginPassword?.addEventListener("input", () => {
    validateRequired(loginPassword);
    updateLoginButton();
  });

  function updateLoginButton() {
    const btn = document.getElementById("loginBtn");
    if (!btn) return;
    const emailValid = RULES.email.test(loginEmail.value.trim());
    const passValid = loginPassword.value.length > 0;
    btn.disabled = !emailValid || !passValid;
  }

  // Signup fields
  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const signupConfirm = document.getElementById("signupConfirm");

  signupName?.addEventListener("input", () => { validateName(signupName); updateSignupButton(); });
  signupEmail?.addEventListener("input", () => { validateEmail(signupEmail); updateSignupButton(); });
  signupPassword?.addEventListener("input", () => { validatePassword(signupPassword); if (signupConfirm.value) validateConfirmPassword(signupPassword, signupConfirm); updateSignupButton(); });
  signupConfirm?.addEventListener("input", () => { validateConfirmPassword(signupPassword, signupConfirm); updateSignupButton(); });

  function updateSignupButton() {
    const btn = document.getElementById("signupBtn");
    if (!btn) return;
    const nameValid = RULES.name.test(signupName.value.trim());
    const emailValid = RULES.email.test(signupEmail.value.trim());
    const passValid = RULES.password.test(signupPassword.value);
    const confirmValid = signupConfirm.value === signupPassword.value && signupConfirm.value.length > 0;
    btn.disabled = !(nameValid && emailValid && passValid && confirmValid);
  }

  /* -----------------------------------------------------------------
     10. LOGIN SUBMIT
  ----------------------------------------------------------------- */
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    // Admin hardcoded login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      saveSession({ name: "Administrator", email: email, role: "admin" });
      showLoadingAndRedirect("admin.html");
      return;
    }

    // Regular user login
    let profiles = {};
    try {
      profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    } catch { profiles = {}; }

    const user = profiles[email];

    if (user && atob(user.password) === password) {
      saveSession({ name: user.name, email: user.email, role: user.role || "user" });
      const target = localStorage.getItem("redirectAfterForm") || localStorage.getItem("requestedPage") || "index.html";
      showLoadingAndRedirect(target);
    } else {
      showError("Invalid email or password. Please try again.");
      loginPassword.value = "";
      const group = loginPassword.closest(".field-group");
      if (group) group.classList.remove("has-value");
    }
  });

  /* -----------------------------------------------------------------
     11. SIGNUP SUBMIT
  ----------------------------------------------------------------- */
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;

    // Check duplicate email
    let profiles = {};
    try {
      profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    } catch { profiles = {}; }

    if (profiles[email]) {
      showError("An account with this email already exists. Please login instead.");
      return;
    }

    // Save profile
    profiles[email] = {
      name: name,
      email: email,
      password: btoa(password),
      role: "user",
    };

    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      showError("Storage full. Please free up some browser space and try again.");
      return;
    }

    // Auto login
    saveSession({ name: name, email: email, role: "user" });
    const target = localStorage.getItem("redirectAfterForm") || localStorage.getItem("requestedPage") || "index.html";
    showLoadingAndRedirect(target);
  });

  /* -----------------------------------------------------------------
     12. SESSION HELPERS
  ----------------------------------------------------------------- */
  function saveSession(user) {
    const registrationDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("completed", "yes");
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("registrationDate", registrationDate);
    } catch {
      showError("Storage error. Please try again.");
    }
  }

  /* -----------------------------------------------------------------
     13. LOADING & REDIRECT
  ----------------------------------------------------------------- */
  const LOADING_MESSAGES = [
    "Signing you in...",
    "Preparing your experience...",
    "Almost ready...",
  ];

  function showLoadingAndRedirect(targetPage) {
    loadingOverlay.classList.remove("d-none");

    try {
      sessionStorage.setItem("mindcare:returnFromForm", "true");
    } catch { /* non-critical */ }

    const loaderText = document.getElementById("loaderText");
    const loaderProgress = document.getElementById("loaderProgress");
    const totalDuration = 1500;
    const stepDuration = totalDuration / LOADING_MESSAGES.length;

    if (loaderProgress) {
      requestAnimationFrame(() => { loaderProgress.style.width = "100%"; });
    }

    let messageIndex = 0;
    if (loaderText) loaderText.textContent = LOADING_MESSAGES[messageIndex];
    const messageTimer = setInterval(() => {
      messageIndex++;
      if (messageIndex < LOADING_MESSAGES.length && loaderText) {
        loaderText.textContent = LOADING_MESSAGES[messageIndex];
      }
    }, stepDuration);

    setTimeout(() => {
      clearInterval(messageTimer);
      window.location.href = targetPage;
    }, totalDuration);
  }

  /* -----------------------------------------------------------------
     14. BUTTON RIPPLE EFFECT
  ----------------------------------------------------------------- */
  document.querySelectorAll(".premium-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* -----------------------------------------------------------------
     15. MOOD THEME SYNC
  ----------------------------------------------------------------- */
  (function syncMoodTheme() {
    const MOODS = ["happy", "calm", "peaceful", "focused", "hopeful", "tired", "anxious"];
    let mood = "calm";
    try {
      const raw = localStorage.getItem("wellness:mood");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && MOODS.includes(parsed)) mood = parsed;
    } catch { /* default */ }
    document.body.classList.add(`theme-${mood}`);
  })();

  /* -----------------------------------------------------------------
     16. REUSABLE AUTH HELPERS (exposed on window)
  ----------------------------------------------------------------- */
  const PAGE_ACCESS = {
    patient: ["user", "admin"],
    doctor: ["user", "admin"],
    parent: ["user", "admin"],
    student: ["user", "admin"],
    admin: ["admin"],
  };

  function guardPage(requiredRole) {
    if (localStorage.getItem("isRegistered") !== "true") {
      window.location.href = "form.html";
      return false;
    }
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      window.location.href = "form.html";
      return false;
    }
    const allowedRoles = PAGE_ACCESS[requiredRole] || [];
    if (!allowedRoles.includes(currentUser.role)) {
      sessionStorage.setItem("mindcareAccessDenied", "true");
      window.location.href = "index.html";
      return false;
    }
    return true;
  }

  function logout() {
    try {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("completed");
      localStorage.removeItem("isRegistered");
      localStorage.removeItem("role");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("registrationDate");
      localStorage.removeItem("redirectAfterForm");
      localStorage.removeItem("requestedPage");
      sessionStorage.clear();
    } catch { /* non-critical */ }
    window.location.href = "form.html";
  }

  window.MindCareAuth = { guardPage, logout };

  /* -----------------------------------------------------------------
     17. ACCESS DENIED TOAST
  ----------------------------------------------------------------- */
  if (sessionStorage.getItem("mindcareAccessDenied") === "true") {
    sessionStorage.removeItem("mindcareAccessDenied");
    const toastEl = document.getElementById("accessToast");
    if (toastEl && window.bootstrap) {
      new bootstrap.Toast(toastEl).show();
    }
  }
})();
