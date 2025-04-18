export class WaveCreator {

	constructor( defList, waveDuration = 3600 ) {

		this.waveDef = {}; // store wave definition
		this.version = 0; // version counter for memorisation pattern
		this.defList = defList || [ // list wave definitions
			[ 0.6, 2.25, 180 ],
			[ 1.1, 1.75, 150 ]
		];

		// set a regular wave definition
		this.setWaveDef = function setWaveDef( freq, amp, head ) {

			var newWaveDef;
			newWaveDef = {
				waveFreq: freq, // angular frequency
				waveAmplitude: amp,
				heading: head // 0 to 360. 180 corresponds to head seas
			};
			if ( JSON.stringify( this.waveDef ) !== JSON.stringify( newWaveDef ) ) {

				this.waveDef = newWaveDef;
				this.version ++;

			}

		};

		this.setRandom = function () { // set a wave definition randomly

			var rand = this.defList[ Math.floor( Math.random() * this.defList.length ) ];
			this.setWaveDef( rand[ 0 ], rand[ 1 ], rand[ 2 ] );

		};

		this.setTime = function ( time ) {

			// change wave definition along time
			var noSpans = time / this.waveDuration;
			var coord = Math.floor( noSpans % this.defList.length );

			this.setWaveDef( this.defList[ coord ][ 0 ], this.defList[ coord ][ 1 ], this.defList[ coord ][ 2 ] );

		};

	}

}
