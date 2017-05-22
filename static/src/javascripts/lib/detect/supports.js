// @flow

const hasPushStateSupport: () => boolean = (() => {
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

export { hasPushStateSupport };
