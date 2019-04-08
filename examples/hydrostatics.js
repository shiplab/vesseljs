"use strict";

var objectTemplate, myObject, spec, ship, renderer, scene, camera, controls, ship3D, draft, hydro;

spec = {
	"designState": {
		"calculationParameters": {
			"Draft_design": 2
		}
	},
	"structure": {
		"hull": {
			"attributes": {
				"LOA": 20,
				"BOA": 8,
				"Depth": 4
			},
			"halfBreadths": {
				"waterlines": [0, 1],
				"stations": [0, 1],
				"table": [[0, 0], [1, 1]]
			}
		},
		"decks": {},
		"bulkheads": {}
	},
	"baseObjects": [],
	"derivedObjects": []
};

var ship = new Vessel.Ship(spec);

draft = 2;
hydro = ship.structure.hull.calculateAttributesAtDraft(draft);

document.getElementById("hydro").innerHTML = JSON.stringify(hydro, null, 4);

//Ready renderer and scene
(function() {
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0xA9CCE3, 1);

	// get the div that will hold the renderer
	var container = document.getElementById('3d');
	container.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	//Camera and controls:
	camera = new THREE.PerspectiveCamera(50);
	camera.up.set(0, 0, 1);
	scene.add(camera);
	controls = new THREE.OrbitControls(camera, renderer.domElement);

	//Respond to window resize:
	function onResize() {
		renderer.setSize(container.clientWidth, container.clientHeight);
		camera.aspect = container.clientWidth / container.clientHeight;
		camera.updateProjectionMatrix();
	}
	window.addEventListener("resize", onResize);
	onResize(); //Ensure the initial setup is good too

	//Add lights:
	scene.add(new THREE.AmbientLight(0xffffff, 0.3));
	scene.add(function() {
		let sun = new THREE.DirectionalLight(0xffffff, 1);
		sun.position.set(1, 1, 1);
		return sun;
	}());

})();

ship3D = new Ship3D(ship, "stl/");
scene.add(ship3D);

let LOA = ship.structure.hull.attributes.LOA;
camera.position.set(0.7 * LOA, 0.7 * LOA, 0.7 * LOA);
controls.target = new THREE.Vector3(LOA / 2, 0, 0);
controls.update();
animate();

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
