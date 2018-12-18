// This formulation is based on the  book Wave-Induced Loads and Ship Motions, LArs Bergdahl
// chapter 6 - motion for smal body approximation

//@ferrari212
function WaveForce(rho, t, a_33) {
  var a = ocean.waves["0"].A; //Amplitude of Movement
  var costh = ocean.waves["0"].costh; //Cos of Wave Directions
  var sinth = ocean.waves["0"].sinth; //Sen of Wave Directions

  // projection of trajectory for calculation of phase difference
  let projMag = ship3D.position.x * costh + ship3D.position.y * sinth; // magnitude of projection

  let omega = wavCre.waveDef.waveFreq; // wave frequencie
  let k = 2*Math.PI/ocean.waves["0"].L; // wave number
  var phase = omega*t-ocean.waves["0"].phi-k*projMag;

  // WARNING:
  if (Breadth > ocean.waves["0"].L/4) {
    console.warn("Small body approximation denied B > Lambda / 4.");
  }
  if (Length/Breadth < 5) {
    console.warn("Selender ship condition denied Length/Breadth < 5.");
  }

  // Heavve Forces Calculations
  var A = 2*Math.sin(Math.pow(omega,2)*Breadth/(2*g))*Math.exp(-Math.pow(omega,2)*Draft/g);
  var alpha = 1; // Speed equals to zero therefore fr is zero
  var b_33 = rho*Math.pow(g*A,2)/(Math.pow(omega*alpha,3));
  if (a) {
    B_33 = b_33*Length;
    B_55 = b_33*Math.pow(Length,3)/12;
  } else {
    B_33 = rho*Length*Breadth*userParameters.C_D;
    B_55 = userParameters.B_55;
  }

  var complex1, complex2, integral;
  complex1 = new numeric.T(rho*g*Breadth - Math.pow(omega,2)*a_33, -omega*b_33);
  complex2 = new numeric.T(Math.cos(omega*t), -Math.sin(omega*t));
  integral = (Math.abs(costh) > 0.01) ? 2*Math.sin(k*(costh)*Length/2)/(k*costh) : Length;

  // Equation (6.39)
  var FW_33 = complex1.mul(complex2).dot(a*Math.exp(-k*Draft)*integral).x;
  // var x = ship3D.position.x;
  // var y = ship3D.position.y;
  // var oCenter = ocean.calculateZ(x,y,t);

  // Roll Forces Calculations
  var ra, rb, rd, r;

  r = Breadth/Draft;

  ra = -3.94*r + 13.69;
  rb = -2.12*r - 1.89;
  rd = 1.16*r - 7.97;

  if (r < 1 || r > 3) {
    console.warn('This B/T ratio is not supported by the method: %f', r);
  }

  // Equation (6.62)
  var b_44 = rho*Draft*Math.pow(Breadth,3)*Math.pow(2*g/Breadth,0.5)*ra*Math.exp(rb*Math.pow(omega,-1.3))*Math.pow(omega,rd);
  if (a) {
    B_44 = b_44*Length*100000;
  } else {
    B_44 = userParameters.B_44;
  }

  // Equation (6.68)
  if (Math.abs(costh) > 0.01) {
    var FW_44 = complex2.dot(a*Math.pow(rho*g*g*b_44/omega, 0.5)*2*sinth*Math.sin(k*costh*Length/2)/(k*costh)).x;
  } else {
    var FW_44 = complex2.dot(a*Math.pow(rho*g*g*b_44/omega, 0.5)*Length*sinth).x;
  }

  // Equation (6.52)
  complex1 = new numeric.T(0, 2*(Math.sin(k*costh*Length/2)-k*costh*Length/2*Math.cos(k*costh*Length/2))/Math.pow(k*costh, 2))
  var complex3 = new numeric.T(-a*Math.exp(-k*Draft)*(rho*g*Breadth-omega*omega*a_33,-a*Math.exp(-k*Draft)*(-omega*b_33)))
  var FW_55 = complex1.mul(complex2).mul(complex3).x;


  FW = [0,0,FW_33,FW_44,FW_55,0];
  return FW;

}
