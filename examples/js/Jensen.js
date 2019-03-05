"use strict";

/*
This does not yet produce proper motion. It is both
out of phase and out of proportions. One of the problems
is to get it working with different relative wave
directions (both positive and negative cos(beta)).
The math in the code, as well as in the original paper
http://www.angelfire.com/ultra/carolemarcio/oceaneng/v31cap4.pdf
is a bit impenetrable. It is hard to debug.

Another shortcoming is that some parameters are set to
fixed values, independent of design and conditions.
This includes the speed parameter, which is set to 0.

Note that the definition of the input waves is given by:
z = A*cos(phi+2*PI*xm/L-omega*t);
where
xm = x*cos(theta)-y*sin(theta);
theta is wave direction
x,y are the coordinates to calculate on
phi is the base phase shift,
phi+2*PI*xm/L is total phase shift
omega is angular frequency = 2*PI/T, where T is the period
A is amplitude
L is wavelength
*/

function Jensen(wave, ship, shipState) {
	this.wave = wave;
	let T = ship.calculateDraft();
	let scalc = ship.calculateStability();
	let hcalc = ship.structure.hull.calculateAttributesAtDraft(T);
	Object.defineProperties(this, {
		heading: {
			get: function () {
				return shipState.motion.heading;
			}
		},
		x: {
			get: function () {
				return shipState.motion.x;
			}
		},
		y: {
			get: function () {
				return shipState.motion.y;
			}
		}
	});
	Object.assign(this, ship.structure.hull.attributes);
	Object.assign(this, scalc);
	Object.assign(this, hcalc);
	this.updateFRFs();
	this.update(0);
	console.log(this);
}
Jensen.prototype = Object.create(Object.prototype);
Object.assign(Jensen.prototype, {
	constructor: Jensen,
	//New implementation of Jensen's closed-form expressions for estimating vessel motion.
	//True to Jensen's variable names, for easy comparison and debugging
	//Only radians and metric units are used.
	updateFRFs: function () {
		let abs = Math.abs,
			cos = Math.cos,
			sin = Math.sin,
			exp = Math.exp,
			sqrt = Math.sqrt,
			PI = Math.PI;
		const g = 9.81;

		//heading of vessel relative to waves, in radians:
		this.beta = this.wave.theta - this.heading; //Suspicious handling of angles
		this.cosb = Math.cos(this.beta);
		this.sinb = Math.sin(this.beta);
		this.sign = this.cosb < 0 ? -1 : 1;

		const omega = 2 * PI / this.wave.T; //angular frequency of waves

		//WARNING: FIXED VALUE
		const V = 0; //this.Speed_knots*(463/900); //metric speed of vessel
		const alpha = 1 - V * this.cosb * omega / g;
		const omegaBar = alpha * omega;

		//Note: Assumes "natural" wavelength
		const k = omega * omega / g; //angular wave number

		//Box model dimensions:
		let Bb = this.Cb * this.BWL;
		let L = this.LOA;
		let T = this.T;

		//sectional hydrodynamic damping
		let A = 2 * sin(k * Bb * alpha ** 2 / 2) * exp(-k * T * alpha ** 2);

		let ke = abs(k * this.cosb); //effective wave number
		let kappa = exp(-ke * T); //Estimate of Smith correction factor

		//expressions for use by both F and G:
		let f = sqrt((1 - k * T) ** 2 + A ** 4 / (k * Bb * alpha ** 3) ** 2);
		let keLh = ke * L / 2; //Values from zero to two-figured.

		//hack to avoid division by approximate zero when beta is +-PI/2.
		let F, G;
		if (abs(keLh) < 0.01) {
			F = kappa * f;
			G = 0; //a bit weird, but seems right, and works (?).
		} else {
			F = kappa * f * sin(keLh) / keLh;
			G = kappa * f * (sin(keLh) / keLh ** 2 - cos(keLh) / keLh) * 6 / L;
		}

		let eta = 1 / sqrt((1 - 2 * k * T * alpha ** 2) ** 2 + (A / alpha) ** 4 / (k * Bb) ** 2);

		//Outputs:
		this.omegaBar = omegaBar; //Frequency of encounter
		this.PHIw = F * eta; //heave amplitude multiplier
		this.PHItheta = G * eta; //pitch amplitude multiplier

		//Roll calculations (copy-paste from Olivia's code, with only a few changes):
		let GM = this.GMt;
		let Cb = this.Cb;
		let Cwp = this.Cwp;
		//WARNING: USING FIXED VALUES
		let delta = 0.85 * Cwp; //vessel.Prism_Length_ratio;
		let critical_damping_percentage = 0.2; //vessel.critical_damping_percentage;

		//WARNING: USING FIXED VALUE:
		let rrg = 0.5; //0.35; //relative radius of gyration
		let natural_period = 2 * PI * rrg * Bb / sqrt(g * GM); //2PI*k/sqrt(g*GM), where k is the radius of gyration. (http://www.neely-chaulk.com/narciki/Radius_of_gyration)
		//console.log(natural_period);

		let restoring_moment_coeff = g * 1025 * Cb * L * Bb * T * GM; //Cb*Bb is Cb^2*BOA. Right?
		let breadth_ratio = (Cwp - delta) / (1 - delta); //gamma
		let B_1 = breadth_ratio * Bb;
		let A_0 = Cb * Bb * T / (delta + breadth_ratio * (1 - delta)); //Cb*Bb is Cb^2*BOA. Right?
		let A_1 = breadth_ratio * A_0;

		//sectional damping coefficient//
		let Breadth_Draft_ratio = Bb / T;
		var a0, b0, d0;
		//3 <= B/T <= 6//
		if (Breadth_Draft_ratio > 3) {
			a0 = 0.256 * Breadth_Draft_ratio - 0.286;
			b0 = -0.11 * Breadth_Draft_ratio - 2.55;
			d0 = 0.033 * Breadth_Draft_ratio - 1.419;
		}
		//1 <= B/T <= 3//
		else {
			a0 = -3.94 * Breadth_Draft_ratio + 13.69;
			b0 = -2.12 * Breadth_Draft_ratio - 1.89;
			d0 = 1.16 * Breadth_Draft_ratio - 7.97;
		}

		Breadth_Draft_ratio = B_1 / T;
		let a1, b1, d1;
		//3 <= B/T <= 6//
		if (Breadth_Draft_ratio > 3) {
			a1 = 0.256 * Breadth_Draft_ratio - 0.286;
			b1 = -0.11 * Breadth_Draft_ratio - 2.55;
			d1 = 0.033 * Breadth_Draft_ratio - 1.419;
		}
		//1 <= B/T <= 3//
		else {
			a1 = -3.94 * Breadth_Draft_ratio + 13.69;
			b1 = -2.12 * Breadth_Draft_ratio - 1.89;
			d1 = 1.16 * Breadth_Draft_ratio - 7.97;
		}

		let b_44_0 = (1025 * A_0 * Bb * Bb * a0 * exp(b0 * omegaBar ** (-1.3)) * omegaBar ** d0 / (sqrt(Bb / (2 * g)))); //2g? Maybe check Jensen's paper.
		let b_44_1 = (1025 * A_1 * B_1 * B_1 * a1 * exp(b1 * omegaBar ** (-1.3)) * omegaBar ** d1 / (sqrt(B_1 / (2 * g))));

		let damping_ratio = sqrt(b_44_1 / b_44_0);

		let b_44 = L * b_44_0 * (delta + b_44_1 * (1 - delta) / b_44_0);

		//total damping = hydro damping + additional damping//
		let add_damping = restoring_moment_coeff * natural_period / PI;
		let roll_hydro_damping = b_44 + add_damping * critical_damping_percentage;

		//excitation frequency//
		//Note: here is a similar hack to the one I wrote above for the Heave and Pitch
		let excitation_moment;
		let srtrhog2b44dob = g * sqrt(1025 * b_44_0 / omegaBar);
		if (abs(this.cosb) < 0.001) {
			//if (abs(beta-PI/2)<0.001 || abs(beta-3*PI/2)<0.001){
			excitation_moment = srtrhog2b44dob * (delta + damping_ratio * (1 - delta)) * L;
		} else {
			let A = abs(this.sinb) * srtrhog2b44dob * 2 / ke;
			let B = sin(0.5 * delta * L * ke) ** 2;
			let C = (damping_ratio * sin(0.5 * (1 - delta) * L * ke)) ** 2;
			let D = 2 * damping_ratio * sin(0.5 * delta * L * ke) * sin(0.5 * (1 - delta) * L * ke) * cos(0.5 * L * ke);

			excitation_moment = A * sqrt(B + C + D);
		}

		//main formula//
		let B = (1 - (abs(omegaBar) * natural_period / (2 * PI)) ** 2) ** 2;
		let C = restoring_moment_coeff ** 2;
		let D = (abs(omegaBar) * roll_hydro_damping) ** 2;

		//roll output
		this.PHIphi = excitation_moment / sqrt(B * C + D);
	},
	//This must be adjusted to account for the COSINE ocean waves
	update: function (t) {
		//I am not sure this phase shift calculation
		//will be consistent with omegaBar<>omega.
		const xm = this.x * this.wave.costh - this.y * this.wave.sinth;
		const phi = this.wave.phi + 2 * Math.PI * xm / this.wave.L;
		const c = Math.cos(phi - this.omegaBar * t);
		const s = Math.sin(phi - this.omegaBar * t);
		const A = this.wave.A;

		//heave
		this.heave = this.PHIw * A * c;

		//rotation. The sign is an attempt at correcting the phase
		this.pitch = this.sign * this.PHItheta * A * s;
		this.roll = this.sign * this.PHIphi * A * s;
	}
});