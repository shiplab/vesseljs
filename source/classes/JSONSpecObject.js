//@EliasHasle

/*Base class for objects that are constructed from
a literal object.

Constructors can take more parameters than the specification, but the specification must be the first parameter.

setFromSpecification will typically be overridden by derived classes. Overriding implementations will typically do some sanity checking.

getSpecification will also typically be overridden. The default implementation here is just a sketch. Maybe not even correct for the simplest subclasses.

Maybe this can be improved by implementing fromJSON and to toJSON methods.
*/

function JSONSpecObject(specification) {
	if (specification === null) {
		console.warn("JSONSpecObject: null specification provided. Defaulting to empty specification.");
		specification = {};
	} else if (typeof specification === "object") {}
	/*else if (typeof specification === "string") {
		try {
			specification = JSON.parse(specification);
		} catch(e) {
			console.error("JSONSpecObject: "+ e.message + "\n Defaulting to empty specification.");
			specification = {};
		}
	}*/
	else {
		if (typeof specification !== "undefined") {
			console.error("JSONSpecObject: Invalid constructor parameter. Defaulting to empty specification.");
		}
		specification = {};
	}
	this.setFromSpecification(specification);
}
JSONSpecObject.prototype = Object.create(Object.prototype);
Object.assign(JSONSpecObject.prototype, {
	constructor: JSONSpecObject,
	setFromSpecification: function (specification) {
		//No sanity checking by default.
		Object.assign(this, specification);
		return this;
	},
	getSpecification: function () {
		let spec = {};
		for (k of Object.keys(this)) {
			if (this.hasOwnProperty(k)) spec[k] = this[k];
		}
		return spec;
	},
	//toJSON is the standard way. Added here for testing.
	toJSON: function () {
		return this.getSpecification();
	},
	//fromJSON is added as an alternative and better name.
	fromJSON: function (spec) {
		return this.setFromSpecification(spec);
	}
});