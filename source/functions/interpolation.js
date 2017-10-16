//@EliasHasle

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
