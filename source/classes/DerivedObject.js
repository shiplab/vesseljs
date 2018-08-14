//@EliasHasle

/*
Depends on JSONSpecObject.js
*/

function DerivedObject(specification, baseObjects) {
	this.baseObjects = baseObjects;
	JSONSpecObject.call(this,specification);
}
DerivedObject.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(DerivedObject.prototype, {
	constructor: DerivedObject,
	setFromSpecification: function(spec) {
		this.id = spec.id;
		this.group = spec.group || null;
		this.affiliations = spec.affiliations;
		if (typeof spec.baseObject === "string") {
			this.baseObject = this.baseObjects[spec.baseObject];
		} else {
			this.baseObject = new BaseObject(spec.baseObject);
		}
		this.referenceState = spec.referenceState;
		//this.referenceStateVersion = 0;
		this.scale = spec.scale;
		this.style = spec.style || {};
		return this;
	},
	getSpecification: function() {
		let spec = {
			id: this.id,
			group: this.group,
			affiliations: this.affiliations,
			referenceState: this.referenceState,
			style: this.style
		};
		if (this.baseObjects[this.baseObject.id] !== undefined) {
			spec.baseObject = this.baseObject.id;
		} else {
			spec.baseObject = this.baseObject.getSpecification();
		}
		
		return spec;
	},
	getWeight: function(state) {
		let oState = state.getObjectState(this);
		
		//Support disabled objects:
		if (oState.exists === false) {
			return {mass: 0, cg: {x:0, y:0, z:0}};
		}
		
		let p = {
			x: oState.position.xCentre,
			y: oState.position.yCentre,
			z: oState.position.zBase
		};
		
		let w = this.baseObject.getWeight(oState.fullness);
		let m = w.mass;
		
		//Will hold cg in vessel coordinates
		let cg = Vectors.clone(w.cg);
		
		if (this.scale)
			cg = Vectors.mulComponents(w.cg, this.scale);
		
		//THIS IGNORES (BREAKS) fullness-CG mapping:
		if (oState.rotation)
			cg = Vectors.rotateTaitBryanExtrinsicXYZ(cg, oState.rotation);
		
		cg = Vectors.add(p, cg);
		
		if (isNaN(cg.x+cg.y+cg.z)) {
			console.error("DerivedObject.getWeight: returning NaN values.");
		}

		return {mass: m, cg: cg};
	}
});