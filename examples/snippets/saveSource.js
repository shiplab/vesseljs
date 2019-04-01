function saveSource() {
	var zip = new JSZip();
	var srcPaths = $("script[src]");                    // store the path of each source
	console.log(srcPaths);
	var url, path, file;
	for (i = 0; i <= srcPaths.length - 1; i++) {        // "-1" removes the undefined file automatically created
		url = srcPaths[i].src;                          // extract the path for each source file
		path = url.split("vesseljs.org/").pop();           // remove the url
		file = loadFile("../../" + path);
		zip.file(path, file, {binary: true});           // create the zip file
	}
	url = srcPaths["context"].baseURI;                  // extract the path for the HTML document
	path = url.split("vesseljs.org/").pop();               // remove the url
	file = loadFile("../../" + path);
	zip.file(path, file, {binary: true});               // create the zip file
	zip.generateAsync({type: "blob"}).then(function(content) {
		saveAs(content, "source.zip");                  // export/download the zip file with FileSaver.js
	});
}

// taken from https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript
function loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status == 200) {
		result = xmlhttp.responseText;
	}
	return result;
}
