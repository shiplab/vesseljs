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
		console.info("Hull weight:", output);
		return output;
	},
	/*
	Input:
	z: level from bottom of ship (absolute value in meters)
	nanCorrectionMode: 0 to set all NaNs to zero, 1 to output NaNs, set all NaNs to zero, 2 to replace NaNs with interpolated or extrapolated values.	
	*/
	getWaterline: function(z, nanCorrectionMode=1) {
		let ha = this.attributes;
		let zr = z/ha.Depth;
		let wls = this.halfBreadths.waterlines;
		let sts = this.halfBreadths.stations;
		let tab = this.halfBreadths.table;

		let {index: a, mu: mu} = bisectionSearch(wls, zr);
		let wl;
		if (a<0) {
			if (nanCorrectionMode===0) {
				console.warn("getWaterLine: z below lowest defined waterline. Defaulting to zeros.");
				return new Array(sts.length).fill(0);
			}
			if (nanCorrectionMode===1) {
				console.warn("getWaterLine: z below lowest defined waterline. Outputting NaNs.");
				return new Array(sts.length).fill(null);
			}
			else /*nanCorrectionMode===2*/ {
				console.warn("getWaterLine: z below lowest defined waterline. Extrapolating lowest data entry.");
				a=0;
				mu=0;
				//wl = tab[a].slice();
			}			
		} else if (a>/*=*/wls.length-1) {
			if (nanCorrectionMode===0) {
				console.warn("getWaterLine: z above highest defined waterline. Defaulting to zeros.");
				return new Array(sts.length).fill(0);
			}
			if (nanCorrectionMode===1) {
				console.warn("getWaterLine: z above highest defined waterline. Outputting NaNs.");
				return new Array(sts.length).fill(null);
			}
			else /*nanCorrectionMode===2*/ {
				console.warn("getWaterLine: z above highest defined waterline. Proceeding with highest data entry.");
				a = wls.length-2; //if this level is defined...
				mu=1;
				//wl = tab[a].slice();
			}
		}

		//Linear interpolation between data waterlines
		wl = new Array(sts.length);
		for (let j = 0; j < wl.length; j++) {
			if (nanCorrectionMode === 0) {
				if (a+1 > wls.length-1) {
					wl[j] = lerp(tab[a][j], 0, 0.5);
				} else {
					wl[j] = lerp(tab[a][j] || 0, tab[a+1][j] || 0, mu || 0.5);
				}
			} else if (nanCorrectionMode === 1) {
				if (a+1 > wls.length-1) {
					wl[j] = lerp(tab[a][j], null, mu);
				} else {
					wl[j] = lerp(tab[a][j], tab[a+1][j], mu);
				}
			} else {
				//If necessary, sample from below
				let b = a;
				while (b>0 && isNaN(tab[b][j])) {
					b--;
				}
				let lower;
				if (b===0 && isNaN(tab[b][j])) {
					lower = 0;
				} else {
					lower = tab[b][j];
				}
				//If necesary, sample from above
				let c = a+1;
				let upper;
				if (c>wls.length-1) {
					c = b;
					upper = lower;
				} else {
					while (c<wls.length-1 && isNaN(tab[c][j])) {
						c++;
					}
					//now c===wls.length-1 or !isNaN(tab[c][j])
					//unless c>wls.length-1 before the loop.
					if (c===wls.length-1 && isNaN(tab[c][j])) {
						//Fall back all the way to b
						c = b;
						upper = lower;
					} else {
						upper = tab[c][j];
					}
				}
				mu = c===b ? 0 : (a+(mu||0.5)-b)/(c-b);
				wl[j] = lerp(lower, upper, mu);
			}
			
			//Scale numerical values
			if (!isNaN(wl[j])) wl[j] *= 0.5*ha.BOA;
		}

		return wl;
	},
	getStation: function(x) {
		let ha = this.attributes;
		let xr = x/ha.LOA;
		let sts = this.halfBreadths.stations;
		let wls = this.halfBreadths.waterlines;
		let tab = this.halfBreadths.table;

		let {index: a, mu: mu} = bisectionSearch(sts, xr);

		let st;
		if (a<0 || a>=sts.length) st = new Array(wls.length).fill(null);
		else if (a+1===sts.length) st = tab.map(row=>row[wls.length-1]);
		else {
			st = [];
			for (let j = 0; j < wls.length; j++) {
				let after = tab[j][a];
				let forward = tab[j][a+1];
				if (isNaN(after) && isNaN(forward)) {
					st.push(null);
				} else {
					st.push(lerp(after || 0, forward || 0, mu));
				}
			}
		}
		for (let j=0; j<this.halfBreadths.waterlines.length; j++) {
			st[j] *= 0.5*ha.BOA;
			if (isNaN(st[j])) st[j] = null;
		}
		return st;
	},
	
	//THIS is a candidate for causing wrong Ix, Iy values.
	//Much logic that can go wrong.
										//typically deck bounds
	waterlineCalculation: function(z, bounds) {
		let {minX, maxX, minY, maxY} = bounds || {};

		console.groupCollapsed("waterlineCalculation.");
		console.info("Arguments: z=", z, " Boundaries: ", arguments[1]);
		
		let wl = this.getWaterline(z, 0);
		console.info("wl: ", wl); //DEBUG

		let LOA = this.attributes.LOA;
		
		let sts = this.halfBreadths.stations.slice();
		for (let i=0; i < sts.length; i++) {
			sts[i] *= LOA;
		}
		
		let hasMinX = (minX !== undefined);
		let hasMaxX = (maxX !== undefined);
		if (hasMinX || hasMaxX) {
			let first=0;
			let wlpre;
			if (hasMinX) {
				let muf;
				({index: first, mu: muf} = bisectionSearch(sts, minX));
				let lower = wl[first];
				let upper = wl[first+1];
				if (isNaN(lower) && isNaN(upper)) {
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
				if (isNaN(lower) && isNaN(upper)) {
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

		//This does not yet account for undefined minY, maxY. Or does it?
		let port = [], star = [];
		for (let i=0; i<wl.length; i++) {
			if (isNaN(wl[i])) {
				star[i] = minY || null;
				port[i] = maxY || null;
			} else {
				star[i] = Math.max(-wl[i], minY||-wl[i]);
				port[i] = Math.min(wl[i], maxY||wl[i]);
			}
		}
		
		//DEBUG
		console.info("Arguments to sectionCalculation:", sts, star, port);
		
		//sectionCalculation can potentially be served some NaNs.
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
		console.info("Output from waterlineCalculation: ", output);
		console.groupEnd();
		return output;
	},
	//Not done, and not tested
	stationCalculation: function(x/*, {minZ, maxZ, minY, maxY}*/) {
		let wls = this.halfBreadths.waterlines.map(wl=>this.attributes.Depth*wl);
		let port = this.getStation(x);
		let star = port.map(hb=>-hb);
		let sc = sectionCalculation({xs: wls, ymins: star, ymaxs: port});
		return {
			x: x, //or xc? or cg.. Hm.
			yc: sc.yc,
			zc: sc.xc,
			A: sc.A,
			Iz: sc.Ix,
			Iy: sc.Iy,
			maxX: sc.maxX,
			minX: sc.minX,
			maxY: sc.maxY,
			minY: sc.minY
		};
	},
	//Unoptimized, some redundant repetitions of calculations.
	//NOT DONE YET. Outputs lots of NaN values.
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
			
			let wlc = hull.waterlineCalculation(z);
			let lev = {};
			Object.assign(lev, wlc);
			//Projected area calculation (approximate):
			lev.prMinY = wlc.minY || 0;
			lev.prMaxY = wlc.maxY || 0; //|| 0 right?
			lev.Ap = prev.Ap
				+ trapezoidCalculation(prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, lev.z)["A"];
			
			//level bounds are for the bounding box of the submerged part of the hull
			if (!isNaN(prev.minX) && prev.minX<=wlc.minX) 
				lev.minX = prev.minX;
			if (!isNaN(prev.maxX) && prev.maxX>=wlc.maxX) 
				lev.maxX = prev.maxX;
			if (!isNaN(prev.minY) && prev.minY<=wlc.minY) 
				lev.minY = prev.minY;
			if (!isNaN(prev.maxY) && prev.maxY>=wlc.maxY) 
				lev.maxY = prev.maxY;
			lev.Vbb = (lev.maxX-lev.minX)*(lev.maxY-lev.minY)*z;
			
			//Find bilinear patches in the slice, and combine them.
			//Many possibilities for getting the coordinate systems wrong.
			let calculations = [];
			//let wls = hull.halfBreadths.waterlines.map(wl=>wl*hull.attributes.Depth);
			let sts = hull.halfBreadths.stations.map(st=>st*hull.attributes.LOA);
			let wl = hull.getWaterline(z,0);
			let prwl = hull.getWaterline(prev.z,0);
			for (let j = 0; j < sts.length-1; j++) {
				let port = 
					bilinearPatchColumnCalculation(sts[j], sts[j+1], prev.z, z, -prwl[j], -wl[j], -prwl[j+1], -wl[j+1]);
				calculations.push(port);
				let star =
					bilinearPatchColumnCalculation(sts[j], sts[j+1], prev.z, z, prwl[j], wl[j], prwl[j+1], wl[j+1]);
				calculations.push(star);
			}
			let C = combineVolumes(calculations);
			lev.Vs = prev.Vs + C.V; //hull volume below z
			lev.As = prev.As + C.As; //outside surface below z

			//center of volume below z (some potential for accumulated rounding error):
			let Cv = addVec(scaleVec(prev.Cv,prev.Vs),
					scaleVec(C.Cv,C.V));
			let V = prev.Vs+C.V;
			if (V!==0) {
				Cv = scaleVec(Cv, 1/(prev.Vs+C.V));
			}
						//Note switching of yz
			lev.Cv = {x: Cv.x, y: Cv.z, z: Cv.y};
			
			lev.Cb = lev.Vs/lev.Vbb;
			
			return lev;
		}
		
		return function(T) {
			let wls = this.halfBreadths.waterlines.map(wl=>this.attributes.Depth*wl);
			
			//This is the part that can be reused as long as the geometry remains unchanged:
			if (this.levelsNeedUpdate) {
				this.levels = [];
				for (let i = 0; i < wls.length; i++) {
					let z = wls[i];
					let lev = levelCalculation(this, z, this.levels[i-1]);
					this.levels.push(lev);
				}
				this.levelsNeedUpdate = false;
			}
			
			//Find highest data waterline below water:
			let {index: previ} = bisectionSearch(wls, T);
			
			let lc = levelCalculation(this, T, this.levels[previ]);
			
			//Filter and rename for output
			return {
				xcwp: lc.xc,
				ycwp: lc.yc,
				Awp: lc.Awp,
				Ixwp: lc.Ix,
				Iywp: lc.Iy,
				maxXs: lc.maxX, //boundaries of the submerged part of the hull
				minXs: lc.minX,
				maxYs: lc.maxY,
				minYs: lc.minY,
				Cwp: lc.Cwp,
				LWL: lc.LWL,
				LBP: lc.LBP,
				BWL: lc.BWL,
				Ap: lc.Ap,
				//Vbb: lc.Vbb,
				Vs: lc.Vs,
				Cb: lc.Cb,
				As: lc.As,
				Cv: lc.Cv			
			}
		};
	}()
});