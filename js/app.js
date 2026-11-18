/* =========================================================
   AD Lab Hospital — page behaviour
   No backend / cloud DB: appointment requests are kept in
   localStorage on this device only.
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "adlab.appointments";
  var form = document.getElementById("appointmentForm");
  var alertBox = document.getElementById("formAlert");
  var dateInput = document.getElementById("date");
  var timeInput = document.getElementById("time");

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Helpers ---------- */
  function todayISO() {
    var now = new Date();
    // Use local date, not UTC, so "today" matches the user's calendar.
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function readAppointments() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveAppointment(record) {
    var all = readAppointments();
    all.push(record);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (err) {
      return false;
    }
  }

  function showAlert(type, message) {
    alertBox.innerHTML =
      '<div class="alert alert-' +
      type +
      ' d-flex align-items-start gap-2 mb-0" role="alert">' +
      '<i class="bi bi-' +
      (type === "success" ? "check-circle" : "exclamation-triangle") +
      ' mt-1"></i><div>' +
      message +
      "</div></div>";
  }

  /* ---------- Date / time constraints ---------- */
  dateInput.min = todayISO();
  dateInput.value = todayISO();

  /* ---------- Doctor cards → prefill form ---------- */
  document.querySelectorAll(".book-doctor").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var doctor = link.getAttribute("data-doctor") || "";
      var doctorField = document.getElementById("doctor");
      var departmentField = document.getElementById("department");

      Array.prototype.forEach.call(doctorField.options, function (option) {
        if (option.value === doctor) doctorField.value = doctor;
      });

      var deptByDoctor = {
        "Dr. Ananya Rao": "Cardiology",
        "Dr. Sameer Menon": "Orthopaedics",
        "Dr. Priya Kapoor": "Pediatrics",
        "Dr. Rahul Verma": "General Medicine"
      };
      if (deptByDoctor[doctor]) departmentField.value = deptByDoctor[doctor];

      document.getElementById("appointment").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        document.getElementById("fullName").focus({ preventScroll: true });
      }, 450);
    });
  });

  /* ---------- Bootstrap validation + submit ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Guard: date cannot be in the past even if the browser allows it.
    if (dateInput.value && dateInput.value < todayISO()) {
      dateInput.setCustomValidity("Please choose today or a future date.");
    } else {
      dateInput.setCustomValidity("");
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      var firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      showAlert("danger", "Please correct the highlighted fields and try again.");
      return;
    }

    // Prevent the same doctor/date/time being booked twice on this device.
    var data = new FormData(form);
    var record = {
      id: "ADL-" + Date.now().toString(36).toUpperCase(),
      name: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      department: String(data.get("department") || ""),
      doctor: String(data.get("doctor") || "Any available doctor"),
      date: String(data.get("date") || ""),
      time: String(data.get("time") || ""),
      message: String(data.get("message") || "").trim(),
      createdAt: new Date().toISOString(),
      status: "requested"
    };

    var clash = readAppointments().some(function (item) {
      return item.doctor === record.doctor && item.date === record.date && item.time === record.time;
    });

    if (clash) {
      showAlert(
        "warning",
        "That doctor already has a request at this time. Please pick another slot or choose <em>Any available doctor</em>."
      );
      timeInput.focus();
      return;
    }

    var saved = saveAppointment(record);

    if (saved) {
      showAlert(
        "success",
        "<strong>Thank you, " +
          escapeHtml(record.name) +
          ".</strong><br />Your request <code>" +
          record.id +
          "</code> for <strong>" +
          escapeHtml(record.doctor) +
          "</strong> on <strong>" +
          record.date +
          " at " +
          record.time +
          "</strong> has been saved. Our team will contact you on " +
          escapeHtml(record.phone) +
          " to confirm."
      );
      form.reset();
      form.classList.remove("was-validated");
      dateInput.value = todayISO();

      var toastEl = document.getElementById("apptToast");
      if (toastEl && window.bootstrap) {
        new bootstrap.Toast(toastEl, { delay: 3500 }).show();
      }
    } else {
      showAlert(
        "danger",
        "We could not save your request on this device (storage may be full or blocked). Please call us instead."
      );
    }
  });

  // Clear the custom date message as soon as the user changes it.
  dateInput.addEventListener("input", function () {
    dateInput.setCustomValidity("");
  });

  // Reset should also clear validation styling and alerts.
  form.addEventListener("reset", function () {
    form.classList.remove("was-validated");
    alertBox.innerHTML = "";
    setTimeout(function () {
      dateInput.value = todayISO();
    }, 0);
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- Collapse mobile menu after tapping a link ---------- */
  var navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (navMenu.classList.contains("show") && window.bootstrap) {
          bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
        }
      });
    });
  }
})();
