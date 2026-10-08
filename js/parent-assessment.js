const form = document.getElementById('parentAssessmentForm');
    const confirmation = document.getElementById('confirmation');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const payload = {
        parentName: document.getElementById('parentName').value.trim(),
        childName: document.getElementById('childName').value.trim(),
        childAge: document.getElementById('childAge').value.trim(),
        relationship: document.getElementById('relationship').value,
        contact: document.getElementById('contact').value.trim(),
        concern: document.getElementById('concern').value.trim(),
        support: document.getElementById('support').value.trim(),
        submittedAt: new Date().toISOString()
      };

      const records = JSON.parse(localStorage.getItem('mindcare_parent_assessments') || '[]');
      records.push(payload);
      localStorage.setItem('mindcare_parent_assessments', JSON.stringify(records));
      confirmation.classList.remove('d-none');
      confirmation.textContent = `Thank you, ${payload.parentName}. Your parent check-in has been saved.`;
      form.reset();
    });