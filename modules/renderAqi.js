const getContent = require('./getContent.js');
const getJsonContent = require('./getJsonContent.js');
const airVisualApiKey = "hidden";
const ipgeoApiKey = "hidden";
const sfoUrl = "https://feeds.enviroflash.info/rss/realtime/133.xml"; // San Francisco
const sjcUrl = "https://feeds.enviroflash.info/rss/realtime/134.xml"; // San Jose
const frmUrl = "https://feeds.enviroflash.info/rss/realtime/45.xml"; // Fremont
const deathValleyUrl = "http://feeds.airnowapi.org/rss/realtime/461.xml"; // death valley national park
const joshuaTreeUrl = "https://feeds.enviroflash.info/rss/realtime/462.xml"; //Joshua Tree National Park
const lassenUrl = "https://feeds.enviroflash.info/rss/realtime/463.xml"; //Lassen Volcanic National Park
const sekiUrl = "https://feeds.enviroflash.info/rss/realtime/467.xml"; //Sequioa and Kings Canyon National Parks
const yosemiteUrl = "https://feeds.enviroflash.info/rss/realtime/469.xml"; //Yosemite National Park
const craterLakeUrl = "https://feeds.enviroflash.info/rss/realtime/701.xml" // Crater Lake
const airVisualApiUrl = "api.airvisual.com";
const nearestCityApiPath = "/v2/nearest_city?key=" + airVisualApiKey;
const xml2js = require('xml2js');


let composeAirVisualApiData = (resp, timezone) => {
  // AirVisual Weather Condition Map
  let avwcm = new Map();
  avwcm.set('01d', {condition: "Clear Sky (day)", iconKey: '01d'});
  avwcm.set('01n', {condition: "Clear Sky (night)", iconKey: '01n'});
  avwcm.set('02d', {condition: "Few Clouds (day)", iconKey: '02d'});
  avwcm.set('02n', {condition: "Few Clouds (night)", iconKey: '02n'});
  avwcm.set('03d', {condition: "Scattered Clouds (day)", iconKey: '03d'});
  avwcm.set('03n', {condition: "Scattered Clouds (night)", iconKey: '03d'});
  avwcm.set('04d', {condition: "Broken Clouds (day)", iconKey: '04d'});
  avwcm.set('04n', {condition: "Broken Clouds (night)", iconKey: '04d'});
  avwcm.set('09d', {condition: "Shower Rain (day)", iconKey: '09d'});
  avwcm.set('09n', {condition: "Shower Rain (night)", iconKey: '09d'});
  avwcm.set('10d', {condition: "Rain (day time)", iconKey: '10d'});
  avwcm.set('10n', {condition: "Rain (night time)", iconKey: '10n'});
  avwcm.set('11d', {condition: "Thunderstorm (day)", iconKey: '11d'});
  avwcm.set('11n', {condition: "Thunderstorm (night)", iconKey: '11d'});
  avwcm.set('13d', {condition: "Snow", iconKey: '13d'});
  avwcm.set('13n', {condition: "Snow (night)", iconKey: '13n'});
  avwcm.set('50d', {condition: "Mist (day)", iconKey: '50d'});
  avwcm.set('50n', {condition: "Mist (night)", iconKey: '50d'});

  let weatherIconHost = "https://www.airvisual.com/images/";

  let v2weather = resp.data.current.weather;
  let v2pollution = resp.data.current.pollution;
  let v2timestamp = v2weather.ts
  
  let tempC = parseFloat(v2weather.tp);
  let tempF = tempC * 1.8 + 32;
  let temperature = tempF.toFixed(1);
  let pressure = v2weather.pr;
  let humidity = v2weather.hu;
  let windSpeedFloat = parseFloat(v2weather.ws) * 2.24;
  let windSpeed = windSpeedFloat.toFixed(2);
  let windDirection = v2weather.wd;
  let weatherIconUrl = weatherIconHost + avwcm.get(v2weather.ic).iconKey + ".png";
  let weatherCondition = avwcm.get(v2weather.ic).condition;
  let detectedCity = resp.data.city;
  let detectedState = resp.data.state;

  let aqiScore = v2pollution.aqius;
  let pollutant = v2pollution.mainus;
  let aqiColor = getAQIColor(aqiScore);
  
  let localTime = new Date(v2timestamp).toLocaleString('en-US', { timeZone: timezone });
  
  return {
    "city": detectedCity,
    "state": detectedState,
    "time": localTime,
    "weatherCondition": weatherCondition,
    "temperature": temperature,
    "pressure": pressure,
    "humidity": humidity,
    "windSpeed": windSpeed,
    "windDirection": windDirection,
    "weatherIconUrl": weatherIconUrl,
    "aqi": aqiScore,
    "aqiBgColor": aqiColor.background,
    "aqiColor": aqiColor.color,
    "pollutant": pollutant
  };
}

let getAQIColor = (aqiString) => {
  let aqi = parseFloat(aqiString);
  let background = "white";
  let color = "inherit";
  if(aqi >= 0 && aqi < 51) {
    background = "rgb(0, 228, 0)";
    color = "inherit";
  } 
  else if(aqi > 50 && aqi < 101) {
    background = "yellow";
    color = "inherit";
  }
  else if(aqi > 100 && aqi < 151) {
    background = "rgb(255, 126, 0)";
    color = "white";
  }
  else if(aqi > 150 && aqi < 201) {
    background = "red";
    color = "white";
  }
  else if(aqi > 200 && aqi < 301) {
    background = "rgb(143, 63, 151)";
    color = "white";
  }
  else if(aqi > 300) {
    background = "rgb(126, 0, 35)";
    color = "white";
  }
  return {
    "background": background,
    "color": color
  };
}

let extractPollutionData = (resp) => {
  let ppAqi = "Updating";
  let ppType = "Particle Pollution (2.5 microns): ";
  let ppCondition = "(check later)";
  let ozoneTitle = "Ozone: ";
  let ozoneAqi = "Updating";
  let ozoneCondition = "(check later)";
  let result = {
    "ppAqi": ppAqi,
    "ppType": ppType,
    "ppCondition": ppCondition,
    "ozoneTitle": ozoneTitle,
    "ozoneAqi": ozoneAqi,
    "ozoneCondition": ozoneCondition
  };
  const regex = new RegExp(/(?<=Current Air Quality:<\/b>)(.*)<div>(.*?)<\/div>(.*)(?=<b>Agency:)/);
  let groups = resp.match(regex);
  if(groups == null || groups.length != 4) {
    console.log("Regex result group size does not match ", groups);
    return result;
  }
  let pollutionInfoLine = groups[2];
  let cleanPolInfo = pollutionInfoLine.replace(/(<([^>]+)>)/g, "").trim(); //removes all HTML tags
  //console.log("Clean line:" + cleanPolInfo);
  let dataArray = cleanPolInfo.split("\t"); //tab character
  //console.log("Length:" + dataArray.length);
  if(dataArray.length == 2) {
    let maybePP = dataArray[0];
    let maybeOzone = dataArray[1];
    if(maybePP.includes("Particle")){
      let ppArray = maybePP.split("-");
      ppType = ppArray[2] + ": ";
      ppAqi = ppArray[1];
      ppCondition = "(" + ppArray[0] + ")";
      //console.log("ppType:"+ppType);
      //console.log("ppAqi:"+ppAqi);
      //console.log("ppCondition:"+ppCondition);
    }
    if(maybeOzone.includes("Ozone")) {
      let ozoneArray = maybeOzone.split("-");
      ozoneTitle = ozoneArray[2] + ": ";
      ozoneAqi = ozoneArray[1];
      ozoneCondition = "(" + ozoneArray[0] + ")";
      //console.log("ozoneTtitle:"+ozoneTitle);
      //console.log("ozoneAqi:"+ozoneAqi);
      //console.log("ozoneCondition:"+ozoneCondition);
    }
    result = {
      "ppAqi": ppAqi,
      "ppType": ppType,
      "ppCondition": ppCondition,
      "ozoneTitle": ozoneTitle,
      "ozoneAqi": ozoneAqi,
      "ozoneCondition": ozoneCondition
    };
  }
  else {
    let someData = dataArray[0];
    console.log("Some data absent " + dataArray);
    if(someData.includes("Particle")){
      let ppArray = someData.split("-");
      ppType = ppArray[2] + ": ";
      ppAqi = ppArray[1];
      ppCondition = "(" + ppArray[0] + ")";
      //console.log("ppTyep:"+ppType);
      //console.log("ppAqi:"+ppAqi);
      //console.log("ppCondition:"+ppCondition);
    }
    else if (someData.includes("Ozone")) {
      let ozoneArray = someData.split("-");
      ozoneTitle = ozoneArray[2] + ": ";
      ozoneAqi = ozoneArray[1];
      ozoneCondition = "(" + ozoneArray[0] + ")";
      //console.log("ozoneTtitle:"+ozoneTitle);
      //console.log("ozoneAqi:"+ozoneAqi);
      //console.log("ozoneCondition:"+ozoneCondition);
    }
    result = {
      "ppAqi": ppAqi,
      "ppType": ppType,
      "ppCondition": ppCondition,
      "ozoneTitle": ozoneTitle,
      "ozoneAqi": ozoneAqi,
      "ozoneCondition": ozoneCondition
    };
  }
  return result;
}


let renderAqi = (req, res) => {
  let clientIp = req.headers['x-forwarded-for'];
  console.log("Client's IP: " + clientIp);
  let callSfo = getContent(sfoUrl);
  let callSjc = getContent(sjcUrl);
  let callFrm = getContent(frmUrl);
  let callDVNP = getContent(deathValleyUrl);
  let callJTNP = getContent(joshuaTreeUrl);
  let callLVNP = getContent(lassenUrl);
  let callSEKI = getContent(sekiUrl);
  let callYNP = getContent(yosemiteUrl);
  let callCLNP = getContent(craterLakeUrl);
  let iqAirCall = getJsonContent(airVisualApiUrl, nearestCityApiPath, true, clientIp);
  let ipApi = "https://api.ipgeolocation.io/ipgeo?apiKey=" + ipgeoApiKey + "&ip=" + clientIp;
  let ipgeoCall = getJsonContent(ipApi, null, false, null);

  Promise.all([iqAirCall, 
    ipgeoCall,
    callSfo, 
    callSjc, 
    callFrm, 
    callDVNP,
    callJTNP,
    callLVNP,
    callSEKI,
    callYNP,
    callCLNP])
  .then((values) => {
    let messages = [];
    let messageV2 = {};

    try {
      let iqAirResp = values[0];
      let ipgeoresp = values[1];
      let clientTimezone = ipgeoresp.time_zone.name;

			var parser = new xml2js.Parser();
      values.forEach((value, index) => {
        if(index > 1) {
          let extractedData = [];
          parser.parseString(value, function(err,result){
            extractedData = result['rss']['channel'][0]['item'][0];
            let title = extractedData['title'][0];
            let link = extractedData['link'][0];
            let desc = extractedData['description'][0].replace(/(\r\n|\n|\r|\s\s)/g, '');
            let pollution = extractPollutionData(desc);
            let msg = {
              "title": title,
              "link": link,
              "ppAqi": pollution.ppAqi,
              "ppType": pollution.ppType,
              "ppCondition": pollution.ppCondition,
              "ozoneAqi": pollution.ozoneAqi,
              "ozoneTitle": pollution.ozoneTitle,
              "ozoneCondition": pollution.ozoneCondition
            };
            messages.push(msg);
          });
        }
      });

      messageV2 = composeAirVisualApiData(iqAirResp, clientTimezone);

    } catch (e) {
      console.error(e.message);
    }

    res.render('pages/aqi', {
        pageLabel: "California Air Quality Index",
        pageTitle: "California Air Pollution",
        messages: messages,
        messageV2: messageV2,
        pageId: "aqi"
    });
  })
  .catch((err) => console.error(`Got error while rendering AQI: ${err.message}`))
  
}

module.exports = renderAqi;
