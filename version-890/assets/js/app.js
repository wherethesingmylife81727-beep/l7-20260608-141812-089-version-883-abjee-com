(function () {
    const site = {};

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupHero() {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const prev = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }

        schedule();
    }

    function setupFilters() {
        const lists = Array.from(document.querySelectorAll("[data-card-list]"));
        if (!lists.length) {
            return;
        }
        const input = document.querySelector("[data-search-input]");
        const typeButtons = Array.from(document.querySelectorAll("[data-filter-type]"));
        const yearButtons = Array.from(document.querySelectorAll("[data-filter-year]"));
        let activeType = "全部";
        let activeYear = "全部";

        function normalize(text) {
            return String(text || "").trim().toLowerCase();
        }

        function apply() {
            const query = normalize(input ? input.value : "");
            lists.forEach(function (list) {
                const cards = Array.from(list.children);
                cards.forEach(function (card) {
                    const haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    const typeValue = card.getAttribute("data-type") || "";
                    const yearValue = card.getAttribute("data-year") || "";
                    const matchQuery = !query || haystack.indexOf(query) !== -1;
                    const matchType = activeType === "全部" || typeValue.indexOf(activeType) !== -1 || haystack.indexOf(normalize(activeType)) !== -1;
                    const matchYear = activeYear === "全部" || yearValue === activeYear;
                    card.classList.toggle("is-filter-hidden", !(matchQuery && matchType && matchYear));
                });
            });
        }

        function activate(buttons, current) {
            buttons.forEach(function (button) {
                const value = button.getAttribute(current === "type" ? "data-filter-type" : "data-filter-year");
                button.classList.toggle("is-active", value === (current === "type" ? activeType : activeYear));
            });
        }

        typeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = button.getAttribute("data-filter-type") || "全部";
                activate(typeButtons, "type");
                apply();
            });
        });

        yearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeYear = button.getAttribute("data-filter-year") || "全部";
                activate(yearButtons, "year");
                apply();
            });
        });

        if (input) {
            input.addEventListener("input", apply);
        }

        activate(typeButtons, "type");
        activate(yearButtons, "year");
    }

    site.initPlayer = function (source, videoId, overlayId) {
        const video = document.getElementById(videoId);
        const overlay = document.getElementById(overlayId);
        const triggers = Array.from(document.querySelectorAll("[data-play-trigger]"));
        let attached = false;
        let hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", play);
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.StaticMovieSite = site;
})();
