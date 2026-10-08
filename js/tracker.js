(function () {
    const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
    const HISTORY_KEY = 'moodTrackerHistory';
    const THEME_KEY = 'wellness:mood';
    const REDIRECT_KEY = 'mc:moodRedirect';
    const MAX_HISTORY = 5;
    const STABLE_READS_NEEDED = 3;
    const SCAN_DURATION_MS = 3600;

    // If navigated with ?redirect=target, store it so saveMood() can redirect there
    (function () {
        try {
            const params = new URLSearchParams(window.location.search);
            const target = params.get('redirect');
            if (target) localStorage.setItem(REDIRECT_KEY, target);
        } catch (e) {}
    })();

    // Full confirmation set the person chooses from — icon + accent + which
    // detected AI expression(s) it maps to + which site-wide theme mood it maps to.
    const MOOD_META = {
        happy:      { icon: 'bi-sun',              label: 'Happy',      color: 'var(--mood-happy)',      glow: 'var(--mood-happy-glow)',      status: 'Positive mood', theme: 'happy' },
        calm:       { icon: 'bi-moon-stars',       label: 'Calm',       color: 'var(--mood-calm)',       glow: 'var(--mood-calm-glow)',       status: 'Settled & steady', theme: 'calm' },
        anxious:    { icon: 'bi-wind',             label: 'Anxious',    color: 'var(--mood-anxious)',    glow: 'var(--mood-anxious-glow)',    status: 'Grounding may help', theme: 'anxious' },
        sad:        { icon: 'bi-cloud-rain',       label: 'Sad',        color: 'var(--mood-sad)',        glow: 'var(--mood-sad-glow)',         status: 'Low mood', theme: 'tired' },
        tired:      { icon: 'bi-battery-half',     label: 'Tired',      color: 'var(--mood-tired)',      glow: 'var(--mood-tired-glow)',       status: 'Low energy', theme: 'tired' },
        angry:      { icon: 'bi-fire',             label: 'Angry',      color: 'var(--mood-angry)',      glow: 'var(--mood-angry-glow)',       status: 'Tense', theme: 'anxious' },
        stressed:   { icon: 'bi-activity',         label: 'Stressed',   color: 'var(--mood-stressed)',   glow: 'var(--mood-stressed-glow)',    status: 'Under pressure', theme: 'anxious' },
        motivated:  { icon: 'bi-lightning-charge', label: 'Motivated',  color: 'var(--mood-motivated)',  glow: 'var(--mood-motivated-glow)',   status: 'Ready to act', theme: 'focused' },
        focused:    { icon: 'bi-bullseye',         label: 'Focused',    color: 'var(--mood-focused)',    glow: 'var(--mood-focused-glow)',     status: 'Clear-headed', theme: 'focused' },
        peaceful:   { icon: 'bi-flower1',          label: 'Peaceful',   color: 'var(--mood-peaceful)',   glow: 'var(--mood-peaceful-glow)',    status: 'At ease', theme: 'peaceful' },
        hopeful:    { icon: 'bi-brightness-high',  label: 'Hopeful',    color: 'var(--mood-hopeful)',    glow: 'var(--mood-hopeful-glow)',     status: 'Looking forward', theme: 'hopeful' },
        overwhelmed:{ icon: 'bi-water',            label: 'Overwhelmed',color: 'var(--mood-overwhelmed)',glow: 'var(--mood-overwhelmed-glow)', status: 'A lot at once', theme: 'anxious' },
        frustrated: { icon: 'bi-emoji-frown',       label: 'Frustrated', color: 'var(--mood-frustrated)', glow: 'var(--mood-frustrated-glow)',  status: 'Stuck on something', theme: 'anxious' }
    };
    const MOOD_ORDER = ['happy','calm','anxious','sad','tired','angry','frustrated','stressed','motivated','focused','peaceful','hopeful','overwhelmed'];

    // Legacy label lookup, kept so mood history saved before this redesign still renders.
    const LEGACY_LABELS = { happy: 'happy', sad: 'sad', angry: 'angry', fear: 'anxious', fearful: 'anxious', disgust: 'overwhelmed', disgusted: 'overwhelmed', surprised: 'hopeful', surprise: 'hopeful', neutral: 'calm' };

    // Maps a raw face-api expression key to a suggested confirmation-grid mood.
    const EXPRESSION_TO_MOOD = { happy: 'happy', sad: 'sad', angry: 'angry', fearful: 'anxious', disgusted: 'overwhelmed', surprised: 'hopeful', neutral: 'calm' };

    const SCAN_MESSAGES = ['Analyzing facial cues...', 'Reading emotional indicators...', 'Checking expression stability...', 'Estimating confidence...'];

    // ---------- element refs ----------
    const video = document.getElementById('video');
    const stagePlaceholder = document.getElementById('stagePlaceholder');
    const placeholderTitle = document.getElementById('placeholderTitle');
    const placeholderSub = document.getElementById('placeholderSub');
    const statusPill = document.getElementById('statusPill');
    const faceGuide = document.getElementById('faceGuide');
    const helperText = document.getElementById('helperText');
    const scanIndicator = document.getElementById('scanIndicator');
    const errorBanner = document.getElementById('errorBanner');
    const errorText = document.getElementById('errorText');

    const stageCard = document.getElementById('stageCard');
    const scanOverlay = document.getElementById('scanOverlay');
    const scanMessage = document.getElementById('scanMessage');
    const scanProgressFill = document.getElementById('scanProgressFill');

    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const retakeBtn = document.getElementById('retakeBtn');

    const confirmCard = document.getElementById('confirmCard');
    const moodGrid = document.getElementById('moodGrid');
    const confirmSuggested = document.getElementById('confirmSuggested');
    const confirmSuggestedText = document.getElementById('confirmSuggestedText');

    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultMoodText = document.getElementById('resultMoodText');
    const resultStatusBadge = document.getElementById('resultStatusBadge');
    const resultStatusText = document.getElementById('resultStatusText');
    const resultConfidence = document.getElementById('resultConfidence');
    const confidenceBar = document.getElementById('confidenceBar');
    const resultTime = document.getElementById('resultTime');
    const saveBtn = document.getElementById('saveBtn');

    const historyEmpty = document.getElementById('historyEmpty');
    const historyList = document.getElementById('historyList');

    const stepEls = Array.from(document.querySelectorAll('.mc-step'));

    let modelsLoaded = false;
    let stream = null;
    let detectionTimer = null;
    let scanMessageTimer = null;
    let stableCount = 0;
    let lastSuggestedKey = null;
    let suggestedKey = null;
    let suggestedConfidence = null;
    let confirmedKey = null;

    // ---------- ripple effect ----------
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.mc-btn');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'mc-ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // ---------- step indicator ----------
    function setStep(n) {
        stepEls.forEach(el => {
            const s = Number(el.dataset.step);
            el.classList.toggle('active', s === n);
            el.classList.toggle('done', s < n);
        });
    }

    // ---------- helpers ----------
    function showError(message) {
        errorText.textContent = message;
        errorBanner.classList.add('show');
    }
    function clearError() {
        errorBanner.classList.remove('show');
        errorText.textContent = '';
    }

    function setPlaceholder(title, sub, showLoader) {
        stagePlaceholder.style.display = 'flex';
        placeholderTitle.innerHTML = (showLoader ? '<div class="mc-loader-ring"></div>' : '') + title;
        placeholderSub.textContent = sub || '';
        video.classList.add('hidden-video');
        faceGuide.style.display = 'none';
        statusPill.style.display = 'none';
        helperText.style.display = 'none';
        scanIndicator.classList.remove('active');
    }

    function showCameraUI() {
        stagePlaceholder.style.display = 'none';
        video.classList.remove('hidden-video');
        faceGuide.style.display = 'block';
        statusPill.style.display = 'flex';
        helperText.style.display = 'block';
    }

    function setStatusPill(text, state) {
        statusPill.style.display = 'flex';
        statusPill.textContent = text;
        statusPill.className = 'mc-status-pill' + (state ? ' state-' + state : '');
    }

    function setResultCardColor(colorVar, glowVar) {
        document.documentElement.style.setProperty('--card-color', colorVar);
        document.documentElement.style.setProperty('--card-glow', glowVar);
    }

    // ---------- model loading ----------
    async function loadModels() {
        setPlaceholder('Preparing your check-in...', 'Loading the on-device AI model — this needs an internet connection.', true);
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
            modelsLoaded = true;
            return true;
        } catch (e) {
            showError('Could not load the AI model. Please check your internet connection and try again.');
            setPlaceholder('Camera Off', 'Model loading failed. Tap "Begin Check-In" to retry.', false);
            return false;
        }
    }

    // ---------- camera control ----------
    async function startCamera() {
        clearError();
        startBtn.disabled = true;
        resultCard.classList.remove('show');
        confirmCard.classList.remove('show');
        stageCard.style.display = 'block';
        setStep(1);
        stableCount = 0;
        suggestedKey = null;

        if (!modelsLoaded) {
            const ok = await loadModels();
            if (!ok) { startBtn.disabled = false; return; }
        }

        setPlaceholder('Starting Camera...', '', true);

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (e) {
            startBtn.disabled = false;
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                showError('Camera permission denied. Please allow camera access in your browser settings and try again.');
            } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                showError('No camera found. Please connect a camera and try again.');
            } else {
                showError('Camera unavailable. It may be in use by another application.');
            }
            setPlaceholder('Camera Off', 'Tap "Begin Check-In" to try again.', false);
            return;
        }
    }

    function stopCamera() {
        if (detectionTimer) { clearInterval(detectionTimer); detectionTimer = null; }
        if (scanMessageTimer) { clearInterval(scanMessageTimer); scanMessageTimer = null; }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        scanIndicator.classList.remove('active');
        scanOverlay.classList.remove('active');
        faceGuide.className = 'mc-face-guide';
        setPlaceholder('Camera Off', 'Tap "Begin Check-In" to start a new scan.', false);
    }

    function resetToScan() {
        confirmCard.classList.remove('show');
        resultCard.classList.remove('show');
        stageCard.style.display = 'block';
        setStep(1);
        startCamera();
    }

    video.addEventListener('play', () => {
        showCameraUI();
        setStatusPill('Camera Ready', 'ok');
        stopBtn.disabled = false;
        startBtn.disabled = true;
        scanIndicator.classList.add('active');

        if (detectionTimer) clearInterval(detectionTimer);
        detectionTimer = setInterval(runDetection, 900);
    });

    // ---------- detection loop ----------
    async function runDetection() {
        if (!stream) return;
        let detections;
        try {
            detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
        } catch (e) {
            return;
        }

        if (detections.length === 0) {
            faceGuide.className = 'mc-face-guide';
            setStatusPill('No Face Detected', 'error');
            helperText.innerHTML = 'Please look at the camera.';
            stableCount = 0;
        } else if (detections.length === 1) {
            faceGuide.className = 'mc-face-guide detected';
            setStatusPill('Face Detected', 'ok');
            helperText.innerHTML = 'Hold still for a moment.<br>Only one face should be visible.';
            registerReading(detections[0].expressions);
        } else {
            faceGuide.className = 'mc-face-guide multi';
            setStatusPill('Multiple people detected', 'warn');
            helperText.innerHTML = 'Multiple people detected. Please make sure only one person is visible.';
            stableCount = 0;
        }
    }

    function registerReading(expressions) {
        const topKey = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        const confidence = Math.round(expressions[topKey] * 1000) / 10;
        const suggestion = EXPRESSION_TO_MOOD[topKey] || 'calm';

        if (suggestion === lastSuggestedKey) {
            stableCount++;
        } else {
            stableCount = 1;
            lastSuggestedKey = suggestion;
        }

        suggestedKey = suggestion;
        suggestedConfidence = confidence;

        if (stableCount >= STABLE_READS_NEEDED) {
            beginScanSequence();
        }
    }

    // ---------- AI-style scanning sequence (animation only) ----------
    function beginScanSequence() {
        if (detectionTimer) { clearInterval(detectionTimer); detectionTimer = null; }
        setStep(2);
        scanOverlay.classList.add('active');
        scanIndicator.classList.remove('active');

        let i = 0;
        scanMessage.textContent = SCAN_MESSAGES[0];
        scanProgressFill.style.width = '6%';
        scanMessageTimer = setInterval(() => {
            i = (i + 1) % SCAN_MESSAGES.length;
            scanMessage.textContent = SCAN_MESSAGES[i];
            scanProgressFill.style.width = Math.min(96, 15 + i * 28) + '%';
        }, SCAN_DURATION_MS / SCAN_MESSAGES.length);

        setTimeout(() => {
            if (scanMessageTimer) { clearInterval(scanMessageTimer); scanMessageTimer = null; }
            scanProgressFill.style.width = '100%';
            setTimeout(finishScan, 250);
        }, SCAN_DURATION_MS);
    }

    function finishScan() {
        scanOverlay.classList.remove('active');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
        stopBtn.disabled = true;
        stageCard.style.display = 'none';
        showConfirmation();
    }

    // ---------- confirmation step ----------
    function showConfirmation() {
        setStep(3);
        const meta = MOOD_META[suggestedKey] || MOOD_META.calm;
        confirmSuggestedText.textContent = 'AI suggests ' + meta.label + ' — confirm or choose what fits';

        moodGrid.innerHTML = MOOD_ORDER.map(key => {
            const m = MOOD_META[key];
            const isSuggested = key === suggestedKey;
            return `
                <button type="button" class="mc-mood-card${isSuggested ? ' is-suggested' : ''}" data-mood="${key}" style="--card-c:${m.color};">
                    <span class="mc-mood-card__icon"><i class="bi ${m.icon}"></i></span>
                    <span class="mc-mood-card__label">${m.label}</span>
                </button>
            `;
        }).join('');

        moodGrid.querySelectorAll('.mc-mood-card').forEach(card => {
            card.addEventListener('click', () => confirmMood(card.dataset.mood));
        });

        confirmCard.classList.add('show');
    }

    function confirmMood(key) {
        confirmedKey = key;
        moodGrid.querySelectorAll('.mc-mood-card').forEach(card => {
            card.classList.toggle('is-selected', card.dataset.mood === key);
        });
        setTimeout(() => renderResult(key), 200);
    }

    function renderResult(key) {
        const meta = MOOD_META[key] || MOOD_META.calm;
        const now = new Date();
        const confidence = (key === suggestedKey && suggestedConfidence != null) ? suggestedConfidence : null;

        setResultCardColor(meta.color, meta.glow);
        resultIcon.className = 'bi ' + meta.icon;
        resultMoodText.textContent = meta.label;
        resultStatusBadge.textContent = meta.status;
        resultStatusText.textContent = meta.status;
        resultConfidence.textContent = confidence != null ? confidence + '%' : '—';
        confidenceBar.style.width = (confidence != null ? confidence : 0) + '%';
        resultTime.textContent = now.toLocaleTimeString();

        saveBtn.disabled = false;
        saveBtn.classList.remove('saved');
        saveBtn.textContent = 'Save & Continue';

        confirmCard.classList.remove('show');
        resultCard.classList.add('show');

        currentResult = { key: key, label: meta.label, theme: meta.theme, confidence: confidence, date: now.toLocaleDateString(), time: now.toLocaleTimeString() };
    }

    let currentResult = null;

    // ---------- save & history ----------
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveMood() {
        if (!currentResult) return;
        const entry = {
            date: currentResult.date,
            time: currentResult.time,
            mood: currentResult.label,
            confidence: currentResult.confidence != null ? currentResult.confidence : ''
        };
        const history = getHistory();
        history.unshift(entry);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));

        // Update the site-wide color-therapy theme (read by index.html and other pages).
        try { localStorage.setItem(THEME_KEY, JSON.stringify(currentResult.theme)); } catch (e) {}

        // Save the raw mood key so the Activities page can recommend matching activities.
        try { localStorage.setItem('currentMood', currentResult.key); } catch (e) {}

        saveBtn.textContent = '? Saved';
        saveBtn.classList.add('saved');
        saveBtn.disabled = true;

        renderHistory();

        // If another page sent the user here first (e.g. before Activities or the
        // Relaxation Hub), continue on to it now that the mood is logged.
        let redirectTarget = null;
        try { redirectTarget = localStorage.getItem(REDIRECT_KEY); } catch (e) {}
        if (redirectTarget) {
            try { localStorage.removeItem(REDIRECT_KEY); } catch (e) {}
            setTimeout(() => { window.location.href = redirectTarget; }, 900);
        }
    }

    function deleteHistoryItem(index) {
        const history = getHistory();
        history.splice(index, 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
    }

    function metaForLabel(label) {
        const key = MOOD_ORDER.find(k => MOOD_META[k].label === label) || LEGACY_LABELS[(label || '').toLowerCase()];
        return MOOD_META[key] || MOOD_META.calm;
    }

    function renderHistory() {
        const fullHistory = getHistory();
        const history = fullHistory.slice(0, MAX_HISTORY);
        if (history.length === 0) {
            historyEmpty.style.display = 'block';
            historyList.innerHTML = '';
            return;
        }
        historyEmpty.style.display = 'none';
        historyList.innerHTML = history.map((item, i) => {
            const meta = metaForLabel(item.mood);
            return `
                <div class="mc-history-card" style="--item-color:${meta.color};">
                    <div class="mc-history-mood">
                        <span class="mc-history-emoji"><i class="bi ${meta.icon}"></i></span>
                        <span>${item.mood}</span>
                    </div>
                    <div class="mc-history-meta">
                        <div>${item.date} – ${item.time}</div>
                        <div class="mc-history-confidence">${item.confidence !== '' ? item.confidence + '%' : ''}</div>
                    </div>
                    <button class="mc-history-delete" data-index="${i}" aria-label="Delete entry" title="Delete entry">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        historyList.querySelectorAll('.mc-history-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteHistoryItem(Number(btn.dataset.index)));
        });
    }

    // ---------- events ----------
    startBtn.addEventListener('click', startCamera);
    stopBtn.addEventListener('click', stopCamera);
    retakeBtn.addEventListener('click', resetToScan);
    saveBtn.addEventListener('click', saveMood);

    // ---------- init ----------
    if (localStorage.getItem(REDIRECT_KEY)) {
        heroSubForRedirect();
    }
    function heroSubForRedirect() {
        const sub = document.getElementById('heroSub');
        if (sub) sub.textContent = "A quick check-in before you continue — this helps personalize what comes next.";
    }

    setPlaceholder('Camera Off', 'Tap "Begin Check-In" when you\'re ready.', false);
    renderHistory();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Your browser does not support camera access.');
        startBtn.disabled = true;
    }
})();