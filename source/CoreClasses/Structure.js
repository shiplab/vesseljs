//@EliasHasle

function Structure(spec, ship) {
	this.ship = ship;
	JSONSpecObject.call(this, spec);
}
Structure.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(Structure.prototype, {
	setFromSpecification: function(spec) {
		this.hull = new Hull(spec.hull/*, this.ship*/);
		this.decks = spec.decks;/*{};
		let dspecs = spec.decks;
		let decks = this.decks;
		let dnames = Object.keys(dspecs);
		for (let i = 0; i < dnames.length; i++) {
			let name = dnames[i];
			let dspec = dspecs[name];
			decks[name] = new Deck(dspec,this.ship);
		}*/
		this.bulkheads = spec.bulkheads;/*{};
		let bhspecs = spec.bulkheads;
		let bulkheads = this.bulkheads;
		let bhnames = Object.keys(bhspecs);
		for (let i = 0; i < bhnames.length; i++) {
			let name = bhnames[i];
			let bhspec = bhspecs[name];
			bulkheads[name] = new Bulkhead(bhspec,this.ship);
		}*/	
	},
	getSpecification: function() {
		let spec = {
			hull: this.hull.getSpecification(),
			decks: this.decks,
			bulkheads: this.bulkheads
		};/*{decks: {}, bulkheads: {}};
		
		spec.hull = this.hull.getSpecification();
		
		let sd = spec.decks;
		let dk = Object.keys(this.decks);
		for (let i = 0; i < dk.length; i++) {
			sd[dk[i]] = this.decks[dk[i]].getSpecification();
		}
		
		let sbh = spec.bulkheads;
		let bhk = Object.keys(this.bulkheads);
		for (let i = 0; i < bhk.length; i++) {
			sbh[bhk[i]] = this.bulkheads[bhk[i]].getSpecification();
		}*/
		
		return spec;
	},
	//Alejandro is working on a more proper calculation of this
	getWeight: function(designState) {
		let components = [];
		//Hull
		components.push(this.hull.getWeight(designState));
		
		//structure:
		let decks = Object.values(this.decks);
		for (let i=0; i < decks.length; i++) {
			let d = decks[i];
			let zc = d.zFloor+0.5*d.thickness;
			let yc = d.yCentre;
			let b = d.breadth;
			let wlc = this.hull.waterlineCalculation(zc, {minX: d.xAft, maxX: d.xFwd, minY: yc-0.5*b, maxY: yc+0.5*b});
			components.push({
				//approximation
				mass: wlc.Awp*d.thickness*d.density,
				cg: {
					x: wlc.xc,
					y: wlc.yc,
					z: zc
				}
			});
		}
		
		let bulkheads = Object.values(this.bulkheads);
		for (let i=0; i < bulkheads.length; i++) {
			let bh = bulkheads[i];
			let xc = bh.xAft+0.5*bh.thickness;
			let sc = this.hull.stationCalculation(xc);
			components.push({
				//approximation
				mass: sc.A*bh.thickness*bh.density,
				cg: {
					x: xc,
					y: sc.yc,
					z: sc.zc
				}
			});	
		}
		
		let output = combineWeights(components);
		console.info("Total structural weight: ", output);
		return output;
	}
});