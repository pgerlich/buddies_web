$(document).ready();

//If we need angular stuff. Not sure yet
angular.module("myApp", ['ngAnimate', 'ui.bootstrap']);
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
    $scope.vehicles = [];
    $scope.jobs = [];

    $scope.vehiclesLoaded = false;
    $scope.jobsLoaded = false;

    if (!$scope.user) {
        window.location.assign("login");
    } else {
        getVehiclesForUser();
        getWashesForUser();
    }

    /**
     Gets vehicles associated with a user
     */
    function getVehiclesForUser() {
        //Setup query to grab the vehicles associated with this customer
        var query = new Parse.Query("Vehicles");
        query.equalTo("customer", {
            __type: "Pointer",
            className: "_User",
            objectId: $scope.user.id
        });

        vehicles = []; //Vehicles array

        //Grab vehicles
        query.find({
            success: function (results) {
                for (var i = 0; i < results.length; i++) {
                    var vehicle = {
                        make: results[i].get("make"),
                        model: results[i].get("model"),
                        year: results[i].get("year"),
                        color: results[i].get("color"),
                        parseId: results[i].id,
                        pointer: results[i]
                    }
                    $scope.vehicles.push(vehicle)
                }

                $scope.vehiclesLoaded = true;
                $scope.$apply();

            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }


    function getWashesForUser() {
        //Setup query to grab the washes associated with this user
        var query = new Parse.Query("Jobs");
        query.equalTo("customer", {
            __type: "Pointer",
            className: "_User",
            objectId: $scope.user.id
        });
        query.notEqualTo("status", 3); //If the wash isn't complete
        query.notEqualTo("status", -1); //If the wash wasn't cancelled

        query.include("vehicle");
        query.include("employee");

        //Grab vehicles
        query.find({
            success: function (results) {
                $scope.jobs = [];

                for (var i = 0; i < results.length; i++) {
                    var wash = results[i];
                    var job = {
                        date: wash.get("date"),
                        time: wash.get("time"),
                        status: convertStatusToString(wash.get("status")),
                        washId: wash.get("washId"),
                        employeeNotes: wash.get("employeeNotes"),
                        type: wash.get("vehicle").get("type"),
                        pointer: wash
                    };
                    var beforePicture = wash.get("beforePicture");
                    var afterPicture = wash.get("afterPicture");
                    var employee = wash.get("employee");

                    //Add before/after picture if applicable
                    if (beforePicture) {
                        job.beforePictureURL = beforePicture.url();
                    }

                    if (afterPicture) {
                        job.afterPictureURL = afterPicture.url();
                    }

                    if (employee) {
                        job.employee = employee.get("stripeAccount");
                    }

                    //Whether or not this job is complete (for displaying pay/cancel)
                    job.complete = wash.get("status") == STATUS_COMPLETE;
                    job.paid = wash.get("status") == STATUS_PAID;

                    $scope.jobs.push(job)
                }

                $scope.jobsLoaded = true;

                $scope.$apply();

                setTimeout(getWashesForUser, 2000); // Do every two seconds to ensure concurrency
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    $scope.payForJob = function (job) {
        //Display Payment Modal
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'jobCompletionModal.html',
            controller: 'jobCompletionCtrl',
            windowClass: 'adjustModalHeight',
            resolve: {
                job: job,
                cards: null, //TODO: GET USER cards
            }
        });

        //Upon pressing save, save the job (after validating input below)
        modalInstance.result.then(function (newJob) {
            $scope.createJobTransaction(newJob);
        }, function () {
            //Modal was closed instead of saved
        });

    }

    $scope.createJobTransaction = function (job) {
        var tip = job.tip;
        var baseCost = job.baseCost;
        var cid = $scope.user.get("stripeAccount");
        var aid = job.employee;
        var ccid = job.card;
        var transactionURL = "http://paulgerlich.com/__projects/buddys/php/payForWash.php?TIPAMT=" + tip + "&BASEAMT=" + baseCost + "&CID=" + cid + "&AID=" + aid + "&CCID=" + ccid;

        $.get(transactionURL, function (data) {

            var fraudDetected = data.indexOf("fraudulent charge detected.");

            if (fraudDetected != -1) {
                alert("Invalid transaction.");
            } else {
                var parsedData = JSON.parse(data.slice(20, data.len)); //TODO: Do we really need to do anything?
                if (parsedData['status'] == "succeeded") {
                    $scope.completeJob(job);
                }
            }
        });

    }

    $scope.completeJob = function (job) {
        job.pointer.set("status", STATUS_PAID);

        job.pointer.save(null, {
            success: function (newJob) {
                alert("Payment complete. Thank you for your business!");
                $scope.recordEmployeeAnalytic(newJob);
            },
            error: function (newJob, error) {
                alert('Failed to pay for job with error code: \"' + error.message + ' \" Please try again later.');
            }
        });
    }

    $scope.recordEmployeeAnalytic = function (job) {
        var query = new Parse.Query("EmployeeAnalytics");
        query.equalTo("employee", {
            __type: "Pointer",
            className: "_User",
            objectId: job.get('employee').id
        });

        query.find({
            success: function (employeeAnalytics) {
                var analytic = employeeAnalytics[0];
                analytic.set('tipTotal', analytic.get('tipTotal') + (Number(job.get('tip')) / 100));
                analytic.set('washTotal', analytic.get('washTotal') + 1);

                analytic.save(null, {
                    success: function (newJob) {
                        //TODO: Saved succesfully
                    }
                });
            }
        });
    }

    //Claim a job
    $scope.cancelWash = function (job) {
        job.pointer.set("status", -1);

        job.pointer.save(null, {
            success: function (newJob) {
                //Succeeded
            },
            error: function (newJob, error) {
                alert('Failed to cancel job, with error code: ' + error.message + ' Please try again later.');
            }
        });

    }

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

    $scope.determineWashNumber = function () {
        //Setup query to grab the washes associated with this user
        var query = new Parse.Query("Sequence");
        query.equalTo("counterID", 1); //The wash counter

        //Grab vehicles
        query.find({
            success: function (results) {
                $scope.washId = 0;
                if (results.length == 1) {
                    $scope.washId = results[0].get("jobCount");

                    results[0].set("jobCount", $scope.washId + 1);
                    results[0].save(null, {
                        success: function (newJob) {
                            //Succeess
                        },
                        error: function (newJob, error) {
                            //Failure
                        }
                    });

                    //No Lat/long --> Need to get it
                    if ($scope.lat == 0 && $scope.lon == 0) {
                        $scope.convertAddressToLatLng();
                    } else {
                        $scope.scheduleWash(); //Else --> Go straight to scheduling
                    }

                } else {
                    alert("Error scheduling wash.");
                }
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    //For displaying map related errors
    $scope.mapError = document.getElementById("mapError");
    $scope.useMyLocation = false;

    //Wash scheduling values
    $scope.address = "";
    $scope.city = "";
    $scope.state = "";
    $scope.washDate = "";
    $scope.washId = 0;
    $scope.washTime = "8:00AM - 9:00AM";
    $scope.lat = 0;
    $scope.lon = 0;
    $scope.washNotes = "";
    $scope.wash = "";

    $scope.convertAddressToLatLng = function () {
        var address = $scope.address.replace(' ', '+');
        var city = $scope.city.replace(' ', '+');
        var state = $scope.city.replace(' ', '+');
        var geocodingURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "," + city + "," + state + "&key=AIzaSyCRCnKRU2C6OAahaKiV_r21CzMqolt3iH4"; //TODO: OBFUSCATE
        $.get(geocodingURL, function (data) {

            //Basic error catching
            if (!data['status'] == 'OK') {
                console.log("error occured");
            } else {
                $scope.lat = data.results[0].geometry.location.lat;
                $scope.lon = data.results[0].geometry.location.lng;

                $scope.scheduleWash();
            }
        });
    }

    //Use google maps instead of address block
    $scope.getLocation = function () {
        if (navigator.geolocation) {
            $scope.useMyLocation = true;
            navigator.geolocation.getCurrentPosition(showPosition, showError); //two function pointers (success, failure)
        } else {
            $scope.useMyLocation = false;
            $scope.mapError.innerHTML = "Geolocation is not supported by this browser.";
            console.log("error loading map services");
        }
    }

    function showPosition(position) {
        $scope.lat = position.coords.latitude;
        $scope.lon = position.coords.longitude;
        latlon = new google.maps.LatLng($scope.lat, $scope.lon)
        mapholder = document.getElementById('mapHolder')
        mapholder.style.height = '250px';
        mapholder.style.width = '250px';

        var myOptions = {
            center: latlon, zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}
        }

        var map = new google.maps.Map(document.getElementById("mapHolder"), myOptions);

        //Setup the marker
        //var markerIcon = 'img/B.PNG'; --> TODO: Icon needs to be resized w/ transparent BG
        marker = new google.maps.Marker({
            position: latlon,
            map: map,
            draggable: true,
            //icon: markerIcon,
            animation: google.maps.Animation.DROP,
            title: "You are here!"
        });

        //On drag, update lat/lon
        marker.addListener('dragend', function () {
            $scope.lat = marker.getPosition().lat();
            $scope.lon = marker.getPosition().lng();
        });

    }

    //Scheduling a wash
    $scope.scheduleWash = function () {
        var JobObject = Parse.Object.extend("Jobs");
        var parseJob = new JobObject();

        //Set vehicle values
        parseJob.set("status", 0);
        parseJob.set("latitude", $scope.lat);
        parseJob.set("longitude", $scope.lon);
        parseJob.set("date", $scope.washDate);
        parseJob.set("time", $scope.washTime);
        parseJob.set("notes", $scope.washNotes);
        parseJob.set("vehicle", $scope.washVehicle.pointer);
        parseJob.set("washId", $scope.washId);
        parseJob.set("customer", $scope.user);

        //Persist to Parse
        parseJob.save(null, {
            success: function (newParseJob) {
                alert('Saved succesfully');
            },
            error: function (vehicle, error) {
                alert('Failed to create new vehicle, with error code: ' + error.message);
            }
        });
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                $scope.mapError.innerHTML = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
                $scope.mapError.innerHTML = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                $scope.mapError.innerHTML = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                $scope.mapError.innerHTML = "An unknown error occurred."
                break;
        }

        $scope.useMyLocation = false;
    }

});

//Controller for vehicle modal
angular.module('myApp').controller('jobCompletionCtrl', function ($scope, $uibModalInstance, job) {

    $scope.tip = 0.00;
    $scope.beforePictureURL = job.beforePictureURL;
    $scope.afterPictureURL = job.afterPictureURL;
    $scope.employeeNotes = job.employeeNotes;
    $scope.ratingText = "";

    $scope.baseCost = 0;

    if (job.type == 1) {
        $scope.baseCost = 2000;
    } else {
        $scope.baseCost = 2500;
    }

    $scope.displayBaseCost = '$' + ($scope.baseCost / 100).toFixed(2);

    $scope.ok = function () {
        //TODO: Validate inputs
        job.tip = $scope.tip * 100;
        job.pointer.set("tip", job.tip + "");
        job.pointer.set("rating", $scope.rating);
        job.pointer.set("ratingText", $scope.ratingText);
        job.baseCost = $scope.baseCost;
        job.card = $scope.selectedCard.id;
        $uibModalInstance.close(job);
    };

    $scope.calculateTotalCost = function (value) {
        $scope.totalCost = (($scope.baseCost + ($scope.tip * 100)) / 100).toFixed(2);
        $scope.totalCost = "$" + $scope.totalCost;
    }

    $scope.calculateTotalCost();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    /**
     Gets cards associated with a user
     */
    $scope.getCardsForUser = function () {
        $.get("http://paulgerlich.com/__projects/buddys/php/retrieveCustomer.php?CID=" + Parse.User.current().get("stripeAccount"), function (data) {
            var test = JSON.parse(data.slice(21, data.len));
            $scope.cards = test.sources.data;
            $scope.$apply();
        });
    }

    $scope.getCardsForUser();
});