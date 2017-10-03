//@EliasHasle

//Depends on Vessel and the other core classes.

/*
Handy function for loading a ship design from file.

Typical usage:
var myVessel;
var filePath = "vessels/myVessel.json";
loadVessel(filePath, function(vessel) {
	myVessel = vessel;
	doSomething();
});

*/

function loadVessel(url, callback) {
	var request = new XMLHttpRequest();
	request.open( 'GET', url, true );
	request.addEventListener("load", function(event) {
		var response = event.target.response;
		var specification = JSON.parse(response);
		var vessel = new Vessel(specification);
		callback(vessel);
	});
	request.send(null);
}