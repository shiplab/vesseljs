/* ***************************************************************************************/
/*   Title: Sketchbook - Control Box
*    Author: @simondevyoutube
*    Date: 2020
*    License: MIT
*    Code version: 
*    Availability: https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js
*
****************************************************************************************/
// adapted from https://www.youtube.com/watch?v=UuNPHOJ_V5o&t=642s

class ThirdPersonCamera {
  // Class to follow a third person camera
	// params: Params for third person camera (obj)
	// params.object: object containing the information regarding the perspective view (obj)
	// params.camera: camera information (obj)
  // observation: The original function was changed to fit the coordinate system change @ferrari212

  constructor( params ) {

    this._params = params.object;
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
    
    // To assign the transformation of coordinates
    // with Y up in Three.js reference to Z up in Vessel.js @ferrari212
    this.rotateTaitBryan = Vessel.Vectors.rotateTaitBryan;
    this.rotVector = new THREE.Vector3(-Math.PI/2 , 0, 0);
  }

  _CalculateIdealOffset() {

    const idealOffset = new THREE.Vector3( 0, 20, 100 );
    const rotation = new THREE.Euler( 0, this._params.rotation._y, 0, 'XYZ' );
    
    const transformed =  this.rotateTaitBryan(this._params.position, this.rotVector)

    const move = new THREE.Vector3(transformed.x, transformed.y, transformed.z);

    idealOffset.applyEuler( rotation );
    idealOffset.add( move );
    return idealOffset;

  }

  _CalculateIdealLookat() {

    const idealLookat = new THREE.Vector3( 0, 0, - 200 );
    const rotation = new THREE.Euler( 0, this._params.rotation._y, 0 );
    
    const transformed =  this.rotateTaitBryan(this._params.position, this.rotVector);
    
    const move = new THREE.Vector3(transformed.x, transformed.y, transformed.z);

    idealLookat.applyEuler( rotation );
    idealLookat.add( move );
    return idealLookat;

  }

  Update( timeElapsed ) {

    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    const t = 4 * timeElapsed; // For a strong moving format @ferrari212

    this._currentPosition.lerp( idealOffset, t );
    this._currentLookat.lerp( idealLookat, t );

    this._camera.position.copy( this._currentPosition );
    this._camera.lookAt( this._currentLookat );

  }

}