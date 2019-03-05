//@EliasHasle

/*Dependends on dat.gui for gui (optional).*/

/*Even though this is called "Playback", the update functions are not
restricted to deterministic sequences. This can be used for conducting
a simulation too, but does not take care of interactions (that will
have to be done within the update functions.)*/

"use strict";

function Playback(params = {}) {
	if (params.parentGUI) {
		this.conf = params.parentGUI.addFolder("Playback")
		this.conf.open();
		this.conf.add(this, "playOrPause").name("play/pause");
		this.conf.add(this, "stop");
	}

	this.playables = [];
}
Object.assign(Playback.prototype, {
	playing: false,
	paused: false,
	//Playables should be added in the intended updating order
	add: function (playable) {
		this.playables.push(playable);
	},
	/*remove: function(playable) {
		this.playables.remove(playable);
	},*/
	playOrPause: function () {
		if (!this.playing) {
			this.play();
		} else {
			//pause
			this.playing = false;
			this.paused = true;
			this.tPaused = 0.001 * performance.now();
		}
	},
	//This is kept as an alias:
	play: function () {
		let pn = 0.001 * performance.now();
		if (!this.paused) {
			//Play from start
			this.tStart = pn;
			this.tLast = this.tStart;
			this.playing = true;
		} else {
			//Resume
			let skip = pn - this.tPaused;
			this.tStart += skip;
			this.tLast += skip;
			this.paused = false;
			this.playing = true;
		}
	},
	stop: function () {
		this.playing = false;
		this.paused = false;
	},
	update: function () {
		if (!this.playing) return false;

		let pn = 0.001 * performance.now();
		let dt = pn - this.tLast;
		this.tLast = pn;
		let t = pn - this.tStart;

		for (let i = 0; i < this.playables.length; i++) {
			if (typeof this.playables[i].update !== "undefined")
				this.playables[i].update(t, dt);
			else this.playables[i](t, dt); //assume function
		}

		return true;
	}
});