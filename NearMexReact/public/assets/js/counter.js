(function ($) {
  $.fn.countTo = function (options) {
    options = options || {};

    return $(this).each(function () {
      // se definen las opciones para cada elemento
      var settings = $.extend(
        {},
        $.fn.countTo.defaults,
        {
          from: $(this).data("from"),
          to: $(this).data("to"),
          speed: $(this).data("speed"),
          refreshInterval: $(this).data("refresh-interval"),
          decimals: $(this).data("decimals")
        },
        options
      );

      // cuantas veces se actualiza el valor, y cuanto se incrementa el valor en cada actualizacion
      var loops = Math.ceil(settings.speed / settings.refreshInterval),
        increment = (settings.to - settings.from) / loops;

      // referencias y variables que cambiaran con cada actualizacion
      var self = this,
        $self = $(this),
        loopCount = 0,
        value = settings.from,
        data = $self.data("countTo") || {};

      $self.data("countTo", data);

      // si se encuentra un intervalo existente, se borra primero
      if (data.interval) {
        clearInterval(data.interval);
      }
      data.interval = setInterval(updateTimer, settings.refreshInterval);

      // se inicializa el elemento con el valor inicial
      render(value);

      function updateTimer() {
        value += increment;
        loopCount++;

        render(value);

        if (typeof settings.onUpdate == "function") {
          settings.onUpdate.call(self, value);
        }

        if (loopCount >= loops) {
          // se elimina el intervalo
          $self.removeData("countTo");
          clearInterval(data.interval);
          value = settings.to;

          if (typeof settings.onComplete == "function") {
            settings.onComplete.call(self, value);
          }
        }
      }

      function render(value) {
        var formattedValue = settings.formatter.call(self, value, settings);
        $self.html(formattedValue);
      }
    });
  };

  $.fn.countTo.defaults = {
    from: 0, // el numero en el que el elemento debe comenzar
    to: 0, // el numero en el que el elemento debe terminar
    speed: 1000, // cuanto tiempo debe tomar contar entre los numeros objetivo
    refreshInterval: 100, // cada cuanto tiempo se debe actualizar el elemento
    decimals: 0, // el numero de decimales a mostrar
    formatter: formatter, // manejador para formatear el valor antes de renderizar
    onUpdate: null, // funcion que se ejecuta cada vez que el elemento se actualiza
    onComplete: null // funcion que se ejecuta cuando el elemento termina de actualizarse
  };

  function formatter(value, settings) {
    return value.toFixed(settings.decimals);
  }
})(jQuery);

jQuery(function ($) {
  // ejemplo de formato personalizado
  $(".count-number").data("countToOptions", {
    formatter: function (value, options) {
      return value
        .toFixed(options.decimals)
        .replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
    }
  });

  // se inicia el contador
  $(".timer").each(count);

  function count(options) {
    var $this = $(this);
    options = $.extend({}, options || {}, $this.data("countToOptions") || {});
    $this.countTo(options);
  }
});
