const getContent = require('./getContent.js');
const fireUrl = "http://www.fire.ca.gov/rss/rss.xml";
const xml2js = require('xml2js');
const latlongToDMS = require('../components/latlongToDMS.js');

let renderFire = (req, res) => {
	getContent(fireUrl)
	.then((resp) => {
		let messages = [];
		try {
			var parser = new xml2js.Parser();
            var extractedData = [];
            parser.parseString(resp, function(err,result){
            	extractedData = result['rss']['channel'][0]['item'];
            	console.log("ExtractedData", extractedData);
            	if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
            		extractedData.forEach((value, index) => {
            			let link = value['link'][0];
            			let title = value['title'][0];
            			let desc = value['description'][0];
            			let lat = "";//value['geo:lat'][0];
            			let long = value['geo:long'][0];
            			let location = "";//latlongToDMS(lat, long);
            			//console.log("link: ",link);
            			//console.log("title: ",title)
            			console.log("lat long: ",lat,long);
            			//console.log("desc: ",desc);
            			messages.push({
            				link: link,
            				title: title,
            				desc: desc,
            				location: location
            			})
            		});
            	}
            	else {
            		console.log("Not array");
            	}

            });

		} catch (e) {
            console.error(e.message);
        }

        

        res.render('pages/fire', {
            page: "Fire in CA",
            messages: messages
        })

	})
	.catch((err) => console.error(`Got error while rendering Fire: ${err.message}`));
}

module.exports = renderFire;