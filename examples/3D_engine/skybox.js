import * as THREE from "./three_r126.js";

class Box extends THREE.Mesh {

	constructor( size ) {

		// load skybox (reusing example code to test the water shading fast)
		var cubeMap = new THREE.CubeTexture( [] );
		cubeMap.format = THREE.RGBFormat;
		var loader = new THREE.ImageLoader();

		loader.load( "3D_engine/textures/skyboxsun25degtest1.png", function ( image ) {

			var getSide = function ( x, y ) {

				var size = 1024;
				var canvas = document.createElement( "canvas" );
				canvas.width = size;
				canvas.height = size;
				var context = canvas.getContext( "2d" );
				context.drawImage( image, - x * size, - y * size );
				return canvas;

			};

			cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
			cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
			cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
			cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
			cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
			cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
			cubeMap.needsUpdate = true;

		} );
		var cubeShader = THREE.ShaderLib[ "cube" ];
		cubeShader.uniforms.envMap.value = cubeMap;

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: cubeShader.fragmentShader,
			vertexShader: cubeShader.vertexShader,
			uniforms: cubeShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide,
		} );

		super(
			new THREE.BoxBufferGeometry( size, size, size ),
			skyBoxMaterial
		);

		// Property for compatibility with Three review 118
		Object.defineProperty( skyBoxMaterial, "envMap", {
			get: function () {

				return this.uniforms.envMap.value;

			},
		} );

	}

}

class Sun extends THREE.DirectionalLight {

	constructor( size ) {

		super( 0xffffff, 2 );
		this.position.copy( this.getDefaultSunPosition( size ) );

	}

	getDefaultSunPosition( size ) {

		const factor = size / 2048;
		return new THREE.Vector3( - 512 / factor, 246 / factor, 128 / factor );

	}

}

export class Skybox extends THREE.Group {

	constructor( size ) {

		super();
		this.box = new Box( size );
		this.sun = new Sun( size );
		this.add( this.box );
		this.add( this.sun );

	}

	getMesh() {

		return this.box;

	}

	getSun() {

		return this.sun;

	}

}
