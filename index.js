const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const enforce = require('express-sslify');
//const querystring = require('querystring');
const oneHour = 3600000;


var poll = require('./components/poll.js');
var renderEQ = require('./modules/renderEarthquake.js');
var renderFire = require('./modules/renderFire.js');
var renderAqi = require('./modules/renderAqi.js');
var renderStatic = require('./modules/renderStatic.js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneHour }))
app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  renderEQ(req, res, "hour", "earthquake");
})
app.get('/eq', (req, res) => {
  renderEQ(req, res, "day", "earthquakes");
})
app.get('/fire', (req, res) => {
  renderFire(req, res);
})
app.get('/aqi', (req, res) => {
  renderAqi(req, res);
})
app.get('/about', (req, res) => {
  renderStatic(req, res, 'about', 'About this site', 'about');
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


poll.polling();
