//@EliasHasle

//Depends on Ship and the other core classes.

/*
Handy function for loading a ship design from file.

Typical usage:
var myShip;
var filePath = "ships/myShip.json";
Vessel.loadShip(filePath, function(ship) {
	myShip = ship;
	doSomething();
});

*/

function loadShip(url, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.addEventListener("load", function(event) {
		var response = event.target.response;
		var specification = JSON.parse(response);
		var ship = new Ship(specification);
		callback(ship);
	});
	request.send(null);
}