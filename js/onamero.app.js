var Onamero = (function (w, hb, $) {
    "use strict";
    var o = {};
    o['gmapsLibraryLoaded'] = false;
    var map;
    var markers;
    var manageMarkersEvent;
    var currStep = 1;
    var markerCount = 0;
    var markerLimit = 5;

    w.portrait = window.innerHeight > window.innerWidth;

    var templates = {};
    templates['mapping_tpl'] = hb.templates['mapping'];

    var customAlertHandling = function (message, title) {
        if (w.navigator.notification) {
            w.navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    };

    var clickEvt = function () {
        return 'click';
    };

    var handleFooterResize = function () {
        if (currStep === 1) {
            if (w.portrait === true) {
                $('#footer').css('height', '40px');
                $('.paddedContent').css('height', '30em');
            } else {
                $('#footer').css('height', '84%');
                $('.paddedContent').css('height', '100%');
            }
        } else if (currStep > 1) {
            if (w.portrait === true) {
                $('#footer').css('height', '200px');
                $('.paddedContent').css('height', '17.5em');
            } else {
                $('#footer').css('height', '84%');
                $('.paddedContent').css('height', '100%');
            }
        }
    };

    var initializeMap = function () {
        google.maps.visualRefresh = true;
        var detLatLng = new google.maps.LatLng(4.587376, -74.075317);
        var myOptions = {
            zoom: 8,
            center: detLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(w.document.getElementById("map_canvas"), myOptions);

        var bounds = new google.maps.LatLngBounds();
        bounds.extend(detLatLng);
        map.fitBounds(bounds);
        var blistener = google.maps.event.addListener(map, 'bounds_changed', function (event) {
            if (this.getZoom() > 12) {
                this.setZoom(12);
            }
            google.maps.event.removeListener(blistener);
        });

        var currCenter = map.getCenter();

        google.maps.event.addDomListener(w, 'resize', function () {
            w.portrait = window.innerHeight > window.innerWidth;
            map.setCenter(detLatLng);
            handleFooterResize();
        });

        prepareMapControls(google);
    };

    var prepareMapControls = function (google) {
        var markerImg = "http://google-maps-icons.googlecode.com/files/gray_nro_.png";
        $('button#btnToogleRoundTrip').on(clickEvt(), function (e) {
            e.preventDefault();
            currStep = 2;
            handleFooterResize();
            markers = new google.maps.MVCArray();
            $('.roundtrip-box').hide();
            $('section.roundtrip-add_points').show();

            manageMarkersEvent = google.maps.event.addListener(map, 'click', function (e) {
                if (markerCount < markerLimit) {
                    var mkc = (markerCount + 1);
                    var mk_title = markerCount === 1 ? 'ubicación #1' : 'ubicación #' + mkc;
                    var cmarker = new google.maps.Marker({
                        position: e.latLng,
                        icon: 'http://google-maps-icons.googlecode.com/files/gray0' + mkc + '.png',
                        map: map,
                        title: mk_title
                    });
                    $('.marker0' + mkc).html('#' + mkc + '.&nbsp;' + e.latLng.toString());
                    markers.insertAt(markerCount, cmarker);
                    markerCount++;
                }
            });
        });
        $('button#btnRollbackLocations').on(clickEvt(), function (e) {
            e.preventDefault();
            markers.forEach(function(mkr,i){
                mkr.setMap(null);
            });
            markers.clear();
            $('.marker-item').html('');
            google.maps.event.removeListener(manageMarkersEvent);
            manageMarkersEvent = null;
            markers = null;
            currStep = 1;
            markerCount = 0;
            handleFooterResize();
            $('.roundtrip-box').hide();
            $('section.roundtrip-welcome').show();
        });
    };

    var loadGoogleMapsScript = function () {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&region=CO&' +
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