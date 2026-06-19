(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupImages();
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var links = document.querySelector('.nav-links');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
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
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
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
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        if (!inputs.length) {
            return;
        }

        var state = {
            type: 'all',
            region: 'all',
            year: 'all'
        };

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(inputs.map(function (input) {
                return input.value;
            }).join(' '));
            var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));
            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search'));
                var type = card.getAttribute('data-type') || '';
                var region = card.getAttribute('data-region') || '';
                var year = card.getAttribute('data-year') || '';
                var matchQuery = !query || searchText.indexOf(query) !== -1;
                var matchType = state.type === 'all' || state.type === type;
                var matchRegion = state.region === 'all' || state.region === region;
                var matchYear = state.year === 'all' || state.year === year;
                card.classList.toggle('is-hidden', !(matchQuery && matchType && matchRegion && matchYear));
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', applyFilters);
        });

        document.querySelectorAll('[data-filter-group]').forEach(function (group) {
            group.addEventListener('click', function (event) {
                var button = event.target.closest('button');
                if (!button) {
                    return;
                }
                if (button.hasAttribute('data-filter-type')) {
                    state.type = button.getAttribute('data-filter-type');
                }
                if (button.hasAttribute('data-filter-region')) {
                    state.region = button.getAttribute('data-filter-region');
                }
                if (button.hasAttribute('data-filter-year')) {
                    state.year = button.getAttribute('data-filter-year');
                }
                group.querySelectorAll('button').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                applyFilters();
            });
        });
    }

    var hlsCallbacks = [];
    var hlsLoading = false;

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsLoading) {
            return;
        }
        hlsLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.onload = function () {
            hlsLoading = false;
            var callbacks = hlsCallbacks.splice(0);
            callbacks.forEach(function (item) {
                item();
            });
        };
        script.onerror = function () {
            hlsLoading = false;
            var callbacks = hlsCallbacks.splice(0);
            callbacks.forEach(function (item) {
                item();
            });
        };
        document.head.appendChild(script);
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            if (!video) {
                return;
            }
            var start = function () {
                startPlayer(shell, video);
            };
            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!shell.classList.contains('is-playing')) {
                    start();
                }
            });
        });
    }

    function startPlayer(shell, video) {
        var url = video.getAttribute('data-video-url');
        if (!url) {
            return;
        }
        shell.classList.add('is-playing');
        if (video.getAttribute('data-ready') === 'true') {
            video.play().catch(function () {});
            return;
        }
        video.setAttribute('data-ready', 'true');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = url;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
            }
        });
    }
})();
