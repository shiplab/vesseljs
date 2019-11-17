// This function will conect point A to point B
// it will have as variable other specification about the Cables
// it will return the geometry and the forces if appliable and
// hanged line geometry
function InsertCatenary(PointA, PointB, line, divisions) {

	// var hangedMooring

	// Attribuiting the mathematical library
	var mathVessel = Vessel.Vectors


	// Calculates distances
	line.distance = mathVessel.sub(PointB, PointA);
	line.distance.planeDist = Math.sqrt(Math.pow(line.distance.x,2)+Math.pow(line.distance.y,2))
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
	}

	line.object = new THREE.Line(line.geometry, line.materialLine);
	line.object.geometry.verticesNeedUpdate = true;
	// insert zUpCont as variable
	zUpCont.add(line.object);

	return this.Geometry,  this.Geometry
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
		  PointA.x + (xs - d)*line.angles.cos,
		  PointA.y + (xs - d)*line.angles.sin,
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

  InsertCatenary.prototype.GeometryAndForce = function() {

  }
