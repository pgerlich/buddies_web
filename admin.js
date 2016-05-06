//Angular stuffs
angular.module("myApp", ['ngAnimate', 'ui.bootstrap', 'flow']);
angular.module("myApp").controller("mainCtrl", function($scope, $uibModal){

	 //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    $scope.user = Parse.User.current();

    $scope.employeeList = [];
	$scope.temp = "";

    if (!$scope.user){
        window.location.assign("login")
    }

     /**
		Gets vehicles associated with a user
	*/
	$scope.getEmployees = function(){
		var query = new Parse.Query("User");
		query.equalTo("role", 1);

		query.find({
		  success: function(results) {

              // Add employees
		    for(var i = 0; i < results.length; i++ ) {
                var user = results[i];
                var userMap = {first : user.get('firstName'), last : user.get('lastName'), email : user.get('email'), id : user.id , stripeUser : user, washCount: '...', tipTotal: '...' };
		    	$scope.employeeList.push(userMap);
		    }

              $scope.$apply();

              // Update employee analytics
              for ( var i = 0; i < $scope.employeeList.length; i++ ) {
                  var employee = $scope.employeeList[i];
                  $scope.updateEmployeeAnalytics(employee['id'], i);
              }

              $scope.$apply();
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message); //TODO: Error handling
		  }
		});
	}

    $scope.updateEmployeeAnalytics = function (employeeId, index) {
        var query = new Parse.Query("EmployeeAnalytics");
        query.equalTo("employee", {
            __type: "Pointer",
            className: "_User",
            objectId: employeeId
        });


        query.find({
            success: function (employeeAnalytics) {
                console.log(employeeAnalytics);
                var employee = $scope.employeeList[index];
                var analytic = employeeAnalytics[0];
                employee['washCount'] = analytic.get('washTotal');
                employee['tipTotal'] = analytic.get('tipTotal');
                $scope.$apply();
            }
        });
    }

    $scope.getEmployees();

	//Displays vehicle add modal
	$scope.openEmployeeModal = function () {
	    var modalInstance = $uibModal.open({
	      animation: true,
	      templateUrl: 'employeeAdd.html',
	      windowClass: 'adjustModalHeight',
	      controller: 'employeeCreateController'
	    });

	    //Upon pressing save, save the vehicle (after validating input below)
	    modalInstance.result.then(function (employeeInfo) {

            //Create employee object in stripe
            $.get( "http://paulgerlich.com/__projects/buddys/php/createEmployee.php?EMAIL=" + employeeInfo.email, function( data ) {

				var employeeId = JSON.parse(data.slice(21, data.len)).id;

                ////Setup user object
                var user = new Parse.User();
                user.set("firstName", employeeInfo.first);
                user.set("lastName", employeeInfo.last);
                user.set("username", employeeInfo.email);
                user.set("password", employeeInfo.password);
                user.set("email", employeeInfo.email);
                user.set("role", 1);
				user.set("stripeAccount", employeeId);

				//Call parse signup function
				user.signUp(null, {
					success: function(user) {

						//Add supplemental employee information to stripe
						$.get( "http://paulgerlich.com/__projects/buddys/php/addEmployeeInformation" +
							".php?ACCID=" + employeeId + "&MONTH=" + employeeInfo.month +
							"&DAY=" + employeeInfo.day + "&YEAR=" + employeeInfo.year +
							"&FIRST=" + employeeInfo.first + "&LAST=" + employeeInfo.last, function( data ) {
								$scope.temp = employeeId;

								//Call to stripe.JS to tokenize information
								Stripe.bankAccount.createToken({
								   country: 'US',
								   currency: 'USD',
								   routing_number: employeeInfo.routing,
								   account_number: employeeInfo.account,
								   name: employeeInfo.first + ' ' + employeeInfo.last,
								   account_holder_type: 'individual'
								 }, $scope.saveBankAcc);
						});

						//Create employee analytics entry
						var AnalyticObject = Parse.Object.extend("EmployeeAnalytics");
						var employeeAnalytic = new AnalyticObject();

						employeeAnalytic.set("employee", job.employee);
						employeeAnalytic.set("tipTotal", job.tip);
						employeeAnalytic.set("washTotal", 1);


						employeeAnalytic.save(null, {
							success: function(newParseVehicle) {
								//TODO: Alert of success
							}
						});

					},
					error: function(user, error) {
						// Show the error message somewhere and let the user try again.
						alert("Error: " + error.code + " " + error.message);
					}
				});

            });

	    }, function () {
	    	//Modal was closed instead of saved
	    });
  	};

	//TODO: Has to be cloud code
	//$scope.deleteEmployee = function(user){
	//	if (confirm('Delete ' + user.get('firstName') + ' are you sure?')) {
	//		Parse.Cloud.useMasterKey()
	//		user.destroy({
	//			success: function() {
	//				alert('User deleted successfully');
	//			},
	//			error: function(error) {
	//				alert(error.message);
	//			}
	//		});
	//	}
	//}

  	//Save the bank account
  	$scope.saveBankAcc = function(status, response){

  		if ( response.error ) {
  			console.log(response.error);
  			console.log("TODO: input validation");
  		} else {
			console.log($scope.temp);
			$.get( "http://paulgerlich.com/__projects/buddys/php/addBankToEmployee.php?ACCID=" + $scope.temp + "&TOKEN=" + response.id, function( data ) {
				console.log(data);
				$scope.$apply();
			});
  		}
  	}

});

//Controller for grabbing bank info
angular.module('myApp').controller('employeeCreateController', function ($scope, $uibModalInstance) {

	$scope.first = "";
	$scope.last = "";
	$scope.email = "";
	$scope.password = "";
	$scope.month = "";
	$scope.day = "";
	$scope.year = "";
	$scope.routingNumber = "";
	$scope.accountNumber = "";

	console.log('wut')

  $scope.ok = function () {
  	//TODO: Validate inputs
    $uibModalInstance.close({first: $scope.first, last: $scope.last, email: $scope.email, password: $scope.password, month: $scope.month, day: $scope.day, year: $scope.year, routing: $scope.routingNumber, account: $scope.accountNumber});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});