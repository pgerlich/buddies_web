//Angular stuffs
angular.module("myApp", ['ngAnimate', 'ui.bootstrap', 'flow']);
angular.module("myApp").controller("mainCtrl", function($scope, $uibModal){

	 //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    $scope.user = Parse.User.current();

    if (!$scope.user){
        window.location.assign("login")
    } else {
	    $scope.firstName = $scope.user.get("firstName");
	    $scope.lastName = $scope.user.get("lastName");
	    $scope.phone = $scope.user.get("phone");
	    $scope.password = "";
	    $scope.rpassword = "";
	    $scope.email = $scope.user.getEmail();
        $scope.role = $scope.user.get("role");
        if ( $scope.role == 0 ) {
            showCustomerPortal();
        } else if ( $scope.role == 1 ) {
            showEmployeePortal();
        } else if ( $scope.role == 2 ) {
            showAdminPortal();
        }
    }

    /**
		BEGIN CUSTOMER PORTAL
    */

    /**
		Displays Customer Portal
    */
    function showCustomerPortal(){ 
	    $scope.vehicles = [];
	    $scope.cards = [];

	    /*
			Checkout.js Stuffs
		*/
		var handler = StripeCheckout.configure({
			key: 'pk_test_xWbIpv2iutPaLQ7o45yX1gu3',
			image: 'img/B.PNG',
			locale: 'auto',
			panelLabel: "Add Card",
			email: $scope.email,
			allowRememberMe: false,
			token: function(token) {
			  $scope.addCard(token.id);
			}
		});

		$('#addPayment').on('click', function(e) {
			// Open Checkout with further options
			handler.open({
			  name: 'Waterless Buddys'
			});

			e.preventDefault();
		});

		// Close Checkout on page navigation
		$(window).on('popstate', function() {
			handler.close();
		});

	     /**
			Gets vehicles associated with a user
		*/
		$scope.getVehiclesForUser = function(){
			//Setup query to grab the vehicles associated with this customer
			var query = new Parse.Query("Vehicles");
			query.equalTo("customer", {
			        __type: "Pointer",
			        className: "_User",
			        objectId: $scope.user.id
			    });

			var vehicles = []; //Vehicles array

			//Grab vehicles
			query.find({
			  success: function(results) {
			    for(var i = 0; i < results.length; i++ ) {
			    	var vehicle = {make: results[i].get("make"), model: results[i].get("model"), year: results[i].get("year"), color: results[i].get("color"), parseId: results[i].id}
			    	$scope.vehicles.push(vehicle)
			    }

			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message); //TODO: Error handling
			  }
			});
		}

		/**
			Gets cards associated with a user
		*/
		$scope.getCardsForUser = function(){
			$.get( "php/retrieveCustomer.php?CID=" + $scope.user.get("stripeAccount"), function( data ) {
			  var test = JSON.parse(data.slice(21, data.len));
			  $scope.cards = test.sources.data;
			  $scope.$apply();
			});
		}

	    //Payment information
	    if ( $scope.user.get("stripeAccount") ) {
			$scope.getCardsForUser();
		}

		//Vehicles
		$scope.getVehiclesForUser();

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
		    	$scope.addVehicle(vehicle);
		    }, function () {
		    	//Modal was closed instead of saved
		    });
	  	}; 	

	  //Adding a vehicle
	  $scope.addVehicle = function(vehicle){
		var VehicleObject = Parse.Object.extend("Vehicles");
    	var parseVehicle = new VehicleObject();

    	//Set vehicle values
    	parseVehicle.set("customer", $scope.user);
    	parseVehicle.set("make", vehicle.make);
    	parseVehicle.set("model", vehicle.model);
    	parseVehicle.set("color", vehicle.color);
    	parseVehicle.set("license", vehicle.license);
    	parseVehicle.set("type", vehicle.type);
    	parseVehicle.set("picture", vehicle.picture);

    	//Persist to Parse
    	parseVehicle.save(null, {
		  success: function(newParseVehicle) {
		    alert('Saved succesfully');
		    vehicle.parseId = newParseVehicle.id; //Add parse ID
	    	$scope.vehicles.push(vehicle)
	    	$scope.$apply();	    
		  },
		  error: function(vehicle, error) {
		    alert('Failed to create new vehicle, with error code: ' + error.message);
		  }
		});
	  }

	  //Remove a vehicle
	  $scope.removeVehicle = function(vehicle){
		  var shouldDelete = confirm('Are you sure you want to delete ' + vehicle['color'] + ' ' + vehicle['make'] + ' ' + vehicle['model']);

		  if ( shouldDelete ) {
			  var VehicleObject = Parse.Object.extend("Vehicles");
			  var query = new Parse.Query(VehicleObject);

			  query.get(vehicle.parseId, {
				  success: function (vehicle) {
					  vehicle.destroy({
						  success: function (myObject) {
							  $scope.vehicles.splice($scope.vehicles.indexOf(vehicle), 1); //Remove from local view
							  $scope.$apply();
						  },
						  error: function (myObject, error) {
							  //Some error deleting
						  }
					  });
				  },
				  error: function (object, error) {
					  //Some error retrieving
				  }
			  });
		  }
	  }

	  	//Add a credit card
	  	$scope.addCard = function(ccId){
		    $.get( "php/addCard.php?CID=" + $scope.user.get("stripeAccount") + "&TOKEN=" + ccId, function( data ) {
			  var test = JSON.parse(data.slice(17, data.len));
			  $scope.cards.push(test);
			  $scope.$apply();
			});
	  	}

	  	//Remove a card
	  	$scope.removeCard = function(card){
            var shouldDelete = confirm('Are you sure you want to delete the card ending in ' + card['last4']);
            if ( shouldDelete ) {
                $.get( "php/deleteCard.php?CID=" + $scope.user.get("stripeAccount") + "&CARDID=" + card.id, function( data ) {
                    $scope.cards.splice($scope.cards.indexOf(card), 1); //Remove from local view
                    alert("removed succesfully");
                });
            }
	  	}
	}

	/*
		END CUSTOMER PORTAL
	*/

	/*
		Begin Employee Portal
	*/

	function showEmployeePortal(){
		$scope.bankAccount = "";

		//Displays vehicle add modal
		$scope.openBankModal = function () {
		    var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'bankAccountDetails.html',
		      windowClass: 'adjustModalHeight',
		      controller: 'bankInfoCollectionCtrl'
		    });

		    //Upon pressing save, save the vehicle (after validating input below)
		    modalInstance.result.then(function (bankAcc) {

		    	//Call to stripe.JS to tokenize information
		    	Stripe.bankAccount.createToken({
				  country: 'US',
				  currency: 'USD',
				  routing_number: bankAcc.routing,
				  account_number: bankAcc.account,
				  name: $scope.firstName + ' ' + $scope.lastName,
				  account_holder_type: 'individual'
				}, $scope.saveBankAcc);

		    }, function () {
		    	//Modal was closed instead of saved
		    });
	  	};

	  	//Save the bank account
	  	$scope.saveBankAcc = function(status, response){
	  		
	  		if ( response.error ) {
	  			console.log(response.error);
	  			console.log("TODO: input validation");
	  		} else {
				$.get( "php/addBankToEmployee.php?ACCID=acct_17cqc9A1OaInK8I9&TOKEN=" + response.id, function( data ) {
					console.log(data); 
				});
	  		}
	  	}	 
	}

	/*
		End Employee Portal
	*/

	/* Misc / General functions/information */
	$scope.saveProfile = function(){
		//TODO: Input validation
		$scope.user.set("firstName", $scope.firstName);
		$scope.user.set("lastName", $scope.lastName);
		$scope.user.set("phone", $scope.phone);

		var shouldLogout = false;

		if ( $scope.password == $scope.rpassword && $scope.password != "" ) {
			$scope.user.setPassword($scope.password);
			shouldLogout = true;
		}

		$scope.user.save(null, {
			success: function(user) {
				alert("Saved succesfully");
				if (shouldLogout){
					logout();
				}
			},
			error: function(error){
				alert("Error: " + error.code + " " + error.message); //TODO: Error handling
			}
		})
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

//Controller for grabbing bank info
angular.module('myApp').controller('bankInfoCollectionCtrl', function ($scope, $uibModalInstance) {

	$scope.routingNumber = "";
	$scope.accountNumber = "";

  $scope.ok = function () {
  	//TODO: Validate inputs
    $uibModalInstance.close({routing: $scope.routingNumber, account: $scope.accountNumber});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});