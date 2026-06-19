(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalized(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children);
        var search = document.querySelector("[data-search-input]");
        var year = document.querySelector("[data-year-filter]");
        var type = document.querySelector("[data-type-filter]");
        var auto = document.querySelector("[data-autofocus-query]");
        if (auto) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                auto.value = q;
            }
        }
        function apply() {
            var keyword = normalized(search && search.value);
            var selectedYear = normalized(year && year.value);
            var selectedType = normalized(type && type.value);
            cards.forEach(function (card) {
                var text = normalized([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.textContent
                ].join(" "));
                var cardYear = normalized(card.getAttribute("data-year"));
                var cardType = normalized(card.getAttribute("data-type"));
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
                    ok = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }
        [search, year, type].forEach(function (item) {
            if (item) {
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-hls");
            var hlsInstance = null;
            function startPlayback() {
                if (!source) {
                    return;
                }
                player.classList.add("is-playing");
                if (video.getAttribute("data-ready") === "true") {
                    video.play().catch(function () {});
                    return;
                }
                video.setAttribute("data-ready", "true");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = source;
                video.play().catch(function () {});
            }
            button.addEventListener("click", startPlayback);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
