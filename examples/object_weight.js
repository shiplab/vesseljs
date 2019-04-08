"use strict";

var objectTemplate, myObject, state, weightUns, weightFix, weightMap;

var objectTemplate = new Vessel.BaseObject();

objectTemplate.id = "First Object";
objectTemplate.boxDimensions = {
	"length": 10,
	"breadth": 4,
	"height": 2
};
objectTemplate.weightInformation = {
	"contentDensity": 1025,
	"volumeCapacity": 70,
	"lightweight": 5000
};
objectTemplate.baseState = {
	"fullness": 1
};

myObject = new Vessel.DerivedObject();

myObject.id = "Tank1";
myObject.baseObject = objectTemplate;
myObject.referenceState = {
	"xCentre": 0,
	"yCentre": 0,
	"zBase": 0
};
myObject.affiliations = {};

state = new Vessel.ShipState();
weightUns = myObject.getWeight(state);

document.getElementById("unspecified").innerHTML = JSON.stringify(weightUns, null, 4);

objectTemplate.weightInformation = {
	"contentDensity": 1025,
	"volumeCapacity": 70,
	"lightweight": 5000,
	"cg": [0, 0, 1.45]
};
weightFix = myObject.getWeight(state);

document.getElementById("fixed").innerHTML = JSON.stringify(weightFix, null, 4);

objectTemplate.weightInformation = {
	"contentDensity": 1025,
	"volumeCapacity": 70,
	"lightweight": 5000,
	"fullnessCGMapping": {
		"fullnesses": [0, 0.25, 0.5, 0.75, 1],
		"cgs": [
			[0, 0, 1.00],
			[0, 0, 0.41],
			[0, 0, 0.56],
			[0, 0, 0.77],
			[0, 0, 1.00]
		]
	}
};

weightMap = myObject.getWeight(state);
document.getElementById("mapped1").innerHTML = JSON.stringify(weightMap, null, 4);

objectTemplate.baseState = {"fullness": 0.7};
state.version = 2;

weightMap = myObject.getWeight(state);
document.getElementById("mapped2").innerHTML = JSON.stringify(weightMap, null, 4);
