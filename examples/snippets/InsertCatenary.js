// Catenary class will conect point A to point B
// it have as variable specifications about the Cables
// and return the geometry and forces (if applicable) and
// hanged line geometry

class Catenary {
  constructor(initialPoint, finalPoint, line, divisions) {
    // Inserting states
    this.initialPoint = initialPoint;
    this.finalPoint = finalPoint;
    this.line = line;
    this.divisions = divisions;
  }

  calculateDistances() {
    // Mathematical library
    var mathVessel = Vessel.Vectors

    // Calculates distances
    this.line.distance = mathVessel.sub(this.initialPoint, this.finalPoint);
    this.line.distance.planeDist = Math.sqrt(Math.pow(this.line.distance.x,2)+Math.pow(this.line.distance.y,2));
    this.line.distance.absolute = mathVessel.normSquared(this.line.distance);
    this.line.distance.absolute = Math.sqrt(this.line.distance.absolute);

    // Calculate angles
    this.line.angles = {};
    this.line.angles.cos = this.line.distance.x/this.line.distance.planeDist;
    this.line.angles.sin = this.line.distance.y/this.line.distance.planeDist;

    // Suspended Lenght
    this.line.suspendedLine = {};
  }

  createGeometry(elementLine, a, divisions) {
    const dx = elementLine.xs / divisions; // m (Distance variation)

    // Creating the positions
    var x = [];
    var y = [];
    var z = [];

    for (var d = elementLine.xs; d >= 0; d -= dx) {
      x.push(elementLine.initialPoint.x - (elementLine.xs - d)*elementLine.line.angles.cos);
      y.push(elementLine.initialPoint.y - (elementLine.xs - d)*elementLine.line.angles.sin);
      z.push(elementLine.initialPoint.z - elementLine.line.distance.z + a * (Math.cosh(d / a) - 1));
    }

    if (!elementLine.line.geometry.vertices.length) {

      for (var i = 0; i < x.length; i++) {
        elementLine.line.geometry.vertices.push(new THREE.Vector3(x[i],y[i],z[i]));
      }

      elementLine.line.geometry.vertices.push(
        new THREE.Vector3(
          elementLine.finalPoint.x,
          elementLine.finalPoint.y,
          elementLine.finalPoint.z
        )
      );

    } else {
      // Erasing the element
      elementLine.line.geometry.vertices = [];

      for (var m = 0; m < x.length; m++) {
        elementLine.line.geometry.vertices.push(
          {
            x:x[m],
            y:y[m],
            z:z[m]
          }
        )
      }

      elementLine.line.geometry.vertices.push(
        {
          x:elementLine.finalPoint.x,
          y:elementLine.finalPoint.y,
          z:elementLine.finalPoint.z
        }
      )
    }

  }

  createLine(geometry, materialLine){

    if (this.line.object  == null) {
      this.line.object = new THREE.Line(geometry, materialLine);
    }


    this.line.object.geometry.verticesNeedUpdate = true;
  }
}

class Cable extends Catenary {
  constructor(initialPoint, finalPoint, line, divisions) {
    super(initialPoint, finalPoint, line, divisions);
    this.calculateCatenaryGeometry()
  }

  calculateCatenaryGeometry() {
    super.calculateDistances();

    // Coef
    var a = this.line.horizontalForce / this.line.w;

    this.line.suspendedLine.length = Math.sqrt(this.line.oceanDepth * (this.line.oceanDepth + 2 * a));

    this.xs = a * Math.asinh(this.line.suspendedLine.length / a); // m (Horizontal distance of the ship)

    super.createGeometry(this, a, this.divisions)

    super.createLine(this.line.geometry, this.line.materialLine);
  }
}

class Mooring extends Catenary {
  constructor(initialPoint, finalPoint, line, divisions) {
    super(initialPoint, finalPoint, line, divisions);
    this.calculateMooringGeometry();
  }

  calculateMooringGeometry () {
    super.calculateDistances();

    var fa = []; // Guesses necessary for solving Eq. (m)
    var as = numeric.linspace(0.01, this.line.anchorLength, this.divisions); // Possible values of coef. a (m)
    var a; // Value of coef. (m)

    if (typeof this.line.horizontalForce == "number") {
      console.info('Defined Horizontal Force. Consider using Cable class');
    }

    this.horizontalForce = 0; // Horizontal Force on the ship (kgf)

    for (var n = 0; n < as.length; n++) {
      fa[n] = this.line.anchorLength - this.line.distance.planeDist - as[n] * Math.sinh(Math.acosh((Math.abs(this.line.distance.z)/as[n])+1)) + as[n] * Math.acosh((Math.abs(this.line.distance.z)/as[n])+1);
    }


    a = numeric.spline(as, fa).roots();

    // Checking geometry feasibility
    if (a.length == 0) {
      console.warn( 'Impossible catenary geometry. Consider changing cable length or attachment points.' );
      this.line.geometry.vertices = [];
      return
    }

    a = a[0];

    this.horizontalForce = a*this.line.w; // Horizontal Force on the ship (kgf)
    this.lengthSuspended = a * Math.sinh(Math.acosh((Math.abs(this.line.distance.z)/a)+1)) // Suspended Lenght (m)
    this.xs = a * Math.asinh(Math.abs(this.lengthSuspended) / a); // Suspended Lenght Distance Plane (m)
    this.verticalForce = this.line.w*this.lengthSuspended; // Horizontal Force on the ship (kgf)

    this.dx = this.xs / this.divisions; // m (Distance variation)

    super.createGeometry(this, a, this.divisions);

    super.createLine(this.line.geometry, this.line.materialLine);
  }
}
