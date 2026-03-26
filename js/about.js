document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Калькулятор стоимости
  // =============================
  const typeSel = document.getElementById("calc-type");
  const pagesRange = document.getElementById("calc-pages");
  const pagesVal = document.getElementById("pages-val");
  const seoCheck = document.getElementById("calc-seo");
  const copyCheck = document.getElementById("calc-copy");
  const priceEl = document.getElementById("total-price");

  const basePrices = {
    landing: 500,
    corporate: 1200,
    ecommerce: 2500,
    saas: 5000,
  };

  let currentVal = 0;

  function calculateLogic() {
    if (!typeSel) return 0;

    const base = basePrices[typeSel.value] || 0;
    const extraPages = parseInt(pagesRange.value, 10) - 1;
    const pagesCost = extraPages > 0 ? extraPages * 50 : 0;
    const seo = seoCheck.checked ? 300 : 0;
    const copy = copyCheck.checked ? 500 : 0;

    return base + pagesCost + seo + copy;
  }

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentCalculated = Math.floor(start + (end - start) * easeOut);
      obj.textContent = currentCalculated.toLocaleString("en-US");

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = end.toLocaleString("en-US");
      }
    };

    window.requestAnimationFrame(step);
  }

  function updatePrice(animate = true) {
    if (!priceEl) return;

    const newTotal = calculateLogic();
    pagesVal.textContent = pagesRange.value;

    if (animate && currentVal !== newTotal) {
      animateValue(priceEl, currentVal, newTotal, 800);
    } else {
      priceEl.textContent = newTotal.toLocaleString("en-US");
    }

    currentVal = newTotal;
  }

  if (!typeSel) return;

  typeSel.addEventListener("change", () => updatePrice(true));
  seoCheck.addEventListener("change", () => updatePrice(true));
  copyCheck.addEventListener("change", () => updatePrice(true));

  pagesRange.addEventListener("input", () => {
    pagesVal.textContent = pagesRange.value;
    updatePrice(false);
  });

  updatePrice(true);
});
