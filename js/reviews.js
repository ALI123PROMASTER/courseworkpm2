document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // НАСТРОЙКИ / СОСТОЯНИЕ
  // =============================
  const REVIEWS_KEY = "premium_reviews";
  const reviewsGrid = document.getElementById("reviews-grid");
  const reviewForm = document.getElementById("review-form");

  const defaultReviews = [
    {
      id: "r1",
      name: "Алексей Смирнов",
      rating: 5,
      text: "Отличная работа! Лендинг сделали в срок, дизайн превзошел все ожидания. Конверсия выросла на 40% в первый месяц.",
      date: "10.03.2026",
    },
    {
      id: "r2",
      name: "Елена Ковальчук",
      rating: 5,
      text: "Профессиональный подход к разработке корпоративной системы. Очень порадовала глубокая проработка интерфейсов и внимание к деталям.",
      date: "15.02.2026",
    },
    {
      id: "r3",
      name: "Дмитрий Иванов",
      rating: 4,
      text: "Все супер, ребята молодцы. Был небольшой сдвиг по срокам на пару дней, но качество кода и итоговый результат — на высоте.",
      date: "28.01.2026",
    },
  ];

  let reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || defaultReviews;

  // =============================
  // ХРАНИЛИЩЕ
  // =============================
  function saveReviews() {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }

  if (!localStorage.getItem(REVIEWS_KEY)) {
    saveReviews();
  }

  // =============================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ПРЕДСТАВЛЕНИЯ
  // =============================
  function createReviewElement(review) {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const safeName = window.escapeHTML(review.name);
    const safeText = window.escapeHTML(review.text);

    const card = document.createElement("div");
    card.className = "review-card animate-on-scroll";
    card.id = `review-${review.id}`;
    card.innerHTML = `
                <div class="review-header">
                    <div class="review-author-info">
                        <div class="review-avatar">${safeName.charAt(0)}</div>
                        <div>
                            <span class="review-author">${safeName}</span>
                            <span class="review-date">${review.date}</span>
                        </div>
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <p class="review-text">"${safeText}"</p>
            `;
    return card;
  }

  // =============================
  // ОТРИСОВКА
  // =============================
  function renderReviews() {
    if (!reviewsGrid) return;
    reviewsGrid.innerHTML = "";
    reviews.forEach((review) => {
      reviewsGrid.appendChild(createReviewElement(review));
    });
  }

  // =============================
  // ИНКРЕМЕНТАЛЬНОЕ ОБНОВЛЕНИЕ
  // =============================
  function addReviewToDOM(review) {
    if (!reviewsGrid) return;
    const newCard = createReviewElement(review);
    reviewsGrid.insertBefore(newCard, reviewsGrid.firstChild);
    // Новый отзыв должен отображаться сразу, без ожидания повторной инициализации observer.
    newCard.classList.add("is-visible");
  }

  // =============================
  // СОБЫТИЯ ФОРМЫ
  // =============================
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("review-name");
      const ratingInput = document.getElementById("review-rating");
      const textInput = document.getElementById("review-text");

      if (
        !nameInput.value.trim() ||
        !ratingInput.value ||
        !textInput.value.trim()
      ) {
        window.showToast?.("Пожалуйста, заполните все поля", "error");
        return;
      }

      const newReview = {
        id: crypto.randomUUID(),
        name: nameInput.value.trim(),
        rating: parseInt(ratingInput.value, 10),
        text: textInput.value.trim(),
        date: new Date().toLocaleDateString("ru-RU"),
      };

      reviews.unshift(newReview);
      saveReviews();
      addReviewToDOM(newReview);
      lastReviewCount = reviews.length;
      reviewForm.reset();
      window.showToast?.("Спасибо! Ваш отзыв добавлен.", "success");
    });
  }

  // =============================
  // СИНХРОНИЗАЦИЯ МЕЖДУ ВКЛАДКАМИ
  // =============================
  let lastReviewCount = reviews.length;

  window.addEventListener("storage", (e) => {
    if (e.key !== REVIEWS_KEY || !e.newValue) return;

    const newReviews = JSON.parse(e.newValue);
    if (!Array.isArray(newReviews)) return;

    if (newReviews.length > lastReviewCount) {
      const addedReview = newReviews[0];
      reviews = newReviews;
      addReviewToDOM(addedReview);
      lastReviewCount = newReviews.length;
      window.showToast?.("Новый отзыв добавлен!", "success");
      return;
    }

    reviews = newReviews;
    lastReviewCount = newReviews.length;
    renderReviews();
  });

  // =============================
  // ИНИЦИАЛИЗАЦИЯ
  // =============================
  renderReviews();
});
