process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect; 
const gmaps = require('../../components/gmaps');

describe('gmaps', function() {

  const userLocation = {lat:49.190077, lng:-123.103008};
  it('getNearbyLocations() should return the expected nearest location coordinates out of the 2 input coordinates', function() {
    const locations = [{
      lat: 49.192821,
      lng: -123.100860
    }, {
      lat: 49.190745,
      lng: -123.104072
    }];

    const expectedResult = [{
      lat: 49.190745,
      lng: -123.104072,
      distance: 0.10721958690849226
    }];
    
    expect(gmaps.getNearbyLocations(userLocation.lat, userLocation.lng, distance = 100, limit = 1, locations))
    .to.deep.equal(expectedResult);
  });

  it('getNearbyLocations() should return the expected 2 nearest location coordinates out of the 4 input coordinates inorder', function() {
    const locations = [{
      lat: 49.192821,
      lng: -123.100860
    }, {
      lat: 49.190745,
      lng: -123.104072
    }, {
      lat: 49.195341,
      lng: -123.129779
    }, {
      lat: 49.208458,
      lng: -122.970961
    }];

    const expectedResult = [{
      lat: 49.190745,
      lng: -123.104072,
      distance: 0.10721958690849226
    }, {
      lat: 49.192821,
      lng: -123.10086,
      distance: 0.3427306876297884
    }];
    
    console.log();
    expect(gmaps.getNearbyLocations(userLocation.lat, userLocation.lng, distance = 100, limit = 2, locations))
    .to.deep.equal(expectedResult);
  });
});