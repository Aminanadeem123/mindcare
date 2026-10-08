document.addEventListener("DOMContentLoaded", () => {
      const storedUser = localStorage.getItem("currentUser");
      const currentUser = storedUser ? JSON.parse(storedUser).name || JSON.parse(storedUser).email || "guest" : "guest";

      const journalsKey = `mindcare_journals_${currentUser}`;
      const metaKey = `mindcare_journal_meta_${currentUser}`;
      const titleInput = document.getElementById("editor-title");
      const contentInput = document.getElementById("editor-content");
      const categorySelect = document.getElementById("editor-category");
      const timelineList = document.getElementById("timeline-list");
      const emptyState = document.getElementById("empty-state");
      const searchInput = document.getElementById("timeline-search");
      const filterSelect = document.getElementById("timeline-filter");
      const sortSelect = document.getElementById("timeline-sort");
      const saveBtn = document.getElementById("save-journal-btn");
      const updateBtn = document.getElementById("update-journal-btn");
      const deleteBtn = document.getElementById("delete-journal-btn");
      const clearBtn = document.getElementById("clear-editor-btn");
      const exportBtn = document.getElementById("export-data-btn");
      const moodButtons = document.querySelectorAll(".journal-mood-pill");
      const toastEl = document.getElementById("liveToast");
      const toastMsg = document.getElementById("toast-message-text");
      const modal = new bootstrap.Modal(document.getElementById("journalModal"));

      let journals = JSON.parse(localStorage.getItem(journalsKey)) || [];
      let currentSelectedId = null;
      let currentMood = "Calm";

      const statTotal = document.getElementById("stat-total");
      const statStreak = document.getElementById("stat-streak");
      const statMood = document.getElementById("stat-mood");
      const statTime = document.getElementById("stat-time");
      const wordCountEl = document.getElementById("word-count");
      const charCountEl = document.getElementById("char-count");
      const readTimeEl = document.getElementById("read-time");
      const autoSaveStatus = document.getElementById("auto-save-status");
      const modalTitle = document.getElementById("modalJournalTitle");
      const modalMeta = document.getElementById("modalJournalMeta");
      const modalContent = document.getElementById("modalJournalContent");

      document.getElementById("current-date-label").textContent = new Date().toLocaleDateString(undefined, {
        weekday: "short", month: "short", day: "numeric", year: "numeric"
      });

      window.addEventListener("mousemove", (e) => {
        const glow = document.getElementById("mouse-glow");
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      });

      const emojiMap = { Happy:"??", Calm:"??", Sad:"??", Angry:"??", Anxious:"??", Excited:"??", Neutral:"??" };

      function escapeHtml(str = "") {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }

      function showToast(message) {
        toastMsg.textContent = message;
        bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 }).show();
      }

      function stats(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        return { words, chars: text.length, readTime: Math.max(1, Math.ceil(words / 200)) };
      }

      function saveAll() {
        localStorage.setItem(journalsKey, JSON.stringify(journals));
        localStorage.setItem(metaKey, JSON.stringify({ lastSaved: new Date().toISOString() }));
      }

      function computeStreak(list) {
        const days = [...new Set(list.map(j => new Date(j.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
        if (!days.length) return 0;
        let streak = 1;
        for (let i = 0; i < days.length - 1; i++) {
          const diff = Math.round((new Date(days[i]) - new Date(days[i + 1])) / 86400000);
          if (diff === 1) streak++;
          else break;
        }
        return streak;
      }

      function updateStats() {
        statTotal.textContent = journals.length;
        statStreak.textContent = computeStreak(journals);
        statMood.textContent = journals[0]?.mood || "Calm";
        statTime.textContent = `${journals.reduce((s, j) => s + (j.readingTime || 0), 0)}m`;
      }

      function getFilteredJournals() {
        const q = searchInput.value.trim().toLowerCase();
        let arr = journals.filter(j => {
          const searchable = `${j.title} ${j.content} ${j.category} ${j.mood}`.toLowerCase();
          return (!q || searchable.includes(q)) && (filterSelect.value === "All" || j.mood === filterSelect.value);
        });

        if (sortSelect.value === "oldest") arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sortSelect.value === "az") arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        else if (sortSelect.value === "za") arr.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        else arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return arr;
      }

      function renderTimeline() {
        const filtered = getFilteredJournals();
        timelineList.innerHTML = '<div class="journal-timeline-line"></div>';
        emptyState.style.display = filtered.length ? "none" : "grid";
        timelineList.style.display = filtered.length ? "block" : "none";

        filtered.forEach(j => {
          const item = document.createElement("article");
          item.className = `journal-timeline-item ${currentSelectedId === j.id ? "journal-timeline-selected" : ""}`;
          item.innerHTML = `
            <div class="journal-item-top">
              <h3 class="journal-item-title">${emojiMap[j.mood] || "??"} ${escapeHtml(j.title || "Untitled Entry")}</h3>
              <span class="journal-item-badge">${escapeHtml(j.category || "Daily Log")}</span>
            </div>
            <div class="journal-item-meta">
              <span>${new Date(j.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>${j.readingTime || 0} min read</span>
              <span>${j.wordCount || 0} words</span>
            </div>
            <div class="journal-item-preview">${escapeHtml((j.content || "").slice(0, 120))}</div>
            <div class="journal-item-actions">
              <button class="journal-mini-btn" data-action="view">View</button>
              <button class="journal-mini-btn" data-action="edit">Edit</button>
              <button class="journal-mini-btn" data-action="delete">Delete</button>
            </div>
          `;

          item.querySelector('[data-action="view"]').addEventListener("click", e => {
            e.stopPropagation();
            modalTitle.textContent = j.title || "Untitled Entry";
            modalMeta.textContent = `${j.category || "Daily Log"} – ${j.mood} – ${new Date(j.date).toLocaleString()}`;
            modalContent.textContent = j.content || "";
            modal.show();
          });

          item.querySelector('[data-action="edit"]').addEventListener("click", e => {
            e.stopPropagation();
            loadJournal(j.id);
          });

          item.querySelector('[data-action="delete"]').addEventListener("click", e => {
            e.stopPropagation();
            deleteJournal(j.id);
          });

          item.addEventListener("click", () => loadJournal(j.id));
          timelineList.appendChild(item);
        });

        updateStats();
      }

      function setMood(mood) {
        currentMood = mood;
        moodButtons.forEach(btn => btn.classList.toggle("journal-mood-pill-active", btn.dataset.mood === mood));
      }

      function updateCounters() {
        const s = stats(contentInput.value);
        wordCountEl.textContent = `${s.words} words`;
        charCountEl.textContent = `${s.chars} chars`;
        readTimeEl.textContent = `${s.readTime} min read`;
      }

      contentInput.addEventListener("input", () => {
        updateCounters();
        autoSaveStatus.textContent = "Draft saved locally";
      });

      function clearEditor() {
        currentSelectedId = null;
        titleInput.value = "";
        contentInput.value = "";
        categorySelect.value = "Reflection";
        setMood("Calm");
        saveBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");
        deleteBtn.classList.add("d-none");
        updateCounters();
        renderTimeline();
      }

      function loadJournal(id) {
        const j = journals.find(x => x.id === id);
        if (!j) return;
        currentSelectedId = id;
        titleInput.value = j.title || "";
        contentInput.value = j.content || "";
        categorySelect.value = j.category || "Reflection";
        setMood(j.mood || "Calm");
        saveBtn.classList.add("d-none");
        updateBtn.classList.remove("d-none");
        deleteBtn.classList.remove("d-none");
        updateCounters();
        renderTimeline();
      }

      function deleteJournal(id = currentSelectedId) {
        if (!id) return;
        journals = journals.filter(j => j.id !== id);
        saveAll();
        showToast("Journal deleted successfully.");
        clearEditor();
      }

      saveBtn.addEventListener("click", () => {
        const title = titleInput.value.trim() || "Untitled Entry";
        const content = contentInput.value.trim();
        if (!content) return showToast("Please write something first.");
        const s = stats(content);
        const now = new Date().toISOString();

        journals.unshift({
          id: Date.now().toString(),
          userId: currentUser,
          title,
          content,
          category: categorySelect.value,
          mood: currentMood,
          date: now,
          createdAt: now,
          updatedAt: now,
          wordCount: s.words,
          readingTime: s.readTime
        });

        saveAll();
        showToast("Journal saved successfully.");
        clearEditor();
      });

      updateBtn.addEventListener("click", () => {
        if (!currentSelectedId) return;
        const title = titleInput.value.trim() || "Untitled Entry";
        const content = contentInput.value.trim();
        if (!content) return showToast("Journal content cannot be empty.");
        const s = stats(content);

        journals = journals.map(j => j.id === currentSelectedId ? {
          ...j,
          title,
          content,
          category: categorySelect.value,
          mood: currentMood,
          updatedAt: new Date().toISOString(),
          wordCount: s.words,
          readingTime: s.readTime
        } : j);

        saveAll();
        showToast("Journal updated successfully.");
        clearEditor();
      });

      deleteBtn.addEventListener("click", () => deleteJournal());
      clearBtn.addEventListener("click", clearEditor);

      moodButtons.forEach(btn => btn.addEventListener("click", () => setMood(btn.dataset.mood)));
      [searchInput, filterSelect, sortSelect].forEach(el => {
        el.addEventListener("input", renderTimeline);
        el.addEventListener("change", renderTimeline);
      });

      exportBtn.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journals, null, 2));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = `mindcare_journals_${currentUser}.json`;
        a.click();
        showToast("Export started.");
      });

      updateCounters();
      renderTimeline();

      const lastMeta = JSON.parse(localStorage.getItem(metaKey) || "null");
      if (lastMeta?.lastSaved) autoSaveStatus.textContent = `Last saved ${new Date(lastMeta.lastSaved).toLocaleString()}`;
    });