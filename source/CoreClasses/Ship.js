//@EliasHasle

/*
Notes:
For calculated values, I envision a lazy calculation pattern, where all properties involved in calculations are only accessed by specialized getters and setters, and calculated properties have some kind of needsUpdate flag or version number (that is set by any setters that will directly or indirectly affect the property). When, and only when, running the getter for the given property, the flag/version is checked, and if false (same version as in cache) the getter just returns the stored value. If true, the getter starts the calculation of the value, invoking other getters.

Suggested calculations to do:
- Resistance at given speed (based on Holtrop).
- Inertia matrix (will need more detailed properties of parts).
*/

function Ship(specification) {
	JSONSpecObject.call(this,specification);
}
Ship.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(Ship.prototype, {
	constructor: Ship,
	setFromSpecification: function(specification) {
		this.attributes = specification.attributes || {};
		this.structure = new Structure(specification.structure/*,this*/);
		//baseObjects and derivedObjects are arrays in the specification, but are objects (hashmaps) in the constructed ship object:
		this.baseObjects = {};
		for (let i = 0; i < specification.baseObjects.length; i++) {
			let os = specification.baseObjects[i];
			this.baseObjects[os.id] = new BaseObject(os);
		}
		
		this.derivedObjects = {};
		for (let i = 0; i < specification.derivedObjects.length; i++) {
			let os = specification.derivedObjects[i];
			this.derivedObjects[os.id] = new DerivedObject(os, this.baseObjects);
		}
		
		this.designState = new ShipState(specification.designState);
	},
	getSpecification: function() {
		let specification = {};
		specification.attributes = this.attributes;
		specification.structure = this.structure.getSpecification();

		specification.baseObjects = Object.values(this.baseObjects).map(o=>o.getSpecification());
		specification.derivedObjects = Object.values(this.derivedObjects).map(o=>o.getSpecification());

		specification.designState = this.designState.getSpecification();

		return specification;
	},
	//This should probably be separated in lightweight and deadweight
	//Then this function should be replaced by a getDisplacement
	getWeight: function(shipState) {
		shipState = shipState || this.designState;

		let components = [];
		
		components.push(
			this.structure.getWeight(this.designState)
		);
		
		//DEBUG
		console.log(components);

		for (let o of Object.values(this.derivedObjects)) {
			components.push(o.getWeight(shipState));
		}

		var W = combineWeights(components);
		console.info("Calculated weight object: ", W);
		return W;
	},
	//This should just take displacement as parameter instead. (later, soon)
	calculateDraft(shipState, epsilon=0.001) {
		let w = this.getWeight(shipState);
		let M = w.mass;
		let VT = M/1025; //Target submerged volume (1025=rho_seawater)
		//Interpolation:
		let a = 0;
		let b = this.structure.hull.attributes.Depth;
		let t = 0.5*b;
		while (b-a>epsilon) {
			t = 0.5*(a+b);
			let V = this.structure.hull.calculateAttributesAtDraft(t)["Vs"];
			console.log(V); //DEBUG
			if (V>VT) b = t;
			else a = t;
		}
		console.info("Calculated draft: %.2f", t);
		return t;
	},
	//Should separate between longitudinal and transverse GM too
    calculateStability(shipState){
        let T = this.calculateDraft(shipState);
        let ha = this.structure.hull.calculateAttributesAtDraft(T);
        let vol = ha.Vs;
        let KG = this.getWeight(shipState).cg.z;
		let Ix = ha.Ixwp;
        let Iy = ha.Iywp;
        let KB = ha.Cv.z;
		let BMT = Ix / vol;
        let BML = Iy / vol;
        let GMT = KB + BMT - KG;
        let GML = KB + BML - KG;
        return {GMT, GML, GM: T, KB, BMT, BML, BM: BMT, KG};
	}
});