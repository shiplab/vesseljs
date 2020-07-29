function DynamicalMovement(ship, states, states2, userParameters, Ini, seaDepth) {
	this.ship = ship;
	this.states = states;
	this.states2 = states2;

	var calculatedParameters = this.ship.designState.calculationParameters;



	length = floatingStates.LWL;
	breadth = floatingStates.BWL;
	depth = designDimention.Depth;
	draft = floatingStates.T;



	this.states.continuous.motion = {};
	var motion = this.states.continuous.motion;

	[motion.surge, motion.sway, motion.heave, motion.roll, motion.pitch, motion.yaw, motion.VSurge, motion.VSway, motion.VHeave, motion.VRoll, motion.VPitch, motion.VYaw, motion.EX, motion.EY, motion.EZ] = Ini;

	this.moveShip = function(tprev, dt) {

		let omega = wavCre.waveDef.waveFreq;

		playback.add(function(t) {
			if (output === undefined) {} else {
				cos_mo0 = Math.cos(omega * t - pha[0][periodIndex][thetaIndex]);
				cos_mo1 = Math.cos(omega * t - pha[1][periodIndex][thetaIndex]);
				cos_mo2 = Math.cos(omega * t - pha[2][periodIndex][thetaIndex]);
				cos_mo3 = Math.cos(omega * t - pha[3][periodIndex][thetaIndex]);
				cos_mo4 = Math.cos(omega * t - pha[4][periodIndex][thetaIndex]);
				cos_mo5 = Math.cos(omega * t - pha[5][periodIndex][thetaIndex]);
			}

			if (output === undefined) {} else {
				motion.surge = (rao[0][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo0 * 0.01
				motion.sway = (rao[1][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo1 * 0.01
				motion.heave = (rao[2][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo2 * 0.01
				motion.roll = (rao[3][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo3 * 0.01
				motion.pitch = (rao[4][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo4 * 0.01
				motion.yaw = (rao[5][periodIndex][thetaIndex] * [ocean.waves[0].A]) * cos_mo5 * 0.01
			}
		});

		ship3D.surge = motion.surge;
		ship3D.sway = motion.sway;
		ship3D.heave = motion.heave;
		ship3D.roll = motion.roll;
		ship3D.pitch = motion.pitch;
		ship3D.yaw = motion.yaw;

		//@ferrari212
		this.WaveForce = function(rho, t, a_33) {
			var a = ocean.waves["0"].A; //Amplitude of Movement
			var costh = ocean.waves["0"].costh; //Cos of Wave Directions
			var sinth = ocean.waves["0"].sinth; //Sen of Wave Directions

			// projection of trajectory for calculation of phase difference
			var projMag = ship3D.position.x * costh + ship3D.position.y * sinth; // magnitude of projection

			var omega = wavCre.waveDef.waveFreq; // wave frequencie
			var k = 2 * Math.PI / ocean.waves["0"].L; // wave number
			var phase = omega * t - ocean.waves["0"].phi - k * projMag;
		}



		var Coriolis = function(M, AM, vel) {
			var c = numeric.dot(M, vel);
			var C = numeric.rep([6, 6], 0);
			var CA = numeric.rep([6, 6], 0);

			// Creanting Inercia Matrix
			var I0 = numeric.diag([M[3][3], M[4][4], M[5][5]]);

			// Calculating Coriolis by Thor Eq. (8)
			var S1 = Smtrx([-m * vel[0], -m * vel[1], -m * vel[2]]);
			var S2 = numeric.dot(Smtrx([m * vel[3], m * vel[4], m * vel[5]]), Smtrx(RG_system));
			var SI = numeric.neg(Smtrx(numeric.dot(I0, [vel[3], vel[4], vel[5]])));

			// Coriolis Added Mass by Thor Eq. (40)
			var SA = numeric.dot(AM, vel);
			var CAQuad2 = Smtrx(SA.slice(0, 3));
			var CAQuad1 = numeric.rep([3, 3], 0);
			var CAQuad3 = CAQuad2;
			var CAQuad4 = Smtrx(SA.slice(3, 6));


			for (i = 0; i < 3; i++) {
				for (f = 0; f < 3; f++) {
					C[i][3 + f] = S1[i][f] - S2[i][f];
					C[3 + i][f] = S1[i][f] + S2[i][f];
					C[3 + i][3 + f] = S1[i][f];

					CA[i][f] = CAQuad1[i][f];
					CA[i][3 + f] = CAQuad2[i][f];
					CA[3 + i][f] = CAQuad3[i][f];
					CA[3 + i][3 + f] = CAQuad4[i][f];
				}
			}
			return numeric.add(C, CA);
		}

		var Euler2J1 = function(Eang) {
			Eang[0] = -Eang[0];
			Eang[2] = -Eang[2];
			rx = [
				[1, 0, 0],
				[0, Math.cos(Eang[0]), -Math.sin(Eang[0])],
				[0, Math.sin(Eang[0]), Math.cos(Eang[0])]
			];
			ry = [
				[Math.cos(Eang[1]), 0, Math.sin(Eang[1])],
				[0, 1, 0],
				[-Math.sin(Eang[1]), 0, Math.cos(Eang[1])]
			];
			rz = [
				[Math.cos(Eang[2]), -Math.sin(Eang[2]), 0],
				[Math.sin(Eang[2]), Math.cos(Eang[2]), 0],
				[0, 0, 1]
			];
			J1 = numeric.dot(numeric.dot(rz, ry), rx);

			return J1;
		}

		var Euler2J2 = function(Eang) {
			Eang[0] = -Eang[0];
			Eang[2] = -Eang[2];
			J2 = [
				[1, Math.sin(Eang[0]) * Math.tan(Eang[1]), Math.cos(Eang[0]) * Math.tan(Eang[1])],
				[0, Math.cos(Eang[0]), -Math.sin(Eang[0])],
				[0, Math.sin(Eang[0]) / Math.cos(Eang[1]), Math.cos(Eang[0]) / Math.cos(Eang[1])]
			];

			return J2
		}

		// Returns the skew-symetrical of the matrix
		var Smtrx = function(vec3) {
			var m = [
				[0, -vec3[2], vec3[1]],
				[vec3[2], 0, -vec3[0]],
				[-vec3[1], vec3[0], 0]
			];

			return m;
		}


		var anchorPoint = [300, 5, 0]

		var J = Euler2J1([states.continuous.motion.roll, states.continuous.motion.pitch, states.continuous.motion.yaw]);

		posT = numeric.dot(J, mooring.mooringPointOnShip[0]);

		posB = numeric.dot(J, anchorPoint);

		var anchorPointOnShip = []; // Line geometry (global)


		for (var i = 0; i < posT.length; i++) {

			anchorPointOnShip[i] = [posT[0] + states.continuous.motion.surge, posT[2] + states.continuous.motion.heave, posT[1] - states.continuous.motion.sway];

			line.geometry.vertices[0] = new THREE.Vector3(anchorPointOnShip[i][0], anchorPointOnShip[i][1], anchorPointOnShip[i][2])
			line.geometry.verticesNeedUpdate = true;
		}
	};
	window.feedMotionHeave = function(callback) {
		var tick = {};
		tick.plot0 = motion.heave;
		callback(JSON.stringify(tick));
	};
	window.feedMotionRoll = function(callback) {
		var tick = {};
		tick.plot0 = motion.roll * 180 / Math.PI;
		callback(JSON.stringify(tick));
	};
	window.feedMotionSurge = function(callback) {
		var tick = {};
		tick.plot0 = motion.surge;
		callback(JSON.stringify(tick));
	};
	window.feedMotionSway = function(callback) {
		var tick = {};
		tick.plot0 = motion.sway;
		callback(JSON.stringify(tick));
	};
	window.feedMotionPitch = function(callback) {
		var tick = {};
		tick.plot0 = motion.pitch * 180 / Math.PI;
		callback(JSON.stringify(tick));
	};
	window.feedMotionYaw = function(callback) {
		var tick = {};
		tick.plot0 = motion.yaw;
		callback(JSON.stringify(tick));
	};

	var myDashboardMooring = {
		"graphset": [
			{//---------- ROLL MOTION-----------//
				"type": "line",
				"plotarea": {
					"adjust-layout": true
				},
				"height": "25%",
				"width": "25%",
				"x": "0%",
				"y": "72%",
				"plot": {
					"aspect": "spline",
					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG[m]"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionRoll()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Roll angle [deg]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Roll motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 25,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 10% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: false,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			},
			{//---------- PITCH MOTION -----------//
				"type": "line",
				"height": "25%",
				"width": "25%",
				"x": "25%",
				"y": "72%",
				"plot": {
					"aspect": "spline",
					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG[deg]"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionPitch()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Pitch translation [m]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Pitch Motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 25,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 5% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: false,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			},
			{//---------- YAW MATION -----------//
				"type": "line",
				"height": "25%",
				"width": "25%",
				"x": "50%",
				"y": "72%",
				"plot": {
					"aspect": "spline",
					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG[deg]"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionYaw()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Yaw angle [deg]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Yaw Motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 25,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 0% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: false,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			},
			{//---------- SURGE MOTION -----------//
				"type": "line",
				"height": "25%",
				"width": "25%",
				"x": "0%",
				"y": "0%",
				"plot": {
					"aspect": "spline",
					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionSurge()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Surge translation [m]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Surge Motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 10,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 10% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: true,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			},
			{//---------- SWAY MOTION -----------//
				"type": "line",
				"height": "25%",
				"width": "25%",
				"x": "0%",
				"y": "25%",
				"plot": {
					"aspect": "spline",
					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG[Sway]"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionSway()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Sway translation[m]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Sway Motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 25,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 10% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: false,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			},
			{//---------- HEAVE MOTION -----------//
				"type": "line",
				"height": "25%",
				"width": "25%",
				"x": "0%",
				"y": "50%",
				"plot": {
					"aspect": "spline",

					"marker": {"visible": false},
				},
				"series": [{
					"values": [0],
					"text": "FLNG[m]"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "feedMotionHeave()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Heave translation [m]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Heave Motion",
					marginBottom: "0",
					fontFamily: "Helvetica",
					fontWeight: "none",
					fontSize: 12,
					"offset-y": 25,
					"offset-x": 120,
					"width": 100,
					"heigh": 30,
					"background-color": "#333",
					"color": "#FFF",
					"border-radius": "4px"
				},
				plotarea: {
					"margin": "20% 10% 15% dynamic",
				},
				legend: {
					"layout": "float",
					"background-color": "none",
					"border-width": 0,
					"shadow": 0,
					"text-align": "middle",
					"offsetY": 25,
					"align": "center",
					visible: false,
					"item": {
						"font-color": "#black",
						"font-size": "10px"
					}
				},
			}
		]
	};


	window.onload = function() {
		zingchart.render({
			id: 'plotBottom',
			height: "100%",
			width: "100%",
			data: myDashboardMooring,
		});

	};

	// This formulation is based on the  book Wave-Induced Loads and Ship Motions, LArs Bergdahl
	// chapter 6 - motion for smal body approximation


};