"use strict";

var filePath, parameters, state, stability;

// define  path of the file in the server
filePath = "specs/ship_specifications/PX121.json";

Vessel.loadShip(filePath, function(ship) {
	// ship loaded in the local scope
	parameters = JSON.stringify(ship.designState.calculationParameters, null, 4);
	document.getElementById("parameters").innerHTML = parameters;

	// create a state object to store the data
	state = new Vessel.ShipState();
	stability = ship.calculateStability(state);

	document.getElementById("stability").innerHTML = JSON.stringify(stability, null, 4);
});
