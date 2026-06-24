document.getElementById("appbar-mount").appendChild(
  UI.appbar("all")
);

const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const triageFilter = document.getElementById("triageFilter");
const resultsDiv = document.getElementById("results");

let debounceTimer;
let lastRequest = 0;

function debounce(fn, delay) {
  return function () {
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn.apply(null, args), delay);
  };
}

function renderEmpty(message) {
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(
    UI.el("div", { class: "empty-state" }, [
      UI.el("div", { class: "icon", text: "🔍" }),
      UI.el("div", { text: message })
    ])
  );
}

function renderLoading() {
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(
    UI.el("div", { class: "empty-state" }, [
      UI.el("div", { class: "icon", text: "⏳" }),
      UI.el("div", { text: "Loading…" })
    ])
  );
}

function renderError(message) {
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(
    UI.el("div", { class: "empty-state" }, [
      UI.el("div", { class: "icon", text: "⚠️" }),
      UI.el("div", { text: message })
    ])
  );
}

function triageKey(patient) {
  const level = UI.triageLevel(patient);
  const order = { Red: 4, Yellow: 3, Green: 2, Black: 1 };
  return order[level] != null ? order[level] : 0;
}

function renderRow(patient) {
  const meta = UI.el("div", { class: "meta" }, [
    (patient.age != null ? patient.age + " yrs" : "Age unknown"),
    " · ",
    (patient.gender || "—"),
    " · ",
    UI.formatDate(patient.updatedAt)
  ]);

  const left = UI.el("div", null, [
    UI.el("div", { class: "pid", text: patient.patient_id || "Unnamed" }),
    meta
  ]);

  const right = UI.el("div", { class: "right" }, [
    UI.triageChip(UI.triageLevel(patient)),
    UI.statusChip(patient.status)
  ]);

  return UI.el("a", {
    class: "patient-row",
    href: "/patient.html?id=" + patient._id
  }, [
    UI.el("div", { class: "avatar", text: UI.initials(patient.patient_id) }),
    left,
    right
  ]);
}

function renderPatients(patients) {
  resultsDiv.innerHTML = "";
  if (!patients.length) {
    renderEmpty("No patients match your search.");
    return;
  }
  patients
    .slice()
    .sort((a, b) => triageKey(b) - triageKey(a))
    .forEach(p => resultsDiv.appendChild(renderRow(p)));
}

async function loadAll() {
  renderLoading();
  try {
    const response = await fetch("/patients/all");
    if (!response.ok) {
      renderError("Could not load patients (" + response.status + ").");
      return;
    }
    const patients = await response.json();
    renderPatients(patients);
  } catch (error) {
    renderError("Network error: " + error.message);
  }
}

async function searchPatients() {
  const requestId = ++lastRequest;
  const params = new URLSearchParams();

  const q = searchInput.value.trim();
  if (q) params.set("q", q);
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (triageFilter.value) params.set("triage", triageFilter.value);

  renderLoading();
  try {
    const response = await fetch("/patients/search?" + params.toString());
    const data = await response.json();
    if (requestId !== lastRequest) return;
    if (!response.ok || !data.success) {
      renderError((data && data.error) || "Search failed");
      return;
    }
    renderPatients(data.results || []);
  } catch (error) {
    if (requestId !== lastRequest) return;
    renderError("Network error: " + error.message);
  }
}

const debouncedSearch = debounce(searchPatients, 300);

searchInput.addEventListener("input", debouncedSearch);
statusFilter.addEventListener("change", searchPatients);
triageFilter.addEventListener("change", searchPatients);

loadAll();
