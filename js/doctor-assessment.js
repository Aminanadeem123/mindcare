if(localStorage.getItem("isRegistered") !== "true"){
    window.location.href = "form.html";
}

let selectedSymptoms = [], selectedSeverity = '';

function toggleSymptom(el, val) {
    el.classList.toggle('selected');
    if(el.classList.contains('selected')) selectedSymptoms.push(val);
    else selectedSymptoms = selectedSymptoms.filter(s=>s!==val);
}
function selectSeverity(el, val, cls) {
    document.querySelectorAll('.severity-opt').forEach(s=>{ s.classList.remove('selected'); s.classList.remove('s-mild','s-moderate','s-severe','s-critical'); });
    el.classList.add('selected'); el.classList.add(cls);
    selectedSeverity = val;
}

function loadPatientSuggestions() {
    const data = JSON.parse(localStorage.getItem('mindcare_patient_assessments')||'[]');
    const dl = document.getElementById('patientSuggestions');
    const names = [...new Set(data.map(d=>d.name))];
    dl.innerHTML = names.map(n=>`<option value="${n}">`).join('');
}
loadPatientSuggestions();

function submitDoctorAssessment() {
    const name = document.getElementById('dpName').value.trim();
    if(!name) { alert('? Patient ka naam likhein!'); return; }
    if(!selectedSeverity) { alert('? Severity level select karein!'); return; }

    const record = {
        patientName: name,
        age: document.getElementById('dpAge').value,
        gender: document.getElementById('dpGender').value,
        doctorName: document.getElementById('dDoctorName').value || 'Doctor',
        visitDate: document.getElementById('dVisitDate').value,
        observation: document.getElementById('dObservation').value,
        symptoms: selectedSymptoms,
        severity: selectedSeverity,
        notes: document.getElementById('dNotes').value,
        category: document.getElementById('dCategory').value,
        followup: document.getElementById('dFollowup').value,
        recommendation: document.getElementById('dRecommendation').value,
        timestamp: new Date().toLocaleString()
    };
    let records = JSON.parse(localStorage.getItem('mindcare_doctor_assessments')||'[]');
    records.push(record);
    localStorage.setItem('mindcare_doctor_assessments', JSON.stringify(records));

    // Also push to prescriptions list used by patient dashboard / activity recommendations
    if(record.category) {
        let presc = JSON.parse(localStorage.getItem('mindcare_prescriptions')||'[]');
        presc.push({ doctorName: record.doctorName, patientName: record.patientName, category: record.category, activities: [], notes: record.recommendation, timestamp: record.timestamp });
        localStorage.setItem('mindcare_prescriptions', JSON.stringify(presc));
    }

    document.getElementById('formWrap').style.display = 'none';
    document.getElementById('successBox').style.display = 'block';
}

function resetDoctorForm() {
    document.getElementById('formWrap').style.display = 'block';
    document.getElementById('successBox').style.display = 'none';
    document.querySelectorAll('.custom-input').forEach(i=>i.value='');
    document.querySelectorAll('.symptom-chip').forEach(s=>s.classList.remove('selected'));
    document.querySelectorAll('.severity-opt').forEach(s=>{s.classList.remove('selected');s.classList.remove('s-mild','s-moderate','s-severe','s-critical');});
    selectedSymptoms = []; selectedSeverity = '';
    loadPatientSuggestions();
}

/* ==========================================================================
   Mouse glow (matches contact/relaxation page ambient effect)
   Self-contained — does not depend on or modify anything above.
   ========================================================================== */
(function initMouseGlow() {
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
})();