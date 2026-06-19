(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function renderResults(container, query) {
    var data = window.SITE_MOVIES || [];
    var term = normalize(query);
    if (!term) {
      container.classList.remove('is-open');
      container.innerHTML = '';
      return;
    }
    var results = data.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.category).indexOf(term) !== -1;
    }).slice(0, 12);
    if (!results.length) {
      container.classList.add('is-open');
      container.innerHTML = '<div class="search-result-item"><strong>没有找到匹配影片</strong><span>可以换一个片名、地区或题材关键词</span></div>';
      return;
    }
    container.classList.add('is-open');
    container.innerHTML = results.map(function (movie) {
      return '<a class="search-result-item" href="' + movie.link + '"><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span></a>';
    }).join('');
  }

  function setupSearch() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var container = form.parentElement.querySelector('[data-search-results]') || document.querySelector('[data-search-results]');
      if (!input || !container) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderResults(container, input.value);
      });
      input.addEventListener('input', function () {
        renderResults(container, input.value);
      });
    });
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
      var yearSelect = form.querySelector('[data-filter-year]');
      var keywordInput = form.querySelector('[data-filter-keyword]');
      var section = form.closest('.content-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      function apply() {
        var yearValue = yearSelect ? parseInt(yearSelect.value || '0', 10) : 0;
        var keyword = normalize(keywordInput ? keywordInput.value : '');
        cards.forEach(function (card) {
          var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
          var cardText = normalize(card.textContent + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
          var yearMatch = !yearValue || cardYear >= yearValue;
          var keywordMatch = !keyword || cardText.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !(yearMatch && keywordMatch));
        });
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (keywordInput) {
        keywordInput.addEventListener('input', apply);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
