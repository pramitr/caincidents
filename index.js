const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const https = require('https');
const xml2js = require('xml2js');
//const querystring = require('querystring');
const hourPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.atom"
const dayPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom"

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

var blinkSun = () => {
    var post_data = {
        "color": "red",
        "period": 1,
        "cycles": 2,
        "persist": false,
        "power_on": true
    };

    var post_options = {
      host: 'api.lifx.com',
      port: 443,
      path: '/v1/lights/d073d521270c/effects/pulse',
      method: 'POST',
      headers: {
          Authorization: ' Bearer cc7cf933ebefaf7b47574d219e3d2aa5e8338108e4627b3243d418c58376707b',
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify(post_data).length
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
    pollB: function() {
        https.get(dayPath2_5, (res) => {
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
                        parser.parseString(rawData, function(err,result){
                            extractedData = result['feed']['entry'];
                            extractedData.forEach((value, index) => {
                                var title = value['title'][0];
                                var regex = /CA/g;
                                var found = title.match(regex);
                                if(found != null) {
                                    setTimeout(function() {
                                        blinkSun()
                                    }, 1500 * index)
                                }
                            })
                            
                        });

                        setTimeout(poll.pollB, 120000);
                        /*
                        // The important logic comes here
                        if (parsedData.status === 'BUSY') {
                            setTimeout(poll.pollB, 60000); // request again in 10 secs
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

poll.pollB();
