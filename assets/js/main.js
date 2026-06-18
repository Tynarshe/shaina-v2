const menuButton = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

function setMenu(open) {
  if (!menuButton || !mobilePanel) return;
  menuButton.setAttribute("aria-expanded", String(open));
  mobilePanel.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(open);
  });

  mobilePanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

const currentFile = (() => {
  const last = window.location.pathname.split("/").filter(Boolean).pop();
  return last && last.includes(".") ? last : "index.html";
})();

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  const href = link.getAttribute("href") || "";
  const target = href.split("#")[0] || "index.html";
  if (target === currentFile) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelectorAll("[data-service-card]").forEach((card) => {
      const categories = (card.dataset.serviceCard || "").split(" ");
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item[open]").forEach((openItem) => {
      if (openItem !== item) openItem.open = false;
    });
  });
});

function collectFormBody(form) {
  const formData = new FormData(form);
  const rows = [];
  const seen = new Set();

  for (const [key, value] of formData.entries()) {
    if (seen.has(key)) continue;
    const values = formData.getAll(key).filter(Boolean);
    if (!values.length) continue;
    seen.add(key);
    const label = key.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    rows.push(`${label}: ${values.join(", ")}`);
  }

  return encodeURIComponent(rows.join("\n"));
}

function setFormMessage(message, type, text) {
  if (!message) return;
  message.textContent = text;
  message.className = `form-message ${type} is-visible`;
}

function findMissingRequiredField(form) {
  return Array.from(form.querySelectorAll("input[required], select[required], textarea[required]")).find((field) => {
    if (field.type === "checkbox" || field.type === "radio") return false;
    return !String(field.value || "").trim();
  });
}

function findInvalidTypedField(form) {
  const typedFields = Array.from(form.querySelectorAll("input[type='email'], input[type='url']"));
  return typedFields.find((field) => {
    const value = String(field.value || "").trim();
    if (!value) return false;
    if (field.type === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (field.type === "url") return !/^https?:\/\/.+/i.test(value);
    return false;
  });
}

document.querySelectorAll("[data-enhanced-form]").forEach((form) => {
  const message = form.querySelector("[data-form-message]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));

    const missingRequired = findMissingRequiredField(form);
    if (missingRequired) {
      setFormMessage(message, "error", "Please complete the highlighted fields before sending.");
      missingRequired.setAttribute("aria-invalid", "true");
      missingRequired.focus();
      return;
    }

    const invalidTyped = findInvalidTypedField(form);
    if (invalidTyped) {
      setFormMessage(message, "error", "Please enter a valid email address or link before sending.");
      invalidTyped.setAttribute("aria-invalid", "true");
      invalidTyped.focus();
      return;
    }

    const missingGroup = Array.from(form.querySelectorAll("[data-required-checkbox]")).find((group) => {
      return !group.querySelector("input[type='checkbox']:checked");
    });

    if (missingGroup) {
      setFormMessage(message, "error", "Please choose at least one relevant option before sending.");
      const firstCheckbox = missingGroup.querySelector("input[type='checkbox']");
      if (firstCheckbox) firstCheckbox.focus();
      return;
    }

    const to = form.dataset.mailto || "enquiries@shaina.org.uk";
    const subject = encodeURIComponent(form.dataset.subject || "Shaina Cleaning Services enquiry");
    const body = collectFormBody(form);

    setFormMessage(message, "success", "Your message is ready to send. We will respond within 24 hours.");

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    form.reset();
  });
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
