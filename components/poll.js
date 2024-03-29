const https = require('https');
const xml2js = require('xml2js');
const {is_wee_hour, is_day_time} = require('./time.js');
const hourPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.atom"
const dayPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom"

var blinkSun = () => {
    var red = "red";
    var white = "brightness:0.1";
    var color = (is_day_time())? red : white;

    var post_data = JSON.stringify({
        "color": color,
        "period": 1,
        "cycles": 2,
        "persist": false,
        "power_on": true
    });

    var length = post_data.length;

    var post_options = {
      host: 'api.lifx.com',
      port: 443,
      path: '/v1/lights/d073d521270c/effects/pulse',
      method: 'POST',
      headers: {
          'Authorization': ' Bearer cc7cf933ebefaf7b47574d219e3d2aa5e8338108e4627b3243d418c58376707b',
          'Content-Type': 'application/json',
          'Content-Length': length
      }
    };

    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        let body = '';
        res.on('data', function (chunk) {
            body += chunk.toString();
        });
        res.on('end', () => {
            console.log("Response", body);
        });
    });

    post_req.on('error', function(err) {
        console.log('Error: ' + err);
    });

    post_req.write(post_data);
    post_req.end();

}

const poll = {
    polling: function() {
        https.get(hourPath2_5, (res) => {
            const { statusCode } = res;

            let error;
            if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                    `Status Code: ${statusCode}`);
            }

            if (error) {
                console.error(error.message);
                res.resume();
            } else {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        //const parsedData = JSON.parse(rawData);
                        //console.log("Raw data",parsedData);
                        var parser = new xml2js.Parser();
                        var extractedData = "";
                        // console.log("Response raw data:",rawData);
                        parser.parseString(rawData, function(err,result){

                            extractedData = result['feed']['entry'];
                            if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
                                extractedData.forEach((value, index) => {
                                    var title = value['title'][0];
                                    var regex = /CA|California/g;
                                    var found = title.match(regex);
                                    if(found != null && !is_wee_hour()) {
                                        setTimeout(function() {
                                            blinkSun()
                                        }, 1500 * index)
                                    }
                                    else {
                                      console.log("Is wee hour? ",is_wee_hour());
                                      console.log("Is CA or California match found? ",found);
                                    }
                                })
                            }

                        });

                        setTimeout(poll.polling, 300000);
                        /*
                        // The important logic comes here
                        if (parsedData.status === 'BUSY') {
                            setTimeout(poll.pollB, 300000); // request again in 5 mniutes
                        } else {
                            // Call the background process you need to
                        }
                        */
                    } catch (e) {
                        console.error(e.message);
                    }
                });
            }
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    }
}

module.exports = poll;
