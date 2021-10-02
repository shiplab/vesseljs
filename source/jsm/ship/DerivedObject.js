import JSONSpecObject from "./JSONSpecObject.js";
import BaseObject from	"./BaseObject";
import Vectors from "../math/Vectors";

export default class DerivedObject extends JSONSpecObject {

	constructor( specification, baseObjects ) {

		this.baseObjects = baseObjects;

		super( specification );

	}

	setFromSpecification( spec ) {

		this.id = spec.id;
		this.group = spec.group || null;
		this.affiliations = spec.affiliations;

		if ( typeof spec.baseObject === "string" ) {

			this.baseObject = this.baseObjects[ spec.baseObject ];

		} else {

			this.baseObject = new BaseObject( spec.baseObject );

		}

		this.referenceState = spec.referenceState;
		//this.referenceStateVersion = 0;
		this.style = spec.style || {};
		return this;

	}

	getSpecification() {

		let spec = {
			id: this.id,
			group: this.group,
			affiliations: this.affiliations,
			referenceState: this.referenceState,
			style: this.style
		};
		if ( this.baseObjects[ this.baseObject.id ] !== undefined ) {

			spec.baseObject = this.baseObject.id;

		} else {

			spec.baseObject = this.baseObject.getSpecification();

		}

		return spec;

	}

	getWeight( state ) {

		let oState = state.getObjectState( this );

		//Support disabled objects:
		if ( oState.exists === false ) {

			return { mass: 0, cg: { x: 0, y: 0, z: 0 } };

		}

		let p = {
			x: oState.xCentre,
			y: oState.yCentre,
			z: oState.zBase
		};

		let w = this.baseObject.getWeight( oState.fullness );
		let m = w.mass;
		let cg = Vectors.add( p, w.cg );

		if ( isNaN( cg.x + cg.y + cg.z ) ) {

			console.error( "DerivedObject.getWeight: returning NaN values." );

		}

		return { mass: m, cg: cg };

	}

}
