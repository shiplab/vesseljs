
function DynamicalMovement(ship, states, json_data, userParameters, Ini) {
  this.ship = ship;
  this.states = states;

  var calculatedParameters = this.ship.designState.calculationParameters;


  length = floatingStates.LWL;
  breadth = floatingStates.BWL;
  depth = designDimention.Depth;
  draft = T1;
  Cb = calculatedParameters.Cb_design;
  KG = 0.5 * depth;

  // Init list
  var rho = 1025; // Water Density               (kg/m3)
  g = 9.81; // Gravitational Acceleration  (m/s2)
  var m = floatingStates.w.mass; // Vessel Mass                    (kg)
  var a_33 = rho * g * breadth * draft;
  var A_WP = floatingStates.Awp; // Still Water Plane Area                (m2)

  this.moveShip = function(tprev, dt) {
    if (ocean.waves["0"].A) {
      waveForce = this.WaveForce(rho, tprev, a_33);
    } else {
      B_33 = rho * A_WP * userParameters.C_D;
      B_44 = userParameters.B_44;
      B_55 = userParameters.B_55;
      B_66 = userParameters.B_66;
      waveForce = [0, 0, 0, 0, 0, 0]
    }

    mooringLine = this.InsertLine(this.ship, this.states, motion, mooring.anchorPoint);
  
    var y = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

 
  };


  //@ferrari212
  this.WaveForce = function(rho, t, a_33) {
    var a = ocean.waves["0"].A; //Amplitude of Movement
    var costh = ocean.waves["0"].costh; //Cos of Wave Directions
    var sinth = ocean.waves["0"].sinth; //Sen of Wave Directions

    // projection of trajectory for calculation of phase difference
    var projMag = barge3D.position.x * costh + barge3D.position.y * sinth; // magnitude of projection

    var omega = wavCre.waveDef.waveFreq; // wave frequencie
    var k = 2 * Math.PI / ocean.waves["0"].L; // wave number
    var phase = omega * t - ocean.waves["0"].phi - k * projMag;

  }

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

  this.InsertLine = function(ship, states, motion, anchorPoint) {

    let omega = wavCre.waveDef.waveFreq;
      
 
  playback.add(function(t) {
	cos_mo =Math.cos(omega*t-ocean.waves["0"].phi);
		});
    
    var J = Euler2J1([(json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][3][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, (json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][4][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, 0]);
      
    var J_2 = Euler2J1([(json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][9][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, (json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][10][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, 0]);


    pos = [numeric.dot(J,mooring.mooringPointOnShip[0]), numeric.dot(J, mooring.mooringPointOnShip[1]), numeric.dot(J, mooring.mooringPointOnShip[2]), numeric.dot(J, mooring.mooringPointOnShip[3]), numeric.dot(J, mooring.mooringPointOnShip[4]), numeric.dot(J, mooring.mooringPointOnShip[5]), numeric.dot(J, mooring.mooringPointOnShip[6]), numeric.dot(J, mooring.mooringPointOnShip[7])];

      
    posB = [numeric.dot(J_2, mooring.mooringPoint[0]), numeric.dot(J_2, mooring.mooringPoint[1]), 
    numeric.dot(J_2, mooring.mooringPoint[2]), 
    numeric.dot(J_2, mooring.mooringPoint[3]), 
    numeric.dot(J_2, mooring.mooringPoint[4]), 
    numeric.dot(J_2, mooring.mooringPoint[5]), 
    numeric.dot(J_2, mooring.mooringPoint[6]), 
    numeric.dot(J_2, mooring.mooringPoint[7])];
  
   
    var aPosible = []; // Guesses necessary for solving Eq.     (m)
    var a = []; // Guesses necessary for solving Eq.     (m)
    var FM = numeric.rep([6], 0); // Horizontal forces and Moments       (m)

    var anchorPointOnShip = [];
    var anchorPoint = [];

    for (var i = 0; i < pos.length; i++) {

    anchorPointOnShip[i] = [pos[i][0] + 0, pos[i][2] + (json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][2][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, pos[i][1] - 0];
        
    anchorPoint[i] = [-posB[i][0] + 0, -posB[i][2] + (json_data[sep.y/4][controller.object.fullness][controller2.object.fullness][8][ocean.waves[0].T][ocean.waves[0].theta*4]*[ocean.waves[0].A])*cos_mo, -posB[i][1] - 0];
        
    }

    for (var i = 0; i < pos.length; i++) {
      if (mooring.anchorLineGeometry[i].geometry.vertices[1] == undefined) {
        mooring.anchorLineGeometry[i].geometry.vertices[1] = [];
          
        mooring.anchorLineGeometry[i].geometry.vertices[0] = [];
        mooring.anchorLineGeometry[i].geometry.vertices[1].push(new THREE.Vector3(anchorPoint[i][0], anchorPoint[i][1], anchorPoint[i][2]));
          mooring.anchorLineGeometry[i].geometry.vertices[0].push(new THREE.Vector3(anchorPointOnShip[i][0], anchorPointOnShip[i][1], anchorPointOnShip[i][2]));
          
          
      } else {
        mooring.anchorLineGeometry[i].geometry.vertices[0].x = anchorPointOnShip[i][0];
        mooring.anchorLineGeometry[i].geometry.vertices[0].y = anchorPointOnShip[i][1];
        mooring.anchorLineGeometry[i].geometry.vertices[0].z = anchorPointOnShip[i][2];
        mooring.anchorLineGeometry[i].geometry.vertices[1].x = anchorPoint[i][0];
        mooring.anchorLineGeometry[i].geometry.vertices[1].y = anchorPoint[i][1];
        mooring.anchorLineGeometry[i].geometry.vertices[1].z = anchorPoint[i][2];
      }

        mooring.anchorLineGeometry[i].geometry.linelength = Math.sqrt((Math.pow((mooring.anchorLineGeometry[i].geometry.vertices[0].x -mooring.anchorLineGeometry[i].geometry.vertices[1].x),2))+(Math.pow((mooring.anchorLineGeometry[i].geometry.vertices[0].y -mooring.anchorLineGeometry[i].geometry.vertices[1].y),2))+(Math.pow((mooring.anchorLineGeometry[i].geometry.vertices[0].z -mooring.anchorLineGeometry[i].geometry.vertices[1].z),2)));
      mooring.anchorLineGeometry[i].geometry.verticesNeedUpdate = true;
        
        
    }
    // states.continuous.mooring = mooring;

    return FM;
  }
};