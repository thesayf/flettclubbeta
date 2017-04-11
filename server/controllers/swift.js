var swiftKey = 'd84c5aeb-f5dc-4a24-8f63-4e56856defb3';
var deliveryUrl = 'https://app.getswift.co/api/v2/deliveries';
var driverUrl = 'https://app.getswift.co/api/v2/drivers?apiKey='+swiftKey+'&filter=OnlineNow';

var swift = {};

swift.listDrivers = function(needle, cb) {
    needle.get(driverUrl, function(error, response) {
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
    });
}

swift.bookJob = function(rest, data, cb) {

    //console.log(data);
    //pickupTime: "2016-11-30T15:51:34.9962121+00:00"
    if(data.extraHelp == false) {
        data.extraHelp = '1 Man';
    } else {
        data.extraHelp = '2 Man';
    }

    if(data.pickInstructions == undefined) {
        data.pickInstructions = '';
    } else {
      data.pickInstructions = 'Pickup Instructions: '+pickInstructions;
    }

    if(data.delInstructions == undefined) {
          data.delInstructions = '';
    } else {
      data.delInstructions = 'Pickup Instructions: '+pickInstructions;
    }

    var dateSplit = data.jobDate.split('-');
    var year = dateSplit[2];
    var month = dateSplit[1];
    var day = dateSplit[0];
    var delItems = [];
    var dropArrKeyMax = data.extraDropObj.length-1;

    for(key in data.extraDropObj) {
      console.log(data.extraDropObj[key]);
      /*delItems[key].quantity = 1;
      delItems[key].description = 'Door Number: '+data.extraDropObj[key].doorNumber+', '+
      'Postcode: '+data.extraDropObj[key].postcode+', '+
      'Name: '+data.extraDropObj[key].name+', '+
      'Number: '+data.extraDropObj[key].number+', '+
      'Email: '+data.extraDropObj[key].email+', '+
      'Instructions: '+data.extraDropObj[key].instructions;*/
    }

    delItems.push({"quantity": data.itemBoxes[0].qty, "description": 'Small Items'});
    delItems.push({"quantity": data.itemBoxes[1].qty, "description": 'Medium Items'});
    delItems.push({"quantity": data.itemBoxes[2].qty, "description": 'Large Items'});



    // ref: day, date, timeslot, price-deposit, porter

    var swiftObj = {
      "apiKey": swiftKey,
      "booking": {
        "reference": data.jobDate+',('+data.jobStartTime+'),£'+(parseInt(data.estiCalc) - parseInt(data.deposit))+','+data.extraHelp,
        "deliveryInstructions": data.pickInstructions+' '+data.delInstructions+' - '+ 'Sm:'+data.itemBoxes[0].qty+', Md:'+data.itemBoxes[1].qty+', Lg:'+data.itemBoxes[2].qty+' cubic feet: '+data.jobMinCub+' - '+data.jobMaxCub+' cuFt'+', Item Type:'+data.delType,
        "itemsRequirePurchase": false,
        "items": delItems,
        "pickupTime": '20'+year+'-'+month+'-'+day+'T'+data.jobStartTime.split('-')[0],
        "pickupDetail": {
          "name": data.pickName,
          "phone": data.pickNumber,
          "email": data.pickEmail,
          //"description": "sample string 4",
          //"addressComponents": "sample string 5",
          "address": data.address.start_location.number+', '+data.address.start_location.name,
          "additionalAddressDetails": {
            //"stateProvince": "sample string 1",
            //"country": "sample string 2",
            //"suburbLocality": "sample string 3",
            //"postcode": "sample string 4",
            "latitude": data.address.start_location.lat,
            "longitude": data.address.start_location.lng
          }
        },
        //"dropoffWindow": {
          //"earliestTime": "2016-11-30T15:51:34.9962121+00:00",
          //"latestTime": "2016-11-30T15:51:34.9962121+00:00"
        //},
        "dropoffDetail": {
          "name": data.delName,
          "phone": data.delNumber,
          "email": data.delEmail,
          //"description": "sample string 4",
          //"addressComponents": "sample string 5",
          "address": data.extraDropObj[dropArrKeyMax].doorNumber+', '+data.extraDropObj[dropArrKeyMax].postcode.formatted_address,
          "additionalAddressDetails": {
            //"stateProvince": "sample string 1",
            //"country": "sample string 2",
            //"suburbLocality": "sample string 3",
            //"postcode": "sample string 4",
            "latitude": data.extraDropObj[dropArrKeyMax].lat,
            "longitude": data.extraDropObj[dropArrKeyMax].lng
          }
        },
        "customerFee": data.estiCalc - data.deposit,
        "customerReference": data.email,
        //"tax": 1.0,
        //"taxInclusivePrice": false,
        //"tip": 1.0,
        "driverFeePercentage": 100,
        //"driverMatchCode": "sample string 7",
        //"deliverySequence": 8,
        /*"webhooks": [
          {
            "eventName": "sample string 1",
            "url": "sample string 2"
          },
          {
            "eventName": "sample string 1",
            "url": "sample string 2"
          }
        ]*/
      }
  }

  console.log(swiftObj);

    rest.post(deliveryUrl, {data: swiftObj}).on('complete', function(data, response) {
      //console.log(response);
        cb(response);
    });
}

module.exports = swift;
