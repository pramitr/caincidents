const getContent = require('./getContent.js');
const hourPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.atom"
const dayPath2_5 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.atom"
const xml2js = require('xml2js');

let renderEQ = (req, res, url, pageId) => {
	var path = hourPath2_5;
	if(url === "day") path = dayPath2_5;
	getContent(path)
	.then((resp) => {
        let statusMsgs = [];
        let pageLabel = "USGS Earthquake Report for California";
		try {
            var parser = new xml2js.Parser();
            var extractedData = "";
            parser.parseString(resp, function(err,result){
                pageLabel = result['feed']['title'];
                extractedData = result['feed']['entry'];
                if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
                    extractedData.forEach((value, index) => {
                        let summary = value['summary'][0]['_'];
                        let link = value['link'][0]['$']['href'];
                        let timestamp = value['updated'][0];
                        let pacificTime = new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
                        let title = value['title'][0];
                        //console.log("Link: ", link);
                        //console.log("Updated: ", timestamp);
                        statusMsgs.push({
                            title: title,
                            content: summary,
                            time: pacificTime,
                            link: link
                        });
                    })
                }
            });
        } catch (e) {
            console.error(e.message);
        }
        //console.log("Status",statusMsgs);
        res.render('pages/eq', {
            pageLabel: pageLabel,
            pageTitle: "California Earthquakes",
            messages: statusMsgs,
            pageId: pageId
        })
	})
    .catch((err) => console.error(`Got error while rendering EQ: ${err.message}`));
}

module.exports = renderEQ;
