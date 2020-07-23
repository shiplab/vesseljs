function DynamicalMovement(ship, states, states2, states3, userParameters, Ini, seaDepth) {
	this.ship = ship;
	this.states = states;
	this.states2 = states2;
	this.states3 = states3;
	var calculatedParameters = this.ship.designState.calculationParameters;

	var options = {
		valueNames: ['id', 'name', 'x_position', 'y_position', 'z_position', 'mass', 'l_mass', 'h_mass', 'w_mass']
	};

	length = floatingStates.LWL;
	breadth = floatingStates.BWL;
	depth = designDimention.Depth;
	draft = floatingStates.T;

	this.states.continuous.motion = {};
	var motion = this.states.continuous.motion;

	this.states2.continuous.motion = {};
	var motion2 = this.states2.continuous.motion;

	this.states3.continuous.motion = {};
	var motion3 = this.states3.continuous.motion;

	this.moveShip = function (tprev, dt) {

		mooringForce = this.InsertMooring(this.ship, this.states, motion, motion2, seaDepth, mooring.anchorPoint);

		hawsersLine = this.InsertHawsers(this.ship, this.states2, motion, motion2, hawsers.anchorPoint);

		hawsersLine2 = this.InsertHawsers2(this.ship, this.states3, motion, motion3, seaDepth, hawsers2.anchorPoint);

		var cos_mo2, cos_mo3, cos_mo4, cos_mo5, cos_mo8, cos_mo9, cos_mo10;
		var omega = wavCre.waveDef.waveFreq;

		if (numShips == 1) {
			if (mooring.anchorLineGeometry[0].visible === false) {
				n = 0;
			} else {
				n = 1;
			}
		} else if (numShips == 2) {
			if (mooring.anchorLineGeometry[0].visible === true && hawsers.anchorLineGeometry[0].visible === true) {
				n = 2;
			} else if (mooring.anchorLineGeometry[0].visible === true && hawsers.anchorLineGeometry[0].visible === false) {
				n = 3;
			} else if (mooring.anchorLineGeometry[0].visible === false && hawsers.anchorLineGeometry[0].visible === true) {
				n = 4;
			} else {
				n = 5;
			}
		} else {
			if (mooring.anchorLineGeometry[0].visible === true && hawsers.anchorLineGeometry[0].visible === true) {
				n = 6;
			} else if (mooring.anchorLineGeometry[0].visible === true && hawsers.anchorLineGeometry[0].visible === false) {
				n = 7;
			} else if (mooring.anchorLineGeometry[0].visible === false && hawsers.anchorLineGeometry[0].visible === true) {
				n = 8;
			} else {
				n = 9;
			}
		}

		playback.add(function (t) {

			cos_mo0 = Math.cos(omega * t + pha[n][0][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			cos_mo1 = Math.cos(omega * t + pha[n][1][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			cos_mo2 = Math.cos(omega * t + pha[n][2][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			cos_mo3 = Math.cos(omega * t + pha[n][3][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			cos_mo4 = Math.cos(omega * t + pha[n][4][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			cos_mo5 = Math.cos(omega * t + pha[n][5][ocean.waves[0].T][ocean.waves[0].theta * 4]);

			if (numShips == 2 || numShips == 3) {
				cos_mo6 = Math.cos(omega * t - pha[n][6][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo7 = Math.cos(omega * t - pha[n][7][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo8 = Math.cos(omega * t - pha[n][8][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo9 = Math.cos(omega * t - pha[n][9][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo10 = Math.cos(omega * t - pha[n][10][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo11 = Math.cos(omega * t - pha[n][11][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			}

			if (numShips == 3) {
				cos_mo12 = Math.cos(omega * t + pha[n][12][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo13 = Math.cos(omega * t + pha[n][13][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo14 = Math.cos(omega * t + pha[n][14][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo15 = Math.cos(omega * t + pha[n][15][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo16 = Math.cos(omega * t + pha[n][16][ocean.waves[0].T][ocean.waves[0].theta * 4]);
				cos_mo17 = Math.cos(omega * t + pha[n][17][ocean.waves[0].T][ocean.waves[0].theta * 4]);
			}

			motion.surge = (rao[n][0][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo0;
			motion.sway = (rao[n][1][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo1;
			motion.heave = (rao[n][2][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo2;
			motion.roll = (rao[n][3][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo3;
			motion.pitch = (rao[n][4][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo4;
			motion.yaw = (rao[n][5][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo5;

			if (numShips == 2 || numShips == 3) {
				motion2.surge = (rao[n][6][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo6;
				motion2.sway = (rao[n][7][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo7;
				motion2.heave = (rao[n][8][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo8;
				motion2.roll = (rao[n][9][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo9;
				motion2.pitch = (rao[n][10][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo10;
				motion2.yaw = (rao[n][11][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo11;
			}

			if (numShips == 3) {
				motion3.surge = (rao[n][12][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo12;
				motion3.sway = (rao[n][13][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo13;
				motion3.heave = (rao[n][14][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo14;
				motion3.roll = (rao[n][15][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo15;
				motion3.pitch = (rao[n][16][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo16;
				motion3.yaw = (rao[n][17][ocean.waves[0].T][ocean.waves[0].theta * 4] * [ocean.waves[0].A]) * cos_mo17;
			}

		});


		ship3D.surge = motion.surge;
		ship3D.sway = motion.sway;
		ship3D.heave = motion.heave;
		ship3D.roll = motion.roll;
		ship3D.pitch = motion.pitch;
		ship3D.yaw = motion.yaw;

		if (numShips == 2 || numShips == 3) {
			barge23D.surge = motion2.surge;
			barge23D.sway = motion2.sway;
			barge23D.heave = motion2.heave;
			barge23D.roll = motion2.roll;
			barge23D.pitch = motion2.pitch;
			barge23D.yaw = motion2.yaw;
		}

		if (numShips == 3) {
			barge33D.surge = motion3.surge;
			barge33D.sway = motion3.sway;
			barge33D.heave = motion3.heave;
			barge33D.roll = motion3.roll;
			barge33D.pitch = motion3.pitch;
			barge33D.yaw = motion3.yaw;
		}
	};

	// This formulation is based on the  book Wave-Induced Loads and Ship Motions, LArs Bergdahl
	// chapter 6 - motion for smal body approximation

	//@ferrari212
	this.WaveForce = function (rho, t, a_33) {
		var a = ocean.waves["0"].A; //Amplitude of Movement
		var costh = ocean.waves["0"].costh; //Cos of Wave Directions
		var sinth = ocean.waves["0"].sinth; //Sen of Wave Directions

		// projection of trajectory for calculation of phase difference
		var projMag = ship3D.position.x * costh + ship3D.position.y * sinth; // magnitude of projection

		var omega = wavCre.waveDef.waveFreq; // wave frequencie
		var k = 2 * Math.PI / ocean.waves["0"].L; // wave number
		var phase = omega * t - ocean.waves["0"].phi - k * projMag;

		// Heave Forces Calculations
		var A = 2 * Math.sin(Math.pow(omega, 2) * breadth / (2 * g)) * Math.exp(-Math.pow(omega, 2) * draft / g);
		var alpha = 1; // Speed equals to zero therefore fr is zero
		var b_33 = rho * Math.pow(g * A, 2) / (Math.pow(omega * alpha, 3));
		B_33 = b_33 * length;
		B_55 = b_33 * Math.pow(length, 3) / 12;

		var complex1, complex2, integral;
		complex1 = new numeric.T(rho * g * breadth - Math.pow(omega, 2) * a_33, -omega * b_33);
		complex2 = new numeric.T(Math.cos(omega * t), -Math.sin(omega * t));
		integral = (Math.abs(costh) > 0.01) ? 2 * Math.sin(k * (costh) * length / 2) / (k * costh) : length;

		// Equation (6.39)
		var FW_33 = complex1.mul(complex2).dot(a * Math.exp(-k * draft) * integral).x;

		// Roll Forces Calculations
		var ra, rb, rd, r;

		r = breadth / draft;

		ra = -3.94 * r + 13.69;
		rb = -2.12 * r - 1.89;
		rd = 1.16 * r - 7.97;

		// Equation (6.62)
		var b_44 = rho * draft * Math.pow(breadth, 3) * Math.pow(2 * g / breadth, 0.5) * ra * Math.exp(rb * Math.pow(omega, -1.3)) * Math.pow(omega, rd);
		B_44 = b_44 * length;

		// Equation (6.68)
		if (Math.abs(costh) > 0.01) {
			var FW_44 = complex2.dot(a * Math.pow(rho * g * g * b_44 / omega, 0.5) * 2 * sinth * Math.sin(k * costh * length / 2) / (k * costh)).x;
		} else {
			var FW_44 = complex2.dot(a * Math.pow(rho * g * g * b_44 / omega, 0.5) * length * sinth).x;
		}

		// Equation (6.52)
		complex1 = new numeric.T(0, 2 * (Math.sin(k * costh * length / 2) - k * costh * length / 2 * Math.cos(k * costh * length / 2)) / Math.pow(k * costh, 2));
		var complex3 = new numeric.T(-a * Math.exp(-k * draft) * (rho * g * breadth - omega * omega * a_33, -a * Math.exp(-k * draft) * (-omega * b_33)));
		var FW_55 = complex1.mul(complex2).mul(complex3).x;

		var FW = [0, 0, FW_33, FW_44, FW_55, 0];
		return FW;
	}

	this.RungeKuttaSolver = function (t, y) {
		var J1 = Euler2J1(y.slice(3, 6));
		var J2 = Euler2J2(y.slice(3, 6));

		var J11 = numeric.rep([6, 6], 0);
		for (i = 0; i < 3; i++) {
			for (f = 0; f < 3; f++) {
				J11[i][f] = J1[i][f];
				J11[3 + i][3 + f] = J2[i][f];
			}
		}

		var g_components = numeric.dot(Smtrx(numeric.dot(J1, RG_system)), [0, 0, g]);
		var gforce = [0, 0, m * g, m * g_components[0], m * g_components[1], m * g_components[2]];
		var dy = numeric.rep([15], 0); // 6 Positions & 6 Velocities & 3 Euler Angles

		var b_velocities = y.slice(6, 12);
		var w_velocities = numeric.dot(J11, b_velocities);
		for (f = 0; f < 6; f++) {
			dy[f] = w_velocities[f];
		}
		// console.log(mooringForce);

		var linear_Solve = numeric.solve(AA, numeric.add(numeric.dot(numeric.transpose(J11), numeric.add(waveForce, mooringForce)), numeric.neg(numeric.dot(Coriolis(MM, ADD_mass, y.slice(6, 12)), y.slice(6, 12))), numeric.neg(numeric.dot(BB, y.slice(6, 12))), numeric.neg(numeric.dot(numeric.dot(numeric.transpose(J11), CC), y.slice(0, 6))), numeric.neg(numeric.dot(numeric.transpose(J11), gforce))));

		for (f = 6; f < 12; f++) {
			dy[f] = linear_Solve[f - 6];
		}

		var b_angular_velocities = y.slice(9, 12);
		var euler_angle_rate = numeric.dot(J2, b_angular_velocities);
		for (f = 12; f < 15; f++) {
			dy[f] = euler_angle_rate[f - 12];
		}

		return dy;
	}

	var Coriolis = function (M, AM, vel) {
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

	var Euler2J1 = function (Eang) {
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

	var Euler2J2 = function (Eang) {
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
	var Smtrx = function (vec3) {
		var m = [
			[0, -vec3[2], vec3[1]],
			[vec3[2], 0, -vec3[0]],
			[-vec3[1], vec3[0], 0]
		];

		return m;
	}

	//Insert Mooring lines ------------------------------------
	this.InsertMooring = function (ship, states, motion, seaDepth, anchorPoint) {

		var J = Euler2J1([motion.roll, motion.pitch, motion.yaw]);

		pos = [numeric.dot(J, mooring.mooringPointOnShip[0]), numeric.dot(J, mooring.mooringPointOnShip[1]), numeric.dot(J, mooring.mooringPointOnShip[2]), numeric.dot(J, mooring.mooringPointOnShip[3])];

		// Variables Inserting
		var xs; // Mooring suspended line                (m)
		var aPosible = []; // Guesses necessary for solving Eq.     (m)
		var a = []; // Guesses necessary for solving Eq.     (m)
		var horizontalForce = []; // Horizontal Force on the ship          (kgf)
		var verticalForce = []; // Vertical Force on the ship            (kgf)
		var FM = numeric.rep([6], 0); // Horizontal forces and Moments       (m)

		// Anchoring point in seabed
		var anchorAngle = []; // Cos and sin of horzontal angle         ( )
		var anchorPointOnShip = []; // Line geometry (global)        (m, m, m)
		var anchorDist = []; // Max. horizontal distance of line       (m)
		var mooringLengthSuspended; // Suspende line length                   (m)
		var anchorPoint = [];
		resultingForce = []

		for (var i = 0; i < pos.length; i++) {
			anchorPoint[i] = [
				userParameters.radialDistance * Math.cos((-i * Math.PI) / 2 + (mooring.mooringAngle * Math.PI) / 180),
				-userParameters.seaDepth,
				userParameters.radialDistance * Math.sin((-i * Math.PI) / 2 + (mooring.mooringAngle * Math.PI) / 180)
			];

			hangedMooring[i] = []
			anchorPointOnShip[i] = [pos[i][0] + motion.surge, pos[i][2] + motion.heave, pos[i][1] - motion.sway];
			anchorDist[i] = Math.pow(Math.pow(anchorPoint[i][0] - anchorPointOnShip[i][0], 2) + Math.pow(anchorPoint[i][1] - anchorPointOnShip[i][1], 2) + Math.pow(anchorPoint[i][2] - anchorPointOnShip[i][2], 2), 0.5);
			anchorAngle[i] = [(anchorPoint[i][0] - anchorPointOnShip[i][0]) / anchorDist[i], (anchorPoint[i][2] - anchorPointOnShip[i][2]) / anchorDist[i]];
			var as = numeric.linspace(0.01, mooring.anchorLength, 100);

			for (var n = 0; n < as.length; n++) {
				aPosible[n] = mooring.anchorLength - anchorDist[i] - as[n] * Math.sinh(Math.acosh(((anchorPointOnShip[i][1] + userParameters.seaDepth) / as[n]) + 1)) + as[n] * (Math.acosh(((anchorPointOnShip[i][1] + userParameters.seaDepth) / as[n]) + 1));
			}
			a[i] = numeric.spline(as, aPosible).roots();
			horizontalForce[i] = a[i] * userParameters.density;
			mooringLengthSuspended = Math.pow((anchorPointOnShip[i][1] + userParameters.seaDepth) * ((anchorPointOnShip[i][1] + userParameters.seaDepth) + 2 * a[i]), 0.5);
			xs = a[i] * Math.asinh(mooringLengthSuspended / a[i]); // m (Horizontal distance of the ship)
			verticalForce[i] = userParameters.density * mooringLengthSuspended;

			const dx = xs / 50; // m (Distance variated)
			var m = 0;
			for (var d = xs; d >= 0; d -= dx) {
				hangedMooring[i][m] = [anchorPointOnShip[i][0] + (xs - d) * (anchorAngle[i][0]),
				a[i] * (Math.cosh(d / a[i]) - 1) - userParameters.seaDepth,
				anchorPointOnShip[i][2] + (xs - d) * (anchorAngle[i][1])
				];
				m++;
			}

			Fx = g * horizontalForce[i] * (anchorAngle[i][0]);
			Fy = g * horizontalForce[i] * (anchorAngle[i][1]);
			Fz = g * verticalForce[i];
			resultingForce[i] = Math.pow(Math.pow(Fx, 2) + Math.pow(Fy, 2) + Math.pow(Fz, 2), 0.5) / 1000;
		}

		for (var i = 0; i < pos.length; i++) {
			if (mooring.anchorLineGeometry[i].geometry.vertices[0] == undefined) {
				mooring.anchorLineGeometry[i].geometry.vertices[0] = [];
				mooring.anchorLineGeometry[i].geometry.vertices[0].push(new THREE.Vector3(anchorPointOnShip[i][0], anchorPointOnShip[i][1], anchorPointOnShip[i][2]));
			} else {
				mooring.anchorLineGeometry[i].geometry.vertices[0].x = anchorPointOnShip[i][0];
				mooring.anchorLineGeometry[i].geometry.vertices[0].y = anchorPointOnShip[i][1];
				mooring.anchorLineGeometry[i].geometry.vertices[0].z = anchorPointOnShip[i][2];
			}

			for (var m = 0; m < hangedMooring[i].length; m++) {
				if (mooring.anchorLineGeometry[i].geometry.vertices[m + 1] == undefined) {
					mooring.anchorLineGeometry[i].geometry.vertices[m + 1] = [];
					mooring.anchorLineGeometry[i].geometry.vertices[m + 1].push(new THREE.Vector3(hangedMooring[i][m][0], hangedMooring[i][m][1], hangedMooring[i][m][2]));
				} else {
					mooring.anchorLineGeometry[i].geometry.vertices[m + 1].x = hangedMooring[i][m][0];
					mooring.anchorLineGeometry[i].geometry.vertices[m + 1].y = hangedMooring[i][m][1];
					mooring.anchorLineGeometry[i].geometry.vertices[m + 1].z = hangedMooring[i][m][2];
				}
				// line[i][m+1].geometry.vertices = [hangedMooring[i][m][0], hangedMooring[i][m][1], hangedMooring[i][m][2]];
			}

			// line[i][m+2].geometry.vertices = [anchorPoint[i][0], anchorPoint[i][1], anchorPoint[i][2]];
			if (mooring.anchorLineGeometry[i].geometry.vertices[m] == undefined) {
				mooring.anchorLineGeometry[i].geometry.vertices[m] = [];
				mooring.anchorLineGeometry[i].geometry.vertices[m].push(new THREE.Vector3(anchorPoint[i][0], anchorPoint[i][1], anchorPoint[i][2]));
			} else {
				mooring.anchorLineGeometry[i].geometry.vertices[m].x = anchorPoint[i][0];
				mooring.anchorLineGeometry[i].geometry.vertices[m].y = anchorPoint[i][1];
				mooring.anchorLineGeometry[i].geometry.vertices[m].z = anchorPoint[i][2];
			}

			mooring.anchorLineGeometry[i].geometry.verticesNeedUpdate = true;
		}
		// states.continuous.mooring = mooring;

		return FM;
	}
	//INSERT Hawsers --------------------------------------------

	this.InsertHawsers = function (ship, states, motion, motion2, seaDepth, anchorPoint) {
		this.anchorPoint = anchorPoint
		this.motion = motion;
		this.motion2 = motion2;

		var J = Euler2J1([motion.roll, motion.pitch, motion.yaw]);

		var J_2 = Euler2J1([motion2.roll, motion2.pitch, 0.5 * motion2.yaw]);

		posT = [numeric.dot(J, hawsers.mooringPointOnShip[0]), numeric.dot(J, hawsers.mooringPointOnShip[1]), numeric.dot(J, hawsers.mooringPointOnShip[2]), numeric.dot(J, hawsers.mooringPointOnShip[3]), numeric.dot(J, hawsers.mooringPointOnShip[4]), numeric.dot(J, hawsers.mooringPointOnShip[5]), numeric.dot(J, hawsers.mooringPointOnShip[6]), numeric.dot(J, hawsers.mooringPointOnShip[7])];

		posB = [numeric.dot(J_2, hawsers.anchorPoint[0]), numeric.dot(J_2, hawsers.anchorPoint[1]),
		numeric.dot(J_2, hawsers.anchorPoint[2]),
		numeric.dot(J_2, hawsers.anchorPoint[3]),
		numeric.dot(J_2, hawsers.anchorPoint[4]),
		numeric.dot(J_2, hawsers.anchorPoint[5]),
		numeric.dot(J_2, hawsers.anchorPoint[6]),
		numeric.dot(J_2, hawsers.anchorPoint[7])];

		var anchorPointOnShip1 = []; // Line geometry (global)
		var anchorPointOnShip2 = [];

		for (var i = 0; i < posT.length; i++) {
			anchorPointOnShip1[i] = [posT[i][0] + motion.surge, posT[i][2] + motion.heave, posT[i][1] - motion.sway];
			anchorPointOnShip2[i] = [posB[i][0] + motion2.surge, posB[i][2] + motion2.heave, posB[i][1] - motion2.sway];
		}

		for (var i = 0; i < posT.length; i++) {
			hawsers.anchorLineGeometry[i].geometry.vertices[0].x = anchorPointOnShip1[i][0];
			hawsers.anchorLineGeometry[i].geometry.vertices[0].y = anchorPointOnShip1[i][1];
			hawsers.anchorLineGeometry[i].geometry.vertices[0].z = anchorPointOnShip1[i][2];

			hawsers.anchorLineGeometry[i].geometry.vertices[1].x = anchorPointOnShip2[i][0];
			hawsers.anchorLineGeometry[i].geometry.vertices[1].y = anchorPointOnShip2[i][1];
			hawsers.anchorLineGeometry[i].geometry.vertices[1].z = anchorPointOnShip2[i][2];

			hawsers.anchorLineGeometry[i].geometry.verticesNeedUpdate = true;

			//Calculate hawsers tensions---------------------------
			hawsers.anchorLineGeometry[i].geometry.linelength = Math.sqrt((Math.pow((hawsers.anchorLineGeometry[i].geometry.vertices[0].x - hawsers.anchorLineGeometry[i].geometry.vertices[1].x), 2)) + (Math.pow((hawsers.anchorLineGeometry[i].geometry.vertices[0].y - hawsers.anchorLineGeometry[i].geometry.vertices[1].y), 2)) + (Math.pow((hawsers.anchorLineGeometry[i].geometry.vertices[0].z - hawsers.anchorLineGeometry[i].geometry.vertices[1].z), 2)));
		}

		for (i = 0; i < 8; i++) {
			if (i < 6) {
				inilen = 11.751311259877795
			} else {
				inilen = 18.933832153053434
			}
			tension[i] = (hawsers.anchorLineGeometry[i].geometry.linelength - inilen) * Math.pow((diameter * 0.1), 2) * k * 0.5

			if ((hawsers.anchorLineGeometry[i].geometry.linelength - inilen) < 0) { tension[i] = 0 }
		}
	}
	//Insert Hawsers 2 -------------------------------------
	this.InsertHawsers2 = function (ship, states, motion, motion3, seaDepth, anchorPoint) {
		this.motion = motion;
		this.motion3 = motion3;
		this.anchorPoint = anchorPoint;

		var J = Euler2J1([motion.roll, motion.pitch, motion.yaw]);

		var J_2 = Euler2J1([motion3.roll, motion3.pitch, 0.5 * motion3.yaw]);

		posT2 = [numeric.dot(J, hawsers2.mooringPointOnShip[0]), numeric.dot(J, hawsers2.mooringPointOnShip[1]), numeric.dot(J, hawsers2.mooringPointOnShip[2]), numeric.dot(J, hawsers2.mooringPointOnShip[3]), numeric.dot(J, hawsers2.mooringPointOnShip[4]), numeric.dot(J, hawsers2.mooringPointOnShip[5]), numeric.dot(J, hawsers2.mooringPointOnShip[6]), numeric.dot(J, hawsers2.mooringPointOnShip[7])];

		posB2 = [numeric.dot(J_2, anchorPoint[0]), numeric.dot(J_2, anchorPoint[1]),
		numeric.dot(J_2, anchorPoint[2]),
		numeric.dot(J_2, anchorPoint[3]),
		numeric.dot(J_2, anchorPoint[4]),
		numeric.dot(J_2, anchorPoint[5]),
		numeric.dot(J_2, anchorPoint[6]),
		numeric.dot(J_2, anchorPoint[7])];

		var anchorPointOnShip2 = []; // Line geometry (global)
		var anchorPointz = [];

		for (var i = 0; i < posT2.length; i++) {
			anchorPointOnShip2[i] = [posT2[i][0] + motion.surge, posT2[i][2] + motion.heave, posT2[i][1] - motion.sway];
			anchorPointz[i] = [posB2[i][0] + motion3.surge, posB2[i][2] + motion3.heave, posB2[i][1] - motion3.sway];
		}

		for (var i = 0; i < posT2.length; i++) {
			hawsers2.anchorLineGeometry[i].geometry.vertices[0].x = anchorPointOnShip2[i][0];
			hawsers2.anchorLineGeometry[i].geometry.vertices[0].y = anchorPointOnShip2[i][1];
			hawsers2.anchorLineGeometry[i].geometry.vertices[0].z = anchorPointOnShip2[i][2];

			hawsers2.anchorLineGeometry[i].geometry.vertices[1].x = anchorPointz[i][0];
			hawsers2.anchorLineGeometry[i].geometry.vertices[1].y = anchorPointz[i][1];
			hawsers2.anchorLineGeometry[i].geometry.vertices[1].z = anchorPointz[i][2];

			hawsers2.anchorLineGeometry[i].geometry.verticesNeedUpdate = true;
		}
		//PLOTS for motion and tensions --------------------------
	}
	window.feedMotionHeave = function (callback) {
		var tick = {};
		tick.plot0 = motion.heave;
		tick.plot1 = motion2.heave;
		tick.plot2 = motion3.heave;
		callback(JSON.stringify(tick));
	};
	window.feedMotionRoll = function (callback) {
		var tick = {};
		tick.plot0 = motion.roll * 180 / Math.PI;
		tick.plot1 = motion2.roll * 180 / Math.PI;
		tick.plot2 = motion3.roll * 180 / Math.PI;
		callback(JSON.stringify(tick));
	};
	window.feedMotionSurge = function (callback) {
		var tick = {};
		tick.plot0 = motion.surge;
		tick.plot1 = motion2.surge;
		tick.plot2 = motion3.surge;
		callback(JSON.stringify(tick));
	};
	window.feedMotionSway = function (callback) {
		var tick = {};
		tick.plot0 = motion.sway;
		tick.plot1 = motion2.sway;
		tick.plot2 = motion3.sway;
		callback(JSON.stringify(tick));
	};
	window.feedMotionPitch = function (callback) {
		var tick = {};
		tick.plot0 = motion.pitch * 180 / Math.PI;
		tick.plot1 = motion2.pitch * 180 / Math.PI;
		tick.plot2 = motion3.pitch * 180 / Math.PI;
		callback(JSON.stringify(tick));
	};
	window.feedMotionYaw = function (callback) {
		var tick = {};
		tick.plot0 = motion.yaw;
		tick.plot1 = motion2.yaw;
		tick.plot2 = motion3.yaw;
		callback(JSON.stringify(tick));
	};

	window.tensions = function (callback) {
		var tick = {};
		tick.plot0 = resultingForce[0];
		tick.plot1 = resultingForce[1];
		tick.plot2 = resultingForce[2];
		tick.plot3 = resultingForce[3];
		callback(JSON.stringify(tick));
	};
	window.tensionsHawsers = function (callback) {
		var tick = {};
		tick.plot0 = tension[0];
		tick.plot1 = tension[1];
		tick.plot2 = tension[2];
		tick.plot3 = tension[3];
		tick.plot4 = tension[4];
		tick.plot5 = tension[5];
		tick.plot6 = tension[6];
		tick.plot7 = tension[7];
		callback(JSON.stringify(tick));
	};

	var myDashboardMooring = {
		"graphset": [
			{//---------- TENSIONS HAWSERS-----------//
				"type": "line",
				"plotarea": {
					"adjust-layout": true
				},
				"height": "25%",
				"width": "25%",
				"x": "75%",
				"y": "48%",
				"plot": {
					"aspect": "spline",
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "Line 1"
				}, {
					"values": [0],
					"text": "Line 2"
				}, {
					"values": [0],
					"text": "Line 3"
				}, {
					"values": [0],
					"text": "Line 4"
				}, {
					"values": [0],
					"text": "Line 5"
				}, {
					"values": [0],
					"text": "Line 6"
				}, {
					"values": [0],
					"text": "Line 7"
				}, {
					"values": [0],
					"text": "Line 8"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "tensionsHawsers()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Tensions [kN]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Hawser tensions",
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
			}, {//---------- TENSIONS-----------//
				"type": "line",
				"plotarea": {
					"adjust-layout": true
				},
				"height": "25%",
				"width": "25%",
				"x": "75%",
				"y": "72%",
				"plot": {
					"aspect": "spline",
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "Line 1"
				}, {
					"values": [0],
					"text": "Line 2"
				}, {
					"values": [0],
					"text": "Line 3"
				}, {
					"values": [0],
					"text": "Line 4"
				}],
				"refresh": {
					"type": "feed",
					"transport": "js",
					"url": "tensions()",
					"method": "pull",
					"interval": 500,
					"adjust-scale": true
				},
				scaleY: {
					label: {
						text: 'Tensions [kN]',
						fontStyle: 'normal',
						fontWeight: 'normal',
					},
				},
				title: {
					text: "Mooring tensions",
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
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG[m]"
				}, {
					"values": [0],
					"text": "Suez[m]"
				}, {
					"values": [0],
					"text": "Suez[m]"
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
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG[deg]"
				}, {
					"values": [0],
					"text": "Suez[deg]"
				}, {
					"values": [0],
					"text": "Suez[deg]"
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
						text: 'Pitch angle [deg]',
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
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG[deg]"
				}, {
					"values": [0],
					"text": "Suez[deg]"
				}, {
					"values": [0],
					"text": "Suez[deg]"
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
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG"
				}, {
					"values": [0],
					"text": "Suezmax 1"
				}, {
					"values": [0],
					"text": "Suezmax 2"
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
					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG[Sway]"
				}, {
					"values": [0],
					"text": "Suez[Sway]"
				}, {
					"values": [0],
					"text": "Suez[Sway]"
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

					"marker": { "visible": false },
				},
				"series": [{
					"values": [0],
					"text": "FLNG[m]"
				}, {
					"values": [0],
					"text": "Suez[m]"
				}, {
					"values": [0],
					"text": "Suez[m]"
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

	window.onload = function () {
		zingchart.render({
			id: 'plotBottom',
			height: "100%",
			width: "100%",
			data: myDashboardMooring,
		});

	};
};