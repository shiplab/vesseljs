//@EliasHasle

/*
THREE.js Object3D constructed from Vessel.js Ship object.

A known serious bug of this is that it wraps together the top of the hull, making the hull look lower than it is, and occluding top views a bit.

There are some serious limitations too:
1. NaN values encountered are assumed to be either at the top or bottom of the given station.
2. It produces no default end caps or keel.
*/

function Ship3D(vessel, stlPath) {
	THREE.Group.call(this);
	
	this.vessel = vessel;

	let LOA = vessel.structure.hull.attributes.LOA;
	let BOA = vessel.structure.hull.attributes.BOA;
	let Depth = vessel.structure.hull.attributes.Depth;

	//console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);
	
	this.position.z = -vessel.designState.calculationParameters.Draft_design;
	
	//Hull
	let stations = vessel.structure.hull.halfBreadths.stations;
	let waterlines = vessel.structure.hull.halfBreadths.waterlines;
	let table = vessel.structure.hull.halfBreadths.table;
	//None of these are changed during correction of the geometry.

	console.log(stations);
	console.log(waterlines);
	console.log(table);
	
	let N = stations.length;
	let M = waterlines.length;
	let hGeom = new THREE.PlaneBufferGeometry(undefined, undefined, M-1,N-1);
	let pos = hGeom.getAttribute("position");
	let pa = pos.array;

	//loop1:
	for (let i = 0, c = 0; i < N; i++) {
		//loop2:
		for (let j = 0; j < M; j++) {
			//if (isNaN(table[j][i])) continue;// loop1;
			pa[c] = stations[i];
			if(table[j]===undefined) console.error("table[%d] is undefined", j);
			pa[c+1] = table[j][i];//isNaN(table[j][i]) ? 0 : table[j][i];
			pa[c+2] = waterlines[j];
			c += 3;
		}
	}
		
	//Get rid of NaNs by merging their points with the closest non-NaN point in the same station:
	/*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
	let uv = hGeom.getAttribute("uv");
	let uva = uv.array;
	//Iterate over stations
	for (let i = 0; i < N; i++) {
		//Iterate over waterlines
		let firstNumberJ;
		let lastNumberJ;
		let j;
		for (j = 0; j < M; j++) {
			let y = table[j][i];
			if (!isNaN(y)) {
				firstNumberJ = j;
				lastNumberJ = j;
				//copy vector for i,j to positions for all NaN cells below:
				let c = i*M+firstNumberJ;
				let x = pa[3*c];
				let y = pa[3*c+1];					
				let z = pa[3*c+2];
				let d = c;
				while (firstNumberJ > 0) {
					firstNumberJ--;			
					d -= 1;
					pa[3*d] = x;
					pa[3*d+1] = y;
					pa[3*d+2] = z;
					uva[2*d] = uva[2*c];
					uva[2*d+1] = uva[2*c+1];
				}
				break;
			}
		}
		
		//Continue up the hull (with same j counter), searching for upper number. This does not account for numbers after the first NaN is encountered.
		for (; j < M; j++) {
			let y = table[j][i];
			if (isNaN(y)) break;
			//else not NaN:
			lastNumberJ = j;
		}
		
		//copy vector for i,j to positions for all NaN cells above:
		let c = i*M+lastNumberJ;
		let x = pa[3*c];
		let y = pa[3*c+1];					
		let z = pa[3*c+2];
		let d = c;
		while (lastNumberJ < M-1) {
			lastNumberJ++;
			d += 1;
			pa[3*d] = x;
			pa[3*d+1] = y;
			pa[3*d+2] = z;
			uva[2*d] = uva[2*c];
			uva[2*d+1] = uva[2*c+1];
		}
		//////////
	}
	
	//console.log(pa);
	
	pos.needsUpdate = true;
	uv.needsUpdate = true;
	hGeom.computeVertexNormals();
	
	//Hull hMaterial
	let hMat = new THREE.MeshPhongMaterial({color: "red", side: THREE.DoubleSide, transparent: true, opacity: /*1*/0.5});
	
	let hull = new THREE.Group();
	let port = new THREE.Mesh(hGeom, hMat);
	let starboard = new THREE.Mesh(hGeom, hMat);
	starboard.scale.y = -1;
	hull.add(port, starboard);
	
	hull.scale.set(LOA,0.5*BOA,Depth);
	this.hull = hull;
	this.add(hull);
	
	function randomColor() {
		let r = Math.round(Math.random()*0xff);
		let g = Math.round(Math.random()*0xff);
		let b = Math.round(Math.random()*0xff);
		return ((r<<16)|(g<<8)|b);
	}
	
	//Decks:
	var decks = new THREE.Group();
	let deckMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*randomColor()*/, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
	//deckGeom.translate(0,0,-0.5);
	let ds = vessel.structure.decks;
	let dk = Object.keys(ds);
	let stss = stations.map(st=>LOA*st); //use scaled stations for now
	console.log(dk);
	for (let i = 0; i < dk.length; i++) {
		let d = ds[dk[i]]; //deck in vessel structure
		
		//Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
		let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1);//new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
		console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
		let zHigh = d.zFloor;
		let zLow = d.zFloor-d.thickness;
		let wlHigh = vessel.structure.hull.getWaterline(zHigh, 2);
		let wlLow = vessel.structure.hull.getWaterline(zLow, 2);
		let pos = deckGeom.getAttribute("position");
		let pa = pos.array;
		for (let j = 0; j < stss.length+1; j++) {
			let x = d.xAft+(j/stss.length)*(d.xFwd-d.xAft);
			let y1 = ShipDesign.f.linearFromArrays(stss,wlHigh,x);
			let y2 = ShipDesign.f.linearFromArrays(stss,wlLow,x);
			let y = Math.min(0.5*d.breadth, y1, y2);
			pa[3*j] = x;
			pa[3*j+1] = y;
			pa[3*(stss.length+1)+3*j] = x;
			pa[3*(stss.length+1)+3*j+1] = -y; //test
		}
		pos.needsUpdate = true;
		
		//DEBUG
		console.log("d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f", d.xFwd, d.xAft, 0.5*d.breadth);
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
	bulkheads.scale.set(1, BOA, Depth);
	let bhGeom = new THREE.BoxBufferGeometry(1,1,1);
	bhGeom.translate(0,0,0.5);
	let bhMat = new THREE.MeshPhongMaterial({color: 0xcccccc/*randomColor()*/, transparent: true, opacity: 0.5, side: THREE.DoubleSide});
	bhGeom.translate(0.5,0,0);
	let bhs = vessel.structure.bulkheads;
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
	//this function is used as a temporary hack to group similar objects by color
	function stripName(s) {
		s=s.replace(/[0-9]/g, "");
		s=s.trim();
		return s;
	}
	let materials = {};
	
	let stlManager = new THREE.LoadingManager();
	let stlLoader = new THREE.STLLoader(stlManager);
	/*stlManager.onLoad = function() {
		createGUI(materials, deckMat);
	}*/

	let blocks = new THREE.Group();
	this.blocks = blocks;
	this.add(blocks);

	let boxGeom = new THREE.BoxBufferGeometry(1,1,1);
	boxGeom.translate(0,0,0.5);
	
	let objects = Object.values(vessel.derivedObjects);	
	for (let i = 0; i < objects.length; i++) {
		let o = objects[i];
		let mat;
		let name = stripName(o.id);
		if (materials[name] !== undefined) {
			mat = materials[name];
		} else {
			mat = new THREE.MeshPhongMaterial({color: randomColor(), transparent: true, opacity: 0.5});
			materials[name] = mat;
		}
		
		let bo = o.baseObject;

		//This function is redefined in every loop iteration.
		//Maybe not the most elegant solution?
		let addBlock = function (geom) {
			let m = new THREE.Mesh(geom, mat);
			s = vessel.designState.getObjectState(o);
			let x = s.xCentre;
			let y = s.yCentre;
			let z = s.zBase;
			m.position.set(x, y, z);
			let d = bo.boxDimensions;
			m.scale.set(d.length, d.breadth, d.height);
			blocks.add(m);
		}
		
		if (bo.file3D) {
			stlLoader.load(
				stlPath+"/"+bo.file3D,
				function onLoad(geometry) {
					//Normalize:
					geometry.computeBoundingBox();
					let b = geometry.boundingBox;
					geometry.translate(-b.min.x, -b.min.y, -b.min.z);
					geometry.scale(1/(b.max.x-b.min.x), 
								1/(b.max.y-b.min.y),
								1/(b.max.z-b.min.z));
					//Align with the same coordinate system as placeholder blocks:
					geometry.translate(-0.5,-0.5,0);
					addBlock(geometry);
				},
				undefined,
				function onError() {
					console.warn("Specified file " + e.File + " not found. Falling back on placeholder.");
					addBlock(boxGeom);
				}
			);
		} else {
			//Placeholder:
			addBlock(boxGeom);
		}
	}
	
	//console.log("Reached end of Ship3D constructor.");
}
Ship3D.prototype = Object.create(THREE.Group.prototype);
Ship3D.prototype.constructor = Ship3D;