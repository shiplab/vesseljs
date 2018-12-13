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

Coriolis = function(M,vel){
    var c = numeric.dot(M,vel);
    var C = numeric.rep([6,6],0);
    var Quad2 = Smtrx([c[0],c[1],c[2]]);
    var Quad1 = numeric.rep([3,3],0);
    var Quad3 = Quad2;
    var Quad4 = Smtrx([c[3],c[4],c[5]]);

    for(i = 0;i < 3;i++){
        for(f = 0;f < 3;f++){
            C[i][f] = Quad1[i][f];
            C[i][3+f] = -Quad2[i][f];
            C[3+i][f] = Quad3[i][f];
            C[3+i][3+f] = -Quad4[i][f];
        }
    }

    return C;
}
