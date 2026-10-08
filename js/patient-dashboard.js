if (localStorage.getItem("completed") !== "yes" && localStorage.getItem("isRegistered") !== "true") {
    localStorage.setItem("redirectAfterForm", "patient-dashboard.html");
    localStorage.setItem("requestedPage", "patient-dashboard.html");
    window.location.href = "form.html";
}

let chartInstance = null;

function populatePatientPicker() {
    const data = JSON.parse(localStorage.getItem('mindcare_patient_assessments')||'[]');
    const names = [...new Set(data.map(d=>d.name))];
    const picker = document.getElementById('patientPicker');
    const lastName = localStorage.getItem('mindcare_last_patient_name');
    if(!names.length) { picker.innerHTML = '<option>No patient data</option>'; return; }
    picker.innerHTML = names.map(n=>`<option value="${n}" ${n===lastName?'selected':''}>${n}</option>`).join('');
}

function sleepScoreVal(q) { return q==='Good'?90:q==='Average'?60:q==='Poor'?30:50; }

function loadDashboard() {
    const picker = document.getElementById('patientPicker');
    const selectedName = picker.value;
    const allAssessments = JSON.parse(localStorage.getItem('mindcare_patient_assessments')||'[]');
    const records = allAssessments.filter(a=>a.name===selectedName);

    if(!records.length) {
        document.getElementById('scoreNum').innerText = '—';
        document.getElementById('scoreMsg').innerText = 'Assessment fill karein score dekhne ke liye.';
        document.getElementById('chartEmptyState').style.display = 'block';
        document.getElementById('progressChart').style.display = 'none';
        return;
    }

    const latest = records[records.length-1];

    // WELLNESS SCORE: inverse of stress+anxiety average, blended with sleep
    const stressComponent = (10-latest.stress)*5;
    const anxietyComponent = (10-latest.anxiety)*5;
    const sleepComponent = sleepScoreVal(latest.sleepQuality);
    const wellnessScore = Math.round((stressComponent+anxietyComponent+sleepComponent)/3);

    document.getElementById('scoreNum').innerText = wellnessScore;
    const circumference = 427;
    const offset = circumference - (circumference*wellnessScore/100);
    document.getElementById('scoreRing').style.strokeDashoffset = offset;
    document.getElementById('scoreMsg').innerText = wellnessScore>=70 ? '\u{1F60A} Aap acha kar rahe hain!' : wellnessScore>=40 ? '\u{1F4AA} Thodi mehnat aur — aap sahi raah par hain.' : '\u{1F3E0} Apne doctor se baat karein, support lena strength hai.';

    // STRESS TREND
    document.getElementById('stressTrendNum').innerText = latest.stress + '/10';
    if(records.length>1) {
        const prev = records[records.length-2];
        const diff = latest.stress - prev.stress;
        const badge = document.getElementById('stressTrendBadge');
        if(diff < 0) { badge.className='trend-up'; badge.innerText = '? Improved'; }
        else if(diff > 0) { badge.className='trend-down'; badge.innerText = '? Increased'; }
        else { badge.className='trend-up'; badge.innerText = '? Stable'; }
    } else { document.getElementById('stressTrendBadge').innerText = 'First Entry'; }

    // SLEEP TREND
    document.getElementById('sleepTrendNum').innerText = latest.sleepQuality || '—';
    if(records.length>1) {
        const prev = records[records.length-2];
        const diff = sleepScoreVal(latest.sleepQuality) - sleepScoreVal(prev.sleepQuality);
        const badge = document.getElementById('sleepTrendBadge');
        if(diff > 0) { badge.className='trend-up'; badge.innerText = '? Improved'; }
        else if(diff < 0) { badge.className='trend-down'; badge.innerText = '? Declined'; }
        else { badge.className='trend-up'; badge.innerText = '? Stable'; }
    } else { document.getElementById('sleepTrendBadge').innerText = 'First Entry'; }

    // COMPLETED ACTIVITIES (goals as proxy + count of assessments)
    const goalsList = latest.goals || [];
    const actEl = document.getElementById('completedActivitiesList');
    if(goalsList.length) {
        actEl.innerHTML = goalsList.map(g=>`<div class="activity-done-row"><span class="small fw-semibold">${g}</span><i class="bi bi-check-circle-fill text-success"></i></div>`).join('');
    } else {
        actEl.innerHTML = `<div class="empty-state py-3"><small>Koi goal set nahi kiya abhi.</small></div>`;
    }

    // DOCTOR RECOMMENDATIONS
    const presc = JSON.parse(localStorage.getItem('mindcare_prescriptions')||'[]').filter(p=>p.patientName===selectedName);
    const docAssess = JSON.parse(localStorage.getItem('mindcare_doctor_assessments')||'[]').filter(d=>d.patientName===selectedName);
    const recEl = document.getElementById('recommendationsList');
    let recHTML = '';
    const catMap = {meditation:['?? Meditation','badge-meditation'], asmr:['?? ASMR','badge-asmr'], selfcare:['?? Self Care','badge-selfcare'], motivational:['? Motivational','badge-motivational']};
    [...presc].reverse().slice(0,4).forEach(p=>{
        const cat = catMap[p.category] || ['General','badge-meditation'];
        recHTML += `<div class="rec-card"><span class="badge-cat ${cat[1]}">${cat[0]}</span>${p.notes?`<p class="small mb-0 mt-2">${p.notes}</p>`:''}</div>`;
    });
    [...docAssess].reverse().slice(0,3).forEach(d=>{
        if(d.recommendation) recHTML += `<div class="rec-card"><span class="badge-cat badge-meditation">?? Dr. ${d.doctorName}</span><p class="small mb-0 mt-2">${d.recommendation}</p>${d.followup?`<p class="small text-muted mb-0 mt-1">Follow-up: ${d.followup}</p>`:''}</div>`;
    });
    recEl.innerHTML = recHTML || `<div class="empty-state py-3"><small>Koi recommendation nahi mili abhi.</small></div>`;

    // GRAPH
    if(records.length >= 2) {
        document.getElementById('chartEmptyState').style.display = 'none';
        document.getElementById('progressChart').style.display = 'block';
        const labels = records.map((r,i)=>'Entry '+(i+1));
        const stressData = records.map(r=>r.stress);
        const anxietyData = records.map(r=>r.anxiety);
        if(chartInstance) chartInstance.destroy();
        const ctx = document.getElementById('progressChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [
                { label:'Stress', data: stressData, borderColor:'#f43f5e', backgroundColor:'rgba(244,63,94,.08)', tension:.4, fill:true },
                { label:'Anxiety', data: anxietyData, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,.08)', tension:.4, fill:true }
            ]},
            options: { responsive:true, scales:{ y:{ min:0, max:10 } }, plugins:{ legend:{position:'bottom'} } }
        });
    } else {
        document.getElementById('chartEmptyState').style.display = 'block';
        document.getElementById('progressChart').style.display = 'none';
    }
}

populatePatientPicker();
loadDashboard();

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