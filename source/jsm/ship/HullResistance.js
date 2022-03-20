import StateModule from "./StateModule";

export default class HullResistance extends StateModule {

	constructor( ship, states, propeller, wavCre, g = 9.81, rho = 1025, mi = 0.00122 ) {

		super( ship, states );
		this.propeller = propeller;

		if ( typeof this.states.discrete.Speed === "undefined" ) { // if vessel does not have a speed state

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
		this.output = [ "totalResistance", "efficiency" ];

		this.cacheDependence = [ "FloatingCondition", "Speed" ];
		this.cache = {};

		this.coefficients = StateModule.memoized( ( function () {

			var lcb = 100 * ( this.floatState.LCB - ( this.floatState.minXs + this.floatState.LWL / 2 ) ) / this.floatState.LWL; // %

			var Tfore;
			if ( this.floatState.draftfp === null ) {

				Tfore = this.floatState.T;

			} else {

				Tfore = this.floatState.draftfp;

			}

			var Taft;
			if ( this.floatState.draftap === null ) {

				Taft = this.floatState.T;

			} else {

				Taft = this.floatState.draftap;

			}

			var T = ( Tfore + Taft ) / 2; // m, average draft
			var hb = Tfore / 2;
			var abt = Math.PI * Math.pow( Tfore / 2, 2 ) * this.b / 7.7; // transverse sectional bulb area
			var c3 = 0.56 * ( Math.pow( abt, 1.5 ) ) / ( this.floatState.BWL * T * ( 0.31 * Math.pow( abt, 0.5 ) + Tfore - hb ) );
			var c2 = Math.exp( - 1.89 * Math.pow( c3, 0.5 ) );

			var c4;
			if ( Tfore / this.floatState.LWL > 0.04 ) {

				c4 = 0.04;

			} else {

				c4 = Tfore / this.floatState.LWL;

			}

			// correlation allowance coefficient
			var ca = 0.006 * Math.pow( this.floatState.LWL + 100, - 0.16 ) - 0.00205 + 0.003 * Math.pow( this.floatState.LWL / 7.5, 0.5 ) * Math.pow( this.floatState.Cb, 4 ) * c2 * ( 0.04 - c4 );
			var wa = this.floatState.LWL * ( 2 * T + this.floatState.BWL ) * Math.pow( this.floatState.Cm, 0.5 ) * ( 0.453 + 0.4425 * this.floatState.Cb - 0.2862 * this.floatState.Cm - 0.003467 *
        this.floatState.BWL / T + 0.3696 * this.floatState.Cwp ) + 2.38 * abt / this.floatState.Cb; // wetted area

			var lr = this.floatState.LWL * ( 1 - this.floatState.Cp + ( 0.06 * this.floatState.Cp * ( lcb / 100 ) / ( 4 * this.floatState.Cp - 1 ) ) );
			var c14 = 1 + 0.011 * this.cstern;
			var k = 0.93 + ( 0.487118 * c14 * Math.pow( this.floatState.BWL / this.floatState.LWL, 1.06806 ) * Math.pow( T / this.floatState.LWL, 0.46106 ) * Math.pow( this.floatState.LWL /
        lr, 0.121563 ) * Math.pow( Math.pow( this.floatState.LWL, 3 ) / this.floatState.Vs, 0.36486 ) * Math.pow( 1 - this.floatState.Cp, - 0.604247 ) ); // form factor

			var speedSI = 0.514444 * this.speedState.speed; // convert the speed from knots to m/s
			var re = this.rho * this.floatState.LWL * speedSI / this.mi; // Reynolds number
			var cf = 0.075 / Math.pow( ( Math.log( re ) / Math.log( 10 ) ) - 2, 2 ); // frictional coefficient

			return { lcb, Tfore, Taft, T, hb, c2, ca, abt, wa, lr, k, speedSI, cf };

		}, "coefficients" ) );

	}

}
