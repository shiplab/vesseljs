//@EliasHasle

/*Dependencies: THREE, Mirror, WaterShader, dat.gui (for gui only), browse_files_Elias_Hasle, Patch_interpolation, WaveCreator */
/*This is similar to the file Configurable_ocean.js, but simplified to a single regular wave */

// "use strict";

import * as Vessel from "../../source/jsm/vessel.js";
import { Water } from "./Water.js";
import * as THREE from "../../../examples/3D_engine/three_r126.js";


var Wave = function () {

	var waveCount = 0;

	return function ( waveType ) {

		this.waveId = waveCount;
		waveCount ++;

		this.waveType = waveType;

	};

}();

// export class Wave {

// 	constructor( waveType ) {

// 		this.waveType = waveType;

// 	}

// }

export class DirectionalCosine extends Wave {

	//params: A, T, theta, phi
	constructor( params ) {

		super();

		params = params || {};
		let oceanconf = params.parentGUI;

		Wave.call( this, "Cosine" );

		//amplitude
		// if ( typeof params.A !== "undefined" ) this.A = params.A;
		this.A = typeof params.A !== "undefined" ? params.A : 2.0;

		//period
		this.T = typeof params.T !== "undefined" ? params.T : 5.0;

		//direction
		this.theta = typeof params.theta !== "undefined" ? params.theta : 0.0;

		//phase shift
		this.phi = typeof params.phi !== "undefined" ? params.phi : 0.0;


		this.updateWavelength();

	}

	get T() {

		return this._T;

	}

	set T( newvalue ) {

		this._T = newvalue;
		this.omega = 2 * Math.PI / this._T;
		this.updateWavelength();

	}

	get theta() {

		return this._theta;

	}

	set theta( newvalue ) {

		this._theta = newvalue;
		this.costh = Math.cos( this._theta * Math.PI / 180 );
		this.sinth = Math.sin( this._theta * Math.PI / 180 );

	}

	updateWavelength() {

		let g = 9.81;
		this.L = g * this.T * this.T / ( 2 * Math.PI );

		if ( this.conf ) this.conf.updateDisplay(); //TEST

	}

	calculate( x, y, t ) {

		let xm = x * this.costh + y * this.sinth;
		return this.A * Math.cos( this.phi * Math.PI / 180 + 2 * Math.PI * ( xm / this.L ) - this.omega * t );

	}

}


export class Ocean extends THREE.Mesh {

	constructor( params ) {

		params = params || {};
		const size = params.size || 2048;
		const segments = params.segments || 127;
		let waterGeometry = new THREE.PlaneBufferGeometry( size, size, segments, segments );
		let waterNormals, water;

		/*
		The WaterShader is from the THREE examples.
		The mirror effect does not account for geometry, and there is no self-mirroring. But it mostly looks OK anyway. On tall waves, one can see that the rendered texture is stretched.
		*/
		try {

			waterNormals = new THREE.TextureLoader().load( "3D_engine/textures/waternormals.jpg", function ( texture ) {

				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

			} );

			water = new Water( waterGeometry, {
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: waterNormals,
				alpha: 1.0,
				sunDirection: params.sunDirection,
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 50.0
			} );

		} catch ( e ) {

			// work around for when the water shader fails
			console.log( "Water normals failed to load.", e );
			waterNormals = new THREE.MeshPhongMaterial( {
				color: 0x041020,
				side: THREE.DoubleSide,
				wireframe: true
			} );

			water = {
				render: function () { },
				material: { uniforms: { time: { value: 0 } } },
			};

		}

		super( waterGeometry, waterNormals );

		// Containerized WaveCreator
		this.wavCre = new Vessel.WaveCreator();

		// Set the waveMotion as undefined by default
		this.waveMotion = undefined;

		// Assigning the size and segments to the object
		this.size = params.size || 2048;
		this.segments = params.segments || 127;

		this.water = water;

		// In case that no shader is available, set an axis helper
		this.add( typeof this.water == undefined ? new THREE.AxisHelper( 600 ) : this.water );


		// try {


		// 	this.water = new Water( waterGeometry, {
		// 		textureWidth: 512,
		// 		textureHeight: 512,
		// 		waterNormals: new THREE.TextureLoader().load( "3D_engine/textures/waternormals.jpg", function ( texture ) {

		// 			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		// 		} ),
		// 		alpha: 1.0,
		// 		sunDirection: params.sunDirection,
		// 		sunColor: 0xffffff,
		// 		waterColor: 0x001e0f,
		// 		distortionScale: 50.0
		// 	} );

		// 	THREE.Mesh.call( this, waterGeometry, /*new THREE.MeshPhongMaterial({
		// 	color: 0x041020,
		// 	side: THREE.DoubleSide,
		// 	wireframe: true
		// }),*/ this.water.material ); //clear it to show the ocean

		// 	this.add( this.water );

		// } catch ( e ) {

		// 	THREE.Mesh.call( this,
		// 		new THREE.PlaneBufferGeometry( this.size, this.size, this.segments, this.segments ),
		// 		new THREE.MeshPhongMaterial( {
		// 			color: 0x041020,
		// 			side: THREE.DoubleSide,
		// 			wireframe: true
		// 		} ) );
		// 	//Dummy object to avoid bugs when water shader fails
		// 	this.water = {
		// 		render: function () { },
		// 		material: { uniforms: { time: { value: 0 } } }
		// 	};
		// 	//Axes:
		// 	this.add( new THREE.AxisHelper( 600 ) );

		// }

		this.waves = [];
		let scope = this;

		if ( params.parentGUI ) {

			this.conf = params.parentGUI.addFolder( "Ocean" );
			this.conf.open();


			//Cos menu
			this.currentCos = new DirectionalCosine();//{A:NaN,T:NaN,theta:NaN,phi:NaN}); //dummy object
			let pcos = new Proxy( /*ptarget*/{}, {
				get: function ( obj, prop ) {

					return scope.currentCos[ prop ];

				},
				set: function ( obj, prop, value ) {

					scope.currentCos[ prop ] = value;
					scope.wavCre.setWaveDef( 2 * Math.PI / scope.currentCos[ "T" ], scope.currentCos[ "A" ], scope.currentCos[ "theta" ] );

					// Update WaveMotion in case it is defined
					if ( scope.waveMotion != undefined ) {

						scope.waveMotion.writeOutput();

					}

					return true; //debug

				},
				ownKeys: function ( obj ) {

					return Object.getOwnPropertyNames( scope.currentCos );

				}
			} );
			this.conf.add( pcos, "A", 0.0, 10.0, 0.1 ).name( "Amplitude (A)" );
			this.conf.add( pcos, "T", 2.0, 20.0, 0.1 ).name( "Period (T)" );
			//Wave length is a consequence of period due to dispersion relation
			//this.conf.add(pcos, "L", 6.0, 700.0, 0.5).name("Length (L)");
			this.conf.add( pcos, "theta", 0, 360, 0.01 ).name( "<div>Direction (&theta;)</div>" );
			this.conf.add( pcos, "phi", - 180, 180, 0.01 ).name( "<div>Phase (&Phi;)</div>" );

			//Dispose of temporary cosine wave object
			this.currentCos = {};
			this.conf.updateDisplay();

		}

	}

	addCosineWave( params ) {

		params = params || {};
		let w = new DirectionalCosine( params );
		this.waves.push( w );
		this.wavCre.setWaveDef( 2 * Math.PI / w[ "T" ], w[ "A" ], w[ "theta" ] );

		this.currentCos = w;

		if ( this.conf ) {

			this.conf.updateDisplay();
			this.conf.open();

		}

		return w;

	}

	calculateZ( x, y, t ) {

		let z = 0;
		for ( let w of this.waves ) {

			z += w.calculate( x, y, t );

		}

		return z;

	}

	// This function must be generalized to whichever ship in the sea
	addWaveMotion( wavMo ) {

		this.waveMotion = wavMo;

	}

	//It appears the y axis was inverted here.
	//I fixed it, but am not sure how it was wrong.
	update( t ) {

		let pos = this.geometry.getAttribute( "position" );

		let size = this.size;
		let segs = this.segments;

		//REGULAR GRID:
		let vSize = segs + 1;
		for ( let j = 0; j < vSize; j ++ ) {

			let y = ( 0.5 - j / segs ) * size;//(j/segs-0.5)*size;
			for ( let i = 0; i < vSize; i ++ ) {

				let x = ( i / segs - 0.5 ) * size;
				let z = this.calculateZ( x, y, t );
				pos.setZ( j * vSize + i, z );

			}

		}

		pos.needsUpdate = true;
		this.geometry.computeVertexNormals();

		this.water.material.uniforms.time.value = t;

	}

}
