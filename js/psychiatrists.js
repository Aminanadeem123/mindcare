const modal = document.getElementById("appointmentModal");
    const confirmModal = document.getElementById("confirmModal");
    const modalTitle = document.getElementById("modalTitle");
    const buttons = document.querySelectorAll(".btn-appointment");
    const form = document.getElementById("appointmentForm");

    // Book Appointment -> open modal with doctor name
    buttons.forEach(function(button) {
        button.addEventListener("click", function () {
            const card = this.closest('.doctor-card');
            let docName = "Doctor";
            const nameElement = card.querySelector('.doc-name');
            if (nameElement) {
                docName = nameElement.innerText;
            }
            modalTitle.innerText = "Book Appointment with " + docName;
            removeToast();
            modal.classList.add("is-open");
        });
    });

    function closeModal() {
        modal.classList.remove("is-open");
        removeToast();
    }

    function closeConfirm() {
        confirmModal.classList.remove("is-open");
    }
    // make closeConfirm available globally for the onclick in HTML
    window.closeConfirm = closeConfirm;

    // Click outside modal to close
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === confirmModal) {
            closeConfirm();
        }
    };

    function removeToast() {
        const existing = document.querySelector(".mc-toast");
        if (existing) existing.remove();
    }

    function showToast(message, type) {
        removeToast();
        const toast = document.createElement("div");
        toast.className = "mc-toast mc-toast--" + (type || "success");
        toast.textContent = message;
        const modalEl = modal.querySelector(".mc-modal");
        modalEl.prepend(toast);
    }

    // Form validation + reset
    function submitForm(event) {
        event.preventDefault();

        const pName = document.getElementById("pName").value.trim();
        const pPhone = document.getElementById("pPhone").value.trim();
        const pGender = document.getElementById("pGender").value;
        const pAge = document.getElementById("pAge").value;
        const pTopic = document.getElementById("pTopic").value;
        const pPayChecked = document.getElementById("pPay").checked;

        const nameRegex = /^[A-Za-z\s]+$/;
        const phoneRegex = /^[0-9]{11}$/;

        if (!nameRegex.test(pName)) {
            showToast("Please enter a valid name (letters only, no numbers).", "error");
            return;
        }

        if (!phoneRegex.test(pPhone)) {
            showToast("Please enter a valid 11-digit WhatsApp number (e.g. 03001234567).", "error");
            return;
        }

        if (!pGender || !pAge || !pTopic) {
            showToast("Please select gender, age group and focus topic.", "error");
            return;
        }

        if (!pPayChecked) {
            showToast("Please confirm that you will pay the consultation fee.", "error");
            return;
        }

        // Success: close form modal, open confirmation popup
        closeModal();
        form.reset();
        confirmModal.classList.add("is-open");
    }