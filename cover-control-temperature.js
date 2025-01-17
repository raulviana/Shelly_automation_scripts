
// The script, will fetch via REST api from a weather service the
// current conditions for a location. Checks if minimum temperature is below
// certain value and respectively open or close window shades by calling a
// Shelly 2.5 (Gen1) endpoint


let locationKey = 276274;
let API_Key = "M3a3N2A15QWECq8AsAFkzw9AS7Rm6t3K";
let url = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/" + locationKey + "?apikey=" + API_Key + "&details=true";


function fromFarnheitToCelsius(f) { return (f - 32) * 5 / 9; }

function takeAction(minTemp, sunsetTime) {
 if (fromFarnheitToCelsius(minTemp) < 11) {
    let sunset = sunsetTime.substring(0, sunsetTime.indexOf('+'));
    sunset = new Date(sunset);
    let now = new Date();
    Timer.set(sunset.getTime() - now.getTime(), false, function() {moveCover(0);});
 }
}

function moveCover(percentage) {
 Shelly.call('Cover.goToPosition', { 'id': 0, 'pos': percentage }, function(result, error, undifined){});
}

function get_weatherInfo(url) {
 Shelly.call(
     "HTTP.GET", {
       "url": url,
     },
     function(result) {
       takeAction(parseInt(JSON.parse(result.body).DailyForecasts[0].Temperature.Minimum.Value), JSON.parse(result.body).DailyForecasts[0].Sun.Set);
     }
 );
}

//Every day
Timer.set(86400000, true, function() {
    get_weatherInfo(url);
})

//First day
Timer.set(1000, false, function() {
    get_weatherInfo(url);
})
