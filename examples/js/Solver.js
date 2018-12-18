RugenKuttaSolver = function (t,y) {
  var J1 = Euler2J1(y.slice(3,6));
  var J2 = Euler2J2(y.slice(3,6));

  var J11 = numeric.rep([6,6],0);
  for(i = 0;i < 3;i++){
      for(f = 0;f < 3;f++){
          J11[i][f] = J1[i][f];
          J11[3+i][3+f] = J2[i][f];
      }
  }

  var g_components = numeric.dot(Smtrx(numeric.dot(J1,RG_system)),[0,0,g]);
  var gforce = [0,0,m_system*g,m_system*g_components[0],m_system*g_components[1],m_system*g_components[2]];
  var dy = numeric.rep([15],0);   // 6 Positions & 6 Velocities & 3 Euler Angles

  var b_velocities = y.slice(6,12);
  var w_velocities = numeric.dot(J11,b_velocities);
  for(f = 0;f < 6;f++){
      dy[f] = w_velocities[f];
  }

  var linear_Solve = numeric.solve(AA,numeric.add(numeric.dot(numeric.transpose(J11),waveForce),numeric.neg(numeric.dot(Coriolis(MM, ADD_mass,y.slice(6,12)),y.slice(6,12))),numeric.neg(numeric.dot(BB,y.slice(6,12))),numeric.neg(numeric.dot(numeric.dot(numeric.transpose(J11),CC),y.slice(0,6))),numeric.neg(numeric.dot(numeric.transpose(J11),gforce))));

  for(f = 6;f < 12;f++){
      dy[f] = linear_Solve[f-6];
  }

  var b_angular_velocities = y.slice(9,12);
  var euler_angle_rate = numeric.dot(J2,b_angular_velocities);
  for(f = 12;f < 15;f++){
      dy[f] = euler_angle_rate[f-12];
  }

  return dy;
}
