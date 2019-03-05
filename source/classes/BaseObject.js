//@EliasHasle

/*
Depends on JSONSpecObject.js
*/

function BaseObject(specification) {
	this.weightCache = {};
	JSONSpecObject.call(this, specification);
}
BaseObject.prototype = Object.create(JSONSpecObject.prototype);
Object.assign(BaseObject.prototype, {
	constructor: BaseObject,
	setFromSpecification: function (spec) {
		this.id = spec.id;
		this.affiliations = spec.affiliations || {};
		this.boxDimensions = spec.boxDimensions || {
			length: undefined,
			width: undefined,
			height: undefined
		};
		this.weightInformation = spec.weightInformation;
		this.cost = spec.cost || {
			currency: undefined,
			value: undefined
		};
		this.capabilities = spec.capabilities || {};
		this.file3D = spec.file3D;
		this.baseState = spec.baseState;
		return this;
	},
	getSpecification: function () {
		return {
			id: this.id,
			affiliations: this.affiliations,
			boxDimensions: this.boxDimensions,
			weightInformation: this.weightInformation,
			cost: this.cost,
			capabilities: this.capabilities,
			file3D: this.file3D,
			baseState: this.baseState
		};
	},
	//Maybe this will take more state parameters than just fullness.
	getWeight: function (fullness) {
		fullness = fullness || 0;

		let wi = this.weightInformation;
		//Should maybe have been this.capabilities.weightInformation?

		//(Fluid) container properties default to no content:
		let d = wi.contentDensity || 0;
		let v = wi.volumeCapacity || 0;
		//Maybe we should have another handling of cargo (with variable density)

		let m = wi.lightweight + d * v * fullness;
		let cg;
		if (wi.fullnessCGMapping !== undefined) {
			let fcgm = wi.fullnessCGMapping;
			let fs = fcgm.fullnesses;
			let cgs = fcgm.cgs;
			//Find closest entries:
			let {
				index: i,
				mu: mu
			} = bisectionSearch(fs, fullness);
			cg = [];
			for (let j = 0; j < 3; j++) {
				let c;
				if (i < fs.length - 1)
					//Linear interpolation between closest entries:
					c = lerp(cgs[i][j], cgs[i + 1][j], mu);
				else c = cgs[i][j];
				//if (c===null || isNaN(c)) console.error("BaseObject.getWeight: Invalid value found after interpolation.");
				cg.push(c);
			}
		} else if (wi.cg !== undefined) {
			//console.log("BaseObject.getWeight: Using specified cg.");
			cg = wi.cg;
		} else {
			console.warn("BaseObject.getWeight: No cg or fullnessCGMapping supplied. Defaults to center of bounding box.");
			cg = [0, 0, 0.5 * this.boxDimensions.height];
		}
		let w = {
			mass: m,
			cg: {
				x: cg[0],
				y: cg[1],
				z: cg[2]
			}
		};
		return w;
	}
});