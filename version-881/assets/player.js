(function () {
    function init(source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('playButton');
        var overlay = document.querySelector('[data-player-overlay]');
        var started = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function bindSource() {
            if (started) {
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            bindSource();

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

        if (button) {
            button.addEventListener('click', play);
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

        video.addEventListener('pause', function () {
            if (!video.ended && video.currentTime < 0.2 && overlay) {
                overlay.classList.remove('hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.MoviePlayer = {
        init: init
    };
})();
