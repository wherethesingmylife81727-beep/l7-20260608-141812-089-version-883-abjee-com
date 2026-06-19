(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    showSlide(0);
    startHero();

    var searchInput = document.querySelector('[data-search-input]');
    var searchList = document.querySelector('[data-search-list]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var activeCategory = '';

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applySearch() {
        if (!searchList) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-type'),
                card.textContent
            ].join(' '));
            var categoryOk = !activeCategory || card.getAttribute('data-category') === activeCategory;
            var queryOk = !query || text.indexOf(query) !== -1;
            card.classList.toggle('is-hidden', !(categoryOk && queryOk));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');

        if (preset) {
            searchInput.value = preset;
        }

        searchInput.addEventListener('input', applySearch);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-filter-category') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applySearch();
        });
    });

    applySearch();

    var video = document.querySelector('[data-hls-player]');

    if (video) {
        var source = video.querySelector('source');
        var sourceUrl = source ? source.getAttribute('src') : video.getAttribute('src');
        var overlayButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));

        if (sourceUrl && window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else if (sourceUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        overlayButtons.forEach(function (button) {
            button.addEventListener('click', playVideo);
        });

        video.addEventListener('play', function () {
            overlayButtons.forEach(function (button) {
                button.classList.add('is-hidden');
            });
        });

        video.addEventListener('pause', function () {
            overlayButtons.forEach(function (button) {
                if (button.classList.contains('play-overlay')) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }
})();
