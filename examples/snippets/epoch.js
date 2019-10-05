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
        this.play = false;
    }
    updateVolume(time) {
        this.time = Math.floor(time); // weeks (3*is the multplyer)
        this.volume = 7*24*time*this.diss_rate; // [m3]
        this.radius = Math.pow(0.75*this.volume/Math.PI, 1/3)*0.1;  // [10m]
    }
    maxVolume(){
      var volume = 7*24*this.diss_time*this.diss_rate;

      return Math.pow(0.75*this.volume/Math.PI, 1/3)*0.1;
    }
}
