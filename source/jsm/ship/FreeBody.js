/*
@ferrari212
Dependecies: numeric.js

All the values units are considered in SI sysetm
m: mass (kg)
I: Inertia Matrix (3x3) (kg * m²)
D: Damping Matrix (3x3) (kg  * s)
yaw: Yaw angle (rad)
*/
import { StateModule } from "./StateModule.js";

class FreeBody extends StateModule {

	constructor( ship, states, hullResistance, propellerInteraction, fuelConsumption, bodyObj, rho = 1025 ) {

		// body variable in the format {m}

		// constructor( m = 0, I = [[ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ]] ) {
		super( ship, states );

		if ( typeof this.states.discrete.FloatingCondition === "undefined" ) {

			this.setDraft();

		}

		if ( typeof this.states.discrete.Speed === "undefined" ) { // if vessel does not have a speed state

			this.setSpeed(); // use its design speed

		}

		this.hullRes = hullResistance;
		this.propellerInteraction = propellerInteraction;
		this.fuelConsumption = fuelConsumption;
		this.powerPlant = fuelConsumption.powerPlant;
		this.manoeuvring = manoeuvring;
		this.state = {};
		this.rho = propellerInteraction.rho;
		this.propeller = this.propellerInteraction.propeller;
		this.speedState = this.states.discrete.Speed.state;
		this.floatState = this.states.discrete.FloatingCondition.state;
		this.resistanceState = this.states.discrete.HullResistance.state;

		try {
			if (!bodyObj.hasOwnProperty( "M" )) {
				throw "Object have no Property M"
			}
			const dimensions = [
				arr.length,
				arr.reduce((x, y) => Math.max(x, y.length), 0),
				arr.reduce((x, y) => Math.min(x, y.length), 0)
			];

			if (dimensions !== [3, 3, 3]) {
				throw "M Dimension not set as a matrix 3X3"
			}

			this.M = bodyObj["M"]
		} catch (error) {
			console.log(e, ", null matrix is set up instead");
			this.M = [[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			];		
		}

		

		if (!bodyObj.hasOwnProperty( "M" )) {
			throw "Object have no Property M"
		}

		let m = ? ( bodyObj || 0 ) : bodyObj

			this.M = [[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			];
		this.I = I;

	}

	setDiagonalMassMatrix(m) {
		this.M = [[ 0, 0, 0 ],
				[ 0, 0, 0 ],
				[ 0, 0, 0 ]
			];
	}

}

class ManoeuvringModel extends FreeBody {

	constructor( m, I, D, initial_yaw = 0 ) {

		super( m, I, D );

		Object.assign( this, {
			// X: {x:0, y:0, yaw: 0},
			DX: { x: 0, y: 0, yaw: 0 },
			V: { u: 0, v: 0, yaw_dot: 0 },
			n: 0,
			yaw: initial_yaw,
			rudderAngle: 0
		} );
		// debugger

		// this.state = {
		//   // X: {x:0, y:0, yaw: 0},
		//   DX: {x:0, y:0, yaw: 0},
		//   V: {u:0, v:0, yaw_dot:0},
		//   n: 0,
		//   yaw: initial_yaw,
		//   rudderAngle: 0
		// }

		if ( D === undefined ) {

			console.warn( "Model with no defined damping value" );
			D = [[ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ]];

		}

		this.M_RB = numeric.add( this.M, this.I );
		this.INVM = numeric.inv( this.M_RB );
		this.INVMD = numeric.dot( numeric.neg( this.INVM ), D );
		this.setMatrixes();

	}

	setMatrixes = ( F = [ 0, 0, 0 ], yaw = 0 ) => {

		this.R = this.parseR( yaw );
		this.A = this.parseA( this.R, this.INVMD );
		const INVMF = numeric.dot( this.INVM, F );
		this.B = this.parseB( INVMF );

	};

	parseA = ( R, M ) => {

		var A = [];

		for ( let i = 0; i < 6; i ++ ) {

			A.push( [ 0, 0, 0, 0, 0, 0 ] );

		}

		for ( let i = 0; i < 6; i ++ ) {

			for ( let j = 0; j < 6; j ++ ) {

				if ( j < 3 ) {

					A[ i ][ j ] = 0;

				} else {

					A[ i ][ j ] = i < 3 ? R[ i ][ j - 3 ] : M[ i - 3 ][ j - 3 ];

				}

			}

		}

		return A;

	};

	parseB = ( INVMF ) => {

		return [ 0, 0, 0, INVMF[ 0 ], INVMF[ 1 ], INVMF[ 2 ] ];

	};

	parseR = ( yaw ) => {

		var trig = { cos: Math.cos( yaw ), sin: Math.sin( yaw ) };
		return [[ trig.cos, - trig.sin, 0 ],
			[ trig.sin, trig.cos, 0 ],
			[ 0, 0, 1 ]
		];

	};

	getDerivatives = ( V = { u: 0, v: 0, yaw_dot: 0 } ) => {

		var X = [ 0,
			0,
			0,
			V.u,
			V.v,
			V.yaw_dot
		];

		var X_dot = numeric.add( numeric.dot( this.A, X ), this.B );

		return X_dot;

	};

	getDisplacements = ( dt, V, self ) => {

		// Parse matrix V
		var X = [ 0, 0, 0, V.u, V.v, V.yaw_dot ];

		// debugger
		var sol = numeric.dopri( 0, dt, X, function ( t, V ) {

			return self.getDerivatives( { u: X[ 3 ], v: X[ 4 ], yaw_dot: X[ 5 ] } );

		}, 1e-8, 100 ).at( dt );

		// Get global coordinates variation (dx, dy, dyaw)
		// Get local velocity (du, dv, dyaw_dot)
		this.DX = { x: sol[ 0 ], y: sol[ 1 ], yaw: sol[ 2 ] };
		this.V = { u: sol[ 3 ], v: sol[ 4 ], yaw_dot: sol[ 5 ] };
		this.yaw += this.DX.yaw;

	};

}
