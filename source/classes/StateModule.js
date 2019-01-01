/*in the future, when this class gathers more methods, change code style to that 
of https://github.com/shiplab/vesseljs/blob/master/source/classes/JSONSpecObject.js */

function StateModule(ship, states) {
	this.ship = ship;
	this.states = states;
	this.shipState = states.shipCache.state;
}

Object.assign(StateModule.prototype, {
	// return getters listed on an output array inside the simulation object
	returnOutput: function() {
		let resObj = {};
		for (let i = 0; i < this.output.length; i++) {
			let output = this[this.output[i]];
			if (typeof output === "number") {
				resObj[this.output[i]] = output;
			} else if (typeof output === "object") {
				Object.assign(resObj, output);
			}
		}
		return resObj;
	},
	// write getter output to shipState
	writeOutput: function() {
		for (let i = 0; i < this.output.length; i++) {
			let output = this[this.output[i]];
			if (typeof output === "number") {
				this.states.shipCache.state[this.output[i]] = output;
			} else if (typeof output === "object") {
				Object.assign(this.states.shipCache.state, output);
			}
		}
		this.states.shipCache.thisStateVer++;

		let stateName = this.constructor.name;
		if (this.states.discrete[stateName] === undefined) {
			this.states.discrete[stateName] = {
				state: {},
				thisStateVer: 0
			};
		}
		for (let i = 0; i < this.output.length; i++) {
			let output = this[this.output[i]];
			if (typeof output === "number") {
				this.states.discrete[stateName].state[this.output[i]] = output;
			} else if (typeof output === "object") {
				Object.assign(this.states.discrete[stateName].state, output);
			}
		}
		this.states.discrete[stateName].thisStateVer++;
	},
	setDraft: function() {
		let draft = this.ship.calculateDraft(this.states);
		Object.assign(this.states.shipCache.state, this.ship.structure.hull.calculateAttributesAtDraft(draft));
		Object.assign(this.states.shipCache.state, this.ship.calculateStability(this.states));
		this.states.shipCache.thisStateVer++;

		if (this.states.discrete.FloatingCondition === undefined) {
			this.states.discrete.FloatingCondition = {
				state: {},
				thisStateVer: 0
			};
		}
		Object.assign(this.states.discrete.FloatingCondition.state, this.ship.structure.hull.calculateAttributesAtDraft(draft));
		Object.assign(this.states.discrete.FloatingCondition.state, this.ship.calculateStability(this.states));
		this.states.discrete.FloatingCondition.thisStateVer++;
	},
	// write argument speed to vessel state. If undefined, use vessel's design speed
	setSpeed: function(speed) {
		if (typeof speed === "undefined" && typeof this.ship.designState.calculationParameters.speed !== "undefined") {
			speed = this.ship.designState.calculationParameters.speed;
		}
		this.states.shipCache.state.speed = speed; // knots
		this.states.shipCache.thisStateVer++;

		if (this.states.discrete.Speed === undefined) {
			this.states.discrete.Speed = {
				state: {},
				thisStateVer: 0
			};
		}
		if (typeof speed === "undefined" && typeof this.ship.designState.calculationParameters.speed !== "undefined") {
			speed = this.ship.designState.calculationParameters.speed;
		}
		this.states.discrete.Speed.state.speed = speed; // knots
		this.states.discrete.Speed.thisStateVer++;
	},
	// write argument heading angle to vessel state. if undefined, use 0 degrees
	// 0 degrees corresponds to vessel pointing to north. clockwise orientation.
	setHeading: function(angle) {
		if (typeof angle === "undefined") {
			angle = 0;
		}
		this.states.shipCache.state.heading = angle;
		this.states.shipCache.thisStateVer++;

		if (this.states.discrete.Heading === undefined) {
			this.states.discrete.Heading = {
				state: {},
				thisStateVer: 0
			};
		}
		if (typeof angle === "undefined") {
			angle = 0;
		}
		this.states.discrete.Heading.state.heading = angle;
		this.states.discrete.Heading.thisStateVer++;
	},
	// cache memoization pattern adapted from http://b-studios.de/blog/2013/11/18/lazy-attributes-in-ecmascript-5/
	// in the future, expand version comparison also to parameters stored inside each constructor
	memoized: function(init, cacheName) {
		return {
			enumerable: true,
			configurable: false,
			get: function cache() {
				if (this.wavCre !== undefined) { // if state module uses a wave creation object
					if (this.cache[cacheName] === undefined) {
						this.cache[cacheName] = {
							shipStateVersion: 0,
							waveStateVersion: 0
						};
					}
					if (this.cache[cacheName].shipStateVersion === this.states.shipCache.thisStateVer && this.cache[cacheName].waveStateVersion === this.wavCre.version) {
						return this.cache[cacheName].value;
					}
					this.cache[cacheName].value = init.call(this);
					this.cache[cacheName].shipStateVersion = this.states.shipCache.thisStateVer;
					this.cache[cacheName].waveStateVersion = this.wavCre.version;
					return this.cache[cacheName].value;

/* 					if (cache.hasOwnProperty("value") && cache.shipStateVersion === this.states.shipCache.thisStateVer && cache.waveStateVersion === this.wavCre.version) {
						return cache.value;
					}
					cache.value = init.call(this);
					cache.shipStateVersion = this.states.shipCache.thisStateVer;
					cache.waveStateVersion = this.wavCre.version;
					return cache.value; */
				}
				// if it has only a ship module
				if (this.cache[cacheName] === undefined) {
					this.cache[cacheName] = {
						shipStateVersion: 0
					};
				}
				if (this.cache[cacheName].shipStateVersion === this.states.shipCache.thisStateVer) {
					return this.cache[cacheName].value;
				}
				this.cache[cacheName].value = init.call(this);
				this.cache[cacheName].shipStateVersion = this.states.shipCache.thisStateVer;
				return this.cache[cacheName].value;

/* 				if (cache.hasOwnProperty("value") && cache.shipStateVersion === this.states.shipCache.thisStateVer) {
					return cache.value;
				}
				cache.value = init.call(this);
				cache.shipStateVersion = this.states.shipCache.thisStateVer;
				return cache.value; */
			}
		};
	}
});
