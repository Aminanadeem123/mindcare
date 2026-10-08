const videos = [
        {
            id: "wUwUtkNxPHo",
            title: "Morning Yoga",
            emoji: "\u{1F9D8}\u200D\u2640\uFE0F",
            label: "Gentle Flow",
            duration: "12 min",
            level: "Beginner",
            tags: ["morning", "stretch", "energy"],
            category: "morning"
        },
        {
            id: "OQHICAaRiQA",
            title: "Stress Relief",
            emoji: "\u{1F33F}",
            label: "Unwind",
            duration: "9 min",
            level: "All levels",
            tags: ["stress", "relief", "calm"],
            category: "stress"
        },
        {
            id: "5EglQogTsK4",
            title: "Deep Breathing",
            emoji: "\u{1F32C}\uFE0F",
            label: "Breathwork",
            duration: "7 min",
            level: "Beginner",
            tags: ["breath", "focus", "reset"],
            category: "focus"
        },
        {
            id: "NIW4Nrmqd6k",
            title: "Focus Session",
            emoji: "\u{1F3AF}",
            label: "Productivity",
            duration: "8 min",
            level: "All levels",
            tags: ["focus", "study", "clarity"],
            category: "focus"
        },
        {
            id: "u75_zER7SEY",
            title: "Evening Calm",
            emoji: "\u{1F319}",
            label: "Slow Down",
            duration: "10 min",
            level: "All levels",
            tags: ["evening", "relax", "calm"],
            category: "sleep"
        },
        {
            id: "pohvConGF0I",
            title: "Anxiety Help",
            emoji: "\u{1F49A}",
            label: "Grounding",
            duration: "11 min",
            level: "Beginner",
            tags: ["anxiety", "support", "breath"],
            category: "stress"
        },
        {
            id: "1ZYbU82GVz4",
            title: "Sleep Meditation",
            emoji: "\u{1F634}",
            label: "Drift Off",
            duration: "14 min",
            level: "All levels",
            tags: ["sleep", "night", "calm"],
            category: "sleep"
        },
        {
            id: "O-6f5wQXSu8",
            title: "Mindfulness",
            emoji: "\u{1F9E0}",
            label: "Present Moment",
            duration: "6 min",
            level: "Beginner",
            tags: ["mindfulness", "present", "calm"],
            category: "focus"
        },
        {
            id: "A0OnDcl6eQc",
            title: "Quick Stretch",
            emoji: "\u{1F938}\u200D\u2640\uFE0F",
            label: "Micro Break",
            duration: "5 min",
            level: "All levels",
            tags: ["stretch", "office", "refresh"],
            category: "morning"
        }
    ];

    function createCardHTML(vid) {
        const tagsHTML = vid.tags.map(t => {
            let extraClass = "";
            if (t === "calm" || t === "sleep" || t === "night") extraClass = "tag-calm";
            if (t === "focus" || t === "study" || t === "energy") extraClass = "tag-focus";
            return `<span class="tag ${extraClass}">${t}</span>`;
        }).join("");

        return `
            <div class="col-lg-4 col-md-6 session-card" data-category="${vid.category}">
                <div class="card-ui">
                    <div class="emoji-box">${vid.emoji}</div>
                    <div class="session-label">${vid.label}</div>
                    <h5 class="session-title">${vid.title}</h5>

                    <div class="session-meta">
                        <span class="meta-pill">
                            <i class="bi bi-clock"></i> ${vid.duration}
                        </span>
                        <span class="meta-pill">
                            <i class="bi bi-person"></i> ${vid.level}
                        </span>
                    </div>

                    <div class="tag-row">
                        ${tagsHTML}
                    </div>

                    <button class="btn-custom" onclick="openVideo('${vid.id}')">
                        <i class="bi bi-play-fill"></i> Play session
                    </button>
                    <a href="https://www.ssyoutube.com/watch?v=${vid.id}" target="_blank" class="btn-download">
                        <i class="bi bi-download"></i> Download for offline
                    </a>
                </div>
            </div>
        `;
    }

    function loadVideos() {
        const grid = document.getElementById('videoGrid');
        grid.innerHTML = "";
        videos.forEach(vid => {
            grid.innerHTML += createCardHTML(vid);
        });
    }

    function searchFunction() {
        const input = document.getElementById('searchInput').value.toLowerCase();
        const cards = document.getElementsByClassName('session-card');

        for (let i = 0; i < cards.length; i++) {
            const title = cards[i].getElementsByClassName("session-title")[0].innerText.toLowerCase();
            const tags = cards[i].getElementsByClassName("tag-row")[0].innerText.toLowerCase();
            const combined = title + " " + tags;
            cards[i].style.display = combined.includes(input) ? "" : "none";
        }
    }

    function openVideo(id) {
        document.getElementById('videoFrame').src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
        document.getElementById('videoModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
        document.getElementById('videoModal').style.display = 'none';
        document.getElementById('videoFrame').src = '';
        document.body.style.overflow = '';
    }

    // Category filter
    function chipsClickHandler() {
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.getAttribute('data-filter');

                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const cards = document.getElementsByClassName('session-card');
                for (let i = 0; i < cards.length; i++) {
                    const cat = cards[i].getAttribute('data-category');
                    cards[i].style.display = (filter === 'all' || cat === filter) ? "" : "none";
                }

                document.getElementById('searchInput').value = "";
            });
        });
    }

    window.onload = () => {
        loadVideos();
        chipsClickHandler();
    };