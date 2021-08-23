// partially adapted from http://www.shiplab.ntnu.co/app/holtrop/

function HullResistance(ship, states, propeller, wavCre, g = 9.81, rho = 1025, mi = 0.00122) {
	StateModule.call(this, ship, states);
	this.propeller = propeller;
	if (typeof this.states.discrete.FloatingCondition === "undefined") {
		this.setDraft();
	}
	if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
		this.setSpeed(); // use its design speed
	}
	this.speedState = this.states.discrete.Speed.state;
	this.floatState = this.states.discrete.FloatingCondition.state;
	this.wavCre = wavCre;
	this.g = g;
	this.rho = rho;
	this.mi = mi; // dynamic viscosity
	this.b = this.ship.structure.hull.attributes.bulb; // has a bulb? Boolean.
	this.tr = this.ship.structure.hull.attributes.transom; // transom. Boolean.
	this.cstern = this.ship.structure.hull.attributes.cstern; // afterbody form.
	// Pram with Gondola = -25, V-Shaped Sections = -10, Normal Section Shape = 0, U-Shaped Sections with Hognes Stern = 10
	this.appendices = this.ship.structure.hull.attributes.appendices; // appendices information
	// skegRudder has coeff from 1.5 to 2.0
	// sternRudder has coeff from 1.3 to 1.5
	// twinScrewBalanceRudder has coeff 2.8
	// shaftBrackets has coeff 3.0
	// skeg has coeff from 1.5 to 2.0
	// strutBossings has coeff 3.0
	// hullBossings has coeff 2.0
	// shafts have coeff from 2 to 4
	// stabilizerFins has coeff 2.8
	// dome has coeff 2.7
	// bilgeKeel has coeff 1.4
	this.output = ["totalResistance", "efficiency"];

	this.cacheDependence = ["FloatingCondition", "Speed"];
	this.cache = {};
}

HullResistance.prototype = Object.create(StateModule.prototype);

Object.assign(HullResistance.prototype, {
	constructor: HullResistance
});

Object.defineProperties(HullResistance.prototype, {
	coefficients: StateModule.prototype.memoized(function() {
		var lcb = 100 * (this.floatState.LCB - (this.floatState.minXs + this.floatState.LWL / 2)) / this.floatState.LWL; // %

		var Tfore;
		if (this.floatState.draftfp === null) {
			Tfore = this.floatState.T;
		} else {
			Tfore = this.floatState.draftfp;
		}
		var Taft;
		if (this.floatState.draftap === null) {
			Taft = this.floatState.T;
		} else {
			Taft = this.floatState.draftap;
		}
		var T = (Tfore + Taft) / 2; // m, average draft
		var hb = Tfore / 2;
		var abt = Math.PI * Math.pow(Tfore / 2, 2) * this.b / 7.7; // transverse sectional bulb area
		var c3 = 0.56 * (Math.pow(abt, 1.5)) / (this.floatState.BWL * T * (0.31 * Math.pow(abt, 0.5) + Tfore - hb));
		var c2 = Math.exp(-1.89 * Math.pow(c3, 0.5));

		var c4;
		if (Tfore / this.floatState.LWL > 0.04) {
			c4 = 0.04;
		} else {
			c4 = Tfore / this.floatState.LWL;
		}
		// correlation allowance coefficient
		var ca = 0.006 * Math.pow(this.floatState.LWL + 100, -0.16) - 0.00205 + 0.003 * Math.pow(this.floatState.LWL / 7.5, 0.5) * Math.pow(this.floatState.Cb, 4) * c2 * (0.04 - c4);
		var wa = this.floatState.LWL * (2 * T + this.floatState.BWL) * Math.pow(this.floatState.Cm, 0.5) * (0.453 + 0.4425 * this.floatState.Cb - 0.2862 * this.floatState.Cm - 0.003467 *
			this.floatState.BWL / T + 0.3696 * this.floatState.Cwp) + 2.38 * abt / this.floatState.Cb; // wetted area

		var lr = this.floatState.LWL * (1 - this.floatState.Cp + (0.06 * this.floatState.Cp * (lcb / 100) / (4 * this.floatState.Cp - 1)));
		var c14 = 1 + 0.011 * this.cstern;
		var k = 0.93 + (0.487118 * c14 * Math.pow(this.floatState.BWL / this.floatState.LWL, 1.06806) * Math.pow(T / this.floatState.LWL, 0.46106) * Math.pow(this.floatState.LWL /
			lr, 0.121563) * Math.pow(Math.pow(this.floatState.LWL, 3) / this.floatState.Vs, 0.36486) * Math.pow(1 - this.floatState.Cp, -0.604247)); // form factor

		var speedSI = 0.514444 * this.speedState.speed; // convert the speed from knots to m/s
		var re = this.rho * this.floatState.LWL * speedSI / this.mi; // Reynolds number
		var cf = 0.075 / Math.pow((Math.log(re) / Math.log(10)) - 2, 2); // frictional coefficient

		return {lcb, Tfore, Taft, T, hb, c2, ca, abt, wa, lr, k, speedSI, cf};
	}, "coefficients"),
	calmResistance: StateModule.prototype.memoized(function() { // N, total hull resistance in calm waters
		var at = 0.95 * (this.coefficients.Taft - this.coefficients.Taft * 0.9225) * this.floatState.BWL * 0.89 * this.tr; // transom stern area
		var rf = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * this.coefficients.wa * this.coefficients.cf; // frictional resistance

		var fnt;
		if (at === 0) {
			fnt = 0;
		} else {
			fnt = this.coefficients.speedSI / (Math.pow(2 * this.g * at / (this.floatState.BWL + this.floatState.BWL * this.floatState.Cwp), 0.5));
		}
		var c6;
		if (fnt < 5) {
			c6 = 0.2 * (1 - 0.2 * fnt);
		} else {
			c6 = 0;
		}
		var rtr = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * at * c6; // stern resistance
		var sapp = 0;
		var mult = 0;
		for (var prop in this.appendices) {
			sapp += this.appendices[prop].area;
			mult += this.appendices[prop].coeff * this.appendices[prop].area;
		}

		var k2;
		if (sapp !== 0) {
			k2 = mult / sapp;
		} else {
			k2 = 0;
		}
		var rapp = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * sapp * k2 * this.coefficients.cf; // appendage resistance
		var fn = this.coefficients.speedSI / Math.pow(this.g * this.floatState.LWL, 0.5); //Froude number

		var c7;
		if (this.floatState.BWL / this.floatState.LWL < 0.11) {
			c7 = 0.229577 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.33333);
		} else if (this.floatState.BWL / this.floatState.LWL < 0.25) {
			c7 = this.floatState.BWL / this.floatState.LWL;
		} else {
			c7 = 0.5 - 0.0625 * this.floatState.LWL / this.floatState.BWL;
		}
		// calculate the half angle of entrance
		var ie = 1 + 89 * Math.exp(-Math.pow(this.floatState.LWL / this.floatState.BWL, 0.80856) * Math.pow(1 - this.floatState.Cwp, 0.30484) * Math.pow(1 - this.floatState.Cp - 0.0225 *
			(this.coefficients.lcb / 100), 0.6367) * Math.pow(this.coefficients.lr / this.floatState.BWL, 0.34574) * Math.pow(100 * (this.floatState.Vs / Math.pow(this.floatState.LWL, 3)), 0.16302));
		var c1 = 2223105 * Math.pow(c7, 3.78613) * Math.pow(this.coefficients.T / this.floatState.BWL, 1.07961) * Math.pow(90 - ie, -1.37565);
		var c5 = 1 - (0.8 * at) / (this.floatState.BWL * this.coefficients.T * this.floatState.Cm);

		var c15;
		if (Math.pow(this.floatState.LWL, 3) / this.floatState.Vs < 512) {
			c15 = -1.69385;
		} else if (Math.pow(this.floatState.LWL, 3) / this.floatState.Vs < 1726.91) {
			c15 = -1.69385 + (this.floatState.LWL / Math.pow(this.floatState.Vs, 1 / 3) - 8) / 2.36;
		} else {
			c15 = 0;
		}

		var c16;
		if (this.floatState.Cp < 0.8) {
			c16 = 8.07981 * this.floatState.Cp - 13.8673 * Math.pow(this.floatState.Cp, 2) + 6.984388 * Math.pow(this.floatState.Cp, 3);
		} else {
			c16 = 1.73014 - 0.7067 * this.floatState.Cp;
		}
		var m1 = 0.0140407 * (this.floatState.LWL / this.coefficients.T) - 1.75254 * ((Math.pow(this.floatState.Vs, 1 / 3)) / this.floatState.LWL) - 4.79323 * (this.floatState.BWL / this.floatState.LWL) - c16;

		var lambda;
		if (this.floatState.LWL / this.floatState.BWL > 12) {
			lambda = 1.446 * this.floatState.Cp - 0.36;
		} else {
			lambda = 1.446 * this.floatState.Cp - 0.03 * (this.floatState.LWL / this.floatState.BWL);
		}
		var c17 = 6919.3 * Math.pow(this.floatState.Cm, -1.3346) * Math.pow(this.floatState.Vs / Math.pow(this.floatState.LWL, 3), 2.00977) * Math.pow(this.floatState.LWL / this.floatState.BWL - 2, 1.40692);
		var m3 = -7.2035 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.326869) * Math.pow(this.coefficients.T / this.floatState.BWL, 0.605375);
		var m4_0_4 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.4, -3.29));
		var rwa_0_4 = c1 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m1 * Math.pow(0.4, -0.9) + m4_0_4 * Math.cos(lambda * Math.pow(0.4, -2)));
		var m4_0_55 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.55, -3.29));
		var rwa_0_55 = c17 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m3 * Math.pow(0.55, -0.9) + m4_0_55 * Math.cos(lambda *
			Math.pow(0.55, -2)));

		var m4, rwa, rwb, rwab;
		if (fn === 0) {
			m4 = 0;
			rwa = 0; // wave resistance for Froude < 0.4
			rwb = 0; // wave resistance for Froude > 0.55
			rwab = 0;
		} else {
			m4 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(fn, -3.29));
			rwa = c1 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m1 * Math.pow(fn, -0.9) + m4 * Math.cos(lambda * Math.pow(fn, -2)));
			rwb = c17 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m3 * Math.pow(fn, -0.9) + m4 * Math.cos(lambda * Math.pow(fn, -2)));
			rwab = rwa_0_4 + (10 * fn - 4) * (rwa_0_55 - rwa_0_4) / 1.5;
		}

		var rw;
		if (fn < 0.4) {
			rw = rwa;
		} else if (fn <= 0.55) {
			rw = rwab;
		} else {
			rw = rwb;
		}
		var fni = this.coefficients.speedSI / Math.sqrt(this.g * (this.coefficients.Tfore - this.coefficients.hb - 0.25 * Math.pow(this.coefficients.abt, 0.5)) + (0.15 * Math.pow(this.coefficients.speedSI, 2)));
		var pb = (0.56 * Math.pow(this.coefficients.abt, 0.5)) / (this.coefficients.Tfore - 1.5 * this.coefficients.hb);

		var rb;
		if (this.coefficients.abt === 0) {
			rb = 0;
		} else {
			rb = (0.11 * Math.exp(-3 * Math.pow(pb, -2)) * Math.pow(fni, 3) * Math.pow(this.coefficients.abt, 1.5) * this.rho * this.g) / (1 + Math.pow(fni, 2));
		}

		var ra = 0.91 * 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * this.coefficients.wa * this.coefficients.ca;
		if ((this.floatState.LWL / this.floatState.BWL <= 3.9) || (this.floatState.LWL / this.floatState.BWL >= 15)) {
			console.error("The L/B relation is not being respected. It should be 3.9 < L/B < 15, not" + " " + (this.floatState.LWL / this.floatState.BWL).toFixed(2) + ".");
		}
		if ((this.floatState.BWL / this.coefficients.T <= 2.1) || (this.floatState.BWL / this.coefficients.T >= 4)) {
			console.error("The B/T relation is not being respected. It should be 2.1 < B/T < 4, not" + " " + (this.floatState.BWL / this.coefficients.T).toFixed(2) + ".");
		}
		if ((this.floatState.Cp <= 0.55) || (this.floatState.Cp >= 0.85)) {
			console.error("The prismatic coefficient is not being respected. It should be 0.55 < Cp < 0.85, not" + " " + this.floatState.Cp.toFixed(2) + ".");
		}

		var Rt = this.coefficients.k * rf + rapp + rw + rb + rtr + ra;

		return Rt;
	}, "calmResistance"),
	totalResistance: StateModule.prototype.memoized(function() {
		var Hw = 2 * this.wavCre.waveDef.waveAmplitude; // wave height

		var Rtadd; // N, total resistance including added wave resistance
		if (Hw <= 2) { // use Kreitner formula
			var raddw = 0.64 * Math.pow(Hw * this.floatState.BWL, 2) * this.floatState.Cb * this.rho * this.g / this.floatState.LWL;
			Rtadd = this.calmResistance + raddw;
		} else { // add 20% sea margin
			Rtadd = 1.2 * this.calmResistance;
		}

		var Pe = this.coefficients.speedSI * Rtadd; // effective power

		return {Rtadd, Pe};
	}, "totalResistance"),
	efficiency: StateModule.prototype.memoized(function() {
		var c8;
		if (this.floatState.BWL / this.coefficients.Taft < 5) {
			c8 = this.floatState.BWL * this.coefficients.wa / (this.floatState.LWL * this.propeller.D * this.coefficients.Taft);
		} else {
			c8 = this.coefficients.wa * (7 * this.floatState.BWL / this.coefficients.Taft - 25) / (this.floatState.LWL * this.propeller.D * (this.floatState.BWL / this.coefficients.Taft - 3));
		}

		var c9;
		if (c8 < 28) {
			c9 = c8;
		} else {
			c9 = 32 - 16 / (c8 - 24);
		}

		var c11;
		if (this.coefficients.Taft / this.propeller.D < 2) {
			c11 = this.coefficients.Taft / this.propeller.D;
		} else {
			c11 = 0.0833333 * Math.pow(this.coefficients.Taft / this.propeller.D, 3) + 1.33333;
		}

		var c19;
		if (this.floatState.Cp < 0.7) {
			c19 = 0.12997 / (0.95 - this.floatState.Cb) - 0.11056 / (0.95 - this.floatState.Cp);
		} else {
			c19 = 0.18567 / (1.3571 - this.floatState.Cm) - 0.71276 + 0.38648 * this.floatState.Cp;
		}
		var Cp1 = 1.45 * this.floatState.Cp - 0.315 - 0.0225 * this.coefficients.lcb;
		var cv = this.coefficients.k * this.coefficients.cf + this.coefficients.ca;
		var c20 = 1 + 0.015 * this.cstern;

		var w; // wake factor
		if (this.propeller.noProps === 1) {
			w = c9 * c20 * cv * this.floatState.LWL / this.coefficients.Taft * (0.050776 + 0.93405 * c11 * cv / (1 - Cp1)) + 0.27915 * c20 * Math.pow(this.floatState.BWL / (this.floatState.LWL * (1 - Cp1)), 0.5) + c19 * c20;
		} else if (this.propeller.noProps === 2) {
			w = 0.3095 * this.floatState.Cb + 10 * cv * this.floatState.Cb - 0.23 * this.propeller.D / Math.pow(this.floatState.BWL * this.coefficients.T, 0.5);
		}

		var t; // thrust deduction factor
		if (this.propeller.noProps === 1) {
			t = 0.25014 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.28956) * Math.pow(Math.pow(this.floatState.BWL * this.coefficients.T, 0.5) / this.propeller.D, 0.2624) /
				Math.pow(1 - this.floatState.Cp + 0.0225 * this.coefficients.lcb, 0.01762) + 0.0015 * this.cstern;
		} else if (this.propeller.noProps === 2) {
			t = 0.325 * this.floatState.Cb - 0.1885 * this.propeller.D / Math.pow(this.floatState.BWL * this.coefficients.T, 0.5);
		}

		var etah = (1 - t) / (1 - w); // hull efficiency

		return {w, t, etah};
	}, "efficiency")
});
