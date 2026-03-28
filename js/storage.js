// ============================================================
// 01. API ХРАНИЛИЩА
// ============================================================
const STORAGE_KEY = "it_company_projects_premium";

function getInitialData() {
  return [
    {
      id: 1709123000000,
      title: "Аналитическая платформа AI",
      category: "Web Platform",
      date: "2025-10-15",
      status: "В работе",
      description:
        "Разработка SaaS платформы для предиктивной аналитики на базе машинного обучения. Интеграция с Python микросервисами.",
      price: 15000,
    },
    {
      id: 1709123000001,
      title: "Кроссплатформенное приложение EcoTrack",
      category: "Mobile App",
      date: "2025-11-20",
      status: "В работе",
      description:
        "Мобильное приложение (iOS/Android) для отслеживания углеродного следа пользователей с элементами геймификации.",
      price: 12500,
    },
    {
      id: 1709123000002,
      title: 'Дизайн-система банка "Neo"',
      category: "UI/UX Design",
      date: "2025-08-01",
      status: "Готово",
      description:
        "Создание комплексной дизайн-системы. Включает 500+ компонентов, токены, регламенты использования.",
      price: 8000,
    },
    {
      id: 1709123000003,
      title: 'Корпоративный портал "Global Log"',
      category: "Enterprise System",
      date: "2026-01-10",
      status: "В работе",
      description:
        "Внутренний портал для логистической компании. Модули: HR, документооборот, трекинг грузов.",
      price: 25000,
    },
    {
      id: 1709123000004,
      title: "Лендинг для крипто-проекта",
      category: "Web Platform",
      date: "2025-05-12",
      status: "Готово",
      description:
        "Промо-сайт с 3D анимациями (Three.js), темной темой и интеграцией Web3 кошелька.",
      price: 4500,
    },
    {
      id: 1709123000005,
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

function getData() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initialData = getInitialData();
    saveData(initialData);
    return initialData;
  }

  return JSON.parse(data);
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

window.getIconHref = getIconHref;
window.buildIcon = buildIcon;

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

window.initScrollAnimations = function () {
  const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };

  const observer = new IntersectionObserver((entries, observerObj) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerObj.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".animate-on-scroll:not(.is-visible)")
    .forEach((el) => observer.observe(el));
};

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

    themeToggle.style.transform = "scale(0.8)";
    setTimeout(() => {
      themeToggle.style.transform = "scale(1)";
    }, 150);
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
