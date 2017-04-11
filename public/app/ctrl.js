


// Ctrl For Dash
app.controller('HomeCtrl', function($scope, $localStorage, $location) {
    $localStorage.vg = {};
    $homeContact = {};

    function getBaseUrl(cb) {
      var re = new RegExp(/^.*\//);
      cb(re.exec(window.location.href));
    }

    $scope.dashpage = function() {
        getBaseUrl(function(url) {
          window.location.href = (url+"dash");
        });
    }

    $scope.homeContactSubmit = function() {
        //console.log('hi');
    }

})

// Ctrl For Dash
app.controller('DashHomeCtrl', function($scope) {
    //
})



// Ctrl For Dash
app.controller('DashInstantCtrl', function($scope, maps, $localStorage, items, rates, $location, $timeout, $http, swift, $filter, autho) {

    function idleLogout() {
        var t;
        window.onload = resetTimer;
        window.onmousemove = resetTimer;
        window.onmousedown = resetTimer; // catches touchscreen presses
        window.onclick = resetTimer;     // catches touchpad clicks
        window.onscroll = resetTimer;    // catches scrolling with arrow keys
        window.onkeypress = resetTimer;

        function logout() {
            $localStorage.vg = {};

            window.location.replace("/");
        }

        function resetTimer() {
            clearTimeout(t);
            t = setTimeout(logout, 1800000);  // time is in milliseconds
        }
    }
    idleLogout();

    jQuery('.item-in').bind('touchstart', function preventZoom(e) {
        var t2 = e.timeStamp
          , t1 = $(this).data('lastTouch') || t2
          , dt = t2 - t1
          , fingers = e.originalEvent.touches.length;
        $('.item-in').data('lastTouch', t2);
        if (!dt || dt > 500 || fingers > 1) return; // not double-tap


        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $('.item-in').trigger('click').trigger('click');
      });

     /*Popover*/
        $('[data-toggle="popover"]').popover();

    // Start GMaps
    maps.init();

    autho.checkout1 = false;
    autho.checkout2 = false;
    autho.checkout3 = false;
    autho.bc = false;

    $scope.autocompleteOptions = {
        componentRestrictions: { country: 'uk' },
        types: ['geocode']
    }

    if($localStorage.vg !== undefined && $localStorage.vg.jobDetails) {
        var timeNow = new Date().getTime();
        var saveTime = $localStorage.vg.jobDetails.timestamp;
        var saveTimePlus5Hr = saveTime + (1000 * 60 * 60 * 5);
        //console.log(saveTime+' - '+saveTimePlus5Hr);

        //var diff = saveTimePlus5Hr - saveTime;
        if(timeNow > saveTimePlus5Hr) {
            $localStorage.vg = {};
            $scope.dashInstant = {};
            $scope.dashInstant.itemBoxes = [
                {size: 'smItems', qty: 0},
                {size: 'mdItems', qty: 0},
                {size: 'lgItems', qty: 0}
            ]
        }
        //1000 * 60 * 60 * 24
        $scope.dashInstant = $localStorage.vg.jobDetails;
        if($scope.dashInstant !== undefined) {
            $('#swt5')[0].checked = $scope.dashInstant.extraHelp;
        }
    } else {
        $localStorage.vg = {};
        $scope.dashInstant = {};
        $scope.dashInstant.itemBoxes = [
            {size: 'smItems', qty: 0},
            {size: 'mdItems', qty: 0},
            {size: 'lgItems', qty: 0}
        ]
        $scope.dashInstant.extraDropObj = [];
        $scope.dashInstant.extraDropArr = [0];
        $scope.dashInstant.extraDropCount = 0;
        $scope.dashInstant.delChange = 0;
    }

    //$scope.dashInstant.extraDrop = 0;


    $scope.addDrop = function() {
        $scope.dashInstant.extraDropCount++;
        $scope.dashInstant.extraDropArr.push($scope.dashInstant.extraDropCount);
        if($scope.dashInstant.extraDropCount > 0) {
          $scope.optimize = true;
        } else {
          $scope.optimize = false;
        }
    }

    $scope.changeDelNum = function(no) {
        $scope.dashInstant.delChange = no;
    }

    $scope.deleteDropRow = function(no) {
      if($scope.dashInstant.extraDropCount !== 0) {
        $scope.dashInstant.extraDropCount--;
        $scope.dashInstant.extraDropArr.splice(no, 1);
        if($scope.dashInstant.extraDropCount > 0) {
          $scope.optimize = true;
        } else {
          $scope.optimize = false;
        }
      }
    }

    $scope.optRoute = false

    $scope.optRouteFunc = function() {
      $scope.optRoute = true;
      $scope.updateMaps();
      toastr.info('This is the most optimised route.');
    }

    var realTime = new Date();
    $('#job-date-picker').datetimepicker({
        format: 'dd-mm-yy',
        startDate: realTime,
        initialDate: realTime,
        todayHighlight: true,
        minView: 'month',
        autoclose: true,
        showMeridian: true
    });

    $('#early-time-picker').datetimepicker({
        //startDate: realTime,
        //initialDate: realTime,
        startView: 'day',
        format: 'hh:ii',
        maxView: 'day',
        autoclose: true,
        showMeridian: true
    });


    var realTime9 = new Date();
    var h9 = realTime.getHours();
    var m9 = parseInt(realTime.getMinutes());
    if(m9 < 10) {
      m9 = '0'+m9;
    }

    $('.time-input-hour').timepicker({
      minTime: '07:00',
      maxTime: '22:00',
      step: '60',
      disableTimeRanges: [['07:00', h9+1+':00']]
    });
    $('.time-input-min').timepicker({
      minTime: '07:00',
      maxTime: '08:00',
      step: '1',
      disableTimeRanges: [['07:00', '07:'+m9]]
    });


    $scope.closeTimePicker = function() {
        $('.datetimepicker-dropdown-bottom-right').hide();
    }

    $('#early-time-picker').datetimepicker().on('show', function(ev){
        $('.datetimepicker-hours table thead tr th.prev').html('');
        $('.datetimepicker-hours table thead tr th.switch').text('Hour Picker');
        $('.datetimepicker-hours table thead tr th.next').html('');
        /*$('.datetimepicker-minutes table thead tr th.prev').html('');
        $('.datetimepicker-minutes table thead tr th.switch').text('Minute Picker');
        $('.datetimepicker-minutes table thead tr th.next').html('');*/
    })

    $('.datetimepicker-hours').on('click', function() {
        $timeout(function() {
            $('.datetimepicker-minutes table thead tr th.prev').html('');
            $('.datetimepicker-minutes table thead tr th.switch').text('Minute Picker');
            $('.datetimepicker-minutes table thead tr th.next').html('');
        },1)

    })

    $scope.removeGoo = function() {
      $('.pac-container').css('display', 'none');
    }
    /*$scope.showGoo = function() {
      $('.pac-container').css('display', 'block');
    }*/

    //var timepicker = $('.datetimepicker-hours.table-condensed thead tr th');
    //console.log(timepicker.length);

    $scope.changeData = function() {

      console.log($scope.dashInstant);

        var flag = 0;
        var canProgress = 0;

        var realTime = new Date();
        var h = realTime.getHours();
        var m = realTime.getMinutes();
        var month = realTime.getUTCMonth() + 1; //months from 1-12
        var day = realTime.getUTCDate();
        var year = realTime.getUTCFullYear().toString().substr(2,2);
        //console.log(month);
        if(month < 10) {
            if(day < 10) {
              var nowDate = '0'+day+'-0'+month+'-'+year;
            } else {
              var nowDate = day+'-0'+month+'-'+year;
            }
        } else {
            if(day < 10) {
              var nowDate = '0'+day+'-'+month+'-'+year;
            } else {
              var nowDate = '0'+day+'-'+month+'-'+year;
            }
        }

        $scope.dashInstant.jobStartTime = $scope.dashInstant.jobStartTimeHour+':'+$scope.dashInstant.jobStartTimeMin;

        if($scope.dashInstant.jobStartTime !== undefined || $scope.dashInstant.jobStartTime !== '') {
            $scope.st = false;
        } else {
          $scope.st = true;
          $scope.st1 = $scope.dashInstant.jobStartTime;
        }

        if($scope.dashInstant.jobDate !== undefined) {
            $scope.jd = $scope.dashInstant.jobDate;
            //console.log('nowDate'+ nowDate);
            //console.log('njobDate'+ $scope.dashInstant.jobDate);
            if($scope.dashInstant.jobDate == nowDate) {
              //console.log('samed dat');
                $scope.nowTime = h;
                $('.time-input-hour').timepicker({
                  minTime: '07:00',
                  maxTime: '22:00',
                  step: '60',
                  disableTimeRanges: [['07:00', h9+1+':00']]
                });
                $('.time-input-min').timepicker({
                  minTime: '07:00',
                  maxTime: '08:00',
                  step: '1',
                  disableTimeRanges: [['07:00', '07:'+m9]]
                });
            } else {
                console.log('no dat');
                $scope.nowTime = 0;
                $('.time-input-hour').timepicker({
                  minTime: '07:00',
                  maxTime: '22:00',
                  step: '60',
                });
                $('.time-input-min').timepicker({
                  minTime: '07:00',
                  maxTime: '08:00',
                  step: '1',
                });
            }
            //console.log($scope.nowTime);
        }


        // IF THERES NO INVENTORY FLAG
        if(isNaN($scope.dashInstant.itemBoxes[0].qty) == true) {
          $scope.dashInstant.itemBoxes[0].qty = 0;
        }
        if(isNaN($scope.dashInstant.itemBoxes[1].qty) == true) {
          $scope.dashInstant.itemBoxes[1].qty = 0;
        }
        if(isNaN($scope.dashInstant.itemBoxes[2].qty) == true) {
          $scope.dashInstant.itemBoxes[2].qty = 0;
        }
        if($scope.dashInstant.itemBoxes[0].qty < 1 && $scope.dashInstant.itemBoxes[1].qty < 1 && $scope.dashInstant.itemBoxes[2].qty < 1) {
            flag = flag + 1;
            canProgress = canProgress + 1;
            //console.log('itemBoxes');

        }

        $scope.totalQty = (
            parseInt($scope.dashInstant.itemBoxes[0].qty) +
            parseInt($scope.dashInstant.itemBoxes[1].qty) +
            parseInt($scope.dashInstant.itemBoxes[2].qty) );

            console.log($scope.totalQty);

        //console.log($scope.totalQty);


        /*$scope.totalQty = ($scope.dashInstant.itemBoxes[0].qty + scope.dashInstant.itemBoxes[1].qty) + $scope.dashInstant.itemBoxes[2].qty;*/


        // IF NO ADDRESS DATA
        if($scope.dashInstant.address == undefined) {
            flag = flag + 1;
            canProgress = canProgress + 1;
            //console.log('address undefined');

        } else {

            var add = $scope.dashInstant.address;
            var dropObj = $scope.dashInstant.extraDropObj;

            if(add.start_location !== undefined) {
                if(add.start_location.name !== undefined) {
                    if(add.start_location.name.length < 3) {
                        flag = flag + 1;
                        canProgress = canProgress + 1;
                    }

                } else {
                    flag = flag + 1;
                    canProgress = canProgress + 1;
                }
                if(add.start_location.number !== undefined) {
                    if(add.start_location.number.length < 1) {
                        flag = flag + 1;
                        canProgress = canProgress + 1;
                    }
                } else {
                    flag = flag + 1;
                    canProgress = canProgress + 1;
                }
                if(add.start_location.name.formatted_address == undefined) {
                  flag = flag + 1;
                  canProgress = canProgress + 1;
                }
            } else {
                flag = flag + 1;
                canProgress = canProgress + 1;
            }

            if(dropObj !== undefined) {
                if(Object.keys(dropObj).length > 0) {
                  for(i in dropObj) {
                    if(dropObj[i].postcode.formatted_address.length < 1) {
                      flag = flag + 1;
                      canProgress = canProgress + 1;
                    }
                    if(dropObj[i].doorNumber.length < 1) {
                      flag = flag + 1;
                      canProgress = canProgress + 1;
                    }
                  }
                }
            } else {
              flag = flag + 1;
              canProgress = canProgress + 1;
            }

            /*if(add.end_location !== undefined) {
                if(add.end_location.name !== undefined) {
                    if(add.end_location.name.length < 3) {
                        flag = flag + 1;
                        canProgress = canProgress + 1;
                    }

                } else {
                    flag = flag + 1;
                    canProgress = canProgress + 1;
                }
                if(add.end_location.number !== undefined) {
                    if(add.end_location.number.length < 1) {
                        flag = flag + 1;
                        canProgress = canProgress + 1;
                    }
                } else {
                    flag = flag + 1;
                    canProgress = canProgress + 1;
                }
                if(add.end_location.lat == undefined) {
                  flag = flag + 1;
                  canProgress = canProgress + 1;
                }
            } else {
                flag = flag + 1;
                canProgress = canProgress + 1;
            }*/

        }


        // update lat lng delivery POINTS
        //.geometry.location.lat();
        if(Object.keys($scope.dashInstant.extraDropObj).length > 0) {
          var dropArrLenKey = Object.keys($scope.dashInstant.extraDropObj).length-1;
          var latFuncErr = false;
          try {
              $scope.dashInstant.extraDropObj[dropArrLenKey].postcode.geometry.location.lat()
          }
          catch(err) {
              latFuncErr = true;
          }
          finally {
            if(latFuncErr == false) {
              if ($scope.dashInstant.extraDropObj[dropArrLenKey].postcode.geometry.location.lat()) {
                $scope.dashInstant.extraDropObj[dropArrLenKey].lat = $scope.dashInstant.extraDropObj[dropArrLenKey].postcode.geometry.location.lat();

                $scope.dashInstant.extraDropObj[dropArrLenKey].lng = $scope.dashInstant.extraDropObj[dropArrLenKey].postcode.geometry.location.lng();
              }
            }
          }
        }


        if($scope.totalCuft >= 600) {
            flag = flag + 1;
            canProgress = canProgress + 1;
        } else {
          //$('.growl').remove();
        }



        // IF NO JOB DATE
        if($scope.dashInstant.jobDate == undefined || $scope.dashInstant.jobDate == '') {
            canProgress = canProgress + 1;

        }
        if($scope.dashInstant.jobStartTime == undefined || $scope.dashInstant.jobStartTime == '') {
            canProgress = canProgress + 1;
        } else {
            var realTime = new Date();
            var h = realTime.getHours();
            var m = realTime.getMinutes();
            var month = realTime.getUTCMonth() + 1; //months from 1-12
            var day = realTime.getUTCDate();
            var year = realTime.getUTCFullYear().toString().substr(2,2);
            var nowDate = day+'-'+month+'-'+year;
            var nowTime = h+':'+m;
            var nowTimeH = h;
            var startTimeSplit = $scope.dashInstant.jobStartTime.split('-');
            var startTimeSplitH = $scope.dashInstant.jobStartTime.split(':');
            //console.log('startTimeSplitH[0] '+startTimeSplitH[0]);
            //console.log('nowTime '+nowTime);
            if(nowTimeH > startTimeSplitH[0] && $scope.dashInstant.jobDate == nowDate ) {
              //console.log('nowTime prob '+$scope.dashInstant.jobStartTime);
                canProgress = canProgress + 1;
            }
        }

        if(flag > 0) {
            //console.log('flagged');
        } else {
            //console.log('ok no flag');
            $scope.calcAlgo();
        }

        //console.log('canProgress '+canProgress);
        //console.log('flag '+flag);

        if(canProgress > 0) {
            $('#review-booking-button').attr('data-target', '');
            $('#review-booking-button').addClass('disabled');
        } else {
            //console.log('ok no flag');
            $('#review-booking-button').attr('data-target', '#md-review');
            $('#review-booking-button').removeClass('disabled');
        }
    }

    if($scope.dashInstant !== undefined) {
        $scope.dashInstant.extraHelp = $('#swt5')[0].checked;
    }

    $scope.changeInventory = function(type, num) {
        var currNum = parseInt($scope.dashInstant.itemBoxes[num].qty);
        if(type == 'plus') {
            $scope.dashInstant.itemBoxes[num].qty = parseInt(currNum + 1);
        } else {
            if(currNum > 0) {
                $scope.dashInstant.itemBoxes[num].qty = parseInt(currNum - 1);
            }
        }
        /*if($scope.totalCuft >= 600) {
            $.growl.error({message: 'Please call us for moves with 600 cubic feet or over!'})
        } else {
          $('.growl').remove();
        }*/
    }

    $scope.clickSlot = function(e) {
        var input = $(e.currentTarget).find('input');
        $(input)[0].checked = true;
        $scope.dashInstant.jobStartTime = $(input).val();
        //console.log($scope.dashInstant.jobStartTime);
        $scope.changeData();
    }

    $scope.holdDriverDelay = function(e) {
        if($('#review-booking-button').hasClass('disabled')) {
            $scope.calcAlgo();

            // IF THERES NO INVENTORY FLAG
            if($scope.dashInstant.itemBoxes[0].qty < 1 && $scope.dashInstant.itemBoxes[1].qty < 1 && $scope.dashInstant.itemBoxes[2].qty < 1) {
                $.growl.error({ message: 'Fill in the Inventory!' });
            }


            // IF NO ADDRESS DATA
            if($scope.dashInstant.address == undefined) {
                $.growl.error({message: 'Fill in the Start & End Location!'});
            } else {
                var add = $scope.dashInstant.address;
                var dropObj = $scope.dashInstant.extraDropObj;
                if(add.start_location !== undefined) {
                    if(add.start_location.name !== undefined) {
                        if(add.start_location.name.length < 3) {
                            $.growl.error({ message: 'Fill in the Start Location!' });
                        }

                    } else {
                        $.growl.error({ message: 'Fill in the Start Location!' });
                    }
                    if(add.start_location.number !== undefined) {
                        if(add.start_location.number.length < 1) {
                            $.growl.error({ message: 'Fill in the Start Location House Number!' });
                        }
                    } else {
                        $.growl.error({ message: 'Fill in the Start Location House Number!' });
                    }
                } else {
                    $.growl.error({ message: 'Fill in the Start Location!' });
                }

                // LOOP DROP POINTS
                if(dropObj !== undefined) {
                    if(Object.keys(dropObj).length > 0) {
                      for(i in dropObj) {
                        if(dropObj[i].postcode.formatted_address.length < 1) {
                          $.growl.error({ message: 'Fill in all your drop off postcodes' });
                        }
                        if(dropObj[i].doorNumber.length < 1) {
                          $.growl.error({ message: 'Fill in all your drop off door numbers' });
                        }
                      }
                    }
                } else {
                    $.growl.error({ message: 'Fill in the Drop Off Locations!' });
                }

                if(add.start_location.name.formatted_address == undefined) {
                  console.log(add);
                  $.growl.error({ message: 'Use the location suggestion drop down box to pick your address' });
                }
                if(add.start_location.name.formatted_address == undefined) {
                  $.growl.error({ message: 'Use the location suggestion drop down box to pick your address' });
                }
            }


            // IF NO JOB DATE
            if($scope.dashInstant.jobDate == undefined || $scope.dashInstant.jobDate == '') {
                $.growl.error({ message: 'Fill in the Job Date!' });
            }
            if($scope.dashInstant.jobStartTime == undefined || $scope.dashInstant.jobStartTime == '') {
                $.growl.error({ message: 'Fill in the Start Time!' });
            } else {
                var realTime = new Date();
                var h = realTime.getHours();
                var m = realTime.getMinutes();
                var month = realTime.getUTCMonth() + 1; //months from 1-12
                var day = realTime.getUTCDate();
                var year = realTime.getUTCFullYear().toString().substr(2,2);
                var nowDate = day+'-'+month+'-'+year;
                var nowTime = h+':'+m;

                var utcNowDate = month+'-'+day+'-'+year;

                var splitChooseDate = $scope.dashInstant.jobDate.split();
                var utcJobDate = splitChooseDate[1]+'-'+splitChooseDate[0]+'-'+splitChooseDate[2];


                if(nowTime > $scope.dashInstant.jobStartTime && day == splitChooseDate[0]) {
                    //console.log(day);
                    //console.log(splitChooseDate[0]);
                    var d1 = Date.parse(utcNowDate);
                    var d2 = Date.parse(utcJobDate);
                    if (d1 < d2) {
                        $.growl.error({ message: 'The Start Time has already passed!' });
                    } else {
                        // Cool
                    }

                }
            }


        } else {

            /*if() {

            }*/
            if($scope.totalCuft >= 600) {
                //alert('Please call us for moves with 600 cubic feet or over!');

            } else {
                $('.modal-body').prepend('<img class="spin-img" src="/assets/img/35.gif">');
                $('.modal-body').addClass('tc');
                $('.review-body').addClass('hide');
                swift.driverList(function(resp) {
                    //$localStorage.vg.drivers = resp;
                    $scope.dashInstant.driverCount = resp.length;
                    $timeout(function() {
                        $('.review-body').removeClass('hide');
                        $('.modal-body').removeClass('tc');
                        $('.spin-img').remove();
                    },1000)
                })
            }
        }
    }

    $scope.calcAlgo = function() {
        $scope.loadTime = 0;
        $scope.unloadTime = 0;
        $scope.totalCuft = 0;
        for(ti in $scope.dashInstant.itemBoxes) {
            var itemType = $scope.dashInstant.itemBoxes[ti].size;
            var itemQty = parseInt($scope.dashInstant.itemBoxes[ti].qty);
            var itemCuft = items[''+itemType+'']['cuFt'];
            $scope.loadTime = $scope.loadTime + (items[''+itemType+'']['loadTime'] * itemQty);
            $scope.unloadTime = $scope.unloadTime + (items[''+itemType+'']['unloadTime'] * itemQty);
            $scope.totalCuft = $scope.totalCuft + (itemCuft * itemQty);
        }


        //dashInstant.itemBoxes = $scope.itemBoxes;

        var rate = 0;
        for(rat in rates) {
            var minRange = rates[rat].minRange;
            var maxRange = rates[rat].maxRange;
            if($scope.totalCuft >= minRange && $scope.totalCuft <= maxRange) {
                var rate = rates[rat].rate;
                var van = rates[rat].van;
                var jobMinCub = rates[rat].minRange;
                var jobMaxCub = rates[rat].maxRange;
                var vanDeets = rates[rat].details;
            }
        }

        $scope.dashInstant.jobMinCub = jobMinCub;
        $scope.dashInstant.jobMaxCub = jobMaxCub;
        $scope.dashInstant.vanDeets = vanDeets;

        var driveTime = $scope.dashInstant.duration / 60;
        //var milesTravel = $scope.dashInstant.distance * 0.000621371192237;
        //console.log('distance: '+$scope.dashInstant.distance);
        var fuelCost = $scope.dashInstant.distance * 1.5;

        var totalTime = $scope.loadTime + $scope.unloadTime + driveTime;
        if(totalTime < 90) {
          totalTime = (90 + $scope.loadTime) + $scope.unloadTime;
        }
        if($scope.dashInstant.extraHelp == true) {
            if(van == 'Small Van') {
                rate = .50;
            }
            if(van == 'Medium Van') {
                rate = .67;
            }
            if(van == 'Luton Van') {
                rate = .92;
            }
        }
        var workCost = totalTime * rate;




        $scope.totalCost = Math.ceil((workCost + fuelCost/* + extra*/) * 10) / 10;




        $scope.dashInstant.estiCalc = Math.ceil($scope.totalCost);
        //$scope.dashInstant.deposit = (($scope.totalCost / 100) * 25);
        $scope.dashInstant.deposit = $scope.dashInstant.estiCalc;
        //$scope.dashInstant.toPay = $scope.dashInstant.estiCalc - $scope.dashInstant.deposit;
        $scope.dashInstant.toPay = $scope.dashInstant.estiCalc;

        //console.log(new Date($scope.dashInstant.jobDate).toISOString());
        if($scope.dashInstant.jobDate) {
            var ar = $scope.dashInstant.jobDate.split("-");
            var d = ar[1]+"/"+ar[0]+"/"+ar[2];
            $scope.dashInstant.jobTimestamp = new Date(d).getTime();
        }

        $scope.dashInstant.van = van;


    }

    $scope.updateMaps = function() {
      if($scope.dashInstant && $scope.dashInstant.address ) {
        maps.setDirections($scope.dashInstant, $scope.optRoute, function(data) {
            var tempMiles = 0.000621371192237 * data.distance;
            $scope.dashInstant.fuelPrice = Math.round(tempMiles * 0.72);
            console.log('tempMiles: '+tempMiles);
            $scope.dashInstant.distance = tempMiles;
            $scope.dashInstant.duration = data.duration;
            $scope.calcAlgo();
        });
      }



        /*if($scope.dashInstant && $scope.dashInstant.address) {
            if($scope.dashInstant.address.start_location !== undefined) {
                if($scope.dashInstant.address.start_location.name.formatted_address) {
                    $scope.dashInstant.address.start_location.lat =
                    $scope.dashInstant.address.start_location.name.geometry.location.lat();
                    $scope.dashInstant.address.start_location.lng =
                    $scope.dashInstant.address.start_location.name.geometry.location.lng();
                    $scope.dashInstant.address.start_location.name = $scope.dashInstant.address.start_location.name.formatted_address;
                }
            }
            if($scope.dashInstant.address.end_location !== undefined) {
                if($scope.dashInstant.address.end_location.name.formatted_address) {
                    $scope.dashInstant.address.end_location.lat =
                    $scope.dashInstant.address.end_location.name.geometry.location.lat();
                    $scope.dashInstant.address.end_location.lng =
                    $scope.dashInstant.address.end_location.name.geometry.location.lng();
                    $scope.dashInstant.address.end_location.name = $scope.dashInstant.address.end_location.name.formatted_address;
                }
            }
            if($scope.dashInstant.address.pickup1 !== undefined && $scope.dashInstant.address.pickup1.formatted_address) {
                $scope.dashInstant.address.pickup1.name = $scope.dashInstant.address.pickup1.formatted_address;
            }
            if($scope.dashInstant.address.dropoff1 !== undefined && $scope.dashInstant.address.dropoff1.formatted_address) {
                $scope.dashInstant.address.dropoff1.name = $scope.dashInstant.address.dropoff1.formatted_address;
            }

            if($scope.dashInstant.address.start_location !== undefined &&
                $scope.dashInstant.address.start_location.name !== '' &&
                $scope.dashInstant.address.end_location !== undefined &&
                $scope.dashInstant.address.end_location.name !== '') {
                    maps.setDirections($scope.dashInstant, function(data) {
                        var tempMiles = 0.000621371192237 * data.distance;
                        $scope.dashInstant.fuelPrice = Math.round(tempMiles * 0.72);
                        $scope.dashInstant.distance = tempMiles;
                        $scope.dashInstant.duration = data.duration;
                        $scope.calcAlgo();
                    });
             }
        }*/
    }

    $scope.extraHelpClick = function() {
        $scope.dashInstant.extraHelp = $('#swt5')[0].checked;
        $scope.changeData();
    }

    $scope.goToCheck = function() {
        autho.checkout1 = true;
        $scope.dashInstant.timestamp = new Date().getTime();
        $localStorage.vg.jobDetails = $scope.dashInstant;
        $timeout(function() {
          //$localStorage.vg.jobDetails = $scope.jobDeets;
          autho.checkout2 = true;
          $location.path("/checkout-2");
          /*var flag = 0;
          $scope.vali($scope.jobDeets.name, 3, 'Please fill in your name!', function(resp) {
              flag = flag + resp;
              $scope.vali($scope.jobDeets.email, 3, 'Please fill in your email!', function(resp2) {
                  flag = flag + resp2;
                  $scope.vali($scope.jobDeets.number, 3, 'Please fill in your number!', function(resp3) {
                      flag = flag + resp3;
                      if(flag > 0) {
                          console.log('flagged');
                      } else {
                          autho.checkout2 = true;
                          $location.path("/checkout-2");
                      }
                  });
              });
          });*/
        },1000)
    }

    //$scope.changeData();

    $timeout(function() {
        $scope.updateMaps();
    }, 500)

    $scope.$watch('dashInstant.itemBoxes', function(oldValue, newValue) {
        $scope.changeData();
        $scope.loadTime = 0;
        $scope.unloadTime = 0;
        $scope.totalCuft = 0;
        for(ti in $scope.dashInstant.itemBoxes) {
            var itemType = $scope.dashInstant.itemBoxes[ti].size;
            var itemQty = $scope.dashInstant.itemBoxes[ti].qty;
            var itemCuft = items[''+itemType+'']['cuFt'];
            $scope.loadTime = $scope.loadTime + (items[''+itemType+'']['loadTime'] * itemQty);
            $scope.unloadTime = $scope.unloadTime + (items[''+itemType+'']['unloadTime'] * itemQty);
            $scope.totalCuft = $scope.totalCuft + (itemCuft * itemQty);
        }

        if($scope.totalCuft >= 600) {
          $('.cubic-error').removeClass('hide');
          //$.growl.error({message: 'Please call us for moves with 600 cubic feet or over!'})
        } else {
          //$('.growl').remove();
          $('.cubic-error').addClass('hide');
        }
    }, true)

})


// Ctrl For Navigation
app.controller('NaviCtrl', function($scope, views, $route, auth, $http, user, infoGrab, bookings, bookingGrab, bookings, email, $location, misc, stripeForm, cardDetails, currBooking, /*dashInstant*/ hackTools, $interval) {

    $scope.views = views;
    views.currentView = $route.current.action;
    views.currentType = $route.current.type;
    views = $scope.views;

    // Grab appRoute.js Action Param
    $scope.bookings = bookings;
    $scope.misc = misc;
    $scope.stripeForm = stripeForm;
    $scope.cardDetails = cardDetails;
    $scope.currBooking = currBooking;
    $scope.email = email;
    $scope.isEmailSent = '';
    //$scope.dashInstant = dashInstant;
    $scope.hackTools = hackTools;


    $scope.contactSend = function(){
        $http.post("/api/contact-send/", {email: $scope.email}).success(function(response){
            if(response.success == true) {
                // valid
                $scope.email.emailAddress = '';
                $scope.email.subject = '';
                $scope.email.message = '';
                $scope.isEmailSent = true;
                $interval(function(test){
                    $scope.isEmailSent = false;
                    $interval.cancel();
                },5000,0);
            } else {
                $scope.isEmailSent = false;
                toastr.error(response.message);
            }
        });
        //console.log("test to see if email")
    };

})


app.controller('CheckoutCtrl', function($scope, $location, $localStorage, $http, autho) {

    if($location.path() == '/checkout') {
        if(autho.checkout1 !== true) {$location.path("/dash");}
    }
    if($location.path() == '/checkout-2') {
        $scope.dashInstant = $localStorage.vg.jobDetails;
        $scope.jobDeets = $localStorage.vg.jobDetails;
        if(autho.checkout2 !== true) {$location.path("/dash");}
    }
    if($location.path() == '/checkout-3') {
        if(autho.checkout3 !== true) {$location.path("/dash");}
        if(autho.bc == true) {
          $location.path("/dash");
        }
    }
    if($location.path() == '/booking-complete') {
        if(autho.bc !== true) {$location.path("/dash");}
    }




    $scope.ccDeets = {};

        $scope.jobDeets = $localStorage.vg.jobDetails;

    $scope.vali = function(name, length, msg, cb) {
        if(name == '' || name == undefined || name.length < 3) {
            $.growl.error({ message: msg });
            cb(1);
        } else {
            cb(0);
        }

    }


    /*$scope.next = function(){
        //$localStorage.vg.jobDetails = $scope.jobDeets;
        $scope.dashInstant = $localStorage.vg.jobDetails;
        $scope.jobDeets = $localStorage.vg.jobDetails;
        autho.checkout2 = true;
        $location.path("/checkout-2");
        /*var flag = 0;
        $scope.vali($scope.jobDeets.name, 3, 'Please fill in your name!', function(resp) {
            flag = flag + resp;
            $scope.vali($scope.jobDeets.email, 3, 'Please fill in your email!', function(resp2) {
                flag = flag + resp2;
                $scope.vali($scope.jobDeets.number, 3, 'Please fill in your number!', function(resp3) {
                    flag = flag + resp3;
                    if(flag > 0) {
                        console.log('flagged');
                    } else {

                    }
                });
            });
        });
    }*/

    $scope.back = function(){
        //console.log('bk');
        $location.path("/checkout")
    }

    $scope.next2 = function(){
      if($('#terms-agree').is(":checked")) {
        autho.checkout3 = true;
        $localStorage.vg.jobDetails = $scope.jobDeets;
        $location.path("/checkout-3")
      } else {
        $.growl.error({ message: 'Please agree to the terms.' });
      }

    }

    $scope.back2 = function(){
        $location.path("/checkout")
    }

    $scope.backToBooking = function(){
        $location.path("/dash");
    }

    $scope.testSwift = function() {
        $http.post('/api/book-job', {data: $localStorage.vg.jobDetails}).then(function(resp) {

        })
    }



    $(function() {
      var $form = $('#payment-form');
      $form.submit(function(event) {
          event.preventDefault();

          var flag = 0;
          if($scope.ccDeets.number == undefined || $scope.ccDeets.number.replace(/ /g,'').length !== 16) {
              $.growl.error({ message: 'Card Number Must Be 16 Digits!'});
              flag = flag + 1;
          }
          if($scope.ccDeets.expMonth == undefined || $scope.ccDeets.expMonth.length !== 2) {
              $.growl.error({ message: 'Card Expiration Month Must Be 2 Digits!'});
              flag = flag + 1;
          }
          if($scope.ccDeets.expYear == undefined || $scope.ccDeets.expYear.length !== 2) {
              $.growl.error({ message: 'Card Expiration Year Must Be 2 Digits!'});
              flag = flag + 1;
          }
          if($scope.ccDeets.expCvc == undefined || $scope.ccDeets.expCvc.length !== 3) {
              $.growl.error({ message: 'Card CVC Number Must Be 3 Digits!'});
              flag = flag + 1;
          }
          if($scope.ccDeets.zip == undefined || $scope.ccDeets.zip.length < 4) {
              $.growl.error({ message: 'Please add a billing post code!'});
              flag = flag + 1;
          }

          if(flag > 0) {
              return false;
          } else {
            // Disable the submit button to prevent repeated clicks:
            $form.find('.submit').prop('disabled', true);
            $('.subscribe').after('<img class="spinner" style="width:20px; margin-top:-70px; margin-left:320px; opacity:1;" src="/assets/img/35.gif">');

            // Request a token from Stripe:
            Stripe.card.createToken($form, function(status, res) {
                $localStorage.vg.jobDetails
                $http.post("/api/charge-card", {stripe: res, user: $localStorage.vg.jobDetails}).then(function(status){
                    if(status.data.status !== false) {
                        //$.growl.notice({message: status.data.message});
                        $scope.jobDeets.paymentID = status.data.data.id;
                        $localStorage.vg.jobDetails.paymentID = $scope.jobDeets.paymentID;
                        $http.post('/api/book-job', {data: $localStorage.vg.jobDetails}).then(function(resp) {
                            console.log(resp);
                            if(resp.data.status == true) {
                                autho.bc = true;
                                $location.path("/booking-complete");
                                autho.checkout3 = false;
                                autho.checkout2 = false;
                                autho.checkout1 = false;
                                //$scope.clone = $scope.jobDeets;
                                //$localStorage.vg = {};
                                //$scope.dashInstant = {};
                                //$scope.jobDeets = {};
                                /*$scope.dashInstant.itemBoxes = [
                                    {size: 'smItems', qty: 0},
                                    {size: 'mdItems', qty: 0},
                                    {size: 'lgItems', qty: 0}
                                ]*/
                                $http.post("/api/send-email", {data: $localStorage.vg.jobDetails}).then(function(status){
                                    /*$localStorage.vg = {};
                                    $scope.dashInstant = {};
                                    $scope.dashInstant.itemBoxes = [
                                        {size: 'smItems', qty: 0},
                                        {size: 'mdItems', qty: 0},
                                        {size: 'lgItems', qty: 0}
                                    ]*/
                                });
                            } else {
                                $.growl.error({message: 'Job Booking Failed Please Call Us!'});
                                $form.find('.submit').prop('disabled', false);
                                $('.spinner').remove();
                                $localStorage.vg = {};
                                $scope.dashInstant = {};
                            }
                        })
                    } else {
                        $.growl.error({message: 'Payment Failed, Try a different card!'});
                        $form.find('.submit').prop('disabled', false);
                        $('.spinner').remove();
                    }
                });
            });
        }
        // Prevent the form from being submitted:
        //return false;
      });
    });

    $scope.next3 = function(event){}

    $scope.test = function() {
        $http.post("/api/send-email", {data: $localStorage.vg.jobDetails}).then(function(status){
            //
        });
    }


})
