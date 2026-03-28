document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // 01. НАСТРОЙКИ / СОСТОЯНИЕ
  // ============================================================
  const form = document.getElementById("project-form");
  const cancelBtn = document.getElementById("btn-cancel");
  if (!form || !cancelBtn) return;

  const rootIndexPath = window.location.pathname.includes("/pages/")
    ? "../index.html"
    : "index.html";

  const submitBtn = form.querySelector('button[type="submit"]');

  // ============================================================
  // 02. UI: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================
  function shakeForm() {
    const shakeTarget = form.closest(".form-container") || form;

    // Prefer WAAPI to avoid conflicts with existing transform/transition styles.
    if (typeof shakeTarget.animate === "function") {
      shakeTarget.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" },
        ],
        {
          duration: 420,
          easing: "ease-in-out",
        },
      );
      return;
    }

    shakeTarget.classList.remove("is-shaking");
    void shakeTarget.offsetWidth;
    shakeTarget.classList.add("is-shaking");
    setTimeout(() => {
      shakeTarget.classList.remove("is-shaking");
    }, 500);
  }

  function setSubmitLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.textContent = isLoading ? "Сохранение..." : "Запустить проект";
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
  }

  // ============================================================
  // 03. ВАЛИДАЦИЯ
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
    let firstInvalidField = null;
    let errorMessage = "Заполните обязательные поля:";

    if (!titleEl.value.trim()) {
      titleEl.classList.add("error");
      errorMessage += " Название,";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = titleEl;
    }
    if (!categoryEl.value) {
      categoryEl.classList.add("error");
      errorMessage += " Категория,";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = categoryEl;
    }
    if (!dateEl.value) {
      dateEl.classList.add("error");
      errorMessage += " Срок,";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = dateEl;
    }
    if (!priceEl.value || Number(priceEl.value) <= 0) {
      priceEl.classList.add("error");
      errorMessage += " Бюджет,";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = priceEl;
    }
    if (!descEl.value.trim()) {
      descEl.classList.add("error");
      errorMessage += " Описание,";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = descEl;
    }

    return {
      isValid,
      errorMessage: errorMessage.slice(0, -1),
      firstInvalidField,
    };
  }

  // ============================================================
  // 04. СОБЫТИЯ ФОРМЫ
  // ============================================================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = getFormFields();
    const validation = validateForm(fields);

    if (!validation.isValid) {
      window.showToast?.(validation.errorMessage, "error");
      validation.firstInvalidField?.focus();
      shakeForm();
      return;
    }

    const newProject = {
      id: window.generateId?.("project") || `project-${Date.now()}`,
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

    setSubmitLoading(true);

    setTimeout(() => {
      window.location.href = rootIndexPath;
    }, 600);
  });

  cancelBtn.addEventListener("click", () => {
    window.location.href = rootIndexPath;
  });

  // 05. ИНИЦИАЛИЗАЦИЯ
  // Дополнительные действия не требуются: обработчики уже подключены.
});
