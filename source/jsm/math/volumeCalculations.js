//@EliasHasle
import { bilinearUnitSquareCoeffs } from "./interpolation.js";
import { bilinearArea } from "./areaCalculations.js";
import Vectors from "./Vectors.js";

//I have been doing some tests here of a simplified calculation.
//The results so far indicate that, for the prism hull, the results are almost identical, except that with the simple calculation the center of volume is almost right (but wrong enough to disqualify such a simple calculation).
/*Note that the coordinate system used here has xy as a grid, with z as heights on the grid, but in the intended application, which is calculations on transverse hull offsets, this z corresponds to the vessel y axis, and y corresponds to the vessel z axis. In any application of this function, the conversion between coordinate systems must be taken care of appropriately.*/
// xy
export function patchColumnCalculation( x1, x2, y1, y2, z00, z01, z10, z11 ) {

	//VOLUME:
	//Analysis based on a bilinear patch:
	// /*
	// From here I call mux for x, and muy for y.
	// Integral over unit square:
	// INT[x from 0 to 1, INT[y from 0 to 1, (a00 + a10*x + a01*y + a11*x*y) dy] dx]
	// = INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x) dx]
	// = a00 + 0.5*a10 + 0.5*a01 + 0.25*a11
	// Note that by expanding a00,a10,a01,a11, it is demonstrated that this (rather unsurprisingly) is exactly equivalent to taking the average z offset of the control points.
	// */
	let X = x2 - x1;
	let Y = y2 - y1;
	let Ab = X * Y; //area of base of patch column
	//let zAvg = (a00 + 0.5*a10 + 0.5*a01 + 0.25*a11);
	let zAvg = 0.25 * ( z00 + z01 + z10 + z11 ); //equivalent
	let V = Math.abs( Ab * zAvg ); //works

	//CENTER OF VOLUME
	let zc = 0.5 * zAvg;

	//Very approximate center of volume
	//(does not account for different signs on z values,
	//but that should be OK for hull offsets)
	//let xc = (x1*(z00+z01)+x2*(z10+z11))/((z00+z01+z10+z11) || 1);
	//let yc = (y1*(z00+z10)+y2*(z01+z11))/((z00+z01+z10+z11) || 1);

	// /*
	// To find xc properly, I need to integrate x*z over the unit square, divide by zAvg(?) and scale and translate to ship coordinates afterwards:
	// INT[x from 0 to 1, INT[y from 0 to 1, x*(a00 + a10*x + a01*y + a11*x*y) dy] dx] =
	// INT[x from 0 to 1, INT[y from 0 to 1, (a00*x + a10*x^2 + a01*xy + a11*x^2*y) dy] dx] =
	// INT[x from 0 to 1, (a00*x + a10*x^2 + 0.5*a01*x + 0.5*a11*x^2) dx]
	// = (0.5*a00 + a10/3 + 0.25*a01 + a11/6)
	//Trying to expand the coeffs to original z offsets:
	// = (0.5*z00 + (z10-z00)/3 + 0.25*(z01-z00) + (z00+z00-z01-z10)/6)
	// = ((1/12)*z00 + (1/6)*z10 + (1/12)*z01 + (1/6)*z00)
	//Divide by zAvg to get muxc, then scale and translate to xc.
	let xc = x1 + X * ( ( ( 1 / 12 ) * z00 + ( 1 / 6 ) * z10 + ( 1 / 12 ) * z01 + ( 1 / 6 ) * z11 ) / ( zAvg || 1 ) );
	//console.log("x1=%.2f, X=%.2f, muxc = %.2f", x1, X, (((1/12)*z00 + (1/6)*z10 + (1/12)*z01 + (1/6)*z11) / (zAvg || 1)));
	//Similar for yc (modified symmetrically)
	let yc = y1 + Y * ( ( ( 1 / 12 ) * z00 + ( 1 / 12 ) * z10 + ( 1 / 6 ) * z01 + ( 1 / 6 ) * z11 ) / ( zAvg || 1 ) );
	let [ a00, a10, a01, a11 ] = bilinearUnitSquareCoeffs( z00, z01, z10, z11 );

	//console.log("Patch column Cv = (%.2f, %.2f, %.2f)", xc,yc,zc);

	//AREA
	//These two methods give very similar results, within about 1% difference for the fishing boat hull (used in PX121.json).
	//Simple triangle average approximation for area (works)
	/*let As = elementArea(
		{x: x1, y: y1, z: z00},
		{x: x1, y: y2, z: z01},
		{x: x2, y: y1, z: z10},
		{x: x2, y: y2, z: z11});*/
	//Bilinear area calculation. Works too, but is currently numerical, and quite complex (which means it is bug-prone and hard to maintain). But it is more exact, even with just a few segments for numerical integration (the last, optional, parameter)
	let As = Math.abs( bilinearArea( x1, x2, y1, y2, z00, z01, z10, z11 ) );

	return { Ab: Ab, As: As, V: V, Cv: { x: xc, y: yc, z: zc } };

}

//Input: array of objects with calculation results for elements.
//Output: the combined results.
export function combineVolumes( array ) {

	let V = 0;
	let As = 0;
	let Cv = { x: 0, y: 0, z: 0 };
	let L = array.length;
	//if (L===0) return {V,As,Cv};
	for ( let i = 0; i < L; i ++ ) {

		let e = array[ i ];
		V += e.V;
		As += e.As; //typically wetted area
		//console.log(e.Cv);
		Cv = Vectors.add( Cv, Vectors.scale( e.Cv, e.V ) );

	}

	Cv = Vectors.scale( Cv, 1 / ( V || L || 1 ) );

	//console.info("combineVolumes: Combined Cv is (" + Cv.x + ", " + Cv.y + ", " + Cv.z + ").");

	return { V, As, Cv };//{V: V, As: As, Cv: Cv};

}
