//@EliasHasle

/*
Changes are coming. Caching of object states is now decoupled from the rest of the state, to avoid needless recalculation on every little motion or other dynamical change.

In addition to this, a motion object is added.
*/

/*
The object state assignments can now target baseByGroup. A group of baseObjects can for instance be a category including all tanks that carry a given compound, regardless of their size and shape. Maybe "group" is not a good name for something that can be set freely. Maybe "label" or "tag" or something else. The same goes for derivedByGroup.

Now there are five types of assignments in this class:
common: All objects.
baseByGroup: Applies to every object that has its base object's property "group" set to the given name.
baseByID: Applies to all objects that have base object consistent with the given ID:
derivedByGroup: Applies to every object that has its property "group" set to the given name.
derivedByID: Applies only to the object with given ID.

Assignments of subsequent types override assignments of previous types.

Note that the foundation for object state is laid in baseObject.baseState and derivedObject.referenceState. The abovementioned assignments apply only as overrides. They do not introduce new properties.
*/

/*
The caching and version control is clumsy (and incomplete). I (Elias) have done some separate testing of ways to do it properly. This must be implemented later.
*/

/*
ShipState now mainly accounts for load state, by which I mean the states of objects in the ship. We need to find out how to best handle other state properties, like global position, heading etc., not to mention properties that change fast, and that depend on time and current state (motion fluctuations etc.).
*/

function ShipState(specification) {
	this.version = 0;
	this.objectCache = {};
	this.shipCache = {
		state: {},
		thisStateVer: 0
	};
	JSONSpecObject.call(this, specification);
}
ShipState.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(ShipState.prototype, {
	constructor: ShipState,
	getSpecification: function() {
		if (this.cachedSpecVersion !== this.version) {
			var spec = {
				calculationParameters: this.calculationParameters,
				motion: this.motion,
				objectOverrides: {
					//(don't export version)
					this.objectOverrides.common,
					this.objectOverrides.baseByGroup,
					this.objectOverrides.baseByID,
					this.objectOverrides.derivedByGroup,
					this.objectOverrides.derivedByID
				}
			};
			
			//Sketchy, but versatile, deep-copy pattern:
			spec = JSON.parse(JSON.stringify(spec));		
			
			this.specCache = spec;
			this.cachedSpecVersion = this.version;
		}
		return this.specCache;
	},
	clone: function() {
		return new ShipState(this.getSpecification());
	},
	//Method to get the state of a DerivedObject
	getObjectState: function(o) {
		if (this.objectCache[o.id] !== undefined) {
			let c = this.objectCache[o.id];
			if (c.overridesStateVer === this.objectOverrides.version
				/*&& c.baseStateVer === o.baseObject.baseStateVersion
				&& c.refStateVer === o.referenceStateVersion*/) {
				//console.log("ShipState.getObjectState: Using cache.");
				return c.state;	
			}				
		}
		//console.log("ShipState.getObjectState: Not using cache.");
		
		//Build the state in multiple steps,
		//such that the later steps override
		//the earlier ones when in conflict.
		//The two first steps lay the foundation.
		let state = {};
		//1.
		Object.assign(state, o.baseObject.baseState); //unsafe for nested objects
		//2.
		Object.assign(state, o.referenceState); //unsafe for nested objects
		//The next steps are different, because there,
		//only existing properties will be updated.
		let oo = this.objectOverrides;
		//3., 4., 5., 6.
		let sources = [oo.common, oo.baseByGroup[o.baseObject.group], oo.baseByID[o.baseObject.id], oo.derivedByGroup[o.affiliations.group], oo.derivedByID[o.id]];
		for (let i = 0; i < sources.length; i++) {
			let s = sources[i];
			if (!s) continue;
			//let sk = Object.keys(s);
			for (let k in/*of*/ s) {//(sk) {
				//Override existing properties only:
				if (state[k] !== undefined) {
					state[k] = s[k];
				}
			}
		}
		
		//Cache the result, conditioned on the ShipState version
		//(not good, should restrict the dependency more)
		this.objectCache[o.id] = {
			overridesStateVer: this.objectOverrides.version,
			/*baseStateVer: o.baseObject.baseStateVersion,
			refStateVer: o.referenceStateVersion,*/
			state: state
		};
		
		return state;
	},
	//o is an object, k is a key to a single state property
	getObjectStateProperty: function(o, k) {
		return this.getObjectState(o)[k];
		//I have commented out a compact, but not very efficient, implementation of Alejandro's pattern, that does not fit too well with my caching solution.
/*		let oo = this.objectOverrides;
		let sources = [oo.derivedByID[o.id], oo.derivedByGroup[o.affiliations.group], oo.baseByID[o.baseObject.id], oo.baseByGroup[o.baseObject.group], oo.common, o.getReferenceState(), o.baseObject.getBaseState()].filter(e=>!!e);
		for (let i = 0; i < sources.length; i++) {
			if (sources[i][k] !== undefined) return sources[i][k];
		}
		return; //undefined*/
	},
	//Sets this state exclusively from parameter.
	setFromSpecification: function(spec={}) {
		this.objectCache = {}; //reset cache

		this.calculationParameters = spec.calculationParameters || {};
		
		//This is new:
		this.motion = spec.motion || 
					{
						heave: 0,
						pitch: 0,
						roll: 0,
						heading: 0,
						speed: 0,
					};

		let prevVer = typeof this.objectOverrides === "undefined" ? -1 : this.objectOverrides.version;

		if (spec.objectOverrides) {
			this.objectOverrides = {};
			let oo = this.objectOverrides;
			let soo = spec.objectOverrides || {};
			oo.common = soo.common || {};
			oo.baseByGroup = soo.baseByGroup || {};
			oo.baseByID = soo.baseByID || {};
			oo.derivedByGroup = soo.derivedByGroup || {};
			oo.derivedByID = soo.derivedByID || {};
		} else {
			//Named "overrides" because only existing corresponding properties will be set
			this.objectOverrides = {
				common: {},
				baseByGroup: {},
				baseByID: {},
				derivedByGroup: {},
				derivedByID: {}
			}
		}
		
		this.objectOverrides.version = prevVer+1;
		this.version++;
	},
	//Overrides existing directives and adds new ones.
	extend: function(spec) {
		Object.assign(this.calculationParameters, spec.calculationParameters);
		this.calculatedProperties = {};
		let oo = this.objectOverrides;
		let soo = spec.objectOverrides || {};
		Object.assign(oo.common, soo.common);
		let sources = [soo.baseByGroup, soo.baseByID, soo.derivedByGroup, soo.derivedByID];
		let targets = [oo.baseByGroup, oo.baseByID, oo.derivedByGroup, oo.derivedByID];
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			for (let k in sources[i]) {
				if (targets[i][k] !== undefined) {
					Object.assign(targets[i][k], sources[i][k]);
				} else {
					targets[i][k] = sources[i][k];
				}
			}
		}

		this.objectOverrides.version++;
		this.version++;
	},
	//Applies only directives of spec that have a corresponding directive in this.
	override: function(spec) {
		let oo = this.objectOverrides;
		let soo = spec.objectOverrides;
		
		let sources = [spec.calculationParameters, soo.common];
		let targets = [this.calculationParameters, oo.common];
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			for (let k in sources[i]) {
				if (targets[i][k] !== undefined) {
					targets[i][k] = sources[i][k];
				}
			}
		}

		sources = [soo.common, soo.baseByGroup, soo.baseByID, soo.derivedByGroup, soo.derivedByID];
		targets = [oo.common, oo.baseByGroup, oo.baseByID, oo.derivedByGroup, oo.derivedByID];
		
		for (let i = 0; i < sources.length; i++) {
			if (!sources[i]) continue;
			for (let key in sources[i]) {
				if (targets[i][key] !== undefined) {
					let t = targets[i][key];
					let s = sources[i][key];
					if (!s) continue;
					//Loop over individual properties in assignments, and override only:
					for (let k in s) {
						if (t[k] !== undefined) {
							t[k] = s[k];
						}
					}
				}
			}
		}

		this.objectOverrides.version++;
		this.version++;
	}
});