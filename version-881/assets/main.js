(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5800);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var filterInput = document.querySelector('[data-filter-input]');
    var queryInput = document.querySelector('[data-query-input]');
    var clearButton = document.querySelector('[data-clear-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var searchTitle = document.querySelector('[data-search-title]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function haystack(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyFilter(value) {
        var needle = normalize(value);
        var visible = 0;

        cards.forEach(function (card) {
            var matched = !needle || haystack(card).indexOf(needle) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }

        if (searchTitle) {
            searchTitle.textContent = needle ? '搜索结果：' + value : '搜索结果';
        }
    }

    if (query && filterInput) {
        filterInput.value = query;
        applyFilter(query);
    }

    if (queryInput && query) {
        queryInput.value = query;
    }

    if (filterInput && cards.length) {
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
    }

    if (clearButton && filterInput) {
        clearButton.addEventListener('click', function () {
            filterInput.value = '';
            applyFilter('');
        });
    }
})();
