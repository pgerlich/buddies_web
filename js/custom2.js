$( document ).ready( initializeMain );
$(document).ready(function() {
    $('#sidr').css('display', 'inline-block');
    $('#simple-menu').sidr({
        side: 'right',
        onOpen: function() {
            $('#simple-menu').find('.navbar-toggle').css('margin-right', '265px')
        },
        onClose: function() {
            $('#simple-menu').find('.navbar-toggle').css('margin-right', '15px')
        }
    });
});

/**
    Initialize things
*/
function initializeMain(){
    //Swipe detection in the main content section (to swipe in/out the nav drawer)
    var hammertime = new Hammer(document.body, null);

    hammertime.on('swipeleft', function(ev) {
        console.log(ev);
        $.sidr('open', 'sidr');
    });

    hammertime.on('swiperight', function(ev) {
        console.log(ev);
        $.sidr('close', 'sidr');
    });




}
