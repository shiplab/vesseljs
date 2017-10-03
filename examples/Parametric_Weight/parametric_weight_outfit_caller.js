//@MrEranwe

ShipDesign.Hull.prototype.getWeightOutfit = function(){
	//let hullvalues = this.calculateAttributes();
	let vesselAttributes = this.vessel.attributes;
	let LBP = this.vessel.attributes.LBP;
	let Co = this.vessel.attributes.Co;
	let D = this.vessel.attributes.Draft_Design;
    
	return parametricWeightOutfit(Co, LBP, D)
};