// @flow

const adblockInUse = new Promise(resolve => {
    if (
        Object.prototype.hasOwnProperty.call(
            window.guardian.adBlockers,
            'active'
        )
    ) {
        // adblock detection has completed
        resolve(window.guardian.adBlockers.active);
    } else {
        // Push a listener for when the JS loads
        window.guardian.adBlockers.onDetect.push(resolve);
    }
});

export { adblockInUse };
