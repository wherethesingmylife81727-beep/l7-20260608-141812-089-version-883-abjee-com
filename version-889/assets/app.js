(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initGlobalSearch() {
        var searchBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        var index = window.SEARCH_INDEX || [];
        searchBlocks.forEach(function (block) {
            var input = block.querySelector("[data-search-input]");
            var results = block.querySelector("[data-search-results]");
            if (!input || !results) {
                return;
            }

            function render() {
                var query = normalize(input.value);
                if (!query) {
                    results.classList.remove("is-open");
                    results.innerHTML = "";
                    return;
                }
                var matches = index.filter(function (item) {
                    return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
                }).slice(0, 10);
                results.innerHTML = matches.map(function (item) {
                    return "<a class=\"search-result-item\" href=\"" + item.url + "\"><strong>" + item.title + "</strong><span>" + item.region + " · " + item.type + " · " + item.year + " · " + item.genre + "</span></a>";
                }).join("");
                results.classList.toggle("is-open", matches.length > 0);
            }

            input.addEventListener("input", render);
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    var first = results.querySelector("a");
                    if (first) {
                        event.preventDefault();
                        window.location.href = first.href;
                    }
                }
            });
            document.addEventListener("click", function (event) {
                if (!block.contains(event.target)) {
                    results.classList.remove("is-open");
                }
            });
        });
    }

    function initLocalFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var scope = bar.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = bar.querySelector("[data-local-search]");
            var type = bar.querySelector("[data-filter-type]");
            var region = bar.querySelector("[data-filter-region]");

            function apply() {
                var query = normalize(input && input.value);
                var typeValue = normalize(type && type.value);
                var regionValue = normalize(region && region.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var visible = true;
                    if (query && text.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        visible = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        visible = false;
                    }
                    card.style.display = visible ? "" : "none";
                });
            }

            [input, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.setupMoviePlayer = function (streamUrl) {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector("[data-player-overlay]");
        var button = shell.querySelector("[data-player-start]");
        var attached = false;
        var hlsReady = false;
        var pendingPlay = false;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                hlsReady = true;
                if (pendingPlay) {
                    play();
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hlsReady = true;
                    if (pendingPlay) {
                        play();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.src = streamUrl;
                        hlsReady = true;
                    }
                });
            } else {
                video.src = streamUrl;
                hlsReady = true;
            }
        }

        function play() {
            if (!video) {
                return;
            }
            attach();
            pendingPlay = !hlsReady;
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        attach();
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", function () {
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHero();
        initGlobalSearch();
        initLocalFilters();
    });
}());
