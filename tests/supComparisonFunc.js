// const _ = window._;
// const deep = window.DeepDiff;

export function addRows( className, mode1, mode2, id, showModes = false ) {

	const diff = window.DeepDiff.diff;

	// const check = _.differenceWith( [ mode1 ], [ mode2 ], _.isEqual );
	const check = diff( mode1, mode2 );
	const result = check === undefined ? "<td style=\"background-color: #9fe5ab\">Equal</td>" : "<td style=\"background-color: #fd7d7d\">Not Equal</td>";
	// debugger;
	document.getElementById( id ).innerHTML += `<tr>
    ${addClassName( className )}
    ${showModes ? addModeValue( mode1, mode2 ) : ""}
    ${result}
  </tr>`;

	console.log( mode1 );
	console.log( mode2 );
	console.log( `Difference:  ${className}`, check );

}

function addClassName( n ) {

	return `<td>${n}</td>`;

}

function addModeValue( m1, m2 ) {

	m1 = checkNumberAndRound( m1 );
	m2 = checkNumberAndRound( m2 );
	return `<td>${m1}</td><td>${m2}</td>`;

}

function checkNumberAndRound( v, base = 3 ) {

	if ( typeof v !== "number" ) {

		return v;

	}

	return v.toFixed( base );

}
