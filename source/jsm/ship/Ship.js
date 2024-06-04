//@EliasHasle
//@ferrari212

/*
Notes:
For calculated values, I envision a lazy calculation pattern, where all properties involved in calculations are only accessed by specialized getters and setters, and calculated properties have some kind of needsUpdate flag or version number (that is set by any setters that will directly or indirectly affect the property). When, and only when, running the getter for the given property, the flag/version is checked, and if false (same version as in cache) the getter just returns the stored value. If true, the getter starts the calculation of the value, invoking other getters.

Suggested calculations to do:
- Inertia matrix (will need more detailed properties of parts).
*/
import { JSONSpecObject } from "./JSONSpecObject.js";
import { BaseObject } from "./BaseObject.js";
import { DerivedObject } from "./DerivedObject.js";
import { Structure } from "./Structure.js";
import { ShipState } from "./ShipState.js";
import { combineWeights } from "../math/combineWeights.js";
import { loadXMLHttpRequest } from "../fileIO/loadShip.js";

export class Ship extends JSONSpecObject {

	constructor( specification ) {

		// Check if the Specification is a string pointing
		// to a JSON file. In case of positive answer, load
		// the file and parse it to JSON

		// Warning: this uses an async function for XMLHttpRequest
		// this function is deprecated and it is not recommended for
		// slow connections. Its purpose is to ease the usability
		// of the library without having to import the loader in the main script.
		// For further information on synchronous request, please read:
		// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#synchronous_request
		// @ferrari212
		if ( typeof specification === "string" ) {

			loadXMLHttpRequest( specification, function ( parsedJSON ) {

				specification = parsedJSON;

			}, false );

		}


		super( specification );

	}

	createShip3D( specs, Ship3D ) {


		const state = this.designState;
		try {

			// Initialize the
			this.ship3D = new Ship3D( this, Object.assign( {
				shipState: state,
			}, specs )
			);

		} catch ( error ) {

			const error_string = "Ship3D is not a constructor";

			if ( error.message.includes( error_string ) ) {

				const error_reason = "The Ship3D function passed as argument is in a wrong format";
				const error_solution = "Please, verify if the argument was imported correctly on the parent function: import { Ship3D } from 'path/to/file'";

				console.error( `${error_reason}: ${error.message}. ${error_solution}` );

			} else {

				console.error( error );

			}

		}


	}

	calculateDraft( shipState, epsilon = 0.001, rho = 1025 ) {

		let w = this.getWeight( shipState );
		let M = w.mass;
		return this.structure.hull.calculateDraftAtMass( M, epsilon, rho );

	}

	calculateStability( shipState ) {

		let w = this.getWeight( shipState );
		let KG = w.cg.z;
		let LCG = w.cg.x;
		let T = this.structure.hull.calculateDraftAtMass( w.mass );
		let { BMt, BMl, KB, LCB, LCF, LWL, BWL } = this.structure.hull.calculateAttributesAtDraft( T );
		let GMt = KB + BMt - KG;
		let GMl = KB + BMl - KG;

		// avaiable just for small angles < 3°
		// this calculation can be incorporated to Vessesl.js with no problem
		let trim = ( LCB - LCG ) / GMl;
		let draftfp = 0;
		let draftap = 0;
		let trimd = 0;

		if ( trim < Math.tan( 3 * Math.PI / 180 ) ) {

			draftfp = T - ( LWL - LCF ) * trim;
			draftap = T + ( LCF ) * trim;
			trimd = draftfp - draftap;

		} else {

			draftfp = null;
			draftap = null;
			trimd = null;

		}

		//change the trim for angles
		trim = Math.atan( trim ) * 180 / Math.PI;
		console.log( trimd );

		let heel = w.cg.y / GMt;
		//change the hell for meters
		heel *= BWL;

		return { w, T, GMt, GMl, KB, BMt, BMl, KG, trim, draftfp, draftap, trimd, heel };

	}

	getFuelMass( shipState ) {

		shipState = shipState || this.designState;

		let fuelMass = {};
		fuelMass.totalMass = 0;
		fuelMass.tankMass = {};
		fuelMass.tankStates = {};
		for ( let o of Object.values( this.derivedObjects ) ) {

			if ( o.affiliations.group === "fuel tanks" ) {

				fuelMass.tankStates[ o.id ] = shipState.getObjectState( o );
				fuelMass.tankMass[ o.id ] = o.baseObject.weightInformation.contentDensity * o.baseObject.weightInformation.volumeCapacity * fuelMass.tankStates[ o.id ].fullness;
				fuelMass.totalMass += fuelMass.tankMass[ o.id ];

			}

		}

		return fuelMass;

	}

	subtractFuelMass( mass, shipState ) {

		shipState = shipState || this.designState;

		var fuelMass = this.getFuelMass( shipState );
		var totalFuel = fuelMass.totalMass;
		var tankEntr = Object.entries( fuelMass.tankMass );

		var fuelCap = 0;
		for ( var tk = 0; tk < tankEntr.length; tk ++ ) {

			var tkId = tankEntr[ tk ][ 0 ];
			fuelCap += this.derivedObjects[ tkId ].baseObject.weightInformation.volumeCapacity * this.derivedObjects[ tkId ].baseObject.weightInformation.contentDensity;

		}

		// check if tanks have necessary fuel
		if ( mass <= totalFuel ) { // if yes, subtract mass in the same proportion

			for ( var tk = 0; tk < tankEntr.length; tk ++ ) {

				var tkId = tankEntr[ tk ][ 0 ];
				shipState.objectCache[ tkId ].state.fullness -= mass / fuelCap;

			}

		} else { // if not, make tanks empty

			mass -= totalFuel;
			for ( var tk = 0; tk < tankEntr.length; tk ++ ) {

				var tkId = tankEntr[ tk ][ 0 ];
				shipState.objectCache[ tkId ].state.fullness = 0;

			}

			console.error( "Vessel ran out of fuel before " + mass.toFixed( 2 ) + " tons were subtracted." );

		}

		// update related states. In the future, make this consistent with improved caching system
		for ( var prop in shipState.objectCache ) {

			shipState.objectCache[ prop ].thisStateVer ++;

		}

		shipState.version ++;

	}

	setFromSpecification( specification ) {


		this.attributes = specification.attributes || {};
		this.structure = new Structure( specification.structure/*,this*/ );
		//baseObjects and derivedObjects are arrays in the specification, but are objects (hashmaps) in the constructed ship object:
		this.baseObjects = {};
		for ( let i = 0; i < specification.baseObjects.length; i ++ ) {

			let os = specification.baseObjects[ i ];
			this.baseObjects[ os.id ] = new BaseObject( os );

		}

		this.derivedObjects = {};
		for ( let i = 0; i < specification.derivedObjects.length; i ++ ) {

			let os = specification.derivedObjects[ i ];
			this.derivedObjects[ os.id ] = new DerivedObject( os, this.baseObjects );

		}

		this.designState = new ShipState( specification.designState );
		return this;


	}

	getSpecification() {

		let specification = {};
		specification.attributes = this.attributes;
		specification.structure = this.structure.getSpecification();

		specification.baseObjects = Object.values( this.baseObjects ).map( o => o.getSpecification() );
		specification.derivedObjects = Object.values( this.derivedObjects ).map( o => o.getSpecification() );

		specification.designState = this.designState.getSpecification();

		return specification;

	}

	getWeight( shipState ) {

		shipState = shipState || this.designState;

		// Comment: This piece of code maybe must be deleted
		// this.structure = new Structure( specification.structure/*,this*/ );

		let components = [];

		components.push(
			this.structure.getWeight( this.designState )
		);

		for ( let o of Object.values( this.derivedObjects ) ) {

			components.push( o.getWeight( shipState ) );

		}

		var W = combineWeights( components );
		//console.info("Calculated weight object: ", W);
		return W;

	}

	// This function is for sanity checking if objects states and id are compatible
	validateObjectBond( objects, id ) {

		if ( typeof id !== "string" || objects[ id ] === undefined ) {

		  console.error( "Undefined bond with ID '" + id + "' in the object" );
		  throw new Error( "validateObjectBond: object bond modification not valid" );

		}

	}

	changeObject( object, spec ) {

		if ( typeof object !== "object" ) {

			console.error( "changeObject: object must be an object." );
			return;

		}

		if ( typeof spec !== "object" ) {

			console.error( "changeObject: spec must be an object." );
			return;

		}

		for ( const key in spec ) {

			// this ensures all the keys are reassigned to the object
			const previous_spec = object.getSpecification()[ key ];

			const new_spec = {};
			new_spec[ key ] = Object.assign( previous_spec, spec[ key ] );

			Object.assign( object, new_spec );

		}

	}

	getBaseObjectById( id = undefined ) {

		if ( id === undefined ) {

			return this.baseObjects;

		}

		const ids_array = Array.isArray( id ) ? id : [ id ];

		let obj = {};

		for ( let id of ids_array ) {

			const baseObject = this.baseObjects[ id ];
			if ( baseObject ) {

				obj[ id ] = baseObject;

			} else {

				console.warn( `BaseObject with id ${id} not found.` );

			}


		}

		return obj;

	}


	changeBaseObjectById( id, spec ) {

		this.validateObjectBond( this.baseObjects, id );

		this.changeObject( this.baseObjects[ id ], spec );

	}

	changeDerivedObjectById( id, spec ) {

		this.validateObjectBond( this.derivedObjects, id );

		this.changeObject( this.derivedObjects[ id ], spec );

		if ( "baseObject" in spec ) {

			console.error( "Key 'baseObject' identified under the spec. Please, use change changeBaseObjectById if you want to change the base object." );
			return;

		}

	}

	deleteBaseObjectById( id ) {

		this.validateObjectBond( this.baseObjects, id );

		delete this.baseObjects[ id ];

		// Check if an derivedObject is using the deleted object as baseObject
		// Delete it in case it is
		for ( const [ key, o ] of Object.entries( this.derivedObjects ) ) {

			if ( o.baseObject.id === id ) {

				this.deleteDerivedObjectById( key );

			}

		}

	}

	deleteDerivedObjectById( id ) {

		this.validateObjectBond( this.derivedObjects, id );

		delete this.derivedObjects[ id ];

	}

	addNewObject( spec ) {

		if ( typeof spec !== "object" ) {

			console.error( "changeObject: spec must be an object." );
			return;

		}

		if ( ! Array.isArray( spec.baseObject ) || ! Array.isArray( spec.derivedObjects ) ) {

			console.error( "addObject: spec.baseObject must be an array." );
			return;

		}

		for ( let baseObject of spec.baseObject ) {

			this.baseObjects[ baseObject.id ] = new BaseObject( baseObject );

		}

		for ( let derivedObject of spec.derivedObjects ) {

			this.validateObjectBond( this.baseObjects, derivedObject.id );

			this.derivedObjects[ derivedObject.id ] = new DerivedObject( derivedObject, this.baseObjects );

		}

	}

}



