
// The script, starts to check if there is a registered schedule in local storage with the defined key. If not, it will register a job for every day at sunset.
// The job consists of asking the accuweather API for the minimum temperature for today in this location key (Ermesinde). 
// If the minimum temperature is below the defined value, then it will move the local cover to the zero position and also make remote calls to other two devices and invoke on them the cover to the position zero.
// TO-DO: check dynamically the ips of the remote devices and test the recover from reboot/power failure.

let CONFIG = {
  KVS_KEY: "Script-Schedule-" + JSON.stringify(Shelly.getCurrentScriptId()),
  SCHEDULE_TIMESPEC: "@sunset",
  SCHEDULE_ID: -1,
  LOCATION_KEY: 276274,
  API_KEY: "M3a3N2A15QWECq8AsAFkzw9AS7Rm6t3K",
  IPS: ["192.168.31.211", "192.168.31.161"]
};

let API_URL = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/" + CONFIG.LOCATION_KEY + "?apikey=" + CONFIG.API_KEY + "&details=true"


function fromFarnheitToCelsius(f) { return (f - 32) * 5 / 9; }

function takeAction(minTemp) {
  if (fromFarnheitToCelsius(minTemp) < 11) {
    moveCover(0);
    for (let i = 0; i < CONFIG.IPS.length; i++) {
      moveRemoteCover(0, CONFIG.IPS[i]);
    }
  }
}

function moveCover(percentage) {
 Shelly.call('Cover.goToPosition', { 'id': 0, 'pos': percentage }, function(result, error, undifined){});
}

function moveRemoteCover(percentage, ip) {
  Shelly.call('HTTP.GET', {
    'url': 'http://' + ip + '/rpc/Cover.GoToPos?id=0&pos=' + percentage }, function(result, error, undefined) {});
}

function get_weatherInfo(url) {
 Shelly.call(
     "HTTP.GET", {
       "url": url,
     },
     function(result) {
       takeAction(parseInt(JSON.parse(result.body).DailyForecasts[0].Temperature.Minimum.Value));
     }
 );
}


function registerIfNotRegistered() {
print("Reading from ", CONFIG.KVS_KEY);
Shelly.call(
  "KVS.Get",
  {
    key: CONFIG.KVS_KEY,
  },
  function (result, error_code, error_message) {
    print("Read from KVS", JSON.stringify(error_code));
    //we are not registered yet
    if (error_code !== 0) {
      installSchedule();
      return;
    }
    CONFIG.SCHEDULE_ID = result.value;
    //check if the schedule was deleted and reinstall
    Shelly.call("Schedule.List", {}, function (result) {
      let i = 0;
      for (i = 0; i < result.jobs.length; i++) {
        if (result.jobs[i].id === CONFIG.SCHEDULE_ID) return;
      }
      installSchedule();
    });
  }
);
}

function saveScheduleIDInKVS(scheduleId) {
Shelly.call("KVS.Set", {
  key: CONFIG.KVS_KEY,
  value: scheduleId,
});
}

function installSchedule() {
Shelly.call(
  "Schedule.Create",
  {
    enable: true,
    timespec: CONFIG.SCHEDULE_TIMESPEC,
    calls: [
      {
        method: "script.eval",
        params: {
          id: Shelly.getCurrentScriptId(),
          code: "scheduledTask()",
        },
      },
    ],
  },
  function (result) {
    //save a record that we are registered
    saveScheduleIDInKVS(result.id);
  }
);
}

registerIfNotRegistered();

//Actual task that is to be run on a schedule
function scheduledTask() {
  get_weatherInfo(API_URL);
}
