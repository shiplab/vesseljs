// https://observablehq.com/@ferrari212/section-4-1-coordinate-reference-system@263
function _1(md){return(
md`# Section 4.1 - Coordinate Reference System`
)}

async function _2(md,FileAttachment){return(
md`
Before starting into the analysis using Vessel.js library it is essential to figure out the system of references adoption and its particularities. The library is based upon the <a href="https://threejs.org/" target="_blank">Three.js</a> and its contents are structured to allow the application in this library without friction, however, the Three.js uses a Y reference system pointing to the top that is distinct from the pattern adopted in the naval architecture literature. The Figure bellow depicts the difference between those two types of reference.

<figure>
  ${await FileAttachment("reference_system.jpg").image()}
  <figcaption>Image: Reference system comparison </figcaption>
</figure>

In the end, this means there must be held a ninety-degree rotation through the X axis to fit one reference system into the other. To achieve this objective it is used the <a href="https://threejs.org/docs/index.html?q=Object#api/en/core/Object3D.DefaultUp" target="_blank"><code>THREE.Object3D.DefaultUp.set( 0, 0, 1 )</code></a> predefined in Three.js library:

~~~~js
THREE.Object3D.DefaultUp.set( 0, 0, 1 );
var zUpCont = new THREE.Group();
scene.add( zUpCont );
~~~~

To figure out the results from this adoption we applied it in a scene, where a white ball is illuminate by a red light from the top, following transformation described above:
`
)}

function _zUpCont(THREE){return(
new THREE.Group()
)}

function _4(THREE,scene,zUpCont)
{
  THREE.Object3D.DefaultUp.set(0, 0, 1);
  scene.add(zUpCont);
}


function _5(md){return(
md`
Now assume a practical pointing light in the position (0, 0, 10). As expected this light must be casted in the top direction in Vessel.js reference system, since the zUpCont condition was applied. The result can be depicted bellow:
`
)}

function* _6(THREE,zUpCont,scene,invalidation)
{
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // scene.background = new THREE.Color(0xA9CCE3);

  const height = 300;
  const width = 500;
  const aspect = width / height;

  zUpCont.add(new THREE.AxesHelper(5));

  const camera = new THREE.PerspectiveCamera(26, aspect, 1, 10000);
  camera.position.set(10, 60, 15);
  camera.up.set(0, 0, 1);
  scene.add(camera);

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
  // scene.add(ship3D);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true; //default is false
  sphere.receiveShadow = false; //default
  zUpCont.add(sphere);

  var animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
  yield renderer.domElement;
}


function _7(THREE,zUpCont,scene)
{
  const pointLight = new THREE.PointLight(0xff0000, 1, 10000);
  pointLight.position.set(0, 0, 10);
  pointLight.castShadow = true;
  zUpCont.add(pointLight);

  const helperSize = 1;
  const pointLightHelper = new THREE.PointLightHelper(pointLight, helperSize);
  scene.add(pointLightHelper);
}


function _8(md,tex){return(
md`
Eventually third party components adapted to Three.js reference system must be integrated to the library, making necessary the transformation of coordinates bellow: ${tex.block`[x, y, z]_{Three.js} = [x, z , -y]_{Vessel.js}`}  For this purpose it is considered a best practice to use the function <a href="https://github.com/shiplab/vesseljs/blob/d4b598c70fb77e7df7f6605c32fa4503219741a1/build/vessel.js#L91" target="_blank"><code>Vessel.Vectors.rotateTaitBryan()<code/></a>.
`
)}

function _vector(THREE){return(
new THREE.Vector3(0, 20, 100)
)}

function _rotateCoordinates(Vessel,THREE){return(
function(vector) {
  var rotateTaitBryan = Vessel.Vectors.rotateTaitBryan;
  var rotVector = new THREE.Vector3(-Math.PI / 2, 0, 0);

  var newVector = rotateTaitBryan(vector, rotVector);

  return newVector;
}
)}

function _11(rotateCoordinates,vector){return(
rotateCoordinates(vector)
)}

function _12(Vessel){return(
Vessel.Vectors.rotateTaitBryan
)}

function _13(md){return(
md`
<p style="text-align: center;font-size: 25px;"> [<< Previous](../chapter-4/index.html) || <a href="#top">Top</a> || [Next >>](../section-4-2/index.html) </p> 
`
)}

function _14(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _15(md){return(
md`
**[1] Three.js ** – [https://threejs.org/](https://threejs.org/)
`
)}

function _16(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Observation`
)}

function _17(md){return(
md`The rotateTaitBryan was introduced in further versions of vessel.js and is not present in the current v0.1.1`
)}

function _18(Vessel){return(
Object.assign(Vessel.Vectors, {
  rotateTaitBryan: function(v, r) {
    let c, s;

    //Rotate around x axis
    c = Math.cos(r.x);
    s = Math.sin(r.x);
    v = {
      x: v.x,
      y: v.y * c - v.z * s,
      z: v.y * s + v.z * c
    };

    //Then around y axis
    c = Math.cos(r.y);
    s = Math.sin(r.y);
    v = {
      x: v.z * s + v.x * c,
      y: v.y,
      z: v.z * c - v.x * s
    };

    //Then around z axis
    c = Math.cos(r.z);
    s = Math.sin(r.z);
    v = {
      x: v.x * c - v.y * s,
      y: v.x * s + v.y * c,
      z: v.z
    };

    return v;
  }
})
)}

function _19(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Snippets`
)}

function _scene(THREE){return(
new THREE.Scene()
)}

function _21(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Libraries`
)}

function _Vessel(require){return(
require('ntnu-vessel@0.1.1/vessel.js').catch(() => window["Vessel"])
)}

async function _THREE(require)
{
  const THREE = (window.THREE = await require("three@0.99.0/build/three.min.js"));
  await require("three@0.99.0/examples/js/controls/OrbitControls.js").catch(
    () => {}
  );
  await require("three@0.99.0/examples/js/loaders/STLLoader.js").catch(
    () => {}
  );
  return THREE;
}


function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["reference_system.jpg", {url: new URL("./files/reference_system.jpeg", import.meta.url), mimeType: "image/jpeg", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md","FileAttachment"], _2);
  main.variable(observer("zUpCont")).define("zUpCont", ["THREE"], _zUpCont);
  main.variable(observer()).define(["THREE","scene","zUpCont"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["THREE","zUpCont","scene","invalidation"], _6);
  main.variable(observer()).define(["THREE","zUpCont","scene"], _7);
  main.variable(observer()).define(["md","tex"], _8);
  main.variable(observer("vector")).define("vector", ["THREE"], _vector);
  main.variable(observer("rotateCoordinates")).define("rotateCoordinates", ["Vessel","THREE"], _rotateCoordinates);
  main.variable(observer()).define(["rotateCoordinates","vector"], _11);
  main.variable(observer()).define(["Vessel"], _12);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer()).define(["md"], _17);
  main.variable(observer()).define(["Vessel"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer("scene")).define("scene", ["THREE"], _scene);
  main.variable(observer()).define(["md"], _21);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
