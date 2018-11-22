// adapted from http://www.shiplab.ntnu.co/app/shipmotion/

function WaveMotion(ship, states, wavCre, position = 0, critDampPercentage = 20, g = 9.81, rho = 1025) {
	StateModule.call(this, ship, states);
	if (this.shipState.mass === undefined) {
		this.setMass();
	}
	if (this.shipState.T === undefined) {
		this.setDraft();
	}
	if (this.shipState.speed === undefined) { // if vessel does not have a speed state
		this.setSpeed(); // use its design speed
	}
	if (this.shipState.heading === undefined) {
		this.shipState.heading = 0;
		this.setHeading();
	}
	this.wavCre = wavCre;
	this.position = position; // measured position in % of LOA
	this.g = g;
	this.rho = rho;
	this.critical_damping_percentage = critDampPercentage; // this parameter is used to take into account the water viscosity
	this.delta = this.ship.structure.hull.attributes.prismaticLengthRatio; // length ratio of two prismatic bodies that represent the ship
	this.output = ["verticalMotion"];
	this.cache = {};
}

WaveMotion.prototype = Object.create(StateModule.prototype);

Object.assign(WaveMotion.prototype, {
	constructor: WaveMotion
});

Object.defineProperties(WaveMotion.prototype, {
	coefficients: StateModule.prototype.memoized(function() {
		var bethaDeg = Math.abs(this.wavCre.waveDef.heading - this.shipState.heading);
		var betha = bethaDeg * Math.PI/180;
		var speedSI = 0.514444*this.shipState.speed;
		var Froude_N = speedSI/Math.sqrt(this.g * this.shipState.LWL);
		//var wave_period = 2*Math.PI/this.wavCre.waveDef.waveFreq;
		var wave_number = Math.pow(this.wavCre.waveDef.waveFreq,2)/this.g;
		var eff_wave_number = Math.abs(wave_number*Math.cos(betha));
		var smith_factor = Math.exp(-wave_number*this.shipState.T);
		var alpha = 1-Froude_N*Math.sqrt(wave_number*this.shipState.LWL)*Math.cos(betha);
		var encounter_frequency = this.wavCre.waveDef.waveFreq * alpha;

		return {betha, Froude_N, wave_number, eff_wave_number, smith_factor, alpha, encounter_frequency};
	}, "coefficients"),
	verticalMotion: StateModule.prototype.memoized(function() {
		var Breadth = this.shipState.BWL*this.shipState.Cb;
		var cgDistance = this.position/100 * this.ship.structure.hull.attributes.LOA - this.shipState.cg.x;
		var sectional_hydro_damping = 2*Math.sin(0.5*this.coefficients.wave_number*Breadth*Math.pow(this.coefficients.alpha,2))*Math.exp(-this.coefficients.wave_number*
			this.shipState.T*Math.pow(this.coefficients.alpha,2));

		var a, b;
		a = Math.pow(1-this.coefficients.wave_number*this.shipState.T,2);
		b = Math.pow((Math.pow(sectional_hydro_damping,2)/(this.coefficients.wave_number*Breadth*Math.pow(this.coefficients.alpha,3))),2);
		var f = Math.sqrt(a+b);
		var eta = 1/(Math.sqrt(Math.pow((1-2*this.coefficients.wave_number*this.shipState.T*Math.pow(this.coefficients.alpha,2)),2) + Math.pow(Math.pow(sectional_hydro_damping,2)/
			(this.coefficients.wave_number*Breadth*Math.pow(this.coefficients.alpha,2)),2)));

		var F = this.coefficients.smith_factor*f*(2/(this.coefficients.eff_wave_number*this.shipState.LWL))*Math.sin(this.coefficients.eff_wave_number*this.shipState.LWL/2);
		var FRF_Heave = this.wavCre.waveDef.waveAmplitude*eta*F;

		var G = this.coefficients.smith_factor*f*(24/(Math.pow(this.coefficients.eff_wave_number*this.shipState.LWL,2)*this.shipState.LWL))*(Math.sin(this.coefficients.eff_wave_number*
			this.shipState.LWL/2)-(this.coefficients.eff_wave_number*this.shipState.LWL/2)*Math.cos(this.coefficients.eff_wave_number*this.shipState.LWL/2));
		var FRF_Pitch =  this.wavCre.waveDef.waveAmplitude*eta*G;

		var Pitch_Movement = Math.abs(FRF_Pitch * cgDistance);
		var Pitch_Acceleration = Math.pow(this.coefficients.encounter_frequency,2)*Pitch_Movement;

		var Heave_Amplitude = Math.abs(FRF_Heave);
		var Heave_Acceleration = Math.pow(this.coefficients.encounter_frequency,2)*Math.abs(FRF_Heave);

		var Vertical_Movement = Math.sqrt(Math.pow(Heave_Amplitude,2) + Math.pow(Pitch_Movement,2));
		var Vertical_Acceleration = Math.pow(this.coefficients.encounter_frequency,2)*Vertical_Movement;

		return {pitchAmp: FRF_Pitch, pitchMov: Pitch_Movement, pitchAcc: Pitch_Acceleration, heaveAmp: Heave_Amplitude, heaveAcc: Heave_Acceleration, 
			verticalMov: Vertical_Movement, verticalAcc: Vertical_Acceleration};
	}, "verticalMotion"),
	bendingMoment: StateModule.prototype.memoized(function() {
		var Cb_mom = Math.max(0.6,this.shipState.Cb);
		var phi = 2.5*(1-Cb_mom);
		var F_Cb = Math.pow(1-phi,2) + 0.6 * this.coefficients.alpha * (2-phi);
		var F_v = 1 + 3 * Math.pow(this.coefficients.Froude_N,2);
		return this.wavCre.waveDef.waveAmplitude*(this.coefficients.smith_factor*((1-this.coefficients.wave_number*this.shipState.T)/(Math.pow(this.shipState.LWL*this.coefficients.eff_wave_number,2)))*
			(1-Math.cos(this.coefficients.eff_wave_number*this.shipState.LWL/2)-(this.coefficients.eff_wave_number*this.shipState.LWL/4)*Math.sin(this.coefficients.eff_wave_number*this.shipState.LWL/2))*
			F_v*F_Cb*Math.pow(Math.abs(Math.cos(this.coefficients.betha)),1/3))*this.rho*this.g*this.shipState.BWL*Math.pow(this.shipState.LWL,2)/1000000;
	}, "bendingMoment"),
	rollMovement: StateModule.prototype.memoized(function() {
		// estimate natural roll period
		var naturalPeriod = (2 * this.shipState.BWL * Math.PI * (0.35 + 0.45)/2)/Math.pow(this.g * this.shipState.GMt, 0.5);

		var breadth_ratio = (this.shipState.Cwp - this.delta)/(1 - this.delta);
		var A_0 = this.shipState.Cb * this.shipState.BWL * this.shipState.T/(this.delta + breadth_ratio*(1-this.delta));

		var Breadth_draft_ratio0 = this.shipState.BWL/this.shipState.T;
		var a0, b0, d0;
		if ((3 <= Breadth_draft_ratio0) && (Breadth_draft_ratio0 <= 6)){
			a0 = 0.256*Breadth_draft_ratio0 - 0.286;
			b0 = -0.11*Breadth_draft_ratio0 - 2.55;
			d0 = 0.033*Breadth_draft_ratio0 - 1.419;
		} else if ((1 <= Breadth_draft_ratio0) && (Breadth_draft_ratio0 < 3)) {
			a0 = -3.94*Breadth_draft_ratio0 + 13.69;
			b0 = -2.12*Breadth_draft_ratio0 - 1.89;
			d0 = 1.16*Breadth_draft_ratio0 - 7.97;
		} else {
			console.error("The B/T relation is not being respected for the roll formula. It should be 1 <= B/T < 6, not" + " " + (this.shipState.BWL/this.shipState.T).toFixed(2) + ".");
		}
		var b_44_0 = this.rho*A_0*Math.pow(this.shipState.BWL,2)*a0*Math.exp(b0*Math.pow(this.coefficients.encounter_frequency,-1.3))*Math.pow(this.coefficients.encounter_frequency,d0)/
		(Math.sqrt(this.shipState.BWL/(2*this.g)));

		var A_1 = breadth_ratio * A_0;
		var B_1 = breadth_ratio * this.shipState.BWL;
		var Breadth_draft_ratio1 = B_1/this.shipState.T;
		var a1, b1, d1;
		if ((3 <= Breadth_draft_ratio1) && (Breadth_draft_ratio1 <= 6)){
			a1 = 0.256*Breadth_draft_ratio1 - 0.286;
			b1 = -0.11*Breadth_draft_ratio1 - 2.55;
			d1 = 0.033*Breadth_draft_ratio1 - 1.419;
		} else if ((1 <= Breadth_draft_ratio1) && (Breadth_draft_ratio1 < 3)) {
			a1 = -3.94*Breadth_draft_ratio1 + 13.69;
			b1 = -2.12*Breadth_draft_ratio1 - 1.89;
			d1 = 1.16*Breadth_draft_ratio1 - 7.97;
		} else {
			console.error("The vessel dimensions are out of range for the roll formula.");
		}
		var b_44_1 = this.rho*A_1*Math.pow(B_1,2)*a1*Math.exp(b1*Math.pow(this.coefficients.encounter_frequency,-1.3))*Math.pow(this.coefficients.encounter_frequency,d1)/
		(Math.sqrt(B_1/(2*this.g)));

		var b_44 = this.shipState.LWL*b_44_0*(this.delta + b_44_1*(1-this.delta)/b_44_0);
		var critical_damping_frac = this.critical_damping_percentage/100;
		var restoring_moment_coeff = this.g*this.rho*this.shipState.Cb*this.shipState.LWL*this.shipState.BWL*this.shipState.T*this.shipState.GMt;
		var add_damping = restoring_moment_coeff*naturalPeriod/Math.PI;

		var damping_ratio = Math.sqrt(b_44_1/b_44_0);
		var roll_hydro_damping = b_44 + add_damping*critical_damping_frac;

		var excitation_frequency, A, B, C, D;

		if (this.wavCre.waveDef.heading == 90 || this.wavCre.waveDef.heading == 270) {
			excitation_frequency = Math.sqrt(this.rho*Math.pow(this.g,2)*b_44_0/this.coefficients.encounter_frequency)*(this.delta+damping_ratio*
				(1-this.delta))*this.shipState.LWL;
		} else {
			A = Math.abs(Math.sin(this.coefficients.betha))*Math.sqrt(this.rho*Math.pow(this.g, 2)/this.coefficients.encounter_frequency) * Math.sqrt(b_44_0)*2/this.coefficients.eff_wave_number;
			B = Math.pow(Math.sin(0.5*this.delta*this.shipState.LWL*this.coefficients.eff_wave_number),2);
			C = Math.pow(damping_ratio*Math.sin(0.5*(1-this.delta)*this.shipState.LWL*this.coefficients.eff_wave_number), 2);
			D = 2*damping_ratio*Math.sin(0.5*this.delta*this.shipState.LWL*this.coefficients.eff_wave_number)*Math.sin(0.5*(1-this.delta)*
				this.shipState.LWL*this.coefficients.eff_wave_number)*Math.cos(0.5*this.shipState.LWL*this.coefficients.eff_wave_number);
			excitation_frequency = A*Math.sqrt(B+C+D);
		}

		A = Math.pow(-Math.pow(this.coefficients.encounter_frequency*naturalPeriod/(2*Math.PI), 2)+1, 2);
		B = Math.pow(restoring_moment_coeff, 2);
		C = Math.pow(this.coefficients.encounter_frequency*roll_hydro_damping, 2);

		return this.wavCre.waveDef.waveAmplitude*excitation_frequency/(Math.sqrt(A*B+C));
	}, "rollMovement")
});
