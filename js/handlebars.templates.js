(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['mapping'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"container\">\r\n    <div id=\"header\">\r\n        <img src=\"img/header01.png\" class=\"dane_logo01\">\r\n        <img src=\"img/header02.png\" class=\"dane_logo02\">\r\n        <div style='clear:both'></div>\r\n    </div>\r\n    <div id=\"content\">\r\n        <div class=\"paddedContent\">\r\n            <div id=\"map_canvas\" style=\"width: 100%; height: 100%;\">cargando...</div>\r\n        </div>\r\n    </div>\r\n    <div id=\"footer\">\r\n        <button type=\"button\" id=\"btnToogleRoundTrip\">Nuevo</button>\r\n    </div>\r\n    <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?sensor=false\"></script>\r\n</div>";
  });
})();