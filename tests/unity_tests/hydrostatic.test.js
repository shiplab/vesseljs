import * as Vessel from "../../source/jsm/vessel.js";


test( "Stability Modules Test", () => {

	const blockCaseJSON = require( "../../examples/ship_specs/blockCase.json" );
	const ship = new Vessel.Ship( blockCaseJSON );

	const stability = ship.calculateStability();

	const draftc = stability.T;
	const trimac = stability.trim;
	const draftfpc = stability.draftfp;
	const draftapc = stability.draftap;
	const trimdc = stability.trimd;
	const heelc = stability.heel;

	expect( draftc ).toBeCloseTo( 3.322 );
	expect( trimac ).toBeCloseTo( 0.129 );
	expect( draftfpc ).toBeCloseTo( 3.300 );
	expect( draftapc ).toBeCloseTo( 3.345 );
	expect( trimdc ).toBeCloseTo( - 0.045 );
	expect( heelc ).toBeCloseTo( 0.000 );


} );

test( "Hydrostatics Modules Test", () => {

	const blockCaseJSON = require( "../../examples/ship_specs/blockCase.json" );
	const ship = new Vessel.Ship( blockCaseJSON );

	const stability = ship.calculateStability();
	const draftc = stability.T;
	const hydrostatics = ship.structure.hull.calculateAttributesAtDraft( draftc );

	const KBc = hydrostatics.KB;
	const BMc = hydrostatics.BMt;
	const GM2 = stability.GMt;
	const LCBc = hydrostatics.LCB;
	const LCFc = hydrostatics.LCF;
	const lwlc = hydrostatics.LWL;
	const bwlc = hydrostatics.BWL;
	const Awetc = hydrostatics.As;
	const Awpc = hydrostatics.Awp;
	const cbc = hydrostatics.Cb;
	const disp = hydrostatics.Vs * 1.025;

	expect( KBc ).toBeCloseTo( 2.215 );
	expect( BMc ).toBeCloseTo( 3.461 );
	expect( GM2 ).toBeCloseTo( 2.402 );
	expect( LCBc ).toBeCloseTo( 10.000 );
	expect( LCFc ).toBeCloseTo( 10.000 );
	expect( lwlc ).toBeCloseTo( 20.000 );
	expect( bwlc ).toBeCloseTo( 8.306 );
	expect( Awetc ).toBeCloseTo( 240.323 );
	expect( Awpc ).toBeCloseTo( 166.114 );
	expect( cbc ).toBeCloseTo( 0.500 );
	expect( disp ).toBeCloseTo( 282.837 );

} );


