/**
 * Delegates DOM event to provided selector
 *
 * @param {string} eventName
 * @param {string} selector
 * @param {function} callback
 */
function delegate(eventName, selector, callback) {
    document.addEventListener(eventName, function(e) {
        if (e.target && e.target.matches(selector)) {
            callback(e);
        }
    });
}

export default delegate;