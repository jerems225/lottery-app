(function ($) {
    "use strict";

    function getTimeFromNow() {
        var closedAt = new Date("2023-03-20T12:54:00");
        var currentDate = new Date();
        return new Date(new Date().valueOf() + (closedAt - currentDate ));
    }

    $('#clock-c').countdown(getTimeFromNow(), function(event) {
      var $this = $(this).html(event.strftime(''
        + '<span class="h1 font-weight-bold">%M</span> Min'
        + '<span class="h1 font-weight-bold">%S</span> Sec'));
    })
    .on('finish.countdown', function(event) {
        // Ajouter votre fonction de rappel ici
        window.location.reload()
    });

})(jQuery);