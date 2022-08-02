const getJsonContent = require('./getJsonContent.js');
const fireUrl = "https://www.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false";
//const xml2js = require('xml2js');
const latlongToDMS = require('../components/latlongToDMS.js');

let renderFire = (req, res) => {
	getJsonContent(fireUrl, null, false, null)
	.then((resp) => {
		let messages = [];
		try {
			/*
			var extractedData = [];
			var parser = new xml2js.Parser();
            parser.parseString(resp, function(err,result){
            	extractedData = result['rss']['channel'][0]['item'];
            	//console.log("ExtractedData", extractedData);
            	if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
            		extractedData.forEach((value, index) => {
            			let link = value['link'][0];
            			let title = value['title'][0];
            			let desc = value['description'][0];
            			let lat = (value["geo:lat"] != undefined)? value["geo:lat"][0] : 0;
            			let long = (value["geo:long"] != undefined) ? value["geo:long"][0] : 0;
            			let location = latlongToDMS(lat, long);
            			//console.log("link: ",link);
            			//console.log("title: ",title)
            			//console.log("lat long: ",lat,long);
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
            		console.log("Extracted response not an array");
            	}

			});
			*/
			resp.forEach(element => {
				let link = element.Url;
				let title = element.Name;
				let lat = element.Latitude;
				let long = element.Longitude;
				let desc = element.ControlStatement;
				let location = element.Location;
				let county = element.County;
				let pCont = element.PercentContained;
				let utcTime = element.Started;
				let localTime = new Date(utcTime).toLocaleString();
				let acres = element.AcresBurned
				let isCalFire = element.CalFireIncident;
				messages.push({
					link: link,
					title: title,
					desc: desc,
					county: county,
					pCont: pCont,
					started: localTime,
					location: location,
					acres: acres,
					isCalFire: isCalFire
				});
			});
		} catch (e) {
            console.error(e.message);
        }

        const content = messages.filter(m => m.isCalFire);

        res.render('pages/fire', {
			pageLabel: "All Cal Fire incidents",
			pageTitle: "California Fire Incidents",
            messages: content,
            pageId: "fire"
        })

	})
	.catch((err) => console.error(`Got error while rendering Fire: ${err.message}`));
}

module.exports = renderFire;