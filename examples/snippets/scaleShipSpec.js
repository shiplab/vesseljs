// scale ship specification
function scaleShipSpec(inputSpec, lengthRatio, beamRatio, depthRatio) {
	// copy input spec to a separate object
	var strSpec = JSON.stringify(inputSpec);
	var shipSpec = JSON.parse(strSpec);

	// read main dimensions
	var mainDimensions = shipSpec.structure.hull.attributes;

	// calculate new main dimensions
	mainDimensions.LOA *= lengthRatio;
	mainDimensions.BOA *= beamRatio;
	mainDimensions.Depth *= depthRatio;

	// scale relevant calculation parameters
	// but what is K? should it be scaled?
	shipSpec.designState.LWL_design *= lengthRatio;
	shipSpec.designState.Draft_design *= depthRatio;

	for (var prop in shipSpec.baseObjects) {
		shipSpec.baseObjects[prop].boxDimensions.length *= lengthRatio;
		shipSpec.baseObjects[prop].boxDimensions.breadth *= beamRatio;
		shipSpec.baseObjects[prop].boxDimensions.height *= depthRatio;
		shipSpec.baseObjects[prop].weightInformation.volumeCapacity *= lengthRatio * beamRatio * depthRatio;

		// check if cg is fixed or mapped
		if (shipSpec.baseObjects[prop].weightInformation.cg !== undefined) {
			shipSpec.baseObjects[prop].weightInformation.cg[2] *= depthRatio;
		} else if (shipSpec.baseObjects[prop].weightInformation.fullnessCGMapping !== undefined) {
			for (var i = 0; i < shipSpec.baseObjects[prop].weightInformation.fullnessCGMapping.cgs.length; i++) {
				shipSpec.baseObjects[prop].weightInformation.fullnessCGMapping.cgs[i][2] *= depthRatio;
			}
		}
	}

	for (prop in shipSpec.derivedObjects) {
		shipSpec.derivedObjects[prop].referenceState.xCentre *= lengthRatio;
		shipSpec.derivedObjects[prop].referenceState.yCentre *= beamRatio;
		shipSpec.derivedObjects[prop].referenceState.zBase *= depthRatio;
	}

	for (prop in shipSpec.structure.decks) {
		shipSpec.structure.decks[prop].xAft *= lengthRatio;
		shipSpec.structure.decks[prop].xFwd *= lengthRatio;
		shipSpec.structure.decks[prop].yCentre *= beamRatio;
		shipSpec.structure.decks[prop].breadth *= beamRatio;
		shipSpec.structure.decks[prop].zFloor *= depthRatio;
	}

	for (prop in shipSpec.structure.bulkheads) {
		shipSpec.structure.bulkheads[prop].xAft *= lengthRatio;
	}

	return shipSpec;
}
