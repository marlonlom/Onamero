var Onamero = (function (w, hb, $) {
    "use strict";
    var o = {};
    o['gmapsLibraryLoaded'] = false;

    var templates = {};
    templates['mapping_tpl'] = hb.templates['mapping'];

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
            map.setCenter(detLatLng);
        });
    };

    var loadGoogleMapsScript = function() {
       var script = document.createElement('script');
       script.type = 'text/javascript';
       script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&' +
           'callback=Onamero.initializeMap';
       document.body.appendChild(script);
   };
    
    var showMapScreen = function () {
        $('body').html(templates.mapping_tpl({}));
        loadGoogleMapsScript();
    };
    
    var showOfflineScreen = function () {
        $('body').html('');
    };

    o['showAlert'] = customAlertHandling;
    o['showMappingView'] = showMapScreen;
    o['initializeMap'] = initializeMap;
    o['showOfflineView'] = showOfflineScreen;

    return o;
})(window, Handlebars, $);

window.Onamero = Onamero;