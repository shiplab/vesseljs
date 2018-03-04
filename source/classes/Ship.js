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
	calculateDraft(shipState, epsilon=0.001, rho=1025) {
		let w = this.getWeight(shipState);
		let M = w.mass;
		return this.structure.hull.calculateDraftAtMass(M, epsilon, rho);
	},
	//Separates between longitudinal and transverse GM
	//To avoid confusion, no "default" GM or BM is specified in the output.
	calculateStability(shipState){
		let w = this.getWeight(shipState);
		let KG = w.cg.z;
		let T = this.designState.calculationParameters.Draft_design;
		let {BMt,BMl,KB} = this.structure.hull.calculateAttributesAtDraft(T);
		let GMt = KB + BMt - KG;
		let GMl = KB + BMl - KG;
		return {GMt, GMl, KB, BMt, BMl, KG};
	},
	calculateDraftWeigthBased(shipState){
		let dw = this.getWeight(shipState).mass / 1000;
		let L = this.structure.hull.attributes.LOA;
		let B = this.structure.hull.attributes.BOA;
		let v = this.designState.calculationParameters.speed * 0.5144;
		let Fn = v / (Math.sqrt(9.81 * L));
		//let Cbj = -4.22 + 27.8 * Math.sqrt(Fn) - 39.1 * Fn + 46.6 * Math.pow(Fn, 3); // SDfEE p.33
		let Cb =  19410 * Math.pow (Fn,6 )  - 31353 * Math.pow(Fn, 5) + 20164 * Math.pow(Fn, 4) - 6528.3 * Math.pow(Fn, 3) + 1107.6 * Math.pow(Fn, 2) - 93.703 * Fn + 3.9648;
		//let Cbdiff = Cb - Cbj
		let T = dw / (L * B * Cb)
		let BT = dw / (L * Cb)
		return {TWB:T, BTWB:BT, CbWB:Cb};
	},
	calculateDraftIterationBased(shipState){
		let L = this.structure.hull.attributes.LOA;
		let dw = this.getWeight(shipState).mass / 1000;
		let lw = dw / 2;
		let LB = 6.5; //required info about type of ship
		let BD = 1.8; //required info about type of ship
		let TD = 0.7; //required info about type of ship
		let v = this.designState.calculationParameters.speed * 0.5144;
		let Fn = v / (Math.sqrt(9.81 * L));

		let B = L / LB;
		let D = B / BD;
		let T = D * TD;
		let Cb = 0.7 + 1 / 8 * Math.atan((23 - 100 * Fn) / (4));
		let disp = B * T * L * Cb;
		return {LIB:L, BIB:B, DIB:D, TIB:T, CbIB:Cb, dispIB:disp};
	},
	getFuelMass() {
		var fuelMass = {};
		fuelMass.totalMass = 0;
		fuelMass.tankMass = {};
		fuelMass.tankStates = {};
		for (let o of Object.values(this.derivedObjects)) {
			if (o.baseObject.capabilities.fuelTank) {
				fuelMass.tankStates[o.id] = this.designState.getObjectState(o);
				fuelMass.tankMass[o.id] = o.baseObject.weightInformation.contentDensity * o.baseObject.weightInformation.volumeCapacity * fuelMass.tankStates[o.id].fullness;
				fuelMass.totalMass += fuelMass.tankMass[o.id];
			}
		}
		return fuelMass;
	},
	subtractFuelMass(mass) {
		var tankMass = Object.entries(this.getFuelMass().tankMass);
		var tk = 0;
		var tkId = tankMass[tk][0];
		var tkMass = tankMass[tk][1];

		while (0 < mass) {
			// check if tank has necessary fuel
			if (mass <= tkMass) { // if yes, subtract mass
				this.designState.objectCache[tkId].state.fullness -= mass/(this.derivedObjects[tkId].baseObject.weightInformation.volumeCapacity * myShip.derivedObjects[tkId].baseObject.weightInformation.contentDensity);
				mass = 0;
				console.log("Vessel is sailing on " + tkId + ".");
			} else { // if not, make tank empty
				mass -= tkMass;
				myShip.designState.objectCache[tkId].state.fullness = 0;
				console.warn(tkId + " is empty.");
				if  (tankMass[tk+1] === undefined) { // if vessel does not have other tank, exit loop
					console.error("Vessel ran out of fuel before " + mass.toFixed(2) + " tons were dicounted.");
					break;
				}
				// if it has, proceed to it
				tk++;
				tkId = tankMass[tk][0];
				tkMass = tankMass[tk][1];
			}
		}
		// update related states. In the future, make this consistent with improved caching system
		for (var prop in this.designState.objectCache) {
			this.designState.objectCache[prop].thisStateVer++;
		}
		this.designState.version++;
	}
});
