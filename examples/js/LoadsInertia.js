LoadsInertia = function(loadList){
    // Collection of necessary loads data for dynamic equation
    var ll = numeric.rep([6,6],0);

    for(n = 0;n < loadList.length;n++){
        var m = loadList[n].inertiaTensor[0][0];
        var mrGx = numeric.rep([3,3],0);
        for(i = 0;i < 3;i++){
            for(f = 0;f < 3;f++){
                mrGx[i][f] = loadList[n].inertiaTensor[3+i][f]*m;
            }
        }

        var RG = numeric.rep([3],0);
        for(i = 0;i < 3;i++){
            RG[i] = loadList[n].position[i];
        }

        var SmtrxRG = numeric.rep([3,3],0);
        SmtrxRG = Smtrx(RG);

        var InertiaTrans = numeric.rep([3,3],0);
        InertiaTrans = numeric.sub(numeric.diag([numeric.dot([RG],numeric.transpose([RG]))[0][0],numeric.dot([RG],numeric.transpose([RG]))[0][0],numeric.dot([RG],numeric.transpose([RG]))[0][0]]),numeric.dot(numeric.transpose([RG]),[RG]));
        // console.log(numeric.diag([numeric.dot([RG],numeric.transpose([RG]))[0][0],numeric.dot([RG],numeric.transpose([RG]))[0][0],numeric.dot([RG],numeric.transpose([RG]))[0][0]]));
        // console.log(numeric.dot(numeric.transpose([RG]),[RG]));
        // console.log(InertiaTrans);
        // console.log(loadList[n].inertiaTensor);
        // console.log(SmtrxRG);
        // console.log(RG);

        for(i = 0;i < 3;i++){
            for(f = 0;f < 3;f++){
                ll[i][f] = ll[i][f] + loadList[n].inertiaTensor[i][f];                                    //First Quad
                ll[3+i][f] = ll[3+i][f] + mrGx[i][f] + m*SmtrxRG[i][f];                                   //Second Quad
                ll[3+i][3+f] = ll[3+i][3+f] + loadList[n].inertiaTensor[3+i][3+f] + InertiaTrans[i][f]*m; //Forth Quad
                ll[i][3+f] = -ll[3+i][f];                                                                 //Third Quad
            }
        }

    }
    return ll;
}
