(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['mapping'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"container\">\r\n    <div id=\"header\">\r\n        <img src=\"img/header01.png\" class=\"dane_logo01\">\r\n        <img src=\"img/header02.png\" class=\"dane_logo02\">\r\n        <div style='clear:both'></div>\r\n    </div>\r\n    <div id=\"content\">\r\n        <div class=\"paddedContent\">\r\n            <div id=\"map_canvas\" style=\"width: 100%; height: 100%;\">cargando...</div>\r\n        </div>\r\n    </div>\r\n    <div id=\"footer\">\r\n        <section class=\"roundtrip-welcome roundtrip-box\">\r\n            <h4>Iniciar recorrido</h4>\r\n            <div>A continuación podrá seleccionar unas cuantas coordenadas en el mapa para armar un recorrido.<br/>Con &eacute;stos se obtendr&aacute; una ruta &Oacute;ptima.</div>\r\n            <button id=\"btnToogleRoundTrip\" type=\"button\">Iniciar</button>\r\n        </section>\r\n        <section class=\"roundtrip-add_points roundtrip-box\">\r\n            <h4>Agregar coordenadas</h4>\r\n            <div>Haz clic en el mapa, puedes agregar hasta 5 puntos.</div>\r\n            <button id=\"btnCommitLocations\" type=\"button\">Continuar</button>\r\n            <button id=\"btnRollbackLocations\" type=\"button\">Volver</button>\r\n        </section>\r\n    </div>\r\n</div>";
  });
})();