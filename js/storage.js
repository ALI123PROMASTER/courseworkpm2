// Ключ для сохранения данных в LocalStorage браузера
const STORAGE_KEY = "it_company_projects_premium";

// Функция возвращает начальный (дефолтный) массив данных с проектами
// Это нужно для того, чтобы при первом запуске сайта он не был пустым
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

// Функция получения данных из LocalStorage
function getData() {
  // Пытаемся получить строку с данными по ключу
  const data = localStorage.getItem(STORAGE_KEY);
  // Если данных еще нет (первый вход пользователя)
  if (!data) {
    // Получаем дефолтные данные
    const initialData = getInitialData();
    // Сохраняем их в LocalStorage для будущих сессий
    saveData(initialData);
    return initialData;
  }
  // Если данные есть, преобразуем их из JSON-строки обратно в массив объектов (парсим)
  return JSON.parse(data);
}

// Функция сохранения данных в LocalStorage
function saveData(data) {
  // Преобразуем массив объектов в JSON-строку, так как LocalStorage хранит только строки
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

window.escapeHTML = function(str) {
  if (typeof str !== 'string') return str;
  return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
};

window.initScrollAnimations = function() {
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

// Глобальная логика UI (Переключение темы, Бургер-меню, Липкая шапка), которая работает на всех страницах
document.addEventListener("DOMContentLoaded", () => {
  window.initScrollAnimations();

  // --- НАСТРОЙКА ТЕМЫ ---
  // Получаем сохраненную тему или устанавливаем 'dark' по умолчанию
  const savedTheme = localStorage.getItem("theme") || "dark";
  // Устанавливаем атрибут data-theme корневому элементу <html> (к нему привязаны CSS переменные)
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeToggle = document.getElementById("theme-toggle");
  const moonIcon = buildIcon(
    "moon",
    'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"',
  );
  const sunIcon = buildIcon(
    "sun",
    'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"',
  );

  if (themeToggle) {
    // Устанавливаем иконку (луна или солнце) при загрузке страницы
    themeToggle.innerHTML = savedTheme === "dark" ? moonIcon : sunIcon;

    // Слушатель клика на кнопку переключения темы
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      // Применяем новую тему и сохраняем ее в LocalStorage
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // Update icon
      themeToggle.innerHTML = newTheme === "dark" ? moonIcon : sunIcon;

      // Optional: small pop animation instead of full spin
      themeToggle.style.transform = "scale(0.8)";
      setTimeout(() => {
        themeToggle.style.transform = "scale(1)";
      }, 150);
    });
  }

  // --- БУРГЕР МЕНЮ ---
  // Логика мобильного меню
  const burger = document.getElementById("burger");
  const navList = document.getElementById("nav-list");
  if (burger && navList) {
    // Удаляем старые слушатели кликов, чтобы избежать дублирования (путем пересоздания узла)
    const newBurger = burger.cloneNode(true);
    burger.parentNode.replaceChild(newBurger, burger);

    // При клике на бургер переключаем классы открытия (крестик и выдвижение меню)
    newBurger.addEventListener("click", () => {
      newBurger.classList.toggle("active");
      navList.classList.toggle("open");
    });

    // Обработчик клика по ссылкам в меню
    const navLinks = document.querySelectorAll(".nav__link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        // Убираем активный класс у всех ссылок и ставим текущей
        navLinks.forEach((nav) => nav.classList.remove("nav__link--active"));
        this.classList.add("nav__link--active");

        // Закрываем мобильное меню при клике на любую ссылку (чтобы перейти к секции)
        newBurger.classList.remove("active");
        navList.classList.remove("open");
      });
    });
  }

  // --- ЛИПКАЯ ШАПКА (Скролл) ---
  const header = document.getElementById("header");
  if (header) {
    // Отслеживаем скролл окна с гистерезисом (защита от дребезга)
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const isScrolled = header.classList.contains("scrolled");

      if (!isScrolled && scrollY > 50) {
        // Включаем "липкий" режим при прокрутке ниже 50px
        header.classList.add("scrolled");
      } else if (isScrolled && scrollY < 10) {
        // Выключаем только при возврате выше 10px
        header.classList.remove("scrolled");
      }
    });
  }
});
