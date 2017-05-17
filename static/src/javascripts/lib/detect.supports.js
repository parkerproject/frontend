// @flow

export const hasWebSocket = () => 'WebSocket' in window;

export const getVideoFormatSupport = () => {
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
    const elem = document.createElement('video');
    const types = {};

    try {
        if (elem.canPlayType) {
            types.mp4 = elem
                .canPlayType('video/mp4; codecs="avc1.42E01E"')
                .replace(/^no$/, '');
            types.ogg = elem
                .canPlayType('video/ogg; codecs="theora"')
                .replace(/^no$/, '');
            types.webm = elem
                .canPlayType('video/webm; codecs="vp8, vorbis"')
                .replace(/^no$/, '');
        }
    } catch (e) {
        // do nothing
    }

    return types;
};

export const hasTouchScreen = (): boolean =>
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof DocumentTouch);

export const hasPushStateSupport: () => boolean = (() => {
    let supportsPushState: boolean;
    return () => {
        if (supportsPushState !== undefined) {
            return supportsPushState;
        }
        supportsPushState = false;
        if (window.history && history.pushState) {
            supportsPushState = true;
            // Android stock browser lies about its HistoryAPI support.
            if (window.navigator.userAgent.match(/Android/i)) {
                supportsPushState = !!window.navigator.userAgent.match(
                    /(Chrome|Firefox)/i
                );
            }
        }
        return supportsPushState;
    };
})();
