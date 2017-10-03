//@EliasHasle

/*When having a class for this, the specification can possibly be in one of several formats, and the handling will be contained in this class.

I have tried to remove the dependency on the vessel object here. This is in order to be able to optimize updates.

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
	getWaterline: function(z) {
		let ha = this.attributes;
		let zr = z/ha.Depth;
		let wls = this.halfBreadths.waterlines;
		let sts = this.halfBreadths.stations;
		let tab = this.halfBreadths.table;

		let {index: a, mu: mu} = bisectionSearch(wls, zr);
		let wl;
		if (a<0) wl = new Array(sts.length).fill(null);
		else if (a+1>=wls.length) wl = tab[wls.length-1].slice();
		else {
			//Linear interpolation between data waterlines
			wl = [];
			for (let j = 0; j < sts.length; j++) {
				let lower = tab[a][j];
				let upper = tab[a+1][j];
				if (isNaN(lower) && isNaN(upper)) wl.push(null);
				else wl.push(lerp(lower || 0, upper || 0, mu));
			}
		}
		
		//Scale numerical values
		for (let j=0; j<wl.length; j++) {
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
										//typically deck bounds
	waterlineCalculation: function(z, bounds) {
		let {minX, maxX, minY, maxY} = bounds || {};

		console.groupCollapsed("waterlineCalculation.");
		console.info("Arguments: z=", z, " Boundaries: ", arguments[1]);
		
		let wl = this.getWaterline(z);
		console.info("wl: ", wl); //DEBUG

		let LOA = this.attributes.LOA;
		//let BOA = this.attributes.BOA;
		
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
		console.info("Arguments to sectionCalculation:",sts, star, port);
		
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
		let levels; //level calculations
		
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
			let wls = hull.halfBreadths.waterlines.map(wl=>wl*hull.attributes.Depth);
			let sts = hull.halfBreadths.stations.map(st=>st*hull.attributes.LOA);
			let wl = hull.getWaterline(z);
			let prwl = hull.getWaterline(prev.z);
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
			let {x: xc, y: zc, z: yc} = scaleVec(
				addVec(scaleVec(prev.Cv,prev.Vs),
					scaleVec(C.Cv,C.V)),
				1/(prev.Vs+C.V));
			lev.Cv = {x: xc, y: yc, z: zc};
			
			return lev;
		}
		
		return function(T) {
			let wls = this.halfBreadths.waterlines;
			//let sts = this.halfBreadths.stations;
			//let hbs = this.halfBreadths.table;
			
			//This is the part that can be reused as long as the geometry remains unchanged:
			levels = [];
			for (let i = 0; i < wls.length; i++) {
				let z = wls[i];
				let lev = levelCalculation(this, z, levels[i-1]);
				levels.push(lev);
			}
			
			//Find highest data waterline below water:
			let {index: previ} = bisectionSearch(wls, T);
			
			let lc = levelCalculation(this, T, levels[previ]);
			
			//It is a bit problematic that some parts of the output really refer to the water plane, not to the whole submerged volume, without that being apparent.
			return lc;
		};
	}(),/*,
	//Removed because of circular dependency. This kind of calculation should be in vessel instead, to facilitate caching.
	calculateAttributes() {
		this.calculateAttributesAtDraft(this.vessel.calculateDraft());
	}*/
});