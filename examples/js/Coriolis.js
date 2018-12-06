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
