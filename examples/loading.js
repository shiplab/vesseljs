"use strict";
var renderer, scene, camera, controls, ship3D, shipspec, saveInputs, barge, states, stateHistory, simulate;

//Ready renderer and scene
(function (){
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
	camera.up.set(0,0,1);
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
	scene.add(new THREE.AmbientLight(0xffffff,0.3));
	scene.add(function() {
		let sun = new THREE.DirectionalLight(0xffffff,1);
		sun.position.set(1,1,1);
		return sun;
	}());
})();

// load default spec
new THREE.FileLoader().load("data/ship_specifications/barge.json", useShipSpec);

function useShipSpec(contents) {
	shipspec = JSON.parse(contents);
	barge = new Vessel.Ship(shipspec);
	if (typeof ship3D !== "undefined") {
		scene.remove(ship3D);
	}
	ship3D = new Ship3D(barge, "data/STL files");
	scene.add(ship3D);
	
	let LOA = barge.structure.hull.attributes.LOA;
	camera.position.set(0.7*LOA, 0.7*LOA, 0.7*LOA);
	controls.target = new THREE.Vector3(LOA/2,0,0);
	controls.update();
	animate();
}

function animate() {
	requestAnimationFrame(animate);			
	renderer.render(scene, camera);
}

var flow = 0.2;
var freq = 0.1;

document.getElementById("flow").setAttribute("value", flow);
document.getElementById("freq").setAttribute("value", freq);

saveInputs = function() {
	flow = Number(document.getElementById("flow").value);
	freq = Number(document.getElementById("freq").value);
};

simulate = function() {
	// create object to store result history
	stateHistory = [];
	var keyResults = [];

	states = new Vessel.ShipState(barge.designState.getSpecification());

	var time = 0;
	var timeStep = 1/freq;
	var fillRatio = flow * timeStep/barge.baseObjects.cargo.weightInformation.volumeCapacity;

	var statMod = new Vessel.StateModule(barge, states);
	statMod.setDraft();

	stateHistory[time] = {};
	Object.assign(stateHistory[time], states.shipCache.state);

	res = {
		"time": time,
		"draft": states.shipCache.state.T,
		"gmt": states.shipCache.state.GMt,
		"fill": states.objectCache.Tank1.state.fullness,
		"kb": states.shipCache.state.KB
	};
	keyResults.push(res);

	var res;
	while (fillRatio < (1 - states.objectCache.Tank1.state.fullness) && fillRatio < (1 - states.objectCache.Tank2.state.fullness)) {
		states.objectCache.Tank1.state.fullness += fillRatio;
		states.objectCache.Tank2.state.fullness += fillRatio;

		statMod.setDraft();

		time += timeStep;

		stateHistory[time] = {};
		Object.assign(stateHistory[time], states.shipCache.state);

		res = {
			"time": time,
			"draft": states.shipCache.state.T,
			"gmt": states.shipCache.state.GMt,
			"fill": states.objectCache.Tank1.state.fullness,
			"kb": states.shipCache.state.KB
		};
		keyResults.push(res);
	}

	lineChart("lineChart1", keyResults, "fill", "Filling");

	lineChart("lineChart2", keyResults, "draft", "Draft (m)");

	lineChart("lineChart3", keyResults, "kb", "KB (m)");

	lineChart("lineChart4", keyResults, "gmt", "GMt (m)");
};
