//@EliasHasle

//Some interpolation helpers. Only linear and bilinear for now.

//linear interpolation
//Defaults are not finally decided
function lerp(a, b, mu=0.5) {
	if (a === undefined) return b;
	else if (b === undefined) return a;
	return (1-mu)*a+mu*b;
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

function bilinear(x1, x2, y1, y2, z11, z12, z21, z22, x, y) {
	let [b00, b10, b01, b11] = 
		bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22);
	return b00 + b10*x + b01*y + b11*x*y;
	//The following is supposed to be equivalent. Maybe I should compare, to make sure that the current calculation is correct.
	/*let mux = (x-x1)/(x2-x1);
	let muy = (y-y1)/(y2-y1);
	return bilinearUnitSquare(z11, z12, z21, z22, mux, muy);*/
}
