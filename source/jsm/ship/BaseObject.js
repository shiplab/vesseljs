import JSONSpecObject from "./JSONSpecObject.js";

class BaseObject extends JSONSpecObject {

	constructor( specification ) {

		super( specification );
		this.weightCache = {};

	}

	setFromSpecification( spec ) {

		this.id = spec.id;
		this.affiliations = spec.affiliations || {};
		this.boxDimensions = spec.boxDimensions || { length: undefined, width: undefined, height: undefined };
		this.weightInformation = spec.weightInformation;
		this.cost = spec.cost || { currency: undefined, value: undefined };
		this.capabilities = spec.capabilities || {};
		this.file3D = spec.file3D;
		this.baseState = spec.baseState;
		return this;

	}

	getSpecification() {

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

	}

}

export default BaseObject
;
