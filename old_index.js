const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const https = require('https');
const xml2js = require('xml2js');
//const querystring = require('querystring');


var poll = require('./components/poll.js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  let statusMsgs = [];
  https.get(hourPath2_5, (rs) => {
      const { statusCode } = rs;
      let error;
      if (statusCode !== 200) {
          error = new Error(`Request Failed.\n` +
              `Status Code: ${statusCode}`);
      }
      if (error) {
          console.error(error.message);
          rs.resume();
      } else {
          rs.setEncoding('utf8');
          let rawData = '';
          rs.on('data', (chunk) => { rawData += chunk; });
          rs.on('end', () => {
              try {
                  var parser = new xml2js.Parser();
                  var extractedData = "";
                  parser.parseString(rawData, function(err,result){
                      extractedData = result['feed']['entry'];
                      if(typeof extractedData != 'undefined' && Object.prototype.toString.call(extractedData) === '[object Array]'){
                          extractedData.forEach((value, index) => {
                              let summary = value['summary'][0]['_'];
                              //console.log("Summary",summary);
                              let title = value['title'][0];
                              statusMsgs.push({
                                title: title,
                                content: summary});
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
          });
      }
  }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
  })

})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


poll.polling();
