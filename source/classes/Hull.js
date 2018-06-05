//@EliasHasle

/*When having a class for this, the specification can possibly be in one of several formats, and the handling will be contained in this class.

I have tried to remove the dependency on the ship object here. This is in order to be able to optimize updates.

This class needs more comments, for shure.

And the geometric calculations are faulty.
*/

function Hull(spec) {
	JSONSpecObject.call(this, spec);
}
Hull.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(Hull.prototype, {
	setFromSpecification: function(spec) {
		this.halfBreadths = spec.halfBreadths;
		//this.buttockHeights = spec.buttockHeights;
		this.attributes = spec.attributes; //this could/should include LOA, BOA, Depth
		this.levelsNeedUpdate = true;
	},
	getSpecification: function() {
		return {
			halfBreadths: this.halfBreadths,
			//buttockHeights: this.buttockHeights
			attributes: this.attributes
		};
	},
	//to facilitate economical caching, it may be best to have a few numerical parameters to this function instead of letting it depend on the whole designState. Or maybe the designState is static enough.
	getWeight: function(designState) {
		let ha = this.attributes;
		let B = ha.BOA;
		let D = ha.Depth;
		let cp = designState.calculationParameters;
		let K = cp.K;
		let L = cp.LWL_design;
		let T = cp.Draft_design;
		let Cb = cp.Cb_design;
		let vsm = 0.514444*cp.speed; // Convert the design speed from knots to m/s
		let Fn = vsm / Math.pow(9.81 * L, 0.5); // Calculates Froude number
		
		//This is not a good way to estimate the hull weight.
		let parsons = parametricWeightHull(K, L, B, T, D, Cb, Fn);
		parsons.mass *= 1000; //ad hoc conversion to kg, because the example K value is aimed at ending with tonnes.
		
		let output = parsons;
		//console.info("Hull weight:", output);
		return output;
	},
	/*
	Testing new version without nanCorrectionMode parameter, that defaults to setting lower NaNs to 0 and extrapolating highest data entry for upper NaNs (if existant, else set to 0). Inner NaNs will also be set to zero.
	
	Input:
	z: level from bottom of ship (absolute value in meters)
	
	Output:
	Array representing waterline offsets for a given height from the keel (typically a draft).
	*/
	getWaterline: function(z) {
		let ha = this.attributes;
		let zr = z/ha.Depth; //using zr requires fewer operations and less memory than a scaled copy of wls.
		let wls = this.halfBreadths.waterlines;//.map(wl=>wl*ha.Depth);
		let sts = this.halfBreadths.stations;
		let tab = this.halfBreadths.table;

		if (zr<wls[0]) {
				//console.warn("getWaterLine: z below lowest defined waterline. Defaulting to all zero offsets.");
				return new Array(sts.length).fill(0);
		} else {
			let a, mu;
			if (zr>wls[wls.length-1]) {
				//console.warn("getWaterLine: z above highest defined waterline. Proceeding with highest data entries.");
				a = wls.length-2; //if this level is defined...
				mu=1;
				//wl = tab[a].slice();
			} else {
				({index: a, mu: mu} = bisectionSearch(wls, zr));
				if (a === wls.length-1) {
					a = wls.length-2;
					mu = 1;
				}
			}
			
			//Try to do linear interpolation between closest data waterlines, but handle null values well:
			let wl = new Array(sts.length);
			for (let j = 0; j < wl.length; j++) {
				let lower, upper;
				let b = a;
				//Find lower value for interpolation
				if (tab[b][j]!==null && !isNaN(tab[b][j])) {
					lower = tab[b][j];					
				} else {
					b = a+1;
					while(b < wls.length && (isNaN(tab[b][j]) || tab[b][j]===null)) {
						b++;
					}
					if (b !== wls.length) {
						//Inner NaN
						lower = 0;
					} else {
						//Upper NaN, search below:
						b = a-1;
						while (b >= 0 && (isNaN(tab[b][j]) || tab[b][j]===null)) {
							b--;
						}
						if (b===-1) {
							//No number found:
							lower = 0;
							upper = 0;
						} else {
							lower = tab[b][j];
							upper = lower;
						}
					}
				}
				//Find upper value for interpolation
				let c = a+1;
				if (upper !== undefined) {/*upper found above*/}
				else if (tab[c][j]!==null && !isNaN(tab[c][j])) {
					upper = tab[c][j];
				} else {
					//The cell value is NaN.
					//Upper is not defined.
					//That means either tab[a][j] is a number
					//or tab[a][j] is an inner NaN and
					//there exists at least one number above it.
					//In both cases I have to check above a+1.
					c = a+2;
					while (c < wls.length && (isNaN(tab[c][j]) || tab[c][j]===null)) {
						c++;
					}
					if (c === wls.length) upper = lower;
					else {
						upper = tab[c][j];
					}
				}
				//Linear interpolation
				wl[j] = lerp(lower, upper, mu);
						//Scale numerical values
				if (wl[j]!==null && !isNaN(wl[j])) wl[j] *= 0.5*ha.BOA;
			}
		return wl;
		}
	},
	//This must be debugged more. getWaterline got an overhaul, but this did not.
	getStation: function(x) {
		let ha = this.attributes;
		let xr = x/ha.LOA;
		let sts = this.halfBreadths.stations;
		let wls = this.halfBreadths.waterlines;
		let tab = this.halfBreadths.table;

		let {index: a, mu: mu} = bisectionSearch(sts, xr);

		let st;
		if (a<0 || a>=sts.length) st = new Array(wls.length).fill(null);
		else if (a+1===sts.length) st = tab.map(row=>row[sts.length-1]);
		else {
			st = [];
			for (let j = 0; j < wls.length; j++) {
				let after = tab[j][a];
				let forward = tab[j][a+1];
				if ((after===null || isNaN(after)) && (forward===null || isNaN(forward))) {
					st.push(null);
				} else {
					//Simply correcting by "|| 0" is not consistent with what is done in getWaterline. It may be better to correct upper nulls by nearest neighbor below.
					st.push(lerp(after || 0, forward || 0, mu));
				}
			}
		}
		for (let j=0; j<this.halfBreadths.waterlines.length; j++) {
			st[j] *= 0.5*ha.BOA;
			if (isNaN(st[j]) || st[j] === null) st[j] = null;
		}
		return st;
	},
									//typically deck bounds
	waterlineCalculation: function(z, bounds) {
		let {minX, maxX, minY, maxY} = bounds || {};

		//console.group/*Collapsed*/("waterlineCalculation.");
		//console.info("Arguments: z=", z, " Boundaries: ", arguments[1]);
		
		let wl = this.getWaterline(z);
		//console.info("wl: ", wl); //DEBUG

		let LOA = this.attributes.LOA;
		
		let sts = this.halfBreadths.stations.slice();
		for (let i=0; i < sts.length; i++) {
			sts[i] *= LOA;
		}
		
		let hasMinX = (minX !== undefined) && minX!==sts[0];
		let hasMaxX = (maxX !== undefined) && maxX!==sts[sts.length-1];
		if (hasMinX || hasMaxX) {
			let first=0;
			let wlpre;
			if (hasMinX) {
				let muf;
				({index: first, mu: muf} = bisectionSearch(sts, minX));
				let lower = wl[first];
				let upper = wl[first+1];
				if ((lower===null || isNaN(lower)) && (upper===null || isNaN(upper))) {
					wlpre = null;
				} else {
					wlpre = lerp(lower || 0, upper || 0, muf);
				}
			}
			let last = sts.length-1;
			let wlsuff;
			if (hasMaxX) {
				let mul;
				({index: last, mu: mul} = bisectionSearch(sts, maxX));
				let lower = wl[last];
				let upper = wl[last+1];
				if ((lower===null || isNaN(lower)) && (upper===null || isNaN(upper))) {
					wlsuff = null;
				} else {
					wlsuff = lerp(lower || 0, upper || 0, mul);
				}
			}
			
			//Add virtual entries according to specified boundaries:
			sts = sts.slice(first+1, last+1);
			wl = wl.slice(first+1, last+1);
			if (hasMinX) {
				sts.unshift(minX);
				wl.unshift(wlpre);
			}
			if (hasMaxX) {
				sts.push(maxX);
				wl.push(wlsuff);
			}
		}

		//This does not yet account properly for undefined minY, maxY.
		let port = [], star = [];
		for (let i=0; i<wl.length; i++) {
			if (wl[i]===null || isNaN(wl[i])) {
				star[i] = minY || null;
				port[i] = maxY || null;
			} else {
				star[i] = Math.max(-wl[i], minY||-wl[i]);
				port[i] = Math.min(wl[i], maxY||wl[i]);
			}
		}
		
		//DEBUG
		//console.info("Arguments to sectionCalculation:", sts, star, port);
		
		//sectionCalculation can potentially be served some nulls.
		let sc = sectionCalculation({xs: sts, ymins: star, ymaxs: port});
		let LWL = sc.maxX-sc.minX;
		let BWL = sc.maxY-sc.minY;
		let Cwp = sc.A/(LWL*BWL);
		let APP = this.attributes.APP || sc.minX;
		let FPP = this.attributes.FPP || sc.maxX;
		let LBP = FPP-APP;
		
		let output = {
			z: z,
			xc: sc.xc,
			yc: sc.yc,
			Awp: sc.A,
			Ix: sc.Ix,
			Iy: sc.Iy,
			maxX: sc.maxX,
			minX: sc.minX,
			maxY: sc.maxY,
			minY: sc.minY,
			Cwp: Cwp,
			LWL: LWL,
			LBP: LBP,
			BWL: BWL
		};
		//console.info("Output from waterlineCalculation: ", output);
		//console.groupEnd();
		return output;
	},
	//Not done, and not tested
	//The optional maxZ parameter is introduced for enabling below-water calculations. More bounds will add more complexity, although then some common logic may perhaps be moved from this method and waterlineCalculation to sectionCalculation.
	stationCalculation: function(x, maxZ) {
		let wls = this.halfBreadths.waterlines.map(wl=>this.attributes.Depth*wl);
		let port = this.getStation(x);
		if (maxZ!==null && !isNaN(maxZ)) {
			let {index, mu} = bisectionSearch(wls, maxZ);
			if (index < wls.length-1) {
				wls[index+1] = lerp(wls[index], wls[index+1], mu);
				port[index+1] = lerp(port[index], port[index+1], mu);
				wls = wls.slice(0,index+2);
				port = port.slice(0,index+2);
			}
		}
		let star = port.map(hb=>-hb);

		let sc = sectionCalculation({xs: wls, ymins: star, ymaxs: port});
		return {
			x: x, //or xc? or cg.. Hm.
			yc: sc.yc,
			zc: sc.xc,
			A: sc.A,
			Iz: sc.Ix,
			Iy: sc.Iy,
			maxZ: sc.maxX,
			minZ: sc.minX,
			maxY: sc.maxY,
			minY: sc.minY
		};
	},

	/*
	Known issues:
	nulls in the offset table will be corrected to numbers in this calculation, whereas the intended meaning of a null supposedly is that there is no hull at that position. This means the calculation can overestimate the wetted area (and possibly make other errors too).
	*/
	//Important: calculateAttributesAtDraft takes one mandatory parameter T. (The function defined here is immediately called during construction of the prototype, and returns the proper function.)
	calculateAttributesAtDraft: function() {
		function levelCalculation(hull,
			z,
			prev={
				z: 0,
				Vs: 0,
				Vbb: 0,
				As: 0,
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0,
				prMinY: 0,
				prMaxY: 0,
				Ap: 0,
				Cv: {x:0, y:0, z:0}
			}) {
			
			let wlc = hull.waterlineCalculation(z,{});
			let lev = {};
			Object.assign(lev, wlc);
			//Projected area calculation (approximate):
			lev.prMinY = wlc.minY;
			lev.prMaxY = wlc.maxY;
			//DEBUG:
			//console.info("prev.Ap = ", prev.Ap);
			//console.info("Parameters to trapezoidCalculation: (%.2f, %.2f, %.2f, %.2f, %.2f, %.2f)", prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z);
			let AT = trapezoidCalculation(prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z)["A"];
			//console.log("Calculated area of trapezoid: ", AT);
			lev.Ap = prev.Ap + AT;
			//lev.Ap = prev.Ap
			//	+ trapezoidCalculation(prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z)["A"];
			//DEBUG END

			
			//level bounds are for the bounding box of the submerged part of the hull
			if (wlc.minX!==null && !isNaN(wlc.minX) && wlc.minX<=prev.minX) 
				lev.minX = wlc.minX;
			else
				lev.minX = prev.minX;
			if (wlc.maxX!==null && !isNaN(wlc.maxX) && wlc.maxX>=prev.maxX) 
				lev.maxX = wlc.maxX;
			else
				lev.maxX = prev.maxX;
			if (wlc.minY!==null && !isNaN(wlc.minY) && wlc.minY<=prev.minY) 
				lev.minY = wlc.minY;
			else
				lev.minY = prev.minY;
			if (wlc.maxY!==null && !isNaN(wlc.maxY) && wlc.maxY>=prev.maxY) 
				lev.maxY = wlc.maxY;
			else
				lev.maxY = prev.maxY;
			
			lev.Vbb = (lev.maxX-lev.minX)*(lev.maxY-lev.minY)*z;
			
			//Keep level maxX and minX for finding end cap areas:
			lev.maxXwp = wlc.maxX;
			lev.minXwp = wlc.minX;
			
			//Find bilinear patches in the slice, and combine them.
			//Many possibilities for getting the coordinate systems wrong.
			let calculations = [];
			let sts = hull.halfBreadths.stations.map(st=>st*hull.attributes.LOA);
			let wl = hull.getWaterline(z);
			let prwl = hull.getWaterline(prev.z);
			for (let j = 0; j < sts.length-1; j++) {
				let port = 
					patchColumnCalculation(sts[j], sts[j+1], prev.z, z, -prwl[j], -wl[j], -prwl[j+1], -wl[j+1]);
				calculations.push(port);
				let star =
					patchColumnCalculation(sts[j], sts[j+1], prev.z, z, prwl[j], wl[j], prwl[j+1], wl[j+1]);
				calculations.push(star);
			}
			//console.log(calculations); //DEBUG
			let C = combineVolumes(calculations);
			//Cv of slice. Note that switching of yz must
			//be done before combining with previous level
			let Cv = {x: C.Cv.x, y: C.Cv.z, z: C.Cv.y};
			
			lev.Vs = prev.Vs + C.V; //hull volume below z
			lev.As = prev.As + C.As; //outside surface below z

			//End caps:
			if (lev.minXwp <= sts[0])
				lev.As += hull.stationCalculation(lev.minXwp, z)["A"];
			if (lev.maxXwp >= sts[sts.length-1])
				lev.As += hull.stationCalculation(lev.maxXwp, z)["A"];
			
			//center of volume below z (some potential for accumulated rounding error when calculating an accumulated average like this):
			lev.Cv = Vectors.scale(Vectors.add(
						Vectors.scale(prev.Cv,prev.Vs),
						Vectors.scale(Cv,C.V)
					), 1/(lev.Vs || 2));
			
			lev.Cb = lev.Vs/lev.Vbb;
			lev.Cp = lev.Vs/(lev.Ap*(lev.maxX-lev.minX));
			
			return lev;
		}
		
		//Here is the returned function calculateAttributesAtDraft(T):
		return function(T) {
			if (T===null || isNaN(T)) {
				console.error("Hull.prototype.calculateAttributesAtDraft(T): No draft specified. Returning undefined.");
				return;
			} else if (T<0 || T>this.attributes.Depth) {
				console.error("Hull.prototype.calculateAttributesAtDraft(T): Draft parameter " + T + "outside valid range of [0,Depth]. Returning undefined.");
			}
			
			let wls = this.halfBreadths.waterlines.map(wl=>this.attributes.Depth*wl);
			
			//This is the part that can be reused as long as the geometry remains unchanged:
			if (this.levelsNeedUpdate) {
				this.levels = [];
				for (let i = 0; i < wls.length; i++) {
					let z = wls[i];
					let lev = levelCalculation(this, z, this.levels[i-1]);			
					//Bottom cap, only on the lowest level:
					if (i === 0) {
						lev.As += lev.Awp;
					}
					this.levels.push(lev);
				}
				this.levelsNeedUpdate = false;
			}
			
			//Find highest data waterline below or at water level:
			let {index, mu} = bisectionSearch(wls, T);
			
			//console.info("Highest data waterline below or at water level: " + index);
			//console.log(this.levels);
			let lc;
			if (mu===0) lc = this.levels[index];
			else lc = levelCalculation(this, T, this.levels[index]);
			
			//Filter and rename for output
			return {
				xcwp: lc.xc, //water plane values
				LCF: lc.xc,
				ycwp: lc.yc,
				Awp: lc.Awp,
				Ixwp: lc.Ix,
				BMt: lc.Ix/lc.Vs,
				Iywp: lc.Iy,
				BMl: lc.Iy/lc.Vs,
				maxXs: lc.maxX, //boundaries of the submerged part of the hull
				minXs: lc.minX,
				maxYs: lc.maxY,
				minYs: lc.minY,
				Cwp: lc.Cwp,
				LWL: lc.LWL,
				LBP: lc.LBP,
				BWL: lc.BWL,
				Ap: lc.Ap, //projected area in length direction
				Cp: lc.Cp, //prismatic coefficient
				//Vbb: lc.Vbb,
				Vs: lc.Vs, //volume of submerged part of the hull
				Cb: lc.Cb,
				Cm: lc.Cb/lc.Cp,
				As: lc.As, //wetted area
				Cv: lc.Cv, //center of buoyancy
				LCB: lc.Cv.x,
				KB: lc.Cv.z
			}
		};
	}(),
	//M is the mass (in kg) of the ship
	calculateDraftAtMass: function(M, epsilon=0.001, rho=1025) {
		let VT = M/rho; //Target submerged volume (1025=rho_seawater)
		//Interpolation:
		let a = 0;
		let b = this.attributes.Depth;             //depth is not draft ¿?                                                                                                                                                                                                                                                              
		let t = 0.5*b;
		while (b-a>epsilon) {
			t = 0.5*(a+b);
			let V = this.calculateAttributesAtDraft(t)["Vs"];
			//console.log(V); //DEBUG
			if (V>VT) b = t;
			else a = t;
		}
		//console.info("Calculated draft: %.2f", t);
		return t;
	}
});