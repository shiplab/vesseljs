function InsertMooring(ship, states, motion) {
  // Cylinder code
  var designDimention = ship.structure.hull.attributes;
  var floatingStates = states.discrete.FloatingCondition.state;

  // var J = Euler2J1([motion]);

  var x0 = floatingStates.LWL/2+motion.surge;
  var y0 = floatingStates.BWL/2-motion.sway;
  var z0 = designDimention.Depth-floatingStates.T+motion.heave;

  // group = new THREE.Group();
  // var geometryCil = new THREE.CylinderGeometry( 0.1, 0.1, 0.5, 32 );
  // var materialCil = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // var cylinderCil;
  // cylinderCil = new THREE.Mesh( geometryCil, materialCil );

  // for (var i = 0; i < 100; i++) {
  //   array[i]
  // }
  // cylinderCil.translateX(x0);
  // cylinderCil.translateZ(y0);
  // cylinderCil.translateY(z0)
  // cylinderCil.rotateX(-Math.PI/4);
  // cylinderCil.translateY(-0.25);
  // group.add( cylinderCil );

  // Cylinder code
  // cylinderCil = new THREE.Mesh( geometryCil, materialCil );
  // cylinderCil.translateX(21.25);
  // cylinderCil.translateZ(4.25);
  // cylinderCil.rotateX(-Math.PI/4);
  // cylinderCil.translateY(-0.25);
  // group.add( cylinderCil );
  // group.children[0].position

  // scene.add( group );

  // The rope
  var materialLine = new THREE.LineBasicMaterial( {
	color: 0xffffff,
	linewidth: 1
} );

var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( x0, z0, y0 ),
	new THREE.Vector3( 0, 10, 0 ),
	new THREE.Vector3( 10, 0, 0 )
);

var line = new THREE.Line( geometry, materialLine );
scene.add( line );
// debugger
}
