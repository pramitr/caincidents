const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const https = require('https');
const xml2js = require('xml2js');
//const querystring = require('querystring');


var poll = require('./components/poll.js');
var renderHome = require('./modules/renderHome.js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  renderHome(req, res);
})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


poll.polling();
