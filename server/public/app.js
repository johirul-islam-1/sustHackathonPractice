document.getElementById("appbar-mount").appendChild(
  UI.appbar("dashboard")
);

const patientsDiv = document.getElementById("patients");

function renderEmpty(message) {
  patientsDiv.innerHTML = "";
  const empty = UI.el("div", { class: "empty-state" }, [
    UI.el("div", { class: "icon", text: "📋" }),
    UI.el("div", { text: message })
  ]);
  patientsDiv.appendChild(empty);
}

function renderError(message) {
  patientsDiv.innerHTML = "";
  patientsDiv.appendChild(
    UI.el("div", { class: "empty-state" }, [
      UI.el("div", { class: "icon", text: "⚠️" }),
      UI.el("div", { text: message })
    ])
  );
}

const triageOrder = { Red: 4, Yellow: 3, Green: 2, Black: 1, Pending: 0 };

function triageKey(patient) {
  const level = UI.triageLevel(patient);
  return triageOrder[level] != null ? triageOrder[level] : 0;
}

function renderPatientRow(patient) {
  const triage = UI.triageChip(UI.triageLevel(patient));
  const status = UI.statusChip(patient.status);

  const meta = UI.el("div", { class: "meta" }, [
    (patient.age != null ? patient.age + " yrs" : "Age unknown"),
    " · ",
    (patient.gender || "—")
  ]);

  const left = UI.el("div", null, [
    UI.el("div", { class: "pid", text: patient.patient_id || "Unnamed" }),
    meta
  ]);

  const right = UI.el("div", { class: "right" }, [triage, status]);

  const row = UI.el("a", {
    class: "patient-row",
    href: "/patient.html?id=" + patient._id
  }, [
    UI.el("div", { class: "avatar", text: UI.initials(patient.patient_id) }),
    left,
    right
  ]);

  return row;
}

async function loadPatients() {
  try {
    const response = await fetch("/patients/open");
    if (!response.ok) {
      renderError("Could not load patients (" + response.status + ").");
      return;
    }
    const patients = await response.json();

    patientsDiv.innerHTML = "";

    if (!patients.length) {
      renderEmpty("No open patients. Register one to begin.");
      return;
    }

    patients
      .slice()
      .sort((a, b) => triageKey(b) - triageKey(a))
      .forEach(p => patientsDiv.appendChild(renderPatientRow(p)));
  } catch (error) {
    renderError("Network error: " + error.message);
  }
}

function setupCreateForm() {
  const form = document.getElementById("createForm");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    UI.loading(button, true);

    const formData = new FormData(form);
    const payload = {
      patient_id: formData.get("patient_id"),
      age: Number(formData.get("age")),
      gender: formData.get("gender")
    };

    try {
      const response = await fetch("/patients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        UI.showToast(data.error || "Could not create patient", "error");
        return;
      }
      form.reset();
      UI.showToast("Patient registered", "success");
      await loadPatients();
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

setupCreateForm();
loadPatients();
