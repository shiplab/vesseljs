// This function will conect point A to point B
// it will have as variable other specification about the Cables
// it will return the geometry and the forces if appliable and
// hanged line geometry

class InsertCatenary {
  constructor(PointA, PointB, line, divisions) {

    // Mathematical library
    var mathVessel = Vessel.Vectors


    // Calculates distances
    line.distance = mathVessel.sub(PointB, PointA);
    line.distance.planeDist = Math.sqrt(Math.pow(line.distance.x,2)+Math.pow(line.distance.y,2));
    line.distance.absolute = mathVessel.normSquared(line.distance);
    line.distance.absolute = Math.sqrt(line.distance.absolute);

    // Calculate angles
    line.angles = {};
    line.angles.cos = line.distance.x/line.distance.planeDist;
    line.angles.sin = line.distance.y/line.distance.planeDist;

    // Suspended Lenght
    line.suspendedLine = {};

    if (typeof line.horizontalForce == "number") {
      this.Geometry(PointA, PointB, line, divisions);
    } else {
      this.GeometryAndForce(PointA, PointB, line, divisions);
    }

    line.object = new THREE.Line(line.geometry, line.materialLine);
    line.object.geometry.verticesNeedUpdate = true;
    // insert zUpCont as variable
    zUpCont.add(line.object);

    // return this.Geometry,  this.Geometry
  }
  Geometry(PointA, PointB, line, divisions){
    // Coef
    var a = line.horizontalForce / line.w;

    line.suspendedLine.length = Math.sqrt(line.oceanDepth * (line.oceanDepth + 2 * a));

    this.xs = a * Math.asinh(line.suspendedLine.length / a); // m (Horizontal distance of the ship)
    const dx = this.xs / divisions; // m (Distance variation)

    // Inserting Vertices
    for (var d = this.xs; d >= 0; d -= dx) {
      line.geometry.vertices.push(
        new THREE.Vector3(
          PointA.x + (this.xs - d)*line.angles.cos,
          PointA.y + (this.xs - d)*line.angles.sin,
          a * (Math.cosh(d / a) - 1) - line.oceanDepth
        )
      );
    }
    line.geometry.vertices.push(
      new THREE.Vector3(
        PointB.x,
        PointB.y,
        PointB.z
      )
    );
  }
  GeometryAndForce(PointA, PointB, line, divisions){
    var fa = []; // Guesses necessary for solving Eq. (m)
    var as = numeric.linspace(0.01, line.anchorLength, divisions); // Possible values of coef. a (m)
    var a; // Value of coef. (m)

    this.horizontalForce = 0; // Horizontal Force on the ship (kgf)

    for (var n = 0; n < as.length; n++) {
      fa[n] = line.anchorLength - line.distance.planeDist - as[n] * Math.sinh(Math.acosh((Math.abs(line.distance.z)/as[n])+1)) + as[n] * Math.acosh((Math.abs(line.distance.z)/as[n])+1);
    }

    a = numeric.spline(as, fa).roots();

    this.horizontalForce = a[0]*line.w; // Horizontal Force on the ship (kgf)
    this.lengthSuspended = a[0] * Math.sinh(Math.acosh((Math.abs(line.distance.z)/a[0])+1)) // Suspended Lenght (m)
    this.xs = a[0] * Math.asinh(Math.abs(this.lengthSuspended) / a[0]); // Suspended Lenght Distance Plane (m)
    this.verticalForce = line.w*this.lengthSuspended; // Horizontal Force on the ship (kgf)

    const dx = this.xs / divisions; // m (Distance variation)

    // Inserting Vertices
    for (var d = this.xs; d >= 0; d -= dx) {
      line.geometry.vertices.push(
        new THREE.Vector3(
          PointA.x + (this.xs - d)*line.angles.cos,
          PointA.y + (this.xs - d)*line.angles.sin,
          a[0] * (Math.cosh(d / a[0]) - 1) + line.distance.z
        )
      );
    }
    line.geometry.vertices.push(
      new THREE.Vector3(
        PointB.x,
        PointB.y,
        PointB.z
      )
    );
  }
}
