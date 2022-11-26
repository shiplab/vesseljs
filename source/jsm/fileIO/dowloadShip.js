//@EliasHasle

//Very simple download of the specification of a given ship design. Depends on a working getSpecification method.

export function downloadShip( ship ) {

	let specification = ship.getSpecification();
	let output = JSON.stringify( specification );
	let link = document.createElement( "a" );
	link.href = "data:application/json," + encodeURIComponent( output );
	link.download = "shipdesignspecification.json";
	link.target = "_blank";
	link.click();

}
