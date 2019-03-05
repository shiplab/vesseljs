/*
This script modifies the water shader to take wave parameters as uniforms,
and use them in the vertex shader. It is significantly faster than 
modifying the position array, and looks at least almost the same.
None of the approaches correct the reflections. Tall waves have very 
stretched reflections on them, and there are no self-reflections.

The wave is one-dimensional, but it would be quite easy to add an 
angle parameter. Until then, rotating the ocean is one simple way to 
achieve different wave headings (although that comes with its own
drawbacks).
*/

THREE.ShaderLib['water'].uniforms.waveAmplitude = {type: "f", value: 0.0};
THREE.ShaderLib['water'].uniforms.wavePeriod = {type: "f", value: 0.0};
THREE.ShaderLib['water'].uniforms.waveOffset = {type: "f", value: 0.0};
THREE.ShaderLib['water'].uniforms.waveLength = {type: "f", value: 0.0};
THREE.ShaderLib['water'].vertexShader =
	["#define PI " + PI.toString(),
	"uniform float waveAmplitude;",
	"uniform float wavePeriod;",
	"uniform float waveOffset;",
	"uniform float waveLength;"].join("\n") +
	THREE.ShaderLib['water'].vertexShader.split(
	['{',
		'	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
		'	worldPosition = mirrorCoord.xyz;',
		'	mirrorCoord = textureMatrix * mirrorCoord;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'].join("\n")).join(
		['{',
		'	vec3 modPos = position.xyz;',
		//HERE IS THE WAVE FORMULA:
		'	modPos.z = waveAmplitude*sin(waveOffset+2.0*PI*(time/wavePeriod-(modPos.x+waveOffset)/waveLength));',
		'	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
		'	worldPosition = mirrorCoord.xyz;',
		'	mirrorCoord = textureMatrix * mirrorCoord;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( modPos, 1.0 );',
		'}'].join("\n"));