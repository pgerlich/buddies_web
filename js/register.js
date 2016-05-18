//Angular stuffs
angular.module("myApp", ['ngAnimate', 'ui.bootstrap', 'flow']);
angular.module("myApp").controller("mainCtrl", function($scope, $uibModal){

	 //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    //Status flags
    $scope.formComplete = false;
    $scope.vehicleAdded = false;
    $scope.paymentAdded = false;

	//Profile information
	$scope.firstName = "";
	$scope.lastName = "";
	$scope.phoneNumber = "";
	$scope.inputEmail = "";
	$scope.inputPassword = "";
	$scope.inputRepeatPassword = "";

	$scope.openPaymentModal = function() {
		/*
			Setup handler onCall (otherwise it initializes the email w/o a value)
		*/
		var handler = StripeCheckout.configure({
			key: 'pk_test_xWbIpv2iutPaLQ7o45yX1gu3',
			image: 'img/B.PNG',
			locale: 'auto',
			panelLabel: "Add Card",
			email: $scope.inputEmail,
			allowRememberMe: false,
			token: function(token) {
			  $scope.cardToken = token.id;
			  $scope.paymentAdded = true;
			  $scope.$apply();
			}
		});

		// Open Checkout with further options
		handler.open({
		  name: 'Waterless Buddys'
		});

	}

	// Close Checkout on page navigation
	$(window).on('popstate', function() {
		handler.close();
	});


	//Displays vehicle add modal
	$scope.openVehicleModal = function () {
	    var modalInstance = $uibModal.open({
	      animation: true,
	      templateUrl: 'vehicleModal.html',
	      windowClass: 'adjustModalHeight',
	      controller: 'vehicleModalSaveCtrl'
	    });

	    //Upon pressing save, save the vehicle (after validating input below)
	    modalInstance.result.then(function (vehicle) {
	    	$scope.vehicle = vehicle;
	    	$scope.vehicleAdded = true;
			$scope.$apply();
	    }, function () {
	    	//Modal was closed instead of saved
	    });
  	}; 	

	/**
	    Sanitize/validate input and register a user
	*/
	$scope.register = function(){

	    //Need the customer id before we create the stripe account
	    $.post( "php/createCustomer.php?TOKEN=" + $scope.cardToken + "&EMAIL=" + $scope.inputEmail, function( data ) {
	        //TODO: Differentiate success/failure7 if necessary
	        console.log(data);
	        var customerID = JSON.parse(data.slice(21, data.len)).id;
	      
	        //Validate first, last, phone, email, password is there
	        if($("#firstName")[0].checkValidity() && $("#lastName")[0].checkValidity() && $("#phoneNumber")[0].checkValidity() && $("#inputEmail")[0].checkValidity() && $("#inputPassword")[0].checkValidity() && $("#inputPasswordRepeat")[0].checkValidity()){
	            //Set attributes of user to match the column name
	            var user = new Parse.User();
	            user.set("username", $scope.inputEmail);
	            user.set("password", $scope.inputPassword);
	            user.set("email", $scope.inputEmail);
	            user.set("role", 0); //0 --> Customer by default. Employees/Admins are added in admin panel
	            user.set("stripeAccount", customerID);
	            user.set("firstName", $scope.firstName);
	            user.set("lastName", $scope.lastName);
	            user.set("phone", $scope.phoneNumber);

	            //Call parse signup function
	            user.signUp(null, {
	                success: function(user) {
	                    $scope.user = user;
	                    $scope.addVehicle();
	                },
	                error: function(user, error) {
	                    // Show the error message somewhere and let the user try again.
	                    alert("Error: " + error.code + " " + error.message);
	                }
	            });
	        }

	    });

	}


  //Adding a vehicle
  $scope.addVehicle = function(){
	var VehicleObject = Parse.Object.extend("Vehicles");
	var parseVehicle = new VehicleObject();

	//Set vehicle values
	parseVehicle.set("customer", $scope.user);
	parseVehicle.set("make", $scope.vehicle.make);
	parseVehicle.set("model", $scope.vehicle.model);
	parseVehicle.set("color", $scope.vehicle.color);
	parseVehicle.set("license", $scope.vehicle.license);
	parseVehicle.set("type", $scope.vehicle.type);
	parseVehicle.set("picture", $scope.vehicle.picture);

	//Persist to Parse
	parseVehicle.save(null, {
	  success: function(newParseVehicle) {

	    //TODO: All this ugly repeated code and horrible structure feels bad, man.
	    var role = $scope.user.get("role");
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

          window.location.assign(location)
	  },
	  error: function(vehicle, error) {
	    alert('Failed to create new vehicle, with error code: ' + error.message);
	  }
	});
  }

});

//Controller for vehicle modal
angular.module('myApp').controller('vehicleModalSaveCtrl', function ($scope, $uibModalInstance) {

  $scope.make = "";
  $scope.model = "";
  $scope.ccolor = "";
  $scope.license = "";
  $scope.washType = "";
  $scope.vehiclePicture = {};

  $scope.ok = function () {
  	//Setup picture
    var pictureFile = $scope.vehiclePicture.flow.files[0].file;
    var pictureParseFile = new Parse.File("B4", pictureFile);

  	//TODO: Validate inputs
  	var vehicle = {make: $scope.make, model: $scope.model, color: $scope.ccolor, license: $scope.license, type: $scope.washType, picture: pictureParseFile};
    $uibModalInstance.close(vehicle);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

//Input validation stuff
$("#registrationForm").validate({
  rules: {
      phoneNumber: {
          required: true,
          phoneUS: true
      },
      inputPassword: "required",
      inputPasswordRepeat: {
          equalTo: "#inputPassword"
      }
  }
});

$("#payment-form").validate({
  rules: {
      ccnum: {
          required: true,
          creditcard: true
      }
  }
});
