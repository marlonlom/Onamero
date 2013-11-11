var Onamero = (function () {
    "use strict";
    var module = {};
    var defaultCenter = new g.maps.LatLng(4.587376, -74.075317);
    var mapOptions = {
        zoom: 5,
        center: defaultCenter,
        mapTypeId: g.maps.MapTypeId.ROADMAP
    };
    var startMapbox = function () {
        g.maps.visualRefresh = true;
    }
}();

window.Onamero = Onamero;