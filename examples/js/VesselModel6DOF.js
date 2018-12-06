//@ferrari212

/*This code is based on work developed by Thiago G. Monteiro, Jiafeng Xu and Henrique M. Gaspar.*/
/*source: http://www.shiplab.hials.org/app/6dof/.*/

/*The code will require the main ship dimensions*/

function DinamicalMovement(ship, states, userParameters, Ini, dt){

  var designDimention = ship.structure.hull.attributes;
  var calculatedParameters =  ship.designState.calculationParameters;
  var floatingStates = states.discrete.FloatingCondition.state;


  var options = {
          valueNames: [ 'id', 'name', 'x_position', 'y_position', 'z_position', 'mass',  'l_mass', 'h_mass', 'w_mass']
        };

        Length = floatingStates.LWL;
        Breadth = floatingStates.BWL;
        Depth = designDimention.Depth;
        Draft = floatingStates.T;
        Cb = calculatedParameters.Cb_design;
        // Time_Span = parseFloat(document.getElementById("slide_Ts").value);
        // document.getElementById("Ts").value = Time_Span;
        KG = 0.5*Depth;
        // init_heave = parseFloat(document.getElementById("slide_init_heave").value);
        // document.getElementById("init_heave").value = init_heave;
        // init_roll = parseFloat(document.getElementById("slide_init_roll").value);
        // document.getElementById("init_roll").value = init_roll;
        // init_pitch = parseFloat(document.getElementById("slide_init_pitch").value);
        // document.getElementById("init_pitch").value = init_pitch;

        // Init list
        var bodiesList = new List('bodies', options);
        // Inserting new mass, look at later
        // var idField = $('#id-field'),
        //     nameField = $('#name-field'),
        //     x_positionField = $('#x_position-field'),
        //     y_positionField = $('#y_position-field'),
        //     z_positionField = $('#z_position-field'),
        //     massField = $('#mass-field'),
        //     l_massField = $('#l_mass-field'),
        //     h_massField = $('#h_mass-field'),
        //     w_massField = $('#w_mass-field'),
        //     addBtn = $('#add-btn'),
        //     editBtn = $('#edit-btn').hide(),
        //     removeBtns = $('.remove-item-btn'),
        //     editBtns = $('.edit-item-btn');

  var body = [];
        for(i = 0;i < bodiesList.items.length;i++) {
            body[i] = {};
            body[i].position = [ parseFloat(bodiesList.items[i]._values.x_position),  parseFloat(bodiesList.items[i]._values.y_position),  parseFloat(bodiesList.items[i]._values.z_position)];
            // The inertia is in relation to it's own base of coordinates
            body[i].inertiaTensor =  [[ parseFloat(bodiesList.items[i]._values.mass), 0, 0, 0, 0, 0],
                                      [0,  parseFloat(bodiesList.items[i]._values.mass), 0, 0, 0, 0],
                                      [0, 0,  parseFloat(bodiesList.items[i]._values.mass), 0, 0, 0],
                                      [0, 0, 0, 1, 0, 0],
                                      [0, 0, 0, 0, 1, 0],
                                      [0, 0, 0, 0, 0, 1]];
            body[i].l_mass = parseFloat(bodiesList.items[i]._values.l_mass);
            body[i].h_mass = parseFloat(bodiesList.items[i]._values.h_mass);
            body[i].w_mass = parseFloat(bodiesList.items[i]._values.w_mass);
        }
        LL = LoadsInertia(body);

        // var tspan = Time_Span;      // Simulation time             (s)
        // var Cb = ship.Cb_design;    // Simulation time             (m)
        // var w = ship.BWL;           // Vessel breadth              (m)
        // var h = ship.Depth;         // Vessel depth                (m)
        // var l = ship.LWL_design;    // Vessel length               (m)
        // var w_mass = 1;             // Vessel breadth              (m)
        // var h_mass = 1;             // Vessel depth                (m)
        // var l_mass = 1;             // Vessel length               (m)
        var rho = 1025;                // Water Density               (kg/m3)
        g = 9.81;                  // Gravitational Acceleration  (m/s2)
        var Draft_system = (LL[0][0]+rho*Length*Breadth*Draft*Cb)/(rho*Length*Breadth*Cb); // Draft vessel + body  (m)
        var center_reference = -Draft_system;
        waveForce = numeric.rep([6],0);

        // Inertia
        var m = rho*Length*Breadth*Draft_system*Cb;                             // Vessel Mass                    (kg)
        var I_46 = 0; //Small coupled term, was neglected.
        var I_44 = Math.pow((0.4*Breadth),2)*m;    // Rolling Moment of Inertia      (kgm2) //(1/12)*m*(Math.pow(B,2)+Math.pow(D,2));
        var I_55 = Math.pow((0.28*Length),2)*m;   // Pitching Moment of Inertia     (kgm2) //(1/12)*m*(Math.pow(L,2)+Math.pow(D,2));
        var I_66 = Math.pow((0.28*Length),2)*m;   // Yawing Moment of Inertia       (kgm2) //(1/12)*m*(Math.pow(B,2)+Math.pow(L,2));
        var M_vessel = [[m,0,0,0,m*(KG-(Depth/2)),0],[0,m,0,-m*(KG-(Depth/2)),0,0],[0,0,m,0,0,0],[0,-m*(KG-(Depth/2)),0,I_44,0,0],[m*(KG-(Depth/2)),0,0,0,I_55,0],[0,0,0,0,0,I_66]]; // Vessel's inertia tensor
        var MM = numeric.add(M_vessel,LL);                 //Rigid body inertia tensor w.r.t vessel origin, excluding added mass.
        m_system = MM[0][0];                           //System's total mass
        RG_system = [MM[5][1]/m,MM[3][2]/m,MM[4][0]/m]; // System's centre of gravity
        // console.log(RG_system);

        // Initial Stability
        var Delta = m*g;                // Vessel Displacement                   (N)
        var A_WP = Length*Breadth;                             // Still Water Plane Area                (m2)
        var KB = Draft/2;                            // Centre of Buoyancy Height             (m)
        var C_33 = rho*g*A_WP;                      // Heave Restoring Coeff.                (N/m)
        // var C_44a = Delta*(KB-KG);                  // First Part of Roll Restoring Coeff.   (Nm)
        var C_44a = Delta*(KB-(RG_system[2]+Draft/2));  // First Part of Roll Restoring Coeff.   (Nm) //KG calcluated after calculating masses @ferrari212
        var C_44b = (1/12)*rho*g*Math.pow(Breadth,3)*Length;   // Second Part of Roll Restoring Coeff.  (Nm)
        var C_44 = C_44a+C_44b;                     // Total Roll Restoring Coeff.           (Nm)
        // var C_55a = Delta*(KB-KG);                  // First Part of Pitch Restoring Coeff.  (Nm)
        var C_55a = Delta*(KB-(RG_system[2]+Draft/2));  // First Part of Pitch Restoring Coeff.  (Nm) //KG calcluated after calculating masses @ferrari212
        var C_55b = (1/12)*rho*g*Math.pow(Length,3)*Breadth;   // Second Part of Pitch Restoring Coeff. (Nm)
        var C_55 = C_55a+C_55b;                     // Total Pitch Restoring Coeff.          (Nm)
        var C_35 = 0;                               // Heave-Pitch Coupled Restoring Coeff.  (N)  // aproximmation to zero is valid if the water plane is symmetrical in relation to the mid section
        var C_53 = 0;                               // Pitch-Heave Coupled Restoring Coeff.  (N)  // aproximmation to zero is valid if the water plane is symmetrical in relation to the mid section

        // Damping
        var B_22 = rho*Length*Draft*userParameters.C_D;            // Linear Sway Dampig Coeff.             (kg/s)
        var B_33 = rho*A_WP*userParameters.C_D;                    // Linear Heave Dampig Coeff.            (kg/s)

        var ADD_mass = numeric.rep([6,6],0);           // Vessel's added mass
        AA = numeric.add(MM,ADD_mass);                 // System's total inertia tensor

        //Dynamic Equations
        BB = [[0,0,0,0,0,0],[0,B_22,0,0,0,0],[0,0,B_33,0,0,0],[0,0,0,userParameters.B_44,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];   // Damping Matrix
        CC = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,C_33,0,-C_35,0],[0,0,0,C_44,0,0],[0,0,C_53,0,C_55,0],[0,0,0,0,0,0]];      // Restoring Matrix

        // Solver
        // dy(1:6)  = World fixed velocity
        // dy(7:12) = Body fixed acceleration
        // dy(13:15)= Euler angle rate

        // y(1:6)   = World fixed motion
        // y(7:12)  = Body fixed velocity
        // y(13:15) = Euler angle

        // J1 = Body 2 world Jacobian
        // J2 = Body 2 Euler angle rate Jacobian

        var y = [ship3D.surge, ship3D.sway, ship3D.heave + ship3D.position.z, ship3D.roll, ship3D.pitch, ship3D.yaw, Ini.VSurge, Ini.VSway, Ini.VHeave, Ini.VRoll, Ini.VPitch, Ini.VYaw, Ini.EX,Ini.EY, Ini.EZ];


        sol = numeric.dopri(0, dt, y, RugenKuttaSolver, 1e-8,10000).at(dt);

        // Equalizing the solution
        ship3D.surge = sol[0];
        ship3D.sway = sol[1];
        ship3D.heave = sol[2] - ship3D.position.z;
        ship3D.roll = sol[3];
        ship3D.pitch = sol[4];
        ship3D.yaw = sol[5];
        Ini.VSurge = sol[6];
        Ini.VSway = sol[7];
        Ini.VHeave = sol[8];
        Ini.VRoll = sol[9];
        Ini.VPitch = sol[10];
        Ini.VYaw = sol[11];
        Ini.EX = sol[12];
        Ini.EY = sol[13];
        Ini.EZ = sol[14];

      };
