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

Smtrx = function(vec3){
    var m = [[0,-vec3[2],vec3[1]],[vec3[2],0,-vec3[0]],[-vec3[1],vec3[0],0]];

    return m;
}
