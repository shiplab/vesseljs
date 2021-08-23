// @ferrari212
function Manoeuvring(ship, states, hullResistance, propellerInteraction, fuelConsumption, manoeuvring, rho = 1025) {
	
    StateModule.call(this, ship, states);
    if (typeof this.states.discrete.FloatingCondition === "undefined") {
      this.setDraft();
    }
    if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
      this.setSpeed(); // use its design speed
    }
  
    this.hullRes = hullResistance
    this.propellerInteraction = propellerInteraction;
    this.fuelConsumption = fuelConsumption
    this.powerPlant = fuelConsumption.powerPlant
    this.manoeuvring = manoeuvring;
    this.state = {}
    this.rho = propellerInteraction.rho;
    this.propeller = this.propellerInteraction.propeller
    this.speedState = this.states.discrete.Speed.state;
    this.floatState = this.states.discrete.FloatingCondition.state;
    this.resistanceState = this.states.discrete.HullResistance.state;	
  
    const YAW = manoeuvring.initial_yaw || 0;
    const AN = manoeuvring.initial_angle || 0;
    // The modules bellow use the value in knots for the ship speed,
    // for the maneuvering model it is going to be used the values in SI (m/s). @ferrari212
    Object.assign(this.states, { 
      DX: {x:0, y:0, yaw: 0},
      V: {u:0, v:0, yaw_dot:0},
      n: 0,
      yaw: YAW,
      rudderAngle: AN,
      load: 0
    })
  
    var engines = this.powerPlant.main.engines
    this.powerPlant.engCapac = [];
    var engCapac = this.powerPlant.engCapac
  
    for (var i = 0; i < engines.length; i++) {
      engCapac[i] = engines[i].MCR;
    }
  
    this.totalCapac = engCapac.reduce((a, b) => a + b, 0);
  
    // The function simplify the resitence curve by Rt = k*u^2
    // the interpolation could be improved by other types of functions interporlation @ferrari212
    function intResist(man) {
      var pow = Math.pow
  
      const U = (Boolean(man.states.calculationParameters.speed)) ? man.states.calculationParameters.speed : 10;
  
      man.hullRes.setSpeed(U)
      const CONV = 0.5144447;
      const R = man.hullRes.totalResistance.Rtadd;
  
      var k = R / (Math.pow(U * CONV, 2));
  
  
      var getRes = function (u) {
        return k * (pow(u,2))	* Math.sign(u)	
      }
  
      return getRes
    }
  
    this.getRes = intResist(this);
  
    const W = ship.getWeight()
    this.m = manoeuvring.m || W.mass;
          
    // The approximaxion is given by the inercia of an Elipsoid in water
    var attributes = this.ship.structure.hull.attributes;
    var T = this.ship.designState.calculationParameters.Draft_design;
    var approxI = manoeuvring.I || Math.PI * rho * attributes.LOA * attributes.BOA * T * ( 4 * Math.pow(T, 2) + Math.pow(attributes.BOA, 2) )/120;
  
    this.M_RB = manoeuvring.M || [
      [ this.m, 0, 0],
      [0,  this.m, 0],
      [0, 0,  approxI]
    ]; 
  
    this.output = ["hydroCoeff", "dn"];
  
    this.cacheDependence = ["PropellerInteraction", "FloatingCondition"];
    this.cache = {};
  
  }
  
  Manoeuvring.prototype = Object.create(StateModule.prototype);
  
  Object.assign(Manoeuvring.prototype, {
    constructor: Manoeuvring,
    getPropResult: function (n) {
      if (n === 0) return {Fp: 0, Pp: 0, cons: 0};
  
      var Va = this.propellerInteraction.propulsion.Va
  
      var lcb = 100 * (this.floatState.LCB - (this.floatState.minXs + this.floatState.LWL / 2)) / this.floatState.LWL; // %
      var J = Math.abs(Va/(n * this.propeller.D));
  
      var KT = this.propeller.beta1 - this.propeller.beta2 * J;
      var KQ = this.propeller.gamma1 - this.propeller.gamma2 * J;
  
      var etar;
      if (this.propeller.noProps === 1) {
        etar = 0.9922 - 0.05908 * this.propeller.AeAo + 0.07424 * (this.floatState.Cp - 0.0225 * lcb);
      } else if (this.propeller.noProps === 2) {
        etar = 0.9737 + 0.111 * (this.floatState.Cp - 0.0225 * lcb) - 0.06325 * this.propeller.P / this.propeller.D;
      }
  
      var T = KT * this.rho * Math.pow(n, 2) * Math.pow(this.propeller.D, 4);
      var Q = KQ * this.rho * Math.pow(n, 2) * Math.pow(this.propeller.D, 5);
      // console.log( `T: ${T}; Q: ${Q}`);
  
      var Fp =	Math.sign(n)* T * this.propeller.noProps * (1 - this.resistanceState.t);
      var Po =	2 * Math.PI * Math.abs(Q * n) * this.propeller.noProps;
      var Pp =	Po * etar;
  
      var cons = this.getFuelCons(Pp)
  
      return {Fp, Pp, cons};
    },
    getFuelCons: function(Pp) {
        // share load among engines in a system's array
        function shareLoad(system, load) {
          var triggerRatio = 0.8; // define loading rate at which next engine in the power system will be activated for sharing loads
          var cons = 0;
    
          var engCapac = [];
          for (var i = 0; i < system.engines.length; i++) {
            engCapac[i] = system.engines[i].MCR;
          }
    
          if (typeof system.etag === "number") { // diesel electrical system
            load = load / (system.etas * system.etag);
          } else { // diesel mechanical system
            load = load / system.etas; // consumption rate in kg/s
          }
    
          // distribute loads among engines
          var totalCapac = engCapac.reduce((a, b) => a + b, 0);
          var partCapac = totalCapac - engCapac[engCapac.length - 1];
          var loads = Array(engCapac.length);
          if (load <= triggerRatio * partCapac) { // if not all engines are loaded above trigger ratio, load them according to trigger rate ceil
            var capSum = 0;
            loads.fill(0);
            for (var eng = 0; eng < engCapac.length; eng++) {
              capSum += engCapac[eng];
              if (load <= triggerRatio * capSum) { // if engines can support load
                for (i = 0; i <= eng; i++) { // distribute load proportionally to engines' capacities
                  loads[i] = load / capSum;
                }
                break;
              }
            }
          } else if (triggerRatio * partCapac < load && load <= totalCapac) { // if all engines are loaded above trigger ratio, make them all have same load %
            loads.fill(load / totalCapac);
          } else if (load > totalCapac) {
            console.error("Engines are overloaded. Power plant can't provide current required power.");
            loads.fill(1);
          }
    
          // calculate SFOC value for each activated engine
          var SFOC;
          for (i = 0; i < loads.length; i++) {
            if (loads[i] > 0) { // if engine is active
              if (system.engines[i].polOrder === 3) {
                SFOC = system.engines[i].a * Math.pow(loads[i], 3) + system.engines[i].b * Math.pow(loads[i], 2) + system.engines[i].c * loads[i] + system.engines[i].d;
              } else if (system.engines[i].polOrder === 2) {
                SFOC = system.engines[i].a * Math.pow(loads[i], 2) + system.engines[i].b * loads[i] + system.engines[i].c;
              }
              cons += SFOC / (1000) * loads[i] * engCapac[i]; // consumption rate in kg/g
            }
          }
          return cons;
        }
        
        var consumptionRate;
  
        if (typeof this.powerPlant.auxiliary === "object") { // calculate results for vessels which have main and auxiliary power systems
          // change the propeller states for the maneuvering proppeller
          consumptionRate = this.powerPlant.main.noSys * shareLoad(powerPlant.main, Pp / (1000 * this.powerPlant.main.noSys));
          consumptionRate += shareLoad(this.powerPlant.auxiliary, this.auxPowerState.Paux / 1000);
        } else { // calculate results for vessels which have only one power system
          consumptionRate = shareLoad(this.powerPlant.main, Pp / 1000);
        }
        return consumptionRate;
      
    }
  });
  Object.defineProperties(Manoeuvring.prototype, {
    hydroCoeff: StateModule.prototype.memoized(function() {
      var attributes = this.ship.structure.hull.attributes;
      var state = this.states.discrete.FloatingCondition.state;
      var calc = this.ship.designState.calculationParameters;
  
      var L = attributes.LOA;
      var D = attributes.Depth;
      var B = attributes.BOA;
  
  
      var Cb = calc.Cb_design || state.Cb
      var Vs = state.Vs;
      var T = calc.Draft_design;
      var rho = this.rho
  
      var Vsdn = Vs/Math.pow(L, 3);
      var delta_SR = 1 - 0.7/(28.7*Vsdn + 0.54)
      var pow = Math.pow
  
      const PI = Math.PI;
      const ld = L/D;
      const bl = B/L;
      const bt = B/T;
      const bls = pow(bl, 2);
      const bts = pow(bt, 2);
      const tls = pow(T/L, 2);
  
      // Clarke formulas
      var Yvaccdn = -PI * tls * (1 + 0.16 * Cb * bt - 5.1 * bls); 
      var Yraccdn = -PI * tls * (0.67 * bl - 0.0033 * bts); 
      var Nvaccdn = -PI * tls * (1.1 * bl - 0.041 * bt);
      var Nraccdn = -PI * tls * (1 / 12 + 0.017 * Cb * bt - 0.33 * bl ) ;
      var Yvacc = Yvaccdn * 0.5 * rho *  pow(L, 3);
      var Yracc = Yraccdn * 0.5 * rho *  pow(L, 4);
      var Nvacc = Nvaccdn * 0.5 * rho *  pow(L, 4);
      var Nracc = Nraccdn * 0.5 * rho *  pow(L, 5);
  
      // Lee formulas
      var Yvdn = -(0.145 + 2.25/ld - 0.2*delta_SR);
      var mdn = this.m/(0.5*rho*pow(L, 2)*D)
      var Yrdn = mdn -(0.282 + 0.1*delta_SR) + (0.0086*delta_SR + 0.004) * ld;
      var Nvdn = -(0.222 + 0.1*delta_SR) + 0.00484*ld;
      var Nrdn = -(0.0424 - 0.03*delta_SR) - (0.004*delta_SR - 0.00027) * ld;
  
      return {Yvacc, Yracc, Nvacc, Nracc, Yvdn, Yrdn, Nvdn, Nrdn }
    }, "hydroCoeff"),
    dn: StateModule.prototype.memoized(function() {
      const L = this.ship.structure.hull.attributes.LOA;
      
      var Cl = 0.5*this.rho*Math.pow(L, 2);
      var Cll = Cl * L;
      var Clll = Cll * L;
  
      return	{Cl, Cll, Clll}	
    }, "dn")
  });