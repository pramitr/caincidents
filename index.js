const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const enforce = require('express-sslify');
//const querystring = require('querystring');


var poll = require('./components/poll.js');
var renderEQ = require('./modules/renderEarthquake.js');
var renderFire = require('./modules/renderFire.js');
var renderAqi = require('./modules/renderAqi.js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  renderEQ(req, res);
})
app.get('/eq', (req, res) => {
  renderEQ(req, res);
})
app.get('/fire', (req, res) => {
  renderFire(req, res);
})
app.get('/aqi', (req, res) => {
  renderAqi(req, res);
})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


poll.polling();
