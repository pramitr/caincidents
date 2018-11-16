let latlongToDMS = (lat, long) => {
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = Math.sign(lat) >= 0 ? "N" : "S";

    var longitude = toDegreesMinutesAndSeconds(long);
    var longitudeCardinal = Math.sign(long) >= 0 ? "E" : "W";

    return latitude + " " + latitudeCardinal + " " + longitude + " " + longitudeCardinal;
}

module.exports = latlongToDMS;