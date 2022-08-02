let is_wee_hour = () => {
  var date = new Date();
  var current_hour = date.getHours(); // get current hour from 24 hours format in GMT
  if(current_hour >= 7 && current_hour < 18) return true; //11pm PDT to 10am PDT
  return false;
}

/* Returns true if PDT time is between 10AM PDT and 5PM */
let is_day_time = () => {
  var date = new Date();
  var current_hour = date.getHours(); // get current hour from 24 hours format in GMT
  if(( current_hour >= 18 && current_hour <= 23) || (current_hour <= 1)) {
    return true;
  }
  return false;
}

module.exports = { is_wee_hour, is_day_time };
