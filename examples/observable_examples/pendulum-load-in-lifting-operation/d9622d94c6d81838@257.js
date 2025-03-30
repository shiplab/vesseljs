function _e1(md){return(
md`# Pendulum Load in Lifting Operation`
)}

function _2(md){return(
md`Ship motion amplitude is modelled with [closed-form expressions](https://www.sciencedirect.com/science/article/abs/pii/S0029801803001082) and then converted to a sinusoidal time series. The pendulum is solved in real-time with the equations of motion.

For simplification, the ship is assumed to be in beam waves with neglectable pitch motion. This confines the pendulum motion to a transversal plane. An [other example](https://shiplab.github.io/vesseljs/examples/Ship_with_aframe_in_regular_ocean.html) models the pendulum in 3D.`
)}

function* _e2(width,THREE,scene,ship,invalidation,ship3D,states,wavCre,loadGroup,zDiff,zLever,yLever,pend)
{
  const height = 400;
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(50, aspect);
  camera.up.set(0, 0, 1);
  scene.add(camera);
  const LOA = ship.structure.hull.attributes.LOA;
  camera.position.set(0.3 * LOA, 0.7 * LOA, 0.7 * LOA);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 0, 0);
  controls.update();
  invalidation.then(() => renderer.dispose());
  renderer.setSize(width, height);
  renderer.setPixelRatio(devicePixelRatio);

  const clock = new THREE.Clock();
  var tprev = 0;

  var animate = function() {
    var time = clock.getElapsedTime();
    var dt = time - tprev;

    ship3D.heave =
      states.discrete.WaveMotion.state.heaveAmp *
      Math.cos(wavCre.waveDef.waveFreq * time);
    ship3D.roll =
      -states.discrete.WaveMotion.state.rollAmp *
      Math.cos(wavCre.waveDef.waveFreq * time);

    states.continuous.motion.heave = ship3D.heave;
    states.continuous.motion.roll = ship3D.roll;
    states.continuous.motion.pitch = 0;

    loadGroup.position.z =
      ship3D.heave +
      zDiff +
      zLever * Math.cos(ship3D.roll) +
      yLever * Math.sin(ship3D.roll);
    loadGroup.position.y =
      -zLever * Math.sin(ship3D.roll) + yLever * Math.cos(ship3D.roll);

    if (dt !== 0) {
      // solve the pendulum ODE:
      pend.movePendulum(tprev, dt);
    }

    var tprev = time;
    const rotAngles = new THREE.Euler(
      states.continuous.phi[0],
      states.continuous.phi[1],
      0,
      'XYZ'
    );
    loadGroup.setRotationFromEuler(rotAngles);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
  yield renderer.domElement;
}


function _4(html){return(
html`<p><b>Ship Heave and Roll (m and rad)</b></p>
		<div id="ship_xz" style="width:100%;height:200px"></div>

		<p><b>Frame Tip - Displacement From Original Position in Y and Z (m)</b></p>
		<div id="frame_tip_yz" style="width:100%;height:200px"></div>

		<p><b>Load angle from neutral position (rad)</b></p>
		<div id="load_phi" style="width:100%;height:200px"></div>`
)}

function _spec(d3){return(
d3.json("https://shiplab.github.io/vesseljs/examples/ship_specs/PX121.json")
)}

function _ship3D(Ship3D,ship,states){return(
new Ship3D(ship, {
		shipState: states,
		stlPath: "https://shiplab.github.io/vesseljs/examples/3D_models/STL/various",
		upperColor: 0x33aa33,
		lowerColor: 0xaa3333,
		hullOpacity: 1,
		deckOpacity: 1,
		objectOpacity: 1
	})
)}

function _ship(Vessel,spec){return(
new Vessel.Ship(spec)
)}

function _scene(THREE,ship3D,aFrame3D,loadGroup)
{
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xA9CCE3);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(1, 1, 1);
  scene.add(ambientLight, mainLight);
  
  ship3D.fluctCont.add(aFrame3D);
  scene.add(ship3D);
  scene.add(loadGroup);
  return scene;
}


function _pend(Pendulum,ship,aFrame,states,wavCre,xLever,yLever,zLever,L){return(
new Pendulum(ship, aFrame, states, wavCre, xLever, yLever, zLever, L)
)}

function _states(ship,Vessel,wavCre)
{
  const states = ship.designState.clone();
  
  // initiate the motion with fake values to allow solving of the pendulum equation
	states.continuous.motion = {};
	states.continuous.motion.heave = 1;
	states.continuous.motion.roll = 1;
	states.continuous.motion.pitch = 1;
  
  const wavMo = new Vessel.WaveMotion(ship, states, wavCre);
	wavMo.output.push("rollAmp");
	wavMo.writeOutput();
  
  return states;
}


function _wavCre(Vessel)
{
  const wavCre = new Vessel.WaveCreator();
	wavCre.setWaveDef(0.8, 1.75, 270);
  return wavCre;
}


function _deckHeight(){return(
12.9
)}

function _xLever(states)
{
  // x measured from the aft ship
	const xAS = 35;
	// x measured from the center of gravity
	const xLever = xAS - states.discrete.FloatingCondition.state.w.cg.x;
  return xLever;
}


function _yLever(states)
{
  // y measured from the centerline
	const yCL = 6.5;
	// y measured from the center of gravity
	const yLever = yCL - states.discrete.FloatingCondition.state.w.cg.y;
  return yLever;
}


function _initzf(deckHeight,states){return(
deckHeight - states.discrete.FloatingCondition.state.w.cg.z
)}

function _zLever(initzf,aFrame){return(
initzf + aFrame.height - 2 * aFrame.radiusVert
)}

function _zDiff(states){return(
states.discrete.FloatingCondition.state.w.cg.z - states.discrete.FloatingCondition.state.T
)}

function _L(){return(
4
)}

function _aFrame()
{
  const aFrame = {
    radiusVert: 0.5,
    radiusHor: 0.5,
    height: 8,
    span: 8
  }
  return aFrame
}


function _aFrame3D(AFrame3D,aFrame,THREE,xLever,yLever,initzf)
{
	const aFrame3D = new AFrame3D(aFrame);

	aFrame3D.applyMatrix(new THREE.Matrix4().makeTranslation(xLever, yLever, initzf));
	aFrame3D.rotation.z = Math.PI / 2;

	return aFrame3D;
}


function _loadGroup(THREE,deckHeight,aFrame,states,L,xLever,yLever)
{
  const loadGroup = new THREE.Group();

	const initzt = deckHeight + aFrame.height - states.discrete.FloatingCondition.state.T - 2 * aFrame.radiusVert;

	const geometryCab = new THREE.CylinderGeometry(0.05, 0.05, L, 32);
	const materialCab = new THREE.MeshBasicMaterial({color: "black"});
	const cable = new THREE.Mesh(geometryCab, materialCab);

	cable.rotation.x = Math.PI / 2;

	cable.position.z = - L / 2;

	loadGroup.add(cable);

	const geometryLoa = new THREE.BoxGeometry(2, 2, 2);
	const materialLoa = new THREE.MeshBasicMaterial({color: 0x00ff00});
	const load = new THREE.Mesh(geometryLoa, materialLoa);

	const initzl = deckHeight - L;

	load.position.z = - L;

	loadGroup.add(load);
	loadGroup.applyMatrix(new THREE.Matrix4().makeTranslation(xLever, yLever, initzt));

  return loadGroup;
}


function _22(numeric,deckHeight,L,states,wavCre,$,yLever,pend)
{
 	var tmax = 100;
	var t = numeric.linspace(0, tmax, 5000);
  var initzl = deckHeight - L;

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

	var ship_xz = [{data: numeric.transpose([t, heave]), label: "Heave"}, {data: numeric.transpose([t, roll]), label: "Roll"}];

	$.plot("#ship_xz", ship_xz,
		{xaxis: {tickFormatter: function(val, axis) {return val < axis.max ? val.toFixed(2) : "time (s)";}}});

	var yDisp = [];
	for (index = 0; index < t.length; index++) {
		yDisp.push(initzl * (roll[index] - roll[0]));
	}

	var zDisp = [];
	for (index = 0; index < t.length; index++) {
		zDisp.push(heave[index] - (yLever - states.discrete.FloatingCondition.state.w.cg.y) * roll[index] - (heave[0] - (yLever - states.discrete.FloatingCondition.state.w.cg.y) * roll[0]));
	}

	var frame_tip_yz = [{data: numeric.transpose([t, yDisp]), label: "yDisp"}, {data: numeric.transpose([t, zDisp]), label: "zDisp"}];

	$.plot("#frame_tip_yz", frame_tip_yz,
		{xaxis: {tickFormatter: function(val, axis) {return val < axis.max ? val.toFixed(2) : "time (s)";}}});

	var sol = numeric.dopri(0, tmax, [0, 0, 0, 0], pend.f); //max x, min x, init X

	var load_phi = numeric.rep([sol.x.length, 2], 0);

	for (var i = 0; i < sol.x.length; i++) {
		load_phi[i][0] = sol.x[i];
		load_phi[i][1] = sol.y[i][0];
	}

	$.plot("#load_phi", [load_phi],
		{xaxis: {tickFormatter: function(val, axis) {return val < axis.max ? val.toFixed(2) : "time (s)";}}});
}


function _23(md){return(
md`### Snippets`
)}

function _Ship3D(THREE,Vessel)
{//@EliasHasle

/*
Draft for new version. More modularized, and interacts with a ship state.
Uses an additional coordinate system for motions.
The position.xy and rotation.z of the Ship3D object plae the ship in the 3D world.
(Not geographically)
position.z is the (negative) draft.
fluctCont is a "fluctuations container" to be used for dynamically
changing motions like heave, pitch, roll.
cmContainer centers the motion on the center of gravity.
normalizer nulls out the center of gravity height before the draft is applied.


THREE.js Object3D constructed from Vessel.js Ship object.

There are some serious limitations to this:
1. null values encountered are assumed to be either at the top or bottom of the given station.
2. The end caps and bulkheads are sometimes corrected with zeros where they should perhaps have been clipped because of null values.

TODO: Use calculated draft for position.z, and place the ship model in a motion container centered at the calculated metacenter.
*/

//var hMat; //global for debugging

function Ship3D(ship, {shipState, stlPath, deckOpacity = 0.2, objectOpacity = 0.5}) {
	THREE.Group.call(this);

	this.normalizer = new THREE.Group();
	this.fluctCont = new THREE.Group();
	this.fluctCont.rotation.order = "ZYX"; //right?
	this.cmContainer = new THREE.Group();
	this.fluctCont.add(this.cmContainer);
	this.normalizer.add(this.fluctCont);
	this.add(this.normalizer);

	Object.defineProperty(this, "draft", {
		get: function() {
			return -this.position.z;
		}/*,
		set: function(value) {
			this.position.z = -value;
		}*/
	});
	Object.defineProperty(this, "surge", {
		get: function() {
			return this.fluctCont.position.x;
		},
		set: function(value) {
			this.fluctCont.position.x = value;
			//this.shipState.motion.surge = value;
		}
	});
	Object.defineProperty(this, "sway", {
		get: function() {
			return this.fluctCont.position.y;
		},
		set: function(value) {
			this.fluctCont.position.y = value;
			//this.shipState.motion.sway = value;
		}
	});
	Object.defineProperty(this, "heave", {
		get: function() {
			return this.fluctCont.position.z;
		},
		set: function(value) {
			this.fluctCont.position.z = value;
			//this.shipState.motion.heave = value;
		}
	});
	Object.defineProperty(this, "yaw", {
		get: function() {
			return this.fluctCont.rotation.z;
		},
		set: function(value) {
			this.fluctCont.rotation.z = value;
			//this.shipState.motion.yaw = value;
		}
	});
	Object.defineProperty(this, "pitch", {
		get: function() {
			return this.fluctCont.rotation.y;
		},
		set: function(value) {
			this.fluctCont.rotation.y = value;
			//this.shipState.motion.pitch = value;
		}
	});
	Object.defineProperty(this, "roll", {
		get: function() {
			return this.fluctCont.rotation.x;
		},
		set: function(value) {
			this.fluctCont.rotation.x = value;
			//this.shipState.motion.roll = value;
		}
	});

	this.objectOpacity = objectOpacity;

	this.ship = ship;
	this.shipState = shipState || ship.designState.clone();

	let hull = ship.structure.hull;

	let LOA = hull.attributes.LOA;
	let BOA = hull.attributes.BOA;
	let Depth = hull.attributes.Depth;

	//console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);
	let {w: {cg, mass}, T, GMt, GMl} = ship.calculateStability(this.shipState);

	this.cmContainer.position.set(-cg.x, -cg.y, -cg.z);
	this.normalizer.position.z = cg.z;
	this.position.z = -T;

	let designDraft = ship.designState.calculationParameters.Draft_design;
	this.hull3D = new Hull3D(hull, designDraft);
	this.cmContainer.add(this.hull3D);

	//DEBUG, to show only hull:
	//return;

	let stations = hull.halfBreadths.stations;
	//Decks:
	var decks = new THREE.Group();
	let deckMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: deckOpacity, side: THREE.DoubleSide});
	//deckGeom.translate(0,0,-0.5);
	let ds = ship.structure.decks;
	//let dk = Object.keys(ds);
	let stss = stations.map(st => LOA * st); //use scaled stations for now
	//console.log(dk);
	//for (let i = 0; i < dk.length; i++) {
	for (let dk in ds) {
		//let d = ds[dk[i]]; //deck in ship structure
		let d = ds[dk];

		//Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
		let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1);//new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
		//console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
		let zHigh = d.zFloor;
		let zLow = d.zFloor - d.thickness;
		let wlHigh = hull.getWaterline(zHigh);
		let wlLow = hull.getWaterline(zLow);
		let pos = deckGeom.getAttribute("position");
		let pa = pos.array;
		for (let j = 0; j < stss.length + 1; j++) {
			//This was totally wrong, and still would benefit from
			//not mapping directly to stations, as shorter decks will
			//Get zero-width sections
			let x = stss[j];//d.xAft+(j/stss.length)*(d.xFwd-d.xAft);
			if (isNaN(x)) x = stss[j-1];
			x = Math.max(d.xAft, Math.min(d.xFwd, x));
			let y1 = Vessel.f.linearFromArrays(stss, wlHigh, x);
			let y2 = Vessel.f.linearFromArrays(stss, wlLow, x);
			let y = Math.min(0.5 * d.breadth, y1, y2);
			pa[3 * j] = x;
			pa[3 * j + 1] = y;
			pa[3 * (stss.length + 1) + 3 * j] = x;
			pa[3 * (stss.length + 1) + 3 * j + 1] = -y; //test
		}
		pos.needsUpdate = true;

		//DEBUG
		//console.log("d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f", d.xFwd, d.xAft, 0.5*d.breadth);
		//console.log(pa);
		let mat = deckMat;
		if (d.style) {
			mat = new THREE.MeshPhongMaterial({color: typeof d.style.color !== "undefined" ? d.style.color : 0xcccccc, transparent: true, opacity: typeof d.style.opacity !== "undefined" ? d.style.opacity : deckOpacity, side: THREE.DoubleSide});
		}
		let deck = new THREE.Mesh(deckGeom, mat);
		deck.name = dk;//[i];
		deck.position.z = d.zFloor;
		//deck.scale.set(d.xFwd-d.xAft, d.breadth, d.thickness);
		//deck.position.set(0.5*(d.xFwd+d.xAft), 0, d.zFloor);
		decks.add(deck);
	}
	this.decks = decks;
	this.cmContainer.add(decks);

	//Bulkheads:
	var bulkheads = new THREE.Group();
	bulkheads.scale.set(1, 0.5 * BOA, Depth);
	//Should have individually trimmed geometries like the decks
	let bhGeom = new THREE.BoxBufferGeometry(1, 1, 1);
	bhGeom.translate(0, 0, 0.5);
	let bhMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: deckOpacity, side: THREE.DoubleSide});
	bhGeom.translate(0.5, 0, 0);
	let bhs = ship.structure.bulkheads;
	//let bhk = Object.keys(bhs);
	//for (let i = 0; i < bhk.length; i++) {
	for (let bhk in bhs) {
		let bh = bhs[bhk];//bhs[bhk[i]];
		let mat = bhMat;
		if (bh.style) {
			mat = new THREE.MeshPhongMaterial({color: typeof bh.style.color !== "undefined" ? bh.style.color : 0xcccccc, transparent: true, opacity: typeof bh.style.opacity !== "undefined" ? bh.style.opacity : deckOpacity, side: THREE.DoubleSide});
		}
		let bulkhead = new THREE.Mesh(bhGeom, mat);
		bulkhead.name = bhk;//[i];
		bulkhead.scale.set(bh.thickness, 1, 1);
		bulkhead.position.set(bh.xAft, 0, 0);
		bulkheads.add(bulkhead);
	}
	this.bulkheads = bulkheads;
	this.cmContainer.add(bulkheads);

	//Objects

	this.materials = {};
	this.stlPath = stlPath;
	let stlManager = new THREE.LoadingManager();
	this.stlLoader = new THREE.STLLoader(stlManager);
	/*stlManager.onLoad = function() {
		createGUI(materials, deckMat);
	}*/

	this.blocks = new THREE.Group();
	this.cmContainer.add(this.blocks);

	//Default placeholder geometry
	this.boxGeom = new THREE.BoxBufferGeometry(1, 1, 1);
	this.boxGeom.translate(0, 0, 0.5);

	let objects = Object.values(ship.derivedObjects);
	for (let i = 0; i < objects.length; i++) {
		this.addObject(objects[i]);
	}

	//console.log("Reached end of Ship3D constructor.");
}
Ship3D.prototype = Object.create(THREE.Group.prototype);
Object.assign(Ship3D.prototype, {
	constructor: Ship3D,
	addObject: function(object) {
		let mat;
		if (typeof object.style.color !== "undefined" || typeof object.style.opacity !== "undefined") {
			let color = typeof object.style.color !== "undefined" ? object.style.color : this.randomColor();
			let opacity = typeof object.style.opacity !== "undefined" ? object.style.opacity : this.objectOpacity;
			mat = new THREE.MeshPhongMaterial({color, transparent: true, opacity});
		} else {
			let name = this.stripName(object.id);
			if (this.materials[name] !== undefined) {
				mat = this.materials[name];
			} else {
				mat = new THREE.MeshPhongMaterial({color: this.randomColor(), transparent: true, opacity: this.objectOpacity});
				this.materials[name] = mat;
			}
		}

		let bo = object.baseObject;

		//Position
		let s = this.ship.designState.getObjectState(object);
		let x = s.xCentre;
		let y = s.yCentre;
		let z = s.zBase;

		//Small position jitter to avoid z-fighting
		let n = 0.01*(2*Math.random()-1);
		x += n;
		y += n;
		z += n;

		//Scale
		let d = bo.boxDimensions;

		if (bo.file3D) {
			let self = this;
			this.stlLoader.load(
				this.stlPath + "/" + bo.file3D,
				function onLoad(geometry) {
					//Normalize:
					geometry.computeBoundingBox();
					let b = geometry.boundingBox;
					geometry.translate(-b.min.x, -b.min.y, -b.min.z);
					geometry.scale(1 / (b.max.x - b.min.x),
						1 / (b.max.y - b.min.y),
						1 / (b.max.z - b.min.z));
					//Align with the same coordinate system as placeholder blocks:
					geometry.translate(-0.5, -0.5, 0);
					let m = new THREE.Mesh(geometry, mat);
					m.position.set(x, y, z);
					m.scale.set(d.length, d.breadth, d.height);
					m.name = object.id;
					self.blocks.add(m);
				},
				undefined,
				function onError() {
					console.warn("Error loading STL file " + bo.file3D + ". Falling back on placeholder.");
					let m = new THREE.Mesh(this.boxGeom, mat);
					m.position.set(x, y, z);
					m.scale.set(d.length, d.breadth, d.height);
					m.name = object.id;
					this.blocks.add(m);
				}
			);
		} else {
			//Placeholder:
			let m = new THREE.Mesh(this.boxGeom, mat);
			m.position.set(x, y, z);
			m.scale.set(d.length, d.breadth, d.height);
			m.name = object.id;
			this.blocks.add(m);
		}
	},
	//this function is used as a temporary hack to group similar objects by color
	stripName: function(s) {
		s = s.replace(/[0-9]/g, "");
		s = s.trim();
		return s;
	},
	randomColor: function() {
		let r = Math.round(Math.random() * 0xff);
		let g = Math.round(Math.random() * 0xff);
		let b = Math.round(Math.random() * 0xff);
		return ((r << 16) | (g << 8) | b);
	}
});

//Class to contain the geometry of a hull side.
//(Should perhaps be replaced by a HullGeometry class, but then
//it cannot be a simple subclass of PlaneBufferGeometry.)
//After instantiation, stations, waterlines and table can be modified or replaced,
//but the data dimensions NxM must remain the same.
function HullSideGeometry(stations, waterlines, table) {
	this.stations = stations;
	this.waterlines = waterlines;
	this.table = table;
	this.N = stations.length;
	this.M = waterlines.length;
	//Hull side, in principle Y offsets on an XZ plane:
	//Even though a plane geometry is usually defined in terms of Z offsets on an XY plane, the order of the coordinates for each vertex is not so important. What is important is to get the topology right. This is ensured by working with the right order of the vertices.
	THREE.PlaneBufferGeometry.call(this, undefined, undefined, this.N - 1, this.M - 1);

	this.update();
}

HullSideGeometry.prototype = Object.create(THREE.PlaneBufferGeometry.prototype);
Object.assign(HullSideGeometry.prototype, {
	update: function() {
		let pos = this.getAttribute("position");
		let pa = pos.array;

		const N = this.N;
		const M = this.M;

		//loop1:
		//zs
		let c = 0;
		//Iterate over waterlines
		for (let j = 0; j < M; j++) {
			//loop2:
			//xs
			//iterate over stations
			for (let i = 0; i < N; i++) {
				//if (table[j][i] === null) continue;// loop1;
				pa[c] = this.stations[i]; //x
				//DEBUG, OK. No attempts to read outside of table
				/*if(typeof table[j] === "undefined") console.error("table[%d] is undefined", j);
				else if (typeof table[j][i] === "undefined") console.error("table[%d][%d] is undefined", j, i);*/
				//y
				pa[c + 1] = this.table[j][i]; //y
				pa[c + 2] = this.waterlines[j]; //z
				c += 3;
			}
		}
		//console.error("c-pa.length = %d", c-pa.length); //OK, sets all cells

		//Get rid of nulls by merging their points with the closest non-null point in the same station:
		/*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
		let uv = this.getAttribute("uv");
		let uva = uv.array;
		//Iterate over stations
		for (let i = 0; i < N; i++) {
			let firstNumberJ;
			let lastNumberJ;
			//Iterate over waterlines
			let j;
			for (j = 0; j < M; j++) {
				let y = this.table[j][i];
				//If this condition is satisfied (number found),
				//the loop will be quitted
				//after the extra logic below:
				if (y !== null) {
					firstNumberJ = j;
					lastNumberJ = j;
					//copy vector for i,j to positions for all null cells below:
					let c = firstNumberJ * N + i;
					let x = pa[3 * c];
					let y = pa[3 * c + 1];
					let z = pa[3 * c + 2];
					let d = c;
					while (firstNumberJ > 0) {
						firstNumberJ--;
						d -= N;
						pa[3 * d] = x;
						pa[3 * d + 1] = y;
						pa[3 * d + 2] = z;
						uva[2 * d] = uva[2 * c];
						uva[2 * d + 1] = uva[2 * c + 1];
					}
					break;
				}
				//console.log("null encountered.");
			}

			//Continue up the hull (with same j counter), searching for upper number. This does not account for the existence of numbers above the first null encountered.
			for (; j < M; j++) {
				let y = this.table[j][i];
				if (y === null) {
					//console.log("null encountered.");
					break;
				}
				//else not null:
				lastNumberJ = j;
			}

			//copy vector for i,j to positions for all null cells above:
			let c = lastNumberJ * N + i;
			let x = pa[3 * c];
			let y = pa[3 * c + 1];
			let z = pa[3 * c + 2];
			let d = c;
			while (lastNumberJ < M - 1) {
				lastNumberJ++;
				d += N;
				pa[3 * d] = x;
				pa[3 * d + 1] = y;
				pa[3 * d + 2] = z;
				uva[2 * d] = uva[2 * c];
				uva[2 * d + 1] = uva[2 * c + 1];
			}
			//////////
		}

		//console.log(pa);

		pos.needsUpdate = true;
		uv.needsUpdate = true;
		this.computeVertexNormals();
	}
});

function Hull3D(hull, design_draft) {
	THREE.Group.call(this);

	this.hull = hull;
	this.design_draft = design_draft !== undefined ? design_draft : 0.5 * hull.attributes.Depth;
	this.upperColor = typeof hull.style.upperColor !== "undefined" ? hull.style.upperColor : 0x33aa33;
	this.lowerColor = typeof hull.style.lowerColor !== "undefined" ? hull.style.lowerColor : 0xaa3333;
	this.opacity = typeof hull.style.opacity !== "undefined" ? hull.style.opacity : 0.5;

	this.update();
}
Hull3D.prototype = Object.create(THREE.Group.prototype);

Object.assign(Hull3D.prototype, {
	//Experimental addition. Broken.
	addStation: function(p) {
		const hb = this.hull.halfBreadths;
		const {index, mu} = Vessel.f.bisectionSearch(hb.stations, p);
		hb.stations.splice(index, 0, p);
		for (let i = 0; i < hb.waterlines.length; i++) {
			hb.table[i].splice(index, 0, 0);
		}

		this.update();
	},
	//Experimental addition
	addWaterline: function(p) {
		const hb = this.hull.halfBreadths;
		const {index, mu} = Vessel.f.bisectionSearch(hb.waterlines, p);
		hb.waterlines.splice(index, 0, p);
		hb.table.splice(index, 0, new Array(hb.stations.length).fill(0));

		this.update();
	},
	//or updateGeometries?
	update: function() {
		const hull = this.hull;
		const upperColor = this.upperColor;
		const lowerColor = this.lowerColor;
		const design_draft = this.design_draft;
		const opacity = this.opacity;

		let LOA = hull.attributes.LOA;
		let BOA = hull.attributes.BOA;
		let Depth = hull.attributes.Depth;

		//None of these are changed during correction of the geometry.
		let stations = hull.halfBreadths.stations;
		let waterlines = hull.halfBreadths.waterlines;
		let table = hull.halfBreadths.table;

		if (this.hGeom) this.hGeom.dispose();
		this.hGeom = new HullSideGeometry(stations, waterlines, table);

		let N = stations.length;
		let M = waterlines.length;

		//Bow cap:
		let bowPlaneOffsets = hull.getStation(LOA).map(str => str / (0.5 * BOA)); //normalized
		if (this.bowCapG) this.bowCapG.dispose();
		this.bowCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
		let pos = this.bowCapG.getAttribute("position");
		let pa = pos.array;
		//constant x-offset yz plane
		for (let j = 0; j < M; j++) {
			pa[3 * (2 * j)] = 1;
			pa[3 * (2 * j) + 1] = bowPlaneOffsets[j];
			pa[3 * (2 * j) + 2] = waterlines[j];
			pa[3 * (2 * j + 1)] = 1;
			pa[3 * (2 * j + 1) + 1] = -bowPlaneOffsets[j];
			pa[3 * (2 * j + 1) + 2] = waterlines[j];
		}
		pos.needsUpdate = true;

		//Aft cap:
		let aftPlaneOffsets = hull.getStation(0).map(str => str / (0.5 * BOA)); //normalized
		if (this.aftCapG) this.aftCapG.dispose();
		this.aftCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
		pos = this.aftCapG.getAttribute("position");
		pa = pos.array;
		//constant x-offset yz plane
		for (let j = 0; j < M; j++) {
			pa[3 * (2 * j)] = 0;
			pa[3 * (2 * j) + 1] = -aftPlaneOffsets[j];
			pa[3 * (2 * j) + 2] = waterlines[j];
			pa[3 * (2 * j + 1)] = 0;
			pa[3 * (2 * j + 1) + 1] = aftPlaneOffsets[j];
			pa[3 * (2 * j + 1) + 2] = waterlines[j];
		}
		pos.needsUpdate = true;

		//Bottom cap:
		let bottomPlaneOffsets = hull.getWaterline(0).map(hw => hw / (0.5 * BOA)); //normalized
		if (this.bottomCapG) this.bottomCapG.dispose();
		this.bottomCapG = new THREE.PlaneBufferGeometry(undefined, undefined, N - 1, 1);
		pos = this.bottomCapG.getAttribute("position");
		pa = pos.array;
		//constant z-offset xy plane
		for (let i = 0; i < N; i++) {
			pa[3 * (i)] = stations[i];
			pa[3 * (i) + 1] = -bottomPlaneOffsets[i];
			pa[3 * (i) + 2] = 0;
			pa[3 * (N + i)] = stations[i];
			pa[3 * (N + i) + 1] = bottomPlaneOffsets[i];
			pa[3 * (N + i) + 2] = 0;
		}
		pos.needsUpdate = true;

		//Hull material
		if (!this.hMat) {
			let phong = THREE.ShaderLib.phong;
			let commonDecl = "uniform float wlThreshold;uniform vec3 aboveWL; uniform vec3 belowWL;\nvarying float vZ;";
			this.hMat = new THREE.ShaderMaterial({
				uniforms: THREE.UniformsUtils.merge([phong.uniforms, {
					wlThreshold: new THREE.Uniform(0.5),
					aboveWL: new THREE.Uniform(new THREE.Color()),
					belowWL: new THREE.Uniform(new THREE.Color())
				}]),
				vertexShader: commonDecl + phong.vertexShader.replace("main() {", "main() {\nvZ = position.z;").replace("#define PHONG", ""),
				fragmentShader: commonDecl + phong.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );",
					"vec4 diffuseColor = vec4( (vZ>wlThreshold)? aboveWL.rgb : belowWL.rgb, opacity );").replace("#define PHONG", ""),
				side: THREE.DoubleSide,
				lights: true,
				transparent: true
			});
		}
		this.hMat.uniforms.wlThreshold.value = this.design_draft / Depth;
		this.hMat.uniforms.aboveWL.value = new THREE.Color(upperColor);
		this.hMat.uniforms.belowWL.value = new THREE.Color(lowerColor);
		this.hMat.uniforms.opacity.value = opacity;

		if (this.port) this.remove(this.port);
		this.port = new THREE.Mesh(this.hGeom, this.hMat);
		if (this.starboard) this.remove(this.starboard);
		this.starboard = new THREE.Mesh(this.hGeom, this.hMat);
		this.starboard.scale.y = -1;
		this.add(this.port, this.starboard);

		//Caps:
		if (this.bowCap) this.remove(this.bowCap);
		this.bowCap = new THREE.Mesh(this.bowCapG, this.hMat)
		if (this.aftCap) this.remove(this.aftCap);
		this.aftCap = new THREE.Mesh(this.aftCapG, this.hMat)
		if (this.bottomCap) this.remove(this.bottomCap);
		this.bottomCap = new THREE.Mesh(this.bottomCapG, this.hMat)

		this.add(this.bowCap, this.aftCap, this.bottomCap);

		this.scale.set(LOA, 0.5 * BOA, Depth);
	}
});
  
  return Ship3D;
}


function _AFrame3D(THREE)
{function AFrame3D(aFrame) {
	THREE.Group.call(this);

	this.aFrame = aFrame;

	var frameGroup = new THREE.Group();

	var geometry1 = new THREE.CylinderGeometry(aFrame.radiusVert, aFrame.radiusVert, aFrame.height, 32);
	var material = new THREE.MeshBasicMaterial({color: 0xffff00});
	var cylinder1 = new THREE.Mesh(geometry1, material);

	cylinder1.position.y = aFrame.span / 2;
	cylinder1.position.z = aFrame.height / 2;
	cylinder1.rotation.x = Math.PI / 2;

	frameGroup.add(cylinder1);

	var cylinder2 = new THREE.Mesh(geometry1, material);

	cylinder2.position.y = -aFrame.span / 2;
	cylinder2.position.z = aFrame.height / 2;
	cylinder2.rotation.x = Math.PI / 2;

	frameGroup.add(cylinder2);

	var geoSpan = aFrame.span - 2 * aFrame.radiusVert;
	var geometry2 = new THREE.CylinderGeometry(aFrame.radiusHor, aFrame.radiusHor, geoSpan, 32);
	var cylinder3 = new THREE.Mesh(geometry2, material);

	cylinder3.position.z = aFrame.height - aFrame.radiusHor;

	frameGroup.add(cylinder3);

	this.add(frameGroup);
}

AFrame3D.prototype = Object.create(THREE.Group.prototype);
 
 return AFrame3D;
}


function _Pendulum(numeric){return(
function Pendulum(ship, aFrame, states, wavCre, xLever, yLever, zLever, cableLength, g = 9.81, phiInit = [0, 0, 0, 0]) {
	this.ship = ship;
	this.aFrame = aFrame;
	this.states = states;
	this.wavCre = wavCre;

	this.states.continuous.phi = phiInit;

	this.f = function(t, phi) {
		let xRotAcc = - Math.sign(states.continuous.motion.roll) * states.discrete.WaveMotion.state.rollAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);
		let yRotAcc = - Math.sign(states.continuous.motion.pitch) * states.discrete.WaveMotion.state.pitchAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);
		let zTransAcc = - states.discrete.WaveMotion.state.heaveAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);

		let xdotdot = zLever * yRotAcc;
		let ydotdot = - zLever * xRotAcc;
		let zdotdot = zTransAcc + yLever * xRotAcc - xLever * yRotAcc;

		let phixdotdot = 1 / (cableLength * Math.cos(phi[1])) * (-g * Math.sin(phi[0]) + 2 * cableLength * phi[2] * phi[3] * Math.sin(phi[1]) - ydotdot * Math.cos(phi[0]) - zdotdot * Math.sin(phi[0]));
		let phiydotdot = 1 / cableLength * (-g * Math.sin(phi[1]) * Math.cos(phi[0]) - 0.5 * cableLength * phi[0] ** 2 * Math.sin(2 * phi[1]) + xdotdot * Math.cos(phi[1]) + ydotdot * Math.sin(phi[0]) * Math.sin(phi[1]) - zdotdot * Math.sin(phi[1]) * Math.cos(phi[0]));

		return [phi[2], phi[3], phixdotdot, phiydotdot];
	};

	this.movePendulum = function(tprev, dt) {
		this.states.continuous.phi = numeric.dopri(tprev, tprev + dt, this.states.continuous.phi, this.f).at(tprev + dt);
	};
}
)}

function _27(md){return(
md`### Libraries`
)}

function _Vessel(require){return(
require('ntnu-vessel@0.1.1/vessel.js').catch(() => window["Vessel"])
)}

async function _THREE(require)
{
  const THREE = window.THREE = await require("three@0.99.0/build/three.min.js");
  await require("three@0.99.0/examples/js/controls/OrbitControls.js").catch(() => {});
  await require("three@0.99.0/examples/js/loaders/STLLoader.js").catch(() => {});
  return THREE;
}


function _d3(require){return(
require("d3@5")
)}

function _numeric(require){return(
require("numeric@1.2.6/numeric-1.2.6.js").catch(() => window["numeric"])
)}

async function _$(require)
{
  const $ = window.$ = await require('jquery@1.11.1/dist/jquery.js').catch(() => window["$"]);
  await require("flot@4.1.1/dist/es5/jquery.flot.js").catch(() => window["_typeof"]);
  return $;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("e1")).define("e1", ["md"], _e1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("e2")).define("e2", ["width","THREE","scene","ship","invalidation","ship3D","states","wavCre","loadGroup","zDiff","zLever","yLever","pend"], _e2);
  main.variable(observer()).define(["html"], _4);
  main.variable(observer("spec")).define("spec", ["d3"], _spec);
  main.variable(observer("ship3D")).define("ship3D", ["Ship3D","ship","states"], _ship3D);
  main.variable(observer("ship")).define("ship", ["Vessel","spec"], _ship);
  main.variable(observer("scene")).define("scene", ["THREE","ship3D","aFrame3D","loadGroup"], _scene);
  main.variable(observer("pend")).define("pend", ["Pendulum","ship","aFrame","states","wavCre","xLever","yLever","zLever","L"], _pend);
  main.variable(observer("states")).define("states", ["ship","Vessel","wavCre"], _states);
  main.variable(observer("wavCre")).define("wavCre", ["Vessel"], _wavCre);
  main.variable(observer("deckHeight")).define("deckHeight", _deckHeight);
  main.variable(observer("xLever")).define("xLever", ["states"], _xLever);
  main.variable(observer("yLever")).define("yLever", ["states"], _yLever);
  main.variable(observer("initzf")).define("initzf", ["deckHeight","states"], _initzf);
  main.variable(observer("zLever")).define("zLever", ["initzf","aFrame"], _zLever);
  main.variable(observer("zDiff")).define("zDiff", ["states"], _zDiff);
  main.variable(observer("L")).define("L", _L);
  main.variable(observer("aFrame")).define("aFrame", _aFrame);
  main.variable(observer("aFrame3D")).define("aFrame3D", ["AFrame3D","aFrame","THREE","xLever","yLever","initzf"], _aFrame3D);
  main.variable(observer("loadGroup")).define("loadGroup", ["THREE","deckHeight","aFrame","states","L","xLever","yLever"], _loadGroup);
  main.variable(observer()).define(["numeric","deckHeight","L","states","wavCre","$","yLever","pend"], _22);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer("Ship3D")).define("Ship3D", ["THREE","Vessel"], _Ship3D);
  main.variable(observer("AFrame3D")).define("AFrame3D", ["THREE"], _AFrame3D);
  main.variable(observer("Pendulum")).define("Pendulum", ["numeric"], _Pendulum);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("numeric")).define("numeric", ["require"], _numeric);
  main.variable(observer("$")).define("$", ["require"], _$);
  return main;
}
