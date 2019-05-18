// solver of 3D pendulum with moving pivot using Lagrangian equations and Euler angles
// based on http://nbviewer.jupyter.org/url/www.torsteinmyhre.name/snippets/spherical_pendulum/spherical_pendulum_with_moving_pivot_point.ipynb
// the position phi is in the format:
// [phix, phiy, phixdot, phiydot]
// depends on numeric.js

function Pendulum(ship, aFrame, states, wavCre, xLever, yLever, zLever, cableLength, g = 9.81, phiInit = [0, 0, 0, 0]) {
	this.ship = ship;
	this.aFrame = aFrame;
	this.states = states;
	this.wavCre = wavCre;

	this.states.continuous.phi = phiInit;

	this.f = function(t, phi) {
		let xRotAcc = - Math.sign(states.continuous.motion.roll) * states.discrete.WaveMotion.state.rollAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);
		let yRotAcc = - Math.sign(states.continuous.motion.pitch) * states.discrete.WaveMotion.state.pitchAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);
		let zTransAcc = - states.discrete.WaveMotion.state.heaveAmp * Math.pow(wavCre.waveDef.waveFreq, 2) * Math.cos(wavCre.waveDef.waveFreq * t);

		let xdotdot = zLever * yRotAcc;
		let ydotdot = - zLever * xRotAcc;
		let zdotdot = zTransAcc + yLever * xRotAcc - xLever * yRotAcc;

		let phixdotdot = 1 / (cableLength * Math.cos(phi[1])) * (-g * Math.sin(phi[0]) + 2 * cableLength * phi[2] * phi[3] * Math.sin(phi[1]) - ydotdot * Math.cos(phi[0]) - zdotdot * Math.sin(phi[0]));
		let phiydotdot = 1 / cableLength * (-g * Math.sin(phi[1]) * Math.cos(phi[0]) - 0.5 * cableLength * phi[0] ** 2 * Math.sin(2 * phi[1]) + xdotdot * Math.cos(phi[1]) + ydotdot * Math.sin(phi[0]) * Math.sin(phi[1]) - zdotdot * Math.sin(phi[1]) * Math.cos(phi[0]));

		return [phi[2], phi[3], phixdotdot, phiydotdot];
	};

	this.movePendulum = function(tprev, dt) {
		this.states.continuous.phi = numeric.dopri(tprev, tprev + dt, this.states.continuous.phi, this.f).at(tprev + dt);
	};
}
