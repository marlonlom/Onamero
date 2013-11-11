var Onamero = (function (w) {
    "use strict";
    var o = {};
    o['gmapsLibraryLoaded'] = false;

    var customAlertHandling = function (message, title) {
        if (w.navigator.notification) {
            w.navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    };

    o['showAlert'] = customAlertHandling;

    return o;
})(window);

window.Onamero = Onamero;