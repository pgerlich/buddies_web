//Angular stuffs
angular.module("myApp", ['ngAnimate', 'ui.bootstrap', 'flow']);
angular.module("myApp").controller("mainCtrl", function ($scope, $uibModal) {
    //Job status constants
    const STATUS_UNCLAIMED = 0;
    const STATUS_CLAIMED = 1;
    const STATUS_COMPLETE = 2;
    const STATUS_PAID = 3;

    //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    $scope.user = Parse.User.current();

    $scope.employeeList = [];

    $scope.jobs = [];

    $scope.tempEmployeeId = "";

    $scope.analyticCounts = {};

    if (!$scope.user) {
        window.location.assign("login")
    }

    /**
     Grab all employees
     */
    $scope.getEmployees = function () {
        var query = new Parse.Query("User");
        query.equalTo("role", 1);

        query.find({
            success: function (results) {

                // Add employees
                for (var i = 0; i < results.length; i++) {
                    var user = results[i];
                    var userMap = {
                        first: user.get('firstName'),
                        last: user.get('lastName'),
                        email: user.get('email'),
                        id: user.id,
                        stripeUser: user,
                        washCount: '...',
                        tipTotal: '...'
                    };
                    $scope.employeeList.push(userMap);
                }

                $scope.$apply();

                // Update employee analytics
                for (var i = 0; i < $scope.employeeList.length; i++) {
                    var employee = $scope.employeeList[i];
                    $scope.updateEmployeeAnalytics(employee['id'], i);
                }

                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    $scope.getEmployees();

    /**
     * Convert the status int to a readable string
     * @param status
     * @returns {*}
     */
    function convertStatusToString(status) {
        if (status == STATUS_UNCLAIMED) {
            return "Unclaimed";
        } else if (status == STATUS_CLAIMED) {
            return "Claimed";
        } else if (status == STATUS_COMPLETE) {
            return "Complete - Unpaid";
        } else if (status = STATUS_PAID) {
            return "Complete - Paid";
        }
    }

    /**
     Grab all employees
     */
    $scope.getAllWashes = function () {
        var query = new Parse.Query("Jobs");
        query.include('vehicle');
        query.include('customer');
        query.include('employee');

        query.find({
            success: function (results) {

                // Add employees
                for (var i = 0; i < results.length; i++) {
                    var job = results[i];
                    var customer = job.get('customer');
                    var employee = job.get('employee');
                    var jobType = job.get('vehicle').type == 0 ? 'Sedan' : 'Non-Sedan';
                    var paymentBase = jobType == 'Sedan' ? 20 : 23;

                    var jobMap = {
                        id: job.get('washId'),
                        customerName: customer.get('firstName') + ' ' + customer.get('lastName'),
                        vehicleType: jobType,
                        status: convertStatusToString(job.get('status'))
                    };

                    if (job.get('tip') != null) {
                        jobMap.paymentTotal = '$' + String(paymentBase + (Number(job.get('tip')) / 100));
                    } else {
                        jobMap.paymentTotal = "N/A";
                    }

                    if (job.get('status') > 0) {
                        jobMap.employeeName = employee.get('firstName') + ' ' + employee.get('lastName');
                    } else {
                        jobMap.employeeName = "N/A";
                    }

                    $scope.jobs.push(jobMap);
                }

                $scope.$apply();

                $scope.retrieveAnalytics();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    $scope.getAllWashes();


    $scope.retrieveAnalytics = function () {
        var query = new Parse.Query("WashAnalytics");

        query.find({
            success: function (results) {
                for (var i = 0; i < results.length; i++) {
                    var analytic = results[i];
                    $scope.analyticCounts[analytic.get("stat")] = analytic.get("value");
                }

                $scope.displayAnalytics();
            }
        });
    }

    $scope.displayAnalytics = function () {
        $scope.displaySedanStatistics();
        $scope.displayGlobalDayOfWeekStatistics();
        $scope.displayCurrentWeekStatistics();
        $scope.displayTimeAnalytics();
    }

    $scope.displayCurrentWeekStatistics = function () {
        alert("TODO: Week by week");
    }

    $scope.displaySedanStatistics = function () {
        var sedanData = {
            labels: ["Sedan", "Non-Sedan"],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: [$scope.analyticCounts["SedanWashes"], $scope.analyticCounts["NonSedanWashes"]]
                }
            ]
        }

        var sedanCanvas = document.getElementById("sedanAnalytic").getContext("2d");

        window.sedanGraph = new Chart(sedanCanvas).Bar(sedanData, {
            responsive: true
        });

    }

    $scope.displayGlobalDayOfWeekStatistics = function () {
        var globalDOWData = {
            labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            datasets: [
                {
                    label: "My Second dataset",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [$scope.analyticCounts["MondayWashes"], $scope.analyticCounts["TuesdayWashes"], $scope.analyticCounts["WednesdayWashes"], $scope.analyticCounts["ThursdayWashes"], $scope.analyticCounts["FridayWashes"], $scope.analyticCounts["SaturdayWashes"], $scope.analyticCounts["SundayWashes"]]
                }
            ]
        };

        var DOWCanvas = document.getElementById("globalDOWAnalytic").getContext("2d");

        window.globalDOWGraph = new Chart(DOWCanvas).Line(globalDOWData, {
            bezierCurve: false
        });
    }

    $scope.displayTimeAnalytics = function () {
        var time = ["8:00AM - 9:00AM", "9:00AM - 10:00AM", "10:00AM - 11:00AM", "11:00AM - 12:00PM", "12:00AM - 1:00PM", "1:00PM - 2:00PM", "2:00PM - 3:00PM", "3:00PM - 4:00PM", "4:00PM - 5:00PM", "5:00PM - 6:00PM", "6:00PM - 7:00PM"]

        var timeData = {
            labels: [time[0], time[1], time[2], time[3], time[4], time[5], time[7], time[7], time[8], time[9], time[10]],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: [$scope.analyticCounts["8AM"], $scope.analyticCounts["9AM"], $scope.analyticCounts["10AM"]
                        , $scope.analyticCounts["11AM"], $scope.analyticCounts["12PM"], $scope.analyticCounts["1PM"], $scope.analyticCounts["2PM"]
                        , $scope.analyticCounts["3PM"], $scope.analyticCounts["4PM"], $scope.analyticCounts["5PM"], $scope.analyticCounts["6PM"]]
                }
            ]
        }

        var timeCanvas = document.getElementById("timeAnalytic").getContext("2d");

        window.sedanGraph = new Chart(timeCanvas).Bar(timeData, {
            responsive: true
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
                var employee = $scope.employeeList[index];
                var analytic = employeeAnalytics[0];
                employee['washCount'] = analytic.get('washTotal');
                employee['tipTotal'] = analytic.get('tipTotal');
                $scope.$apply();
            }
        });
    }

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
            $.get("http://paulgerlich.com/__projects/buddys/php/createEmployee.php?EMAIL=" + employeeInfo.email, function (data) {

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
                    success: function (user) {
                        //Create employee analytics entry
                        var AnalyticObject = Parse.Object.extend("EmployeeAnalytics");
                        var employeeAnalytic = new AnalyticObject();

                        employeeAnalytic.set("employee", user);
                        employeeAnalytic.set("tipTotal", 0);
                        employeeAnalytic.set("washTotal", 0);

                        employeeAnalytic.save(null, {
                            success: function (newEmployee) {

                            }, error: function (e) {
                                console.log(e);
                            }
                        });

                        //Reload employees
                        $scope.employeeList = [];
                        $scope.getEmployees();

                        //Add supplemental employee information to stripe
                        $.get("http://paulgerlich.com/__projects/buddys/php/addEmployeeInformation" +
                            ".php?ACCID=" + employeeId + "&MONTH=" + employeeInfo.month +
                            "&DAY=" + employeeInfo.day + "&YEAR=" + employeeInfo.year +
                            "&FIRST=" + employeeInfo.first + "&LAST=" + employeeInfo.last, function (data) {
                            $scope.tempEmployeeId = employeeId;

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

                    },
                    error: function (user, error) {
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
    $scope.saveBankAcc = function (status, response) {

        if (response.error) {
            console.log(response.error);
            console.log("TODO: input validation");
        } else {
            $.get("http://paulgerlich.com/__projects/buddys/php/addBankToEmployee.php?ACCID=" + $scope.tempEmployeeId + "&TOKEN=" + response.id, function (data) {

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


    $scope.ok = function () {
        //TODO: Validate inputs
        $uibModalInstance.close({
            first: $scope.first,
            last: $scope.last,
            email: $scope.email,
            password: $scope.password,
            month: $scope.month,
            day: $scope.day,
            year: $scope.year,
            routing: $scope.routingNumber,
            account: $scope.accountNumber
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});