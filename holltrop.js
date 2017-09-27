    var g = 9.81;
    
    var rho = 1025;
    
    var mi = 0.00122;
    
    var plot = [];

ship.holtrop = {
        vs1: [],
        fn: [],
        re: [],
        cf: [],
        rf: [],
        rapp: [],
        m4: [],
        rwa: [],
        rwb: [],
        rwab: [],
        fni: [],
        rw: [],
        rb: [],
        fnt: [],
        c6: [],
        rtr: [],
        ra: [],
        rtotal: [],
        app: [app1,app2],
        area: [area_app1,area_app2],    
};

ship.calculateHoltrop = function() {
    let lwl = this.lwl;

    let app = this.holtrop.app;
};
    
// tf : draft forward
// ta : draft aft
// MidshipCoef

  function Holtrop_calculate(lwl,breadth,tf,ta,lcb,cb,csm,cwl,vs,b,tr,cstern,app1=0,area_app1=0) {
    
         var total_area = 0;
    
         var mult = 0;
        
         var holtrop = {
            lwl: lwl,
             breadth:breadth,
             tf:tf,
             ta,lcb,cb,csm,cwl,vs,b,tr,cstern,
             
            vs1: [],
            fn: [],
            re: [],
            cf: [],
            rf: [],
            rapp: [],
            m4: [],
            rwa: [],
            rwb: [],
            rwab: [],
            fni: [],
            rw: [],
            rb: [],
            fnt: [],
            c6: [],
            rtr: [],
            ra: [],
            rtotal: [],
            app: [app1,app2],
            area: [area_app1,area_app2],
                    
          };
        
        
        holtrop.lwl = parseFloat(document.getElementById("slider_lwl").value);
        document.getElementById("lwl").value = holtrop.lwl;
        
        holtrop.breadth = parseFloat(document.getElementById("slider_breadth").value);
        document.getElementById("breadth").value = holtrop.breadth;
        
        holtrop.tf = parseFloat(document.getElementById("slider_tf").value);
        document.getElementById("tf").value = holtrop.tf;
        
        holtrop.ta = parseFloat(document.getElementById("slider_ta").value);
        document.getElementById("ta").value = holtrop.ta;
        
        holtrop.lcb = parseFloat(document.getElementById("slider_lcb").value);
        document.getElementById("lcb").value = holtrop.lcb;
        
        holtrop.cb = parseFloat(document.getElementById("slider_cb").value);
        document.getElementById("cb").value = holtrop.cb;
        
        holtrop.csm = parseFloat(document.getElementById("slider_csm").value);
        document.getElementById("csm").value= holtrop.csm;
        
        holtrop.cwl = parseFloat(document.getElementById("slider_cwl").value);
        document.getElementById("cwl").value= holtrop.cwl;
        
        holtrop.vs = parseFloat(document.getElementById("slider_vs").value);
        document.getElementById("vs").value= holtrop.vs;
        
        holtrop.b = parseFloat(document.getElementById("slider_b").value);
        document.getElementById("b").value = holtrop.b;
        
        holtrop.tr = parseFloat(document.getElementById("slider_tr").value);
        document.getElementById("tr").value = holtrop.tr;
        
        holtrop.cstern = parseFloat(document.getElementById("slider_cstern").value);
        document.getElementById("cstern").value= holtrop.cstern;
        
        if (document.getElementById("checkbox_app1").checked === true) {
            
            holtrop.app[0] = parseFloat(document.getElementById("slider_app1").value);
            document.getElementById("app1").value = holtrop.app[0];
            
            holtrop.area[0] = parseFloat(document.getElementById("slider_area_app1").value);
            document.getElementById("area_app1").value = holtrop.area[0];
            
        } else {
            
            holtrop.app[0] = 0;
            holtrop.area[0] = 0;
        }
        
        if (document.getElementById("checkbox_app2").checked === true) {
            
            holtrop.app[1] = parseFloat(document.getElementById("slider_app2").value);
            document.getElementById("app2").value = holtrop.app[1];
            
            holtrop.area[1] = parseFloat(document.getElementById("slider_area_app2").value);
            document.getElementById("area_app2").value = holtrop.area[1];
            
        } else {
            
            holtrop.app[1] = 0;
            holtrop.area[1] = 0;
            
        }
        
        if (document.getElementById("checkbox_app3").checked === true) {
            
            holtrop.app[2] = 2.8;
            
            holtrop.area[2] = parseFloat(document.getElementById("slider_area_app3").value);
            document.getElementById("area_app3").value = holtrop.area[2];
            
        } else {
            
            holtrop.app[2] = 0;
            holtrop.area[2] = 0;
            
        }
        
        if (document.getElementById("checkbox_app4").checked === true) {
            
            holtrop.app[3] = 3;
            
            holtrop.area[3] = parseFloat(document.getElementById("slider_area_app4").value);
            document.getElementById("area_app4").value = holtrop.area[3];
            
        } else {
            
            holtrop.app[3] = 0;
            holtrop.area[3] = 0;
            
        }
        
        if (document.getElementById("checkbox_app5").checked === true) {
            
            holtrop.app[4] = parseFloat(document.getElementById("slider_app5").value);
            document.getElementById("app5").value = holtrop.app[4];
            
            holtrop.area[4] = parseFloat(document.getElementById("slider_area_app5").value);
            document.getElementById("area_app5").value = holtrop.area[4];
            
        } else {
            
            holtrop.app[4] = 0;
            holtrop.area[4] = 0;
            
        }
        
        if (document.getElementById("checkbox_app6").checked === true) {
            
            holtrop.app[5] = 3;
            
            holtrop.area[5] = parseFloat(document.getElementById("slider_area_app6").value);
            document.getElementById("area_app6").value = holtrop.area[5];
            
        } else {
            
            holtrop.app[5] = 0;
            holtrop.area[5] = 0;
            
        }
        
        if (document.getElementById("checkbox_app7").checked === true) {
            
            holtrop.app[6] = 2;
            
            holtrop.area[6] = parseFloat(document.getElementById("slider_area_app7").value);
            document.getElementById("area_app7").value = holtrop.area[6];
            
        } else {
            
            holtrop.app[6] = 0;
            holtrop.area[6] = 0;
            
        }
        
        if (document.getElementById("checkbox_app8").checked === true) {
            
            holtrop.app[7] = parseFloat(document.getElementById("slider_app8").value);
            document.getElementById("app8").value = holtrop.app[7];
            
            holtrop.area[7] = parseFloat(document.getElementById("slider_area_app8").value);
            document.getElementById("area_app8").value = holtrop.area[7];
            
        } else {
            
            holtrop.app[7] = 0;
            holtrop.area[7] = 0;
            
        }
        
        if (document.getElementById("checkbox_app9").checked === true) {
            
            holtrop.app[8] = 2.8;
            
            holtrop.area[8] = parseFloat(document.getElementById("slider_area_app9").value);
            document.getElementById("area_app9").value = holtrop.area[8];
            
        } else {
            
            holtrop.app[8] = 0;
            holtrop.area[8] = 0;
            
        }
        
        if (document.getElementById("checkbox_app10").checked === true) {
            
            holtrop.app[9] = 2.7;
            
            holtrop.area[9] = parseFloat(document.getElementById("slider_area_app10").value);
            document.getElementById("area_app10").value = holtrop.area[9];
            
        } else {
            
            holtrop.app[9] = 0;
            holtrop.area[9] = 0;
            
        }
        
        if (document.getElementById("checkbox_app11").checked === true) {
            
            holtrop.app[10] = 1.4;
            
            holtrop.area[10]= parseFloat(document.getElementById("slider_area_app11").value);
            document.getElementById("area_app11").value = holtrop.area[10];
            
        } else {
            
            holtrop.app[10] = 0;
            holtrop.area[10] = 0;
            
        }
        
        for (var i = 0; i < (holtrop.area).length; i++) {
            
            mult  +=  holtrop.app[i]*holtrop.area[i];
            
            total_area +=  holtrop.area[i];
                 
        }
        
        if (total_area !== 0) {
        
            holtrop.k2 = mult/total_area;
            
        } else {
            
            holtrop.k2 = 0;
        }
        
        holtrop.sapp = total_area;

        holtrop.t = (holtrop.ta + holtrop.tf)/2;; // calculate the average draught
        
        holtrop.volume = holtrop.lwl * holtrop.breadth * holtrop.t * holtrop.cb; // calculate the volume of the vessel
        
        holtrop.cp = holtrop.cb/holtrop.csm; // calculate the prismatic coefficient
        
        holtrop.lr = holtrop.lwl * (1 - holtrop.cp + (0.06 * holtrop.cp * (holtrop.lcb/100)/(4 * holtrop.cp - 1))); 
        
        holtrop.hb = holtrop.tf/2;
        
        holtrop.at = 0.95 * (holtrop.ta - holtrop.ta * 0.9225) * holtrop.breadth * 0.89 * holtrop.tr; // calculate the transom stern area
        
        holtrop.abt = Math.PI * Math.pow(holtrop.tf/2, 2) * holtrop.b/7.7; // calculate the bulbous area
    
        if (holtrop.breadth/holtrop.lwl < 0.11){
                
            holtrop.c7 = 0.229577 * Math.pow(holtrop.breadth/holtrop.lwl, 0.33333);
                
        } else if (holtrop.breadth/holtrop.lwl < 0.25) {
                
            holtrop.c7 = holtrop.breadth/holtrop.lwl;
                
        } else {
                
            holtrop.c7 = 0.5 - 0.0625 * holtrop.lwl/holtrop.breadth;
                
        }
        
        holtrop.ie = 1 + 89 * Math.exp(-Math.pow(holtrop.lwl/holtrop.breadth, 0.80856) * Math.pow(1 - holtrop.cwl, 0.30484) * Math.pow(1 - holtrop.cp - 0.0225 * (holtrop.lcb/100), 0.6367) *            Math.pow(holtrop.lr/holtrop.breadth, 0.34574) * Math.pow(100 * (holtrop.volume/Math.pow(holtrop.lwl,3)), 0.16302)); // calculate the half angle of entrance
        
        holtrop.c1 = 2223105 * Math.pow(holtrop.c7, 3.78613) * Math.pow(holtrop.t/holtrop.breadth, 1.07961) * Math.pow(90 - holtrop.ie, -1.37565);
        
        holtrop.c3 = 0.56 * (Math.pow(holtrop.abt, 1.5))/(holtrop.breadth * holtrop.t * (0.31 * Math.pow(holtrop.abt, 0.5) + holtrop.tf - holtrop.hb));
        
        holtrop.c2 = Math.exp(-1.89 * Math.pow(holtrop.c3, 0.5));
        
        if (holtrop.tf/holtrop.lwl > 0.04) {
            
            holtrop.c4 = 0.04;
            
        } else {
            
            holtrop.c4 = holtrop.tf/holtrop.lwl;
        }
        
        holtrop.c5 = 1 - (0.8 * holtrop.at)/(holtrop.breadth * holtrop.t * holtrop.csm);
        
        if (holtrop.cstern === 1) {
            
            holtrop.c14 = 1 + 0.011 * (-25);
            
        } else if (holtrop.cstern === 2) {
            
            holtrop.c14 = 1 + 0.011 * (-10);
            
        } else if (holtrop.cstern === 3) {
            
            holtrop.c14 = 1 + 0.011 * (0);
            
        } else {
            
            holtrop.c14 = 1 + 0.011 * 10;
            
        }
        
        if (Math.pow(holtrop.lwl, 3)/holtrop.volume < 512) {
            
            holtrop.c15 = -1.69385;
            
        } else if(Math.pow(holtrop.lwl, 3)/holtrop.volume < 1726.91) {
            
            holtrop.c15 = -1.69385 + (holtrop.lwl/Math.pow(holtrop.volume, 1/3) - 8)/2.36;
            
        } else {
            
            holtrop.c15 = 0;
            
        }
        
        if (holtrop.cp < 0.8) {
            
            holtrop.c16 = 8.07981 * holtrop.cp - 13.8673 * Math.pow(holtrop.cp, 2) + 6.984388 * Math.pow(holtrop.cp, 3);
            
        } else {
            
            holtrop.c16 = 1.73014 - 0.7067*holtrop.cp;
            
        }
        
        holtrop.c17 = 6919.3 * Math.pow(holtrop.csm, -1.3346) * Math.pow(holtrop.volume/Math.pow(holtrop.lwl, 3), 2.00977) * Math.pow(holtrop.lwl/holtrop.breadth - 2, 1.40692);
        
        holtrop.ca = 0.006 * Math.pow(holtrop.lwl + 100, -0.16) - 0.00205 + 0.003 * Math.pow(holtrop.lwl/7.5, 0.5) * Math.pow(holtrop.cb, 4) * holtrop.c2 * (0.04 - holtrop.c4); // correlation allowance coefficient
        
        holtrop.wa = holtrop.lwl * (2 * holtrop.t + holtrop.breadth) * Math.pow(holtrop.csm, 0.5) * (0.453 + 0.4425 * holtrop.cb - 0.2862 * holtrop.csm - 0.003467 * (holtrop.breadth/holtrop.t) + 0.3696 * holtrop.cwl) + (2.38 * holtrop.abt)/holtrop.cb; // wetted area
        
        holtrop.m1 = 0.0140407 * (holtrop.lwl/holtrop.t) - 1.75254 * ((Math.pow(holtrop.volume, 1/3))/holtrop.lwl) - 4.79323 *(holtrop.breadth/holtrop.lwl) - holtrop.c16;
        
        holtrop.m3 = -7.2035 * Math.pow (holtrop.breadth/holtrop.lwl, 0.326869) * Math.pow(holtrop.t/holtrop.breadth, 0.605375);
        
        if (holtrop.lwl/holtrop.breadth > 12) {
            
            holtrop.lambda = 1.446 * holtrop.cp - 0.36;
            
        } else {
            
            holtrop.lambda = 1.446 * holtrop.cp - 0.03 * (holtrop.lwl/holtrop.breadth);
            
        }
        
        holtrop.pb = (0.56 * Math.pow(holtrop.abt, 0.5))/(holtrop.tf - 1.5 * holtrop.hb);
        
        holtrop.m4_0_4 = holtrop.c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.4, -3.29));
    
        holtrop.m4_0_55 = holtrop.c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.55, -3.29));
        
        holtrop.rwa_0_4 = holtrop.c1 * holtrop.c2 * holtrop.c5 * holtrop.volume * rho * g * Math.exp(holtrop.m1 * Math.pow(0.4, -0.9) + holtrop.m4_0_4 * Math.cos(holtrop.lambda * Math.pow(0.4, -2)));
        
        holtrop.rwa_0_55 = holtrop.c17 * holtrop.c2 * holtrop.c5 * holtrop.volume * rho * g * Math.exp(holtrop.m3 * Math.pow(0.55, -0.9) + holtrop.m4_0_55 * Math.cos(holtrop.lambda * Math.pow(0.55, -2)));
        
        holtrop.k = 0.93 + (0.487118 * holtrop.c14 * Math.pow(holtrop.breadth/holtrop.lwl, 1.06806) * Math.pow(holtrop.t/holtrop.lwl, 0.46106) * Math.pow(holtrop.lwl/holtrop.lr, 0.121563) * Math.pow(Math.pow(holtrop.lwl, 3)/holtrop.volume, 0.36486) * Math.pow(1 - holtrop.cp, -0.604247)); // form factor
        
        for (var i = 0; i <= 40; i++) { 
            
            holtrop.vs1[i] = 0.514444 * i; // convert the speed from knots to m/s
        
            holtrop.fn[i] = holtrop.vs1[i]/Math.pow(g * holtrop.lwl, 0.5); //Froude number
        
            holtrop.re[i] = rho * holtrop.lwl * holtrop.vs1[i]/mi; // Reynolds number
            
            holtrop.cf[i] = 0.075/Math.pow((Math.log(holtrop.re[i])/Math.log(10)) - 2, 2); // frictional coefficient
        
            holtrop.rf[i] = 0.5 * rho * Math.pow(holtrop.vs1[i], 2) * holtrop.wa * holtrop.cf[i]; // frictional resistance
            
            if (holtrop.at === 0) {
                
                holtrop.fnt[i] = 0;
                
            } else {
                
                holtrop.fnt[i] = holtrop.vs1[i]/(Math.pow((2*g*holtrop.at)/(holtrop.breadth + holtrop.breadth * holtrop.cwl), 0.5));
                
            }
        
            if (holtrop.fnt[i] < 5) {
                
                holtrop.c6[i] = 0.2 * (1 - 0.2 * holtrop.fnt[i]);
                
            } else {
                
                holtrop.c6[i] = 0;
                
            }
            
            holtrop.rtr[i] = 0.5 * rho * Math.pow(holtrop.vs1[i], 2) * holtrop.at * holtrop.c6[i]; // stern resistance
        
            holtrop.rapp[i] = 0.5 * rho * Math.pow(holtrop.vs1[i], 2) * holtrop.sapp * (holtrop.k2) * holtrop.cf[i]; // appendage resistance
            
            if (holtrop.fn[i] === 0) {
                
                holtrop.m4[i] = 0;
                
                holtrop.rwa[i] = 0;
                
                holtrop.rwb[i] = 0;
                
                holtrop.rwab[i] = 0;
                
            } else {
        
                holtrop.m4[i] = holtrop.c15 * 0.4 * Math.exp(-0.034 * Math.pow(holtrop.fn[i], -3.29));
                
                holtrop.rwa[i] = holtrop.c1 * holtrop.c2 * holtrop.c5 * holtrop.volume * rho * g * Math.exp(holtrop.m1 * Math.pow(holtrop.fn[i], -0.9) + holtrop.m4[i] * Math.cos(holtrop.lambda * Math.pow(holtrop.fn[i], -2))); // wave resistance for Froude < 0.4
                
                holtrop.rwb[i] = holtrop.c17 * holtrop.c2 * holtrop.c5 * holtrop.volume * rho * g * Math.exp(holtrop.m3 * Math.pow(holtrop.fn[i], -0.9) + holtrop.m4[i] * Math.cos(holtrop.lambda * Math.pow(holtrop.fn[i], -2))); // wave resistance for Froude > 0.55
                
                holtrop.rwab[i] = holtrop.rwa_0_4 + (10 * holtrop.fn[i] - 4) * (holtrop.rwa_0_55 - holtrop.rwa_0_4)/1.5;
                 
            }
            
            holtrop.fni[i] = holtrop.vs1[i]/Math.sqrt(g * (holtrop.tf - holtrop.hb - 0.25 * Math.pow(holtrop.abt, 0.5)) + (0.15 * Math.pow(holtrop.vs1[i], 2)));
        
            if(holtrop.fn[i] < 0.4) {
                
                holtrop.rw[i] = holtrop.rwa[i];
              
            } else if ((holtrop.fn[i] < 0.55) && (holtrop.fn[i] < 0.55)) {
                
                holtrop.rw[i] = holtrop.rwab[i];
                
            } else {
                
                holtrop.rw[i] = holtrop.rwb[i];
                
            }
        
            if (holtrop.abt === 0) {
                
                holtrop.rb[i] = 0;
                
            } else {
                
                holtrop.rb[i] = (0.11 * Math.exp(-3 * Math.pow(holtrop.pb, -2)) * Math.pow(holtrop.fni[i], 3) * Math.pow(holtrop.abt, 1.5) * rho * g)/(1 + Math.pow(holtrop.fni[i], 2));
                
            }
        
            holtrop.ra[i] = 0.91 * 0.5 * rho * Math.pow(holtrop.vs1[i], 2) * holtrop.wa * holtrop.ca;
        
            holtrop.rtotal[i] = (holtrop.k * holtrop.rf[i] + holtrop.rapp[i] + holtrop.rw[i] + holtrop.rb[i] + holtrop.rtr[i] + holtrop.ra[i])/1000;
            
            plot[i] = [holtrop.fn[i], holtrop.rtotal[i]];
            
            if (i === holtrop.vs) {
                
                $('.results').html("")
                
                $('.total').html((holtrop.rtotal[i]).toFixed(1))
                
                $('.frictional').html((holtrop.rf[i]/1000).toFixed(1))
                
                $('.form').html((holtrop.rf[i]*(holtrop.k -1)/1000).toFixed(1))
                
                $('.appendage').html((holtrop.rapp[i]/1000).toFixed(1))
                
                $('.wave').html((holtrop.rw[i]/1000).toFixed(1))
                
                $('.bulbous').html((holtrop.rb[i]/1000).toFixed(1))
                
                $('.transom').html((holtrop.rtr[i]/1000).toFixed(1))
                
                $('.correlation').html((holtrop.ra[i]/1000).toFixed(1))
                
            }
            
            if ((holtrop.lwl/holtrop.breadth < 3.9) || (holtrop.lwl/holtrop.breadth > 15)) {
                
                $('.results').html('The relation L/B is not being respected. It should be 3.9 < L/B < 15, not' + " " + Math.round(holtrop.lwl/holtrop.breadth * 10)/10 + ".")
                
            }
            
            if ((holtrop.breadth/holtrop.t < 2.1) || (holtrop.breadth/holtrop.t > 4)) {
                
                $('.results').html('The relation B/T is not being respected. It should be 2.1 < B/T < 4, not' + " " + Math.round(holtrop.breadth/holtrop.t * 10)/10 + ".")
                
            }
            
            if ((holtrop.cp < 0.55) || (holtrop.cp > 0.85)) {
                
                $('.results').html('The prismatic coefficient is not being respected. It should be 0.55 < B/T < 0.85, not' + " " + Math.round(holtrop.cp * 100)/100 + ".")
                
            }
       
        }
        
        $.plot("#graphic",[{label: "Total Resistance (KN) x Froude", data: plot }],{series:{lines:{show:true}},yaxis:{ticks:15,tickDecimals:0},grid:{backgroundColor:{colors:["#fff","#eee"]},borderWidth:{top: 1,right: 1,bottom: 2,left: 2}}})
        
        console.log(holtrop.cf[15])
        console.log(holtrop.vs1[15])
        console.log(holtrop.sapp)
        console.log(holtrop.k2)
        
    }
 