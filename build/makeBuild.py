from datetime import datetime

coreClasses = ["JSONSpecObject.js", "Ship.js", "Structure.js", "Hull.js", "BaseObject.js", "DerivedObject.js", "ShipState.js"]
importExport = ["browseShip.js", "loadShip.js", "downloadShip.js"]
functions = ["vectorOperations.js", "interpolation.js", "areaCalculations.js", "volumeCalculations.js", "parametricWeightParsons.js", "combineWeights.js"]
filepaths = list(map((lambda filename: "../source/functions/"+filename), functions)) \
            + list(map((lambda filename: "../source/CoreClasses/"+filename), coreClasses)) \
            + list(map((lambda filename: "../source/ImportExport/"+filename), importExport))

code = """
/*
Import like this in HTML:
<script src="Vessel.js"></script>
Then in javascript use classes and functions with a ShipDesign prefix. Example:
let ship = new Vessel.Ship(someSpecification);
*/

"use strict";

var Vessel = {};
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
Object.assign(Vessel, {
	/*JSONSpecObject: JSONSpecObject,*/
	Ship: Ship,
	Structure: Structure,
	Hull: Hull,
	BaseObject: BaseObject,
	DerivedObject: DerivedObject,
	ShipState: ShipState,
	browseShip: browseShip,
	loadShip: loadShip,
	downloadShip: downloadShip,
        f: {
            linearFromArrays: linearFromArrays
        }
});
})();
"""

timestamp = str(datetime.today())
from hashlib import md5
codehash = md5(code.encode()).hexdigest()

header = "//Vessel.js library, built " + timestamp + ", Checksum: " + codehash

output = header + code

stamp = timestamp[0:17] + "." + codehash[0:5]

oFile = open("Vessel.js", "w")
oFile.write(output)
oFile.close()

oFile = open("archive/Vessel_"+stamp.replace("-","").replace(":","").replace(" ","")+".js", "w")
oFile.write(output)
oFile.close()
