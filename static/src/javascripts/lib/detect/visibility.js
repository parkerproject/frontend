// @flow

import mediator from 'lib/mediator';

let pageVisibility =
    document.visibilityState ||
    document.webkitVisibilityState ||
    document.mozVisibilityState ||
    document.msVisibilityState ||
    'visible';

const initPageVisibility = () => {
    // Taken from http://stackoverflow.com/a/1060034
    const hidden = 'hidden';

    const onchange = (evt = window.event) => {
        const v = 'visible';
        const h = 'hidden';
        const evtMap = {
            focus: v,
            focusin: v,
            pageshow: v,
            blur: h,
            focusout: h,
            pagehide: h,
        };

        if (evt.type in evtMap) {
            pageVisibility = evtMap[evt.type];
        } else {
            pageVisibility = this[hidden] ? 'hidden' : 'visible';
        }

        mediator.emit(`modules:detect:pagevisibility:${pageVisibility}`);
    };

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
        document.onfocusin = onchange;
        document.onfocusout = onchange;
    } else {
        // All others:
        window.onpageshow = onchange;
        window.onpagehide = onchange;
        window.onfocus = onchange;
        window.onblur = onchange;
    }
};

const pageVisible = () => pageVisibility === 'visible';

export { pageVisible, initPageVisibility };
