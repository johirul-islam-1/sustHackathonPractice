const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.getElementById("appbar-mount").appendChild(
  UI.appbar("dashboard")
);

let currentPatient = null;

function setQuote(elementId, text) {
  const el = document.getElementById(elementId);
  if (!text || !String(text).trim()) {
    el.classList.add("empty");
    el.textContent = getEmptyCopy(elementId);
    return;
  }
  el.classList.remove("empty");
  el.textContent = text;
}

function getEmptyCopy(elementId) {
  if (elementId === "voiceResult") return "No transcript yet.";
  if (elementId === "ocrResult") return "No document uploaded yet.";
  return "—";
}

function renderHeader(patient) {
  document.getElementById("patientId").textContent = patient.patient_id || "Unnamed";
  document.getElementById("avatar").textContent = UI.initials(patient.patient_id);

  const age = patient.age != null ? patient.age + " years" : "Age unknown";
  const gender = patient.gender || "—";
  document.getElementById("patientMeta").textContent =
    age + " · " + gender + " · Updated " + UI.formatDate(patient.updatedAt);

  const chips = document.getElementById("patientChips");
  chips.innerHTML = "";
  chips.appendChild(UI.statusChip(patient.status));
  chips.appendChild(UI.triageChip(UI.triageLevel(patient)));
}

function renderLatestVitals(patient) {
  const container = document.getElementById("latestVitals");
  container.innerHTML = "";
  const list = Array.isArray(patient.vitals) ? patient.vitals : [];
  const last = list.length ? list[list.length - 1] : null;

  const fields = [
    { key: "systolic_bp", label: "Systolic BP", unit: "mmHg" },
    { key: "diastolic_bp", label: "Diastolic BP", unit: "mmHg" },
    { key: "heart_rate", label: "Heart rate", unit: "bpm" },
    { key: "temperature", label: "Temperature", unit: "°C" },
    { key: "spo2", label: "SpO₂", unit: "%" },
    { key: "blood_glucose", label: "Glucose", unit: "mg/dL" }
  ];

  fields.forEach(f => {
    const value = last && last[f.key] != null ? last[f.key] : "—";
    const card = UI.el("div", { class: "vital-card" }, [
      UI.el("div", { class: "label", text: f.label }),
      UI.el("div", null, [
        UI.el("span", { class: "value", text: String(value) }),
        UI.el("span", { class: "unit", text: last ? " " + f.unit : "" })
      ])
    ]);
    container.appendChild(card);
  });
}

function clearTriageResult() {
  document.getElementById("triageResult").innerHTML = "";
}

function renderTriageResult(patient, result) {
  const root = document.getElementById("triageResult");
  root.innerHTML = "";

  const level = UI.triageLevel(patient);
  const conf = patient.confidence;

  if (!level && !result) {
    root.appendChild(
      UI.el("div", { class: "empty-state" }, [
        UI.el("div", { class: "icon", text: "🤖" }),
        UI.el("div", { text: "Triage not run yet. Click \"Run AI Triage\" above." })
      ])
    );
    return;
  }

  if (level === "Red") {
    root.appendChild(
      UI.el("div", { class: "urgent-banner" }, "🚨 EMERGENCY — attend to this patient immediately")
    );
  }

  if (level) {
    const hero = UI.el("div", { class: "triage-hero" }, [
      UI.el("div", null, [
        UI.el("div", { class: "triage-label", text: "Triage level" }),
        UI.el("div", { class: "triage-name", text: level })
      ]),
      UI.el("div", { class: "confidence" }, [
        UI.el("span", { text: "Confidence" }),
        UI.el("strong", { text: conf != null ? conf + "%" : "—" })
      ])
    ]);
    root.appendChild(hero);
  }

  if (Array.isArray(patient.safety_flags) && patient.safety_flags.length) {
    const banner = UI.el("div", { class: "safety-banner" }, [
      UI.el("span", { class: "label", text: "⚠ Safety flags:" }),
      " " + patient.safety_flags.join(" · ")
    ]);
    root.appendChild(banner);
  }

  const reasoning = patient.clinical_reasoning || {};
  if (Array.isArray(reasoning.supporting_findings) && reasoning.supporting_findings.length) {
    root.appendChild(UI.el("div", { class: "section-title", text: "Supporting findings" }));
    const ul = UI.el("ul", { class: "findings-list" });
    reasoning.supporting_findings.forEach(f => ul.appendChild(UI.el("li", { text: f })));
    root.appendChild(ul);
  }

  if (Array.isArray(patient.differential_diagnoses) && patient.differential_diagnoses.length) {
    root.appendChild(UI.el("div", { class: "section-title", text: "Possible diagnoses" }));
    patient.differential_diagnoses.slice(0, 5).forEach(d => {
      const confText = d.confidence != null ? d.confidence + "% confidence" : "";
      root.appendChild(
        UI.el("div", { class: "diagnosis" }, [
          UI.el("div", { class: "name", text: d.condition || "—" }),
          UI.el("div", { class: "conf", text: confText })
        ])
      );
    });
  }

  if (Array.isArray(patient.first_aid_steps) && patient.first_aid_steps.length) {
    root.appendChild(UI.el("div", { class: "section-title", text: "First aid steps" }));
    const ol = UI.el("ol", { class: "steps-list" });
    patient.first_aid_steps.forEach(s => ol.appendChild(UI.el("li", { text: s })));
    root.appendChild(ol);
  }

  const referral = patient.referral || {};
  if (referral.required || referral.urgency && referral.urgency !== "None") {
    const card = UI.el("div", { class: "referral-card" }, [
      UI.el("div", { class: "urgency", text: "Referral · " + (referral.urgency || "Required") }),
      UI.el("div", null, [
        UI.el("strong", { text: "Specialist: " }),
        " " + (referral.specialist || "—")
      ]),
      referral.reason
        ? UI.el("div", { style: "margin-top:6px;", text: referral.reason })
        : null
    ]);
    root.appendChild(card);
  }

  if (patient.disclaimer) {
    root.appendChild(UI.el("div", { class: "disclaimer", text: patient.disclaimer }));
  }

  if (result && (result.success === false || result.error)) {
    UI.showToast(result.error || "Triage failed", "error");
  } else if (level) {
    UI.showToast("Triage updated: " + level, "success");
  }
}

function updateCloseButton() {
  const helper = document.getElementById("closeHelper");
  const level = UI.triageLevel(currentPatient || {});
  if (!level) {
    helper.textContent = "Run AI triage before closing the case.";
  } else {
    helper.textContent = "Triage level: " + level + ".";
  }
}

async function loadPatient() {
  const response = await fetch("/patients/" + id);
  if (!response.ok) {
    UI.showToast("Could not load patient", "error");
    return;
  }
  currentPatient = await response.json();
  renderHeader(currentPatient);
  setQuote("voiceResult", currentPatient.patient_voice);
  setQuote("ocrResult", currentPatient.ocr_report);
  renderLatestVitals(currentPatient);
  renderTriageResult(currentPatient, null);
  updateCloseButton();
}

function setupVoiceForm() {
  const form = document.getElementById("voiceForm");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    UI.loading(button, true);

    const formData = new FormData(form);
    formData.append("patient_id", id);

    try {
      const response = await fetch("/voice", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        UI.showToast(result.error || "Voice upload failed", "error");
      } else {
        UI.showToast("Audio transcribed", "success");
      }
      await loadPatient();
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

function setupOcrForm() {
  const form = document.getElementById("ocrForm");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    UI.loading(button, true);

    const formData = new FormData(form);
    formData.append("patient_id", id);

    try {
      const response = await fetch("/ocr", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        UI.showToast(result.error || "OCR failed", "error");
      } else {
        UI.showToast("Document read", "success");
      }
      await loadPatient();
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

function setupVitalsForm() {
  const form = document.getElementById("vitalsForm");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    UI.loading(button, true);

    const formData = new FormData(form);
    const vitals = { patient_id: id };
    formData.forEach((value, key) => {
      if (value !== "") vitals[key] = Number(value);
    });

    try {
      const response = await fetch("/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitals)
      });
      const result = await response.json();
      if (!response.ok) {
        UI.showToast(result.error || "Could not save vitals", "error");
      } else {
        UI.showToast("Vitals saved", "success");
      }
      await loadPatient();
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

function setupTriageButton() {
  const button = document.getElementById("triageButton");
  button.addEventListener("click", async () => {
    UI.loading(button, true);
    try {
      const response = await fetch("/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: id })
      });
      const result = await response.json();
      await loadPatient();
      renderTriageResult(currentPatient, result);
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

function setupCloseButton() {
  const button = document.getElementById("closeButton");
  button.addEventListener("click", async () => {
    if (!currentPatient || !UI.triageLevel(currentPatient)) {
      UI.showToast("Run AI triage first", "error");
      return;
    }
    if (!confirm("Close this patient case? This will remove them from the active queue.")) {
      return;
    }
    UI.loading(button, true);
    try {
      const response = await fetch("/patients/" + id + "/close", { method: "PATCH" });
      if (!response.ok) {
        UI.showToast("Could not close patient", "error");
        return;
      }
      UI.showToast("Patient case closed", "success");
      await loadPatient();
      updateCloseButton();
    } catch (error) {
      UI.showToast("Network error: " + error.message, "error");
    } finally {
      UI.loading(button, false);
    }
  });
}

setupVoiceForm();
setupOcrForm();
setupVitalsForm();
setupTriageButton();
setupCloseButton();
loadPatient();
