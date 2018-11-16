const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
//const querystring = require('querystring');


var poll = require('./components/poll.js');
var renderEQ = require('./modules/renderEarthquake.js');
var renderFire = require('./modules/renderFire.js');

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


poll.polling();
