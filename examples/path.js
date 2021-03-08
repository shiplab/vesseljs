/*jshint esversion: 6 */
"use strict";
var renderer, scene, camera, controls, ship3D, readShipSpec, shipspec, shipVis, ship, states, readPropSpecs, propellers,
	usePropSpec, readPropSpecs, readPowSpecs, usePowSpec, powerPlants, saveInputs, keyResults, simulate, stateHistory;

//Ready renderer and scene
(function() {
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0xA9CCE3, 1);

	// get the div that will hold the renderer
	var container = document.getElementById('3d');
	// add the renderer to the div
	container.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	//Camera and controls:
	camera = new THREE.PerspectiveCamera(50);
	camera.up.set(0, 0, 1);
	scene.add(camera);
	controls = new THREE.OrbitControls(camera, renderer.domElement);

	//Respond to window resize:
	function onResize() {
		renderer.setSize(container.clientWidth, container.clientHeight);
		camera.aspect = container.clientWidth / container.clientHeight;
		camera.updateProjectionMatrix();
	}
	window.addEventListener("resize", onResize);
	onResize(); //Ensure the initial setup is good too

	//Add lights:
	scene.add(new THREE.AmbientLight(0xffffff, 0.3));
	scene.add(function() {
		let sun = new THREE.DirectionalLight(0xffffff, 1);
		sun.position.set(1, 1, 1);
		return sun;
	}());
})();

readShipSpec = function(event) {
	var file = event.target.files[0];
	var reader = new FileReader();

	reader.onload = function(event) {
		var contents = event.target.result;
		useShipSpec(contents);
	};
	reader.readAsText(file);
};

// load default spec
new THREE.FileLoader().load("specs/ship_specifications/PX121.json", useShipSpec);

function useShipSpec(contents) {
	shipspec = JSON.parse(contents);
	shipVis = new Vessel.Ship(shipspec);
	if (typeof ship3D !== "undefined") {
		scene.remove(ship3D);
	}
	ship3D = new Ship3D(shipVis, "specs/STL files");
	scene.add(ship3D);

	document.getElementById("length").innerHTML = (shipVis.structure.hull.attributes.LOA).toFixed(2);
	document.getElementById("beam").innerHTML = (shipVis.structure.hull.attributes.BOA).toFixed(2);
	document.getElementById("depth").innerHTML = (shipVis.structure.hull.attributes.Depth).toFixed(2);

	let LOA = shipVis.structure.hull.attributes.LOA;
	camera.position.set(0.7 * LOA, 0.7 * LOA, 0.7 * LOA);
	controls.target = new THREE.Vector3(LOA / 2, 0, 0);
	controls.update();
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

// collection of tags to access relevant document and ship properties
var scaleDimensions = {
	"length": {
		coord: "x",
		ship: "LOA",
		fix: "fixLength",
		ratio: "lengthRatio"
	},
	"beam": {
		coord: "y",
		ship: "BOA",
		fix: "fixBeam",
		ratio: "beamRatio"
	},
	"depth": {
		coord: "z",
		ship: "Depth",
		fix: "fixDepth",
		ratio: "depthRatio"
	}
};

var prop, ratio3;
function fixDimension(dim) {
	// lock slider
	document.getElementById(scaleDimensions[dim].ratio).disabled = !document.getElementById(scaleDimensions[dim].ratio).disabled;
	ratio3 = document.getElementById(scaleDimensions[dim].ratio).value;

	// deactivate other checkboxes
	for (prop in scaleDimensions) {
		if (prop !== dim) {
			document.getElementById(scaleDimensions[prop].fix).disabled = !document.getElementById(scaleDimensions[prop].fix).disabled;
		}
	}
}

function scaleDim(dim) {
	var ratio1 = document.getElementById(scaleDimensions[dim].ratio).value; // this is the scaling ratio set by the user
	var ratio2; // this is the scaling ratio for the other non-fixed dimension(s)
	if (document.getElementById(scaleDimensions[dim].fix).disabled) { // if an other dimension is already fixed
		ratio2 = 1 / (ratio1 * ratio3);
		for (prop in scaleDimensions) {
			if (document.getElementById(scaleDimensions[prop].fix).disabled) { // if dimension is not fixed
				if (prop !== dim) { // if this is not the dimension set by user
					document.getElementById(scaleDimensions[prop].ratio).value = ratio2;
					ship3D.scale[scaleDimensions[prop].coord] = ratio2;
					document.getElementById(prop).innerHTML = (ratio2 * shipVis.structure.hull.attributes[scaleDimensions[prop].ship]).toFixed(2);
				} else {
					ship3D.scale[scaleDimensions[prop].coord] = ratio1;
					document.getElementById(prop).innerHTML = (ratio1 * shipVis.structure.hull.attributes[scaleDimensions[prop].ship]).toFixed(2);
				}
			}
		}
	} else {
		ratio2 = 1 / Math.sqrt(ratio1);
		for (prop in scaleDimensions) {
			if (prop !== dim) {
				document.getElementById(scaleDimensions[prop].ratio).value = ratio2;
				ship3D.scale[scaleDimensions[prop].coord] = ratio2;
				document.getElementById(prop).innerHTML = (ratio2 * shipVis.structure.hull.attributes[scaleDimensions[prop].ship]).toFixed(2);
			} else {
				ship3D.scale[scaleDimensions[prop].coord] = ratio1;
				document.getElementById(prop).innerHTML = (ratio1 * shipVis.structure.hull.attributes[scaleDimensions[prop].ship]).toFixed(2);
			}
		}
	}
}

// object and functions to handle propeller specifications
propellers = {};

// preload propeller specification
var propReq = new XMLHttpRequest();
propReq.open("GET", "specs/propeller_specifications/wag_4b_0.55a_1.2p.json", true);
propReq.addEventListener("load", function(event) {
	var response = event.target.response;
	var propeller = JSON.parse(response);
	usePropSpec(propeller, "wag_4b_0.55a_1.2p.json");
});
propReq.send(null);

readPropSpecs = function(event) {
	function setupReader(file) {
		var name = file.name;
		var reader = new FileReader();

		reader.onload = function(event) {
			var propeller = JSON.parse(event.target.result);
			usePropSpec(propeller, name);
		};
		reader.readAsText(file);
	}

	for (var i = 0; i < event.target.files.length; i++) {
		setupReader(event.target.files[i]);
	}
};

usePropSpec = function(propeller, name) {
	propellers[name.substring(0, name.length - 5)] = propeller;

	// append file name to ship spec list
	var node = document.createElement("LI");
	var textnode = document.createTextNode(name);
	node.appendChild(textnode);
	document.getElementById("propspeclist").appendChild(node);
};

// object and functions to handle engine specifications
powerPlants = {};

// preload propeller specification
var powReq = new XMLHttpRequest();
powReq.open("GET", "specs/power_plant_specifications/powerPlant1.json", true);
powReq.addEventListener("load", function(event) {
	var response = event.target.response;
	var powerPlant = JSON.parse(response);
	usePowSpec(powerPlant, "powerPlant1.json");
});
powReq.send(null);

readPowSpecs = function(event) {
	function setupReader(file) {
		var name = file.name;
		var reader = new FileReader();

		reader.onload = function(event) {
			var powerPlant = JSON.parse(event.target.result);
			usePowSpec(powerPlant, name);
		};
		reader.readAsText(file);
	}

	for (var i = 0; i < event.target.files.length; i++) {
		setupReader(event.target.files[i]);
	}
};

usePowSpec = function(powerPlant, name) {
	powerPlants[name.substring(0, name.length - 5)] = powerPlant;

	// append file name to ship spec list
	var node = document.createElement("LI");
	var textnode = document.createTextNode(name);
	node.appendChild(textnode);
	document.getElementById("powspeclist").appendChild(node);
};

// set design space range
var ratioMin = 0.9;
var ratioMax = 1.1;
for (prop in scaleDimensions) {
	document.getElementById(scaleDimensions[prop].ratio).setAttribute("min", ratioMin);
	document.getElementById(scaleDimensions[prop].ratio).setAttribute("max", ratioMax);
}

var stepDimension = 0.05; // scaling ratio loop step

var initSpeed = 11; // preferred traveling speed
var accThres = 2; // m/s², vertical acceleration threshold
var cgPosition = 50; // distace from point of motion evaluation relative to LOA in percentage. 100% is bow, 0% is stern
var path = [[0, 0], [10, 10], [0, 0]]; // cartesian path coordinates, no earth curvature supported by now
var auxPower = 600000; // set auxiliary/hotel power, which will be taken as constant

document.getElementById("initSpeed").setAttribute("value", initSpeed.toFixed(2));
document.getElementById("accThres").setAttribute("value", accThres.toFixed(2));
document.getElementById("path").setAttribute("value", JSON.stringify(path));
document.getElementById("auxPower").setAttribute("value", auxPower);
document.getElementById("cgPosition").setAttribute("value", cgPosition);

// set time step for different simulation components, seconds
var timeStep = 1;
var fuelRatio = 60;
var timeStepFuel = fuelRatio * timeStep;
var waveRatio = 3600;
var timeStepWave = waveRatio * timeStep;
var draftRatio = 7200;
var timeStepDraft = draftRatio * timeStep;

document.getElementById("timeStep").setAttribute("value", timeStep);
document.getElementById("timeStepWave").setAttribute("value", waveRatio);
document.getElementById("timeStepFuel").setAttribute("value", fuelRatio);
document.getElementById("timeStepDraft").setAttribute("value", draftRatio);

saveInputs = function() {
	initSpeed = Number(document.getElementById("initSpeed").value);
	accThres = Number(document.getElementById("accThres").value);
	cgPosition = Number(document.getElementById("cgPosition").value);
	path = JSON.parse(document.getElementById("path").value);
	auxPower = Number(document.getElementById("auxPower").value);
	timeStep = Number(document.getElementById("timeStep").value);
	timeStepWave = Number(document.getElementById("timeStepWave").value) * timeStep;
	timeStepFuel = Number(document.getElementById("timeStepFuel").value) * timeStep;
	timeStepDraft = Number(document.getElementById("timeStepDraft").value) * timeStep;
};

simulate = function() {
	keyResults = [];
	var noPropellers = Object.keys(propellers).length;
	var noPowerPlants = Object.keys(powerPlants).length;
	for (var ratioB = ratioMin; ratioB <= ratioMax; ratioB += stepDimension) {
		for (var ratioL = ratioMin; ratioL <= ratioMax; ratioL += stepDimension) {
			var ratioD = 1 / (ratioL * ratioB);
			ship = new Vessel.Ship(scaleShipSpec(shipspec, ratioL, ratioB, ratioD));
			states = new Vessel.ShipState(ship.designState.getSpecification());

			// fill fuel tank and assign a corresponding initial state
			for (var prop in ship.derivedObjects) {
				if (ship.derivedObjects[prop].affiliations.group === "fuel tanks") {
					states.objectCache[prop] = {
						thisStateVer: 1,
						state: {}
					};

					Object.assign(states.objectCache[prop].state, ship.derivedObjects[prop].baseObject.baseState);
					Object.assign(states.objectCache[prop].state, ship.derivedObjects[prop].referenceState);

					states.objectCache[prop].state.fullness = 1;
				}
			}

			// verify if vessel is suitable for Holtrop model
			var draftIni = ship.calculateDraft();
			var holRes = ship.structure.hull.calculateAttributesAtDraft(draftIni);
			if ((holRes.LWL / holRes.BWL <= 3.9) || (holRes.LWL / holRes.BWL >= 15)) {
				console.error("The L/B relation is not being respected. It should be 3.9 < L/B < 15, not" + " " + (holRes.LWL / holRes.BWL).toFixed(2) + ".");
				continue;
			}
			if ((holRes.BWL / draftIni <= 2.1) || (holRes.BWL / draftIni >= 4)) {
				console.error("The B/T relation is not being respected. It should be 2.1 < B/T < 4, not" + " " + (holRes.BWL / draftIni).toFixed(2) + ".");
				continue;
			}
			if ((holRes.Cp <= 0.55) || (holRes.Cp >= 0.85)) {
				console.error("The prismatic coefficient is not being respected. It should be 0.55 < Cp < 0.85, not" + " " + holRes.Cp.toFixed(2) + ".");
				continue;
			}

			for (var propProp in propellers) {
				var wagProp = propellers[propProp];

				for (var powProp in Object.keys(powerPlants)) {
					var powSys = powerPlants[Object.keys(powerPlants)[powProp]];

					var time = 0;

					// create object to store result history
					var waveHistory = {};
					stateHistory = {};

					// calculate initial conditions
					stateHistory[time] = {};
					stateHistory[time].ship = {};

					var speed = initSpeed;

					// collect external variables
					var wavCre = new Vessel.WaveCreator();
					wavCre.setTime(time);
					var prevWavStat;

					waveHistory[time] = {};
					Object.assign(waveHistory[time], wavCre.waveDef);

					var pos = new Vessel.Positioning(ship, states, path);

					var wavMo = new Vessel.WaveMotion(ship, states, wavCre);
					wavMo.setSpeed(speed);
					wavMo.writeOutput();

					stateHistory[time].objects = {};
					var {totalMass: initMass, tankStates: tankStates} = ship.getFuelMass(states);
					for (prop in tankStates) {
						stateHistory[time].objects[prop] = {};
						Object.assign(stateHistory[time].objects[prop], tankStates[prop]);
					}
					var subMass;

					var hullRes = new Vessel.HullResistance(ship, states, wagProp, wavCre);
					hullRes.writeOutput();
					debugger

					var propInt = new Vessel.PropellerInteraction(ship, states, wagProp);
					propInt.writeOutput();

					var fuelCons = new Vessel.FuelConsumption(ship, states, powSys);
					fuelCons.setAuxPower(auxPower);
					fuelCons.writeOutput();

					assignStates(stateHistory[time].ship, states);

					while (stateHistory[time].ship.continuous.Positioning.travelDist < pos.routeData.totalDist) {
						// advance time step
						time += timeStep;
						prevWavStat = wavCre.version;

						// copy results from previous time step.
						// Object.assign() is preferred because simply equating both stateHistory objects would make a reference between objects
						waveHistory[time] = {};

						Object.assign(waveHistory[time], waveHistory[time - timeStep]);

						stateHistory[time] = {};
						stateHistory[time].ship = {};
						stateHistory[time].objects = {};

						assignStates(stateHistory[time].ship, stateHistory[time - timeStep].ship);
						for (let prop in stateHistory[time - timeStep].objects) {
							stateHistory[time].objects[prop] = {};
							Object.assign(stateHistory[time].objects[prop], stateHistory[time - timeStep].objects[prop]);
						}

						if (Number.isInteger(time / timeStepFuel)) {
							// subtract fuel amount consumed since last fuel tank time step
							subMass = 0;
							for (var i = time - timeStepFuel; i < time; i += timeStep) {
								subMass += timeStep * stateHistory[i].ship.discrete.FuelConsumption.state.consumptionRate;
							}

							// discount consumed fuel mass from tanks
							ship.subtractFuelMass(subMass, states);
							tankStates = ship.getFuelMass(states).tankStates;

							// update states
							for (prop in tankStates) {
								stateHistory[time].objects[prop] = {};
								Object.assign(stateHistory[time].objects[prop], tankStates[prop]);
							}
							// if last fuel tank is empty, break simulation
							if (stateHistory[time].objects[prop].fullness === 0) {
								break;
							}
						}
						if (Number.isInteger(time / timeStepDraft)) {
							hullRes.setDraft();

							wavMo.writeOutput();
							hullRes.writeOutput();
							propInt.writeOutput();
							fuelCons.writeOutput();

							assignStates(stateHistory[time].ship, states);
						}
						if (Number.isInteger(time / timeStepWave)) {
							wavCre.setTime(time);

							wavMo.writeOutput();
							hullRes.writeOutput();
							propInt.writeOutput();
							fuelCons.writeOutput();

							Object.assign(waveHistory[time], wavCre.waveDef);
							assignStates(stateHistory[time].ship, states);
						}
						// compare vertical acceleration to a threshold
						if (states.discrete.WaveMotion.state.verticalAcc > accThres) {
							// reduce speed in 10%
							console.log("Decreasing speed from " + (states.discrete.Speed.state.speed).toFixed(2) + " knots at time " + time + " s because vertical acceleration is " + (states.discrete.WaveMotion.state.verticalAcc).toFixed(2) + " m/s².");

							speed = 0.9 * states.discrete.Speed.state.speed;
							wavMo.setSpeed(speed);
							wavMo.writeOutput();

							console.log("Decreased speed to " + (states.discrete.Speed.state.speed).toFixed(2) + " knots. Vertical acceleration is now " + (states.discrete.WaveMotion.state.verticalAcc).toFixed(2) + " m/s².");

							// calculate fuel consumption for following time step
							hullRes.writeOutput();
							propInt.writeOutput();
							fuelCons.writeOutput();

							assignStates(stateHistory[time].ship, states);
						}
						// if wave state changed and vessel was slowed down, but it wasn't just now
						if (prevWavStat !== wavCre.version && stateHistory[time].ship.discrete.Speed.state.speed === stateHistory[time - timeStep].ship.discrete.Speed.state.speed && stateHistory[time - timeStep].ship.discrete.Speed.state.speed !== initSpeed) {
							speed = initSpeed; // try to go back to initial/default sailing speed
							wavMo.setSpeed(speed);
							// calculate and update states
							wavMo.writeOutput();

							console.log("Increasing speed back to " + initSpeed + " knots at time " + time + " s, because wave state changed.");

							// calculate fuel consumption for following time step
							hullRes.writeOutput();
							propInt.writeOutput();
							fuelCons.writeOutput();

							assignStates(stateHistory[time].ship, states);
						}
						// advance vessel on course
						pos.advanceShip(timeStep);
						// if leg/heading changes, recalculate motion response
						if (states.discrete.Leg.state.leg !== stateHistory[time].ship.discrete.Leg.state.leg) {
							wavMo.writeOutput();
						}
						assignStates(stateHistory[time].ship, states);
					}

					var finalMass = ship.getFuelMass(states).totalMass;
					var consumedFuel = (initMass - finalMass) / 1000;

					var vesselRes = {
						"length (m)": ship.structure.hull.attributes.LOA,
						"beam (m)": ship.structure.hull.attributes.BOA,
						"depth (m)": ship.structure.hull.attributes.Depth,
						"consumed fuel (ton)": consumedFuel,
						"average speed (knots)": 3600 * states.continuous.Positioning.travelDist / time
					};

					if (noPropellers > 1) {
						vesselRes["number of blades"] = wagProp.noBlades;
						vesselRes["blade area ratio"] = wagProp.AeAo;
					}

					if (noPowerPlants > 1) {
						vesselRes["power plant index"] = Number(powProp) + 1;
					}

					keyResults.push(vesselRes);

					// // download simulation results as JSON file
					// var blob = new Blob([JSON.stringify(stateHistory, null, 2)], {type : 'application/json'});
					// var link = document.createElement("a");
					// link.href =  window.URL.createObjectURL(blob);
					// link.download = "stateHistory_" + propShip + "_" + propProp + ".json";
					// link.click();
				}
			}
		}
	}
	// plot results with d3 parallel coordinates and Pareto frontier scatter plot
	parallelCoordinates(keyResults);
	sort(keyResults, "consumed fuel (ton)");
	computePareto(keyResults, "average speed (knots)", "consumed fuel (ton)");
	scatterPlot(keyResults, "average speed (knots)", "consumed fuel (ton)");
};

function assignStates(obj1, obj2) {
	obj1.continuous = {};
	for (let prop in obj2.continuous) {
		obj1.continuous[prop] = {};
		Object.assign(obj1.continuous[prop], obj2.continuous[prop]);
	}
	obj1.discrete = {};
	for (let prop in obj2.discrete) {
		obj1.discrete[prop] = {};
		obj1.discrete[prop].thisStateVer = obj2.discrete[prop].thisStateVer;
		obj1.discrete[prop].state = {};
		Object.assign(obj1.discrete[prop].state, obj2.discrete[prop].state);
	}
}
