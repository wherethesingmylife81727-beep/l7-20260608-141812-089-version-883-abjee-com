(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMobileNav() {
        var button = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        qsa('[data-hero-carousel]').forEach(function (carousel) {
            var slides = qsa('[data-hero-slide]', carousel);
            var prev = qs('[data-hero-prev]', carousel);
            var next = qs('[data-hero-next]', carousel);
            var dots = qs('[data-hero-dots]', carousel);
            var index = 0;
            var timer;
            if (!slides.length) {
                return;
            }

            function setActive(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === index);
                });
                if (dots) {
                    qsa('button', dots).forEach(function (dot, dotIndex) {
                        dot.classList.toggle('active', dotIndex === index);
                    });
                }
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    setActive(index + 1);
                }, 5000);
            }

            if (dots) {
                slides.forEach(function (_, dotIndex) {
                    var dot = document.createElement('button');
                    dot.type = 'button';
                    dot.setAttribute('aria-label', '切换到第' + (dotIndex + 1) + '屏');
                    dot.addEventListener('click', function () {
                        setActive(dotIndex);
                        restart();
                    });
                    dots.appendChild(dot);
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    setActive(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    setActive(index + 1);
                    restart();
                });
            }

            setActive(0);
            restart();
        });
    }

    function initFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var root = panel.parentElement;
            var input = qs('[data-filter-input]', panel);
            var yearSelect = qs('[data-filter-year]', panel);
            var tagSelect = qs('[data-filter-tag]', panel);
            var cards = qsa('[data-movie-card]', root);
            var empty = qs('[data-empty-state]', root);

            function apply() {
                var keyword = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var tag = normalize(tagSelect && tagSelect.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize((card.dataset.title || '') + ' ' + (card.dataset.tags || ''));
                    var cardYear = normalize(card.dataset.year || '');
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (tag && haystack.indexOf(tag) === -1) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            [input, yearSelect, tagSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video', box);
            var overlay = qs('.player-overlay', box);
            if (!video) {
                return;
            }

            function prepare() {
                var stream = video.dataset.stream;
                if (!stream || video.dataset.ready === '1') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                    video.dataset.ready = '1';
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.dataset.ready = '1';
                } else {
                    video.src = stream;
                    video.dataset.ready = '1';
                }
            }

            function play() {
                prepare();
                if (overlay) {
                    overlay.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });
        });
    }

    function initSearch() {
        var form = qs('[data-search-form]');
        var input = qs('[data-search-input]');
        var results = qs('[data-search-results]');
        var summary = qs('[data-search-summary]');
        if (!form || !input || !results || !window.SITE_MOVIES) {
            return;
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.rating) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function perform(query) {
            var keyword = normalize(query);
            if (!keyword) {
                summary.innerHTML = '<div class="search-summary-card">输入关键词后即可搜索影片、题材、年份或地区。</div>';
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.category,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            summary.innerHTML = '<div class="search-summary-card">搜索“' + escapeHtml(query) + '”的匹配结果</div>';
            results.innerHTML = matched.length ? matched.map(card).join('') : '<div class="empty-state">暂无匹配内容</div>';
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
            perform(query);
        });

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        perform(initial);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
        initSearch();
    });
})();
