document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // 01. ОБЩИЕ УТИЛИТЫ
  // ============================================================
  const getIconHref = window.getIconHref
    ? window.getIconHref
    : (symbolId) => `media/icons/${symbolId}.svg#${symbolId}`;

  const createIcon = (symbolId, attributes) =>
    `<svg ${attributes}><use href="${getIconHref(symbolId)}"></use></svg>`;

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
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

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  function formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  // ============================================================
  // 02. SCROLL SPY (АКТИВНАЯ ССЫЛКА МЕНЮ)
  // ============================================================
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(
    '.nav__list a[href^="#"], .nav__list a[href="index.html"]',
  );

  function highlightNavigation() {
    const scrollY = window.pageYOffset;

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

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("nav__link--active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("nav__link--active");
          }
        });
      }
    });
  }

  if (sections.length > 0) {
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation();
  }

  // ============================================================
  // 03. КАРТОЧКИ ПРОЕКТОВ (РЕНДЕР + ФИЛЬТРЫ)
  // ============================================================
  const projectsGrid = document.getElementById("projects-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const noResults = document.getElementById("no-results");

  // Создание карточки проекта
  function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "card glass animate-on-scroll";
    card.id = `card-${project.id}`;

    const isChecked = project.status === "Готово" ? "checked" : "";
    const safeCategory = window.escapeHTML(project.category);
    const safeTitle = window.escapeHTML(project.title);
    const safeDesc = window.escapeHTML(project.description) || "Нет описания";
    const safeDate = window.escapeHTML(project.date);
    const safeStatus = window.escapeHTML(project.status);

    card.innerHTML = `
      <div class="card__header">
        <span class="badge badge--category">${safeCategory}</span>
        <div class="status-toggle" title="Отметить статус">
          <input type="checkbox" class="status-checkbox" data-id="${project.id}" ${isChecked} aria-label="Отметить проект как выполненный">
        </div>
      </div>
      <h3 class="card__title">${safeTitle}</h3>
      <p class="card__desc">${safeDesc}</p>

      <div class="card__meta">
        <span class="card__date">Срок: ${safeDate}</span>
        <span class="card__price">$${formatNumber(project.price || 0)}</span>
      </div>

      <div class="card__footer">
        <span style="font-size: 0.85rem; color: var(--text-secondary);">Статус: <strong style="color: ${isChecked ? "var(--success)" : "var(--warning)"}">${safeStatus}</strong></span>
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
    return card;
  }

  // Обновление одной карточки
  function updateProjectCard(project) {
    const existingCard = document.getElementById(`card-${project.id}`);
    if (existingCard) {
      const newCard = createProjectCard(project);
      existingCard.replaceWith(newCard);
    }
  }

  function renderCards() {
    if (!projectsGrid) return;

    const data = getData();
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const filterCategory = categoryFilter ? categoryFilter.value : "all";

    const filteredData = data.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    projectsGrid.innerHTML = "";

    if (filteredData.length === 0) {
      if (noResults) noResults.style.display = "block";
      return;
    }

    if (noResults) noResults.style.display = "none";

    filteredData.forEach((project) => {
      projectsGrid.appendChild(createProjectCard(project));
    });

    window.initScrollAnimations?.();
  }

  if (searchInput) searchInput.addEventListener("input", renderCards);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCards);

  // ============================================================
  // 04. МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ
  // ============================================================
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-modal");
  const editForm = document.getElementById("edit-form");
  const editId = document.getElementById("edit-id");
  const editTitle = document.getElementById("edit-title");
  const editCategory = document.getElementById("edit-category");
  const editPrice = document.getElementById("edit-price");
  const editDesc = document.getElementById("edit-desc");

  function openModal(id) {
    if (!modal) return;

    const data = getData();
    const project = data.find((item) => item.id === id);
    if (!project) return;

    editId.value = project.id;
    editTitle.value = project.title;
    editCategory.value = project.category;
    editPrice.value = project.price || 0;
    editDesc.value = project.description || "";

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
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
      const data = getData();
      const index = data.findIndex((item) => item.id === id);

      if (index === -1) return;

      data[index].title = editTitle.value.trim();
      data[index].category = editCategory.value;
      data[index].price = Number(editPrice.value);
      data[index].description = editDesc.value.trim();

      saveData(data);
      updateProjectCard(data[index]);
      closeModal();
      showToast("Проект успешно обновлен!");
    });
  }

  // ============================================================
  // 05. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ КАРТОЧЕК
  // ============================================================
  if (projectsGrid) {
    projectsGrid.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".btn-delete");
      const editBtn = e.target.closest(".btn-edit");

      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute("data-id"));
        if (
          confirm(
            "Вы уверены, что хотите удалить этот проект? Это действие необратимо.",
          )
        ) {
          const nextData = getData().filter((item) => item.id !== id);
          saveData(nextData);
          const card = document.getElementById(`card-${id}`);
          if (card) card.remove();
          showToast("Проект удален");
        }
      }

      if (editBtn) {
        const id = Number(editBtn.getAttribute("data-id"));
        openModal(id);
      }
    });

    projectsGrid.addEventListener("change", (e) => {
      if (!e.target.classList.contains("status-checkbox")) return;

      const id = Number(e.target.getAttribute("data-id"));
      const isChecked = e.target.checked;
      const data = getData();
      const index = data.findIndex((item) => item.id === id);

      if (index === -1) return;

      data[index].status = isChecked ? "Готово" : "В работе";
      saveData(data);
      updateProjectCard(data[index]);
      showToast(`Статус изменен на "${data[index].status}"`);
    });
  }

  // ============================================================
  // 06. FAQ АККОРДЕОН
  // ============================================================
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");

      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".accordion-content").style.maxHeight = null;
        }
      });

      item.classList.toggle("active");
      if (item.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  renderCards();
});
