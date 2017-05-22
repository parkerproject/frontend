// @flow

/* global DocumentTouch: true */

const hasTouchScreen = (): boolean =>
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof DocumentTouch);

const isIOS = () => /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);

const isAndroid = () => /Android/i.test(navigator.userAgent);

const getUserAgent = (() => {
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
    ) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return `IE ${tem[1] || ''}`;
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);
        if (tem !== null) {
            return `Opera ${tem[1]}`;
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem !== null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        browser: M[0],
        version: M[1],
    };
})();

export { hasTouchScreen, isIOS, isAndroid, getUserAgent };
