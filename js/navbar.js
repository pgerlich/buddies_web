//Angular stuffs

angular.module("myApp").controller("navBar", function ($scope) {

    //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    $scope.user = Parse.User.current();

    if (!$scope.user) {
        window.location.assign("login")
    } else {

        $scope.role = $scope.user.get("role");

    }

});
