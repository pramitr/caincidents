let toDegreesMinutesAndSeconds = (coordinate) => {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + "°" + minutes + "\\\'" + seconds + "\\\"";
}

let latlongToDMS = (lat, long) => {
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = Math.sign(lat) >= 0 ? "N" : "S";

    var longitude = toDegreesMinutesAndSeconds(long);
    var longitudeCardinal = Math.sign(long) >= 0 ? "E" : "W";

    let location = latitude + latitudeCardinal + " " + longitude + longitudeCardinal;
    let formattedText = "<a href=\"https://www.google.com/maps/place/"+ latitude + latitudeCardinal + "+" + longitude + longitudeCardinal + "\">" + location + "</a>";
    console.log("Location: ",formattedText);
    return formattedText;

}


module.exports = latlongToDMS;