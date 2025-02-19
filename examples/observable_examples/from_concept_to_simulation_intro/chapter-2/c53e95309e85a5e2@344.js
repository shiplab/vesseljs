// https://observablehq.com/@ferrari212/chapter-2-from-ga-to-blocks@344
function _1(md){return(
md`
# Chapter 2 - From GA to Blocks
# Section 2.1 - Decks and Bulckheads
`
)}

function _2(md){return(
md`The General Arrangement of the ship indicates the position of the items and tanks onboard. With the arrengement of the equipments it is possible to estimate the location of Ship's [Center of Gravity](https://en.wikipedia.org/wiki/Center_of_mass#Center_of_gravity). In this chapter we will introduce the equipments present in the general arrangement in the 3D model inside the ship developted on the [Chapter 1](https://observablehq.com/d/6383409a326255b7?collection=@ferrari212/from-hull-to-simulation). The code bellow shows the object containing the ship information presented so far as defined in the previous chapter.
`
)}

function _Gunnerus(){return(
{
	"attributes": {},
	"designState": {
		"calculationParameters": {
			"LWL_design": "",
			"Draft_design": 2.787,
			"Cb_design": "",
			"speed": "",
			"crew": "",
			"K": "",
			"Co": "",
			"tripDuration": ""
		},
		"objectOverrides": {
			"common": {
				"fullness": ""
			}
		}
	},
    "data":{
    },
	"structure": {
		"hull": {
			"attributes": {
				"LOA": 36.25,
				"BOA": 9.6,
				"Depth": 6.6,
				"APP": 2,
				"bulb": true,
				"transom": true,
				"cstern": 0,
				"prismaticLengthRatio": 0.6,
				"appendices": {}
			},
			"halfBreadths": {
				"waterlines": [0,	0.075757576,	0.151515152,	0.227272727,	0.303030303,	0.378787879,	0.454545455,	0.53030303,	0.606060606,	0.681818182,	0.757575758,	0.833333333,	0.909090909,	0.984848485,	1.060606061,	1.136363636],
				"stations": [0,0.016,0.032,0.048,0.064,0.08,0.096,0.112,0.128,0.144,0.16,0.176,0.192,0.208,0.224,0.24,0.256,0.272,0.288,0.304,0.32,0.336,0.352,0.368,0.384,0.4,0.416,0.432,0.448,0.464,0.48,0.496,0.512,0.528,0.544,0.56,0.576,0.592,0.608,0.624,0.64,0.656,0.672,0.688,0.704,0.72,0.736,0.752,0.768,0.784,0.8,0.816,0.832,0.848,0.864,0.88,0.896,0.912,0.928,0.944,0.96,0.976,0.992,1],
 				"table": [
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0.023706,0.04164,0.03956054,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.071654682,0.218163956,0.347109355,0.707410528,0.7101572,0.714521886,0.724138946,0.749662831,0.771743418,0.78068812,0.777351611,0.760040588,0.734964599,0.707735189,0.67881251,0.649277089,0.619130809,0.588445384,0.557293752,0.525670827,0.493631236,0.461239013,0.428710429,0.396118672,0.36353124,0.331272913,0.29936175,0.267774887,0.236499989,0.205527382,0.174631462,0.143735542,0.112839584,0.082193712,0.05487704,0.035077082,0.017589529,0,0,0,null,null,null,null],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.11384365,0.28021182,0.731167857,0.731746877,0.733344981,0.761914571,0.813147939,0.852579142,0.879895833,0.900087484,0.914681498,0.92643748,0.932025146,0.935672912,0.936216634,0.933764547,0.928441671,0.920420837,0.909739482,0.894997965,0.876045837,0.853289591,0.827195791,0.798289439,0.767083232,0.733856099,0.698899943,0.66232254,0.6244297,0.585758311,0.546243642,0.506078186,0.46566391,0.425637487,0.386155955,0.347200012,0.308764165,0.270830841,0.233397929,0.196477089,0.160454165,0.126395671,0.095160357,0.062479974,0.026483334,0,null,null,null],
					[0,0,0,0,0,0,0,0,0,0.11327781,0.229017497,0.352529385,0.726907379,0.733153683,0.734473511,0.777951228,0.839199655,0.886066097,0.918911876,0.94205339,0.958529154,0.970252075,0.97813029,0.98480835,0.986720886,0.988820801,0.990237529,0.987881165,0.985799968,0.982785339,0.978744609,0.974802669,0.967961121,0.957981974,0.945835368,0.932018738,0.914989624,0.894104207,0.870773824,0.844629517,0.81436259,0.780335897,0.743943736,0.706508331,0.668210297,0.627605692,0.586681264,0.545253652,0.503595835,0.461675008,0.419545822,0.380137227,0.340914586,0.301902084,0.26320811,0.227077077,0.196202088,0.165685272,0.135260417,0.099252084,0.034576791,0,null,null],
					[0.14752927,0.195454496,0.252279943,0.315177918,0.380875676,0.453470815,0.617983921,0.652319055,0.685022602,0.755220845,0.814679074,0.864853715,0.904683419,0.933976734,0.955608678,0.971806987,0.983565004,0.991776358,0.996810839,0.999454025,1,1,1,1,1,1,1,1,1,0.999147848,0.996595208,0.994104207,0.987329,0.979657491,0.97008667,0.958017375,0.943480021,0.9264328,0.9066745,0.883690491,0.857092692,0.82629715,0.791246643,0.752603963,0.711764526,0.669355469,0.626193848,0.582815806,0.53950826,0.496612142,0.454332225,0.412979101,0.372598241,0.332724024,0.293440323,0.256938756,0.22273585,0.192366084,0.163749835,0.131338641,0.075224109,0,null,null],
					[0.71273652,0.750030161,0.785739492,0.820259247,0.853601583,0.884948356,0.911901164,0.934555335,0.953122646,0.968269338,0.980177623,0.989221129,0.995597117,0.999145458,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.000228327,0.999831136,0.996996663,0.991083171,0.983481242,0.974163818,0.962508952,0.948075765,0.93017568,0.908572693,0.88319224,0.854268494,0.821813507,0.785829519,0.74630839,0.70333669,0.657443237,0.610306346,0.562759501,0.51533193,0.468369497,0.422251841,0.377271449,0.333293279,0.290521571,0.25025678,0.212261035,0.176019681,0.143433533,0.111947466,0.036266209,0,null,null],
					[0.952335345,0.962861851,0.972258259,0.98050379,0.987472892,0.992967483,0.996992105,0.999437767,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.000711812,1.000223814,1.00008331,0.998717143,0.994425964,0.987480367,0.977858785,0.965194397,0.949268189,0.930027669,0.907345683,0.881151021,0.851564891,0.818550568,0.782004293,0.74175115,0.697687225,0.650243429,0.60079071,0.549806112,0.497353109,0.443579,0.388505936,0.332285614,0.275121256,0.217052256,0.158101082,0.098297354,0.03763231,0,0,0,null,null],
					[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.000978704,1.000123929,1.000433223,1.000155476,0.999416911,0.995501404,0.988170878,0.977699076,0.964266358,0.948126119,0.929550883,0.908355306,0.883601888,0.854754435,0.822345988,0.78675532,0.747661845,0.704622091,0.657655182,0.607425537,0.553840688,0.494980367,0.430992991,0.362582372,0.286795248,0.1978427,0.094251874,0,0,0,0,0,null,null],
					[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1.001068035,1,1.000566031,1.00039981,1.000281179,0.99947703,0.995137939,0.987093404,0.976328634,0.963292135,0.948348999,0.931424764,0.911436564,0.887533163,0.860225016,0.830331319,0.797312826,0.759774933,0.717407786,0.670107066,0.618719839,0.563078613,0.499293365,0.426550725,0.345286535,0.254695028,0.152289454,0.017480884,0,0,0,0,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,0.999729513,0.996414083,0.989560649,0.97963918,0.966896769,0.951602071,0.934263814,0.91490153,0.893087565,0.868295797,0.839980214,0.807522888,0.770669708,0.729325714,0.683190002,0.631342366,0.572309723,0.503807678,0.424613749,0.34130806,0.251240946,0.145490374,0,0,0,0,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,0.999925334,0.997950745,0.992567851,0.983164063,0.969894918,0.955087891,0.938956604,0.92146698,0.900858866,0.876678263,0.849934998,0.818909353,0.78348053,0.742989451,0.696685028,0.64331131,0.580691935,0.509305827,0.431949565,0.348958842,0.256609065,0.147383639,0,0,0,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,0.999998322,0.998716489,0.993788889,0.984393858,0.972777127,0.960075558,0.94547464,0.928713592,0.909181324,0.887171689,0.861867913,0.832409779,0.797523504,0.757344436,0.710841863,0.656110741,0.593423712,0.522404885,0.445499657,0.359952898,0.262699446,0.140437139,0,0,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,0.999140523,0.994668884,0.98718811,0.978343506,0.967970174,0.954970703,0.939435832,0.92151418,0.901042074,0.876890157,0.848287506,0.813690542,0.773740489,0.727496134,0.673696035,0.610398814,0.53985021,0.460823301,0.369907043,0.261237583,0.110538737,0,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,0.999762066,0.997236826,0.99215781,0.985214537,0.976632629,0.966251998,0.953367201,0.93740136,0.917841809,0.894117416,0.865701622,0.83209896,0.792797394,0.747250891,0.693787412,0.631141856,0.558409942,0.474917611,0.377272279,0.256452988,0.050848489,null,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.999215596,0.996047872,0.991702983,0.986147868,0.978149109,0.967190552,0.952952576,0.934723714,0.912378031,0.885308228,0.852728526,0.814278564,0.770332743,0.716678162,0.652663829,0.578919932,0.492081858,0.388540567,0.252610601,0,null],
					[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.998391724,0.995362549,0.990088603,0.981777242,0.969780375,0.953738403,0.933355306,0.907830099,0.876827698,0.839707743,0.795846507,0.743832143,0.682505239,0.609659933,0.520594126,0.407894109,0.251062353,0]
				]
			},
			"style": {
				"upperColor": "pink",
				"lowerColor": "grey",
				"opacity": 0.6
			},
			"buttockHeights": {}
		},
		"decks": {
      "Deck_1": {
				"zFloor": 3,
				"thickness": 0.01,
				"xAft": 0,
				"xFwd": 20,
				"yCentre": 0,
				"breadth": 8,
				"density": 7850
			}
		},
		"bulkheads": {
		}
	},
	"baseObjects": [],

	"derivedObjects": []

}
)}

function _4(md){return(
md `

The elements that are going to be inserted in this section will be:

* <a href="https://en.wikipedia.org/wiki/Deck_(ship)">Deck</a>
* <a href="https://en.wikipedia.org/wiki/Bulkhead_(partition)">Bulkhead</a>

The information regarding those elements are presented in <code>Gunnerus.structure.decks</code> and <code>Gunnerus.structure.bulkheads</code>. The location of those elements are represented in the drawing profile bellow:

<img src="https://raw.githubusercontent.com/ferrari212/Ship-Design/master/Figures/PA_Bulkheads.png" alt="drawing" width="150%"/>
`
)}

function _5(md){return(
md `
The following table represents the decks informations:

| Object |      Function      | unit |
|:----:|:-------------:|:-------------:|
| <code>zfloor</code> | Vertical distance from the base line | m |
| <code>thickness</code> | Plate thickness | m |
| <code>xAft</code> | Horizontal Beginning | m |
| <code>xFwd</code> | Horizontal End | m |
| <code>yCentre</code> | Transversal Distance from the Base Line | m |
| <code>breadth</code> | Total width | m |
| <code>density</code> | Material Density | kg/m3 |

The following code inserts the information for the A-deck and 1-deck in the object:
`
)}

function _6(Gunnerus){return(
Gunnerus.structure.decks.Deck_A = {
  "zFloor":  6.686,
	"thickness": 0.1,
	"xAft": 15.500,
	"xFwd": 35.600,
	"yCentre": 0,
	"breadth": 9.6,
	"density": 7700
}
)}

function _7(Gunnerus){return(
Gunnerus.structure.decks.Deck_1 = {
  "zFloor":  4.286,
	"thickness": 0.1,
	"xAft": 0,
	"xFwd": 33.680,
	"yCentre": 0,
	"breadth": 9.6,
	"density": 7700
}
)}

function _8(md){return(
md`
The similar process can be used for the bulkheads. The variables necessary in the object will be:

| Object |      Function      | unit |
|:----:|:-------------:|:-------------:|
| <code>xAft</code> | Horizontal Beginning | m |
| <code>thickness</code> | Plate thickness | m |
| <code>density</code> | Material Density | kg/m3 |
`
)}

function _9(Gunnerus){return(
Gunnerus.structure.bulkheads.AB = {
  "xAft": 5,
	"thickness": 0.1,
	"density": 7850
}
)}

function _10(Gunnerus){return(
Gunnerus.structure.bulkheads.GB = {
  "xAft": 17.95,
	"thickness": 0.1,
	"density": 7850
}
)}

function _11(Gunnerus){return(
Gunnerus.structure.bulkheads.B23 = {
  "xAft": 22.00,
	"thickness": 0.1,
	"density": 7850
}
)}

function _12(Gunnerus){return(
Gunnerus.structure.bulkheads.FB = {
  "xAft": 31.5,
	"thickness": 0.1,
	"density": 7850
}
)}

function _13(md){return(
md`Now it is possible to use the Ship function to generate the model as done in [Chapter 1](https://observablehq.com/d/6383409a326255b7?collection=@ferrari212/from-hull-to-simulation):
`
)}

function _ship(Vessel,Gunnerus){return(
new Vessel.Ship(Gunnerus)
)}

function _ship3D(Ship3D,ship){return(
new Ship3D(ship, 1, 1, 1)
)}

function* _16(THREE,width,ship,invalidation,ship3D)
{
  const renderer = new THREE.WebGLRenderer({antialias: true});
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xA9CCE3);
  
  const height = 600;
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(50);
  camera.up.set(0, 0, 1);
  scene.add(camera);
  const LOA = ship.structure.hull.attributes.LOA;
  camera.position.set(0.7 * LOA, 0.7 * LOA, 0.7 * LOA);
  
  function onWindowResize() {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onWindowResize);
  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(LOA / 2, 0, 0);
  controls.update();
  invalidation.then(() => renderer.dispose());
  renderer.setSize(width, height);
  renderer.setPixelRatio(devicePixelRatio);
  scene.add(ship3D);
  
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


function _17(md){return(
md `
<p style="text-align: center;font-size: 25px;"> [<< Previous](../chapter-2/index.html) || <a href="#top">Top</a> || [Next >>](../section-2-2/index.html) </p> 
`
)}

function _18(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _19(md){return(
md `
**[1] Structure Definition ** – 
Icaro Fonseca [/@icarofonseca/hull-definition-and-hydrostatics](https://observablehq.com/@icarofonseca/hull-definition-and-hydrostatics)
`
)}

function _20(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Snippets`
)}

function _Ship3D(THREE,Vessel)
{
  //@EliasHasle

  /*
THREE.js Object3D constructed from Vessel.js Ship object.

There are some serious limitations to this:
1. null values encountered are assumed to be either at the top or bottom of the given station.
2. The end caps and bulkheads are sometimes corrected with zeros where they should perhaps have been clipped because of null values.
*/

  //var hMat; //global for debugging

  function Ship3D(ship, stlPath, deckOpacity = 0.2, objectOpacity = 0.5) {
    THREE.Group.call(this);

    this.ship = ship;

    this.normalizer = new THREE.Group();
    this.fluctCont = new THREE.Group();
    this.fluctCont.rotation.order = "ZYX"; //right?
    this.cmContainer = new THREE.Group();
    this.fluctCont.add(this.cmContainer);
    this.normalizer.add(this.fluctCont);
    this.add(this.normalizer);
    let hull = ship.structure.hull;

    let LOA = hull.attributes.LOA;
    let BOA = hull.attributes.BOA;
    let Depth = hull.attributes.Depth;

    //console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);

    this.position.z = -ship.designState.calculationParameters.Draft_design;

    //Hull
    let stations = hull.halfBreadths.stations;
    let waterlines = hull.halfBreadths.waterlines;
    let table = hull.halfBreadths.table;
    //None of these are changed during correction of the geometry.

    console.log(stations);
    console.log(waterlines);
    console.log(table);

    let N = stations.length;
    let M = waterlines.length;
    //Hull side, in principle Y offsets on an XZ plane:
    //Even though a plane geometry is usually defined in terms of Z offsets on an XY plane, the order of the coordinates for each vertex is not so important. What is important is to get the topology right. This is ensured by working with the right order of the vertices.
    let hGeom = new THREE.PlaneBufferGeometry(
      undefined,
      undefined,
      N - 1,
      M - 1
    );
    let pos = hGeom.getAttribute("position");
    let pa = pos.array;

    //loop1:
    //zs
    let c = 0;
    //Iterate over waterlines
    for (let j = 0; j < M; j++) {
      //loop2:
      //xs
      //iterate over stations
      for (let i = 0; i < N; i++) {
        //if (table[j][i] === null) continue;// loop1;
        pa[c] = stations[i]; //x
        //DEBUG, OK. No attempts to read outside of table
        /*if(typeof table[j] === "undefined") console.error("table[%d] is undefined", j);
			else if (typeof table[j][i] === "undefined") console.error("table[%d][%d] is undefined", j, i);*/
        //y
        pa[c + 1] = table[j][i]; //y
        pa[c + 2] = waterlines[j]; //z
        c += 3;
      }
    }
    //console.error("c-pa.length = %d", c-pa.length); //OK, sets all cells

    //Get rid of nulls by merging their points with the closest non-null point in the same station:
    /*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
    let uv = hGeom.getAttribute("uv");
    let uva = uv.array;
    //Iterate over stations
    for (let i = 0; i < N; i++) {
      let firstNumberJ;
      let lastNumberJ;
      //Iterate over waterlines
      let j;
      for (j = 0; j < M; j++) {
        let y = table[j][i];
        //If this condition is satisfied (number found),
        //the loop will be quitted
        //after the extra logic below:
        if (y !== null) {
          firstNumberJ = j;
          lastNumberJ = j;
          //copy vector for i,j to positions for all null cells below:
          let c = firstNumberJ * N + i;
          let x = pa[3 * c];
          let y = pa[3 * c + 1];
          let z = pa[3 * c + 2];
          let d = c;
          while (firstNumberJ > 0) {
            firstNumberJ--;
            d -= N;
            pa[3 * d] = x;
            pa[3 * d + 1] = y;
            pa[3 * d + 2] = z;
            uva[2 * d] = uva[2 * c];
            uva[2 * d + 1] = uva[2 * c + 1];
          }
          break;
        }
        console.log("null encountered.");
      }

      //Continue up the hull (with same j counter), searching for upper number. This does not account for the existence of numbers above the first null encountered.
      for (; j < M; j++) {
        let y = table[j][i];
        if (y === null) {
          console.log("null encountered.");
          break;
        }
        //else not null:
        lastNumberJ = j;
      }

      //copy vector for i,j to positions for all null cells above:
      let c = lastNumberJ * N + i;
      let x = pa[3 * c];
      let y = pa[3 * c + 1];
      let z = pa[3 * c + 2];
      let d = c;
      while (lastNumberJ < M - 1) {
        lastNumberJ++;
        d += N;
        pa[3 * d] = x;
        pa[3 * d + 1] = y;
        pa[3 * d + 2] = z;
        uva[2 * d] = uva[2 * c];
        uva[2 * d + 1] = uva[2 * c + 1];
      }
      //////////
    }

    //console.log(pa);

    pos.needsUpdate = true;
    uv.needsUpdate = true;
    hGeom.computeVertexNormals();

    //Bow cap:
    let bowPlaneOffsets = hull.getStation(LOA).map(str => str / (0.5 * BOA)); //normalized
    let bowCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
    pos = bowCapG.getAttribute("position");
    pa = pos.array;
    //constant x-offset yz plane
    for (let j = 0; j < M; j++) {
      pa[3 * (2 * j)] = 1;
      pa[3 * (2 * j) + 1] = bowPlaneOffsets[j];
      pa[3 * (2 * j) + 2] = waterlines[j];
      pa[3 * (2 * j + 1)] = 1;
      pa[3 * (2 * j + 1) + 1] = -bowPlaneOffsets[j];
      pa[3 * (2 * j + 1) + 2] = waterlines[j];
    }
    pos.needsUpdate = true;

    //Aft cap:
    let aftPlaneOffsets = hull.getStation(0).map(str => str / (0.5 * BOA)); //normalized
    let aftCapG = new THREE.PlaneBufferGeometry(undefined, undefined, 1, M - 1);
    pos = aftCapG.getAttribute("position");
    pa = pos.array;
    //constant x-offset yz plane
    for (let j = 0; j < M; j++) {
      pa[3 * (2 * j)] = 0;
      pa[3 * (2 * j) + 1] = -aftPlaneOffsets[j];
      pa[3 * (2 * j) + 2] = waterlines[j];
      pa[3 * (2 * j + 1)] = 0;
      pa[3 * (2 * j + 1) + 1] = aftPlaneOffsets[j];
      pa[3 * (2 * j + 1) + 2] = waterlines[j];
    }
    pos.needsUpdate = true;

    //Bottom cap:
    let bottomPlaneOffsets = hull.getWaterline(0).map(hw => hw / (0.5 * BOA)); //normalized
    let bottomCapG = new THREE.PlaneBufferGeometry(
      undefined,
      undefined,
      N - 1,
      1
    );
    pos = bottomCapG.getAttribute("position");
    pa = pos.array;
    //constant z-offset xy plane
    for (let i = 0; i < N; i++) {
      pa[3 * i] = stations[i];
      pa[3 * i + 1] = -bottomPlaneOffsets[i];
      pa[3 * i + 2] = 0;
      pa[3 * (N + i)] = stations[i];
      pa[3 * (N + i) + 1] = bottomPlaneOffsets[i];
      pa[3 * (N + i) + 2] = 0;
    }
    pos.needsUpdate = true;

    //Hull material
    let phong = THREE.ShaderLib.phong;
    let commonDecl =
      "uniform float wlThreshold;uniform vec3 aboveWL; uniform vec3 belowWL;\nvarying vec3 vPos;";
    let hMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        phong.uniforms,
        {
          wlThreshold: new THREE.Uniform(
            ship.designState.calculationParameters.Draft_design / Depth
          ),
          aboveWL: new THREE.Uniform(new THREE.Color(0x33aa33)),
          belowWL: new THREE.Uniform(new THREE.Color(0xaa3333))
        }
      ]),
      vertexShader:
        commonDecl +
        phong.vertexShader
          .replace("main() {", "main() {\nvPos = position.xyz;")
          .replace("#define PHONG", ""),
      fragmentShader:
        commonDecl +
        phong.fragmentShader
          .replace(
            "vec4 diffuseColor = vec4( diffuse, opacity );",
            "vec4 diffuseColor = vec4( (vPos.z>wlThreshold)? aboveWL.rgb : belowWL.rgb, opacity );"
          )
          .replace("#define PHONG", ""),
      side: THREE.DoubleSide,
      lights: true,
      transparent: true
    });
    hMat.uniforms.opacity.value = 0.5;

    let hullGroup = new THREE.Group();
    let port = new THREE.Mesh(hGeom, hMat);
    let starboard = new THREE.Mesh(hGeom, hMat);
    starboard.scale.y = -1;
    hullGroup.add(port, starboard);

    //Caps:
    hullGroup.add(new THREE.Mesh(bowCapG, hMat));
    hullGroup.add(new THREE.Mesh(aftCapG, hMat));
    hullGroup.add(new THREE.Mesh(bottomCapG, hMat));

    hullGroup.scale.set(LOA, 0.5 * BOA, Depth);
    this.hullGroup = hullGroup;
    this.add(hullGroup);

    //DEBUG, to show only hull:
    //return;

    //Decks:
    var decks = new THREE.Group();
    let deckMat = new THREE.MeshPhongMaterial({
      color: 0xcccccc /*this.randomColor()*/,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    //deckGeom.translate(0,0,-0.5);
    let ds = ship.structure.decks;
    let dk = Object.keys(ds);
    let stss = stations.map(st => LOA * st); //use scaled stations for now
    console.log(dk);
    for (let i = 0; i < dk.length; i++) {
      let d = ds[dk[i]]; //deck in ship structure

      //Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
      let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1); //new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
      console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
      let zHigh = d.zFloor;
      let zLow = d.zFloor - d.thickness;
      let wlHigh = hull.getWaterline(zHigh);
      let wlLow = hull.getWaterline(zLow);
      let pos = deckGeom.getAttribute("position");
      let pa = pos.array;
      for (let j = 0; j < stss.length + 1; j++) {
        let x = d.xAft + (j / stss.length) * (d.xFwd - d.xAft);
        let y1 = Vessel.f.linearFromArrays(stss, wlHigh, x);
        let y2 = Vessel.f.linearFromArrays(stss, wlLow, x);
        let y = Math.min(0.5 * d.breadth, y1, y2);
        pa[3 * j] = x;
        pa[3 * j + 1] = y;
        pa[3 * (stss.length + 1) + 3 * j] = x;
        pa[3 * (stss.length + 1) + 3 * j + 1] = -y; //test
      }
      pos.needsUpdate = true;

      //DEBUG
      console.log(
        "d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f",
        d.xFwd,
        d.xAft,
        0.5 * d.breadth
      );
      console.log(pa);

      let deck = new THREE.Mesh(deckGeom, deckMat);
      deck.name = dk[i];
      deck.position.z = d.zFloor;
      //deck.scale.set(d.xFwd-d.xAft, d.breadth, d.thickness);
      //deck.position.set(0.5*(d.xFwd+d.xAft), 0, d.zFloor);
      decks.add(deck);
    }
    this.decks = decks;
    this.add(decks);

    //Bulkheads:
    var bulkheads = new THREE.Group();
    // Individually trimmed geometries like the decks @ferrari212
    let bhMat = new THREE.MeshPhongMaterial({
      color: 0xcccccc /*this.randomColor()*/,
      transparent: true,
      opacity: deckOpacity,
      side: THREE.DoubleSide
    });
    let bhs = ship.structure.bulkheads;
    let maxWl = Math.max(...hull.halfBreadths.waterlines) * Depth;
    //let bhk = Object.keys(bhs);
    //for (let i = 0; i < bhk.length; i++) {
    for (let bhk in bhs) {
      let bh = bhs[bhk]; //bhs[bhk[i]];
      let mat = bhMat;
      let station = hull.getStation(bh.xAft);

      if (bh.style) {
        mat = new THREE.MeshPhongMaterial({
          color:
            typeof bh.style.color !== "undefined" ? bh.style.color : 0xcccccc,
          transparent: true,
          opacity:
            typeof bh.style.opacity !== "undefined"
              ? bh.style.opacity
              : deckOpacity,
          side: THREE.DoubleSide
        });
      }

      let bulkheadGeom = new THREE.PlaneBufferGeometry(
        maxWl,
        BOA,
        station.length - 1,
        1
      );

      let pos = bulkheadGeom.getAttribute("position");
      let pa = pos.array;

      for (let i = 0; i < station.length; i++) {
        // Check height in order to trim the bulkhead in the deck
        if (pa[3 * i] < Depth - maxWl / 2) {
          pa[3 * i + 1] = station[i];
          pa[3 * station.length + 3 * i + 1] = -station[i];
        } else {
          pa[3 * i + 1] = pa[3 * station.length + 3 * i + 1] = 0;
        }
      }
      pos.needsUpdate = true;
      let bulkhead = new THREE.Mesh(bulkheadGeom, mat);

      bulkhead.name = bhk; //[i];

      // The try verification is used to verify if the group affiliation was inserted in the JSON structure,
      // the affiliation must be decided in the future if it will be incorporate into the main structure of the group
      // or if there is a better approach to classify it.
      // @ferrari212
      try {
        bulkhead.group = bh.affiliations.group;
      } catch (error) {
        console.warn('Group tag were introduced to bulkhead object');
        console.warn(error);
      }

      bulkhead.rotation.y = -Math.PI / 2;
      bulkhead.position.set(bh.xAft, 0, maxWl / 2);
      bulkheads.add(bulkhead);
    }
    this.bulkheads = bulkheads;
    this.cmContainer.add(bulkheads);

    //Objects

    this.materials = {};
    this.stlPath = stlPath;
    let stlManager = new THREE.LoadingManager();
    this.stlLoader = new THREE.STLLoader(stlManager);
    /*stlManager.onLoad = function() {
		createGUI(materials, deckMat);
	}*/

    this.blocks = new THREE.Group();
    this.add(this.blocks);

    //Default placeholder geometry
    this.boxGeom = new THREE.BoxBufferGeometry(1, 1, 1);
    this.boxGeom.translate(0, 0, 0.5);

    let objects = Object.values(ship.derivedObjects);
    for (let i = 0; i < objects.length; i++) {
      this.addObject(objects[i]);
    }

    //console.log("Reached end of Ship3D constructor.");
  }
  Ship3D.prototype = Object.create(THREE.Group.prototype);
  Object.assign(Ship3D.prototype, {
    constructor: Ship3D,
    addObject: function(object) {
      let mat;
      let name = this.stripName(object.id);
      if (this.materials[name] !== undefined) {
        mat = this.materials[name];
      } else {
        mat = new THREE.MeshPhongMaterial({
          color: this.randomColor(),
          transparent: true,
          opacity: 0.5
        });
        this.materials[name] = mat;
      }

      let bo = object.baseObject;

      //Position
      let s = this.ship.designState.getObjectState(object);
      let x = s.xCentre;
      let y = s.yCentre;
      let z = s.zBase;

      //Scale
      let d = bo.boxDimensions;

      if (bo.file3D) {
        let self = this;
        this.stlLoader.load(
          this.stlPath + "/" + bo.file3D,
          function onLoad(geometry) {
            //Normalize:
            geometry.computeBoundingBox();
            let b = geometry.boundingBox;
            geometry.translate(-b.min.x, -b.min.y, -b.min.z);
            geometry.scale(
              1 / (b.max.x - b.min.x),
              1 / (b.max.y - b.min.y),
              1 / (b.max.z - b.min.z)
            );
            //Align with the same coordinate system as placeholder blocks:
            geometry.translate(-0.5, -0.5, 0);
            let m = new THREE.Mesh(geometry, mat);
            m.position.set(x, y, z);
            m.scale.set(d.length, d.breadth, d.height);
            self.blocks.add(m);
          },
          undefined,
          function onError() {
            //console.warn("Specified file " + e.File + " not found. Falling back on placeholder.");
            let m = new THREE.Mesh(this.boxGeom, mat);
            m.position.set(x, y, z);
            m.scale.set(d.length, d.breadth, d.height);
            this.blocks.add(m);
          }
        );
      } else {
        //Placeholder:
        let m = new THREE.Mesh(this.boxGeom, mat);
        m.position.set(x, y, z);
        m.scale.set(d.length, d.breadth, d.height);
        this.blocks.add(m);
      }
    },
    //this function is used as a temporary hack to group similar objects by color
    stripName: function(s) {
      s = s.replace(/[0-9]/g, "");
      s = s.trim();
      return s;
    },
    randomColor: function() {
      let r = Math.round(Math.random() * 0xff);
      let g = Math.round(Math.random() * 0xff);
      let b = Math.round(Math.random() * 0xff);
      return (r << 16) | (g << 8) | b;
    }
  });

  return Ship3D;
}


function _22(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Libraries`
)}

function _Vessel(require){return(
require('ntnu-vessel@0.1.1/vessel.js').catch(() => window["Vessel"])
)}

async function _THREE(require)
{
  const THREE = window.THREE = await require("three@0.99.0/build/three.min.js");
  await require("three@0.99.0/examples/js/controls/OrbitControls.js").catch(() => {});
  await require("three@0.99.0/examples/js/loaders/STLLoader.js").catch(() => {});
  return THREE;
}


function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("Gunnerus")).define("Gunnerus", _Gunnerus);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["Gunnerus"], _6);
  main.variable(observer()).define(["Gunnerus"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["Gunnerus"], _9);
  main.variable(observer()).define(["Gunnerus"], _10);
  main.variable(observer()).define(["Gunnerus"], _11);
  main.variable(observer()).define(["Gunnerus"], _12);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer("ship")).define("ship", ["Vessel","Gunnerus"], _ship);
  main.variable(observer("ship3D")).define("ship3D", ["Ship3D","ship"], _ship3D);
  main.variable(observer()).define(["THREE","width","ship","invalidation","ship3D"], _16);
  main.variable(observer()).define(["md"], _17);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer("Ship3D")).define("Ship3D", ["THREE","Vessel"], _Ship3D);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
