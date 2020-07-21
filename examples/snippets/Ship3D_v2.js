//@EliasHasle

/*
Draft for new version. More modularized, and interacts with a ship state.
Uses an additional coordinate system for motions.
The position.xy and rotation.z of the Ship3D object plae the ship in the 3D world.
(Not geographically)
position.z is the (negative) draft.
fluctCont is a "fluctuations container" to be used for dynamically
changing motions like heave, pitch, roll.
cmContainer centers the motion on the center of gravity.
normalizer nulls out the center of gravity height before the draft is applied.


THREE.js Object3D constructed from Vessel.js Ship object.

There are some serious limitations to this:
1. null values encountered are assumed to be either at the top or bottom of the given station.
2. The end caps and bulkheads are sometimes corrected with zeros where they should perhaps have been clipped because of null values.

TODO: Use calculated draft for position.z, and place the ship model in a motion container centered at the calculated metacenter.
*/

//var hMat; //global for debugging

function Ship3D(ship, {shipState, stlPath, deckOpacity = 0.2, objectOpacity = 0.5}) {
	THREE.Group.call(this);

	this.normalizer = new THREE.Group();
	this.fluctCont = new THREE.Group();
	this.fluctCont.rotation.order = "ZYX"; //right?
	this.cmContainer = new THREE.Group();
	this.fluctCont.add(this.cmContainer);
	this.normalizer.add(this.fluctCont);
	this.add(this.normalizer);

	Object.defineProperty(this, "draft", {
		get: function() {
			return -this.position.z;
		}/*,
		set: function(value) {
			this.position.z = -value;
		}*/
	});
	Object.defineProperty(this, "surge", {
		get: function() {
			return this.fluctCont.position.x;
		},
		set: function(value) {
			this.fluctCont.position.x = value;
			//this.shipState.motion.surge = value;
		}
	});
	Object.defineProperty(this, "sway", {
		get: function() {
			return this.fluctCont.position.y;
		},
		set: function(value) {
			this.fluctCont.position.y = value;
			//this.shipState.motion.sway = value;
		}
	});
	Object.defineProperty(this, "heave", {
		get: function() {
			return this.fluctCont.position.z;
		},
		set: function(value) {
			this.fluctCont.position.z = value;
			//this.shipState.motion.heave = value;
		}
	});
	Object.defineProperty(this, "yaw", {
		get: function() {
			return this.fluctCont.rotation.z;
		},
		set: function(value) {
			this.fluctCont.rotation.z = value;
			//this.shipState.motion.yaw = value;
		}
	});
	Object.defineProperty(this, "pitch", {
		get: function() {
			return this.fluctCont.rotation.y;
		},
		set: function(value) {
			this.fluctCont.rotation.y = value;
			//this.shipState.motion.pitch = value;
		}
	});
	Object.defineProperty(this, "roll", {
		get: function() {
			return this.fluctCont.rotation.x;
		},
		set: function(value) {
			this.fluctCont.rotation.x = value;
			//this.shipState.motion.roll = value;
		}
	});

	this.objectOpacity = objectOpacity;

	this.ship = ship;
	this.shipState = shipState || ship.designState.clone();

	let hull = ship.structure.hull;

	let LOA = hull.attributes.LOA;
	let BOA = hull.attributes.BOA;
	let Depth = hull.attributes.Depth;

	//console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);
	let {w: {cg, mass}, T, GMt, GMl} = ship.calculateStability(this.shipState);

	this.cmContainer.position.set(-cg.x, -cg.y, -cg.z);
	this.normalizer.position.z = cg.z;
	this.position.z = -T;

	let designDraft = ship.designState.calculationParameters.Draft_design;
	this.hull3D = new Hull3D(hull, designDraft);
	this.cmContainer.add(this.hull3D);

	//DEBUG, to show only hull:
	//return;

	let stations = hull.halfBreadths.stations;
	//Decks:
	var decks = new THREE.Group();
	let deckMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: deckOpacity, side: THREE.DoubleSide});
	//deckGeom.translate(0,0,-0.5);
	let ds = ship.structure.decks;
	//let dk = Object.keys(ds);
	let stss = stations.map(st => LOA * st); //use scaled stations for now
	//console.log(dk);
	//for (let i = 0; i < dk.length; i++) {
	for (let dk in ds) {
		//let d = ds[dk[i]]; //deck in ship structure
		let d = ds[dk];

		//Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
		let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1);//new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
		//console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
		let zHigh = d.zFloor;
		let zLow = d.zFloor - d.thickness;
		let wlHigh = hull.getWaterline(zHigh);
		let wlLow = hull.getWaterline(zLow);
		let pos = deckGeom.getAttribute("position");
		let pa = pos.array;
		for (let j = 0; j < stss.length + 1; j++) {
			//This was totally wrong, and still would benefit from
			//not mapping directly to stations, as shorter decks will
			//Get zero-width sections
			let x = stss[j];//d.xAft+(j/stss.length)*(d.xFwd-d.xAft);
			if (isNaN(x)) x = stss[j-1];
			x = Math.max(d.xAft, Math.min(d.xFwd, x));
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
		//console.log("d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f", d.xFwd, d.xAft, 0.5*d.breadth);
		//console.log(pa);
		let mat = deckMat;
		if (d.style) {
			mat = new THREE.MeshPhongMaterial({color: typeof d.style.color !== "undefined" ? d.style.color : 0xcccccc, transparent: true, opacity: typeof d.style.opacity !== "undefined" ? d.style.opacity : deckOpacity, side: THREE.DoubleSide});
		}
		let deck = new THREE.Mesh(deckGeom, mat);
		deck.name = dk;//[i];
		deck.group = d.affiliations.group
		deck.position.z = d.zFloor;
		//deck.scale.set(d.xFwd-d.xAft, d.breadth, d.thickness);
		//deck.position.set(0.5*(d.xFwd+d.xAft), 0, d.zFloor);
		decks.add(deck);
	}
	this.decks = decks;
	this.cmContainer.add(decks);

	//Bulkheads:
	var bulkheads = new THREE.Group();
	bulkheads.scale.set(1, BOA, Depth);
	//Should have individually trimmed geometries like the decks
	let bhGeom = new THREE.BoxBufferGeometry(1, 1, 1);
	bhGeom.translate(0, 0, 0.5);
	let bhMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*this.randomColor()*/, transparent: true, opacity: deckOpacity, side: THREE.DoubleSide});
	bhGeom.translate(0.5, 0, 0);
	let bhs = ship.structure.bulkheads;
	//let bhk = Object.keys(bhs);
	//for (let i = 0; i < bhk.length; i++) {
	for (let bhk in bhs) {
		let bh = bhs[bhk];//bhs[bhk[i]];
		let mat = bhMat;
		if (bh.style) {
			mat = new THREE.MeshPhongMaterial({color: typeof bh.style.color !== "undefined" ? bh.style.color : 0xcccccc, transparent: true, opacity: typeof bh.style.opacity !== "undefined" ? bh.style.opacity : deckOpacity, side: THREE.DoubleSide});
		}
		let bulkhead = new THREE.Mesh(bhGeom, mat);
		bulkhead.name = bhk;//[i];
		bulkhead.group = bh.affiliations.group;
		bulkhead.scale.set(bh.thickness, 1, 1);
		bulkhead.position.set(bh.xAft, 0, 0);
		bulkheads.add(bulkhead);
	}
	this.bulkheads = bulkheads;
	this.cmContainer.add(bulkheads);

	//Objects

	this.materials = {};
	this.stlPath = stlPath;
	let stlManager = new THREE.LoadingManager();
	this.stlLoader = new THREE.STLLoader(stlManager);
	/*stlManager.onLoad = function() {
		createGUI(materials, deckMat);
	}*/

	this.blocks = new THREE.Group();
	this.cmContainer.add(this.blocks);

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
		if (typeof object.style.color !== "undefined" || typeof object.style.opacity !== "undefined") {
			let color = typeof object.style.color !== "undefined" ? object.style.color : this.randomColor();
			let opacity = typeof object.style.opacity !== "undefined" ? object.style.opacity : this.objectOpacity;
			mat = new THREE.MeshPhongMaterial({color, transparent: true, opacity});
		} else {
			let name = this.stripName(object.id);
			if (this.materials[name] !== undefined) {
				mat = this.materials[name];
			} else {
				mat = new THREE.MeshPhongMaterial({color: this.randomColor(), transparent: true, opacity: this.objectOpacity});
				this.materials[name] = mat;
			}
		}

		let bo = object.baseObject;

		//Position
		let s = this.ship.designState.getObjectState(object);
		let x = s.xCentre;
		let y = s.yCentre;
		let z = s.zBase;

		//Small position jitter to avoid z-fighting
		let n = 0.01*(2*Math.random()-1);
		x += n;
		y += n;
		z += n;

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
					m.name = object.id;
					m.group = bo.affiliations.group != undefined ? bo.affiliations.group : undefined
					self.blocks.add(m);
				},
				undefined,
				function onError() {
					console.warn("Error loading STL file " + bo.file3D + ". Falling back on placeholder.");
					let m = new THREE.Mesh(this.boxGeom, mat);
					m.position.set(x, y, z);
					m.scale.set(d.length, d.breadth, d.height);
					m.name = object.id;
					m.group = bo.affiliations.group != undefined ? bo.affiliations.group : undefined
					this.blocks.add(m);
				}
			);
		} else {
			//Placeholder:
			let m = new THREE.Mesh(this.boxGeom, mat);
			m.position.set(x, y, z);
			m.scale.set(d.length, d.breadth, d.height);
			m.name = object.id;
			m.group = bo.affiliations.group != undefined ? bo.affiliations.group : undefined
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

//Class to contain the geometry of a hull side.
//(Should perhaps be replaced by a HullGeometry class, but then
//it cannot be a simple subclass of PlaneBufferGeometry.)
//After instantiation, stations, waterlines and table can be modified or replaced,
//but the data dimensions NxM must remain the same.
function HullSideGeometry(stations, waterlines, table) {
	this.stations = stations;
	this.waterlines = waterlines;
	this.table = table;
	this.N = stations.length;
	this.M = waterlines.length;
	//Hull side, in principle Y offsets on an XZ plane:
	//Even though a plane geometry is usually defined in terms of Z offsets on an XY plane, the order of the coordinates for each vertex is not so important. What is important is to get the topology right. This is ensured by working with the right order of the vertices.
	THREE.PlaneBufferGeometry.call(this, undefined, undefined, this.N - 1, this.M - 1);

	this.update();
}

HullSideGeometry.prototype = Object.create(THREE.PlaneBufferGeometry.prototype);
Object.assign(HullSideGeometry.prototype, {
	update: function() {
		let pos = this.getAttribute("position");
		let pa = pos.array;

		const N = this.N;
		const M = this.M;

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
				pa[c] = this.stations[i]; //x
				//DEBUG, OK. No attempts to read outside of table
				/*if(typeof table[j] === "undefined") console.error("table[%d] is undefined", j);
				else if (typeof table[j][i] === "undefined") console.error("table[%d][%d] is undefined", j, i);*/
				//y
				pa[c + 1] = this.table[j][i]; //y
				pa[c + 2] = this.waterlines[j]; //z
				c += 3;
			}
		}
		//console.error("c-pa.length = %d", c-pa.length); //OK, sets all cells

		//Get rid of nulls by merging their points with the closest non-null point in the same station:
		/*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
		let uv = this.getAttribute("uv");
		let uva = uv.array;
		//Iterate over stations
		for (let i = 0; i < N; i++) {
			let firstNumberJ;
			let lastNumberJ;
			//Iterate over waterlines
			let j;
			for (j = 0; j < M; j++) {
				let y = this.table[j][i];
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
				//console.log("null encountered.");
			}

			//Continue up the hull (with same j counter), searching for upper number. This does not account for the existence of numbers above the first null encountered.
			for (; j < M; j++) {
				let y = this.table[j][i];
				if (y === null) {
					//console.log("null encountered.");
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
		this.computeVertexNormals();
	}
});

function Hull3D(hull, design_draft) {
	THREE.Group.call(this);

	this.hull = hull;
	this.group = "Hull3D"
	this.design_draft = design_draft !== undefined ? design_draft : 0.5 * hull.attributes.Depth;
	this.upperColor = typeof hull.style.upperColor !== "undefined" ? hull.style.upperColor : 0x33aa33;
	this.lowerColor = typeof hull.style.lowerColor !== "undefined" ? hull.style.lowerColor : 0xaa3333;
	this.opacity = typeof hull.style.opacity !== "undefined" ? hull.style.opacity : 0.5;

	this.update();
}
Hull3D.prototype = Object.create(THREE.Group.prototype);

Object.assign(Hull3D.prototype, {
	//Experimental addition. Broken.
	addStation: function(p) {
		const hb = this.hull.halfBreadths;
		const {index, mu} = Vessel.f.bisectionSearch(hb.stations, p);
		hb.stations.splice(index, 0, p);
		for (let i = 0; i < hb.waterlines.length; i++) {
			hb.table[i].splice(index, 0, 0);
		}

		this.update();
	},
	//Experimental addition
	addWaterline: function(p) {
		const hb = this.hull.halfBreadths;
		const {index, mu} = Vessel.f.bisectionSearch(hb.waterlines, p);
		hb.waterlines.splice(index, 0, p);
		hb.table.splice(index, 0, new Array(hb.stations.length).fill(0));

		this.update();
	},
	//or updateGeometries?
	update: function() {
		const hull = this.hull;
		const upperColor = this.upperColor;
		const lowerColor = this.lowerColor;
		const design_draft = this.design_draft;
		const opacity = this.opacity;

		let LOA = hull.attributes.LOA;
		let BOA = hull.attributes.BOA;
		let Depth = hull.attributes.Depth;

		//None of these are changed during correction of the geometry.
		let stations = hull.halfBreadths.stations;
		let waterlines = hull.halfBreadths.waterlines;
		let table = hull.halfBreadths.table;

		if (this.hGeom) this.hGeom.dispose();
		this.hGeom = new HullSideGeometry(stations, waterlines, table);

		let N = stations.length;
		let M = waterlines.length;

		//Bow cap:
		let bowPlaneOffsets = hull.getStation(LOA).map(str => str / (0.5 * BOA)); //normalized
		if (this.bowCapG) this.bowCapG.dispose();
		this.bowCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
		pos = this.bowCapG.getAttribute("position");
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
		if (this.aftCapG) this.aftCapG.dispose();
		this.aftCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
		pos = this.aftCapG.getAttribute("position");
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
		if (this.bottomCapG) this.bottomCapG.dispose();
		this.bottomCapG = new THREE.PlaneBufferGeometry(undefined, undefined, N - 1, 1);
		pos = this.bottomCapG.getAttribute("position");
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
		if (!this.hMat) {
			let phong = THREE.ShaderLib.phong;
			let commonDecl = "uniform float wlThreshold;uniform vec3 aboveWL; uniform vec3 belowWL;\nvarying float vZ;";
			this.hMat = new THREE.ShaderMaterial({
				uniforms: THREE.UniformsUtils.merge([phong.uniforms, {
					wlThreshold: new THREE.Uniform(0.5),
					aboveWL: new THREE.Uniform(new THREE.Color()),
					belowWL: new THREE.Uniform(new THREE.Color())
				}]),
				vertexShader: commonDecl + phong.vertexShader.replace("main() {", "main() {\nvZ = position.z;").replace("#define PHONG", ""),
				fragmentShader: commonDecl + phong.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );",
					"vec4 diffuseColor = vec4( (vZ>wlThreshold)? aboveWL.rgb : belowWL.rgb, opacity );").replace("#define PHONG", ""),
				side: THREE.DoubleSide,
				lights: true,
				transparent: true
			});
		}
		this.hMat.uniforms.wlThreshold.value = this.design_draft / Depth;
		this.hMat.uniforms.aboveWL.value = new THREE.Color(upperColor);
		this.hMat.uniforms.belowWL.value = new THREE.Color(lowerColor);
		this.hMat.uniforms.opacity.value = opacity;

		if (this.port) this.remove(this.port);
		this.port = new THREE.Mesh(this.hGeom, this.hMat);
		if (this.starboard) this.remove(this.starboard);
		this.starboard = new THREE.Mesh(this.hGeom, this.hMat);
		this.starboard.scale.y = -1;
		this.add(this.port, this.starboard);

		//Caps:
		if (this.bowCap) this.remove(this.bowCap);
		this.bowCap = new THREE.Mesh(this.bowCapG, this.hMat)
		if (this.aftCap) this.remove(this.aftCap);
		this.aftCap = new THREE.Mesh(this.aftCapG, this.hMat)
		if (this.bottomCap) this.remove(this.bottomCap);
		this.bottomCap = new THREE.Mesh(this.bottomCapG, this.hMat)

		this.add(this.bowCap, this.aftCap, this.bottomCap);

		this.scale.set(LOA, 0.5 * BOA, Depth);
	}
});
