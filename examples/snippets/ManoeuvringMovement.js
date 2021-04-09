// @ferrari212
// This class requires the numeric.js
class ManoeuvringMovement {
  constructor(manoeuvring) {
    this.mvr = manoeuvring;
    this.getPropResult = manoeuvring.getPropResult;
  }

  setMatrixes (F = [0, 0, 0], yaw = 0) {
		// this.M_RB = numeric.add(this.M, this.I)
    let mvr = this.mvr

	  mvr.INVM = numeric.inv(mvr.M_RB)
  	mvr.INVMD = numeric.dot(numeric.neg(mvr.INVM), mvr.D) 
    
		mvr.R = this.parseR(yaw)
    mvr.A = this.parseA(mvr.R, mvr.INVMD)
    const INVMF = numeric.dot(mvr.INVM, F)
    mvr.B = this.parseB(INVMF)
  }

  parseA (R, M) {
    var A = []

    for (let i = 0; i < 6; i++){
      A.push([0, 0, 0, 0, 0, 0]);
    }

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (j < 3) {
          A[i][j] =  0
        } else {
          A[i][j] = i < 3  ? R[i][j-3] : M[i-3][j-3]
        }        
      }      
    }
    return A
  }

  parseB (INVMF) {
    return [0, 0, 0, INVMF[0], INVMF[1], INVMF[2]]
  }

	parseR (yaw) {
    var trig = {cos: Math.cos(yaw), sin: Math.sin(yaw)}
    return [[trig.cos, -trig.sin, 0], 
            [trig.sin, trig.cos, 0],
            [0, 0, 1]
          ];
  }

  getDerivatives (V = {u: 0, v:0, yaw_dot: 0}) {
    let mvr = this.mvr

    var X = [0,
             0,
             0,
             V.u,
             V.v,
             V.yaw_dot
            ]

    var X_dot = numeric.add(numeric.dot(mvr.A, X), mvr.B)

    return X_dot
  }

	getDisplacements (dt) {
    let self = this;
    let mvr = this.mvr;

    // Parse matrix V
    var X = [0,
						 0,
						 0,
						 mvr.V.u,
						 mvr.V.v,
						 mvr.V.yaw_dot];

		
    let sol = numeric.dopri(0, dt, X, function (t,V) { return self.getDerivatives({u: X[3], v:X[4], yaw_dot: X[5]}) }, 1e-8, 100).at(dt);
        
    // Get global coordinates variation (dx, dy, dyaw)
    // Get local velocity (du, dv, dyaw_dot)
    mvr.DX = {x: sol[0], y: sol[1], yaw: sol[2]}
    mvr.V = {u: sol[3], v: sol[4], yaw_dot: sol[5]}
    mvr.yaw += mvr.DX.yaw
  }
}