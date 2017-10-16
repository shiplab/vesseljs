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

	let output = {A: C.A, maxX: C.maxY, minX: C.minY, maxY: C.maxX, minY: C.minX, xc: C.yc, yc: C.xc, Ix: C.Iy, Iy: C.Ix};
	console.info("Output: ", output);
	console.groupEnd();
	return output;
}