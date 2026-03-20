document.addEventListener("DOMContentLoaded", () => {
  // --- 0. ЛОГИКА АКТИВНЫХ ССЫЛОК ПРИ СКРОЛЛЕ (Scroll Spy) ---
  // Находим все секции, у которых есть id
  const sections = document.querySelectorAll("section[id]");
  // Находим все ссылки в навигации, которые ведут на якоря (#) или на главную страницу
  const navLinks = document.querySelectorAll(
    '.nav__list a[href^="#"], .nav__list a[href="index.html"]',
  );
  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;
  const createIcon = (symbolId, attributes) =>
    `<svg ${attributes}><use href="${getIconHref(symbolId)}"></use></svg>`;

  function highlightNavigation() {
    let scrollY = window.pageYOffset;

    // Если находимся в самом верху (скролл меньше 100px), подсвечиваем ссылку на главную
    if (scrollY < 100) {
      navLinks.forEach((link) => {
        link.classList.remove("nav__link--active");
        if (
          link.getAttribute("href") === "index.html" ||
          link.getAttribute("href") === "#home"
        ) {
          link.classList.add("nav__link--active");
        }
      });
      return;
    }

    // Перебираем все секции, чтобы узнать, какая сейчас в зоне видимости экрана
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150; // Отступ (компенсация высоты фиксированной шапки)
      const sectionId = current.getAttribute("id");

      // Если текущая позиция скролла находится внутри секции
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("nav__link--active");
          // Находим ссылку, которая ссылается на этот id и делаем ее активной
          if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("nav__link--active");
          }
        });
      }
    });
  }

  if (sections.length > 0) {
    window.addEventListener("scroll", highlightNavigation);
    // Вызываем сразу при загрузке, чтобы установить правильное состояние
    highlightNavigation();
  }

  // --- 1. ЛОГИКА ОТРИСОВКИ КАРТОЧЕК ПРОЕКТОВ ---
  const projectsGrid = document.getElementById("projects-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const noResults = document.getElementById("no-results");

  // Система всплывающих уведомлений (Toast)
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Выбираем иконку (галочка или крестик) в зависимости от типа
    const icon =
      type === "success"
        ? createIcon(
            "check",
            'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"',
          )
        : createIcon(
            "alert",
            'fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20"',
          );

    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    // Запускаем анимацию появления через RequestAnimationFrame (чтобы браузер успел отрисовать DOM)
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3000);
  }

  function formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  // Главная функция отрисовки карточек
  function renderCards() {
    if (!projectsGrid) return;

    const data = getData(); // Получаем данные из LocalStorage (из storage.js)
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const filterCategory = categoryFilter ? categoryFilter.value : "all";

    // Логика фильтрации (Живой поиск)
    const filteredData = data.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesCat =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCat;
    });

    projectsGrid.innerHTML = "";

    if (filteredData.length === 0) {
      if (noResults) noResults.style.display = "block";
    } else {
      if (noResults) noResults.style.display = "none";

      filteredData.forEach((project) => {
        const card = document.createElement("div");
        card.className = "card glass animate-on-scroll is-visible"; // Auto visible when injected

        const isChecked = project.status === "Готово" ? "checked" : "";

        card.innerHTML = `
                    <div class="card__header">
                        <span class="badge badge--category">${project.category}</span>
                        <div class="status-toggle" title="Отметить статус">
                            <input type="checkbox" class="status-checkbox" data-id="${project.id}" ${isChecked}>
                        </div>
                    </div>
                    <h3 class="card__title">${project.title}</h3>
                    <p class="card__desc">${project.description || "Нет описания"}</p>
                    
                    <div class="card__meta">
                        <span class="card__date">Срок: ${project.date}</span>
                        <span class="card__price">$${formatNumber(project.price || 0)}</span>
                    </div>
                    
                    <div class="card__footer">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Статус: <strong style="color: ${isChecked ? "var(--success)" : "var(--warning)"}">${project.status}</strong></span>
                        <div class="card__actions">
                            <button class="btn-icon btn-edit" data-id="${project.id}" aria-label="Редактировать">
                                ${createIcon("edit", 'fill="none" stroke="currentColor" viewBox="0 0 24 24"')}
                            </button>
                            <button class="btn-icon delete btn-delete" data-id="${project.id}" aria-label="Удалить">
                                ${createIcon("trash", 'fill="none" stroke="currentColor" viewBox="0 0 24 24"')}
                            </button>
                        </div>
                    </div>
                `;
        projectsGrid.appendChild(card);
      });
    }
  }

  // Слушатели для фильтров
  if (searchInput) searchInput.addEventListener("input", renderCards);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCards);

  // --- 2. ЛОГИКА МОДАЛЬНОГО ОКНА (Редактирование) ---
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-modal");
  const editForm = document.getElementById("edit-form");

  // Поля формы внутри модального окна
  const editId = document.getElementById("edit-id");
  const editTitle = document.getElementById("edit-title");
  const editCategory = document.getElementById("edit-category");
  const editPrice = document.getElementById("edit-price");
  const editDesc = document.getElementById("edit-desc");

  function openModal(id) {
    const data = getData();
    const project = data.find((item) => item.id === id);
    if (!project) return;

    editId.value = project.id;
    editTitle.value = project.title;
    editCategory.value = project.category;
    editPrice.value = project.price || 0;
    editDesc.value = project.description || "";

    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = Number(editId.value);
      let data = getData();
      const index = data.findIndex((item) => item.id === id);

      if (index !== -1) {
        data[index].title = editTitle.value.trim();
        data[index].category = editCategory.value;
        data[index].price = Number(editPrice.value);
        data[index].description = editDesc.value.trim();

        saveData(data);
        renderCards();
        closeModal();
        showToast("Проект успешно обновлен!");
      }
    });
  }

  // --- 3. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ (Сетка проектов) ---
  // Вешаем один слушатель на всю сетку (Pattern: Event Delegation),
  // чтобы не вешать десятки слушателей на каждую кнопку карточки отдельно
  if (projectsGrid) {
    projectsGrid.addEventListener("click", (e) => {
      // Ищем ближайшего родителя с нужным классом, если кликнули по иконке внутри кнопки
      const deleteBtn = e.target.closest(".btn-delete");
      const editBtn = e.target.closest(".btn-edit");

      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute("data-id"));
        if (
          confirm(
            "Вы уверены, что хотите удалить этот проект? Это действие необратимо.",
          )
        ) {
          let data = getData();
          data = data.filter((item) => item.id !== id);
          saveData(data);
          renderCards();
          showToast("Проект удален");
        }
      }

      if (editBtn) {
        const id = Number(editBtn.getAttribute("data-id"));
        openModal(id);
      }
    });

    projectsGrid.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-checkbox")) {
        const id = Number(e.target.getAttribute("data-id"));
        const isChecked = e.target.checked;
        let data = getData();
        const index = data.findIndex((item) => item.id === id);
        if (index !== -1) {
          data[index].status = isChecked ? "Готово" : "В работе";
          saveData(data);
          renderCards(); // Re-render to update the status text
          showToast(`Статус изменен на "${data[index].status}"`);
        }
      }
    });
  }

  // --- 4. UI ENHANCEMENTS & ANIMATIONS ---

  // Scroll Animations using Intersection Observer
  const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".animate-on-scroll")
    .forEach((el) => observer.observe(el));

  // Theme Toggle and Mobile Menu moved to global storage.js

  // FAQ Accordion
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");

      // Close others
      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".accordion-content").style.maxHeight = null;
        }
      });

      // Toggle current
      item.classList.toggle("active");
      if (item.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // Initial render
  renderCards();
});
