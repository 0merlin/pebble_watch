var battery_percentage = -1;
var battery_charging = -1;

navigator.getBattery().then(function(battery) {
  battery.addEventListener('chargingchange', function(){
    updateChargeInfo();
  });
  function updateChargeInfo(){
    battery_charging = battery.charging ? 1 : 0;
    console.log("Battery charging " + battery_charging);
    Pebble.sendAppMessage({'PhoneBatteryCharging' : battery_charging});
  }

  battery.addEventListener('levelchange', function(){
    updateLevelInfo();
  });
  function updateLevelInfo(){
    battery_percentage = Math.floor(battery.level * 100);
    console.log("Battery percentage " + battery_percentage);
    Pebble.sendAppMessage({'PhoneBattery' : battery_percentage});
    if (battery_percentage == 100) {
      Pebble.showSimpleNotificationOnPebble("Phone Battery", "Phone battery fully charged");
    } else if (battery_charging === 0) {
      if (battery_percentage == 50) {
        Pebble.showSimpleNotificationOnPebble("Phone Battery", "Phone battery is at half");
      } else if (battery_percentage == 15) {
        Pebble.showSimpleNotificationOnPebble("Phone Battery", "Phone battery is getting low");
      }
    }
  }
  
  updateChargeInfo();
  updateLevelInfo();

});

function locationSuccess(pos) {
  var coordinates = pos.coords;
  localStorage.setItem('Longitude', coordinates.longitude);
  localStorage.setItem('Latitude', coordinates.latitude);
  Pebble.sendAppMessage({
    'Longitude': '' + coordinates.longitude,
    'Latitude' : '' + coordinates.latitude
  });
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  Pebble.sendAppMessage({
    'Longitude': '0.0',
    'Latitude' : '0.0'
  });
}

var locationOptions = {
  'enableHighAccuracy': false,
  'timeout': 150000,
  'maximumAge': 3600000
};

Pebble.addEventListener('ready', function (e) {
  console.log('connect!' + e.ready);
  setTimeout(function(){
    var lat = localStorage.getItem('Latitude');
    var lon = localStorage.getItem('Longitude');
    if (lat !== null && lon !== null) {
      Pebble.sendAppMessage({
        'Longitude': '' + lon,
        'Latitude' : '' + lat
      });
    } else {
      window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    }
  }, 1000);
  console.log(e.type);
});

Pebble.addEventListener('appmessage', function (e) {
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
  console.log(e.type);
});

Pebble.addEventListener('webviewclosed', function (e) {
  console.log('webview closed');
  console.log(e.type);
  console.log(e.response);
});