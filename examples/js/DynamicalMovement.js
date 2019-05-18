//@ferrari212

/*This code is based on work developed by Thiago G. Monteiro, Jiafeng Xu and Henrique M. Gaspar.*/
/*source: http://www.shiplab.hials.org/app/6dof/.*/

/*The code will require the main ship dimensions*/

function DynamicalMovement(ship, states, userParameters, Ini, oceanDepth) {
  this.ship = ship;
  this.states = states;

  var designDimention = this.ship.structure.hull.attributes;
  var calculatedParameters = this.ship.designState.calculationParameters;
  var floatingStates = this.states.discrete.FloatingCondition.state;

  var options = {
    valueNames: ['id', 'name', 'x_position', 'y_position', 'z_position', 'mass', 'l_mass', 'h_mass', 'w_mass']
  };

  length = floatingStates.LWL;
  breadth = floatingStates.BWL;
  depth = designDimention.Depth;
  draft = floatingStates.T;
  Cb = calculatedParameters.Cb_design;
  KG = 0.5 * depth;

  // Init list
  var rho = 1025; // Water Density               (kg/m3)
  g = 9.81; // Gravitational Acceleration  (m/s2)
  var m = floatingStates.w.mass; // Vessel Mass                    (kg)
  var a_33 = rho * g * breadth * draft;
  var A_WP = floatingStates.Awp; // Still Water Plane Area                (m2)
  // Remenber to use recalculate the draft when the code allow add mass like bellow
  // var draft_system = (LL[0][0]+rho*length*breadth*draft*Cb)/(rho*length*breadth*Cb); // draft vessel + body  (m)
  // var center_reference = -draft;

  this.states.continuous.motion = {};
  var motion = this.states.continuous.motion;
  [motion.surge, motion.sway, motion.heave, motion.roll, motion.pitch, motion.yaw, motion.VSurge, motion.VSway,
    motion.VHeave, motion.VRoll, motion.VPitch, motion.VYaw, motion.EX, motion.EY, motion.EZ
  ] = Ini;

  this.moveShip = function(tprev, dt) {
      B_33 = rho * A_WP * userParameters.C_D;
      B_44 = userParameters.B_44;
      B_55 = userParameters.B_55;
      waveForce = [0, 0, 0, 0, 0, 0];

    // Inertia
    var I_46 = 0; //Small coupled term, was neglected.
    var I_44 = Math.pow((0.4 * breadth), 2) * m; // Rolling Moment of Inertia      (kgm2) //(1/12)*m*(Math.pow(B,2)+Math.pow(D,2));
    var I_55 = Math.pow((0.28 * length), 2) * m; // Pitching Moment of Inertia     (kgm2) //(1/12)*m*(Math.pow(L,2)+Math.pow(D,2));
    var I_66 = Math.pow((0.28 * length), 2) * m; // Yawing Moment of Inertia       (kgm2) //(1/12)*m*(Math.pow(B,2)+Math.pow(L,2));
    MM = [
      [m, 0, 0, 0, m * (KG - (depth / 2)), 0],
      [0, m, 0, -m * (KG - (depth / 2)), 0, 0],
      [0, 0, m, 0, 0, 0],
      [0, -m * (KG - (depth / 2)), 0, I_44, 0, 0],
      [m * (KG - (depth / 2)), 0, 0, 0, I_55, 0],
      [0, 0, 0, 0, 0, I_66]
    ]; // Vessel's inertia tensor
    RG_system = [MM[5][1] / m, MM[3][2] / m, MM[4][0] / m]; // System's centre of gravity

    // Initial Stability
    var Delta = m * g; // Vessel Displacement                   (N)
    var KB = draft / 2; // Centre of Buoyancy Height             (m)
    var C_33 = rho * g * A_WP; // Heave Restoring Coeff.                (N/m)
    // var C_44a = Delta*(KB-KG);                  // First Part of Roll Restoring Coeff.   (Nm)
    var C_44a = Delta * (KB - (RG_system[2] + draft / 2)); // First Part of Roll Restoring Coeff.   (Nm) //KG calcluated after calculating masses @ferrari212
    var C_44b = (1 / 12) * rho * g * Math.pow(breadth, 3) * length; // Second Part of Roll Restoring Coeff.  (Nm)
    var C_44 = C_44a + C_44b; // Total Roll Restoring Coeff.           (Nm)
    // var C_55a = Delta*(KB-KG);                  // First Part of Pitch Restoring Coeff.  (Nm)
    var C_55a = Delta * (KB - (RG_system[2] + draft / 2)); // First Part of Pitch Restoring Coeff.  (Nm) //KG calcluated after calculating masses @ferrari212
    var C_55b = (1 / 12) * rho * g * Math.pow(length, 3) * breadth; // Second Part of Pitch Restoring Coeff. (Nm)
    var C_55 = C_55a + C_55b; // Total Pitch Restoring Coeff.          (Nm)
    var C_35 = 0; // Heave-Pitch Coupled Restoring Coeff.  (N)  // aproximmation to zero is valid if the water plane is symmetrical in relation to the mid section
    var C_53 = 0; // Pitch-Heave Coupled Restoring Coeff.  (N)  // aproximmation to zero is valid if the water plane is symmetrical in relation to the mid section

    // Damping
    var B_11 = rho * breadth * draft * userParameters.C_D; // Linear Sway Dampig Coeff.             (kg/s)
    var B_22 = rho * length * draft * userParameters.C_D; // Linear Sway Dampig Coeff.             (kg/s)
    // var B_33 = rho*A_WP*userParameters.C_D;                    // Linear Heave Dampig Coeff.            (kg/s)

    var ADD_33 = a_33 * length;
    var ADD_44 = 0.15 * I_44; // Equation 6.61a
    var ADD_55 = a_33 * Math.pow(length, 3) / 12;
    ADD_mass = [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, ADD_33, 0, 0, 0],
      [0, 0, 0, ADD_44, 0, 0],
      [0, 0, 0, 0, ADD_55, 0],
      [0, 0, 0, 0, 0, 0]
    ]; // Vessel's added mass
    AA = numeric.add(MM, ADD_mass); // System's total inertia tensor

    // Inserting the critical damping in roll (6.66) considering sigma = 10
    // B_44 += 10*2*Math.sqrt(C_44*(I_44+ADD_44));

    //Dynamic Equations
    BB = [
      [B_11, 0, 0, 0, 0, 0],
      [0, B_22, 0, 0, 0, 0],
      [0, 0, B_33, 0, 0, 0],
      [0, 0, 0, B_44, 0, 0],
      [0, 0, 0, 0, B_55, 0],
      [0, 0, 0, 0, 0, 0]
    ]; // Damping Matrix
    CC = [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, C_33, 0, -C_35, 0],
      [0, 0, 0, C_44, 0, 0],
      [0, 0, C_53, 0, C_55, 0],
      [0, 0, 0, 0, 0, 0]
    ]; // Restoring Matrix
    // console.log("Natural Period Vibration: Heave %.2f; Roll %.2f; Pitch %.2f;", (2*Math.PI)*Math.pow(AA[2][2]/C_33,0.5), (2*Math.PI)*Math.pow(AA[3][3]/C_44,0.5), (2*Math.PI)*Math.pow(AA[4][4]/C_55,0.5));
    // Rugen Kutta
    // dy(1:6)  = World fixed velocity
    // dy(7:12) = Body fixed acceleration
    // dy(13:15)= Euler angle rate

    // y(1:6)   = World fixed motion
    // y(7:12)  = Body fixed velocity
    // y(13:15) = Euler angle

    // J1 = Body 2 world Jacobian
    // J2 = Body 2 Euler angle rate Jacobian

    var y = [motion.surge, motion.sway, motion.heave - this.states.discrete.FloatingCondition.state.T,
      motion.roll, motion.pitch, motion.yaw, motion.VSurge, motion.VSway, motion.VHeave, motion.VRoll,
      motion.VPitch, motion.VYaw, motion.EX, motion.EY, motion.EZ
    ];

    var sol = numeric.dopri(tprev, tprev + dt, y, this.RugenKuttaSolver, 1e-8, 10000).at(tprev + dt);

    // Equalizing the solution
    [motion.surge, motion.sway, motion.heave, motion.roll, motion.pitch, motion.yaw, motion.VSurge,
      motion.VSway, motion.VHeave, motion.VRoll, motion.VPitch, motion.VYaw, motion.EX, motion.EY, motion.EZ
    ] = sol;
    motion.heave += this.states.discrete.FloatingCondition.state.T;
  };

  this.RugenKuttaSolver = function(t, y) {
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

    var linear_Solve = numeric.solve(AA, numeric.add( numeric.neg(numeric.dot(Coriolis(MM, ADD_mass, y.slice(6, 12)), y.slice(6, 12))), numeric.neg(numeric.dot(BB, y.slice(6, 12))), numeric.neg(numeric.dot(numeric.dot(numeric.transpose(J11), CC), y.slice(0, 6))), numeric.neg(numeric.dot(numeric.transpose(J11), gforce))));

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

  var Coriolis = function(M, AM, vel) {
    var c = numeric.dot(M, vel);
    var C = numeric.rep([6, 6], 0);
    var CA = numeric.rep([6, 6], 0);

    // Creanting Inercia Matrix
    var I0 = numeric.diag([M[3][3], M[4][4], M[5][5]]);

    // Calculating Coriolis by Thor Eq. (8)
    var S1 = Smtrx([-m * vel[0], -m * vel[1], -m * vel[2]]);
    var S21 = numeric.dot(Smtrx([m * vel[3], m * vel[4], m * vel[5]]), Smtrx(RG_system));
    var S22 = numeric.dot(Smtrx(RG_system), Smtrx([m * vel[3], m * vel[4], m * vel[5]]));
    // Check if it is necessary to insert an S3?
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

};
