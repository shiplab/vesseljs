//@EliasHasle

/*Dependencies: THREE, Mirror, WaterShader, dat.gui (for gui only), browse_files_Elias_Hasle, Patch_interpolation, WaveCreator */
/*This is similar to the file Configurable_ocean.js, but simplified to a single regular wave */

"use strict";

var wavCre = new Vessel.WaveCreator();

var Wave = function() {
	var waveCount = 0;

	return function(waveType) {
		this.waveId = waveCount;
		waveCount++;

		this.waveType = waveType;
	}
}();
						//A, T, theta, phi
function DirectionalCosine(params) {
	params = params || {};
	let oceanconf = params.parentGUI;

	Wave.call(this, "Cosine");

	//amplitude
	if (typeof params.A !== "undefined") this.A = params.A
	//period
	let T;
	Object.defineProperty(this, "T", {
		get: function() {
			return T;
		},
		set: function(newvalue) {
			T = newvalue;
			this.omega = 2*Math.PI/T;
			this.updateWavelength();
		}
	});
	this.T = typeof params.T !== "undefined" ? params.T : 5;
	//direction
	let theta;
	Object.defineProperty(this, "theta", {
		get: function() {
			return theta;
		},
		set: function(newvalue) {
			theta = newvalue;
			this.costh = Math.cos(theta);
			this.sinth = Math.sin(theta);
		}
	});
	this.theta = typeof params.theta !== "undefined" ? params.theta : 0;
	//phase shift
	this.phi = typeof params.phi !== "undefined" ? params.phi : 0;

	this.updateWavelength();
}
Object.assign(DirectionalCosine.prototype, {
	constructor: DirectionalCosine,
	//Defaults
	A: 2.0,
	T: 5.0,
	L: 50.0,
	theta: 0.0,
	phi: 0.0,
	//Updates the wave length to the "natural" state (dispersion relation for deep waters)
	updateWavelength: function() {
		let g = 9.81;
		this.L = g*this.T*this.T/(2*Math.PI);
		if (this.conf) this.conf.updateDisplay(); //TEST
	},
	calculate: function(x,y,t) {
			let xm = x*this.costh+y*this.sinth;
			return this.A*Math.cos(this.phi+2*Math.PI*(xm/this.L)-this.omega*t);
	}
});

			//parentGUI, size, segments, sunDirection
function Ocean(params) {
	params = params || {};
	this.size = params.size || 2048;
	this.segments = params.segments || 127;

	/*
	The WaterShader is from the THREE examples.
	The mirror effect does not account for geometry, and there is no self-mirroring. But it mostly looks OK anyway. On tall waves, one can see that the rendered texture is stretched.
	*/
	try {
		let waterNormals = new THREE.TextureLoader().load( 'textures/waternormals.jpg' );
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
		this.water = new THREE.Water( renderer, camera, scene, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: params.sunDirection,
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		} );

		THREE.Mesh.call(this,
			new THREE.PlaneBufferGeometry(this.size, this.size, this.segments, this.segments),
			/*new THREE.MeshPhongMaterial({
				color: 0x041020,
				side: THREE.DoubleSide,
				wireframe: true
			})*/this.water.material);

		this.add(this.water);
	} catch (e) {
		THREE.Mesh.call(this,
			new THREE.PlaneBufferGeometry(this.size, this.size, this.segments, this.segments),
			new THREE.MeshPhongMaterial({
				color: 0x041020,
				side: THREE.DoubleSide,
				wireframe: true
			}));
		//Dummy object to avoid bugss when water shader fails
		this.water = {
			render: function(){},
			material: {uniforms: {time: {value: 0}}}};
		//Axes:
		this.add(new THREE.AxisHelper(600));
	}

	this.waves = [];
	let scope = this;

	if (params.parentGUI) {
		this.conf = params.parentGUI.addFolder("Ocean");
		this.conf.open();

		//Cos menu
		this.currentCos = new DirectionalCosine();//{A:NaN,T:NaN,theta:NaN,phi:NaN}); //dummy object
		let pcos = new Proxy(/*ptarget*/{}, {
			get: function(obj,prop) {
				return scope.currentCos[prop];
			},
			set: function(obj, prop, value) {
				scope.currentCos[prop] = value;
				wavCre.setWaveDef(2*Math.PI/scope.currentCos["T"], scope.currentCos["A"], 180/Math.PI*scope.currentCos["theta"]);
				updateMotion();
				return true; //debug
			},
			ownKeys: function(obj) {
				return Object.getOwnPropertyNames(scope.currentCos);
			}
		});
		// this.conf.add(pcos, "A",0.0,10.0, 0.1);
		// this.conf.add(pcos, "T",2.0,20.0, 0.1);
		//this.conf.add(pcos, "L",6.0,700.0, 0.5);
		// this.conf.add(pcos, "theta", 0, 2*Math.PI, 0.01);
		// this.conf.add(pcos, "phi", -Math.PI, Math.PI, 0.01);
		//Dispose of temporary cosine wave object
		this.currentCos = {};
		this.conf.updateDisplay();
	}
}
Ocean.prototype = Object.create(THREE.Mesh.prototype);
Object.assign(Ocean.prototype, {
	constructor: Ocean,
	addCosineWave: function(params) {
		params = params || {};
		let w = new DirectionalCosine(params);
		this.waves.push(w);
		wavCre.setWaveDef(2*Math.PI/w["T"], w["A"], 180/Math.PI*w["theta"]);

		this.currentCos = w;

		if (this.conf) {
			this.conf.updateDisplay();
			this.conf.open();
		}

		return w;
	},
	calculateZ: function(x,y,t) {
		let z = 0;
		for (let w of this.waves) {
			z += w.calculate(x,y,t);
		}
		return z;
	},
	//It appears the y axis was inverted here.
	//I fixed it, but am not sure how it was wrong.
	update: function(t) {
		let pos = this.geometry.getAttribute("position");

		let size = this.size;
		let segs = this.segments;

		//REGULAR GRID:
		let vSize = segs+1
		for (let j = 0; j < vSize; j++) {
			let y = (0.5-j/segs)*size;//(j/segs-0.5)*size;
			for (let i = 0; i < vSize; i++) {
				let x = (i/segs-0.5)*size;
				let z = this.calculateZ(x,y,t);
				pos.setZ(j*vSize+i, z);
			}
		}

		pos.needsUpdate = true;
		this.geometry.computeVertexNormals();

		this.water.material.uniforms.time.value = t;
	}
});
