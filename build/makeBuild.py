from datetime import datetime

coreClasses = ["JSONSpecObject.js", "Vessel.js", "Structure.js", "Hull.js", "BaseObject.js", "DerivedObject.js", "VesselState.js"]
importExport = ["browseVessel.js", "loadVessel.js", "downloadVessel.js"]
functions = ["vectorOperations.js", "interpolation.js", "areaCalculations.js", "volumeCalculations.js", "parametricWeightParsons.js", "combineWeights.js"]
filepaths = list(map((lambda filename: "../source/functions/"+filename), functions)) \
            + list(map((lambda filename: "../source/CoreClasses/"+filename), coreClasses)) \
            + list(map((lambda filename: "../source/ImportExport/"+filename), importExport))

code = """
/*
Import like this in HTML:
<script src="ShipDesign.js"></script>
Then in javascript use classes and functions with a ShipDesign prefix. Example:
let vessel = new ShipDesign.Vessel(someSpecification);
*/

"use strict";

var ShipDesign = {};
(function() {
"""

for filepath in filepaths:
    file = open(filepath)
    code += file.read()
    file.close()

#This interface is currently very restricted.
#We can also include access to all of the functions.
#I just don't want to maintain a long list manually.
#Maybe there is an easier way...
code += """
Object.assign(ShipDesign, {
	/*JSONSpecObject: JSONSpecObject,*/
	Vessel: Vessel,
	Structure: Structure,
	Hull: Hull,
	BaseObject: BaseObject,
	DerivedObject: DerivedObject,
	VesselState: VesselState,
	browseVessel: browseVessel,
	loadVessel: loadVessel,
	downloadVessel: downloadVessel,
        f: {
            linearFromArrays: linearFromArrays
        }
});
})();
"""

timestamp = str(datetime.today())
from hashlib import md5
codehash = md5(code.encode()).hexdigest()

header = "//ShipDesign library, built " + timestamp + ", Checksum: " + codehash

output = header + code

stamp = timestamp[0:17] + "." + codehash[0:5]

oFile = open("ShipDesign.js", "w")
oFile.write(output)
oFile.close()

oFile = open("archive/ShipDesign_"+stamp.replace("-","").replace(":","").replace(" ","")+".js", "w")
oFile.write(output)
oFile.close()
