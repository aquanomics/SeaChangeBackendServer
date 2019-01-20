// GOOGLE MAPS FUNCTIONS
// ===============================================

const gMapsClient = require('@google/maps').createClient({
    // Key from Capstone28SeaChange@gmail.com',
    key: 'AIzaSyApEDBGybllN5dS2Q_8t81AQIImuBdRxIY',
    Promise: Promise
});

module.exports.getGeoCode = function getGeoCode(location, onSuccess, onError) {
    gMapsClient.geocode({ address: location })
        .asPromise()
        .then(response => {
            onSuccess(response.json.results);
        })
        .catch(error => {
            onError(error);
        });
};

module.exports.getNearbyLocations = function getNearbyLocations(latitude, longitude, distance, limit, locations) {
    var lat = latitude;
    var long = longitude;
    const R = 6371; // Radius of earth in km
    var nearbyLocations = [];
    var result = [];
    for(i=0; i  < locations.length; i++) {
        var mlat = locations[i].lat;
        var mlong = locations[i].long;
        if(mlat == null || mlong == null) continue;
        var dLat  = toRadians(mlat - lat);
        var dLong = toRadians(mlong - long);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat)) * Math.cos(toRadians(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        if(d <= distance) {
            locations[i].distance = d;
            nearbyLocations.push(locations[i]);
        }
    }

    nearbyLocations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    var boundary = (limit > nearbyLocations.length) ?  nearbyLocations.length : limit;

    for(i=0; i  < boundary; i++) result.push(nearbyLocations[i]);
 
    return result;
};

function toRadians(x) {return x*Math.PI/180;};








