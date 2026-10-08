/**
 * - MindCare Hub - Relaxation Hub Core
 * - Professional Refactored Script (ES6)
 * - Author: Senior Frontend Architect
 * - Purpose: Final Year Project - Production Ready */

"use strict";

/* ==========================================================================
SECTION 1: CONSTANTS & DATA REGISTRY
========================================================================== */

const APP_STORAGE_KEYS = {
    SELECTED_MOOD: 'mindcare_selected_mood',
    TOTAL_MINUTES: 'mindcare_meditation_minutes',
    JOURNAL_ENTRY: 'mindcare_journal_entry',
    GARDEN_STAGE: 'mindcare_garden_stage',
    GARDEN_WATER: 'mindcare_garden_water'
};

const MOOD_MAP = {
    "Happy": {
        insight: "Your energy is contagious! Use this positivity to fuel your creative projects.",
        activity: "Expressive Journaling / Sharing Joy",
        color: "#facc15"
    },
    "Calm": {
        insight: "Stillness is a superpower. You are in a perfect state for deep reflection.",
        activity: "Advanced Mindfulness / Visualization",
        color: "#2dd4bf"
    },
    "Neutral": {
        insight: "A balanced mind is a stable foundation. Use this focus to organize your thoughts.",
        activity: "5-Minute Box Breathing",
        color: "#94a3b8"
    },
    "Sad": {
        insight: "It's okay to not be okay. Honor your feelings without judgment.",
        activity: "Self-Compassion Meditation",
        color: "#60a5fa"
    },
    "Anxious": {
        insight: "Your thoughts are like clouds; they pass. Focus on the ground beneath your feet.",
        activity: "5-4-3-2-1 Grounding Technique",
        color: "#fb923c"
    },
    "Angry": {
        insight: "Anger is just heavy energy. Let's transform it through movement or release.",
        activity: "Progressive Muscle Relaxation",
        color: "#f87171"
    }
};

const DATA_REGISTRY = {
    WELLNESS_TIPS: [
        "Drink a glass of water right now.",
        "Take 5 deep belly breaths.",
        "Stretch your arms above your head.",
        "Correct your posture; sit up straight.",
        "Look away from the screen for 20 seconds.",
        "Step outside for a 2-minute walk.",
        "Listen to your favorite song.",
        "Gently roll your shoulders back.",
        "Tidy up your immediate workspace.",
        "Sip some herbal tea.",
        "Try 1 minute of silent meditation.",
        "Call or text a loved one.",
        "Practice gratitude: name one good thing today.",
        "Do 10 jumping jacks to boost energy.",
        "Close your eyes and visualize a calm beach.",
        "Eat a piece of fresh fruit.",
        "Unsubscribe from one junk email.",
        "Clear your phone notifications.",
        "Dim the lights for 10 minutes.",
        "Write down your top priority for tomorrow.",
        "Read 2 pages of a book.",
        "Hug a pillow or a pet.",
        "Apply some moisturizing lotion.",
        "Focus on the sensation of your feet on the floor.",
        "Sing or hum a simple tune.",
        "Organize one drawer in your home.",
        "Try a digital detox for the next hour.",
        "Forgive yourself for a small mistake.",
        "Smile at yourself in the mirror.",
        "Journal for 3 minutes about your feelings."
    ],
    QUOTES: [
        "Peace comes from within. Do not seek it without. — Buddha",
        "Yesterday is history, tomorrow is a mystery, today is a gift. — Eleanor Roosevelt",
        "The soul always knows what to do to heal itself. — Caroline Myss",
        "Within you, there is a stillness and a sanctuary. — Hermann Hesse",
        "The present moment is the only time over which we have dominion. — Thich Nhat Hanh",
        "Self-care is how you take your power back. — Lalah Delia",
        "Almost everything will work again if you unplug it for a few minutes. — Anne Lamott",
        "Do what you can, with what you have, where you are. — Theodore Roosevelt",
        "Nature does not hurry, yet everything is accomplished. — Lao Tzu",
        "Slow down and everything you are chasing will come around and catch you. — John De Paola",
        "Breathe. Let go. And remind yourself that this very moment is the only one you know you have. — Oprah Winfrey",
        "Your calm mind is the ultimate weapon against your challenges. — Bryant McGill",
        "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
        "Turn your wounds into wisdom. — Oprah Winfrey",
        "Difficult roads often lead to beautiful destinations. — Zig Ziglar",
        "Mindfulness is a way of befriending ourselves and our experience. — Jon Kabat-Zinn",
        "Happiness is not something readymade. It comes from your own actions. — Dalai Lama",
        "Don't let yesterday take up too much of today. — Will Rogers",
        "To handle yourself, use your head; to handle others, use your heart. — Eleanor Roosevelt",
        "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
        "It does not matter how slowly you go as long as you do not stop. — Confucius",
        "Everything you’ve ever wanted is on the other side of fear. — George Addair",
        "Life is 10% what happens to us and 90% how we react to it. — Dennis P. Kimbro",
        "Success is not final, failure is not fatal. — Winston Churchill",
        "The only way to do great work is to love what you do. — Steve Jobs",
        "Believe you can and you're halfway there. — Theodore Roosevelt",
        "Keep your face always toward the sunshine - and shadows will fall behind you. — Walt Whitman",
        "What you get by achieving your goals is not as important as what you become. — Zig Ziglar",
        "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
        "Act as if what you do makes a difference. It does. — William James"
    ],
    AFFIRMATIONS: [
        "I am worthy of peace and relaxation.",
        "I am in control of my reactions.",
        "I choose to be kind to myself.",
        "My breath is my anchor.",
        "I am capable of handling whatever comes my way.",
        "I am allowed to take up space.",
        "I trust the process of my life.",
        "I am becoming the best version of myself.",
        "I attract positive energy.",
        "I am enough, just as I am.",
        "I let go of things I cannot control.",
        "I am strong, resilient, and brave.",
        "I deserve a life filled with joy.",
        "I honor my body's need for rest.",
        "I am at peace with my past.",
        "I have the power to create change.",
        "My mind is calm and my heart is light.",
        "I am surrounded by love.",
        "I choose to focus on what I can control.",
        "I am grateful for this moment.",
        "I forgive myself and set myself free.",
        "I am growing every single day.",
        "I have inner strength that I haven't even used yet.",
        "My voice deserves to be heard.",
        "I am safe and secure.",
        "I embrace the unknown with a peaceful heart.",
        "I am open to new possibilities.",
        "I am a magnet for miracles.",
        "I am a beacon of light for others.",
        "I am proud of my progress."
    ],
    COMPLIMENTS: [
        "You have a very soothing presence.",
        "Your resilience is truly inspiring.",
        "You are a great listener.",
        "You have such a kind heart.",
        "The world is better with you in it.",
        "You are more capable than you realize.",
        "Your perspective is unique and valuable.",
        "You make a difference in small, beautiful ways.",
        "You are very brave for showing up today.",
        "Your smile brightens the room.",
        "You are a source of light for those around you.",
        "You have an amazing ability to adapt.",
        "You are thoughtful and considerate.",
        "Your dedication to your wellness is admirable.",
        "You have great taste in things.",
        "You have a wonderful sense of humor.",
        "You are very creative.",
        "You bring out the best in people.",
        "You are wise beyond your years.",
        "Your energy is refreshing.",
        "You are a dependable friend.",
        "You are incredibly resourceful.",
        "You have a beautiful way with words.",
        "You are very insightful.",
        "You are a great problem solver.",
        "You are a gift to those who know you.",
        "Your potential is limitless.",
        "You are doing a great job at life.",
        "You are very talented.",
        "You are loved exactly as you are."
    ],
    STORIES: [
        { title: "The Whispering Forest", text: "Imagine a dense, vibrant forest. The air is cool and smells of damp earth and pine. Every step you take on the soft moss connects you to the earth. Listen to the gentle rustle of leaves as a soft breeze passes through the canopy." },
        { title: "The Ocean's Rhythm", text: "Watch the waves pull back and push forward. The rhythm of the tide is the rhythm of your breath. The horizon is infinite, and your worries are just small shells being washed away by the salt water." },
        { title: "Mountain Peak Stillness", text: "You stand at the summit. The world below is quiet and distant. The air is thin, crisp, and pure. Here, above the clouds, there is only the vast blue sky and your own steady heartbeat." },
        { title: "The Secret Garden", text: "Push open the heavy wooden door. Inside, flowers bloom in colors you've never seen. Sunlight filters through vines, creating patterns of gold on the grass. This is your private sanctuary." },
        { title: "Desert Twilight", text: "The heat of the day fades into a cool, purple dusk. The dunes are smooth and silent. Stars begin to appear one by one, reminding you that even in the vastness, you have a place." },
        { title: "The Rain's Lullaby", text: "Listen to the pitter-patter against the window. Each drop is a cleansing moment. The world outside is being washed clean, and inside, you are safe, warm, and completely at rest." },
        { title: "Starlight Voyage", text: "You are floating gently among the stars. There is no gravity, only a sense of weightlessness. The galaxies swirl in slow motion, and you are part of the cosmic dance." },
        { title: "The Autumn Path", text: "Leaves of red, orange, and gold crunch beneath your feet. The air is brisk. Change is happening all around you, and it is beautiful. You are learning to let go, just like the trees." },
        { title: "A Winter Morning", text: "The world is covered in a blanket of fresh snow. It muffles every sound. The silence is profound. In this white landscape, you find a blank page for your thoughts." },
        { title: "The Bamboo Grove", text: "Tall bamboo stalks sway and clack together in the wind. They are flexible but strong. They bend without breaking. Breathe in the green light of the grove." },
        { title: "Crystal Cave Echoes", text: "Deep underground, crystals glow with a soft, internal light. Water drips slowly into a clear pool. The sound echoes, creating a melody of peace in the heart of the earth." },
        { title: "Meadow of Wildflowers", text: "You lie down in tall grass. Bees hum lazily nearby. The scent of clover and lavender fills your senses. The sun warms your skin as you watch clouds drift by." },
        { title: "The Eternal River", text: "Sit by the bank and watch the water flow. It never stops, yet it is always here. It flows around obstacles without effort. Be like the water—effortless and persistent." },
        { title: "The Library of Dreams", text: "A vast room filled with books of every life lived. The smell of old paper is comforting. You pick up the book of your life and realize the next chapter is still unwritten." },
        { title: "Golden Hour Glow", text: "The sun is touching the horizon. Everything is bathed in a warm, honey-like glow. For this one moment, the world is perfect. Everything is exactly as it should be." }
    ],
    GARDEN_STAGES: [
        { level: "Empty", icon: "bi-patch-question", msg: "Your garden is empty. Plant a seed to begin.", class: "opacity-50" },
        { level: "Seed", icon: "bi-dot", msg: "A tiny seed is buried. It needs water to wake up.", class: "text-warning" },
        { level: "Sprout", icon: "bi-seedling", msg: "A sprout has emerged! Keep it hydrated.", class: "text-success" },
        { level: "Plant", icon: "bi-tree-fill", msg: "It's growing strong! Almost there.", class: "text-success" },
        { level: "Flower", icon: "bi-flower1", msg: "A beautiful flower has bloomed!", class: "text-danger" },
        { level: "Tree", icon: "bi-tree", msg: "Your mindfulness has grown into a mighty tree.", class: "text-primary" }
    ],
    STRETCH_POSES: [
        "Neck Rolls (Slowly clockwise)",
        "Shoulder Shrugs (Up to ears, and drop)",
        "Seated Side Stretch (Reach over head)",
        "Cat-Cow (Arch and round your back)",
        "Forward Fold (Reach for your toes)"
    ],
    MUSCLE_STEPS: [
        { time: 300, msg: "Focus: Feet & Toes (Tense for 5s, release)" },
        { time: 240, msg: "Focus: Calves & Thighs (Tense for 5s, release)" },
        { time: 180, msg: "Focus: Abdomen & Back (Tense for 5s, release)" },
        { time: 120, msg: "Focus: Shoulders & Neck (Tense for 5s, release)" },
        { time: 60, msg: "Focus: Face & Jaw (Squeeze for 5s, release)" }
    ],
    GROUNDING_STEPS: [
        "Look around: Name 5 things you can SEE",
        "Reach out: Name 4 things you can TOUCH",
        "Listen closely: Name 3 things you HEAR",
        "Breathe in: Name 2 things you can SMELL",
        "Focus: Name 1 thing you can TASTE"
    ]
};

/* ==========================================================================
SECTION 2: STATE & TIMER MANAGEMENT
========================================================================== */

const timerState = {
    meditation: { interval: null, remaining: 600, total: 600, active: false },
    muscle: { interval: null, remaining: 300, total: 300, active: false },
    stretch: { interval: null, poseIndex: 0, poseTime: 30, active: false },
    grounding: { timeout: null, active: false }
};

/* ==========================================================================
SECTION 3: UTILITY & HELPER FUNCTIONS
========================================================================== */

const helpers = {
    formatTime: (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    getRandom: (array) => array[Math.floor(Math.random() * array.length)],

    updateProgress: (mins) => {
        const current = parseFloat(localStorage.getItem(APP_STORAGE_KEYS.TOTAL_MINUTES) || 0);
        localStorage.setItem(APP_STORAGE_KEYS.TOTAL_MINUTES, (current + mins).toFixed(1));
        window.dispatchEvent(new Event('storage')); // Sync local UI
    },

    showToast: (message) => {
        const toastEl = document.getElementById('wellnessToast');
        if (!toastEl) return;
        const body = toastEl.querySelector('.toast-body');
        if (body) body.innerHTML = `<i class="bi bi-check2-circle me-2"></i>${message}`;
        const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
        bsToast.show();
    }
};

/* ==========================================================================
SECTION 4: CORE MODULES
========================================================================== */

/**
 * - 4.1 Greeting & DateTime */
const initGreeting = () => {
    const greetElem = document.getElementById('time-based-greeting');
    const welcomeElem = document.getElementById('welcome-message-placeholder');
    const dateElem = document.getElementById('current-date-placeholder');

    const now = new Date();
    const hr = now.getHours();

    // Date Update
    if (dateElem) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateElem.innerHTML = `<i class="bi bi-calendar3 me-2"></i>${now.toLocaleDateString('en-GB', options)}`;
    }

    // Greet Logic
    let g = "Good Night, Friend", w = "Rest is productive. Prepare for a restorative sleep.";
    if (hr >= 5 && hr < 12) {
        g = "Good Morning, Friend";
        w = "Let's start this day with a clear mind and a deep breath.";
    } else if (hr >= 12 && hr < 17) {
        g = "Good Afternoon, Friend";
        w = "Take a moment to pause. Let's find some midday stillness.";
    } else if (hr >= 17 && hr < 21) {
        g = "Good Evening, Friend";
        w = "Release the stress of the day and transition into peace.";
    }

    if (greetElem) greetElem.innerText = g;
    if (welcomeElem) welcomeElem.innerText = w;
};

/**
 * - 4.2 Mood Therapy & Emotional Check-in */
const initMoodTherapy = () => {
    const cards = document.querySelectorAll('#mood-therapy .premium-card');
    const emotionDisp = document.getElementById('emotion-display');
    const insightDisp = document.getElementById('insight-display');
    const activityDisp = document.getElementById('activity-display');

    const updateUI = (mood) => {
        const data = MOOD_MAP[mood];
        if (!data) return;

        if (emotionDisp) emotionDisp.innerText = mood;
        if (insightDisp) insightDisp.innerText = `"${data.insight}"`;
        if (activityDisp) {
            activityDisp.innerHTML = `
                <p class="mb-1 fw-bold">${data.activity}</p>
                <a href="activity.html" class="text-primary text-decoration-none small fw-semibold">Start Activity <i class="bi bi-arrow-right"></i></a>
            `;
        }

        cards.forEach(c => {
            const title = c.querySelector('.card-title');
            if (title && title.innerText === mood) {
                c.classList.add('active', 'border-primary');
            } else {
                c.classList.remove('active', 'border-primary');
            }
        });
    };

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const mood = card.querySelector('.card-title')?.innerText;
            if (mood) {
                localStorage.setItem(APP_STORAGE_KEYS.SELECTED_MOOD, mood);
                updateUI(mood);
            }
        });
    });

    // Load Initial
    const saved = localStorage.getItem(APP_STORAGE_KEYS.SELECTED_MOOD);
    if (saved) updateUI(saved);
};

/**
 * - 4.3 Content Generators */
const initGenerators = () => {
    const actions = [
        {
            btn: 'refresh-wellness-tip',
            cont: 'wellness-tip-container',
            data: DATA_REGISTRY.WELLNESS_TIPS,
            wrap: t => `<span>${t}</span>`
        },
        {
            btn: 'generate-affirmation',
            cont: 'affirmation-container',
            data: DATA_REGISTRY.AFFIRMATIONS,
            wrap: t => `<span>${t}</span>`
        },
        {
            btn: 'get-compliment',
            cont: 'compliment-container',
            data: DATA_REGISTRY.COMPLIMENTS,
            wrap: t => `<span>${t}</span>`
        },
        {
            btn: 'share-quote',
            cont: 'daily-quote-container',
            data: DATA_REGISTRY.QUOTES,
            wrap: t => {
                const [q, a] = t.split(' — ');
                return `<span>"${q}"</span><p class="text-end mb-0 mt-2 small fw-bold">— ${a}</p>`;
            }
        }
    ];

    actions.forEach(item => {
        const btn = document.getElementById(item.btn);
        const cont = document.getElementById(item.cont);
        if (btn && cont) {
            btn.addEventListener('click', () => {
                cont.innerHTML = item.wrap(helpers.getRandom(item.data));
            });
            btn.click(); // Initial trigger
        }
    });
};

/**
 * - 4.4 Relaxation Exercises */
const initRelaxationExercises = () => {
    // 4.4.1 Meditation Timer
    const medBtn = document.getElementById('btn-start-meditation');
    const medDisp = document.getElementById('meditation-timer');
    const medProg = document.getElementById('meditation-progress');
    const medInfo = document.getElementById('meditation-session-info');

    if (medBtn && medDisp && medProg) {
        medBtn.addEventListener('click', () => {
            if (timerState.meditation.active) {
                clearInterval(timerState.meditation.interval);
                timerState.meditation.active = false;
                medBtn.innerText = "Resume Session";
                medBtn.classList.replace('btn-danger', 'btn-primary');
            } else {
                timerState.meditation.active = true;
                medBtn.innerText = "Pause Session";
                medBtn.classList.replace('btn-primary', 'btn-danger');

                timerState.meditation.interval = setInterval(() => {
                    timerState.meditation.remaining--;
                    medDisp.innerText = helpers.formatTime(timerState.meditation.remaining);
                    medProg.style.width = `${((timerState.meditation.total - timerState.meditation.remaining) / timerState.meditation.total) * 100}%`;

                    if (timerState.meditation.remaining <= 0) {
                        clearInterval(timerState.meditation.interval);
                        helpers.updateProgress(10);
                        if (medInfo) medInfo.innerText = "Session Complete!";
                        medBtn.innerText = "Restart Session";
                        timerState.meditation.remaining = 600;
                        timerState.meditation.active = false;
                    }
                }, 1000);
            }
        });
    }

    // 4.4.2 Muscle Relaxation
    const musBtn = document.getElementById('btn-start-muscle');
    const musDisp = document.getElementById('muscle-timer');
    const musProg = document.getElementById('muscle-progress');
    const musInfo = document.getElementById('muscle-step-info');

    if (musBtn && musDisp && musProg) {
        musBtn.addEventListener('click', () => {
            if (timerState.muscle.active) return;
            timerState.muscle.active = true;
            musBtn.disabled = true;
            musBtn.innerText = "Exercise in Progress...";

            timerState.muscle.interval = setInterval(() => {
                timerState.muscle.remaining--;
                musDisp.innerText = helpers.formatTime(timerState.muscle.remaining);
                musProg.style.width = `${((timerState.muscle.total - timerState.muscle.remaining) / timerState.muscle.total) * 100}%`;

                const step = DATA_REGISTRY.MUSCLE_STEPS.find(s => timerState.muscle.remaining <= s.time);
                if (step && musInfo) musInfo.innerText = step.msg;

                if (timerState.muscle.remaining <= 0) {
                    clearInterval(timerState.muscle.interval);
                    helpers.updateProgress(5);
                    musBtn.disabled = false;
                    musBtn.innerText = "Restart Guide";
                    timerState.muscle.remaining = 300;
                    timerState.muscle.active = false;
                }
            }, 1000);
        });
    }

    // 4.4.3 Grounding Exercise
    const groBtn = document.getElementById('btn-start-grounding');
    const groInfo = document.getElementById('grounding-prompt-info');
    const groProg = document.getElementById('grounding-progress');

    if (groBtn && groInfo && groProg) {
        groBtn.addEventListener('click', () => {
            if (timerState.grounding.active) return;
            timerState.grounding.active = true;
            groBtn.disabled = true;
            let step = 0;

            const runStep = () => {
                if (step < DATA_REGISTRY.GROUNDING_STEPS.length) {
                    groInfo.innerText = DATA_REGISTRY.GROUNDING_STEPS[step];
                    groProg.style.width = `${((step + 1) / DATA_REGISTRY.GROUNDING_STEPS.length) * 100}%`;
                    step++;
                    timerState.grounding.timeout = setTimeout(runStep, 8000);
                } else {
                    groInfo.innerText = "You are grounded and present.";
                    groBtn.disabled = false;
                    groBtn.innerText = "Start Grounding";
                    timerState.grounding.active = false;
                    helpers.updateProgress(2);
                }
            };
            runStep();
        });
    }

    // 4.4.4 Stretch Guide
    const strBtn = document.getElementById('btn-start-stretch');
    const strInfo = document.getElementById('stretch-pose-info');
    const strProg = document.getElementById('stretch-progress');
    const strDisp = document.getElementById('stretch-timer');

    if (strBtn && strInfo && strProg && strDisp) {
        strBtn.addEventListener('click', () => {
            if (timerState.stretch.active) return;
            timerState.stretch.active = true;
            strBtn.disabled = true;
            let pIdx = 0, pTime = 30;

            timerState.stretch.interval = setInterval(() => {
                pTime--;
                strDisp.innerText = `00:${pTime.toString().padStart(2, '0')}`;
                strInfo.innerText = `Pose: ${DATA_REGISTRY.STRETCH_POSES[pIdx]}`;
                strProg.style.width = `${((pIdx) / DATA_REGISTRY.STRETCH_POSES.length) * 100}%`;

                if (pTime <= 0) {
                    pIdx++;
                    if (pIdx < DATA_REGISTRY.STRETCH_POSES.length) {
                        pTime = 30;
                    } else {
                        clearInterval(timerState.stretch.interval);
                        strInfo.innerText = "Stretching complete.";
                        strProg.style.width = "100%";
                        strBtn.disabled = false;
                        strBtn.innerText = "Restart Stretches";
                        timerState.stretch.active = false;
                        helpers.updateProgress(2.5);
                    }
                }
            }, 1000);
        });
    }
};

/**
 * - 4.5 Mindfulness Tools (Journal, Stories, Gallery, Garden) */
const initMindfulnessTools = () => {
    // 4.5.1 Journal
    const jInput = document.getElementById('gratitude-input');
    const jBtn = document.getElementById('save-gratitude-btn');
    if (jInput) {
        jInput.value = localStorage.getItem(APP_STORAGE_KEYS.JOURNAL_ENTRY) || "";
        let debounce;
        jInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => localStorage.setItem(APP_STORAGE_KEYS.JOURNAL_ENTRY, jInput.value), 2000);
        });
        if (jBtn) {
            jBtn.addEventListener('click', () => {
                localStorage.setItem(APP_STORAGE_KEYS.JOURNAL_ENTRY, jInput.value);
                helpers.showToast("Reflection saved to journal.");
            });
        }
    }

    // 4.5.2 Stories
    const sBtn = document.getElementById('btn-next-story');
    const sCont = document.getElementById('story-placeholder');
    if (sBtn && sCont) {
        let idx = 0;
        sBtn.addEventListener('click', () => {
            idx = (idx + 1) % DATA_REGISTRY.STORIES.length;
            const s = DATA_REGISTRY.STORIES[idx];
            sCont.innerHTML = `<h6 class="fw-bold text-primary mb-2 animate-fade-in">${s.title}</h6><p class="text-secondary small lh-lg mb-0 animate-fade-in">${s.text}</p>`;
        });
    }

    // 4.5.3 Gallery
    const gBtn = document.getElementById('view-full-gallery');
    if (gBtn) {
        gBtn.addEventListener('click', () => {
            const grid = document.getElementById('gallery-grid-container');
            if (grid) {
                if (grid.requestFullscreen) grid.requestFullscreen();
                else if (grid.webkitRequestFullscreen) grid.webkitRequestFullscreen();
            }
        });
    }

    // 4.5.4 Garden
    const plantBtn = document.getElementById('plant-seed-btn');
    const waterBtn = document.getElementById('water-plant-btn');
    const gardenArea = document.getElementById('garden-visual-area');
    const plantPlac = document.getElementById('plant-placeholder');

    if (plantBtn && waterBtn && plantPlac && gardenArea) {
        let stageIdx = parseInt(localStorage.getItem(APP_STORAGE_KEYS.GARDEN_STAGE) || 0);
        let wCount = parseInt(localStorage.getItem(APP_STORAGE_KEYS.GARDEN_WATER) || 0);

        const updateGardenUI = () => {
            const stage = DATA_REGISTRY.GARDEN_STAGES[stageIdx];
            plantPlac.innerHTML = `<i class="bi ${stage.icon} ${stage.class} display-1 animate-float"></i>`;
            const p = gardenArea.querySelector('p');
            if (p) p.innerText = stage.msg;
            plantBtn.disabled = stageIdx > 0;
            waterBtn.disabled = stageIdx === 0 || stageIdx === DATA_REGISTRY.GARDEN_STAGES.length - 1;
        };

        plantBtn.addEventListener('click', () => {
            stageIdx = 1; wCount = 0;
            localStorage.setItem(APP_STORAGE_KEYS.GARDEN_STAGE, stageIdx);
            localStorage.setItem(APP_STORAGE_KEYS.GARDEN_WATER, wCount);
            updateGardenUI();
            helpers.showToast("Seed planted!");
        });

        waterBtn.addEventListener('click', () => {
            wCount++;
            if (wCount >= 3 && stageIdx < DATA_REGISTRY.GARDEN_STAGES.length - 1) {
                stageIdx++; wCount = 0;
                helpers.showToast("Your plant grew!");
            } else {
                helpers.showToast("Watering...");
            }
            localStorage.setItem(APP_STORAGE_KEYS.GARDEN_STAGE, stageIdx);
            localStorage.setItem(APP_STORAGE_KEYS.GARDEN_WATER, wCount);
            updateGardenUI();
        });

        updateGardenUI();
    }
};

/**
 * - 4.6 Progress Dashboard Mockup Sync */
const initProgressSync = () => {
    const updateDashboard = () => {
        const medMinVal = document.getElementById('meditation-min-val');
        if (medMinVal) {
            const mins = localStorage.getItem(APP_STORAGE_KEYS.TOTAL_MINUTES) || 0;
            medMinVal.innerText = `${mins} Min`;
        }
    };

    window.addEventListener('storage', updateDashboard);
    updateDashboard(); // Initial load
};

/* ==========================================================================
SECTION 5: PART 3 - GAMES & ACHIEVEMENTS
========================================================================== */

const GAME_STORAGE_KEYS = {
    BUBBLE_HIGH_SCORE: 'mindcare_bubble_highscore',
    MEMORY_BEST_TIME: 'mindcare_memory_best',
    ACTIVITY_STATS: 'mindcare_activity_stats',
    UNLOCKED_BADGES: 'mindcare_unlocked_badges',
    FAVORITE_COLOR: 'mindcare_fav_color',
    SAVED_CANVAS: 'mindcare_canvas_data'
};

const COLOR_THERAPY_DATA = [
    { name: "Serene Blue", hex: "#e0f2fe", msg: "Blue reduces pulse rate and body temperature, fostering deep tranquility." },
    { name: "Sage Green", hex: "#f0fdf4", msg: "Green is the color of nature; it relieves stress and helps the heart relax." },
    { name: "Soft Lavender", hex: "#f5f3ff", msg: "Lavender balances the mind and helps quiet overactive thoughts." },
    { name: "Pale Pink", hex: "#fff1f2", msg: "Pink is soothing and promotes feelings of safety and compassion." },
    { name: "Mellow Yellow", hex: "#fefce8", msg: "Soft yellow stimulates happiness and clears mental fog." }
];

const RANDOM_ACTIVITIES = [
    { title: "Gentle Stretch", desc: "Reach for the sky and hold for 10 seconds.", icon: "bi-person-arms-up" },
    { title: "Hydration Break", desc: "Drink a glass of water slowly, savoring every sip.", icon: "bi-droplet" },
    { title: "Window Watch", desc: "Look out a window and find 3 things moving.", icon: "bi-eye" },
    { title: "Deep Sigh", desc: "Inhale deeply and let out a loud, audible sigh.", icon: "bi-wind" },
    { title: "Gratitude Micro", desc: "Think of one person who made you smile recently.", icon: "bi-heart" }
];

const tracker = {
    incrementActivity: (activityId) => {
        const stats = JSON.parse(localStorage.getItem(GAME_STORAGE_KEYS.ACTIVITY_STATS) || '{}');
        stats[activityId] = (stats[activityId] || 0) + 1;
        localStorage.setItem(GAME_STORAGE_KEYS.ACTIVITY_STATS, JSON.stringify(stats));

        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        tracker.checkAchievements(total);
    },

    checkAchievements: (total) => {
        const badges = JSON.parse(localStorage.getItem(GAME_STORAGE_KEYS.UNLOCKED_BADGES) || '[]');
        const milestones = [
            { count: 1, id: "first_step", title: "First Step", msg: "You completed your first activity!" },
            { count: 5, id: "steady_path", title: "Steady Path", msg: "5 activities completed. Keeping it up!" },
            { count: 10, id: "mindful_pro", title: "Mindful Pro", msg: "10 activities! You are prioritizing your peace." },
            { count: 30, id: "zen_master", title: "Zen Master", msg: "30 activities. Exceptional dedication." },
            { count: 100, id: "wellness_icon", title: "Wellness Icon", msg: "100 activities. You are a beacon of calm." }
        ];

        milestones.forEach(m => {
            if (total >= m.count && !badges.includes(m.id)) {
                badges.push(m.id);
                localStorage.setItem(GAME_STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(badges));
                tracker.notifyAchievement(m);
            }
        });
    },

    notifyAchievement: (milestone) => {
        const message = `🏆 New Badge: ${milestone.title}! ${milestone.msg}`;
        helpers.showToast(message);
    }
};

const initBubblePop = () => {
    const container = document.getElementById('bubble-pop-game-container');
    const startBtn = document.getElementById('btn-start-bubble');
    const scoreDisp = document.getElementById('bubble-score');
    const timerDisp = document.getElementById('bubble-timer');

    if (!container || !startBtn) return;

    let score = 0;
    let timeLeft = 60;
    let gameActive = false;
    let bubbleInterval;

    const spawnBubble = () => {
        if (!gameActive) return;
        const bubble = document.createElement('div');
        const size = Math.floor(Math.random() * 60) + 40;
        const x = Math.random() * (container.clientWidth - size);
        const y = Math.random() * (container.clientHeight - size);

        bubble.className = 'bubble-pop animate-pulse';
        Object.assign(bubble.style, {
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}px`,
            top: `${y}px`,
            background: `hsla(${Math.random() * 360}, 70%, 80%, 0.6)`,
            position: 'absolute',
            borderRadius: '50%',
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)',
            transition: 'transform 0.2s ease-out'
        });

        bubble.addEventListener('click', () => {
            score++;
            scoreDisp.innerText = score;
            bubble.style.transform = 'scale(1.5)';
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 200);
        });

        container.appendChild(bubble);
        setTimeout(() => { if (bubble) bubble.remove(); }, 3000);
    };

    startBtn.addEventListener('click', () => {
        if (gameActive) return;
        gameActive = true;
        score = 0;
        timeLeft = 60;
        scoreDisp.innerText = score;
        startBtn.disabled = true;

        bubbleInterval = setInterval(spawnBubble, 800);
        const timerInterval = setInterval(() => {
            timeLeft--;
            timerDisp.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                clearInterval(bubbleInterval);
                gameActive = false;
                startBtn.disabled = false;
                tracker.incrementActivity('bubble');

                const highscore = localStorage.getItem(GAME_STORAGE_KEYS.BUBBLE_HIGH_SCORE) || 0;
                if (score > highscore) {
                    localStorage.setItem(GAME_STORAGE_KEYS.BUBBLE_HIGH_SCORE, score);
                    alert(`Game Over! New High Score: ${score}`);
                } else {
                    alert(`Game Over! Your Score: ${score}`);
                }
            }
        }, 1000);
    });
};

const initMemoryGame = () => {
    const grid = document.getElementById('memory-game-grid');
    const startBtn = document.getElementById('btn-restart-memory');
    const moveDisp = document.getElementById('memory-moves');

    if (!grid) return;

    const emojis = ['😌', '🧘', '🌿', '🌊', '✨', '🍃', '🕯️', '☁️'];
    let cards = [...emojis, ...emojis];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let busy = false;

    const setup = () => {
        grid.innerHTML = '';
        cards = cards.sort(() => Math.random() - 0.5);
        moves = 0;
        matchedPairs = 0;
        if (moveDisp) moveDisp.innerText = moves;

        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card d-flex align-items-center justify-content-center bg-white shadow-sm rounded-4 fs-2';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.style.height = '100px';
            card.style.cursor = 'pointer';
            card.innerText = '?';

            card.addEventListener('click', () => flip(card));
            grid.appendChild(card);
        });
    };

    const flip = (card) => {
        if (busy || flippedCards.includes(card) || card.classList.contains('matched')) return;

        card.innerText = card.dataset.emoji;
        card.classList.add('bg-primary-subtle');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            if (moveDisp) moveDisp.innerText = moves;
            checkMatch();
        }
    };

    const checkMatch = () => {
        busy = true;
        const [c1, c2] = flippedCards;
        if (c1.dataset.emoji === c2.dataset.emoji) {
            c1.classList.add('matched', 'opacity-50');
            c2.classList.add('matched', 'opacity-50');
            matchedPairs++;
            flippedCards = [];
            busy = false;
            if (matchedPairs === emojis.length) {
                tracker.incrementActivity('memory');
                setTimeout(() => alert('You matched all pairs! Great focus.'), 500);
            }
        } else {
            setTimeout(() => {
                c1.innerText = '?';
                c2.innerText = '?';
                c1.classList.remove('bg-primary-subtle');
                c2.classList.remove('bg-primary-subtle');
                flippedCards = [];
                busy = false;
            }, 1000);
        }
    };

    if (startBtn) startBtn.addEventListener('click', setup);
    setup();
};

const initCanvasModules = () => {
    const setupCanvas = (canvasId, isZen = false) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let painting = false;
        let color = isZen ? '#d1d5db' : '#0d9488';

        const startPos = (e) => { painting = true; draw(e); };
        const endPos = () => {
            painting = false;
            ctx.beginPath();
            if (!isZen) tracker.incrementActivity('drawing');
        };

        const draw = (e) => {
            if (!painting) return;
            ctx.lineWidth = isZen ? 8 : 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startPos);
        canvas.addEventListener('mouseup', endPos);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', startPos);
        canvas.addEventListener('touchend', endPos);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });

        const clearBtn = document.getElementById(isZen ? 'btn-clear-zen' : 'btn-clear-draw');
        if (clearBtn) clearBtn.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
    };

    setupCanvas('drawing-pad-canvas');
    setupCanvas('zen-garden-canvas', true);
};

const initVisualModules = () => {
    const colorGrid = document.getElementById('color-therapy-grid');
    const colorPreview = document.getElementById('color-preview-box');
    const colorMsg = document.getElementById('color-therapy-message');

    if (colorGrid) {
        COLOR_THERAPY_DATA.forEach(item => {
            const btn = document.createElement('div');
            btn.className = 'color-swatch rounded-circle shadow-sm border m-2';
            Object.assign(btn.style, {
                width: '50px', height: '50px', background: item.hex, cursor: 'pointer'
            });
            btn.addEventListener('click', () => {
                if (colorPreview) colorPreview.style.backgroundColor = item.hex;
                if (colorMsg) colorMsg.innerText = item.msg;
                tracker.incrementActivity('color_therapy');
                localStorage.setItem(GAME_STORAGE_KEYS.FAVORITE_COLOR, item.hex);
            });
            colorGrid.appendChild(btn);
        });
    }

    const randomBtn = document.getElementById('btn-random-activity');
    const activityDisplay = document.getElementById('random-activity-display');

    if (randomBtn && activityDisplay) {
        randomBtn.addEventListener('click', () => {
            const act = RANDOM_ACTIVITIES[Math.floor(Math.random() * RANDOM_ACTIVITIES.length)];
            activityDisplay.innerHTML = `
                <div class="text-center p-3 animate-fade-in">
                    <i class="bi ${act.icon} fs-1 text-primary"></i>
                    <h5 class="fw-bold mt-2">${act.title}</h5>
                    <p class="text-muted small">${act.desc}</p>
                </div>
            `;
            tracker.incrementActivity('random_suggest');
        });
    }
};

const initJigsaw = () => {
    const puzzleArea = document.getElementById('jigsaw-puzzle-container');
    if (!puzzleArea) return;

    let order = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);

    const drawPuzzle = () => {
        puzzleArea.innerHTML = '';
        order.forEach((val, index) => {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile d-flex align-items-center justify-content-center bg-primary text-white rounded-3 border fw-bold fs-4';
            tile.style.height = '80px';
            tile.style.cursor = 'move';
            tile.draggable = true;
            tile.innerText = val + 1;
            tile.dataset.val = val;
            tile.dataset.idx = index;

            tile.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', index));
            tile.addEventListener('dragover', (e) => e.preventDefault());
            tile.addEventListener('drop', (e) => {
                const fromIdx = e.dataTransfer.getData('text/plain');
                const toIdx = index;
                [order[fromIdx], order[toIdx]] = [order[toIdx], order[fromIdx]];
                drawPuzzle();
                checkWin();
            });

            puzzleArea.appendChild(tile);
        });
    };

    const checkWin = () => {
        if (order.every((v, i) => v === i)) {
            tracker.incrementActivity('puzzle');
            alert('Puzzle solved! Harmony restored.');
        }
    };

    drawPuzzle();
};

/* ==========================================================================
SECTION 6: FINAL INITIALIZATION
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initGreeting();
    initMoodTherapy();
    initGenerators();
    initRelaxationExercises();
    initMindfulnessTools();
    initProgressSync();

    // Part 3 Modules
    initBubblePop();
    initMemoryGame();
    initCanvasModules();
    initVisualModules();
    initJigsaw();

    initMouseGlow();

    const scrollBtn = document.getElementById('btn-scroll-top');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollBtn.classList.replace('d-none', 'd-flex');
            else scrollBtn.classList.replace('d-flex', 'd-none');
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});

/* ==========================================================================
SECTION 7: MOUSE GLOW (matches contact/about page ambient effect)
Self-contained — does not depend on or modify any other function above.
========================================================================== */
const initMouseGlow = () => {
    const glow = document.querySelector('[data-mouse-glow]');
    if (!glow) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    }, { passive: true });

    const tick = () => {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};