// This function will conect point A to point B
// it will have as variable other specification about the Cables
// it will return the geometry and the forces if appliable and
// hanged geometry
function InsertCatenary(PointA, PointB, line, division) {

  // var hangedMooring

  // Attribuiting the mathematical library
  var mathVessel = Vessel.Vectors


  // Calculates distance
  line.distance = mathVessel.sub(PointA, PointB);
  line.distance.absolute = mathVessel.normSquared(line.distance);
  line.distance.absolute = Math.sqrt(line.distance.absolute);

  console.log(PointA);
  console.log(PointB);
  console.log(line);

  // Coef
  var a = line.horizontalForce / line.w;

  // Suspended Lenght
  line.suspendedLine = {};
  line.suspendedLine.length = Math.sqrt(line.oceanDepth * (line.oceanDepth + 2 * a));


  var xs = a * Math.asinh(line.suspendedLine.length / a); // m (Horizontal distance of the ship)
  const dx = xs / division; // m (Distance variated)

  // The rope
  var materialLine = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 1
  });

  var geometry = new THREE.Geometry();
  // geometry.vertices.push(
  //   new THREE.Vector3(0, 10, 0),
  //   new THREE.Vector3(10, 0, 0)
  // );

  var line = new THREE.Line(geometry, materialLine);
  scene.add(line);
  // debugger

  // Ploting Line
  for (var d = xs; d >= 0; d -= dx) {
    // hangedMooring[i][m] = [anchorPointOnShip[i][0] + (xs - d) * (anchorAngle[i][0]),
    //   a[i] * (Math.cosh(d / a[i]) - 1) - oceanDepth,
    //   anchorPointOnShip[i][2] + (xs - d) * (anchorAngle[i][1])
    // ];

    console.log(d);

    geometry.vertices.push(
      new THREE.Vector3(
        PointA.x + (xs - d),
        PointA.y + (xs - d),
        a * (Math.cosh(d / a) - 1) - line.oceanDepth
      )
    );
  }


  // this.calculateGeometry(a, )

}
