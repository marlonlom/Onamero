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
    var dirRenderer;

    w.portrait = w.innerHeight > w.innerWidth;

    templates.mapping_tpl = hb.templates.mapping;

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

        var blistener;

        var myOptions = {
            zoom: 8,
            center: detLatLng,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(w.document.getElementById("map_canvas"), myOptions);

        var currCenter = map.getCenter();
        bounds.extend(detLatLng);
        map.fitBounds(bounds);

        tsp = new BpTspSolver(map, document.getElementById("my_textual_div"));
        tsp.setDirectionUnits("m");
        google.maps.event.addListener(tsp.getGDirectionsService(), "error", function () {
            alert("Request failed. ");
        });


        blistener = google.maps.event.addListener(map, 'bounds_changed', function (event) {
            if (this.getZoom() > 13) {
                this.setZoom(13);
            }
            google.maps.event.removeListener(blistener);
        });

        google.maps.event.addDomListener(w, 'resize', function () {
            map.setCenter(detLatLng);
            setViewportToCover();
            handleFooterResize();
        });

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

    var formatDirections = function (gdir) {
        if (gdir) {
            var details = '';
            $.each(gdir.legs, function (i, leg) {
                details += '<div class="route-header"><b>' + leg.start_address + '</b></div>';
                console.log('leg.start_location', leg.start_location.toString());
                $.each(leg.steps, function (j, step) {
                    details += '<div class="route-steps">';
                    details += '<span>' + step.instructions + '</span>';
                    details += '<i style="display:block;">' + step.distance.text + '</i>';
                    details += '</div>';
                    console.log('step.instructions[' + j + ']', step.instructions);
                });
            });
            $('.itinerary-detailbox').html(details);
        }
    };

    var onTSPSolveCallback = function (mytsp) {
        $('.progressbox-routing i').html('');
        $('.progressbox-routing').hide();
        $('section.roundtrip-config-solver button').prop('disabled', false);
        var dirRes = mytsp.getGDirections();
        var dir = dirRes.routes[0];
        console.log('directions', dir);
        if (dirRenderer != null) {
            dirRenderer.setMap(null);
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
        $('body').html('');
    };

    o.showAlert = customAlertHandling;
    o.showMappingView = showMapScreen;
    o.initializeMap = initializeMap;
    o.showOfflineView = showOfflineScreen;

    return o;
})(window, Handlebars, $);

window.Onamero = Onamero;