// @flow

const isFireFoxOSApp = (): boolean =>
    navigator.mozApps && !window.locationbar.visible;

export { isFireFoxOSApp };
