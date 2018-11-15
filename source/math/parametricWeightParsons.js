//@MrEranwe
//@EliasHasle

"use strict";
//Elias notes:
//LCB and LCG were obviously considered in another coordinate system than we are using. I have corrected this, assuming that the wrong coordinate system had the origin centered longitudinally.
//The hull mass is off by several orders of magnitude. Checking the paper, it seems likely that the "typical" K parameters are aimed at producing units of tonnes, not kg.
//It is not mathematically correct to strip down the structural weight calculation the way it is done here, because the exponentiation (E^1.36) cannot be simply decomposed as a sum of exponentiated terms (with the same exponent).
//Elias has only reviewed and modified the hull weight calculation.

// This function estimates the structural weight of the hull. This includes the weight of the basic hull to its depth amidships.

// It is based on Watson and Gilfillan modeling approach using a specific modification of the Lloyd’s Equipment Numeral E as the independent variable.
//
//
// Inputs
// K is the structural weight coefficient. Parsons, chapter 11, table 11.VII.
// L is LWL or LBP
// B is molded beam
// T is molded draft
// D is molded depth
// Superstructures and shiphouses are not being considered in the weight
// CB is the block coefficient
// LCB is the Longitudinal Center of Bouyancy
//
// Return
// It returns an object on the format {mass:1234, cg: {x:4,y:3,z:2}}, where the unit of mass is unclear, and x,y,z is in meters from aft,center,bottom, respectively.

 function parametricWeightHull(K, L, B, T, D, CB, Fn){

	 // Calculates estimated structural weight
	 // E is the Lloyd’s Equipment Numeral
	 let E = L * (B + T) + 0.85 * L * (D - T);
	 // CbCorrected is the estimated corrected block coefficient
	 let CBCorrected = CB + (1 - CB) * ((0.8 * D - T) / (3 * T));
	 // W is the estimated structural weight
	 let W = K * Math.pow(E, 1.36) * (1 + 0.5 * (CBCorrected - 0.7));

	 // Calculates LCG and VCG
	 // VCGHull is the Vertical Center of Gravity of the hull
	 let VCGHull = 0;
	 if (L < 120){
		 VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2)) + 0.008 * D * (L / D - 6.5);
	 }
	 else {
		  VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2));
	 }
     // LCB is the longitudinal Center of Buoyancy in percentage plus forward of amidships
     let LCB = Fn ? 0.5*L + (9.7 - 45 * Fn)*L/100 : L*0.516;
	 // LCGHull is the Longitudinal Center of Gravity of the hull
	 // converted from percentage plus forward of amidships to meters from aft
	 let LCGHull = L/2 + (LCB - 0.15)*L/100 ;

	 // Returns the object

	 return {mass: W, cg: {x: LCGHull, y: 0, z: VCGHull}};
	 }

// This function estimates the remainder of the Dead Ship Weight. It includes the fuel, the lube oil, the fresh water, the crew and the provisions and stores.
//
//
// Inputs
// Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
// LBP is the Lenght Between Perpendiculars.
// D is molded depth
//
// Return
// It returns an object with the properties mass.

 function parametricWeightDeadweight(SFR, MCR, speed, person, day){

	 // Calculates estimated  weight
	 let Wfo = SFR * MCR * speed * 1.1;  // Fuel oil Weight
     let Wlo = 0;                        // Lube oil Weight
     if (speed > 10){
         Wlo = 15;
     }
     else {
         Wlo = 20
     }
     let Wfw = 0.17 * person;            // Weight of fresh water
     let Wce = 0.17 * person;            // Weight of crew and effects
     let Wpr = 0.01 * person * day;      // Weight of provisions and stores
     let W = Wfo + Wlo + Wfw + Wce + Wpr; // Total weigth


     // VCGOut is the Vertical Center of Gravity of the Deadweight. Depends on designer
	 // LCGOut is the Longitudinal Center of Gravity of the Deadweight. Depends on designer

	 // Returns the object

	 return {mass: W};
	 }

// This function estimates the structural weight of the machinery, main engine(s) and the remainder of the machinery weight.
//
//
// Inputs
// MCR is the total capacity of all generators in kW.
// hdb is the innerbootom height of the engine room
// Der is the height og the overhead of the engine room
// L is LWL or LBP
// B is molded beam
// T is molded draft
//
// Return
// It returns an object with the properties mass and the VCG.

 function parametricWeightMachinery(MCR, hdb, Der, B, T, L, test){
	 // Calculates estimated machinery weight
	 let W = 0.72 * Math.pow(MCR, 0.78);
	 // Calculates LCG and VCG

     // req1 and req2 are the Coast Guard requirements for the hdb
     let req1 = (32 * B + 190 * Math.sqrt(T)) / 1000;
     let req2 = (45.7 + 0.417 * L) / 100;
     let reqmax = Math.max(req1, req2, hdb);

     // VCGMach is the Vertical Center of Gravity of the machinery
	 let VCGMach = hdb + 0.35 * (Der - hdb);

	 // LCGMach is the Longitudinal Center of Gravity of the machinery. Depends on designer

	 // Returns the object

	 return {mass: W, VCG: VCGMach};
	 }


// This function estimates the remainder of the Light Ship Weight. It includes outfit: electrical plant, distributive auxiliary systems and hull engineering: bits, chocks, hatch covers...
//
//
// Inputs
// Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
// LBP is the Lenght Between Perpendiculars.
// D is molded depth
//
// Return
// It returns an object with the properties mass and VCG.

 function parametricWeightOutfit(Co, LBP, D){

	 // Calculates estimated  weight
	 let W = Co * LBP;

     // VCGOut is the Vertical Center of Gravity of the outfits
     let VCGOut = 0;
     if (LBP < 125){
         VCGOut = D + 1.25
     }
     else if (LBP < 250){
         VCGOut = D + 1.25 + 0.01 * (LBP - 125)
     }
     else {
         VCGOut = D + 2.5
     }

	 // LCGOut is the Longitudinal Center of Gravity of the Outfits. Depends on designer

	 // Returns the object

	 return {mass: W, VCG: VCGOut};
	 }
