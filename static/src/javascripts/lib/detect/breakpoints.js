// @flow
import mediator from 'lib/mediator';
import { breakpoints } from 'constants/breakpoints';

import type { BreakpointName, Breakpoint } from 'constants/breakpoints';

const breakpointNames: Array<BreakpointName> = breakpoints.map(
    (breakpoint: Breakpoint): BreakpointName => breakpoint.name
);

const findBreakpoint = (tweakpoint: BreakpointName): BreakpointName => {
    let breakpointIndex = breakpointNames.indexOf(tweakpoint);
    let breakpoint = breakpoints[breakpointIndex];
    while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
        breakpointIndex -= 1;
        breakpoint = breakpoints[breakpointIndex];
    }
    return breakpoint.name;
};

let currentBreakpoint: BreakpointName;
let currentTweakpoint: BreakpointName;
const updateBreakpoint = (breakpoint: Breakpoint): void => {
    if (breakpoint.isTweakpoint) {
        currentTweakpoint = breakpoint.name;
        currentBreakpoint = findBreakpoint(currentTweakpoint);
    } else {
        currentBreakpoint = breakpoint.name;
        currentTweakpoint = breakpoint.name;
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
        bp.mql = index < bps.length - 1
            ? win.matchMedia(`(min-width:${bp.width}px) and (max-width:${bps[index + 1].width - 1}px)`)
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

const init = (win: window) => {
    if ('matchMedia' in win) {
        initMediaQueryListeners(win);
    } else {
        updateBreakpoints.call(win);
        mediator.on('window:throttledResize', updateBreakpoints);
    }
};

init(window);

const getBreakpoint = (includeTweakpoint: boolean = false): BreakpointName =>
    includeTweakpoint ? currentTweakpoint : currentBreakpoint;

/**
 *     Util: returns a function that:
 *     1. takes a callback function
 *     2. calls it if the window width has crossed any of our layout modes since the last call to this function
 *     Usage. Setup:
 *      var hasCrossedTheMagicLines = hasCrossedBreakpoint()
 *     then:
 *       hasCrossedTheMagicLines(function(){ do stuff })
 */
const hasCrossedBreakpoint = (includeTweakpoint: boolean): Function => {
    let was = getBreakpoint(includeTweakpoint);
    return (callback: Function) => {
        const is = getBreakpoint(includeTweakpoint);
        if (is !== was) {
            callback(is, was);
            was = is;
        }
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
const isBreakpoint = (criteria: {
    min: ?BreakpointName,
    max: ?BreakpointName,
}) => {
    const indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
    const indexMax = criteria.max
        ? breakpointNames.indexOf(criteria.max)
        : breakpointNames.length - 1;
    const indexCur = breakpointNames.indexOf(
        currentTweakpoint || currentBreakpoint
    );
    return indexMin <= indexCur && indexCur <= indexMax;
};

export { breakpointNames, hasCrossedBreakpoint, getBreakpoint, isBreakpoint };
export const _ = { init };
