// Auth gate
if (localStorage.getItem("isRegistered") !== "true") {
  window.location.href = "form.html";
}
 
// Mobile nav toggle
(function () {
  const nav = document.querySelector('[data-navbar]');
  const toggle = nav.querySelector('[data-nav-toggle]');
  const menu = nav.querySelector('[data-nav-menu]');
  toggle.addEventListener('click', () => {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
})();
 
// Assessment wizard
let currentStep = 1;
const totalSteps = 5;
const assessmentData = { stress: 5, anxiety: 5, sleepHours: '', sleepQuality: '', goals: [] };
 
function updateLevel(type) {
  const slider = document.getElementById(type + 'Slider');
  document.getElementById(type + 'Val').innerText = slider.value + ' / 10';
  assessmentData[type] = parseInt(slider.value, 10);
}
 
function selectPill(el, key, value) {
  el.parentElement.querySelectorAll('.mc-assessment__pill').forEach(p => p.classList.remove('is-selected'));
  el.classList.add('is-selected');
  assessmentData[key] = value;
}
 
function toggleGoal(el, val) {
  el.classList.toggle('is-selected');
  if (el.classList.contains('is-selected')) assessmentData.goals.push(val);
  else assessmentData.goals = assessmentData.goals.filter(g => g !== val);
}
 
function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById('pName').value.trim()) { alert('Please enter your name.'); return false; }
    if (!document.getElementById('pAge').value) { alert('Please enter your age.'); return false; }
  }
  if (step === 3) {
    if (!assessmentData.sleepHours) { alert('Please select your sleep hours.'); return false; }
    if (!assessmentData.sleepQuality) { alert('Please select your sleep quality.'); return false; }
  }
  return true;
}
 
function buildReview() {
  const goalsStr = assessmentData.goals.length ? assessmentData.goals.join(', ') : '—';
  document.getElementById('reviewBox').innerHTML = `
    <div><strong>Name:</strong> ${document.getElementById('pName').value}</div>
    <div><strong>Age:</strong> ${document.getElementById('pAge').value} &nbsp; <strong>Gender:</strong> ${document.getElementById('pGender').value || '—'}</div>
    <div><strong>Stress Level:</strong> ${assessmentData.stress}/10 &nbsp; <strong>Anxiety Level:</strong> ${assessmentData.anxiety}/10</div>
    <div><strong>Sleep:</strong> ${assessmentData.sleepHours} — ${assessmentData.sleepQuality}</div>
    <div><strong>Wellness Goals:</strong> ${goalsStr}</div>
    <div><strong>Notes:</strong> ${document.getElementById('pNotes').value || '—'}</div>
  `;
}
 
function changeStep(dir) {
  if (dir === 1 && !validateStep(currentStep)) return;
 
  if (currentStep === totalSteps && dir === 1) {
    const record = {
      name: document.getElementById('pName').value,
      age: document.getElementById('pAge').value,
      gender: document.getElementById('pGender').value,
      phone: document.getElementById('pPhone').value,
      occupation: document.getElementById('pOccupation').value,
      stress: assessmentData.stress,
      anxiety: assessmentData.anxiety,
      sleepHours: assessmentData.sleepHours,
      sleepQuality: assessmentData.sleepQuality,
      notes: document.getElementById('pNotes').value,
      goals: assessmentData.goals,
      timestamp: new Date().toLocaleString()
    };
    let records = JSON.parse(localStorage.getItem('mindcare_patient_assessments') || '[]');
    records.push(record);
    localStorage.setItem('mindcare_patient_assessments', JSON.stringify(records));
    localStorage.setItem('mindcare_last_patient_name', record.name);
 
    document.querySelectorAll('.mc-assessment__pane').forEach(s => s.classList.remove('is-active'));
    document.getElementById('stepSuccess').classList.add('is-active');
    document.getElementById('navButtons').style.display = 'none';
    document.querySelector('.mc-assessment__steps').style.display = 'none';
    return;
  }
 
  document.getElementById('step' + currentStep).classList.remove('is-active');
  document.getElementById('dot' + currentStep).classList.remove('is-active');
  document.getElementById('dot' + currentStep).classList.add('is-done');
 
  currentStep += dir;
  if (currentStep < 1) currentStep = 1;
 
  document.getElementById('step' + currentStep).classList.add('is-active');
  document.getElementById('dot' + currentStep).classList.remove('is-done');
  document.getElementById('dot' + currentStep).classList.add('is-active');
 
  document.getElementById('prevBtn').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  document.getElementById('nextBtn').innerText = currentStep === totalSteps ? 'Submit Assessment ✓' : 'Next →';
 
  if (currentStep === totalSteps) buildReview();
}