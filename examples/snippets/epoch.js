// Function that calculates the size/ CO2 volumeCapacity
// in the epoch
class Epoch {
  constructor(diss_rate, diss_time, flowrate) {
    this.diss_rate = diss_rate; // [m3/h]
    this.diss_time = diss_time; // [days]
    this.flowrate = flowrate; // [m3/h]
    this.time = 0; // day
    this.radius = 0; // [m]
    this.volume = 0; // [m3]
    this.playing = false; //
    this.paused = false;
    this.storingPhase = false;
    this.speed = "1";
    this.maxVolume = 7 * 24 * this.diss_time * this.diss_rate;
    this.maxRadius = Math.pow(0.75 * this.maxVolume / Math.PI, 1 / 3) * 0.1;
    this.oilAngle = 0;
    this.possibleValues = this.volumeArray(this.maxRadius);
  }
  play() {

    if (!this.paused) {

      this.playing = true;
      clock.start();

    } else {

      var t = clock.getElapsedTime();

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
  restart() {
    this.playing = false;
    this.paused = false;
    clock.stop();
    this.play();
  }
  updateVolume(time) {
    if (this.radius > this.maxRadius) {
      this.time = parseFloat(this.speed) * Math.floor(time); // weeks (speed is the multplyer)
      this.volume = parseFloat(this.speed) * 7 * 24 * time * this.diss_rate; // [m3]
      this.radius = Math.pow(0.75 * this.volume / Math.PI, 1 / 3) * 0.1; // [10m]
    } else {
      // console.log(this.bisectionSearch(this.possibleValues.volume, this.maxVolume/2));

      this.storingPhase = true;
    }
  }
  volumeArray(radius) {
    // @ferrari212
    // Use this source:
    // https://en.wikipedia.org/wiki/Spherical_cap
    var volume = [];
    var angle = [];
    var step = (Math.PI/2) / 100;
    for (var i = 0; i < 100; i++) {
      angle.push((Math.PI/2)*step*i);
      var cos = Math.cos(angle[i]);
      volume.push((Math.PI/3)*Math.pow(radius,3)*(2+cos)*Math.pow((1-cos),2));
    }
    return {volume: volume, angle: angle};
  }
  // Reproducing bissectioSearch from Vessel Js. Ivestigate later if this func.
  // can be extracted from Vessel.js
  bisectionSearch(array, value) {
  	if (value < array[0]) {
  		console.warn("bisectionSearch: requested value below lowest array element. Returning undefined.");
  		return {index: undefined, mu: undefined};
  	}
  	let index = 0, upper = array.length;
  	while (upper > index + 1) {
  		let c = Math.floor(0.5 * (index + upper));
  		if (array[c] === value) return {index: c, mu: 0};
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
  	return {index, mu};
  }
}
