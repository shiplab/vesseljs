"use strict";

var filePath;

// define  path of the file in the server
filePath = "specs/ship_specifications/PX121.json"

Vessel.loadShip(filePath, function(ship) {
	// ship loaded in the local scope
	console.log(ship);
});
