// This module simulates the propeller and its interaction with hull and engine.

function PropellerInteraction(ship, states, propeller, rho = 1025) {
	StateModule.call(this, ship, states); // get resistance results in N, W from vessel state
	this.propeller = propeller;
	if (typeof this.states.discrete.FloatingCondition === "undefined") {
		this.setDraft();
	}
	if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
		this.setSpeed(); // use its design speed
	}
	this.speedState = this.states.discrete.Speed.state;
	this.floatState = this.states.discrete.FloatingCondition.state;
	this.resistanceState = this.states.discrete.HullResistance.state;
	this.rho = rho; // kg/m³
	this.output = ["propulsion"];

	this.cacheDependence = ["FloatingCondition", "Speed"];
	this.cache = {};
}

PropellerInteraction.prototype = Object.create(StateModule.prototype);

Object.assign(PropellerInteraction.prototype, {
	constructor: PropellerInteraction,
});

Object.defineProperties(PropellerInteraction.prototype, {
	propulsion: StateModule.prototype.memoized(function() {
		// convert vessel speed from knots to m/s
		if (this.speedSI === 0) {
			console.error("Speed equals to zero, try getPropResult() method to get boolard pull or use changeSpeed() method to set a non null value.")
		}
		var speedSI = 0.514444 * this.speedState.speed;
		var lcb = 100 * (this.floatState.LCB - (this.floatState.minXs + this.floatState.LWL / 2)) / this.floatState.LWL; // %
		var Va = speedSI / (1 - this.resistanceState.w); // m/s
		var T = this.resistanceState.Rtadd / (this.propeller.noProps * (1 - this.resistanceState.t)); // N, thrust

		var acoeff = T / (this.rho * Math.pow(this.propeller.D * Va, 2));
		var bcoeff = this.propeller.beta2;
		var ccoeff = -this.propeller.beta1;
		var J = (-bcoeff + Math.pow(Math.pow(bcoeff, 2) - 4 * acoeff * ccoeff, 0.5)) / (2 * acoeff);

		var n = Va / (J * this.propeller.D); // rps
		// var npm = 60*n;

		var KT = this.propeller.beta1 - this.propeller.beta2 * J;
		var KQ = this.propeller.gamma1 - this.propeller.gamma2 * J;
		var eta0 = J * KT / (2 * Math.PI * KQ);

		var etar;
		if (this.propeller.noProps === 1) {
			etar = 0.9922 - 0.05908 * this.propeller.AeAo + 0.07424 * (this.floatState.Cp - 0.0225 * lcb);
		} else if (this.propeller.noProps === 2) {
			etar = 0.9737 + 0.111 * (this.floatState.Cp - 0.0225 * lcb) - 0.06325 * this.propeller.P / this.propeller.D;
		}
		var eta = eta0 * this.resistanceState.etah * etar;
		var Ps = this.resistanceState.Pe / eta; // W, required brake power

		return {eta, Ps, n, Va};
	}, "propulsion")
});
