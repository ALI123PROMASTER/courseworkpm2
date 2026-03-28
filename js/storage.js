// ============================================================
// 01. API ХРАНИЛИЩА
// ============================================================
const STORAGE_KEY = "it_company_projects_premium";

function getInitialData() {
  return [
    {
      id: "1709123000000",
      title: "Аналитическая платформа AI",
      category: "Web Platform",
      date: "2025-10-15",
      status: "В работе",
      description:
        "Разработка SaaS платформы для предиктивной аналитики на базе машинного обучения. Интеграция с Python микросервисами.",
      price: 15000,
    },
    {
      id: "1709123000001",
      title: "Кроссплатформенное приложение EcoTrack",
      category: "Mobile App",
      date: "2025-11-20",
      status: "В работе",
      description:
        "Мобильное приложение (iOS/Android) для отслеживания углеродного следа пользователей с элементами геймификации.",
      price: 12500,
    },
    {
      id: "1709123000002",
      title: 'Дизайн-система банка "Neo"',
      category: "UI/UX Design",
      date: "2025-08-01",
      status: "Готово",
      description:
        "Создание комплексной дизайн-системы. Включает 500+ компонентов, токены, регламенты использования.",
      price: 8000,
    },
    {
      id: "1709123000003",
      title: 'Корпоративный портал "Global Log"',
      category: "Enterprise System",
      date: "2026-01-10",
      status: "В работе",
      description:
        "Внутренний портал для логистической компании. Модули: HR, документооборот, трекинг грузов.",
      price: 25000,
    },
    {
      id: "1709123000004",
      title: "Лендинг для крипто-проекта",
      category: "Web Platform",
      date: "2025-05-12",
      status: "Готово",
      description:
        "Промо-сайт с 3D анимациями (Three.js), темной темой и интеграцией Web3 кошелька.",
      price: 4500,
    },
    {
      id: "1709123000005",
      title: 'Мобильный банк "EasyMoney"',
      category: "Mobile App",
      date: "2026-03-30",
      status: "В работе",
      description:
        "Нативное приложение для ФинТех стартапа. P2P переводы, виртуальные карты, кэшбек-система.",
      price: 18000,
    },
  ];
}

function safeParseJSON(value, fallback) {
  if (typeof value !== "string" || value.length === 0) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeProjects(rawProjects) {
  if (!Array.isArray(rawProjects)) return null;

  return rawProjects
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      ...item,
      id: String(item.id ?? `${Date.now()}-${index}`),
      price: Number(item.price) || 0,
      status: item.status || "В работе",
      category: item.category || "Other",
      title: item.title || "Без названия",
      description: item.description || "",
      date: item.date || "",
    }));
}

function getData() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initialData = getInitialData();
    saveData(initialData);
    return initialData;
  }

  const parsedData = safeParseJSON(data, null);
  const normalizedData = normalizeProjects(parsedData);

  if (!normalizedData) {
    const initialData = getInitialData();
    saveData(initialData);
    return initialData;
  }

  const needsMigration =
    parsedData.length !== normalizedData.length ||
    parsedData.some((item, index) => {
      const normalizedItem = normalizedData[index];
      if (!normalizedItem) return true;

      return (
        String(item?.id ?? "") !== normalizedItem.id ||
        Number(item?.price) !== normalizedItem.price
      );
    });

  if (needsMigration) {
    saveData(normalizedData);
  }

  return normalizedData;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ============================================================
// 02. ПУТИ И ИКОНКИ
// ============================================================
function getPathPrefix() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

function getIconHref(iconName) {
  return `${getPathPrefix()}media/icons/${iconName}.svg#${iconName}`;
}

function buildIcon(symbolId, attributes) {
  return `<svg ${attributes}><use href="${getIconHref(symbolId)}"></use></svg>`;
}

function generateId(prefix = "id") {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

window.getIconHref = getIconHref;
window.buildIcon = buildIcon;
window.safeParseJSON = safeParseJSON;
window.generateId = generateId;

// ============================================================
// 03. ГЛОБАЛЬНЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
window.escapeHTML = function (str) {
  if (typeof str !== "string") return str;

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

window.showToast = function (message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const iconName = type === "success" ? "check" : "alert";

  toast.innerHTML = `${buildIcon(
    iconName,
    'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"',
  )} <span>${window.escapeHTML(String(message))}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};

window.initScrollAnimations = (() => {
  let observer = null;

  return function initScrollAnimations() {
    const targets = document.querySelectorAll(
      ".animate-on-scroll:not(.is-visible)",
    );
    if (targets.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(
        (entries, observerObj) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observerObj.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.1 },
      );
    }

    targets.forEach((el) => observer.observe(el));
  };
})();

// ============================================================
// 04. ИНИЦИАЛИЗАЦИЯ UI
// ============================================================
function initThemeToggle() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  localStorage.setItem("theme", savedTheme);

  const themeToggle = document.getElementById("theme-toggle");
  const moonIcon = buildIcon(
    "moon",
    'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"',
  );
  const sunIcon = buildIcon(
    "sun",
    'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"',
  );

  if (!themeToggle) return;

  themeToggle.innerHTML = savedTheme === "dark" ? moonIcon : sunIcon;

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    themeToggle.innerHTML = newTheme === "dark" ? moonIcon : sunIcon;

    themeToggle.classList.remove("is-pressed");
    void themeToggle.offsetWidth;
    themeToggle.classList.add("is-pressed");
  });
}

function initBurgerMenu() {
  const burger = document.getElementById("burger");
  const navList = document.getElementById("nav-list");
  if (!burger || !navList) return;

  const newBurger = burger.cloneNode(true);
  burger.parentNode.replaceChild(newBurger, burger);

  const closeMenu = () => {
    newBurger.classList.remove("active");
    navList.classList.remove("open");
  };

  newBurger.addEventListener("click", () => {
    newBurger.classList.toggle("active");
    navList.classList.toggle("open");
  });

  const navLinks = document.querySelectorAll(".nav__link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.forEach((nav) => nav.classList.remove("nav__link--active"));
      this.classList.add("nav__link--active");

      closeMenu();
    });
  });

  // На скролле и смене ширины закрываем меню, чтобы оно не смещалось вместе с sticky-header.
  window.addEventListener(
    "scroll",
    () => {
      if (navList.classList.contains("open")) {
        closeMenu();
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

function initStickyHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const isScrolled = header.classList.contains("scrolled");

    if (!isScrolled && scrollY > 50) {
      header.classList.add("scrolled");
    } else if (isScrolled && scrollY < 10) {
      header.classList.remove("scrolled");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.initScrollAnimations();
  initThemeToggle();
  initBurgerMenu();
  initStickyHeader();
});
