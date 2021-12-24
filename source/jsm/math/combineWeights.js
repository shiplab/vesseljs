//@EliasHasle

import Vectors from "./Vectors.js";

//Very unoptimized for now.
export function combineWeights( array ) {

	let M = array.reduce( ( sum, e ) => sum + e.mass, 0 );
	let cgms = array.map( e => Vectors.scale( e.cg, e.mass ) );
	let CG = Vectors.scale( Vectors.sum( cgms ), 1 / M );

	return { mass: M, cg: CG };

}
