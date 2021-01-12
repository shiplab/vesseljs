//@ferrari212
// Dependecies: numeric.js

// All the values units are considered in SI
// m: mass (kg)
// I: Inercia Matrix (3x3)
// D: Damping Matrix (3x3)
// yaw: Yaw angle (rad)

class FreeBody {
  constructor(m = 0, I = []) {
    this.M = [[m, 0, 0],
              [0, m, 0],
              [0, 0, m]
            ];
    this.I = I;
  }
}

class ManouvringModel extends FreeBody {
  

  constructor(m, I, D, yaw){
    super(m, I, D)

    var trig = {cos: Math.cos(yaw), sin: Math.sin(yaw)}

    if (D === undefined) {
      console.warn('Model with no defined damping value')
      D = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    }
    
    this.M_RB = numeric.add(this.M, this.I)

    this.R = [[trig.cos, -trig.sin, 0],
              [trig.sin, trig.cos, 0],
              [0, 0, 1]
            ];

    this.INVM = numeric.inv(this.M_RB)
    const INVMD = numeric.dot(this.INVM, D)
     
    this.A = this.parseA(this.R, -this.INVM)
  }

  setForceMatrix = (F) => {
    const INVMF = numeric.dot(this.INVM, F)
    this.B = [[0],
              [0],
              [0],
              INVMF[0],
              INVMF[1],
              INVMF[2]
            ]
  }

  parseA = (R, M) => {
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


  parseB = () => {

  }

    
  

}