//Job status constants
const STATUS_UNCLAIMED = 0;
const STATUS_CLAIMED = 1;
const STATUS_COMPLETE = 2;
const STATUS_PAID = 3;

//If we need angular stuff. Not sure yet
angular.module("myApp", ['ngAnimate', 'ui.bootstrap', 'flow']);
angular.module("myApp").controller("mainCtrl", function ($scope, $uibModal) {

    //Initialize Parse
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");

    $scope.allJobs = [];
    $scope.myJobs = [];
    $scope.completedJobs = [];

    $scope.user = Parse.User.current();

    if (!$scope.user) {
        window.location.assign("login");
    } else if ($scope.user.get("role") == 0) {
        window.location.assign("schedule");
    } else {
        getAllJobs();
        getMyJobs();
        getMyCompletedJobs();
    }

    function getAllJobs() {
        //Setup query to grab the washes associated with this user
        var query = new Parse.Query("Jobs");
        query.equalTo("status", STATUS_UNCLAIMED);
        query.include("vehicle");

        //Grab vehicles
        query.find({
            success: function (results) {
                $scope.allJobs = [];

                for (var i = 0; i < results.length; i++) {
                    var job = {
                        date: results[i].get("date"),
                        time: results[i].get("time"),
                        notes: results[i].get("notes"),
                        latitude: results[i].get("latitude"),
                        longitude: results[i].get("longitude"),
                        pointer: results[i]
                    }
                    $scope.allJobs.push(job)
                }

                $scope.$apply();

                setTimeout(getAllJobs, 2000); // Do every two seconds to ensure concurrency
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    function getMyJobs() {
        //Setup query to grab the washes associated with this user
        var query = new Parse.Query("Jobs");
        query.equalTo("employee", {
            __type: "Pointer",
            className: "_User",
            objectId: $scope.user.id
        });
        query.equalTo("status", STATUS_CLAIMED);
        query.include("vehicle");

        query.find({
            success: function (results) {
                $scope.myJobs = [];

                for (var i = 0; i < results.length; i++) {
                    var job = {
                        date: results[i].get("date"),
                        time: results[i].get("time"),
                        notes: results[i].get("notes"),
                        latitude: results[i].get("latitude"),
                        longitude: results[i].get("longitude"),
                        pointer: results[i],
                        vehicle: {
                            make: results[i].get("vehicle").get("make"),
                            model: results[i].get("vehicle").get("model"),
                            color: results[i].get("vehicle").get("color"),
                            license: results[i].get("vehicle").get("license"),
                            picture: "http://www.designofsignage.com/application/symbol/building/image/600x600/no-photo.jpg"
                        }
                    }

                    //Get picture if there is one
                    if (results[i].get("vehicle").get("picture")) {
                        job.vehicle.picture = results[i].get("vehicle").get("picture").url();
                    }

                    $scope.myJobs.push(job)
                }

                $scope.$apply();

                setTimeout(getMyJobs, 2000); // Do every two seconds to ensure concurrency
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
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


    function getMyCompletedJobs() {
        //grab the completed washes associated with this user
        var queryUserAndComplete = new Parse.Query("Jobs");
        queryUserAndComplete.equalTo("employee", {
            __type: "Pointer",
            className: "_User",
            objectId: $scope.user.id
        });
        queryUserAndComplete.equalTo("status", STATUS_COMPLETE);

        var userAndPaid = new Parse.Query("Jobs");
        userAndPaid.equalTo("employee", {
            __type: "Pointer",
            className: "_User",
            objectId: $scope.user.id
        });
        userAndPaid.equalTo("status", STATUS_PAID);

        var mainQuery = Parse.Query.or(queryUserAndComplete, userAndPaid);
        mainQuery.find({
            success: function (results) {
                $scope.completedJobs = [];

                for (var i = 0; i < results.length; i++) {
                    var job = {
                        date: results[i].get("date"),
                        time: results[i].get("time"),
                        washId: results[i].get("washId"),
                        rating: results[i].get("rating"),
                        tip: results[i].get("tip"),
                        status: convertStatusToString(results[i].get("status"))
                    }

                    if (results[i].get("status") == STATUS_COMPLETE) {
                        job.rating = "Job Not Paid"
                        job.tip = "Job Not Paid"
                    } else if (!job.tip) {
                        job.tip = "No Tip"
                    } else {
                        job.tip = '$' + String(job.tip / 100);
                    }

                    $scope.completedJobs.push(job)
                }

                $scope.$apply();

                setTimeout(getMyCompletedJobs, 2000); // Do every two seconds to ensure concurrency
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message); //TODO: Error handling
            }
        });
    }

    //Claim a job
    $scope.claimJob = function (job) {
        job.pointer.set("employee", $scope.user);
        job.pointer.set("status", 1);

        job.pointer.save(null, {
            success: function (newJob) {
                $scope.myJobs.push(job);
                $scope.allJobs.splice($scope.allJobs.indexOf(job), 1); //Remove from local view
                $scope.$apply();
            },
            error: function (newJob, error) {
                alert('Failed to claim job, with error code: ' + error.message + ' Please try again later.');
            }
        });

    }

    //Job completion
    $scope.completeJob = function (curJob) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'completeJob.html',
            controller: 'completeJobCtrl',
            windowClass: 'adjustModalHeight',
            resolve: {
                job: curJob
            }
        });

        //Upon pressing save, save the vehicle (after validating input below)
        modalInstance.result.then(function (curJob) {
            curJob.pointer.save(null, {
                success: function (newJob) {
                    $scope.myJobs.splice($scope.myJobs.indexOf(curJob), 1); //Remove from local view
                    $scope.$apply();
                },
                error: function (newJob, error) {
                    alert('Failed to claim job, with error code: ' + error.message + ' Please try again later.');
                }
            });
        }, function () {
            //Modal was closed
        });
    };

    //Job completion
    $scope.showMap = function (latitude, longitude) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'showMap.html',
            controller: 'displayMapModalCtrl',
            windowClass: 'adjustModalHeight',
            resolve: {
                latitude: latitude,
                longitude: longitude
            }
        });
    };


    //Job completion
    $scope.showPicture = function (vehicleURL) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'showPictureModal.html',
            windowClass: 'adjustModalHeight',
            controller: 'displayPictureCtrl',
            resolve: {
                vehicleImageURL: {vehicleImageURL: vehicleURL}
            }
        });
    };

});

//Controller for vehicle modal
angular.module('myApp').controller('completeJobCtrl', function ($scope, $uibModalInstance, job) {

    $scope.employeeNotes = "";
    $scope.beforePicture = {};
    $scope.afterPicture = {};

    $scope.ok = function () {
        //Setup before picture
        var beforePictureFile = $scope.beforePicture.flow.files[0].file;
        var beforePictureParseFile = new Parse.File("B4", beforePictureFile);
        job.pointer.set("beforePicture", beforePictureParseFile);

        //Setup after picture
        var afterPictureFile = $scope.afterPicture.flow.files[0].file;
        var afterPictureParseFile = new Parse.File("AFTER", afterPictureFile);
        job.pointer.set("afterPicture", afterPictureParseFile);

        //Status and notes
        job.pointer.set("status", STATUS_COMPLETE);
        job.pointer.set("employeeNotes", $scope.employeeNotes);

        $uibModalInstance.close(job);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});

//Controller for vehicle modal
angular.module('myApp').controller('displayMapModalCtrl', function ($scope, $uibModalInstance, latitude, longitude) {

    $uibModalInstance.opened.then($scope.init);

    $scope.init = function () {
        $scope.imgURL = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:Wash%20Location%7C" + latitude + "," + longitude + "&key=AIzaSyCRCnKRU2C6OAahaKiV_r21CzMqolt3iH4";
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});

//Controller for vehicle modal
angular.module('myApp').controller('displayPictureCtrl', function ($scope, $uibModalInstance, vehicleImageURL) {

    $scope.imgURL = vehicleImageURL.vehicleImageURL;
    console.log($scope.imgURL.vehicleImageURL);

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});