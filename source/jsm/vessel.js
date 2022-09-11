import { REVISION } from "./constants.js";

export { Ship } from "./ship/Ship.js";
export { Ship3D } from "./3D_engine/Ship3D.js";
export { WaveCreator } from "./ship/WaveCreator.js";
export { WaveMotion } from "./ship/WaveMotion.js";
export { ShipState } from "./ship/ShipState.js";
export { HullResistance } from "./ship/HullResistance.js";
export { PropellerInteraction } from "./ship/PropellerInteraction.js";
export { downloadShip } from "./fileIO/dowloadShip.js";
export { FuelConsumption } from "./ship/FuelConsumption.js";
export { Positioning } from "./ship/Positioning.js";
export { Manoeuver } from "./ship/Manoeuver.js";

if ( typeof window !== "undefined" ) {

	if ( window.__VESSEL__ ) {

		console.warn( "WARNING: Multiple instances of Vessel.js being imported." );

	} else {

		window.__VESSEL__ = REVISION;

	}

}
