window.UI = (function () {

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === "class") {
          node.className = props[key];
        } else if (key === "html") {
          node.innerHTML = props[key];
        } else if (key === "text") {
          node.textContent = props[key];
        } else if (key.startsWith("on") && typeof props[key] === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), props[key]);
        } else if (key === "dataset") {
          Object.assign(node.dataset, props[key]);
        } else {
          node.setAttribute(key, props[key]);
        }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(child => {
        if (child == null) return;
        if (typeof child === "string") {
          node.appendChild(document.createTextNode(child));
        } else {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  function ensureToastContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = el("div", { class: "toast-container" });
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type) {
    const container = ensureToastContainer();
    const toast = el("div", {
      class: "toast" + (type ? " toast-" + type : ""),
      text: message
    });
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function triageLevel(patient) {
    if (!patient) return null;
    return patient.final_triage || patient.triage_score || patient.anomaly_triage || null;
  }

  function triageChip(level) {
    if (!level) {
      return el("span", { class: "chip chip-pending" }, [
        el("span", { class: "dot" }),
        "Not triaged"
      ]);
    }
    const cls = "chip-" + level.toLowerCase();
    const labels = {
      Red: "Red — Emergency",
      Yellow: "Yellow — Urgent",
      Green: "Green — Routine",
      Black: "Black — Expectant"
    };
    return el("span", { class: "chip " + cls }, [
      el("span", { class: "dot" }),
      labels[level] || level
    ]);
  }

  function statusChip(status) {
    if (status === "OPEN") {
      return el("span", { class: "chip chip-open" }, "Open");
    }
    if (status === "CLOSED") {
      return el("span", { class: "chip chip-closed" }, "Closed");
    }
    return el("span", { class: "chip" }, status || "—");
  }

  function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }

  function initials(patientId) {
    if (!patientId) return "?";
    const trimmed = String(patientId).trim();
    return trimmed.slice(0, 2).toUpperCase();
  }

  function loading(button, on) {
    if (!button) return;
    if (on) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Working...";
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  }

  function appbar(activePage) {
    const pages = {
      dashboard: { href: "/", label: "Dashboard" },
      all: { href: "/all-patients.html", label: "All Patients" }
    };
    const navLinks = ["dashboard", "all"].map(key => {
      const page = pages[key];
      const props = { href: page.href, text: page.label };
      if (key === activePage) props.class = "active";
      return el("a", props);
    });

    return el("header", { class: "appbar" }, [
      el("div", { class: "brand" }, [
        el("span", { class: "brand-mark", text: "M" }),
        el("span", { text: "MediTriage" })
      ]),
      el("nav", null, navLinks)
    ]);
  }

  return {
    el: el,
    showToast: showToast,
    triageLevel: triageLevel,
    triageChip: triageChip,
    statusChip: statusChip,
    formatDate: formatDate,
    initials: initials,
    loading: loading,
    appbar: appbar
  };

})();
