"use strict";
var renderer, scene, camera, controls, ship3D, aFrame3D, shipspec, readShipSpec, ship, states, 
wavMo, tprev, wavCre, initzt, initzf, initx, inity, load, L, pend, cable, loadGroup, zLever,
zDiff, yLever, yDiff;

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

readShipSpec = function(event){
	var file = event.target.files[0];
	var reader = new FileReader();

	reader.onload = function(event) {
		var contents = event.target.result;
		useShipSpec(contents);
	};
	reader.readAsText(file);
};

// load default spec
new THREE.FileLoader().load("data/ship_specifications/PX121.json", useShipSpec);

// load ship specification
function useShipSpec(contents) {
	shipspec = JSON.parse(contents);
	ship = new Vessel.Ship(shipspec);

	states = ship.designState.clone();

	wavCre = new Vessel.WaveCreator();
	wavCre.setWaveDef(0.8, 1.75, 270);

	var wavMo = new Vessel.WaveMotion(ship, states, wavCre);
	wavMo.output.push("rollAmp");
	wavMo.writeOutput();

	if (typeof ship3D !== "undefined") {
		scene.remove(ship3D);
	}
	ship3D = new Ship3D(ship, {
		shipState: states,
		stlPath: "data/STL files",
		upperColor: 0x33aa33,
		lowerColor: 0xaa3333,
		hullOpacity: 1,
		deckOpacity: 1,
		objectOpacity: 1
	});

	let LOA = ship.structure.hull.attributes.LOA;
	camera.position.set(0.35*LOA, 0.7*LOA, 0.7*LOA);
	controls.target = new THREE.Vector3(0,0,0);

	var aFrame = {
		radiusVert: 0.5,
		radiusHor: 0.5,
		height: 8,
		span: 8
	};

	aFrame3D = new AFrame3D(aFrame);

	var deckHeight = 12.9;

	// x measured from the aft ship
	var xAS = 35;
	// x measured from the center of gravity
	var initx = xAS - states.discrete.FloatingCondition.state.w.cg.x;
	var xLever = initx;

	// y measured from the centerline
	var yCL = 6.5;
	// y measured from the center of gravity
	inity = yCL - states.discrete.FloatingCondition.state.w.cg.y;
	yLever = inity;

	initzf = deckHeight - states.discrete.FloatingCondition.state.w.cg.z;
	zLever = deckHeight + aFrame.height - states.discrete.FloatingCondition.state.w.cg.z - 2*aFrame.radiusVert;
	zDiff = states.discrete.FloatingCondition.state.w.cg.z - states.discrete.FloatingCondition.state.T;

	aFrame3D.applyMatrix(new THREE.Matrix4().makeTranslation(initx, inity, initzf));
	aFrame3D.rotation.z = Math.PI/2;

	ship3D.fluctCont.add(aFrame3D);
	scene.add(ship3D);

	tprev = 0;

	L = 4; // cable length

	pend = new Pendulum(ship, aFrame, states, wavCre, xLever, yLever, zLever, L);

	loadGroup = new THREE.Group();

	initzt = deckHeight + aFrame.height - states.discrete.FloatingCondition.state.T - 2*aFrame.radiusVert;

	var geometry = new THREE.CylinderGeometry(0.05, 0.05, L, 32);
	var material = new THREE.MeshBasicMaterial({color: "black"});
	cable = new THREE.Mesh(geometry, material);

	cable.rotation.x = Math.PI/2;

	cable.position.z = - L/2;

	loadGroup.add(cable);

	var geometry = new THREE.BoxGeometry(2, 2, 2);
	var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	load = new THREE.Mesh(geometry, material);

	var initzl = deckHeight - L;

	load.position.z = - L;

	loadGroup.add(load);
	loadGroup.applyMatrix(new THREE.Matrix4().makeTranslation(initx, inity, initzt));

	scene.add(loadGroup);

	// initiate the motion with fake values to allow solving of the pendulum equation
	states.continuous.motion = {};

	states.continuous.motion.heave = 1;
	states.continuous.motion.roll = 1;
	states.continuous.motion.pitch = 1;

	var tmax = 100;
	var t = numeric.linspace(0,tmax,5000);

	var heave = [];
	var heaveCoeff = states.discrete.WaveMotion.state.heaveAmp;
	for (var index = 0; index < t.length; index++) {
		heave.push(heaveCoeff * Math.cos(wavCre.waveDef.waveFreq * t[index]));
	}

	var roll = [];
	var rollCoeff = states.discrete.WaveMotion.state.rollAmp;
	for (index = 0; index < t.length; index++) {
		roll.push(rollCoeff * Math.cos(wavCre.waveDef.waveFreq * t[index]));
	}

	var ship_xz = [{data: numeric.transpose([t,heave]), label:"Heave"}, {data: numeric.transpose([t,roll]), label:"Roll"}];

	$.plot("#ship_xz", ship_xz,
	{xaxis: {tickFormatter: function(val, axis) { return val < axis.max ? val.toFixed(2) : "time (s)";}}});

	var yDisp = [];
	for (index = 0; index < t.length; index++) {
		yDisp.push(initzl * (roll[index] - roll[0]));
	}

	var zDisp = [];
	for (index = 0; index < t.length; index++) {
		zDisp.push(heave[index] - (inity - states.discrete.FloatingCondition.state.w.cg.y) * roll[index] - (heave[0] - (inity - states.discrete.FloatingCondition.state.w.cg.y) * roll[0]));
	}

	var frame_tip_yz = [{data: numeric.transpose([t,yDisp]), label:"yDisp"}, {data: numeric.transpose([t,zDisp]), label:"zDisp"}];

	$.plot("#frame_tip_yz", frame_tip_yz,
	{xaxis: {tickFormatter: function(val, axis) { return val < axis.max ? val.toFixed(2) : "time (s)";}}});

	var sol = numeric.dopri(0,tmax,[0,0,0,0],pend.f); //max x, min x, init X

	var load_phi = numeric.rep([sol.x.length,2],0);

	for(var i = 0;i < sol.x.length;i++){
		load_phi[i][0] = sol.x[i];
		load_phi[i][1] = sol.y[i][0];
	}

	$.plot("#load_phi", [load_phi],
	{xaxis: {tickFormatter: function(val, axis) { return val < axis.max ? val.toFixed(2) : "time (s)";}}});

	controls.update();
	animate();
}

function animate() {
	var time = clock.getElapsedTime();
	var dt = time - tprev;

	ship3D.heave = states.discrete.WaveMotion.state.heaveAmp * Math.cos(wavCre.waveDef.waveFreq * time);
	ship3D.roll = - states.discrete.WaveMotion.state.rollAmp * Math.cos(wavCre.waveDef.waveFreq * time);

	states.continuous.motion.heave = ship3D.heave;
	states.continuous.motion.roll = ship3D.roll;
	states.continuous.motion.pitch = 0;

	loadGroup.position.z = ship3D.heave + zDiff + zLever * Math.cos(ship3D.roll) + yLever * Math.sin(ship3D.roll);
	loadGroup.position.y = - zLever * Math.sin(ship3D.roll) + yLever * Math.cos(ship3D.roll);

	if (dt !== 0){
		// solve the pendulum ODE:
		pend.movePendulum(tprev, dt);
	}

	tprev = time;

	var rotAngles = new THREE.Euler(states.continuous.phi[0], states.continuous.phi[1], 0, 'XYZ');
	loadGroup.setRotationFromEuler(rotAngles);

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

var clock = new THREE.Clock();
