var Onamero = (function (w, hb, google) {
    "use strict";
    var o = {};
    o['gmapsLibraryLoaded'] = false;

    var templates = {};

    templates['maps'] = hb.compile(w.document.querySelector('#mapping-view-template').innerHTML);

    var customAlertHandling = function (message, title) {
        if (w.navigator.notification) {
            w.navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    };

    var initializeMap = function () {
        var detLatLng = new google.maps.LatLng(4.587376, -74.075317);
        var myOptions = {
            zoom: 5,
            center: detLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(w.document.getElementById("map_canvas"), myOptions);


        var currCenter = map.getCenter();

        google.maps.event.addDomListener(w, 'resize', function () {
            map.setCenter(currCenter);
        });
    };

    var showMapScreen = function () {
        w.document.querySelector('body').innerHTML = templates['maps'];
        this.initializeMap();
    };
    
    var showOfflineScreen = function () {
        w.document.querySelector('body').innerHTML = '<b>No hay conexi&oacute;n a internet.</b>';
        this.initializeMap();
    };

    o['showAlert'] = customAlertHandling;
    o['showMappingView'] = showMapScreen;
    o['showOfflineView'] = showOfflineScreen;

    return o;
})(window, Handlebars, google);

window.Onamero = Onamero;