#Now the "geeky" md5 hash and archiving is disabled. It was of no practical use, really.

from datetime import datetime

classes = ["JSONSpecObject.js", "Ship.js", "Structure.js", "Hull.js", "BaseObject.js", "DerivedObject.js", "ShipState.js", "StateModule.js", "WaveCreator.js", "WaveMotion.js", "Positioning.js", "FuelConsumption.js", "HullResistance.js", "PropellerInteraction.js"]
fileIO = ["browseShip.js", "loadShip.js", "downloadShip.js"]
math = ["Vectors.js", "interpolation.js", "areaCalculations.js", "volumeCalculations.js", "parametricWeightParsons.js", "combineWeights.js"]
filepaths = list(map((lambda filename: "../source/math/"+filename), math)) \
            + list(map((lambda filename: "../source/classes/"+filename), classes)) \
            + list(map((lambda filename: "../source/fileIO/"+filename), fileIO))

code = """
/*
Import like this in HTML:
<script src="vessel.js"></script>
Then in javascript use classes and functions with a vessel prefix. Example:
let ship = new vessel.Ship(someSpecification);
*/

"use strict";

var vessel = {};
var Vessel = vessel; //alias for backwards compatibility

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
Object.assign(vessel, {
	/*JSONSpecObject: JSONSpecObject,*/
	Ship: Ship,
	Structure: Structure,
	Hull: Hull,
	BaseObject: BaseObject,
	DerivedObject: DerivedObject,
	ShipState: ShipState,
	StateModule: StateModule,
	WaveCreator: WaveCreator,
	WaveMotion: WaveMotion,
	Positioning: Positioning,
	FuelConsumption: FuelConsumption,
	HullResistance: HullResistance,
	PropellerInteraction: PropellerInteraction,
	browseShip: browseShip,
	loadShip: loadShip,
	downloadShip: downloadShip,
        f: {
            linearFromArrays: linearFromArrays,
            bilinear: bilinear,
            bisectionSearch
        },
        Vectors: Vectors
});
})();
"""

timestamp = str(datetime.today())
#from hashlib import md5
#codehash = md5(code.encode()).hexdigest()

header = "//vessel.js library, built " + timestamp# + ", Checksum: " + codehash

output = header + code

#stamp = timestamp[0:17] + "." + codehash[0:5]

oFile = open("../build/vessel.js", "w")
oFile.write(output)
oFile.close()
#oFile = open("archive/vessel_"+stamp.replace("-","").replace(":","").replace(" ","")+".js", "w")
#oFile.write(output)
#oFile.close()
