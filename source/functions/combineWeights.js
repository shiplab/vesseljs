//@EliasHasle

//Very unoptimized for now.
function combineWeights(array) {
	let M = array.reduce((sum,e)=>sum+e.mass,0);
	let cgms = array.map(e=>scaleVec(e.cg, e.mass));
	let CG = scaleVec(sumVec(cgms), 1/M);
	
	return {mass: M, cg: CG};
}