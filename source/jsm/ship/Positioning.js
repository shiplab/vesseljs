import { StateModule } from "./StateModule.js";

export class Positioning {

	constructor( ship, states, path ) {

		this.ship = ship;
		this.states = states;

		this.routeData = {};
		this.routeData.pathVec = [];
		this.routeData.unitPath = [];
		this.routeData.heading = [];
		this.routeData.totalDist = 0;
		this.routeData.legDistance = [];
		for ( var leg = 0; leg < path.length - 1; leg ++ ) {

			this.routeData.pathVec[ leg ] = path[ leg + 1 ].map( ( num, idx ) => num - path[ leg ][ idx ] );
			this.routeData.legDistance[ leg ] = Math.sqrt( this.routeData.pathVec[ leg ].map( ( num ) => Math.pow( num, 2 ) ).reduce( ( num1, num2 ) => num1 + num2 ) );
			this.routeData.unitPath[ leg ] = this.routeData.pathVec[ leg ].map( ( num ) => num / this.routeData.legDistance[ leg ] );

			// get heading in relation to North/y axis
			var heading = Math.acos( this.routeData.pathVec[ leg ][ 1 ] / this.routeData.legDistance[ leg ] );
			heading *= 180 / Math.PI; // convert to degrees

			if ( this.routeData.pathVec[ leg ][ 0 ] < 0 ) {

				heading = 360 - heading;

			}

			this.routeData.heading[ leg ] = heading;

			this.routeData.totalDist += this.routeData.legDistance[ leg ];

		}

		// initialize vessel on path
		this.states.continuous.Positioning = {};
		this.states.continuous.Positioning.position = path[ 0 ];
		this.states.continuous.Positioning.travelLegDist = 0;
		this.states.continuous.Positioning.travelDist = 0;
		this.positionState = this.states.continuous.Positioning;

		this.states.discrete.Leg = {
			state: {
				leg: 0
			},
			thisStateVer: 1
		};
		this.legState = this.states.discrete.Leg.state;

		if ( typeof this.states.discrete.Speed === "undefined" ) { // if vessel does not have a speed state

			StateModule.prototype.setSpeed.call( this ); // use its design speed

		}

		if ( typeof this.states.discrete.Heading === "undefined" ) {

			StateModule.prototype.setHeading.call( this, this.routeData.heading[ 0 ] );

		}

		this.advanceShip = function ( timeStep ) { // calculate advanced distance during one time step

			var remVec, remDist;
			var advDist = timeStep * 1 / 3600 * this.states.discrete.Speed.state.speed;

			while ( 0 < advDist ) {

				remVec = path[ this.legState.leg + 1 ].map( ( num, idx ) => num - this.positionState.position[ idx ] );
				remDist = Math.sqrt( remVec.map( ( num ) => Math.pow( num, 2 ) ).reduce( ( num1, num2 ) => num1 + num2 ) );
				if ( advDist <= remDist ) {

					this.positionState.position = this.positionState.position.map( ( num, idx ) => num + advDist * this.routeData.unitPath[ this.legState.leg ][ idx ] );

					// add to traveled distance
					this.positionState.travelLegDist = this.positionState.travelLegDist + advDist;
					this.positionState.travelDist = this.positionState.travelDist + advDist;

					advDist = 0;

				} else if ( path[ this.legState.leg + 2 ] !== undefined ) { // trip has another leg

					// change direction and continue sailing
					advDist -= remDist;
					this.positionState.position = path[ this.legState.leg + 1 ];

					// add to traveled distance
					this.positionState.travelLegDist = 0;
					this.positionState.travelDist = this.positionState.travelDist + remDist;

					this.legState.leg ++;
					this.states.discrete.Leg.thisStateVer ++;

					StateModule.prototype.setHeading.call( this, this.routeData.heading[ this.legState.leg ] );
					console.log( "Vessel reached pivot point in navigation and entered leg " + this.legState.leg + "." );

				} else {

					this.positionState.position = this.positionState.position.map( ( num, idx ) => num + advDist * this.routeData.unitPath[ this.legState.leg ][ idx ] );

					// add to traveled distance
					this.positionState.travelLegDist = this.positionState.travelLegDist + advDist;
					this.positionState.travelDist = this.positionState.travelDist + advDist;

					console.log( "Vessel reached final destination." );
					break;

				}

			}

		};

	}

}
