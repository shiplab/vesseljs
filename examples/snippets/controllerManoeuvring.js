// Warning: This snippet requires the manoeuvringMovement declared in a global context
// the maneuvering key contains the manoeuvring information
// rotationText: is the rotation element in the documento
// angleText: is the rotation element in the documento
document.addEventListener( "keydown", onDocumentKeyDown, false );

function onDocumentKeyDown( event ) {

	var keyCode = event.which;
	var n = manoeuvringMovement.states.n;
  const DT = manoeuvringMovement.dt;
  const MAN = manoeuvringMovement.manoeuvring;
  const F = MAN.maxPropRot / 60;
  const T = MAN.maxTorque;
  const L = manoeuvringMovement.states.load;
	const LT = Math.abs(n * T);

	switch ( keyCode ) {

		case 87:
			if ( n <= F ) {

        if( L > 1 || LT < L ) { break; }

				manoeuvringMovement.states.n += MAN.helRate * DT;
				rotationText.innerText = ( 60 * manoeuvringMovement.states.n ).toFixed( 0 );

			}

			break;
		case 83:
			if ( n >= - F ) {

        if( L > 1 || LT < L ) { break; }

				manoeuvringMovement.states.n -= MAN.helRate * DT;
				rotationText.innerText = ( 60 * manoeuvringMovement.states.n ).toFixed( 0 );

			}

			break;
		case 65:
			manoeuvringMovement.states.rudderAngle -= MAN.rudderRate * DT;
			angleText.innerText = manoeuvringMovement.states.rudderAngle.toFixed( 1 );
			break;
		case 68:
			manoeuvringMovement.states.rudderAngle += MAN.rudderRate * DT;
			angleText.innerText = manoeuvringMovement.states.rudderAngle.toFixed( 1 );
			break;
		default:
			break;

	}

}
