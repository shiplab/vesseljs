//@EliasHasle

/*
THREE.js Object3D constructed from Vessel.js Ship object.

There are some serious limitations to this:
1. null values encountered are assumed to be either at the top or bottom of the given station.
2. The end caps and bulkheads are sometimes corrected with zeros where they should perhaps have been clipped because of null values.
*/

//var hMat; //global for debugging

function Ship3D(ship, stlPath) {
	THREE.Group.call(this);

	this.ship = ship;

	let hull = ship.structure.hull;

	let LOA = hull.attributes.LOA;
	let BOA = hull.attributes.BOA;
	let Depth = hull.attributes.Depth;

	//console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);

	this.position.z = -ship.designState.calculationParameters.Draft_design;

	//Hull
	let stations = hull.halfBreadths.stations;
	let waterlines = hull.halfBreadths.waterlines;
	let table = hull.halfBreadths.table;
	//None of these are changed during correction of the geometry.

	console.log(stations);
	console.log(waterlines);
	console.log(table);

	let N = stations.length;
	let M = waterlines.length;
	//Hull side, in principle Y offsets on an XZ plane:
	//Even though a plane geometry is usually defined in terms of Z offsets on an XY plane, the order of the coordinates for each vertex is not so important. What is important is to get the topology right. This is ensured by working with the right order of the vertices.
	let hGeom = new THREE.PlaneBufferGeometry(undefined, undefined, N - 1, M - 1);
	let pos = hGeom.getAttribute("position");
	let pa = pos.array;

	//loop1:
	//zs
	let c = 0;
	//Iterate over waterlines
	for (let j = 0; j < M; j++) {
		//loop2:
		//xs
		//iterate over stations
		for (let i = 0; i < N; i++) {
			//if (table[j][i] === null) continue;// loop1;
			pa[c] = stations[i]; //x
			//DEBUG, OK. No attempts to read outside of table
			/*if(typeof table[j] === "undefined") console.error("table[%d] is undefined", j);
			else if (typeof table[j][i] === "undefined") console.error("table[%d][%d] is undefined", j, i);*/
			//y
			pa[c + 1] = table[j][i]; //y
			pa[c + 2] = waterlines[j]; //z
			c += 3;
		}
	}
	//console.error("c-pa.length = %d", c-pa.length); //OK, sets all cells

	//Get rid of nulls by merging their points with the closest non-null point in the same station:
	/*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
	let uv = hGeom.getAttribute("uv");
	let uva = uv.array;
	//Iterate over stations
	for (let i = 0; i < N; i++) {
		let firstNumberJ;
		let lastNumberJ;
		//Iterate over waterlines
		let j;
		for (j = 0; j < M; j++) {
			let y = table[j][i];
			//If this condition is satisfied (number found),
			//the loop will be quitted
			//after the extra logic below:
			if (y !== null) {
				firstNumberJ = j;
				lastNumberJ = j;
				//copy vector for i,j to positions for all null cells below:
				let c = firstNumberJ * N + i;
				let x = pa[3 * c];
				let y = pa[3 * c + 1];
				let z = pa[3 * c + 2];
				let d = c;
				while (firstNumberJ > 0) {
					firstNumberJ--;
					d -= N;
					pa[3 * d] = x;
					pa[3 * d + 1] = y;
					pa[3 * d + 2] = z;
					uva[2 * d] = uva[2 * c];
					uva[2 * d + 1] = uva[2 * c + 1];
				}
				break;
			}
			console.log("null encountered.");
		}

		//Continue up the hull (with same j counter), searching for upper number. This does not account for the existence of numbers above the first null encountered.
		for (; j < M; j++) {
			let y = table[j][i];
			if (y === null) {
				console.log("null encountered.");
				break;
			}
			//else not null:
			lastNumberJ = j;
		}

		//copy vector for i,j to positions for all null cells above:
		let c = lastNumberJ * N + i;
		let x = pa[3 * c];
		let y = pa[3 * c + 1];
		let z = pa[3 * c + 2];
		let d = c;
		while (lastNumberJ < M - 1) {
			lastNumberJ++;
			d += N;
			pa[3 * d] = x;
			pa[3 * d + 1] = y;
			pa[3 * d + 2] = z;
			uva[2 * d] = uva[2 * c];
			uva[2 * d + 1] = uva[2 * c + 1];
		}
		//////////
	}

	//console.log(pa);

	pos.needsUpdate = true;
	uv.needsUpdate = true;
	hGeom.computeVertexNormals();

	//Bow cap:
	let bowPlaneOffsets = hull.getStation(LOA).map(str => str / (0.5 * BOA)); //normalized
	let bowCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
	pos = bowCapG.getAttribute("position");
	pa = pos.array;
	//constant x-offset yz plane
	for (let j = 0; j < M; j++) {
		pa[3 * (2 * j)] = 1;
		pa[3 * (2 * j) + 1] = bowPlaneOffsets[j];
		pa[3 * (2 * j) + 2] = waterlines[j];
		pa[3 * (2 * j + 1)] = 1;
		pa[3 * (2 * j + 1) + 1] = -bowPlaneOffsets[j];
		pa[3 * (2 * j + 1) + 2] = waterlines[j];
	}
	pos.needsUpdate = true;

	//Aft cap:
	let aftPlaneOffsets = hull.getStation(0).map(str => str / (0.5 * BOA)); //normalized
	let aftCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
	pos = aftCapG.getAttribute("position");
	pa = pos.array;
	//constant x-offset yz plane
	for (let j = 0; j < M; j++) {
		pa[3 * (2 * j)] = 0;
		pa[3 * (2 * j) + 1] = -aftPlaneOffsets[j];
		pa[3 * (2 * j) + 2] = waterlines[j];
		pa[3 * (2 * j + 1)] = 0;
		pa[3 * (2 * j + 1) + 1] = aftPlaneOffsets[j];
		pa[3 * (2 * j + 1) + 2] = waterlines[j];
	}
	pos.needsUpdate = true;

	//Bottom cap:
	let bottomPlaneOffsets = hull.getWaterline(0).map(hw => hw / (0.5 * BOA)); //normalized
	let bottomCapG = new THREE.PlaneBufferGeometry(undefined, undefined, N - 1, 1);
	pos = bottomCapG.getAttribute("position");
	pa = pos.array;
	//constant z-offset xy plane
	for (let i = 0; i < N; i++) {
		pa[3 * (i)] = stations[i];
		pa[3 * (i) + 1] = -bottomPlaneOffsets[i];
		pa[3 * (i) + 2] = 0;
		pa[3 * (N + i)] = stations[i];
		pa[3 * (N + i) + 1] = bottomPlaneOffsets[i];
		pa[3 * (N + i) + 2] = 0;
	}
	pos.needsUpdate = true;

	//Hull material
	let phong = THREE.ShaderLib.phong;
	let commonDecl = "uniform float wlThreshold;uniform vec3 aboveWL; uniform vec3 belowWL;\nvarying vec3 vPos;";
	let hMat = new THREE.ShaderMaterial({
		uniforms: THREE.UniformsUtils.merge([phong.uniforms, {
			wlThreshold: new THREE.Uniform(ship.designState.calculationParameters.Draft_design / Depth),
			aboveWL: new THREE.Uniform(new THREE.Color(0x33aa33)),
			belowWL: new THREE.Uniform(new THREE.Color(0xaa3333))
		}]),
		vertexShader: commonDecl + phong.vertexShader.replace("main() {", "main() {\nvPos = position.xyz;").replace("#define PHONG", ""),
		fragmentShader: commonDecl + phong.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );",
			"vec4 diffuseColor = vec4( (vPos.z>wlThreshold)? aboveWL.rgb : belowWL.rgb, opacity );").replace("#define PHONG", ""),
		side: THREE.DoubleSide,
		lights: true,
		transparent: true
	});
	hMat.uniforms.opacity.value = 0.5;

	let hullGroup = new THREE.Group();
	let port = new THREE.Mesh(hGeom, hMat);
	let starboard = new THREE.Mesh(hGeom, hMat);
	starboard.scale.y = -1;
	hullGroup.add(port, starboard);

	//Caps:
	hullGroup.add(new THREE.Mesh(bowCapG, hMat));
	hullGroup.add(new THREE.Mesh(aftCapG, hMat));
	hullGroup.add(new THREE.Mesh(bottomCapG, hMat));

	hullGroup.scale.set(LOA, 0.5 * BOA, Depth);
	this.hullGroup = hullGroup;
	this.add(hullGroup);

	//DEBUG, to show only hull:
	//return;

	//Decks:
	var decks = new THREE.Group();
	let deckMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
	//deckGeom.translate(0,0,-0.5);
	let ds = ship.structure.decks;
	let dk = Object.keys(ds);
	let stss = stations.map(st => LOA * st); //use scaled stations for now
	console.log(dk);
	for (let i = 0; i < dk.length; i++) {
		let d = ds[dk[i]]; //deck in ship structure

		//Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
		let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1);//new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
		console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
		let zHigh = d.zFloor;
		let zLow = d.zFloor - d.thickness;
		let wlHigh = hull.getWaterline(zHigh);
		let wlLow = hull.getWaterline(zLow);
		let pos = deckGeom.getAttribute("position");
		let pa = pos.array;
		for (let j = 0; j < stss.length + 1; j++) {
			let x = d.xAft + (j / stss.length) * (d.xFwd - d.xAft);
			let y1 = Vessel.f.linearFromArrays(stss, wlHigh, x);
			let y2 = Vessel.f.linearFromArrays(stss, wlLow, x);
			let y = Math.min(0.5 * d.breadth, y1, y2);
			pa[3 * j] = x;
			pa[3 * j + 1] = y;
			pa[3 * (stss.length + 1) + 3 * j] = x;
			pa[3 * (stss.length + 1) + 3 * j + 1] = -y; //test
		}
		pos.needsUpdate = true;

		//DEBUG
		console.log("d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f", d.xFwd, d.xAft, 0.5 * d.breadth);
		console.log(pa);

		let deck = new THREE.Mesh(deckGeom, deckMat);
		deck.name = dk[i];
		deck.position.z = d.zFloor;
		//deck.scale.set(d.xFwd-d.xAft, d.breadth, d.thickness);
		//deck.position.set(0.5*(d.xFwd+d.xAft), 0, d.zFloor);
		decks.add(deck);
	}
	this.decks = decks;
	this.add(decks);

	//Bulkheads:
	var bulkheads = new THREE.Group();
	bulkheads.scale.set(1, 0.5 * BOA, Depth);
	let bhGeom = new THREE.BoxBufferGeometry(1, 1, 1);
	bhGeom.translate(0, 0, 0.5);
	let bhMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: 0.5, side: THREE.DoubleSide});
	bhGeom.translate(0.5, 0, 0);
	let bhs = ship.structure.bulkheads;
	let bhk = Object.keys(bhs);
	for (let i = 0; i < bhk.length; i++) {
		let bulkhead = new THREE.Mesh(bhGeom, bhMat);
		let bh = bhs[bhk[i]];
		bulkhead.name = bhk[i];
		bulkhead.scale.set(bh.thickness, 1, 1);
		bulkhead.position.set(bh.xAft, 0, 0);
		bulkheads.add(bulkhead);
	}
	this.bulkheads = bulkheads;
	this.add(bulkheads);

	//Objects

	this.materials = {};
	this.stlPath = stlPath;
	let stlManager = new THREE.LoadingManager();
	this.stlLoader = new THREE.STLLoader(stlManager);
	/*stlManager.onLoad = function() {
		createGUI(materials, deckMat);
	}*/

	this.blocks = new THREE.Group();
	this.add(this.blocks);

	//Default placeholder geometry
	this.boxGeom = new THREE.BoxBufferGeometry(1, 1, 1);
	this.boxGeom.translate(0, 0, 0.5);

	let objects = Object.values(ship.derivedObjects);
	for (let i = 0; i < objects.length; i++) {
		this.addObject(objects[i]);
	}

	//console.log("Reached end of Ship3D constructor.");
}
Ship3D.prototype = Object.create(THREE.Group.prototype);
Object.assign(Ship3D.prototype, {
	constructor: Ship3D,
	addObject: function(object) {
		let mat;
		let name = this.stripName(object.id);
		if (this.materials[name] !== undefined) {
			mat = this.materials[name];
		} else {
			mat = new THREE.MeshPhongMaterial({color: this.randomColor(), transparent: true, opacity: 0.5});
			this.materials[name] = mat;
		}

		let bo = object.baseObject;

		//Position
		let s = this.ship.designState.getObjectState(object);
		let x = s.xCentre;
		let y = s.yCentre;
		let z = s.zBase;

		//Scale
		let d = bo.boxDimensions;

		if (bo.file3D) {
			let self = this;
			this.stlLoader.load(
				this.stlPath + "/" + bo.file3D,
				function onLoad(geometry) {
					//Normalize:
					geometry.computeBoundingBox();
					let b = geometry.boundingBox;
					geometry.translate(-b.min.x, -b.min.y, -b.min.z);
					geometry.scale(1 / (b.max.x - b.min.x),
						1 / (b.max.y - b.min.y),
						1 / (b.max.z - b.min.z));
					//Align with the same coordinate system as placeholder blocks:
					geometry.translate(-0.5, -0.5, 0);
					let m = new THREE.Mesh(geometry, mat);
					m.position.set(x, y, z);
					m.scale.set(d.length, d.breadth, d.height);
					self.blocks.add(m);
				},
				undefined,
				function onError() {
					console.warn("Specified file " + e.File + " not found. Falling back on placeholder.");
					let m = new THREE.Mesh(this.boxGeom, mat);
					m.position.set(x, y, z);
					m.scale.set(d.length, d.breadth, d.height);
					this.blocks.add(m);
				}
			);
		} else {
			//Placeholder:
			let m = new THREE.Mesh(this.boxGeom, mat);
			m.position.set(x, y, z);
			m.scale.set(d.length, d.breadth, d.height);
			this.blocks.add(m);
		}
	},
	//this function is used as a temporary hack to group similar objects by color
	stripName: function(s) {
		s = s.replace(/[0-9]/g, "");
		s = s.trim();
		return s;
	},
	randomColor: function() {
		let r = Math.round(Math.random() * 0xff);
		let g = Math.round(Math.random() * 0xff);
		let b = Math.round(Math.random() * 0xff);
		return ((r << 16) | (g << 8) | b);
	}
});