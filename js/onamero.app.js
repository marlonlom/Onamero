var Onamero = (function () {
    "use strict";
    var o = {};
    o['gmapsLibraryLoaded'] = false;

    var customAlertHandling = function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    };

    o['showAlert'] = customAlertHandling;

    return o;
})();

window.Onamero = Onamero;