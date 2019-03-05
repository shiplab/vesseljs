/*
A function for having the user browse and select a single local file, then process the result with a callback.

Usage:
browseFile(".txt", callback);
where callback is a function that handles the returned file object, typically involving a FileReader etc.

According to the ECMAScript standard, file browsing requests should be ignored unless initiated by the user. Tested on Chrome only. Chrome appears to be adhering to the standard, but is flexible enough that the initation can be done in several ways. Link onclick and button onclick are tested.
*/

"use strict";

var browseFile = function() {
	var browseButton;
	return function (types, onSelected) {
		browseButton = document.createElement("input");
		Object.assign(browseButton, {
			type: "file",
			multiple: false,
			style: "display: none",
			accept: types,
			onchange: function(e) {
				//console.log("Change event triggered on browse.");
				let file = browseButton.files[0];
				onSelected(file);
			}
		});
		browseButton.click();
	};
}();