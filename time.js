let current_hour = () => {
  var date = new Date();
  var current_hour = date.getHours();
  console.log("HOURS ======= ",current_hour);
}

module.exports = current_hour;
