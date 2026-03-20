document.addEventListener("DOMContentLoaded", () => {
  // Theme setup and burger menu handled by global storage.js

  const form = document.getElementById("project-form");
  const cancelBtn = document.getElementById("btn-cancel");
  const rootIndexPath = window.location.pathname.includes("/pages/")
    ? "../index.html"
    : "index.html";
  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;

  // Функция отображения уведомлений (всплывающие тосты)
  function showToast(message, type = "error") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"><use href="${getIconHref("alert")}"></use></svg>`;
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Обработчик отправки формы (сабмит)
  form.addEventListener("submit", (e) => {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    e.preventDefault();

    const titleEl = document.getElementById("title");
    const categoryEl = document.getElementById("category");
    const dateEl = document.getElementById("date");
    const priceEl = document.getElementById("price");
    const descEl = document.getElementById("desc");

    // Сбрасываем старые ошибки перед новой проверкой
    [titleEl, categoryEl, dateEl, priceEl, descEl].forEach((el) =>
      el.classList.remove("error"),
    );

    let isValid = true;
    let errorMessage = "Заполните обязательные поля:";

    if (!titleEl.value.trim()) {
      titleEl.classList.add("error");
      errorMessage += " Название,";
      isValid = false;
    }
    if (!categoryEl.value) {
      categoryEl.classList.add("error");
      errorMessage += " Категория,";
      isValid = false;
    }
    if (!dateEl.value) {
      dateEl.classList.add("error");
      errorMessage += " Срок,";
      isValid = false;
    }
    if (!priceEl.value || Number(priceEl.value) <= 0) {
      priceEl.classList.add("error");
      errorMessage += " Бюджет,";
      isValid = false;
    }
    if (!descEl.value.trim()) {
      descEl.classList.add("error");
      errorMessage += " Описание,";
      isValid = false;
    }

    if (!isValid) {
      errorMessage = errorMessage.slice(0, -1); // удаляем последнюю запятую
      showToast(errorMessage);
      // Визуальная анимация "встряхивания" формы при ошибке
      form.style.animation = "shake 0.5s";
      setTimeout(() => (form.style.animation = ""), 500);
      return;
    }

    // Формируем объект нового проекта
    const newProject = {
      id: Date.now(), // Используем текущий timestamp как уникальный генератор ID
      title: titleEl.value.trim(),
      category: categoryEl.value,
      date: dateEl.value,
      price: Number(priceEl.value),
      description: descEl.value.trim(),
      status: "В работе",
    };

    // Получаем текущие данные, добавляем новый проект и сохраняем обратно
    let data = getData();
    data.push(newProject);
    saveData(data);

    // Симуляция успешной загрузки (меняем текст кнопки)
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = "Сохранение...";
    submitBtn.style.opacity = "0.7";

    setTimeout(() => {
      window.location.href = rootIndexPath;
    }, 600);
  });

  cancelBtn.addEventListener("click", () => {
    window.location.href = rootIndexPath;
  });
});

// Adding a global shake style programmatically for the form validation
const style = document.createElement("style");
style.innerHTML = `
    @keyframes shake {
        0%, 100% {transform: translateX(0);}
        10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);}
        20%, 40%, 60%, 80% {transform: translateX(5px);}
    }
`;
document.head.appendChild(style);
