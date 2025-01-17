

let locationKey = 276274;
let API_Key = "M3a3N2A15QWECq8AsAFkzw9AS7Rm6t3K";
let url = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/" + locationKey + "?apikey=" + API_Key + "&details=true";


function fromFarnheitToCelsius(f) { return (f - 32) * 5 / 9; }

function moveAtSunset(minTemp, sunsetTime) {
 if (fromFarnheitToCelsius(minTemp) < 11) {
    moveCover(10)
 }
}

function moveCover(percentage) {
 Shelly.call('Cover.goToPosition', { 'id': 0, 'pos': percentage }, function(result, error, undifined){});
}

function get_weatherInfo(url) {
    print('CAll the function')
    //  Shelly.call(
//      "HTTP.GET", {
//        "url": url,
//      },
//      function(result, error_code, error_message) {
//         moveAtSunset(parseInt(JSON.parse(result.body).DailyForecasts[0].Temperature.Minimum.Value));
//      }
//  );
}

Shelly.call('Schedule.Create', {
  timespec: '0 28 19 * * SUN-SAT',
  calls: [
      {
          method: get_weatherInfo(url)
      }
  ]
}, function(result, error_code, error_message) {print('Result: ', JSON.stringify(result))})

Shelly.call('Schedule.List', {}, function(result, error_code, error_message) {print(JSON.stringify(result))})
// Shelly.call('Schedule.Delete', {id: 2}, function(result, error_code, error_message) {print(JSON.stringify(result))})