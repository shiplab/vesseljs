//@EliasHasle

//All inputs are numbers. The axes are given by a single coordinate.
function steiner(I, A, sourceAxis, targetAxis) {
	return I + A*(sourceAxis-targetAxis)**2;
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
	let Ix = (a==0 && b== 0) ? 0 : h**3*(a**2+4*a*b+b**2)/(36*(a+b));

	//For Iy I must decompose (I think negative results will work fine):
	let Art1 = 0.5*(xtop0-xbase0)*h;
	let xcrt1 = xbase0 + (xtop0-xbase0)/3;
	let Iyrt1 = (xtop0-xbase0)**3*h/36;
	let Arec = (xbase1-xtop0)*h;
	let xcrec = 0.5*(xtop0+xbase1);
	let Iyrec = (xbase1-xtop0)**3*h/12;
	let Art2 = 0.5*(xbase1-xtop1)*h;
	let xcrt2 = (xtop1 + (xbase1-xtop1)/3);
	let Iyrt2 = (xbase1-xtop1)**3*h/36;

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
		//console.warn("Zero area combination.");
		//console.trace();
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
	//console.group/*Collapsed*/("sectionCalculation");
	//console.info("Arguments (xs, ymins, ymaxs): ", arguments[0]);

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
	//console.info("Output: ", output);
	//console.groupEnd();
	return output;
}

//For wetted area. I think this is right, but it is not tested.
//The numerical integral will not scale well with larger geometries.
//Then the full analytical solution is needed.
function bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22, segs=5) {
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
	
	Now, to get the area I need to integrate |Tx X Ty| over X,Y.
	
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

/*Calculates the (arithmetic) average of the area of the two possible triangulations of the quad element (using two triangles).
This requires the base of the quad to be convex. If the base is arrowhead shaped,
The calculation will fail in undefined ways.
*/
function elementArea(v1,v2,v3,v4) {
	let A1 = Math.abs(signedTriangleArea(v1,v2,v3)) + Math.abs(signedTriangleArea(v3,v4,v1));
	let A2 = Math.abs(signedTriangleArea(v2,v3,v4)) + Math.abs(signedTriangleArea(v4,v1,v2));
	let A = 0.5*(A1+A2);
	return A;
}

function signedTriangleArea(v1,v2,v3) {
	let u = Vectors.sub(v2,v1);
	let v = Vectors.sub(v3,v1);
	let c = Vectors.cross(u,v);
	let A = 0.5*Vectors.norm(c);
	return A;
}