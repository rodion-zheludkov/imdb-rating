Components.utils.import("resource://imdbrating/imdbRatingCommon.js");
Components.utils.import("resource://imdbrating/imdbRating.js");

/**
 * ImdbRatingChrome namespace.
 */
if ("undefined" == typeof(ImdbRatingChrome)) {
    var ImdbRatingChrome = {
        init: function() {
            var requestNotifier = new ImdbRating.RequestNotifier();
            requestNotifier.addListener(new ImdbRating.AlertListener());
            var imdbMenuEntry = new ImdbRating.ImdbMenuEntry(
                document.getElementById("contentAreaContextMenu"),
                document.getElementById("imdbMenuEntry"),
                new ImdbRating.SearchCommand(requestNotifier));
        }
    };
};

window.addEventListener("load", 
    function() { 
        ImdbRatingChrome.init(); 
    }, false);
