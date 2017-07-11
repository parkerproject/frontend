// @flow
/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/* global DocumentTouch: true */

import mediator from 'lib/mediator';
import performanceAPI from 'lib/window-performance';

let supportsPushState;
let getUserAgent;

let pageVisibility =
    document.visibilityState ||
    document.webkitVisibilityState ||
    document.mozVisibilityState ||
    document.msVisibilityState ||
    'visible';

const // Ordered lists of breakpoints
// These should match those defined in:
//   stylesheets/_vars.scss
//   common/app/layout/Breakpoint.scala
breakpoints = [
    {
        name: 'mobile',
        isTweakpoint: false,
        width: 0,
    },
    {
        name: 'mobileMedium',
        isTweakpoint: true,
        width: 375,
    },
    {
        name: 'mobileLandscape',
        isTweakpoint: true,
        width: 480,
    },
    {
        name: 'phablet',
        isTweakpoint: true,
        width: 660,
    },
    {
        name: 'tablet',
        isTweakpoint: false,
        width: 740,
    },
    {
        name: 'desktop',
        isTweakpoint: false,
        width: 980,
    },
    {
        name: 'leftCol',
        isTweakpoint: true,
        width: 1140,
    },
    {
        name: 'wide',
        isTweakpoint: false,
        width: 1300,
    },
];

let currentBreakpoint;
let currentTweakpoint;

const getBreakpointName = breakpoint => breakpoint.name;

const getBreakpoint = includeTweakpoint =>
    includeTweakpoint ? currentTweakpoint : currentBreakpoint;

const breakpointNames = breakpoints.map(getBreakpointName);

const findBreakpoint = tweakpoint => {
    let breakpointIndex = breakpointNames.indexOf(tweakpoint);
    let breakpoint = breakpoints[breakpointIndex];
    while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
        breakpointIndex -= 1;
        breakpoint = breakpoints[breakpointIndex];
    }
    return breakpoint.name;
};

const updateBreakpoint = breakpoint => {
    if (breakpoint.isTweakpoint) {
        currentTweakpoint = breakpoint.name;
        currentBreakpoint = findBreakpoint(currentTweakpoint);
    } else {
        currentBreakpoint = currentTweakpoint = breakpoint.name;
    }
};

const onMatchingBreakpoint = mql => {
    if (mql.matches) {
        updateBreakpoint(this);
    }
};

const initMediaQueryListeners = win => {
    breakpoints.forEach((bp, index, bps) => {
        // We create mutually exclusive (min-width) and (max-width) media queries
        // to facilitate the breakpoint/tweakpoint logic.
        bp.mql =
            index < bps.length - 1
                ? win.matchMedia(
                      `(min-width:${bp.width}px) and (max-width:${bps[index + 1]
                          .width - 1}px)`
                  )
                : win.matchMedia(`(min-width:${bp.width}px)`);
        bp.listener = onMatchingBreakpoint.bind(bp);
        bp.mql.addListener(bp.listener);
        bp.listener(bp.mql);
    });
};

const updateBreakpoints = () => {
    // The implementation for browsers that don't support window.matchMedia is simpler,
    // but relies on (1) the resize event, (2) layout and (3) hidden generated content
    // on a pseudo-element
    const bodyStyle = window.getComputedStyle(document.body, '::after');
    const breakpointName = bodyStyle.content.substring(
        1,
        bodyStyle.content.length - 1
    );
    const breakpointIndex = breakpointNames.indexOf(breakpointName);
    updateBreakpoint(breakpoints[breakpointIndex]);
};

const init = win => {
    if ('matchMedia' in win) {
        initMediaQueryListeners(win);
    } else {
        updateBreakpoints.call(win);
        mediator.on('window:throttledResize', updateBreakpoints);
    }
};

init(window);

/**
 *     Util: returns a function that:
 *     1. takes a callback function
 *     2. calls it if the window width has crossed any of our layout modes since the last call to this function
 *     Usage. Setup:
 *      var hasCrossedTheMagicLines = hasCrossedBreakpoint()
 *     then:
 *       hasCrossedTheMagicLines(function(){ do stuff })
 */
const hasCrossedBreakpoint = includeTweakpoint => {
    let was = getBreakpoint(includeTweakpoint);
    return callback => {
        const is = getBreakpoint(includeTweakpoint);
        if (is !== was) {
            callback(is, was);
            was = is;
        }
    };
};

const isReload = () => {
    if ('navigation' in performanceAPI) {
        return (
            performanceAPI.navigation.type ===
            performanceAPI.navigation.TYPE_RELOAD
        );
    }
    // We have no way of knowing if it was a reload on unsupported browsers.
    // I figure we could only possibly want to treat it as false in that case.
    return false;
};

const isIOS = () => /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);

const isAndroid = () => /Android/i.test(navigator.userAgent);

const isFireFoxOSApp = () => navigator.mozApps && !window.locationbar.visible;

const isFacebookApp = () => navigator.userAgent.indexOf('FBAN/') > -1;

const isTwitterApp = () =>
    // NB Android app is indistinguishable from Chrome: http://mobiforge.com/research-analysis/webviews-and-user-agent-strings
    navigator.userAgent.indexOf('Twitter for iPhone') > -1;

const isTwitterReferral = () => /\.t\.co/.test(document.referrer);

const isFacebookReferral = () => /\.facebook\.com/.test(document.referrer);

const isGuardianReferral = () => /\.theguardian\.com/.test(document.referrer);

const socialContext = () => {
    const override = /socialContext=(facebook|twitter)/.exec(
        window.location.hash
    );

    if (override !== null) {
        return override[1];
    } else if (isFacebookApp() || isFacebookReferral()) {
        return 'facebook';
    } else if (isTwitterApp() || isTwitterReferral()) {
        return 'twitter';
    }
    return null;
};

const getUserAgent = (() => {
    const ua = navigator.userAgent;
    let tem;
    let M =
        ua.match(
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

const hasTouchScreen = () =>
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof DocumentTouch);

const hasPushStateSupport = () => {
    if (supportsPushState !== undefined) {
        return supportsPushState;
    }
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

const getVideoFormatSupport = () => {
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
    const elem = document.createElement('video'),
        types = {};

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
        /**/
    }

    return types;
};

const getOrientation = () =>
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

const getViewport = () => {
    const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0];

    return {
        width: w.innerWidth || e.clientWidth || g.clientWidth,
        height: w.innerHeight || e.clientHeight || g.clientHeight,
    };
};

/**
 *     Usage:
 *     detect.isBreakpoint({min: 'tablet', max: 'leftCol'}) // Will return true for tablet, desktop, leftCol
 *     detect.isBreakpoint({min: 'tablet'}) // Will return true for tablet, desktop, leftCol, wide
 *     detect.isBreakpoint({max: 'tablet'}) // Will return true for mobile, mobileLandscape, tablet and phablet
 *
 *
 */
const isBreakpoint = criteria => {
    const indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
    const indexMax = criteria.max
        ? breakpointNames.indexOf(criteria.max)
        : breakpointNames.length - 1;
    const indexCur = breakpointNames.indexOf(
        currentTweakpoint || currentBreakpoint
    );
    return indexMin <= indexCur && indexCur <= indexMax;
};

// Page Visibility
const initPageVisibility = () => {
    // Taken from http://stackoverflow.com/a/1060034
    const hidden = 'hidden';

    function onchange(evt) {
        const v = 'visible',
            h = 'hidden',
            evtMap = {
                focus: v,
                focusin: v,
                pageshow: v,
                blur: h,
                focusout: h,
                pagehide: h,
            };

        evt = evt || window.event;
        if (evt.type in evtMap) {
            pageVisibility = evtMap[evt.type];
        } else {
            pageVisibility = this[hidden] ? 'hidden' : 'visible';
        }

        mediator.emit(`modules:detect:pagevisibility:${pageVisibility}`);
    }

    // Standards:
    if (hidden in document) {
        document.addEventListener('visibilitychange', onchange);
    } else if ('mozHidden' in document) {
        document.addEventListener('mozvisibilitychange', onchange);
    } else if ('webkitHidden' in document) {
        document.addEventListener('webkitvisibilitychange', onchange);
    } else if ('msHidden' in document) {
        document.addEventListener('msvisibilitychange', onchange);
    } else if ('onfocusin' in document) {
        // IE 9 and lower:
        document.onfocusin = document.onfocusout = onchange;
    } else {
        // All others:
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
    }
};

const pageVisible = () => pageVisibility === 'visible';

const hasWebSocket = () => 'WebSocket' in window;

const isEnhanced = () => window.guardian.isEnhanced;

const adblockInUse = new Promise(resolve => {
    if (window.guardian.adBlockers.hasOwnProperty('active')) {
        // adblock detection has completed
        resolve(window.guardian.adBlockers.active);
    } else {
        // Push a listener for when the JS loads
        window.guardian.adBlockers.onDetect.push(resolve);
    }
});

const getReferrer = () => document.referrer || '';

export default {
    hasCrossedBreakpoint,
    getVideoFormatSupport,
    hasTouchScreen,
    hasPushStateSupport,
    getOrientation,
    getBreakpoint,
    getViewport,
    getUserAgent,
    isIOS,
    isAndroid,
    isFireFoxOSApp,
    isFacebookApp,
    isTwitterApp,
    isFacebookReferral,
    isTwitterReferral,
    isGuardianReferral,
    socialContext,
    isBreakpoint,
    isReload,
    initPageVisibility,
    pageVisible,
    hasWebSocket,
    breakpoints,
    isEnhanced,
    adblockInUse,
    getReferrer,
    init,
};
