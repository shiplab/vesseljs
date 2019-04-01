/*jshint esversion: 6 */
"use strict";
var renderer, scene, camera, controls, ship3D, shipspec, shipVis, readShipSpec, ship, states, readScatDiag, useScatDiag, scatReq, saveInputs,
	usePropSpec, readPropSpecs, propellers, readPowSpecs, usePowSpec, powerPlants, Hs, Tz, waveOccur, keyResults, simulate, stateHistory;

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

// preload scatter diagram
scatReq = new XMLHttpRequest();
scatReq.open("GET", "snippets/North Sea - Area 11 - Annual.sea", true);
scatReq.addEventListener("load", function(event) {
	useScatDiag(event.target.response, "North Sea - Area 11 - Annual.sea");
});
scatReq.send(null);

readScatDiag = function(event) {
	var file = event.target.files[0];
	var name = file.name;
	document.getElementById("scatdiaglist").innerHTML = name;
	var reader = new FileReader();

	reader.onload = function(event) {
		useScatDiag(event.target.result, name);
	};
	reader.readAsText(file);
};

waveOccur = [];
useScatDiag = function(scatString, name) {
	document.getElementById("scatdiaglist").innerHTML = "North Sea - Area 11 - Annual.sea";
	var lines = scatString.split("\n");
	Hs = lines[2].split(" ").filter(i => i).map(Number);
	Tz = lines[3].split(" ").filter(i => i).map(Number);
	for (var i = 4; i < lines.length - 2; i++) {
		waveOccur[i - 4] = lines[i].split(" ").filter(i => i).map(Number);
	}
};

// set design space range
var ratioMin = 0.9;
var ratioMax = 1.1;
for (prop in scaleDimensions) {
	document.getElementById(scaleDimensions[prop].ratio).setAttribute("min", ratioMin);
	document.getElementById(scaleDimensions[prop].ratio).setAttribute("max", ratioMax);
}

var stepDimension = 0.01; // scaling ratio loop step

var initSpeed = 13; // preferred traveling speed
var accThres = 2; // m/s², vertical acceleration threshold
var auxPower = 600000; // set auxiliary/hotel power, which will be taken as constant
var cgPosition = 70; // distace from point of motion evaluation relative to LOA in percentage. 100% is bow, 0% is stern

document.getElementById("initSpeed").setAttribute("value", initSpeed.toFixed(2));
document.getElementById("accThres").setAttribute("value", accThres.toFixed(2));
document.getElementById("auxPower").setAttribute("value", auxPower);
document.getElementById("cgPosition").setAttribute("value", cgPosition);

saveInputs = function() {
	initSpeed = Number(document.getElementById("initSpeed").value);
	accThres = Number(document.getElementById("accThres").value);
	auxPower = Number(document.getElementById("auxPower").value);
	cgPosition = Number(document.getElementById("cgPosition").value);
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

					// create object to store result history
					var waveHistory = [];
					stateHistory = [];

					// sum elements of two dimensional array
					var totalSeaStates = waveOccur.map(x => x.reduce((num1, num2) => num1 + num2)).reduce((num1, num2) => num1 + num2);
					var seaStateSpan = 365 * 24 / totalSeaStates; // average duration of a sea state in hours
					var consumedFuel = 0;
					var travelDist = 0;

					for (var i = 0; i < Hs.length; i++) {
						waveHistory[i] = [];
						stateHistory[i] = [];
						for (var j = 0; j < Tz.length; j++) {
							if (waveOccur[i][j] > 0) {
								stateHistory[i][j] = {};

								var time = 0;

								// calculate initial conditions
								stateHistory[i][j][time] = {};

								var speed = initSpeed;

								// create wave state object
								var wavStat = new Vessel.WaveCreator();
								wavStat.setWaveDef(2 * Math.PI / Tz[j], Hs[i] / 2, 180);
								waveHistory[i][j] = wavStat.waveDef;

								var wavMo = new Vessel.WaveMotion(ship, states, wavStat, cgPosition);
								wavMo.setSpeed(speed);
								wavMo.writeOutput();

								var hullRes = new Vessel.HullResistance(ship, states, wagProp, wavStat);
								hullRes.writeOutput();

								var propInt = new Vessel.PropellerInteraction(ship, states, wagProp);
								propInt.writeOutput();

								var fuelCons = new Vessel.FuelConsumption(ship, states, powSys);
								fuelCons.setAuxPower(auxPower);
								fuelCons.writeOutput();

								assignStates(stateHistory[i][j][time], states.discrete);

								var timeStep = 1; // the timestep is not relevant for this simulation, it will only be used to discover the attainable speed
								while (stateHistory[i][j][time].WaveMotion.state.verticalAcc > accThres) { // find attainable ship speed for current sea state
									// advance time step
									time += timeStep;

									// copy results from previous time step.
									// Object.assign() is preferred because simply equating both stateHistory objects would make a reference between objects
									stateHistory[i][j][time] = {};
									assignStates(stateHistory[i][j][time], stateHistory[i][j][time - timeStep]);

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

										assignStates(stateHistory[i][j][time], states.discrete);
									}
								}

								consumedFuel += waveOccur[i][j] * seaStateSpan * states.discrete.FuelConsumption.state.consumptionRate * 3.6;
								travelDist += waveOccur[i][j] * seaStateSpan * states.discrete.Speed.state.speed; // in nm
							}
						}
					}

					var avgSpeed = travelDist / (365 * 24);
					var vesselRes = {
						"length (m)": ship.structure.hull.attributes.LOA,
						"beam (m)": ship.structure.hull.attributes.BOA,
						"depth (m)": ship.structure.hull.attributes.Depth,
						"consumed fuel (ton)": consumedFuel,
						"average speed (knots)": avgSpeed
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
	for (let prop in obj2) {
		obj1[prop] = {};
		obj1[prop].thisStateVer = obj2[prop].thisStateVer;
		obj1[prop].state = {};
		Object.assign(obj1[prop].state, obj2[prop].state);
	}
}
