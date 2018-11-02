const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const https = require('https');
const xml2js = require('xml2js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

const poll = {
    pollB: function() {
        https.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.atom', (res) => {
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
                            extractedData.forEach((value) => {
                                console.log(value['title']);
                            })
                            
                        });

                        setTimeout(poll.pollB, 60000);
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
