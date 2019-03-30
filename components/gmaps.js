// GOOGLE MAPS FUNCTIONS
// ===============================================

const connection_settings = require('../config');
const gMapsClient = require('@google/maps').createClient(connection_settings.gmapsKey);

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
    let lat = latitude;
    let long = longitude;
    const R = 6371; // Radius of earth in km
    let nearbyLocations = [];
    let result = [];
    for(i=0; i  < locations.length; i++) {
        let mlat = null; 
        let mlong = null; 
        if (locations[i].lat == undefined || locations[i].lng == undefined) {
            mlat = locations[i].latitude;
            mlong = locations[i].longitude;
        } else {
            mlat = locations[i].lat;
            mlong = locations[i].lng;
        }
        
        if(mlat == null || mlong == null) continue;

        let dLat  = toRadians(mlat - lat);
        let dLong = toRadians(mlong - long);
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat)) * Math.cos(toRadians(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c;

        if(d <= distance) {
            locations[i].distance = d;
            nearbyLocations.push(locations[i]);
        }
    }

    nearbyLocations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    let boundary = (limit > nearbyLocations.length) ?  nearbyLocations.length : limit;

    for(i=0; i  < boundary; i++) result.push(nearbyLocations[i]);
 
    return result;
};

function toRadians(x) {return x*Math.PI/180;};








