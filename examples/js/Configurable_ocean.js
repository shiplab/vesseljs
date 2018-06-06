//@EliasHasle

/*Dependencies: THREE, Mirror, WaterShader, dat.gui (for gui only), browse_files_Elias_Hasle, Patch_interpolation */

/*
PLANS:
Upgrading to (a possibly modified) 
WaterShader2.js will remove the dependency 
on Mirror.js as well as opening up 
possibilities for visualizing approximate 
water flows around vessels.

A more profound change would be moving 
calculations into shaders, such as is 
done simply with one cosine wave in 
the newest version of the compit demo.
For this to give a performance improvement 
in the general case (of course accepting 
some limits on the number of simultaneous 
waves), the interpolation would also need 
to be reworked into doing the heavy-lifting
on GPU, at least the time interpolation, 
i.e. by maintaining three buffers with 
vertex position data, and use a uniform 
index to indicate the time order of the buffers,
and a uniform interpolation parameter to do the
time interpolation. The 2D Catmull-Rom interpolation
can almost surely also benefit from GPU. In that case,
it will output a texture, and the time interpolation will
take three extra textures rather than three attributes.
*/

"use strict";

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
	//Updates the wave length to the "natural" state
	updateWavelength: function() {
		let g = 9.81;
		this.L = g*this.T*this.T/(2*Math.PI);
		if (this.conf) this.conf.updateDisplay(); //TEST
	},
	calculate: function(x,y,t) {
			let xm = x*this.costh-y*this.sinth;
			return this.A*Math.cos(this.phi+2*Math.PI*(xm/this.L)-this.omega*t);
	}
});

function FakeSplash(params) {
	params = params || {};

	Wave.call(this, "Fake splash");
	if (params.xc) this.xc = params.xc;
	if (params.yc) this.yc = params.yc;
	if (params.t0) this.t0 = params.t0;
	if (params.A1) this.A1 = params.A1;
	if (params.v) this.v = params.v;
	if (params.L) this.L = params.L;
}
Object.assign(FakeSplash.prototype, {
	constructor: FakeSplash,
	//Defaults start
	xc: 0,
	yc: 0,
	t0: 0,
	A1: 2000,
	v: 40,
	L: 40,
	//Defaults end
	calculate: function(x,y,t) {
		let tm = t-this.t0;
		if (tm<0) return 0;
		let r = Math.sqrt(Math.pow(x-this.xc,2)+Math.pow(y-this.yc,2));
		if (r>this.v*tm+0.5*this.L || r<this.v*tm-0.5*this.L) return 0;
		let Am = this.A1/(r+1);
		return Am*Math.cos((r-this.v*tm)*Math.PI/this.L);		
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
		//Dummy object to avoid bugs when water shader fails
		this.water = {
			render: function(){},
			material: {uniforms: {time: {value: 0}}}};
		//Axes:
		this.add(new THREE.AxisHelper(600));
	}
	
	this.waves = [];
	let scope = this;
	
	//Sampling
	this.sampling = {
		segments: 50,
		dt: 0.5,
		T: 10,
		generateSamples: function() {
			let lines = [];
			//non-standard header
			lines.push("size, " + scope.size.toString());
			lines.push("segments, " + this.segments.toString());
			lines.push("dt, " + this.dt.toString());
			for (let t = 0; t<=this.T; t+=this.dt) {
				let line = [];
				for (let i = 0; i < this.segments+1; i++) {
					let y = (i/this.segments-0.5)*scope.size;
					for (let j = 0; j < this.segments+1; j++) {
						let x = (j/this.segments-0.5)*scope.size;
						let z = scope.calculateZ(x,y,t);
						line.push((Math.round(1000*z)*0.001).toFixed(3));
					}
				}
				lines.push(line.join(","));
			}
			//The output is not strict CSV data, but the data is comma-separated.
			let csvData = lines.join("\n");
			var link = document.createElement("a");
			link.href = "data:text/csv," + encodeURI(csvData);
			link.download = "globalWaves.csv";
			link.target = "_blank";
			//document.body.appendChild(link);
			link.click();
			//document.body.removeChild(link);
		}
	};
	
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
				return true; //debug
			},
			ownKeys: function(obj) {
				return Object.getOwnPropertyNames(scope.currentCos);
			}
		});
		this.cosConf = this.conf.addFolder("Cosine waves");
		this.cosConf.add(this, "addCosineWave");
		this.cosConf.add({
			next: function() {
				if (scope.waves.length === 0) return;
				let i = scope.waves.indexOf(scope.currentCos);
				i = (i+1)%scope.waves.length;
				while (i < 2*scope.waves.length 
					&& scope.waves[i%scope.waves.length].waveType !== "Cosine") {
					i++;
				}
				if (i === 2*scope.waves.length) return;
				console.log("next: index:", i%scope.waves.length, "new currentCos: ", scope.waves[i%scope.waves.length]);
				scope.currentCos = scope.waves[i%scope.waves.length];
				scope.cosConf.updateDisplay();
			}
		}, "next");
		this.cosConf.add({
			remove: function() {
					let i = scope.waves.indexOf(scope.currentCos);
					if (i===-1) return;
					scope.waves.splice(i,1);
					i = scope.waves.length-1;
					while (i>=0 && scope.waves[i].waveType !== "Cosine") {
						i--;
					}
					if (i === -1) {
						scope.currentCos = {};
						scope.cosConf.close();
					} else {
						console.log("remove: new index is %d, wave is %s",i,scope.waves[i].toString());
						scope.currentCos = scope.waves[i];
					}
					scope.cosConf.updateDisplay();
				}
		}, "remove");
		this.cosConf.add(pcos, "A",0.0,10.0, 0.1);
		this.cosConf.add(pcos, "T",2.0,20.0, 0.1);
		this.cosConf.add(pcos, "updateWavelength").name("Auto wavelength");
		this.cosConf.add(pcos, "L",6.0,700.0, 0.5);
		this.cosConf.add(pcos, "theta", -Math.PI, Math.PI, 0.01);
		this.cosConf.add(pcos, "phi", -Math.PI, Math.PI, 0.01);
		//Dispose of temporary cosine wave object
		this.currentCos = {};
		this.cosConf.updateDisplay();
		
		//Splash menu
		this.currentSplash = new FakeSplash();//{xc:NaN,yc:NaN,t0:NaN,A1:NaN,v:NaN,L:NaN}); //dummy object
		let psplash = new Proxy({}, {
			get: function(obj,prop) {
				return scope.currentSplash[prop];
			},
			set: function(obj, prop, value) {
				scope.currentSplash[prop] = value;
				return true; //debug
			},
			ownKeys: function(obj) {
				return Object.getOwnPropertyNames(scope.currentSplash);
			}
		});
		this.splashConf = this.conf.addFolder("Splash waves");
		this.splashConf.add(this, "addFakeSplash");
		this.splashConf.add({
			next: function() {
				if (scope.waves.length === 0) return;
				let i = scope.waves.indexOf(scope.currentSplash);
				i = (i+1)%scope.waves.length;
				while (i < 2*scope.waves.length 
					&& scope.waves[i%scope.waves.length].waveType !== "Fake splash") {
					i++;
				}
				if (i === 2*scope.waves.length) return;
				console.log("next: index:", i%scope.waves.length, "new currentSplash: ", scope.waves[i%scope.waves.length]);
				scope.currentSplash = scope.waves[i%scope.waves.length];
				scope.splashConf.updateDisplay();
			}
		}, "next");
		this.splashConf.add({
			remove: function() {
					let i = scope.waves.indexOf(scope.currentSplash);
					if (i===-1) return;
					scope.waves.splice(i,1);
					i = scope.waves.length-1;
					while (i>=0 && scope.waves[i].waveType !== "Fake splash") {
						i--;
					}
					if (i === -1) {
						scope.currentSplash = {};
						scope.splashConf.close();
					} else {
						console.log("remove: new index is %d, wave is %s",i,scope.waves[i].toString());
						scope.currentSplash = scope.waves[i];
					}
					scope.splashConf.updateDisplay();
				}
		}, "remove");
		this.splashConf.add(psplash, "xc",-0.5*this.size,0.5*this.size);
		this.splashConf.add(psplash, "yc",-0.5*this.size,0.5*this.size);
		this.splashConf.add(psplash, "t0", 0.0, 20.0);
		this.splashConf.add(psplash, "A1", 500, 5000);
		this.splashConf.add(psplash, "v", 5.0, 100.0);
		this.splashConf.add(psplash, "L", 5.0, 100.0);
		//Dispose of temporary splash object
		this.currentSplash = {};
		this.splashConf.updateDisplay();
		
		//Sampled wave menu
		this.currentSampled = {filename: "No file"};
		let psampled = new Proxy({}, {
			get: function(target, prop) {
				return scope.currentSampled[prop];
			},
			set: function(target, prop, value) {
				return true;
			},
			ownKeys: function(obj) {
				return Object.getOwnPropertyNames(scope.currentSampled);
			}
		});
		this.sampledConf = scope.conf.addFolder("Sampled waves");
		this.sampledConf.add(this, "addSampled");
		this.sampledConf.add({
			next: function() {
				if (scope.waves.length === 0) return;
				let i = scope.waves.indexOf(scope.currentSampled);
				i = (i+1)%scope.waves.length;
				while (i < 2*scope.waves.length 
					&& scope.waves[i%scope.waves.length].waveType !== "From samples") {
					i++;
				}
				if (i === 2*scope.waves.length) return;
				console.log("next: index:", i%scope.waves.length, "new currentSampled: ", scope.waves[i%scope.waves.length]);
				scope.currentSampled = scope.waves[i%scope.waves.length];
				scope.sampledConf.updateDisplay();
			}
		}, "next");
		this.sampledConf.add({
			remove: function() {
					let i = scope.waves.indexOf(scope.currentSampled);
					if (i===-1) return;
					scope.waves.splice(i,1);
					i = scope.waves.length-1;
					while (i>=0 && scope.waves[i].waveType !== "From samples") {
						i--;
					}
					if (i === -1) {
						scope.currentSampled = {};
						scope.sampledConf.close();
					} else {
						console.log("remove: new index is %d, wave is %s",i,scope.waves[i].toString());
						scope.currentSampled = scope.waves[i];
					}
					scope.sampledConf.updateDisplay();
				}
		}, "remove");
		this.sampledConf.add(psampled,"filename").onChange(function() {scope.sampledConf.updateDisplay();});
		
		var guis = this.conf.addFolder("Sampling");
		guis.add(this.sampling, "segments", 10, 100).onChange(function(value) {
			this.sampling.segments = Math.round(value);
		});
		guis.add(this.sampling, "dt", 0.01, 1);
		guis.add(this.sampling, "T", 2, 30);
		guis.add(this.sampling, "generateSamples");
	}
}
Ocean.prototype = Object.create(THREE.Mesh.prototype);
Object.assign(Ocean.prototype, {
	constructor: Ocean,
	addCosineWave: function(params) {
		params = params || {};
		let w = new DirectionalCosine(params);
		this.waves.push(w);

		this.currentCos = w;
		
		if (this.conf) {
			this.cosConf.updateDisplay();
			this.cosConf.open();
			this.splashConf.close();
			this.sampledConf.close();
		}
		
		return w;
	},
	addFakeSplash: function(params) {
		params = params || {};
		params.parentGUI = this.conf;
		params.size = this.size;
				
		let w = new FakeSplash(params);
		this.waves.push(w);
		
		this.currentSplash = w;
		
		if (this.conf) {
			this.splashConf.updateDisplay();
			this.splashConf.open();
			this.cosConf.close();
			this.sampledConf.close();
		}
		
		return w;
	},
	addSampled: function() {
		let w;
		let scope = this;
		browseFile(".csv,.txt, text/csv, text/comma-separated-values",
			function (file) {
				let s = new Samples();		//callback
				s.loadCustomCsv(file, function() {
					w = new DynamicPatches(s);
					Wave.call(w, "From samples");
					w.filename = file.name;
					scope.waves.push(w);
					
					scope.currentSampled = w;
					
					if (scope.conf) {
						scope.sampledConf.updateDisplay();
						scope.sampledConf.open();
						scope.cosConf.close();
						scope.splashConf.close();
					}
				});
			});
		return w; //inadequate for not yet loaded file, probably.
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
		
		//IRREGULAR GRID TEST START
		//The water rendering is broken, and modifying uv does not seem to help.
		/*
		let posa = pos.array;
		let uv = ocean.geometry.getAttribute("uv");
		let uva = uv.array;
		//important positions (typically positions of vessels)
		let ps = [[300,400],
				  [-100,300],
				  [200,500],
				  [-200,-400],
				  [-300,500],
				  [-400,-400]];

		var wFun = function(r) {
			//return 1/Math.sqrt(1+(10*r/size)**2);
			return Math.exp(-((10*r/size)**2));
			//1/(r+0.001);//(1-r/(Math.sqrt(2)*size));
		}
		
		for (let j=0; j<segs+1; j++) {
			let y0 = (j/segs-0.5)*size;
			for (let i=0; i<segs+1; i++) {
				let x0 = (i/segs-0.5)*size;
				
				let w0 = 0.8; //the weight of the default point

				let x=0,y=0,WX=0,WY=0;
				
				if ((i==0 || i==segs || j==0 || j==segs)) {
					x = x0;
					y = y0;
					WX = 1;
					WY = 1;
				} else {
					//vessel weights:
					for (let k=0; k<ps.length; k++) {
						let r = Math.sqrt((x0-ps[k][0])**2+(y0-ps[k][1])**2);
						let w = wFun(r);
						x += w*ps[k][0];
						y += w*ps[k][1];
						WX += w;
						WY += w;
					}

					//edge weights:
					let d = Math.abs(x0-size/2);
					let w = wFun(d);
					x += w*size/2;
					WX += w;
					
					d = Math.abs(x0+size/2);
					w = wFun(d);
					x += -w*size/2;
					WX += w;
					
					d = Math.abs(y0-size/2);
					w = wFun(d);
					y += w*size/2;
					WY += w;
					
					d = Math.abs(y+size/2);
					w = wFun(d);
					y += -w*size/2;
					WY += w;	
					
				}
				
				x = w0*x0 + (1-w0)*x/WX;
				y = w0*y0 + (1-w0)*y/WY;
				
				let z = calculateZ(x,y,t);

				let k = (j*(segs+1) + i);

				posa[3*k] = x;
				posa[3*k+1] = y;
				posa[3*k+2] = z;

					uva[2*k] = x/size+0.5;
					uva[2*k+1] = y/size+0.5;
			}
		}
		uv.needsUpdate = true;
		*/
		//IRREGULAR GRID TEST END
		
		pos.needsUpdate = true;
		this.geometry.computeVertexNormals();
		
		this.water.material.uniforms.time.value = t;
	}
});