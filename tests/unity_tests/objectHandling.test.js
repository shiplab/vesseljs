import exp from "constants";
import { Ship } from "../../source/jsm/ship/Ship.js";


describe( "Ship class methods", () => {

	let ship;
	let modified_base_object;
	const psvData = require( "../../examples/ship_specs/PX121.json" );

	beforeEach( () => {

		// deep copy for not propagating changes
		const deep_clone = JSON.parse( JSON.stringify( psvData ) );
		ship = new Ship( deep_clone );
		modified_base_object = { "boxDimensions": {
			"length": 450000,
			"breadth": 6.7,
			"height": 43000
		} };

	} );

	test( "changeObject", () => {

		const id = "TankL4.199999999999999B6.7H4.3fdundefinedFtank2.stl";

		ship.changeObject( ship.baseObjects[ id ], modified_base_object );

		console.log( "boxDimensions", ship.baseObjects[ id ].boxDimensions );
		expect( ship.baseObjects[ id ].boxDimensions[ "length" ] ).toBe( 450000 );
		expect( ship.baseObjects[ id ].boxDimensions[ "breadth" ] ).toBe( 6.7 );
		expect( ship.baseObjects[ id ].boxDimensions[ "height" ] ).toBe( 43000 );


	} );

	test( "getBaseObjectById", () => {

		const id = "TankL4.199999999999999B6.7H4.3fdundefinedFtank2.stl";

		const obj = ship.getBaseObjectById( id );
		const select_object = obj[ id ];

		expect( select_object.boxDimensions[ "length" ] ).toBe( 4.199999999999999 );
		expect( select_object.boxDimensions[ "breadth" ] ).toBe( 6.7 );
		expect( select_object.boxDimensions[ "height" ] ).toBe( 4.3 );


	} );

	test( "changeBaseObjectById", () => {

		const id = "TankL4.199999999999999B6.7H4.3fdundefinedFtank2.stl";

		ship.changeBaseObjectById( id, modified_base_object );

		expect( ship.baseObjects[ id ].boxDimensions[ "length" ] ).toBe( 450000 );
		expect( ship.baseObjects[ id ].boxDimensions[ "breadth" ] ).toBe( 6.7 );
		expect( ship.baseObjects[ id ].boxDimensions[ "height" ] ).toBe( 43000 );

		// Verify the error by inserting a wrong id
		const wrong_id = "TANK_UNDEFINED";

		expect( () => {

			ship.changeBaseObjectById( wrong_id, modified_base_object );

		} ).toThrow( "validateObjectBond: object bond modification not valid" );

	} );

	test( "changeDerivedObjectById", () => {

		const obj = { "referenceState": { "yCentre": 0.0 } };
		const id = "Tank3";

		ship.changeDerivedObjectById( id, obj );

		expect( ship.derivedObjects[ id ].referenceState[ "yCentre" ] ).toBe( 0.0 );

	} );

	test( "deleteBaseObjectById", () => {

		const id = "TankL4.199999999999999B6.7H4.3fdundefinedFtank2.stl";

		ship.deleteBaseObjectById( id );

		expect( ship.getBaseObjectById( id ) ).toMatchObject( {} );

		// Derived objects must have being cleared as well
		expect( ship.derivedObjects[ "Tank3" ] ).toEqual( undefined );

		expect( ship.derivedObjects[ "Tank4" ] ).toEqual( undefined );

	} );

	test( "deleteDerivedObjectById", () => {

		ship.deleteDerivedObjectById( "Tank3" );

		expect( ship.derivedObjects[ "Tank3" ] ).toEqual( undefined );

	} );

} );
