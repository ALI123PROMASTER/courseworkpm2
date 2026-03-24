// Логика раздела отзывов
document.addEventListener('DOMContentLoaded', () => {
    const reviewsGrid = document.getElementById('reviews-grid');
    const reviewForm = document.getElementById('review-form');

    // Получаем отзывы из LocalStorage или устанавливаем дефолтные, если их там нет
    let reviews = JSON.parse(localStorage.getItem('premium_reviews')) || [
        {
            id: 'r1',
            name: 'Алексей Смирнов',
            rating: 5,
            text: 'Отличная работа! Лендинг сделали в срок, дизайн превзошел все ожидания. Конверсия выросла на 40% в первый месяц.',
            date: '10.03.2026'
        },
        {
            id: 'r2',
            name: 'Елена Ковальчук',
            rating: 5,
            text: 'Профессиональный подход к разработке корпоративной системы. Очень порадовала глубокая проработка интерфейсов и внимание к деталям.',
            date: '15.02.2026'
        },
        {
            id: 'r3',
            name: 'Дмитрий Иванов',
            rating: 4,
            text: 'Все супер, ребята молодцы. Был небольшой сдвиг по срокам на пару дней, но качество кода и итоговый результат — на высоте.',
            date: '28.01.2026'
        }
    ];

    function saveReviews() {
        localStorage.setItem('premium_reviews', JSON.stringify(reviews));
    }

    // Инициализируем хранилище дефолтными отзывами при первом заходе
    if (!localStorage.getItem('premium_reviews')) {
        saveReviews();
    }

    // Функция отрисовки карточек отзывов
    function renderReviews() {
        if (!reviewsGrid) return;
        reviewsGrid.innerHTML = '';

        reviews.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            // Escape user data to prevent XSS
            const safeName = window.escapeHTML(review.name);
            const safeText = window.escapeHTML(review.text);

            const card = document.createElement('div');
            card.className = 'review-card animate-on-scroll';
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
            reviewsGrid.appendChild(card);
        });
    }

    // Обработчик отправки формы нового отзыва
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('review-name');
            const ratingInput = document.getElementById('review-rating');
            const textInput = document.getElementById('review-text');

            if (!nameInput.value.trim() || !ratingInput.value || !textInput.value.trim()) {
                window.showToast?.('Пожалуйста, заполните все поля', 'error');
                return;
            }

            const newReview = {
                id: crypto.randomUUID(),
                name: nameInput.value.trim(),
                rating: parseInt(ratingInput.value),
                text: textInput.value.trim(),
                date: new Date().toLocaleDateString('ru-RU')
            };

            // Добавляем отзыв в начало массива (unshift), чтобы он появлялся первым
            reviews.unshift(newReview);
            saveReviews();
            renderReviews(); // Перерисовываем список

            // Очищаем форму после успешной отправки
            reviewForm.reset();
            window.showToast?.('Спасибо! Ваш отзыв добавлен.', 'success');
        });
    }

    renderReviews();
});
