// ./section-2-6/index.html@361
function _1(md){return(
md`
# Section 2.6 - Creating a GLTF realistic model

A good practice for a realistic model is using the GLTF format. To introduce the model it will be used the snippets that allows the introduction of GLTF model **[1]** in the THEE.js library:

`
)}

function _loaderGLTF(THREE){return(
new THREE.GLTFLoader()
)}

function _3(md){return(
md`
The GLTF model is going to be imported from a external source as showed in defined in [<code>boatPath</code>](https://github.com/ferrari212/vesseljs/blob/master/examples/3D_models/GLTF/Gunnerus.glb):
`
)}

function _boatPath(){return(
"https://ferrari212.github.io/vesseljs/examples/3D_models/GLTF/Gunnerus.glb"
)}

function _5(md){return(
md`
The following code is responsible for inserting the defined path into the scene:
`
)}

function _6(loaderGLTF,boatPath,THREE,scene,$0)
{
  loaderGLTF.load(
    boatPath,
    (gltf) => {
      var shipGLTF = gltf.scene;
      shipGLTF.rotation.x = Math.PI / 2;
      shipGLTF.rotation.y = -Math.PI / 2;
      shipGLTF.position.set(-1, 0, 0);
      shipGLTF.name = "ModelGLTF";

      if (shipGLTF.material) {
        shipGLTF.material.side = THREE.DoubleSide;
      }

      scene.add(shipGLTF);
    },
    (xhr) => {
      $0.value = (xhr.loaded / 31780028) * 100;
    }
  );
}


function _7(md,loaderPecentage){return(
md`##  *The 3D model is* <span style="color:rgb(13, 18, 125)"> ${loaderPecentage | 0} % </span> *loaded*`
)}

function _8(html,loaderPecentage){return(
html`
<svg width="800" height="50">
  <rect x="0" y="0" width="1000" height ="50" fill="grey" />
  <rect x="0" y="0" width="${loaderPecentage*8}" height ="50" fill="rgb(13, 18, 125)" />
<svg>
`
)}

function* _9(THREE,scene,width,invalidation)
{
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;
  
  scene.background = new THREE.Color(0xA9CCE3);
  
  const height = 600;
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(50, aspect);
  camera.up.set(0, 0, 1);
  scene.add(camera);
  camera.position.set(30, 20, 20);
  
  function onWindowResize() {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onWindowResize);

  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 0, 0);
  controls.update();
  invalidation.then(() => renderer.dispose());
  renderer.setSize(width, height);
  renderer.setPixelRatio(devicePixelRatio);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(1, 1, 1);
  scene.add(ambientLight, mainLight);
  
  var animate = function () {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
	};
  animate();
  yield renderer.domElement;
}


function _10(md){return(
md `
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-2-5/index.html) || <a href="#top">Top</a> || [Next >>](../section-3-1/index.html) </p> 
`
)}

function _11(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _12(md){return(
md`
**[1] GLTFLoader ** – A loader for glTF 2.0 resources. [https://threejs.org/docs/#examples/en/loaders/GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

**[2] Object Visualization ** – Icaro Fonseca [/@icarofonseca/object-visualization](https://observablehq.com/@icarofonseca/object-visualization)

**[3] Loading Bar ** – Leonardo Yu [https://observablehq.com/@c23ly/loading-bar](https://observablehq.com/@c23ly/loading-bar)
`
)}

function _13(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Snippets`
)}

function _loaderPecentage(){return(
0
)}

function _scene(THREE){return(
new THREE.Scene()
)}

function _16(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Libraries`
)}

async function _THREE(require)
{
  const THREE = window.THREE = await require("three@0.99.0/build/three.min.js");
  await require("three@0.99.0/examples/js/controls/OrbitControls.js").catch(() => {});
  await require("three@0.99.0/examples/js/loaders/STLLoader.js").catch(() => {});
  await require("three@0.99.0/examples/js/loaders/GLTFLoader.js").catch(() => {});
  return THREE;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("loaderGLTF")).define("loaderGLTF", ["THREE"], _loaderGLTF);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer("boatPath")).define("boatPath", _boatPath);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["loaderGLTF","boatPath","THREE","scene","mutable loaderPecentage"], _6);
  main.variable(observer()).define(["md","loaderPecentage"], _7);
  main.variable(observer()).define(["html","loaderPecentage"], _8);
  main.variable(observer()).define(["THREE","scene","width","invalidation"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer()).define(["md"], _13);
  main.define("initial loaderPecentage", _loaderPecentage);
  main.variable(observer("mutable loaderPecentage")).define("mutable loaderPecentage", ["Mutable", "initial loaderPecentage"], (M, _) => new M(_));
  main.variable(observer("loaderPecentage")).define("loaderPecentage", ["mutable loaderPecentage"], _ => _.generator);
  main.variable(observer("scene")).define("scene", ["THREE"], _scene);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  return main;
}
