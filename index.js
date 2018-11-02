const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express()
// var router = express.Router()

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/ceq', (req, res) => {
  invokeCheck(req);
}) 
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

var invokeCheck = (req) => {
  var requestLoop = setInterval(function(){
    request({
      url: "http://www.google.com",
      method: "GET",
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
    },function(error, response, body){
      if(!error && response.statusCode == 200){
          console.log('sucess!');
      }else{
          console.log('error' + response.statusCode);
      }
    });
  }, 60000);  
}
