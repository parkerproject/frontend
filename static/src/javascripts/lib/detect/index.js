// @flow

import { adblockInUse } from './adblock';
import {
    breakpointNames,
    hasCrossedBreakpoint,
    getBreakpoint,
    isBreakpoint,
} from './breakpoints';
import { hasTouchScreen, isIOS, isAndroid, getUserAgent } from './device';
import { getReferrer } from './journey';
import { hasPushStateSupport } from './supports';
import { isFireFoxOSApp } from './vendor';
import { getViewport } from './viewport';
import { pageVisible, initPageVisibility } from './visibility';

const isEnhanced = () => window.guardian.isEnhanced;

export {
    isEnhanced,
    adblockInUse,
    breakpointNames,
    hasCrossedBreakpoint,
    getBreakpoint,
    isBreakpoint,
    hasTouchScreen,
    isIOS,
    isAndroid,
    getUserAgent,
    getReferrer,
    hasPushStateSupport,
    isFireFoxOSApp,
    getViewport,
    pageVisible,
    initPageVisibility,
};
