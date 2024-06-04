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
import { Ship } from "../ship/Ship.js";

function loadShip( url, callback ) {

	// Use the common function for loading data via XMLHttpRequest
	loadXMLHttpRequest( url, function ( specification ) {

		let ship = new Ship( specification );
		callback( ship );

	} );

}


function loadXMLHttpRequest( url, callback, asyncMethod = true ) {

	let request = new XMLHttpRequest();
	request.open( "GET", url, asyncMethod );
	request.addEventListener( "load", function ( event ) {

		if ( request.status === 200 ) {

			let response = event.target.response;
			var specification = JSON.parse( response );
			callback( specification );

		} else {

			console.error( "Error loading data from: " + url );

		}

	} );
	request.send( null );

}

export { loadShip, loadXMLHttpRequest };
