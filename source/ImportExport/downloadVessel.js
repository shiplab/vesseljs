//@EliasHasle

//Very simple download of the specification of a given ship design. Depends on a working getSpecification method.

function downloadVessel(vessel) {
	let specification = vessel.getSpecification();
	let output = JSON.stringify(specification);
	let link = document.createElement("a");
	link.href = "data:application/json," + encodeURI(output);
	link.download = "shipdesignspecification.json";
	link.target = "_blank";
	link.click();
}