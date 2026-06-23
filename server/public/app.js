async function loadPatients() {

  const response =
    await fetch(
      "http://localhost:3000/patients/open"
    );

  const patients =
    await response.json();

  const div =
    document.getElementById(
      "patients"
    );

  div.innerHTML = "";

  patients.forEach(p => {

    div.innerHTML += `
      <div>
        <a href="/patient.html?id=${p._id}">
          ${p.patient_id}
          -
          ${p.final_triage || "Pending"}
        </a>
      </div>
    `;

  });

}

function addCreatePatientForm() {

  const heading =
    document.querySelector("h1");

  const form =
    document.createElement("form");

  form.innerHTML = `
    <h2>Create Patient</h2>
    <input name="patient_id" placeholder="Patient ID" required />
    <input name="age" type="number" placeholder="Age" required />
    <select name="gender" required>
      <option value="">Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
    <button type="submit">Create Patient</button>
  `;

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const formData =
      new FormData(form);

    await fetch("http://localhost:3000/patients/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patient_id:
          formData.get("patient_id"),
        age:
          Number(formData.get("age")),
        gender:
          formData.get("gender")
      })
    });

    form.reset();
    loadPatients();

  });

  heading.after(form);
}

addCreatePatientForm();
loadPatients();
