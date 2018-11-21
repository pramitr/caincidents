const getContent = require('./getContent.js');
const sfoUrl = "http://feeds.enviroflash.info/rss/realtime/133.xml"; // San Francisco
const sjcUrl = "http://feeds.enviroflash.info/rss/realtime/134.xml"; // San Jose
const frmUrl = "http://feeds.enviroflash.info/rss/realtime/45.xml"; // Fremont
const xml2js = require('xml2js');

let renderAqi = (req, res) => {
  let callSfo = getContent(sfoUrl);
  let callSjc = getContent(sjcUrl);
  let callFrm = getContent(frmUrl);

  Promise.all([callSfo, callSjc, callFrm])
  .then((values) => {
    let messages = [];
    try {
			var parser = new xml2js.Parser();
      values.forEach((value, index) => {
        let extractedData = [];
        parser.parseString(value, function(err,result){
          extractedData = result['rss']['channel'][0]['item'][0];
          let title = extractedData['title'][0];
          let link = extractedData['link'][0];
          let desc = extractedData['description'][0];
          let msg = {
            "title": title,
            "link": link,
            "desc": desc
          };
          messages.push(msg);
        });
      })

    } catch (e) {
      console.error(e.message);
    }

    res.render('pages/aqi', {
        page: "California Bay Area Air Quality Index",
        messages: messages,
        pageId: "aqi"
    });
  })
  .catch((err) => console.error(`Got error while rendering AQI: ${err.message}`))
  
}

module.exports = renderAqi;
