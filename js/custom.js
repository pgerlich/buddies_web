$(document).ready(initializeMain);

/**
 Initialize things
 */
function initializeMain() {
    //Swipe detection in the main content section (to swipe in/out the nav drawer)
    var hammertime = new Hammer(document.getElementById("main-content-section"), null);

    hammertime.on('swiperight', function (ev) {
        console.log(ev);
        $(".navmenu").offcanvas('show');
    });

    hammertime.on('swiperight', function (ev) {
        console.log(ev);
        $(".navmenu").offcanvas('show');
    });


}
