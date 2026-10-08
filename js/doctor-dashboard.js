function switchTab(id, el) {
    document.querySelectorAll('.tab-content-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    el.classList.add('active');
}

function catBadge(cat) {
    const map = { meditation:'?? Meditation', asmr:'?? ASMR', selfcare:'?? Self Care', motivational:'? Motivational' };
    const cls = { meditation:'badge-meditation', asmr:'badge-asmr', selfcare:'badge-selfcare', motivational:'badge-motivational' };
    return `<span class="badge-cat ${cls[cat]||'badge-meditation'}">${map[cat]||cat}</span>`;
}

function moodBadge(mood) {
    const m = (mood||'').toLowerCase();
    if(m.includes('khush')||m.includes('happy')) return `<span class="mood-badge mood-happy">?? ${mood}</span>`;
    if(m.includes('udaas')||m.includes('sad')) return `<span class="mood-badge mood-sad">?? ${mood}</span>`;
    if(m.includes('anxious')||m.includes('pareshan')) return `<span class="mood-badge mood-anxious">?? ${mood}</span>`;
    if(m.includes('gusse')||m.includes('angry')) return `<span class="mood-badge mood-angry">?? ${mood}</span>`;
    if(m.includes('withdrawn')||m.includes('chup')) return `<span class="mood-badge mood-withdrawn">?? ${mood}</span>`;
    return `<span class="mood-badge mood-normal">?? ${mood}</span>`;
}

function renderPrescriptions() {
    const data = JSON.parse(localStorage.getItem('mindcare_prescriptions') || '[]');
    const el = document.getElementById('prescriptionsList');
    document.getElementById('totalPrescriptions').innerText = data.length;
    if(!data.length) { el.innerHTML = `<div class="empty-state"><i class="bi bi-clipboard2-x"></i><p>Abhi koi prescription nahi mili.<br><small>Doctor form se patient ko activities assign karein.</small></p></div>`; return; }
    el.innerHTML = '';
    [...data].reverse().forEach((p, i) => {
        const acts = (p.activities||[]).map(a => `<span class="act-tag">${a}</span>`).join('');
        el.innerHTML += `
        <div class="report-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                    <div class="fw-bold fs-6">?? Patient: ${p.patientName||'—'}</div>
                    <div class="text-muted small">Dr. ${p.doctorName} &nbsp;|&nbsp; ${p.timestamp}</div>
                </div>
                ${catBadge(p.category)}
            </div>
            ${acts ? `<div class="mb-2"><span class="text-muted small fw-semibold">Assigned Activities:</span><br>${acts}</div>` : ''}
            ${p.notes ? `<div class="mt-2 p-3" style="background:rgba(13,148,136,.06);border-radius:12px;font-size:.88rem;"><i class="bi bi-journal-text me-1" style="color:var(--accent-teal)"></i><strong>Doctor Notes:</strong> ${p.notes}</div>` : ''}
        </div>`;
    });
}

function renderParentReports() {
    const data = JSON.parse(localStorage.getItem('mindcare_parent_reports') || '[]');
    const el = document.getElementById('parentReportsList');
    document.getElementById('totalParentReports').innerText = data.length;
    if(!data.length) { el.innerHTML = `<div class="empty-state"><i class="bi bi-people"></i><p>Abhi koi parent report nahi mili.<br><small>Jab parent form fill karein ge to report yahan dikhegi.</small></p></div>`; return; }
    el.innerHTML = '';
    [...data].reverse().forEach(r => {
        el.innerHTML += `
        <div class="report-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                    <div class="fw-bold fs-6">?? Child: ${r.childName||'—'} <span class="text-muted fw-normal">(Age: ${r.childAge||'—'})</span></div>
                    <div class="text-muted small">Parent: ${r.parentName} &nbsp;|&nbsp; ${r.timestamp}</div>
                </div>
                ${r.doctorRef ? `<span style="font-size:.8rem;background:rgba(13,148,136,.08);color:var(--accent-teal);padding:5px 14px;border-radius:50px;font-weight:700;">????? Dr. ${r.doctorRef}</span>` : ''}
            </div>
            <div class="row g-2">
                <div class="col-sm-4"><div style="background:var(--bg-calm);border-radius:12px;padding:12px;font-size:.85rem;"><span class="text-muted">Mood</span><br>${moodBadge(r.mood)}</div></div>
                <div class="col-sm-4"><div style="background:var(--bg-calm);border-radius:12px;padding:12px;font-size:.85rem;"><span class="text-muted">Sleep</span><br><strong>${r.sleep||'—'}</strong></div></div>
                <div class="col-sm-4"><div style="background:var(--bg-calm);border-radius:12px;padding:12px;font-size:.85rem;"><span class="text-muted">Appetite</span><br><strong>${r.appetite||'—'}</strong></div></div>
                <div class="col-sm-6"><div style="background:var(--bg-calm);border-radius:12px;padding:12px;font-size:.85rem;"><span class="text-muted">Social</span><br><strong>${r.social||'—'}</strong></div></div>
                ${r.observations ? `<div class="col-sm-6"><div style="background:var(--bg-calm);border-radius:12px;padding:12px;font-size:.85rem;"><span class="text-muted">Observations</span><br><strong>${r.observations}</strong></div></div>` : ''}
            </div>
        </div>`;
    });
}

function renderMoodLogs() {
    const el = document.getElementById('moodLogsList');
    const keys = Object.keys(localStorage).filter(k => k.startsWith('mindcare_logs_'));
    let allLogs = [];
    keys.forEach(k => {
        const logs = JSON.parse(localStorage.getItem(k)||'[]');
        logs.forEach(l => { l._profile = k.replace('mindcare_logs_',''); allLogs.push(l); });
    });
    if(!allLogs.length) { el.innerHTML = `<div class="empty-state"><i class="bi bi-graph-up-arrow"></i><p>Koi mood log nahi mili abhi.<br><small>Patient tracker use kare ga to logs yahan aayenge.</small></p></div>`; return; }
    el.innerHTML = '';
    [...allLogs].reverse().slice(0,20).forEach(l => {
        const tags = (l.tags||[]).map(t=>`<span class="act-tag">${t}</span>`).join('');
        el.innerHTML += `
        <div class="report-card">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div><span class="fs-5 me-2">${l.emoji||''}</span><strong>${l.mood}</strong> <span class="text-muted small">&nbsp;|&nbsp; ${l._profile} &nbsp;|&nbsp; ${l.time}</span></div>
                <div><span class="badge bg-light border me-1" style="color:var(--text-dark)">?? Sleep: ${l.sleep}/10</span><span class="badge bg-light border" style="color:var(--text-dark)">? Energy: ${l.energy}/10</span></div>
            </div>
            ${tags ? `<div class="mt-2">${tags}</div>` : ''}
            ${l.journal ? `<p class="text-muted small mb-0 mt-2 fst-italic">"${l.journal}"</p>` : ''}
        </div>`;
    });
}

function updateStats() {
    const presc = JSON.parse(localStorage.getItem('mindcare_prescriptions')||'[]');
    const parent = JSON.parse(localStorage.getItem('mindcare_parent_reports')||'[]');
    const patients = [...new Set(presc.map(p=>p.patientName).filter(Boolean))];
    document.getElementById('uniquePatients').innerText = patients.length;
    const today = new Date().toLocaleDateString();
    const todayP = presc.filter(p=>p.timestamp&&p.timestamp.includes(today)).length;
    const todayPr = parent.filter(p=>p.timestamp&&p.timestamp.includes(today)).length;
    document.getElementById('todayCount').innerText = todayP + todayPr;
}

function clearPrescriptions() {
    if(confirm('Sab prescriptions delete karein? Yeh wapas nahi aayengi.')) {
        localStorage.removeItem('mindcare_prescriptions');
        loadAll();
    }
}
function clearParentReports() {
    if(confirm('Sab parent reports delete karein?')) {
        localStorage.removeItem('mindcare_parent_reports');
        loadAll();
    }
}

function loadAll() {
    renderPrescriptions();
    renderParentReports();
    renderMoodLogs();
    updateStats();
}

// THEME
const tc = document.querySelector('.theme-switch input');
tc.addEventListener('change', e => {
    document.documentElement.setAttribute('data-theme', e.target.checked?'dark':'light');
    localStorage.setItem('theme', e.target.checked?'dark':'light');
});
const st = localStorage.getItem('theme')||'light';
document.documentElement.setAttribute('data-theme', st);
if(st==='dark') tc.checked = true;

window.onload = function() {
    loadAll();
    if (localStorage.getItem("completed") !== "yes" && localStorage.getItem("isRegistered") !== "true") {
        localStorage.setItem("redirectAfterForm", "doctor-dashboard.html");
        localStorage.setItem("requestedPage", "doctor-dashboard.html");
        window.location.href = "form.html";
    }
};

function checkForm(page){
    if(localStorage.getItem("completed") === "yes" || localStorage.getItem("isRegistered") === "true"){
        window.location.href = page;
    } else {
        localStorage.setItem("redirectAfterForm", page);
        localStorage.setItem("requestedPage", page);
        window.location.href = "form.html";
    }
}

// MOUSE GLOW (matches index.html effect)
(function(){
    var glow = document.querySelector('[data-mouse-glow]');
    if(!glow) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var targetX = window.innerWidth/2, targetY = window.innerHeight/2;
    var currentX = targetX, currentY = targetY;

    window.addEventListener('pointermove', function(e){
        targetX = e.clientX;
        targetY = e.clientY;
    }, { passive: true });

    function animate(){
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        glow.style.transform = 'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();