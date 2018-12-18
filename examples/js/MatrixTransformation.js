Euler2J1 = function(Eang){
    rx = [[1,0,0],[0,Math.cos(Eang[0]),-Math.sin(Eang[0])],[0,Math.sin(Eang[0]),Math.cos(Eang[0])]];
    ry = [[Math.cos(Eang[1]),0,Math.sin(Eang[1])],[0,1,0],[-Math.sin(Eang[1]),0,Math.cos(Eang[1])]];
    rz = [[Math.cos(Eang[2]),-Math.sin(Eang[2]),0],[Math.sin(Eang[2]),Math.cos(Eang[2]),0],[0,0,1]];
    J1 = numeric.dot(numeric.dot(rz,ry),rx);

    return J1;
}

Euler2J2 = function(Eang){
    J2 = [[1,Math.sin(Eang[0])*Math.tan(Eang[1]), Math.cos(Eang[0])*Math.tan(Eang[1])],[0,Math.cos(Eang[0]),-Math.sin(Eang[0])],[0,Math.sin(Eang[0])/Math.cos(Eang[1]),Math.cos(Eang[0])/Math.cos(Eang[1])]];

    return J2
}

// Returns the skew-symetrical of the matrix
Smtrx = function(vec3){
    var m = [[0,-vec3[2],vec3[1]],[vec3[2],0,-vec3[0]],[-vec3[1],vec3[0],0]];

    return m;
}

// Coriolis = function(M,vel){
Coriolis = function(M, AM, vel){
    var c = numeric.dot(M,vel);
    var C = numeric.rep([6,6],0);
    var CA = numeric.rep([6,6],0);

    // Creanting Inercia Matrix
    var I0 = numeric.diag([M[3][3],M[4][4],M[5][5]]);

    // Calculating Coriolis by Thor Eq. (8)
    var S1 = Smtrx([-m_system*vel[0],-m_system*vel[1],-m_system*vel[2]]);
    var S2 = numeric.dot(Smtrx([m_system*vel[3],m_system*vel[4],m_system*vel[5]]), Smtrx(RG_system));
    var SI = numeric.neg(Smtrx(numeric.dot(I0, [vel[3],vel[4],vel[5]])));

    // Coriolis Added Mass by Thor Eq. (40)
    var SA = numeric.dot(AM, vel);
    var CAQuad2 = Smtrx(SA.slice(0,3));
    var CAQuad1 = numeric.rep([3,3],0);
    var CAQuad3 = CAQuad2;
    var CAQuad4 = Smtrx(SA.slice(3,6));


    for(i = 0;i < 3;i++){
        for(f = 0;f < 3;f++){
            C[i][3+f] = S1[i][f] - S2[i][f];
            C[3+i][f] = S1[i][f] + S2[i][f];
            C[3+i][3+f] = S1[i][f];

            CA[i][f] = CAQuad1[i][f];
            CA[i][3+f] = CAQuad2[i][f];
            CA[3+i][f] = CAQuad3[i][f];
            CA[3+i][3+f] = CAQuad4[i][f];
        }
    }

    // Coriolis Added Mass by Thor Eq. (8)

    // Code used by Tiago:@ferrari212

    // var c = numeric.dot(M,vel);
    // var C = numeric.rep([6,6],0);
    // var Quad2 = Smtrx([c[0],c[1],c[2]]);
    // var Quad1 = numeric.rep([3,3],0);
    // var Quad3 = Quad2;
    // var Quad4 = Smtrx([c[3],c[4],c[5]]);
    //
    // for(i = 0;i < 3;i++){
    //     for(f = 0;f < 3;f++){
    //         C[i][f] = Quad1[i][f];
    //         C[i][3+f] = -Quad2[i][f];
    //         C[3+i][f] = Quad3[i][f];
    //         C[3+i][3+f] = -Quad4[i][f];
    //     }
    // }
    //
    return numeric.add(C, CA);
}
