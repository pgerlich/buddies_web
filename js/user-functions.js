$( document ).ready( initializeMain );

/**
    Initialize Parse and load our UI
*/
function initializeMain(){
    //Initialize JQuery
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    var currentUser = Parse.User.current();

    // if (currentUser) {
    //     //Logged in
    // } else {
    //     //Not logged in
    // }
}

function redirectToProfile(){
    var currentUser = Parse.User.current();

    if (currentUser){
        window.location.assign("profile")
    } 
}

/**
* Function to log a user in to Parse
*/
function login(){
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();

    //Validate email meets expectation, or set error message
    //Validate password meets expectation, or set error message

    Parse.User.logIn(email, password, {
        success: function(user) {
          var role = user.get("role");
          var location = "profile";
          
          switch ( role ) {
            case 0:
              location = "schedule";
              break;
            case 1:
              location = "jobs";
              break;
            case 2:
              location = "admin";
              break;
            default:
              break;
          }

          window.location.assign(location);
        },

        error: function(user, error) {
            //TODO: Error Handling
           alert("Error: " + error.code + " " + error.message);
        }
    });

}

/**
    Log the user out
*/
function logout(){
    Parse.User.logOut();
    window.location.assign("login")
}