//@EliasHasle

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
	let V = Ab*zAvg;
	let zc = 0.5*zAvg;
	/*
	To find xc, I need to integrate x*z over the unit square, and scale and translate to world coordinates afterwards:
	INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x)*x dx]
	= 0.5*a00 + a10/3 + 0.25*a01 + a11/6
	Scale and translate:*/
	let xc = y1 + X*(0.5*a00 + a10/3 + 0.25*a01 + a11/6)
	
	//Similar for yc:
	let yc = y1 + Y*(0.5*a00 + 0.25*a10 + a01/3 + a11/6)
	
	let As = bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22);
	
	return {Ab: Ab, As: As, V: V, Cv: {x: xc, y: yc, z: zc}};
}

//Input: array of objects with calculation results for elements.
//Output: the combined results.
function combineVolumes(array) {
	let V = 0;
	let As = 0;
	let Cv = {x:0, y:0, z:0};
	for (let i = 0; i < array.length; i++) {
		let e = array[i];
		V += e.V;
		As += e.As; //typically wetted area
		Cv.x += e.Cv.x*e.V;
		Cv.y += e.Cv.y*e.V;
		Cv.z += e.Cv.z*e.V;
	}
	Cv.x /= V;
	Cv.y /= V;
	Cv.z /= V;
	
	return {V: V, As: As, Cv: Cv};
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
}