(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    showSlide(0);
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
    var scope = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var filterValue = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var filterMatch = filterValue === 'all' || haystack.indexOf(filterValue.toLowerCase()) !== -1;
        var match = queryMatch && filterMatch;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-selected');
        });
        button.classList.add('is-selected');
        filterValue = button.getAttribute('data-filter-button') || 'all';
        applyFilter();
      });
    });
  });

  var quickForm = document.querySelector('[data-quick-search]');
  if (quickForm) {
    quickForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickForm.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './ranking.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  var urlQuery = new URLSearchParams(window.location.search).get('q');
  if (urlQuery) {
    var pageSearch = document.querySelector('[data-search-input]');
    if (pageSearch) {
      pageSearch.value = urlQuery;
      pageSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}());

function initializePlayer(source) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-play-button]');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startVideo() {
    loadVideo();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }
  if (cover) {
    cover.addEventListener('click', startVideo);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
