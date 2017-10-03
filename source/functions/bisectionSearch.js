@EliasHasle

/*Function that takes a sorted array as input, and finds the last index that holds a numerical value less than, or equal to, a given value.
Returns an object with the index and an interpolation parameter mu that gives the position of value between index and index+1.
*/
function bisectionSearch(array, value) {
	if (value < array[0]) {
		console.warn("bisectionSearch: requested value below lowest array element. Returning undefined.");
		return undefined;
	}
	let index = 0, upper = array.length;
	while (upper > index+1) {
		let c = Math.floor(0.5*(index+upper));
		if (array[c] === value) return {index: c, mu: 0};
		else if (array[c] < value) index = c;
		else upper = c;
	}
	let mu = (value-array[index])/(array[index+1]-array[index]);
	if (index === array.length-1) console.warn("bisectionSearch: Hit at end of array. Simple interpolation will result in NaN.");
	return {index: index, mu: mu};
}