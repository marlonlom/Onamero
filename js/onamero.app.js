var Onamero = (function (w, hb, $) {
    "use strict";
    var o = {};
    var map;
    var templates = {};
    var markers = null;
    var manageMarkersEvent;
    var currStep = 1;
    var tspmode = 0;
    var markerCount = 0;
    var markerLimit = 5;
    var tsp;
    var dirRenderer = null;

    w.portrait = w.innerHeight > w.innerWidth;

    templates.mapping_tpl = hb.templates.mapping;
    templates.offline_tpl = hb.templates.offline;

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
        w.portrait = w.innerHeight > w.innerWidth;
        if (currStep === 1) {
            if (w.portrait === true) {
                $('#footer').css('height', '40px');
                $('.paddedContent').css('height', '90%');
            } else {
                $('#footer').css('height', '84%');
                $('.paddedContent').css('height', '100%');
            }
        } else if (currStep > 1) {
            if (w.portrait === true) {
                $('#footer').css('height', '200px');
                $('.paddedContent').css('height', '53%');
            } else {
                $('#footer').css('height', '84%');
                $('.paddedContent').css('height', '100%');
            }
        }
    };

    var initializeMap = function () {
        handleFooterResize();
        google.maps.visualRefresh = true;
        var bounds = new google.maps.LatLngBounds();
        var detLatLng = new google.maps.LatLng(4.587376, -74.075317);

        var myOptions = {
            zoom: 13,
            center: detLatLng,
            panControl: false,
            scaleControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(w.document.getElementById("map_canvas"), myOptions);

        tsp = new BpTspSolver(map, document.getElementById("my_textual_div"));
        tsp.setDirectionUnits("km");
        google.maps.event.addListener(tsp.getGDirectionsService(), "error", function () {
            alert("Request failed. ");
        });

        google.maps.event.addListener(map, 'bounds_changed', function (event) {
            if (this.getZoom() < 10) {
                this.setZoom(10);
            }
            if (this.getZoom() > 16) {
                this.setZoom(16);
            }
        });

        google.maps.event.addDomListener(w, 'resize', function () {
            map.setCenter(detLatLng);
            setViewportToCover();
            handleFooterResize();
        });

        /*w.navigator.geolocation.getCurrentPosition(function (position) {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(lat, lng));
            map.fitBounds(bounds);
        }, function (e) {
            console.log('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        });*/

        prepareMapControls(google);
    };

    var setViewportToCover = function () {
        if (markers !== null && markers.getLength() > 0) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < markers.getLength(); ++i) {
                bounds.extend(markers.getAt(i).getPosition());
            }
            map.fitBounds(bounds);
        }
    };

    var prepareMapControls = function (google) {
        $('button#btnStartRoundTrip').on(clickEvt(), function (e) {
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
                    $('.markers-list').append('<span class="marker-item marker' + mkc + '">' + mkc + '.&nbsp;' + e.latLng.toString() + '</span>');
                    markers.insertAt(markerCount, cmarker);
                    markerCount++;
                }
            });
        });
        $('button#btnCommitLocations').on(clickEvt(), function (e) {
            e.preventDefault();
            var len = markers.getLength();
            if (len < 2) {
                customAlertHandling('Debe seleccionar 2 puntos o más ', 'Información');
                return;
            }
            google.maps.event.removeListener(manageMarkersEvent);
            manageMarkersEvent = null;
            currStep = 2;
            handleFooterResize();
            $('.roundtrip-box').hide();
            $('section.roundtrip-config-solver').show();
        });
        $('button.btn-solve-routing').on(clickEvt(), function (e) {
            e.preventDefault();
            tspmode = Number($(this).attr('data-tspsolver-mode')) || 0;
            var avoidHighways = $('#routeOptAvoidHighways').prop('checked');
            var avoidTolls = $('#routeOptAvoidTolls').prop('checked');

            var wpoints = tsp.getWaypoints();
            $.each(wpoints, function (i, wp) {
                tsp.removeWaypoint(wp);
            });

            markers.forEach(function (m, i) {
                tsp.addWaypoint(m.getPosition())
            });

            tsp.setAvoidHighways(avoidHighways);
            tsp.setAvoidTolls(avoidTolls);

            var travelmd = $('#routeOptTravelMode').val() || 'driving';
            if (travelmd === 'walking') {
                tsp.setTravelMode(google.maps.DirectionsTravelMode.WALKING);
            } else {
                tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
            }

            $('section.roundtrip-config-solver button').prop('disabled', true);
            $('.progressbox-routing i').html('');
            $('.progressbox-routing').show();
            var onProgressCallback = function (mytsp) {
                var progressval = 100 * mytsp.getNumDirectionsComputed() / mytsp.getNumDirectionsNeeded();
                $('.progressbox-routing i').html(progressval + '%');
            };
            tsp.setOnProgressCallback(onProgressCallback);
            if (tspmode === 1) {
                tsp.solveRoundTrip(onTSPSolveCallback);
            } else {
                tsp.solveAtoZ(onTSPSolveCallback);
            }
        });
        $('button#btnRollbackLocations').on(clickEvt(), function (e) {
            e.preventDefault();
            var wpoints = tsp.getWaypoints();
            $.each(wpoints, function (i, wp) {
                tsp.removeWaypoint(wp);
            });
            markers.forEach(function (mkr, i) {
                mkr.setMap(null);
            });
            markers.clear();
            $('.markers-list').html('');
            google.maps.event.removeListener(manageMarkersEvent);
            manageMarkersEvent = null;
            markers.clear();
            currStep = 1;
            markerCount = 0;
            handleFooterResize();
            $('.roundtrip-box').hide();
            $('section.roundtrip-welcome').show();
        });
        $('button#btnResetRoute').on(clickEvt(), function (e) {
            e.preventDefault();
            var wpoints = tsp.getWaypoints();
            $.each(wpoints, function (i, wp) {
                tsp.removeWaypoint(wp);
            });
            markers.forEach(function (mkr, i) {
                mkr.setMap(null);
            });
            markers.clear();
            $('.markers-list,.itinerary-detailbox').html('');
            $('.options-listbox input[type=\'checkbox\']').prop('checked', false);
            $('.options-listbox select').val('');
            manageMarkersEvent = null;
            if (dirRenderer !== null) {
                dirRenderer.setMap(null);
                dirRenderer = null;
            }
            currStep = 1;
            markerCount = 0;
            handleFooterResize();
            $('.roundtrip-box').hide();
            $('section.roundtrip-welcome').show();
        });
    };

    var formatDirections = function (gdir) {
        $('.itinerary-detailbox').html('');
        if (gdir) {
            var details = '';
            var bounds = new google.maps.LatLngBounds();
            var legsCount = gdir.legs.length;
            $.each(gdir.legs, function (i, leg) {

                bounds.extend(leg.start_location);

                details += '<div class="route-header route-item" >';
                details += '<img src="img/push-pin.png" width="22" height="22" ';
                details += 'data-route-location-lat="' + leg.start_location.lat() + '" data-route-location-lng="' + leg.start_location.lng() + '">';
                details += '<b>' + leg.start_address + '</b></div>';
                $.each(leg.steps, function (j, step) {
                    details += '<div class="route-steps route-item">';
                    details += '<img src="img/push-pin-2.png" width="22" height="22" ';
                    details += 'data-route-location-lat="' + step.start_location.lat() + '" data-route-location-lng="' + step.start_location.lng() + '">';
                    details += '<span>' + step.instructions + '</span>';
                    details += '<i style="display:block;">' + step.distance.text + ', ' + step.duration.text + '</i>';
                    details += '</div>';
                });
                if (i === legsCount - 1) {
                    details += '<div class="route-header route-item last-route" >';
                    details += '<img src="img/push-pin.png" width="22" height="22" ';
                    details += 'data-route-location-lat="' + leg.end_location.lat() + '" data-route-location-lng="' + leg.end_location.lng() + '">';
                    details += '<b>' + leg.end_address + '</b></div>';
                }
            });

            $('.itinerary-detailbox').html(details);

            map.fitBounds(bounds);

            $('.route-item img').on(clickEvt(), function (e) {
                e.preventDefault();
                var ptlat = $(this).attr('data-route-location-lat') || '';
                var ptlng = $(this).attr('data-route-location-lng') || '';
                if (ptlat !== '' && ptlng !== '') {
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(new google.maps.LatLng(ptlat, ptlng));
                    map.fitBounds(bounds);
                }
            });
        }
    };

    var onTSPSolveCallback = function (mytsp) {
        $('.progressbox-routing i').html('');
        $('.progressbox-routing').hide();
        $('section.roundtrip-config-solver button').prop('disabled', false);
        var dirRes = mytsp.getGDirections();
        var dir = dirRes.routes[0];
        if (dirRenderer !== null) {
            dirRenderer.setMap(null);
            dirRenderer = null;
        }
        formatDirections(dir);
        dirRenderer = new google.maps.DirectionsRenderer({
            directions: dirRes,
            hideRouteList: true,
            map: map,
            panel: null,
            preserveViewport: false,
            suppressInfoWindows: true,
            suppressMarkers: true
        });
        currStep = 3;
        handleFooterResize();

        $('.roundtrip-box').hide();
        $('section.roundtrip-solver-results').show();
    };

    var loadGoogleMapsScript = function () {
        var script = w.document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&region=CO&' +
            'callback=Onamero.initializeMap';
        w.document.body.appendChild(script);
    };

    var showMapScreen = function () {
        $('body').html(templates.mapping_tpl({}));
        loadGoogleMapsScript();
    };

    var showOfflineScreen = function () {
        $('body').html(templates.offline_tpl({}));
        $('button#btnCheckConnection').on(clickEvt(),function(e){
            e.preventDefault();
            checkConnectionStatus();
        });
    };

    var checkConnectionStatus = function () {
        if ((navigator.network.connection.type).toUpperCase() != "NONE" &&
            (navigator.network.connection.type).toUpperCase() != "UNKNOWN") {
            Onamero.showMappingView();
        }else{
            Onamero.showOfflineView();
        }
    };

    o.showAlert = customAlertHandling;
    o.showMappingView = showMapScreen;
    o.initializeMap = initializeMap;
    o.showOfflineView = showOfflineScreen;

    return o;
})(window, Handlebars, $);

window.Onamero = Onamero;