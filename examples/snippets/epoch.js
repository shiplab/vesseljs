// Function that calculates the size/ CO2 volumeCapacity
// in the epoch
class Epoch {
  constructor(diss_rate, diss_time, flowrate, height) {
    this.diss_rate = diss_rate; // [m3/h]
    this.diss_time = diss_time; // [days]
    this.flowrate = flowrate; // [m3/h]
    this.time = 0; // day
    this.initialMaturingTime = 0; // day
    this.radius = 0; // [km]
    this.deltaRadius = 0.4; // Percentual difference between top and botton radius
    this.height = height; // [10 m]
    this.volume = 0; // [m3]
    this.playing = false; // playing or not
    this.paused = false; // paused or not
    this.storingPhase = false; // in the storing phase or not
    this.speed = "50"; // Current speed
    this.view = "0"; // View of the simulation
    this.oilVolume = 0; // angle of oil
    this.oilHeight = 0; // angle of oil
    this.oilRadius = 0; // radius of oil secctio
    this.setMaxVolume(this.diss_time, this.diss_rate);
    this.setMaxTime(this.diss_time, this.flowrate);
  }
  play() {

    if (!this.paused) {

      this.playing = true;
      clock.start();

    } else {

      var t = clock.getElapsedTime();

      this.radius = 0;
      this.volume = 0;
      this.playing = true;
      clock.start();

      clock.elapsedTime = t;

    }
  }
  pause() {
    this.paused = true;
    this.playing = false;
    clock.stop();
  }
  // restart() {
  //   this.playing = false;
  //   this.paused = false;
  //   this.storingPhase = false;
  //   clock.stop();
  //   this.play();
  // }
  test() {
    console.log('so um teste');
  }
  updateVolume(time) {
    this.time = parseFloat(this.speed) * Math.floor(time); // weeks (speed is the multplyer)

    // Function check if we are in the creation or maturing phase
    if (this.radius < this.maxRadius) {

      this.volume = parseFloat(this.speed) * 24 * time * this.diss_rate; // [m3]
      this.radius = Math.pow(this.volume / (10 * Math.PI * this.height), 1 / 2) * 0.1; // [10 km]

    } else if (this.oilHeight < this.height) {

      if (!this.storingPhase) {
        this.storingPhase = true;
        this.initialMaturingTime = time;
      }

      this.oilVolume = parseFloat(this.speed) * 24 * (time - this.initialMaturingTime) * this.flowrate; // [m3]
      var results = this.bisectionSearch(this.possibleValues.volume, this.oilVolume);
      var deltaHeight = this.possibleValues.height[results.index + 1] - this.possibleValues.height[results.index];
      var deltaRadius = this.possibleValues.oilRadius[results.index + 1] - this.possibleValues.oilRadius[results.index];

      if (results.mu == null) {
        this.oilHeight = this.height;
      } else {
        this.oilHeight = this.possibleValues.height[results.index] + results.mu * deltaHeight; // [rad]
        this.oilRadius = this.possibleValues.oilRadius[results.index] + results.mu * deltaRadius; // [rad]
      }


    } else {
      this.pause();
    }
  }
  setMaxVolume(diss_time, diss_rate, flowrate) {
    this.maxVolume = 24 * diss_time * diss_rate; // [m3]
    this.maxRadius = Math.pow(this.maxVolume / (10 * Math.PI * this.height), 1 / 2) * 0.1; // [10 m]
    this.bottomRadius = this.maxRadius * (1 + this.deltaRadius / 2); // Base radius [10 m]

    this.possibleValues = this.volumeArray(this.maxRadius * 10, this.height * 10, this.deltaRadius, this.bottomRadius * 10); // possible volumes in array

  }
  setMaxTime(diss_time, flowrate) {
    this.maxTime = diss_time + this.maxVolume / (flowrate * 24); // Days for finishing operation [days]
  }
  volumeArray(radius, maxHeight, deltaRadius, bottomRadius) {
    // @ferrari212
    // Use this source:
    // https://en.wikipedia.org/wiki/Frustum
    var volume = [];
    var height = [];
    var oilRadius = [];
    var step = maxHeight / 100;
    for (var i = 0; i < 100; i++) {
      height.push(step * i);
      oilRadius.push(bottomRadius - deltaRadius * radius * height[i] / maxHeight); // Radius in the oil
      volume.push((Math.PI / 3) * height[i] * (Math.pow(bottomRadius, 2) + bottomRadius * oilRadius[i] + Math.pow(oilRadius[i], 2)));
      oilRadius[i] *= 0.1;
      height[i] *= 0.1;
    }
    return {
      volume: volume, //[m^3]
      oilRadius: oilRadius, //[10 m]
      height: height //[10 m]
    };
  }
  // Reproducing bissectioSearch from Vessel Js. Ivestigate later if this func.
  // can be extracted from Vessel.js. Function altered
  bisectionSearch(array, value) {
    if (value < array[0]) {
      console.warn("bisectionSearch: requested value below lowest array element. Returning undefined.");
      return {
        index: undefined,
        mu: undefined
      };
    }
    let index = 0,
      upper = array.length;
    while (upper > index + 1) {
      let c = Math.floor(0.5 * (index + upper));
      if (array[c] === value) return {
        index: c,
        mu: 0
      };
      else if (array[c] < value) index = c;
      else upper = c;
    }
    /*if (index === array.length) {
    	console.error("bisectionSearch: index===array.length. This should never happen.");
    }*/
    let mu = (value - array[index]) / (array[index + 1] - array[index]);
    if (index === array.length - 1) {
      console.warn("bisectionSearch: Reached end of array. Simple interpolation will result in NaN.");
      mu = undefined;
    }
    return {
      index,
      mu
    };
  }
}

class ShipSimulation {
  constructor() {
    this.timeFactor = 0;
    this.changingfactor = 0;
    this.changedShip = false;
  }
  changeShip() {
    if (this.timeFactor < 1) {
      this.timeFactor += 0.001;
      this.changingfactor = -this.timeFactor*(this.timeFactor-2);
    } else {
      this.changedShip = true;
    }
  }
}
