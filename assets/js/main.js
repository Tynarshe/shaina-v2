const root = document.documentElement;
const menuButton = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector("[data-scroll-progress]");
const plannerPanel = document.querySelector("[data-planner-panel]");
const plannerOverlay = document.querySelector("[data-planner-overlay]");
let lastPlannerTrigger = null;

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
    if (event.key === "Escape") {
      setMenu(false);
      setPlanner(false);
    }
  });
}

function setPlanner(open, trigger = null) {
  if (!plannerPanel || !plannerOverlay) return;
  if (open) {
    lastPlannerTrigger = trigger;
    plannerPanel.hidden = false;
    plannerOverlay.hidden = false;
    document.body.classList.add("planner-open");
    plannerPanel.querySelector("[data-planner-close]")?.focus();
    return;
  }

  plannerPanel.hidden = true;
  plannerOverlay.hidden = true;
  document.body.classList.remove("planner-open");
  if (lastPlannerTrigger) lastPlannerTrigger.focus();
}

document.querySelectorAll("[data-planner-open]").forEach((button) => {
  button.addEventListener("click", () => setPlanner(true, button));
});

document.querySelectorAll("[data-planner-close]").forEach((button) => {
  button.addEventListener("click", () => setPlanner(false));
});

if (plannerOverlay) {
  plannerOverlay.addEventListener("click", () => setPlanner(false));
}

if (!menuButton) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPlanner(false);
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

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("shaina-theme", theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", theme === "dark" ? "Use light mode" : "Use dark mode");
    button.setAttribute("aria-pressed", String(theme === "dark"));
  });
}

const savedTheme = localStorage.getItem("shaina-theme");
const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (preferredDark ? "dark" : "light"));

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
});

const rotatingWord = document.querySelector("[data-rotating-word]");
if (rotatingWord) {
  const words = ["homes", "offices", "landlords", "shops", "families"];
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % words.length;
    rotatingWord.textContent = words[index];
  }, 1800);
}

const serviceFilterState = {
  category: "all",
  query: "",
};

function applyServiceFilters() {
  const cards = Array.from(document.querySelectorAll("[data-service-card]"));
  const emptyState = document.querySelector("[data-services-empty]");
  const count = document.querySelector("[data-service-count]");
  let visible = 0;

  cards.forEach((card) => {
    const categories = (card.dataset.serviceCard || "").split(" ");
    const text = card.textContent.toLowerCase();
    const matchesCategory = serviceFilterState.category === "all" || categories.includes(serviceFilterState.category);
    const matchesQuery = !serviceFilterState.query || text.includes(serviceFilterState.query);
    const shouldShow = matchesCategory && matchesQuery;
    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (emptyState) emptyState.classList.toggle("is-visible", visible === 0);
  if (count) count.textContent = `${visible} service${visible === 1 ? "" : "s"} shown`;
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    serviceFilterState.category = button.dataset.filter || "all";
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    applyServiceFilters();
  });
});

document.querySelectorAll("[data-service-search]").forEach((input) => {
  input.addEventListener("input", () => {
    serviceFilterState.query = input.value.trim().toLowerCase();
    applyServiceFilters();
  });
});

applyServiceFilters();

function applyFaqSearch(input) {
  const query = input.value.trim().toLowerCase();
  const items = Array.from(document.querySelectorAll(".faq-item"));
  const count = document.querySelector("[data-faq-count]");
  const emptyState = document.querySelector("[data-faq-empty]");
  let visible = 0;

  items.forEach((item) => {
    const matches = !query || item.textContent.toLowerCase().includes(query);
    item.hidden = !matches;
    if (matches) visible += 1;
  });

  if (count) count.textContent = `${visible} answer${visible === 1 ? "" : "s"} shown`;
  if (emptyState) emptyState.classList.toggle("is-visible", visible === 0);
}

document.querySelectorAll("[data-faq-search]").forEach((input) => {
  input.addEventListener("input", () => applyFaqSearch(input));
  applyFaqSearch(input);
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item[open]").forEach((openItem) => {
      if (openItem !== item) openItem.open = false;
    });
  });
});

const plannerRules = {
  domestic: { label: "Domestic reset", base: 2, team: 1, extras: ["Kitchen focus", "Bathrooms", "High-touch areas"] },
  commercial: { label: "Commercial routine", base: 3, team: 2, extras: ["Reception areas", "Washrooms", "Shared spaces"] },
  deep: { label: "Deep clean sprint", base: 4, team: 2, extras: ["Inside cupboards", "Detail edges", "Limescale reset"] },
  carpet: { label: "Carpet refresh", base: 2, team: 1, extras: ["Pre-treatment", "Stain focus", "Drying guidance"] },
  window: { label: "Window clarity", base: 1.5, team: 1, extras: ["Frames", "Sills", "Streak-free glass"] },
};

function updatePlanner(planner) {
  const service = planner.querySelector("[data-plan-service]")?.value || "domestic";
  const property = planner.querySelector("[data-plan-property]")?.value || "home";
  const roomsInput = planner.querySelector("[data-plan-rooms]");
  const frequency = planner.querySelector("[data-plan-frequency]")?.value || "one-off";
  const rooms = Number(roomsInput?.value || 4);
  const rule = plannerRules[service] || plannerRules.domestic;
  const frequencyDiscount = frequency === "weekly" ? 0.78 : frequency === "fortnightly" ? 0.88 : frequency === "monthly" ? 0.94 : 1;
  const propertyBoost = property === "office" ? 1.25 : property === "commercial" ? 1.4 : 1;
  const hours = Math.max(1.5, (rule.base + rooms * 0.45) * propertyBoost * frequencyDiscount);
  const team = Math.max(rule.team, hours > 5 ? 2 : 1);
  const output = planner.querySelector("[data-plan-output]");
  const roomOutput = planner.querySelector("[data-plan-room-output]");
  const tags = planner.querySelector("[data-plan-tags]");

  if (roomOutput) roomOutput.textContent = rooms;
  if (output) {
    output.querySelector("[data-plan-title]").textContent = rule.label;
    output.querySelector("[data-plan-time]").textContent = `${hours.toFixed(hours >= 3 ? 0 : 1)} hour visit`;
    output.querySelector("[data-plan-team]").textContent = `${team} cleaner${team === 1 ? "" : "s"} recommended`;
  }
  if (tags) {
    tags.innerHTML = rule.extras.map((extra) => `<span class="planner-tag">${extra}</span>`).join("");
  }
}

document.querySelectorAll("[data-estimator]").forEach((planner) => {
  planner.querySelectorAll("select, input").forEach((control) => {
    control.addEventListener("input", () => updatePlanner(planner));
    control.addEventListener("change", () => updatePlanner(planner));
  });
  updatePlanner(planner);
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

const counters = document.querySelectorAll("[data-count-to]");
if ("IntersectionObserver" in window && counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const target = Number(item.dataset.countTo || 0);
        const decimals = Number(item.dataset.countDecimals || 0);
        const suffix = item.dataset.countSuffix || "";
        const prefix = item.dataset.countPrefix || "";
        const duration = 900;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          item.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        counterObserver.unobserve(item);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((item) => counterObserver.observe(item));
}
