//@EliasHasle

/*
Notes:
For calculated values, I envision a lazy calculation pattern, where all properties involved in calculations are only accessed by specialized getters and setters, and calculated properties have some kind of needsUpdate flag or version number (that is set by any setters that will directly or indirectly affect the property). When, and only when, running the getter for the given property, the flag/version is checked, and if false (same version as in cache) the getter just returns the stored value. If true, the getter starts the calculation of the value, invoking other getters.

Suggested calculations to do:
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
		return this;
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
		//console.log(components);

		for (let o of Object.values(this.derivedObjects)) {
			components.push(o.getWeight(shipState));
		}

		var W = combineWeights(components);
		//console.info("Calculated weight object: ", W);
		return W;
	},
	calculateDraft: function(shipState, epsilon=0.001, rho=1025) {
		let w = this.getWeight(shipState);
		let M = w.mass;
		return this.structure.hull.calculateDraftAtMass(M, epsilon, rho);
	},
	//Separates between longitudinal and transverse GM
	//To avoid confusion, no "default" GM or BM is specified in the output.
	calculateStability: function(shipState){
		let w = this.getWeight(shipState);
		let KG = w.cg.z;
		let T = this.structure.hull.calculateDraftAtMass(w.mass);
		let {BMt,BMl,KB} = this.structure.hull.calculateAttributesAtDraft(T);
		let GMt = KB + BMt - KG;
		let GMl = KB + BMl - KG;
		return {w, T, GMt, GMl, KB, BMt, BMl, KG};
	},
	getFuelMass: function(shipState) {
		shipState = shipState || this.designState;

		let fuelMass = {};
		fuelMass.totalMass = 0;
		fuelMass.tankMass = {};
		fuelMass.tankStates = {};
		for (let o of Object.values(this.derivedObjects)) {
			if (o.affiliations.group === "fuel tanks") {
				fuelMass.tankStates[o.id] = shipState.getObjectState(o);
				fuelMass.tankMass[o.id] = o.baseObject.weightInformation.contentDensity * o.baseObject.weightInformation.volumeCapacity * fuelMass.tankStates[o.id].fullness;
				fuelMass.totalMass += fuelMass.tankMass[o.id];
			}
		}
		return fuelMass;
	},
	subtractFuelMass: function(mass, shipState) {
		shipState = shipState || this.designState;

		var fuelMass = this.getFuelMass(shipState);
		var totalFuel = fuelMass.totalMass;
		var tankEntr = Object.entries(fuelMass.tankMass);

		var fuelCap = 0;
		for (var tk = 0; tk < tankEntr.length; tk++) {
			var tkId = tankEntr[tk][0];
			fuelCap += this.derivedObjects[tkId].baseObject.weightInformation.volumeCapacity * this.derivedObjects[tkId].baseObject.weightInformation.contentDensity;
		}

		// check if tanks have necessary fuel
		if (mass <= totalFuel) { // if yes, subtract mass in the same proportion
			for (var tk = 0; tk < tankEntr.length; tk++) {
				var tkId = tankEntr[tk][0];
				shipState.objectCache[tkId].state.fullness -= mass/fuelCap;
			}
		} else { // if not, make tanks empty
			mass -= totalFuel;
			for (var tk = 0; tk < tankEntr.length; tk++) {
				var tkId = tankEntr[tk][0];
				shipState.objectCache[tkId].state.fullness = 0;
			}
			console.error("Vessel ran out of fuel before " + mass.toFixed(2) + " tons were subtracted.");
		}

		// update related states. In the future, make this consistent with improved caching system
		for (var prop in shipState.objectCache) {
			shipState.objectCache[prop].thisStateVer++;
		}
		shipState.version++;
	}
});
