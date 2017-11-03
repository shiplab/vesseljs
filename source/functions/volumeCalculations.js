//@EliasHasle

//This one is broken, apparently.
//It returns negative xc and yc when the z values are negative, 
//even though all x and y values are positive.
//I am currently doing some tests here of an (over-)simplified calculation
//The results so far indicate that, for the prism hull, the results are almost identical, except that with the simple calculation the center of volume is almost right (but wrong enough to disqualify such a simple calculation). The bug causing very wrong (too big) submerged volume is likely to be found elsewhere.
/*Note that the coordinate system used here has xy as a grid, with z as heights on the grid, but in the intended application, which is calculations on transverse hull offsets, z corresponds to the vessel y axis, and y corresponds to the vessel z axis. In the application, the conversion between coordinate systems must be taken care of appropriately.*/
											  // xy
function patchColumnCalculation(x1, x2, y1, y2, z11, z12, z21, z22) {
	//DEBUG START:
	//Simpler approximate calculation of volume:
	let z = 0.25*(z11+z12+z21+z22); //"average height"
	let V = Math.abs((x2-x1)*(y2-y1)*z); //base area times "average height"

	//Very approximate center of volume
	//(does not account for different signs on z values,
	//but that should be OK for hull offsets)
	let xc = (x1*(z11+z12)+x2*(z21+z22))/((z11+z12+z21+z22) || 1);
	let yc = (y1*(z11+z21)+y2*(z12+z22))/((z11+z12+z21+z22) || 1);
	let zc = 0.5*z;
	
	//Simple triangle average approximation for area
	let As = elementArea(
		{x: x1, y: y1, z: z11},
		{x: x1, y: y2, z: z12},
		{x: x2, y: y1, z: z21},
		{x: x2, y: y2, z: z22});
	
	return {As: As, V: V, Cv: {x: xc, y: yc, z: zc}};
	
	//DEBUG END
	
	//Calculation based on a bilinear patch:

	// let X = x2-x1;
	// let Y = y2-y1;
	// let [a00, a10, a01, a11] = bilinearUnitSquareCoeffs(z11, z12, z21, z22);
	// /*
	// From here I call mux for x, and muy for y.
	// Integral over unit square:
	// INT[x from 0 to 1, INT[y from 0 to 1, (a00 + a10*x + a01*y + a11*x*y) dy] dx]
	// = INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x) dx]
	// = a00 + 0.5*a10 + 0.5*a01 + 0.25*a11
	// */
	// let Ab = X*Y; //area of base of patch column
	// let zAvg = (a00 + 0.5*a10 + 0.5*a01 + 0.25*a11);
	// let V = Math.abs(Ab*zAvg); //new: absolute value
	// let zc = 0.5*zAvg;
	// /*
	// To find xc, I need to integrate x*z over the unit square, and scale and translate to ship coordinates afterwards:
	// INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x)*x dx]
	// = 0.5*a00 + a10/3 + 0.25*a01 + a11/6
	// Scale and translate:*/
	// let xc = x1 + X*(0.5*a00 + a10/3 + 0.25*a01 + a11/6);
	
	// //Similar for yc:
	// let yc = y1 + Y*(0.5*a00 + 0.25*a10 + a01/3 + a11/6);
	
	//new: absolute value (OK?)
	//let As = Math.abs(bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22));
	
	// return {Ab: Ab, As: As, V: V, Cv: {x: xc, y: yc, z: zc}};
}

//Input: array of objects with calculation results for elements.
//Output: the combined results.
function combineVolumes(array) {
	let V = 0;
	let As = 0;
	let Cv = {x:0, y:0, z:0};
	let L = array.length;
	//if (L===0) return {V,As,Cv};
	for (let i = 0; i < L; i++) {
		let e = array[i];
		V += e.V;
		As += e.As; //typically wetted area
		//console.log(e.Cv);
		Cv = addVec(Cv, scaleVec(e.Cv, e.V));
	}
	Cv = scaleVec(Cv, 1/(V || L || 1));
	
	//console.info("combineVolumes: Combined Cv is (" + Cv.x + ", " + Cv.y + ", " + Cv.z + ").");
	
	return {V,As,Cv};//{V: V, As: As, Cv: Cv};
}
