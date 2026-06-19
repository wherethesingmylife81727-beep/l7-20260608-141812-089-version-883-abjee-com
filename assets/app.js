(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dots button'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupHeroSearch() {
    var form = document.querySelector('.hero-search');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = './search.html';
      if (keyword) {
        target += '?q=' + encodeURIComponent(keyword);
      }
      window.location.href = target;
    });
  }

  function setupFilters() {
    var form = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    if (!form || !cards.length) {
      return;
    }
    var keywordInput = form.querySelector('[name="q"]');
    var yearSelect = form.querySelector('[name="year"]');
    var typeSelect = form.querySelector('[name="type"]');
    var categorySelect = form.querySelector('[name="category"]');
    var empty = document.querySelector('.no-result');
    var params = new URLSearchParams(window.location.search);
    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    function read(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = read(keywordInput);
      var year = read(yearSelect);
      var type = read(typeSelect);
      var category = read(categorySelect);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (year && String(card.getAttribute('data-year')).toLowerCase() !== year) {
          ok = false;
        }
        if (type && String(card.getAttribute('data-type')).toLowerCase() !== type) {
          ok = false;
        }
        if (category && String(card.getAttribute('data-category')).toLowerCase() !== category) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function setupPlayers() {
    var stages = Array.prototype.slice.call(document.querySelectorAll('.player-stage'));
    stages.forEach(function (stage) {
      var video = stage.querySelector('video');
      var button = stage.querySelector('.player-play');
      var overlay = stage.querySelector('.player-overlay');
      if (!video) {
        return;
      }
      var streamEl = video.querySelector('source');
      var stream = streamEl ? streamEl.getAttribute('src') : video.getAttribute('src');
      var loaded = false;
      var hlsObject = null;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      }

      function loadStream() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsObject = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsObject.loadSource(stream);
          hlsObject.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        loadStream();
        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', hideOverlay);
      window.addEventListener('beforeunload', function () {
        if (hlsObject && typeof hlsObject.destroy === 'function') {
          hlsObject.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupHeroSearch();
    setupFilters();
    setupPlayers();
  });
})();
