const _ = window._;

export function addRows( className, mode1, mode2, id ) {

	const check = _.differenceWith( mode1, mode2, _.isEqual );
	const result = check.length ? `<td style="background-color: #fd7d7d">Not Equal</td>` : `<td style="background-color: #9fe5ab">Equal</td>`;

	document.getElementById( id ).innerHTML += `<tr>
    <td>${className}</td>
    ${result}
  </tr>`;

}
