//@EliasHasle

"use strict";

function Samples() {
	this.currentSample = -1;
	this.playing = false;
	this.isSamples = true;
}
Object.assign(Samples.prototype, {
	constructor: Samples,
	fromData: function(entries, headers, pars) {
		this.headers = headers;
		this.p = pars;

		this.L = entries.length;
		if (pars.dt !== undefined) {
			this.T = this.L * pars.dt;
		}
		this.D = entries[0].length; //dimension of sample
		this.a = new Float32Array(this.D * 4); //coefficients
		this.state = new Float32Array(this.D);

		this.samples = new Float32Array(this.D * this.L);
		for (let i = 0; i < entries.length; i++) {
			let entry = entries[i];
			for (let j = 0; j < entry.length; j++) {
				this.samples[i * this.D + j] = entry[j];
			}
		}
	},
	//The CSV is non-standard in that it can include
	//an arbitrary number of parameters before the
	//optional column headers. Another restriction is that
	//all data except parameter names and column headers
	//is parsed as floats.
	loadCustomCsv: function(file, callback) {
		this.doneLoading = false;
		var reader = new FileReader();
		let scope = this;
		reader.onload = function(event) {
			let lines = event.target.result.split("\n");
			var pars = {};
			var headers = [];
			//Code block for parsing of parameters and header
			//This is not optimized for speed or anything.
			//It just does the job.
			{
				let p = 0;
				while (true) {
					let entry = lines[p].split(",");
					if (entry.length == 2
						&& isNaN(parseFloat(entry[0]))
						&& !isNaN(parseFloat(entry[1]))) {
						pars[entry[0]] = parseFloat(entry[1]);
						p++;
					} else {
						break;
					}
				}
				if (isNaN(parseFloat(lines[p].split(",")[0]))) {
					headers =
						lines[p].split(",").map(function(h) {
							return h.trim();
						});
					p++;
				}
				lines.splice(0, p);
			}

			//Now the rest of the file should consist of data entries,
			//one per line.
			var data = [];
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i].split(",");
				let entry = [];
				for (let j = 0; j < line.length; j++) {
					entry.push(parseFloat(line[j]));
				}
				data.push(entry);
			}

			scope.fromData(data, headers, pars);

			scope.doneLoading = true;
			if (callback !== undefined) callback(); //parameters?
		};
		reader.readAsText(file);
	},
	//This requires the parameter dt to be specified.
	getState: function(t) {
		//This is not sufficient, as getState can be undefined:
		if (!this.doneLoading) console.warn("Not done loading");
		var tm = t / this.p.dt;
		var i = Math.floor(tm);
		var mu = tm - i;
		//Do this block only if it is not done already:
		if (i != this.currentSample) {
			if (i < 0) {
				this.state.fill(0);
				return this.state;
			}
			if (i >= this.L) {
				this.currentSample = -1;
				this.playing = false;
				this.state.fill(0);
				return this.state;
			}
			this.currentSample = i;

			let s = this.samples;
			//start indexes of samples needed for interpolation
			//j1 corresponds to i
			let j0 = Math.max(0, (i - 1) * this.D);
			let j1 = Math.min((this.L - 1) * this.D, i * this.D);
			let j2 = Math.min((this.L - 1) * this.D, (i + 1) * this.D);
			let j3 = Math.min((this.L - 1) * this.D, (i + 2) * this.D);

			//Store coefficients for the Catmull-Rom cubic spline:
			for (let k = 0, n; k < this.D; k++) {
				n = k << 2; //starts at 4*k, and counts upwards
				this.a[n++] = -0.5 * s[j0 + k] + 1.5 * s[j1 + k] - 1.5 * s[j2 + k] + 0.5 * s[j3 + k];
				this.a[n++] = s[j0 + k] - 2.5 * s[j1 + k] + 2 * s[j2 + k] - 0.5 * s[j3 + k];
				this.a[n++] = 0.5 * (s[j2 + k] - s[j0 + k]);
				this.a[n] = s[j1 + k];
			}
		}

		//Calculating the state
		let mu2 = mu * mu;
		let mu3 = mu2 * mu;
		for (let i = 0; i < this.D; i++) {
			//Cubic spline
			this.state[i] = this.a[4 * i] * mu3
				+ this.a[4 * i + 1] * mu2
				+ this.a[4 * i + 2] * mu
				+ this.a[4 * i + 3];
			//DEBUG (no hits):
			/*if (isNaN(this.state[i])) {
				console.error("this.state["+i.toString()+"] is NaN!");
			}*/
		}

		//the state is not protected
		return this.state;
	}
});

/*
Catmull-Rom patches on regular x,y grid.

Reference for current math:
	http://blogs.mathworks.com/graphics/2015/05/12/patch-work/
Inspiration for future optimization:
	http://www.mvps.org/DirectX/articles/shadeland/ (with download)
*/
function Patches(size, segments, D, grid) {
	this.size = size;
	this.segments = segments;
	this.D = D;
	this.a = new Float32Array(16 * D);
	if (grid !== undefined) this.generateCoeffs(grid);
}
Object.assign(Patches.prototype, {
	constructor: Patches,
	//Generate bicubic patch coefficients
	//for all patches in the grid,
	//and store them in this.a (column-major,
	//then extract matrices using subarray.)
	//(this.a is already defined and allocated).
	generateCoeffs: (function() {
		//M holds the Catmull-Rom patch matrix
		const M = new THREE.Matrix4().set(
			-0.5, 1.5, -1.5, 0.5,
			1, -2.5, 2, -0.5,
			-0.5, 0, 0.5, 0,
			0, 1, 0, 0
		);
		const MT = new THREE.Matrix4().copy(M).transpose();
		let PZ = new THREE.Matrix4(); //holder for PZ
		let pz = new Float32Array(16);

		return function(grid) {
			let sideVerts = this.segments + 1;
			//I use a wraparound trick for avoiding
			//index errors in a simple way,
			//but it is not ideal, but I think it is good enough.
			for (let j = sideVerts; j < 2 * sideVerts; j++) {
				for (let i = sideVerts; i < 2 * sideVerts; i++) {
					let c = 0;
					for (let k = -1; k < 3; k++) {
						let ir = (i + k) % sideVerts;
						for (let m = -1; m < 3; m++ , c++) {
							let jr = (j + m) % sideVerts;
							pz[c] = grid[jr * sideVerts + ir];
							//DEBUG: Problem: tmp is sometimes a float!
							let tmp = jr * sideVerts + ir;
							if (isNaN(tmp)) {
								console.error("The index is NaN!");
								return;
							} else if (tmp < 0 || tmp >= grid.length) {
								console.error("Index out of bounds! tmp=%d, i=%d, j=%d, k=%d, m=%d", tmp, i, j, k, m);
								return;
							} else if (isNaN(pz[c])) {
								console.error("pz[c] is NaN");
								if (isNaN(grid[tmp])) {
									console.error("grid[" + tmp.toString() + "] is NaN!");
									console.log("ir=" + ir.toString() + ", jr=" + jr.toString());
								}
								return;
							}
						}
					}
					PZ.fromArray(pz);
					PZ.multiply(MT);
					//reuse c for index in this.a:
					c = 16 * ((j - sideVerts) * sideVerts + (i - sideVerts));
					PZ.premultiply(M);
					PZ.toArray(this.a.subarray(c, c + 16));
				}
			}
		};
	}).call(this),
	calculateZ: (function() {
		let vxy = new THREE.Vector3();
		let C = new THREE.Matrix4();
		let up = new THREE.Vector4();
		let vp = new THREE.Vector4();

		return function(x, y, M) {

			//M is a transform matrix to be applied to every point before converting to data coordinates, typically defined like this:
			//let M=new THREE.Matrix4().getInverse(vessel.matrixWorld)
			if (M !== undefined) {
				vxy.set(x, y, 0).applyMatrix4(M);
				x = vxy.x
				y = vxy.y; //discard v.z (=draft?)
			}

			let size = this.size;
			let segments = this.segments;

			//Given x,y, find the right control points for interpolation
			//xd,yd are corresponding positions in the samples
			let xd = (x / size + 0.5) * segments;
			let yd = (y / size + 0.5) * segments;

			//data cell
			let i = Math.floor(xd);
			let j = Math.floor(yd);

			if (!(0 <= i && i < segments + 1
				&& 0 <= j && j < segments + 1)) {
				//Out of data range
				return 0;
			}

			//DEBUG, using cell floor. Looks OK:
			//return this.tempGrid[j*(segments+1)+i];
			//DEBUG END

			//point within cell
			let u = xd - i;
			let v = yd - j;

			//Interpolation using Catmull-Rom patch:

			//Cell coefficients array:
			let k = 16 * (j * (segments + 1) + i);

			//DEBUG
			/*if (k+15 >= this.a.length) {
				console.error("overflow on a! i="+i.toString()+", j="+j.toString());
				return;
			}*/

			C.fromArray(this.a.subarray(k, k + 16));

			up.set(u ** 3, u ** 2, u, 1);
			vp.set(v ** 3, v ** 2, v, 1);

			let z = vp.dot(up.applyMatrix4(C));
			//DEBUG
			if (isNaN(z)) console.warn("z is NaN!");

			return z;
		}
	}).call(this)
});

/*Interpolate in time over samples grid to generate a samples grid for
the current time. Then use catmull-rom patches to interpolate between the grid cells.
*/
function DynamicPatches(samples) {
	this.samples = samples;
	Patches.call(this, samples.p.size, samples.p.segments, samples.D);
}
DynamicPatches.prototype = Object.create(Patches.prototype);
Object.assign(DynamicPatches.prototype, {
	constructor: DynamicPatches,
	calculate: (function() {
		var currentTime;

		return function(x, y, t, M) {
			if (/*currentTime==undefined || */t != currentTime) {
				currentTime = t;
				let instantGrid = this.samples.getState(t);
				this.generateCoeffs(instantGrid);
			}

			return this.calculateZ(x, y, M);
		}
	}).call(this)
});
