// This function will conect point A to point B
// it will have as variable other specification about the Cables
// it will return the geometry and the forces if appliable and
// hanged geometry
function InsertCatenary(PointA, PointB, line, divisions) {

  // var hangedMooring

  // Attribuiting the mathematical library
  var mathVessel = Vessel.Vectors


  // Calculates distance
  line.distance = mathVessel.sub(PointA, PointB);
  line.distance.absolute = mathVessel.normSquared(line.distance);
  line.distance.absolute = Math.sqrt(line.distance.absolute);



  // Suspended Lenght
  line.suspendedLine = {};

  if (typeof line.horizontalForce == "number") {
    this.Geometry(PointA, PointB, line, divisions);
  }

  line.line = new THREE.Line(line.geometry, line.materialLine);
  line.geometry.verticesNeedUpdate = true;
  zUpCont.add(line.line);

}

InsertCatenary.prototype.Geometry = function(PointA, PointB, line, divisions) {
  // Coef
  var a = line.horizontalForce / line.w;

  line.suspendedLine.length = Math.sqrt(line.oceanDepth * (line.oceanDepth + 2 * a));

  var xs = a * Math.asinh(line.suspendedLine.length / a); // m (Horizontal distance of the ship)
  const dx = xs / divisions; // m (Distance variation)

  // Inserting Vertices
  for (var d = xs; d >= 0; d -= dx) {
    line.geometry.vertices.push(
      new THREE.Vector3(
        PointA.x + (xs - d),
        PointA.y + (xs - d),
        a * (Math.cosh(d / a) - 1) - line.oceanDepth
      )
    );
  }
}

InsertCatenary.prototype.GeometryAndForce = function() {

}
