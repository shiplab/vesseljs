import StateModule from "./StateModule.js";

export default class PropellerInteraction extends StateModule {

	constructor( ship, states, propeller, rho = 1025 ) {

		super( ship, states );
		this.propeller = propeller;

		if ( typeof this.states.discrete.FloatingCondition === "undefined" ) {

			this.setDraft();

		}

		if ( typeof this.states.discrete.Speed === "undefined" ) { // if vessel does not have a speed state

			this.setSpeed(); // use its design speed

		}

		this.speedState = this.states.discrete.Speed.state;
		this.floatState = this.states.discrete.FloatingCondition.state;
		this.resistanceState = this.states.discrete.HullResistance.state;
		this.rho = rho; // kg/m³
		this.output = [ "propulsion" ];

		this.cacheDependence = [ "FloatingCondition", "Speed" ];
		this.cache = {};


	}

}
