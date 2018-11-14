let is_wee_hour = () => {
  var date = new Date();
  var current_hour = date.getHours();
  if(current_hour >= 6 && current_hour < 18) return true;
  return false;
}

module.exports = is_wee_hour;
