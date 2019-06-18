function DynamicalMovement(ship, states, userParameters, Ini, seaDepth) {
	this.ship = ship;
	this.states = states;

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
    
	[motion.surge, motion.sway, motion.heave, motion.roll, motion.pitch, motion.yaw, motion.VSurge, motion.VSway, motion.VHeave, motion.VRoll, motion.VPitch, motion.VYaw, motion.EX, motion.EY, motion.EZ] = Ini;

	this.moveShip = function (tprev, dt) {
			
       
		

		mooringForce = this.InsertMooring(this.ship, this.states, motion, seaDepth, mooring.anchorPoint);
        
        hawsersLine = this.InsertHawsers(this.ship, this.states, motion, seaDepth, hawsers.anchorPoint);
        
        
    var cos_mo2, cos_mo3, cos_mo4, cos_mo5, cos_mo8, cos_mo9, cos_mo10;    
    let omega = wavCre.waveDef.waveFreq;        
        
playback.add(function(t) {
        if (output=== undefined){}else{ 
	cos_mo0 =Math.cos(omega*t-pha[0][ocean.waves[0].T][ocean.waves[0].theta*4]);
	cos_mo1 =Math.cos(omega*t-pha[1][ocean.waves[0].T][ocean.waves[0].theta*4]);
	cos_mo2 =Math.cos(omega*t-pha[2][ocean.waves[0].T][ocean.waves[0].theta*4]);
    cos_mo3 =Math.cos(omega*t-pha[3][ocean.waves[0].T][ocean.waves[0].theta*4]);
    cos_mo4 =Math.cos(omega*t-pha[4][ocean.waves[0].T][ocean.waves[0].theta*4]);
	cos_mo5 =Math.cos(omega*t-pha[5][ocean.waves[0].T][ocean.waves[0].theta*4]);
	cos_mo6 =Math.cos(omega*t-pha[6][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
	cos_mo7 =Math.cos(omega*t-pha[7][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
    cos_mo8 =Math.cos(omega*t-pha[8][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
    cos_mo9 =Math.cos(omega*t-pha[9][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
    cos_mo10 =Math.cos(omega*t-pha[10][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
    cos_mo11 =Math.cos(omega*t-pha[11][ocean.waves[0].T][ocean.waves[0].theta*4]+3.14);
        }
    
    
if (output=== undefined){} else {     
  motion.surge = (rao[0][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo0*0.01 
  motion.sway = (rao[1][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo1*0.01 
  motion.heave = (rao[2][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo2*0.01 
  motion.roll = (rao[3][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo3*0.01 
  motion.pitch = (rao[4][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo4*0.01 
  motion.yaw = (rao[5][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo5*0.01     
  motion.VSurge = (rao[6][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo6*0.01 
  motion.VSway = (rao[7][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo7*0.01 
  motion.VHeave = (rao[8][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo8*0.01 
  motion.VRoll = (rao[9][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo9*0.01 
  motion.VPitch = (rao[10][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo10*0.01 
  motion.VYaw = (rao[11][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo11*0.01   
    
  }
		});    
        
    ship3D.surge = motion.surge;
    ship3D.sway = motion.sway;       
    ship3D.heave = motion.heave;
    ship3D.roll = motion.roll;
    ship3D.pitch = motion.pitch;
    ship3D.yaw = motion.yaw*0.5;

    barge23D.surge = motion.VSurge;
    barge23D.sway = motion.VSway; 
    barge23D.heave = motion.VHeave;
    barge23D.roll = motion.VRoll;
    barge23D.pitch = motion.VPitch;  
    barge23D.yaw = motion.VYaw*0.5;


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

			// Approximation small angles of yaw
			FM[0] += g * horizontalForce[i] * (anchorAngle[i][0]);
			FM[1] -= g * horizontalForce[i] * (anchorAngle[i][1]);
			FM[2] -= g * verticalForce[i];
			FM[3] += (g * horizontalForce[i] * (anchorAngle[i][1])) * (pos[i][2] + depth - draft / 2) + (g * verticalForce[i]) * pos[i][1];

			FM[4] += g * horizontalForce[i] * (anchorAngle[i][0]) * (pos[i][2] + depth - draft / 2) + g * verticalForce[i] * pos[i][0];

			FM[5] += (-g * horizontalForce[i] * (anchorAngle[i][1])) * (pos[i][0]) + g * horizontalForce[i] * (anchorAngle[i][0]) * (pos[i][1]);

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
    
    
    
    this.InsertHawsers = function (ship, states, motion, seaDepth, anchorPoint) {

        var J = Euler2J1([motion.roll, motion.pitch, motion.yaw]);
        
       var J_2 = Euler2J1([motion.VRoll, motion.VPitch, motion.VYaw]);
        
        posT = [numeric.dot(J,hawsers.mooringPointOnShip[0]), numeric.dot(J, hawsers.mooringPointOnShip[1]), numeric.dot(J, hawsers.mooringPointOnShip[2]), numeric.dot(J, hawsers.mooringPointOnShip[3]), numeric.dot(J, hawsers.mooringPointOnShip[4]), numeric.dot(J, hawsers.mooringPointOnShip[5]), numeric.dot(J, hawsers.mooringPointOnShip[6]), numeric.dot(J, hawsers.mooringPointOnShip[7])];
  
        
   
        posB = [numeric.dot(J_2, hawsers.mooringPoint[0]), numeric.dot(J_2, hawsers.mooringPoint[1]), 
        numeric.dot(J_2, hawsers.mooringPoint[2]), 
        numeric.dot(J_2, hawsers.mooringPoint[3]), 
        numeric.dot(J_2, hawsers.mooringPoint[4]), 
        numeric.dot(J_2, hawsers.mooringPoint[5]), 
        numeric.dot(J_2, hawsers.mooringPoint[6]), 
        numeric.dot(J_2, hawsers.mooringPoint[7])];

	    
		var anchorPointOnShip = []; // Line geometry (global)   
		var anchorPoint = [];

		for (var i = 0; i < posT.length; i++) {

            anchorPointOnShip[i] = [posT[i][0] + motion.surge, posT[i][2] + motion.heave, posT[i][1] - motion.sway];
        
            anchorPoint[i] = [-posB[i][0] + motion.VSurge, -posB[i][2] + motion.VHeave, posB[i][1] - motion.VSway]; 

		 }

		for (var i = 0; i < posT.length; i++) {
	
				hawsers.anchorLineGeometry[i].geometry.vertices[0].x = anchorPointOnShip[i][0];
				hawsers.anchorLineGeometry[i].geometry.vertices[0].y = anchorPointOnShip[i][1];
				hawsers.anchorLineGeometry[i].geometry.vertices[0].z = anchorPointOnShip[i][2];
                
                 hawsers.anchorLineGeometry[i].geometry.vertices[1].x = anchorPoint[i][0];
        
                hawsers.anchorLineGeometry[i].geometry.vertices[1].y = anchorPoint[i][1];
       
                hawsers.anchorLineGeometry[i].geometry.vertices[1].z = anchorPoint[i][2];
			
hawsers.anchorLineGeometry[i].geometry.verticesNeedUpdate = true;
		}

	}
    
    

};