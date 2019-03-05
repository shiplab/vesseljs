function parametricWeightHull(K, L, B, T, D, CB, Fn) {

	// Calculates estimated structural weight
	// E is the Lloyd’s Equipment Numeral
	let E = L * (B + T) + 0.85 * L * (D - T);
	// CbCorrected is the estimated corrected block coefficient
	let CBCorrected = CB + (1 - CB) * ((0.8 * D - T) / (3 * T));
	// W is the estimated structural weight
	let W = K * Math.pow(E, 1.36) * (1 + 0.5 * (CBCorrected - 0.7));

	// Calculates LCG and VCG
	// VCGHull is the Vertical Center of Gravity of the hull
	let VCGHull = 0;
	if (L < 120) {
		VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2)) + 0.008 * D * (L / D - 6.5);
	} else {
		VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2));
	}
	// LCB is the longitudinal Center of Buoyancy
	let LCB = Fn ? (L * 0.5 + 9.7 - 45 * Fn) : L * 0.516;
	// LCGHull is the Longitudinal Center of Gravity of the hull
	let LCGHull = LCB - 0.15;

	// Returns the object

	// return {mass: W, cg: {x: LCGHull, y: 0, z: VCGHull}}; //original
	return {
		mass: W
	};
}

function midshipParametricWeight(L, CB) {
	//Pratical Ship Design, Watson, Chapter 4, pg. 94
	// This method is congruent for cb around 0.75
	let Ad = 35; // this is the density (ton/(meter of midship section)) and it must be undefined
	let LMS = 0.75 * L * Ad; //This is the midship secction lenght estimation, needs improviment
	let W = (0.715 * CB + 0.305) * LMS;

	// Returns the object
	return {
		mass: W
	}
}

function quadricubicParametricWeight(L, B, T, D, CB) { //This code shows unpraticle value
	// I found in one slide from "Instituto Superior Técnico", method not well reffered
	// http://www.mar.ist.utl.pt/mventura/Projecto-Navios-I/EN/SD-1.3.1-Estimation%20Methods.pdf slide 43
	// Sato Tankers 150 000t < DWT < 300 000
	let W = 0.00001 * Math.pow(CB / 0.8, 1 / 3) * ((15.33 * L * L * B / D) + (2.56 * L * L * (B + D) * (B + D)));
	// This code don't worked fine with our model. It must be check it out the
	// reference to be sure the formula is corrected and how to fit it to our model
	// prototype

	// Returns the object
	return {
		mass: W
	}
}

function staticalParametricWeight(L, B, T, D, CB) {
	// I found in one slide from "Instituto Superior Técnico", method not well reffered
	// http://www.mar.ist.utl.pt/mventura/Projecto-Navios-I/EN/SD-1.3.1-Estimation%20Methods.pdf slide 45
	// Almeida
	let k1 = 0.0361;
	let k2 = 1.6;
	let k3 = 1;
	let k4 = 0.22;
	let W = k1 * Math.pow(L, k2) * Math.pow(B, k3) * Math.pow(D, k4);

	// Returns the object
	return {
		mass: W
	}
}

function inLandParametricWeight(L, B, T, D, CB) {
	//A parametric method for preliminary determining of mass characteristics of inland navigation ships, Jan P. Michalski, Polish Maritime Reserch, No . 3/2005
	//formula special for inland ships
	// I used formula for liquid cargo ships
	let R = 3; // constant refered to polish restriction combineAreas: 1, 2 or 3
	let W = 0.0631615 * Math.pow(L, 1.43625) * Math.pow(B, 0.973853) * Math.pow(D, -0.190530) * Math.pow(T, 0.150033) * Math.pow(CB, 0.154456) * Math.pow(R, -0.264760)

	// Returns the object
	return {
		mass: W
	}
}

function getWeightTest(designState) {
	// let ha = this.attributes; //This was the previous
	let ha = designState.structure.hull.attributes; //This is the new example @ferrari212
	let B = ha.BOA;
	let D = ha.Depth;
	let cp = designState.designState.calculationParameters;
	let K = cp.K;
	let L = cp.LWL_design;
	let T = cp.Draft_design;
	let Cb = cp.Cb_design;
	let vsm = 0.514444 * cp.speed; // Convert the design speed from knots to m/s
	let Fn = vsm / Math.pow(9.81 * L, 0.5); // Calculates Froude number

	//This is not a good way to estimate the hull weight.
	let output = [];
	output[0] = parametricWeightHull(K, L, B, T, D, Cb, Fn);
	// parsons.mass *= 1000; //ad hoc conversion to kg, because the example K value is aimed at ending with tonnes.

	// I used L = LWL in some formular where it is ideal to use LOA, but the differece
	// Is not so big and I decided to let with less variables in the code
	output[1] = midshipParametricWeight(L, Cb);
	output[2] = quadricubicParametricWeight(L, B, T, D, Cb);
	output[3] = staticalParametricWeight(L, B, T, D, Cb);
	output[4] = inLandParametricWeight(L, B, T, D, Cb);

	console.info("Hull weight 1:", output[0]);
	console.info("Hull weight 2:", output[1]);
	console.info("Hull weight 3:", output[2]);
	console.info("Hull weight 4:", output[3]);
	console.info("Hull weight 5:", output[4]);
	return output;
}