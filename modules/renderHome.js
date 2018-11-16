const getContent = require('./getContent.js');
const hourPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.atom"
const dayPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom"
const xml2js = require('xml2js');

let renderHome = (req, res) => {
	getContent(hourPath2_5)
	.then((resp) => {
        let statusMsgs = [];
		try {
            var parser = new xml2js.Parser();
            var extractedData = "";
            parser.parseString(resp, function(err,result){
                extractedData = result['feed']['entry'];
                if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
                    extractedData.forEach((value, index) => {
                        let summary = value['summary'][0]['_'];
                      //console.log("Summary",summary);
                        let title = value['title'][0];
                        statusMsgs.push({
                            title: title,
                            content: summary
                        });
                    })
                }
            });
        } catch (e) {
            console.error(e.message);
        }
        console.log("Status",statusMsgs);
        res.render('pages/start', {
            messages: statusMsgs
        })
	})
    .catch((err) => console.error(`Got error: ${err.message}`));
}

module.exports = renderHome;