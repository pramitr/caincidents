const https = require('https');

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
                        console.log("Response raw data:",rawData);
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

                        setTimeout(poll.pollB, 300000);
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
