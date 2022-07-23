import StateModule from "./StateModule.js";

export default class FuelConsumption extends StateModule {

	constructor( ship, states, powerPlant ) {

		super( ship, states );

		this.propellerState = this.states.discrete.PropellerInteraction.state;

		this.setAuxPower = function ( Paux ) {

			if ( typeof Paux === "undefined" ) {

				Paux = 0;

			}

			if ( typeof this.states.discrete.AuxPower === "undefined" ) { // Ps and Paux in W each

				this.states.discrete.AuxPower = {
					state: {},
					thisStateVer: 0
				};

			}

			this.states.discrete.AuxPower.state.Paux = Paux;
			this.states.discrete.AuxPower.thisStateVer ++;

		};

		if ( typeof this.states.discrete.AuxPower === "undefined" ) { // Ps and Paux in W each

			this.setAuxPower( 0 );

		}

		this.auxPowerState = this.states.discrete.AuxPower.state;

		this.powerPlant = powerPlant;
		this.output = [ "consumptionRate" ];

		this.cacheDependence = [ "PropellerInteraction" ];
		this.cache = {};

		Object.defineProperties( this, {

			consumptionRate: StateModule.prototype.memoized( function () { // consumption rate in kg/s

				// share load among engines in a system's array
				function shareLoad( system, load ) {

					var triggerRatio = 0.8; // define loading rate at which next engine in the power system will be activated for sharing loads
					var cons = 0;

					var engCapac = [];
					for ( var i = 0; i < system.engines.length; i ++ ) {

						engCapac[ i ] = system.engines[ i ].MCR;

					}

					if ( typeof system.etag === "number" ) { // diesel electrical system

						load = load / ( system.etas * system.etag );

					} else { // diesel mechanical system

						load = load / system.etas; // consumption rate in kg/s

					}

					// distribute loads among engines
					var totalCapac = engCapac.reduce( ( a, b ) => a + b, 0 );
					var partCapac = totalCapac - engCapac[ engCapac.length - 1 ];
					var loads = Array( engCapac.length );
					if ( load <= triggerRatio * partCapac ) { // if not all engines are loaded above trigger ratio, load them according to trigger rate ceil

						var capSum = 0;
						loads.fill( 0 );
						for ( var eng = 0; eng < engCapac.length; eng ++ ) {

							capSum += engCapac[ eng ];
							if ( load <= triggerRatio * capSum ) { // if engines can support load

								for ( i = 0; i <= eng; i ++ ) { // distribute load proportionally to engines' capacities

									loads[ i ] = load / capSum;

								}

								break;

							}

						}

					} else if ( triggerRatio * partCapac < load && load <= totalCapac ) { // if all engines are loaded above trigger ratio, make them all have same load %

						loads.fill( load / totalCapac );

					} else if ( load > totalCapac ) {

						console.error( "Engines are overloaded. Power plant can't provide current required power." );
						loads.fill( 1 );

					}

					// calculate SFOC value for each activated engine
					var SFOC;
					for ( i = 0; i < loads.length; i ++ ) {

						if ( loads[ i ] > 0 ) { // if engine is active

							if ( system.engines[ i ].polOrder === 3 ) {

								SFOC = system.engines[ i ].a * Math.pow( loads[ i ], 3 ) + system.engines[ i ].b * Math.pow( loads[ i ], 2 ) + system.engines[ i ].c * loads[ i ] + system.engines[ i ].d;

							} else if ( system.engines[ i ].polOrder === 2 ) {

								SFOC = system.engines[ i ].a * Math.pow( loads[ i ], 2 ) + system.engines[ i ].b * loads[ i ] + system.engines[ i ].c;

							}

							cons += SFOC / ( 1000 * 3600 ) * loads[ i ] * engCapac[ i ]; // consumption rate in kg/s

						}

					}

					return cons;

				}

				var consumptionRate;
				if ( typeof this.powerPlant.auxiliary === "object" ) { // calculate results for vessels which have main and auxiliary power systems

					consumptionRate = this.powerPlant.main.noSys * shareLoad( this.powerPlant.main, this.propellerState.Ps / ( 1000 * this.powerPlant.main.noSys ) );
					consumptionRate += shareLoad( this.powerPlant.auxiliary, this.auxPowerState.Paux / 1000 );

				} else { // calculate results for vessels which have only one power system

					consumptionRate = shareLoad( this.powerPlant.main, ( this.propellerState.Ps + this.auxPowerState.Paux ) / 1000 );

				}

				return consumptionRate;

			}, "consumptionRate" )

		} );

	}

}
