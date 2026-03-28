// ============================================================
// 01. ВСПОМОГАТЕЛЬНЫЕ СТИЛИ
// ============================================================
function ensureShakeKeyframes() {
  if (document.getElementById("shake-keyframes")) return;

  const style = document.createElement("style");
  style.id = "shake-keyframes";
  style.innerHTML = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;

  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // 02. НАСТРОЙКИ / СОСТОЯНИЕ
  // ============================================================
  ensureShakeKeyframes();

  const form = document.getElementById("project-form");
  const cancelBtn = document.getElementById("btn-cancel");
  if (!form || !cancelBtn) return;

  const rootIndexPath = window.location.pathname.includes("/pages/")
    ? "../index.html"
    : "index.html";

  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;

  // ============================================================
  // 03. UI: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================
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

  // ============================================================
  // 04. ВАЛИДАЦИЯ
  // ============================================================
  function getFormFields() {
    return {
      titleEl: document.getElementById("title"),
      categoryEl: document.getElementById("category"),
      dateEl: document.getElementById("date"),
      priceEl: document.getElementById("price"),
      descEl: document.getElementById("desc"),
    };
  }

  function validateForm(fields) {
    const { titleEl, categoryEl, dateEl, priceEl, descEl } = fields;

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

    return {
      isValid,
      errorMessage: errorMessage.slice(0, -1),
    };
  }

  // ============================================================
  // 05. СОБЫТИЯ ФОРМЫ
  // ============================================================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = getFormFields();
    const validation = validateForm(fields);

    if (!validation.isValid) {
      showToast(validation.errorMessage);
      form.style.animation = "shake 0.5s";
      setTimeout(() => {
        form.style.animation = "";
      }, 500);
      return;
    }

    const newProject = {
      id: crypto.randomUUID(),
      title: fields.titleEl.value.trim(),
      category: fields.categoryEl.value,
      date: fields.dateEl.value,
      price: Number(fields.priceEl.value),
      description: fields.descEl.value.trim(),
      status: "В работе",
    };

    const data = getData();
    data.push(newProject);
    saveData(data);

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
  // 06. ИНИЦИАЛИЗАЦИЯ
  // Дополнительные действия не требуются: обработчики уже подключены.
});
