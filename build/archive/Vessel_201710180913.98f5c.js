//Vessel.js library, built 2017-10-18 09:13:35.951607, Checksum: 98f5cf6e023f4efb329738cead04ff77
/*
Import like this in HTML:
<script src="Vessel.js"></script>
Then in javascript use classes and functions with a ShipDesign prefix. Example:
let ship = new Vessel.Ship(someSpecification);
*/

"use strict";

var Vessel = {};
(function() {
//@EliasHasle

//Some small helpers for operations on 3D vectors
//A vector is simply defined as an object with properties x,y,z.
//Written by Elias Hasle

function scaleVec(v, s) {
	return {x: s*v.x, y: s*v.y, z: s*v.z};
}

function vecNorm(v) {
	return Math.sqrt(v.x**2+v.y**2+v.z**2);
}

function normalizeVec(v) {
	let l = vectorLength(v);
	return {x: v.x/l, y: v.y/l, z: v.z/l};
}

function vecNormSquared(v) {
	return v.x**2+v.y**2+v.z**2;
}

function addVec(u,v, ...rest) {
	if (rest.length > 0) return sumVec([u,v]+rest);
	return {x: u.x+v.x, y: u.y+v.y, z: u.z+v.z};
}

function sumVec(vectors) {
	let S = {x:0, y:0, z:0};
	for (let i = 0; i < vectors.length; i++) {
		let v = vectors[i];
		S.x += v.x;
		S.y += v.y;
		S.z += v.z;
	}
	return S;
}

function dotProduct(u,v) {
	return u.x*v.x + u.y*v.y + u.z*v.z;
}

function crossProduct(u,v) {
	return {
		x: u.y*v.z-u.z*v.y,
		y: u.z*v.x-u.x*v.z,
		z: u.x*v.y-u.y*v.x
	};
}//@EliasHasle

//Some interpolation helpers. Only linear and bilinear for now.

//linear interpolation
//Defaults are not finally decided
//returns NaN if a and b are NaN or mu is NaN.
function lerp(a, b, mu=0.5) {
	if (isNaN(a)) return b;
	if (isNaN(b)) return a;
	return (1-mu)*a+mu*b;
}

//Test. Not safe yet.
function linearFromArrays(xx, yy, x) {
	let {index, mu} = bisectionSearch(xx, x);
	if (index === undefined || mu === undefined) return 0;
	return lerp(yy[index], yy[index+1], mu);	
}

/*Function that takes a sorted array as input, and finds the last index that holds a numerical value less than, or equal to, a given value.
Returns an object with the index and an interpolation parameter mu that gives the position of value between index and index+1.
*/
function bisectionSearch(array, value) {
	if (value < array[0]) {
		console.warn("bisectionSearch: requested value below lowest array element. Returning undefined.");
		return {index: undefined, mu: undefined};
	}
	let index = 0, upper = array.length;
	while (upper > index+1) {
		let c = Math.floor(0.5*(index+upper));
		if (array[c] === value) return {index: c, mu: 0};
		else if (array[c] < value) index = c;
		else upper = c;
	}
	/*if (index === array.length) {
		console.error("bisectionSearch: index===array.length. This should never happen.");
	}*/
	let mu = (value-array[index])/(array[index+1]-array[index]);
	if (index === array.length-1) {
		console.warn("bisectionSearch: Reached end of array. Simple interpolation will result in NaN.");
		mu = undefined;
	}
	return {index, mu};
}

function bilinearUnitSquareCoeffs(z00, z01, z10, z11) {
	let a00 = z00;
	let a10 = z10-z00;
	let a01 = z01-z00;
	let a11 = z11+z00-z01-z10;
	return [a00,a10,a01,a11];
}

function bilinearUnitSquare(z00, z01, z10, z11, mux, muy) {
	let [a00, a10, a01, a11] = bilinearUnitSquareCoeffs(z00, z01, z10, z11);
	return a00 + a10*mux + a01*muy + a11*mux*muy;
}

//Find coefficients for 1, x, y, xy.
//This doesn't yet handle zero-lengths well.
function bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22) {
	let X = (x2-x1);
	let Y = (y2-y1);
	
	if (X===0 || Y=== 0) {
		console.warn("bilinearCoeffs: Zero base area. Setting coefficients to zero.");
		return [0,0,0,0];
	}
	
	let Ainv = 1/(X*Y);

	//constant coeff:
	let b00 = Ainv*(z11*x2*y2 - z21*x1*y2 - z12*x2*y1 + z22*x1*y1);
	//x coeff:
	let b10 = Ainv*(-z11*y2 + z21*y2 + z12*y1 - z22*y1);
	//y coeff:
	let b01 = Ainv*(-z11*x2 + z21*x1 + z12*x2 -z22*x1);
	//xy coeff:
	let b11 = Ainv*(z11-z21-z12+z22);
	
	return [b00,b10,b01,b11];
}

//Maybe I could do some simple linear interpolation in collapsed cases.
//But then I have to be sure what the z values and coefficients mean.
//I have apparently not documented this well.
function bilinear(x1, x2, y1, y2, z11, z12, z21, z22, x, y) {
	let [b00, b10, b01, b11] = 
		bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22);
	return b00 + b10*x + b01*y + b11*x*y;
	//The following is supposed to be equivalent. Maybe I should compare, to make sure that the current calculation is correct.
	/*let mux = (x-x1)/(x2-x1);
	let muy = (y-y1)/(y2-y1);
	return bilinearUnitSquare(z11, z12, z21, z22, mux, muy);*/
}
//@EliasHasle

//All inputs are numbers. The axes are given by a single coordinate.
function steiner(I, A, sourceAxis, targetAxis) {
	return I + A*(sourceAxis-targetAxis)^2;
}

//Calculate area, center, Ix, Iy.
function trapezoidCalculation(xbase0, xbase1, xtop0, xtop1, ybase, ytop) {
	let a = xbase1-xbase0;
	let b = xtop1-xtop0;
	let h = ytop-ybase;
	if (a<0 || b<0 || h<0) {
		console.warn("trapezoidCalculation: Unsupported input. Possibly not a valid trapezoid.");
	}
	let A = 0.5*(a+b)*h;
	let yc = (a==0 && b==0) ? ybase+0.5*h : ybase + h*(2*a+b)/(3*(a+b));
	let d = xbase0+0.5*a; //shorthand
	let xc = h===0 ? 0.25*(xbase0+xbase1+xtop0+xtop1) : d + (xtop0+0.5*b-d)*(yc-ybase)/h;
	let Ix = (a==0 && b== 0) ? 0 : h^3*(a^2+4*a*b+b^2)/(36*(a+b));

	//For Iy I must decompose (I think negative results will work fine):
	let Art1 = 0.5*(xtop0-xbase0)*h;
	let xcrt1 = xbase0 + (xtop0-xbase0)/3;
	let Iyrt1 = (xtop0-xbase0)^3*h/36;
	let Arec = (xbase1-xtop0)*h;
	let xcrec = 0.5*(xtop0+xbase1);
	let Iyrec = (xbase1-xtop0)^3*h/12;
	let Art2 = 0.5*(xbase1-xtop1)*h;
	let xcrt2 = (xtop1 + (xbase1-xtop1)/3);
	let Iyrt2 = (xbase1-xtop1)^3*h/36;

	let Iy = steiner(Iyrt1, Art1, xcrt1, xc)
		+ steiner(Iyrec, Arec, xcrec, xc)
		+ steiner(Iyrt2, Art2, xcrt2, xc);
	
	let maxX = Math.max.apply(null, [xbase0, xbase1, xtop0, xtop1]);
	let minX = Math.min.apply(null, [xbase0, xbase1, xtop0, xtop1]);
	let maxY = Math.max(ybase, ytop);
	let minY = Math.min(ybase, ytop);
	
	return {A: A, xc: xc, yc: yc, Ix: Ix, Iy: Iy, maxX: maxX, minX: minX, maxY: maxY, minY: minY};
}

function combineAreas(array) {
	let A = 0;
	let xc = 0;
	let yc = 0;
	let maxX = 0, minX = 0, maxY = 0, minY = 0;
	let L = array.length;
	for (let i = 0; i < L; i++) {
		let e = array[i];
		A += e.A;
		xc += e.xc*e.A;
		yc += e.yc*e.A;
		if (!isNaN(e.maxX) && e.maxX>maxX)
			maxX = e.maxX;
		if (!isNaN(e.minX) && e.minX<minX)
			minX = e.minX;
		if (!isNaN(e.maxY) && e.maxY>maxY)
			maxY = e.maxY;
		if (!isNaN(e.minY) && e.minY<minY)
			minY = e.minY;
	}
	let Ix = 0;
	let Iy = 0;
	
	if (A!==0) {
		xc /= A;
		yc /= A;
	} else {
		console.warn("Zero area combination.");
		xc /= L;
		yc /= L;
	}

	for (let i = 0; i < array.length; i++) {
		let e = array[i];
		Ix += steiner(e.Ix, e.A, e.yc, yc);
		Iy += steiner(e.Iy, e.A, e.xc, xc);
	}
	
	return {A: A, xc: xc, yc: yc, Ix: Ix, Iy: Iy, maxX: maxX, minX: minX, maxY: maxY, minY: minY};
}

//x and y here refers to coordinates in the plane that is being calculated on.
function sectionCalculation({xs, ymins, ymaxs}) {
	console.groupCollapsed("sectionCalculation");
	console.info("Arguments (xs, ymins, ymaxs): ", arguments[0]);
	
	//Needed for Cwp (not a very efficient calculation, maybe):

	let calculations = [];
	for (let i = 0; i < xs.length-1; i++) {
		let xbase = xs[i];
		let xtop = xs[i+1];
		let ybase0 = ymins[i] || 0;
		let ybase1 = ymaxs[i] || 0;
		let ytop0 = ymins[i+1] || 0;
		let ytop1 = ymaxs[i+1] || 0;
		
		calculations.push(trapezoidCalculation(ybase0, ybase1, ytop0, ytop1, xbase, xtop));
	}
	
	let C = combineAreas(calculations); //Might be zero areas!

	let output = {A: C.A, maxX: C.maxY, minX: C.minY, maxY: C.maxX, minY: C.minX, xc: C.yc, yc: C.xc, Ix: C.Iy, Iy: C.Ix, Abb: (C.maxY-C.minY)*(C.maxX-C.minX)};
	console.info("Output: ", output);
	console.groupEnd();
	return output;
}//@EliasHasle

function bilinearPatchColumnCalculation(x1, x2, y1, y2, z11, z12, z21, z22) {
	let X = x2-x1;
	let Y = y2-y1;
	let [a00, a10, a01, a11] = bilinearUnitSquareCoeffs(z11, z12, z21, z22);
	/*
	From here I call mux for x, and muy for y.
	Integral over unit square:
	INT[x from 0 to 1, INT[y from 0 to 1, (a00 + a10*x + a01*y + a11*x*y) dy] dx]
	= INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x) dx]
	= a00 + 0.5*a10 + 0.5*a01 + 0.25*a11
	*/
	let Ab = X*Y;
	let zAvg = (a00 + 0.5*a10 + 0.5*a01 + 0.25*a11);
	let V = Math.abs(Ab*zAvg); //new: absolute value
	let zc = 0.5*zAvg;
	/*
	To find xc, I need to integrate x*z over the unit square, and scale and translate to world coordinates afterwards:
	INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x)*x dx]
	= 0.5*a00 + a10/3 + 0.25*a01 + a11/6
	Scale and translate:*/
	let xc = y1 + X*(0.5*a00 + a10/3 + 0.25*a01 + a11/6)
	
	//Similar for yc:
	let yc = y1 + Y*(0.5*a00 + 0.25*a10 + a01/3 + a11/6)
	
	//new: absolute value (OK?)
	let As = Math.abs(bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22));
	
	return {Ab: Ab, As: As, V: V, Cv: {x: xc, y: yc, z: zc}};
}

//Input: array of objects with calculation results for elements.
//Output: the combined results.
function combineVolumes(array) {
	let V = 0;
	let As = 0;
	let Cv = {x:0, y:0, z:0};
	let L = array.length;
	if (L===0) return {V,As,Cv};
	for (let i = 0; i < L; i++) {
		let e = array[i];
		V += e.V;
		As += e.As; //typically wetted area
		Cv.x += e.Cv.x*e.V;
		Cv.y += e.Cv.y*e.V;
		Cv.z += e.Cv.z*e.V;
	}
	//Safe zero check?
	if (V!==0) {
		Cv.x /= V;
		Cv.y /= V;
		Cv.z /= V;
	} else {
		console.warn("Zero volume combination.");
		Cv.x /= L;
		Cv.y /= L;
		Cv.z /= L;
	}
	
	return {V,As,Cv};//{V: V, As: As, Cv: Cv};
}

//For wetted area. I think this is right, but it is not tested.
function bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22, segs=10) {
	let [b00,b10,b01,b11] = bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22);
	/*
	z(x,y) = b00 + b10*x + b01*y + b11*xy
	Partial derivative in x: b10 + b11*y
	Partial derivative in y: b01 + b11*x
	I think this will be right:
	Tx(y) = (1, 0, b10+b11*y)
	Ty(x) = (0, 1, b01+b11*x)
	Then:
	Tx X Ty = (-(b10+b11*y), -(b01+b11*x), 1)
	|Tx X Ty| = sqrt((b10+b11*y)^2 + (b01+b11*x)^2 + 1)
	
	Wolfram Alpha gave me this for the inner integral using x (indefinite):
	integral sqrt((b01 + b11 x)^2 + 1 + (b10+b11*y)^2) dx = ((b01 + b11*x) sqrt((b01 + b11*x)^2 + 1 + (b10+b11*y)^2) + (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x))/(2*b11) + constant
	That means this for the definite integral:
	((b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + 1 + (b10+b11*y)^2*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2))/(2*b11) - ((b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1))/(2*b11)
	=
	(b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2)/(2*b11)
	+(1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2)/(2*b11))
	- (b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2)/(2*b11)
	- (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1)/(2*b11)
	=
	(b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2)/(2*b11)
	- (b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2)/(2*b11)
	+(1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2)/(2*b11))
	- (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1)/(2*b11)
	
	The two first integrals are similar, and the two last are also similar. With A=+-(b01 + b11*xi)/(2*b11), B=(b01 + b11*xi)^2+1, C=b10 and D=b11 (where xi represents either x1 or x2, and +- represents + for x2 and - for x1), I can calculate the integral of sqrt(B+(C+D*y)^2) and multiply by A. That integral is on the same form as the first one.
	
	The two last integrals can be represented by setting A=+-1/(2*b11), B=(b01 + b11*xi)^2+1, C=b01+b11*xi, D=b10, E=b11, and calculating the integral of (1+(D+E*y)^2)*ln(sqrt(B+(D+E*y)^2)+C), and multiplying by A.
	Here is the integration result from Wolfram Alpha:
	integral(1 + (D + E y)^2) log(sqrt(B + (D + E y)^2) + C) dy = (-(6 (B^2 - 2 B C^2 - 3 B + C^4 + 3 C^2) tan^(-1)((D + E y)/sqrt(B - C^2)))/sqrt(B - C^2) + (6 (B^2 - 2 B C^2 - 3 B + C^4 + 3 C^2) tan^(-1)((C (D + E y))/(sqrt(B - C^2) sqrt(B + (D + E y)^2))))/sqrt(B - C^2) + 6 (B - C^2 - 3) (D + E y) + 3 C (-3 B + 2 C^2 + 6) log(sqrt(B + (D + E y)^2) + D + E y) + 3 C (D + E y) sqrt(B + (D + E y)^2) + 6 ((D + E y)^2 + 3) (D + E y) log(sqrt(B + (D + E y)^2) + C) - 2 (D + E y)^3)/(18 E) + constant

	I am glad I did not try to do this by hand. But combining these formulae, we can get an exact integral of the area of a bilinear patch. Later. Bilinear patches are not an exact representation anyway. We may opt for something else.
	*/
	
	//Simple numerical calculation of double integral:
	let A = 0;
	let X = x2-x1, Y = y2-y1;
	let N = segs, M = segs;
	for (let i = 0; i < N; i++) {
		let x = x1 + ((i+0.5)/N)*X;
		for (let j = 0; j < M; j++) {
			let y = y1 + ((j+0.5)/M)*Y;
			A += Math.sqrt((b10+b11*y)**2 + (b01+b11*x)**2 + 1);
		}
	}
	A *= X*Y/(N*M); //dx dy
	
	return A;
}//@MrEranwe
//@EliasHasle

"use strict";
//Elias notes:
//LCB and LCG were obviously considered in another coordinate system than we are using. I have corrected this, assuming that the wrong coordinate system had the origin centered longitudinally.
//The hull mass is off by several orders of magnitude. Checking the paper, it seems likely that the "typical" K parameters are aimed at producing units of tonnes, not kg.
//It is not mathematically correct to strip down the structural weight calculation the way it is done here, because the exponentiation (E^1.36) cannot be simply decomposed as a sum of exponentiated terms (with the same exponent).
//Elias has only reviewed and modified the hull weight calculation.

// This function estimates the structural weight of the hull. This includes the weight of the basic hull to its depth amidships.

// It is based on Watson and Gilfillan modeling approach using a specific modification of the Lloyd’s Equipment Numeral E as the independent variable.
//
//
// Inputs
// K is the structural weight coefficient. Parsons, chapter 11, table 11.VII.
// L is LWL or LBP
// B is molded beam
// T is molded draft
// D is molded depth
// Superstructures and shiphouses are not being considered in the weight
// CB is the block coefficient
// LCB is the Longitudinal Center of Bouyancy
//
// Return
// It returns an object on the format {mass:1234, cg: {x:4,y:3,z:2}}, where the unit of mass is unclear, and x,y,z is in meters from aft,center,bottom, respectively.
	 
 function parametricWeightHull(K, L, B, T, D, CB, Fn){
	 
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
	 if (L < 120){
		 VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2)) + 0.008 * D * (L / D - 6.5);
	 }
	 else {
		  VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2));
	 }
     // LCB is the longitudinal Center of Buoyancy
     let LCB = Fn ? (L*0.5 + 9.7 - 45 * Fn) : L * 0.516;
	 // LCGHull is the Longitudinal Center of Gravity of the hull
	 let LCGHull = LCB - 0.15;
	 
	 // Returns the object
	 
	 return {mass: W, cg: {x: LCGHull, y: 0, z: VCGHull}};
	 }

// This function estimates the remainder of the Dead Ship Weight. It includes the fuel, the lube oil, the fresh water, the crew and the provisions and stores.
//
//
// Inputs
// Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
// LBP is the Lenght Between Perpendiculars.
// D is molded depth
//
// Return
// It returns an object with the properties mass.
	 
 function parametricWeightDeadweight(SFR, MCR, speed, person, day){
	 
	 // Calculates estimated  weight
	 let Wfo = SFR * MCR * speed * 1.1;  // Fuel oil Weight
     let Wlo = 0;                        // Lube oil Weight
     if (speed > 10){
         Wlo = 15;
     }
     else {
         Wlo = 20
     }
     let Wfw = 0.17 * person;            // Weight of fresh water
     let Wce = 0.17 * person;            // Weight of crew and effects
     let Wpr = 0.01 * person * day;      // Weight of provisions and stores
     let W = Wfo + Wlo + Wfw + Wce + Wpr; // Total weigth
     
     
     // VCGOut is the Vertical Center of Gravity of the Deadweight. Depends on designer
	 // LCGOut is the Longitudinal Center of Gravity of the Deadweight. Depends on designer
	      
	 // Returns the object
	 
	 return {mass: W};
	 }

// This function estimates the structural weight of the machinery, main engine(s) and the remainder of the machinery weight. 
//
//
// Inputs
// MCR is the total capacity of all generators in kW.
// hdb is the innerbootom height of the engine room
// Der is the height og the overhead of the engine room
// L is LWL or LBP
// B is molded beam
// T is molded draft
//
// Return
// It returns an object with the properties mass and the VCG.
	 
 function parametricWeightMachinery(MCR, hdb, Der, B, T, L, test){
	 // Calculates estimated machinery weight
	 let W = 0.72 * Math.pow(MCR, 0.78);
	 // Calculates LCG and VCG	 
     
     // req1 and req2 are the Coast Guard requirements for the hdb
     let req1 = (32 * B + 190 * Math.sqrt(T)) / 1000;
     let req2 = (45.7 + 0.417 * L) / 100;
     let reqmax = Math.max(req1, req2, hdb);
     
     // VCGMach is the Vertical Center of Gravity of the machinery
	 let VCGMach = hdb + 0.35 * (Der - hdb); 
     
	 // LCGMach is the Longitudinal Center of Gravity of the machinery. Depends on designer
	      
	 // Returns the object
	 
	 return {mass: W, VCG: VCGMach};
	 }
	 

// This function estimates the remainder of the Light Ship Weight. It includes outfit: electrical plant, distributive auxiliary systems and hull engineering: bits, chocks, hatch covers...
//
//
// Inputs
// Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
// LBP is the Lenght Between Perpendiculars.
// D is molded depth
//
// Return
// It returns an object with the properties mass and VCG.
	 
 function parametricWeightOutfit(Co, LBP, D){
	 
	 // Calculates estimated  weight
	 let W = Co * LBP;
     
     // VCGOut is the Vertical Center of Gravity of the outfits
     let VCGOut = 0;
     if (LBP < 125){
         VCGOut = D + 1.25
     }
     else if (LBP < 250){
         VCGOut = D + 1.25 + 0.01 * (LBP - 125)
     }
     else {
         VCGOut = D + 2.5
     }
     
	 // LCGOut is the Longitudinal Center of Gravity of the Outfits. Depends on designer
	      
	 // Returns the object
	 
	 return {mass: W, VCG: VCGOut};
	 }//@EliasHasle

//Very unoptimized for now.
function combineWeights(array) {
	let M = array.reduce((sum,e)=>sum+e.mass,0);
	let cgms = array.map(e=>scaleVec(e.cg, e.mass));
	let CG = scaleVec(sumVec(cgms), 1/M);
	
	return {mass: M, cg: CG};
}//@EliasHasle

/*Base class for objects that are constructed from 
a literal object, (//or optionally from a JSON string).

Constructors can take more parameters than the specification, but the specification must be the first parameter.

setFromSpecification will typically be overridden by derived classes. Overriding implementations will typically do some sanity checking.

getSpecification will also typically be overridden. The default implementation here is just a sketch. Maybe not even correct for the simplest subclasses.

Maybe this can be improved by implementing fromJSON and to toJSON methods.
*/

function JSONSpecObject(specification) {
	if (specification === null) {
		console.warn("JSONSpecObject: null specification provided. Defaulting to empty specification.");
		specification = {};
	}
	else if (typeof specification === "object") {}
	/*else if (typeof specification === "string") {
		try {
			specification = JSON.parse(specification);
		} catch(e) {
			console.error("JSONSpecObject: "+ e.message + "\n Defaulting to empty specification.");
			specification = {};
		}
	}*/
	else {
		if (typeof specification !== "undefined") {
			console.error("JSONSpecObject: Invalid constructor parameter. Defaulting to empty specification.");
		}
		specification = {};
	}
	this.setFromSpecification(specification);
}
JSONSpecObject.prototype = Object.create(Object.prototype);
Object.assign(JSONSpecObject.prototype, {
	constructor: JSONSpecObject,
	setFromSpecification: function(specification) {
		//No sanity checking by default.
		Object.assign(this, specification);
	},
	getSpecification: function() {
		let spec = {};
		for (k of Object.keys(this)) {
			if (this.hasOwnProperty(k)) spec[k] = this[k];
		}
		return spec;
	},
	toJSON: function() {
		//First test:
		return JSON.stringify(this);
	}
});//@EliasHasle

/*
Notes:
For calculated values, I envision a lazy calculation pattern, where all properties involved in calculations are only accessed by specialized getters and setters, and calculated properties have some kind of needsUpdate flag or version number (that is set by any setters that will directly or indirectly affect the property). When, and only when, running the getter for the given property, the flag/version is checked, and if false (same version as in cache) the getter just returns the stored value. If true, the getter starts the calculation of the value, invoking other getters.

Suggested calculations to do:
- Resistance at given speed (based on Holtrop).
- Inertia matrix (will need more detailed properties of parts).
*/

function Ship(specification) {
	JSONSpecObject.call(this,specification);
}
Ship.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(Ship.prototype, {
	constructor: Ship,
	setFromSpecification: function(specification) {
		this.attributes = specification.attributes || {};
		this.structure = new Structure(specification.structure,this);
		//baseObjects and derivedObjects are arrays in the specification, but are objects (hashmaps) in the constructed ship object:
		this.baseObjects = {};
		for (let i = 0; i < specification.baseObjects.length; i++) {
			let os = specification.baseObjects[i];
			this.baseObjects[os.id] = new BaseObject(os);
		}
		
		this.derivedObjects = {};
		for (let i = 0; i < specification.derivedObjects.length; i++) {
			let os = specification.derivedObjects[i];
			this.derivedObjects[os.id] = new DerivedObject(os, this.baseObjects);
		}
		
		this.designState = new ShipState(specification.designState);
	},
	getSpecification: function() {
		let specification = {};
		specification.attributes = this.attributes;
		specification.structure = this.structure.getSpecification();

		specification.baseObjects = Object.values(this.baseObjects).map(o=>o.getSpecification());
		specification.derivedObjects = Object.values(this.derivedObjects).map(o=>o.getSpecification());

		specification.designState = this.designState.getSpecification();

		return specification;
	},
	getWeight: function(shipState) {
		shipState = shipState || this.designState;

		let components = [];
		
		components.push(
			this.structure.getWeight(this.designState)
		);
		
		//DEBUG
		console.log(components);

		for (let o of Object.values(this.derivedObjects)) {
			components.push(o.getWeight(shipState));
		}

		var W = combineWeights(components);
		console.info("Calculated weight object: ", W);
		return W;
	},
	calculateDraft(shipState, epsilon=0.001) {
		let w = this.getWeight(shipState);
		let M = w.mass;
		let VT = M/1025; //Target submerged volume (1025=rho_seawater)
		//Interpolation:
		let a = 0;
		let b = this.structure.hull.attributes.Depth;
		let t = 0.5*b;
		while (b-a>epsilon) {
			t = 0.5*(a+b);
			let V = this.structure.hull.calculateAttributesAtDraft(t)["Vs"];
			console.log(V); //DEBUG
			if (V>VT) b = t;
			else a = t;
		}
		console.info("Calculated draft: %.2f", t);
		return t;
	},
	//Should separate between longitudinal and transverse GM too
    calculateStability(shipState){
        let T = this.calculateDraft(shipState);
        let ha = this.structure.hull.calculateAttributesAtDraft(T);
        let vol = ha.Vs;
        if (vol === 0){
            let Lwl = this.designState.calculationParameters.LWL_design;
            let B = this.structure.hull.attributes.BOA;
            let cb = this.designState.calculationParameters.Cb_design;
            vol = Lwl * B * T * cb;
        }
        let KG = this.getWeight(shipState).cg.z;
        let I = ha.Iywp;
        let KB = 0.52 * T;
        let BM = I / vol;
        let GM = KB + BM - KG;
        return {GM, KB, BM, KG};
	}
});//@EliasHasle

function Structure(spec, ship) {
	this.ship = ship;
	JSONSpecObject.call(this, spec);
}
Structure.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(Structure.prototype, {
	setFromSpecification: function(spec) {
		this.hull = new Hull(spec.hull/*, this.ship*/);
		this.decks = spec.decks;/*{};
		let dspecs = spec.decks;
		let decks = this.decks;
		let dnames = Object.keys(dspecs);
		for (let i = 0; i < dnames.length; i++) {
			let name = dnames[i];
			let dspec = dspecs[name];
			decks[name] = new Deck(dspec,this.ship);
		}*/
		this.bulkheads = spec.bulkheads;/*{};
		let bhspecs = spec.bulkheads;
		let bulkheads = this.bulkheads;
		let bhnames = Object.keys(bhspecs);
		for (let i = 0; i < bhnames.length; i++) {
			let name = bhnames[i];
			let bhspec = bhspecs[name];
			bulkheads[name] = new Bulkhead(bhspec,this.ship);
		}*/	
	},
	getSpecification: function() {
		let spec = {
			hull: this.hull.getSpecification(),
			decks: this.decks,
			bulkheads: this.bulkheads
		};/*{decks: {}, bulkheads: {}};
		
		spec.hull = this.hull.getSpecification();
		
		let sd = spec.decks;
		let dk = Object.keys(this.decks);
		for (let i = 0; i < dk.length; i++) {
			sd[dk[i]] = this.decks[dk[i]].getSpecification();
		}
		
		let sbh = spec.bulkheads;
		let bhk = Object.keys(this.bulkheads);
		for (let i = 0; i < bhk.length; i++) {
			sbh[bhk[i]] = this.bulkheads[bhk[i]].getSpecification();
		}*/
		
		return spec;
	},
	//Alejandro is working on a more proper calculation of this
	getWeight: function(designState) {
		let components = [];
		//Hull
		components.push(this.hull.getWeight(designState));
		
		//structure:
		let decks = Object.values(this.decks);
		for (let i=0; i < decks.length; i++) {
			let d = decks[i];
			let zc = d.zFloor+0.5*d.thickness;
			let yc = d.yCentre;
			let b = d.breadth;
			let wlc = this.hull.waterlineCalculation(zc, {minX: d.xAft, maxX: d.xFwd, minY: yc-0.5*b, maxY: yc+0.5*b});
			components.push({
				//approximation
				mass: wlc.Awp*d.thickness*d.density,
				cg: {
					x: wlc.xc,
					y: wlc.yc,
					z: zc
				}
			});
		}
		
		let bulkheads = Object.values(this.bulkheads);
		for (let i=0; i < bulkheads.length; i++) {
			let bh = bulkheads[i];
			let xc = bh.xAft+0.5*bh.thickness;
			let sc = this.hull.stationCalculation(xc);
			components.push({
				//approximation
				mass: sc.A*bh.thickness*bh.density,
				cg: {
					x: xc,
					y: sc.yc,
					z: sc.zc
				}
			});	
		}
		
		let output = combineWeights(components);
		console.info("Total structural weight: ", output);
		return output;
	}
});//@EliasHasle

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
});//@EliasHasle

/*
Depends on JSONSpecObject.js
*/

function BaseObject(specification) {
	this.weightCache = {};
	JSONSpecObject.call(this,specification);
}
BaseObject.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(BaseObject.prototype, {
	constructor: BaseObject,
	setFromSpecification: function(spec) {
		this.id = spec.id;
		this.affiliations = spec.affiliations || {};
		this.boxDimensions = spec.boxDimensions || {length: undefined, width: undefined, height: undefined};
		this.weightInformation = spec.weightInformation;
		this.cost = spec.cost || {currency: undefined, value: undefined};
		this.capabilities = spec.capabilities || {};
		this.file3D = spec.file3D;
		this.baseState = spec.baseState;
	},
	getSpecification: function() {
		return {
			id: this.id,
			affiliations: this.affiliations,
			boxDimensions: this.boxDimensions,
			weightInformation: this.weightInformation,
			cost: this.cost,
			capabilities: this.capabilities,
			file3D: this.file3D,
			baseState: this.baseState
		};
	},
	//Maybe this will take more state parameters than just fullness.
	getWeight: function(fullness) {
		fullness = fullness || 0;

		let wi = this.weightInformation;
		//Should maybe have been this.capabilities.weightInformation?

		//(Fluid) container properties default to no content:
		let d = wi.contentDensity || 0;
		let v = wi.volumeCapacity || 0;
		//Maybe we should have another handling of cargo (with variable density)
		
		let m = wi.lightweight + d*v*fullness;
		let cg;
		if (wi.fullnessCGMapping !== undefined) {
			let fcgm = wi.fullnessCGMapping;
			let fs = fcgm.fullnesses;
			let cgs = fcgm.cgs;
			//Find closest entries:
			let {index: i, mu: mu} = bisectionSearch(fs, fullness);
			cg = [];
			for (let j = 0; j < 3; j++) {
				let c;
				if (i<fs.length-1)
					//Linear interpolation between closest entries:
					c = lerp(cgs[i][j], cgs[i+1][j], mu);
				else c = cgs[i][j];
				//if (isNaN(c)) console.error("BaseObject.getWeight: NaN value found after interpolation.");
				cg.push(c);
			}
		} else if (wi.cg !== undefined) {
			console.log("BaseObject.getWeight: Using specified cg.");
			cg = wi.cg;
		} else {
			console.warn("BaseObject.getWeight: No cg or fullnessCGMapping supplied. Defaults to center of bounding box.");
			cg = [0,0,0.5*this.boxDimensions.height];
		}
		let w = {mass: m, cg: {x: cg[0], y: cg[1], z: cg[2]}};
		return w;
	}
});//@EliasHasle

/*
Depends on JSONSpecObject.js
*/

function DerivedObject(specification, baseObjects) {
	this.baseObjects = baseObjects;
	JSONSpecObject.call(this,specification);
}
DerivedObject.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(DerivedObject.prototype, {
	constructor: DerivedObject,
	setFromSpecification: function(spec) {
		this.id = spec.id;
		this.affiliations = spec.affiliations;
		if (typeof spec.baseObject === "string") {
			this.baseObject = this.baseObjects[spec.baseObject];
		} else {
			this.baseObject = new BaseObject(spec.baseObject);
		}
		this.referenceState = spec.referenceState;
		//this.referenceStateVersion = 0;
	},
	getSpecification: function() {
		let spec = {
			id: this.id,
			affiliations: this.affiliations,
			referenceState: this.referenceState
		};
		if (this.baseObjects[this.baseObject.id] !== undefined) {
			spec.baseObject = this.baseObject.id;
		} else {
			spec.baseObject = this.baseObject.getSpecification();
		}
		
		return spec;
	},
	getWeight: function(state) {
		let oState = state.getObjectState(this);
		
		//Support disabled objects:
		if (oState.exists === false) {
			return {mass: 0, cg: {x:0, y:0, z:0}};
		}
		
		let p = {
			x: oState.xCentre,
			y: oState.yCentre,
			z: oState.zBase
		};

		let w = this.baseObject.getWeight(oState.fullness);
		let m = w.mass;
		let cg = addVec(p, w.cg);
		
		if (isNaN(cg.x+cg.y+cg.z)) {
			console.error("DerivedObject.getWeight: returning NaN values.");
		}

		return {mass: m, cg: cg};
	}
});//@EliasHasle

/*
The object state assignments could/should also have a baseByGroup. A group of baseObjects could for instance be a category including all tanks that carry a given compound, regardless of their size and shape. Maybe "group" is not a good name for something that can be set freely. Maybe "label" or "tag" or something else. The same goes for derivedByGroup.

With this, there would be five types of assignments:
common: All objects.
baseByGroup: Applies to every object that has its base object's property "group" set to the given name.
baseByID: Applies to all objects that have base object consistent with the given ID:
derivedByGroup: Applies to every object that has its property "group" set to the given name.
derivedByID: Applies only to the object with given ID.

Assignments of subsequent types override assignments of previous types.
*/

/*
The caching and version control is clumsy (and incomplete). I (Elias) have done some separate testing of ways to do it properly. This must be implemented later.
*/

/*
ShipState now mainly accounts for load state, by which I mean the states of objects in the ship. We need to find out how to best handle other state properties, like global position, heading etc., not to mention properties that change fast, and that depend on time and current state (motion fluctuations etc.).
*/

function ShipState(specification) {
	this.version = 0;
	this.objectCache = {};
	JSONSpecObject.call(this, specification);
}
ShipState.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(ShipState.prototype, {
	constructor: ShipState,
	getSpecification: function() {
		if (this.cachedVersion !== this.version) {
			var spec = {
				calculationParameters: this.calculationParameters,
				objectOverrides: this.objectOverrides//{}
			};
			
			//Sketchy, but versatile:
			spec = JSON.parse(JSON.stringify(spec));		
			
			this.specCache = spec;
			this.cachedVersion = this.version;
		}
		return this.specCache;
	},
	getObjectState: function(o) {
		if (this.objectCache[o.id] !== undefined) {
			let c = this.objectCache[o.id];
			if (c.thisStateVer === this.version
				/*&& c.baseStateVer === o.baseObject.baseStateVersion
				&& c.refStateVer === o.referenceStateVersion*/) {
				console.log("ShipState.getObjectState: Using cache.");
				return c.state;	
			}				
		}
		console.log("ShipState.getObjectState: Not using cache.");
		
		let state = {};
		Object.assign(state, o.baseObject.baseState);
		Object.assign(state, o.referenceState);
		let oo = this.objectOverrides;
		let sources = [oo.common, oo.baseByID[o.baseObject.id], oo.derivedByGroup[o.affiliations.group], oo.derivedByID[o.id]];
		for (let i = 0; i < sources.length; i++) {
			let s = sources[i];
			if (!s) continue;
			let sk = Object.keys(s);
			for (let k of sk) {
				//Override existing properties only:
				if (state[k] !== undefined) {
					state[k] = s[k];
				}
			}
		}
		
		this.objectCache[o.id] = {
			thisStateVer: this.version,
			/*baseStateVer: o.baseObject.baseStateVersion,
			refStateVer: o.referenceStateVersion,*/
			state: state
		};
		
		return state;
	},
	//o is an object, k is a key to a single state property
	getObjectStateProperty: function(o, k) {
		return this.getObjectState(o)[k];
		//I have commented out a compact, but not very efficient, implementation of Alejandro's pattern, that does not fit too well with my caching solution.
/*		let oo = this.objectOverrides;
		let sources = [oo.derivedByID[o.id], oo.derivedByGroup[o.affiliations.group], oo.baseByID[o.baseObject.id], oo.common, o.getReferenceState(), o.baseObject.getBaseState()].filter(e=>!!e);
		for (let i = 0; i < sources.length; i++) {
			if (sources[i][k] !== undefined) return sources[i][k];
		}
		return; //undefined*/
	},
	//Sets this state exclusively from parameter.
	setFromSpecification: function(spec) {
		this.objectCache = {}; //reset cache
		if (!spec) {
			Object.assign(this, {
				calculationParameters: {},
				//Named overrides because only existing corresponding properties will be set
				objectOverrides: {
					commmon: {},
					//baseByGroup: {},
					baseByID: {},
					derivedByGroup: {},
					derivedByID: {}
				}
			});
			return;
		}

		this.calculationParameters = spec.calculationParameters || {};
		this.objectOverrides = {};
		let oo = this.objectOverrides;
		let soo = spec.objectOverrides || {};
		oo.common = soo.common || {};
		oo.baseByID = soo.baseByID || {};
		oo.derivedByGroup = soo.derivedByGroup || {};
		oo.derivedByID = soo.derivedByID || {};
		
		this.version++;
	},
	//Overrides existing directives and adds new ones.
	extend: function(spec) {
		Object.assign(this.calculationParameters, spec.calculationParameters);
		this.calculatedProperties = {};
		let oo = this.objectOverrides;
		let soo = spec.objectOverrides || {};
		Object.assign(oo.common, soo.common);
		let sources = [soo.baseByID, soo.derivedByGroup, soo.derivedByID];
		let targets = [oo.baseByID, oo.derivedByGroup, oo.derivedByID];
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			let sk = Object.keys(sources[i]);
			for (let k of sk) {
				if (targets[i][k] !== undefined) {
					Object.assign(targets[i][k], sources[i][k]);
				} else {
					targets[i][k] = sources[i][k];
				}
			}
		}

		this.version++;
	},
	//Applies only directives of spec that have a corresponding directive in this.
	override: function(spec) {
		let oo = this.objectOverrides;
		let soo = spec.objectOverrides;
		
		let sources = [spec.calculationParameters, soo.common];
		let targets = [this.calculationParameters, oo.common];
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			let sk = Object.keys(sources[i]);
			for (let k of sk) {
				if (targets[i][k] !== undefined) {
					targets[i][k] = sources[i][k];
				}
			}
		}

		sources = [soo.common, soo.baseByID, soo.derivedByGroup, soo.derivedByID];
		targets = [oo.common, oo.baseByID, oo.derivedByGroup, oo.derivedByID];
		
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			let specKeys = Object.keys(sources[i]);
			for (let key of specKeys) {
				if (targets[i][key] !== undefined) {
					let t = targets[i][key];
					let s = sources[i][key];
					if (!s) continue;
					let sk = Object.keys(s);
					//Loop over individual properties in assignments, and override only:
					for (let k of sk) {
						if (t[k] !== undefined) {
							t[k] = s[k];
						}
					}
				}
			}
		}

		this.version++;
	}
});//@EliasHasle

//Depends on Ship and the other core classes.

/*
Handy function for letting the user load a ship design from a local file. (Based on Elias Hasles browseFile function.)

Typical usage:
<a onclick="browseShip(useShip)">Click here</a>
where useShip takes the loaded ship design as a parameter adn does something with it.

According to the ECMAScript standard, it is required that the file browsing is initiated by the user. Google Chrome seems to handle indirect initiation very well, such as having this function in a click handler.
*/

"use strict";
var browseShip = function() {
	var browseButton;
	return function (callback) {
		browseButton = document.createElement("input");
		Object.assign(browseButton, {
			type: "file",
			multiple: false,
			style: "display: none",
			accept: ".json, application/json",
			onchange: function(e) {
				//console.log("Change event triggered on browse.");
				let file = browseButton.files[0];
				let reader = new FileReader();
				reader.onload = function(event) {
					let result = event.target.result;
					let specification = JSON.parse(result);
					let ship = new Ship(specification);
					callback(ship);
				}
				reader.readAsText(file);
			}
		});
		browseButton.click();
	};
}();//@EliasHasle

//Depends on Ship and the other core classes.

/*
Handy function for loading a ship design from file.

Typical usage:
var myShip;
var filePath = "ships/myShip.json";
loadShip(filePath, function(ship) {
	myShip = ship;
	doSomething();
});

*/

function loadShip(url, callback) {
	var request = new XMLHttpRequest();
	request.open( 'GET', url, true );
	request.addEventListener("load", function(event) {
		var response = event.target.response;
		var specification = JSON.parse(response);
		var ship = new Ship(specification);
		callback(ship);
	});
	request.send(null);
}//@EliasHasle

//Very simple download of the specification of a given ship design. Depends on a working getSpecification method.

function downloadShip(ship) {
	let specification = ship.getSpecification();
	let output = JSON.stringify(specification);
	let link = document.createElement("a");
	link.href = "data:application/json," + encodeURI(output);
	link.download = "shipdesignspecification.json";
	link.target = "_blank";
	link.click();
}
Object.assign(Vessel, {
	/*JSONSpecObject: JSONSpecObject,*/
	Ship: Ship,
	Structure: Structure,
	Hull: Hull,
	BaseObject: BaseObject,
	DerivedObject: DerivedObject,
	ShipState: ShipState,
	browseShip: browseShip,
	loadShip: loadShip,
	downloadShip: downloadShip,
        f: {
            linearFromArrays: linearFromArrays
        }
});
})();
