export default class StateModule {

	constructor( ship, states ) {

		this.ship = ship;
	  this.states = states;

	}

	returnOutput() {

		let resObj = {};
		for ( let i = 0; i < this.output.length; i ++ ) {

			let output = this[ this.output[ i ] ];
			if ( typeof output === "number" ) {

				resObj[ this.output[ i ] ] = output;

			} else if ( typeof output === "object" ) {

				Object.assign( resObj, output );

			}

		}

		return resObj;

	}

	// write getter output to shipState
	writeOutput() {

		let stateName = this.constructor.name;
		if ( this.states.discrete[ stateName ] === undefined ) {

			this.states.discrete[ stateName ] = {
				state: {},
				thisStateVer: 0
			};

		}

		for ( let i = 0; i < this.output.length; i ++ ) {

			let output = this[ this.output[ i ] ];
			if ( typeof output === "number" ) {

				this.states.discrete[ stateName ].state[ this.output[ i ] ] = output;

			} else if ( typeof output === "object" ) {

				Object.assign( this.states.discrete[ stateName ].state, output );

			}

		}

		this.states.discrete[ stateName ].thisStateVer ++;

	}

	setDraft() {

		let draft = this.ship.calculateDraft( this.states );
		if ( this.states.discrete.FloatingCondition === undefined ) {

			this.states.discrete.FloatingCondition = {
				state: {},
				thisStateVer: 0
			};

		}

		Object.assign( this.states.discrete.FloatingCondition.state, this.ship.structure.hull.calculateAttributesAtDraft( draft ) );
		Object.assign( this.states.discrete.FloatingCondition.state, this.ship.calculateStability( this.states ) );
		this.states.discrete.FloatingCondition.thisStateVer ++;


	}

	// write argument speed to vessel state. If undefined, use vessel's design speed
	setSpeed( speed ) {

		if ( this.states.discrete.Speed === undefined ) {

			this.states.discrete.Speed = {
				state: {},
				thisStateVer: 0
			};

		}

		if ( typeof speed === "undefined" && typeof this.ship.designState.calculationParameters.speed !== "undefined" ) {

			speed = this.ship.designState.calculationParameters.speed;

		}

		this.states.discrete.Speed.state.speed = speed; // knots
		this.states.discrete.Speed.thisStateVer ++;

	}

	// write argument heading angle to vessel state. if undefined, use 0 degrees
	// 0 degrees corresponds to vessel pointing to north. clockwise orientation.
	setHeading( angle ) {

		if ( this.states.discrete.Heading === undefined ) {

			this.states.discrete.Heading = {
				state: {},
				thisStateVer: 0
			};

		}

		if ( typeof angle === "undefined" ) {

			angle = 0;

		}

		this.states.discrete.Heading.state.heading = angle;
		this.states.discrete.Heading.thisStateVer ++;

	}

	// cache memoization pattern adapted from http://b-studios.de/blog/2013/11/18/lazy-attributes-in-ecmascript-5/
	// in the future, expand version comparison also to parameters stored inside each constructor
	memoized( init, cacheName ) {

		return {
			enumerable: true,
			configurable: false,
			get: function cache() {

				// if state module uses a wave creation object
				let hasWave;
				if ( this.wavCre !== undefined ) {

					hasWave = true;

				} else { // if it has only a ship module

					hasWave = false;

				}

				if ( this.cache[ cacheName ] === undefined ) {

					this.cache[ cacheName ] = {};
					for ( let i = 0; i < this.cacheDependence.length; i ++ ) {

						let dependenceName = this.cacheDependence[ i ];
						this.cache[ cacheName ][ dependenceName + "Version" ] = 0;

					}

					if ( hasWave ) {

						this.cache[ cacheName ].waveStateVersion = 0;

					}

				}

				let needsUpdate = false;
				for ( let i = 0; i < this.cacheDependence.length; i ++ ) {

					let dependenceName = this.cacheDependence[ i ];
					if ( this.cache[ cacheName ][ dependenceName + "Version" ] !== this.states.discrete[ dependenceName ].thisStateVer ) {

						needsUpdate = true;
						break;

					}

				}

				if ( hasWave && needsUpdate === false ) {

					if ( this.cache[ cacheName ].waveStateVersion !== this.wavCre.version ) {

						needsUpdate = true;

					}

				}

				if ( needsUpdate ) {

					this.cache[ cacheName ].value = init.call( this );
					for ( let i = 0; i < this.cacheDependence.length; i ++ ) {

						let dependenceName = this.cacheDependence[ i ];
						this.cache[ cacheName ][ dependenceName + "Version" ] = this.states.discrete[ dependenceName ].thisStateVer;

					}

					if ( hasWave ) {

						this.cache[ cacheName ].waveStateVersion = this.wavCre.version;

					}

				}

				return this.cache[ cacheName ].value;

			}
		};

	}


}
