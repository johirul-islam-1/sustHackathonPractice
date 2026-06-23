const params =
  new URLSearchParams(
    window.location.search
  );

const id =
  params.get("id");

function showResult(elementId, data) {

  document
    .getElementById(elementId)
    .textContent =
      JSON.stringify(
        data,
        null,
        2
      );
}

async function loadPatient() {

  const response =
    await fetch(
      `/patients/${id}`
    );

  const patient =
    await response.json();

  document
    .getElementById("json")
    .textContent =
      JSON.stringify(
        patient,
        null,
        2
      );
}

function setupVoiceForm() {

  const form =
    document.getElementById("voiceForm");

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const formData =
      new FormData(form);

    formData.append(
      "patient_id",
      id
    );

    const response =
      await fetch("/voice", {
        method: "POST",
        body: formData
      });

    const result =
      await response.json();

    showResult(
      "voiceResult",
      result
    );

    await loadPatient();

  });
}

function setupOcrForm() {

  const form =
    document.getElementById("ocrForm");

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const formData =
      new FormData(form);

    formData.append(
      "patient_id",
      id
    );

    const response =
      await fetch("/ocr", {
        method: "POST",
        body: formData
      });

    const result =
      await response.json();

    showResult(
      "ocrResult",
      result
    );

    await loadPatient();

  });
}

function setupVitalsForm() {

  const form =
    document.getElementById("vitalsForm");

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const formData =
      new FormData(form);

    const vitals = {
      patient_id:
        id
    };

    formData.forEach((value, key) => {

      if (value !== "") {
        vitals[key] =
          Number(value);
      }

    });

    const response =
      await fetch("/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          vitals
        )
      });

    const result =
      await response.json();

    showResult(
      "vitalsResult",
      result
    );

    await loadPatient();

  });
}

function setupTriageButton() {

  const button =
    document.getElementById("triageButton");

  button.addEventListener("click", async () => {

    const response =
      await fetch("/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patient_id:
            id
        })
      });

    const result =
      await response.json();

    showResult(
      "triageResult",
      result
    );

    await loadPatient();

  });
}

setupVoiceForm();
setupOcrForm();
setupVitalsForm();
setupTriageButton();
loadPatient();
