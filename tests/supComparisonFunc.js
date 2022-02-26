const _ = window._;

export function addRows( className, mode1, mode2, id, showModes = false ) {

	// const check = _.differenceWith( [ mode1 ], [ mode2 ], _.isEqual );
	const check = _.isEqual( mode1, mode2 );
	const result = check ? `<td style="background-color: #9fe5ab">Equal</td>` : `<td style="background-color: #fd7d7d">Not Equal</td>`;

	document.getElementById( id ).innerHTML += `<tr>
    ${addClassName( className )}
    ${showModes ? addModeValue( mode1, mode2 ) : ""}
    ${result}
  </tr>`;

	console.log( mode1 );
	console.log( mode2 );
	console.log( "Difference: ", diff( mode2, mode1 ) );

}

const diff = function ( obj1, obj2 ) {

	// Source:
	//  https://stackoverflow.com/questions/31683075/how-to-do-a-deep-comparison-between-2-objects-with-lodash

	return _.reduce( obj1, function ( result, value, key ) {

		if ( _.isPlainObject( value ) ) {

			result[ key ] = diff( value, obj2[ key ] );

		} else if ( ! _.isEqual( value, obj2[ key ] ) ) {

			result[ key ] = value;

		}

		return result;

	}, {} );

};

function addClassName( n ) {

	return `<td>${n}</td>`;

}

function addModeValue( m1, m2 ) {

	return `<td>${m1}</td><td>${m2}</td>`;

}
