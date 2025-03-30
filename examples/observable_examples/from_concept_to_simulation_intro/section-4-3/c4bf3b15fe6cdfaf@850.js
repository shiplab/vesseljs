// https://observablehq.com/@ferrari212/simulation-model-a-brief-method@850
function _1(md){return(
md`# Section 4.3 - A Brief Explanation of Maneuvering Mathematical Model`
)}

function _2(md){return(
md`This section gives an explanation about the maneuvering simulation model as an example of simulation adopted in the Vessel.js library and marks the end of this report as a guide for vessel.js training. As explained in the beginning of this chapter, the simulation differs from the analysis process, such as the one shown in the previews section, by inserting the time as a variant for the performance evaluation.

The maneurvering model was constructed as a joint result from the <a href="https://shiplab.github.io/vesseljs/examples/manoeuvring_UiTModel.html" target="_blank">Maneuvering Visualization</a> project demanded by <a href="https://www.ntnu.edu/" target="_blank">NTNU</a> in the context of "Markom Project: Advanced data Analytics Framework for	Ship Energy Efficiency (ADAF)" together with my Master Thesis propose. Here we are going to explain briefly the model and assumptions as part of this project tutorial. For a more detailed explanation regarding the model itself and its implications read please my <a href="" target="_blank">Master Thesis</a>.

A pratical perception of the maneuvering model can be found in the following examples:
* <a href="https://shiplab.github.io/vesseljs/examples/manoeuvring.html" target="_blank">Manoeuvring Model</a>;
* <a href="https://shiplab.github.io/vesseljs/examples/manoeuvring_UiTModel.html" target="_blank">ADAF Project</a>;
* <a href="https://shiplab.github.io/vesseljs/examples/trondheim.html" target="_blank">Trondhein Scene Model</a>.

`
)}

async function _3(md,FileAttachment,tex){return(
md`
## <span style="color:rgb(13, 18, 125)">Loop Equation

The maneuvering model is dependent of several methods which will result in the displacement of the ship. In summary the code will read the user command, calculate the resistance, take the thrust values according to the propeller series and store the consumption value for just then estimate the ship movement in that period. The loop is sketched by the Figure bellow:

<figure>
  ${await FileAttachment("loop_render@2.png").image()}
  <figcaption>Drawings offered by NTNU, propeller drawing from Kongsberg Website (https://www.kongsberg.com/maritime/products/, accessed in 2021-04-04). </figcaption>
</figure>

The resistance ${tex`R_t`} is calculated accoding to the [[1]](#one), and the propeller thrust and torque are represeneted by the ${tex`K_t`} and ${tex`K_q`}, both previous explained in <a href="../section-4-2/index.html" target="_blank">Section 4.1</a>. The ship moving displacement is calculated by solving the following matricial equation:

${tex.block`\dot{\textbf{X}}_{6 \times 1} = \textbf{A}_{6 \times 6}\textbf{X}_{6 \times 1} + \textbf{B}_{6 \times 1}`}

Where ${tex`\textbf{X}_{6 \times 1} = [\eta~V]^T`} with  ${tex`\eta = [x~y~z]`} and ${tex`V = [u~v~\gamma]`}. The differencials are approximated acording to the Domand Prince method explained in [[2]](#two), using the numeric.js open library for calculation [[3]](#three). This method is similar to the application of Ode45 in matlab software, a method that is well extensivelly applied in industry. The coefficients ${tex`\textbf{A}_{6 \times 6}`} and ${tex`\textbf{B}_{6 \times 1}`} are derived from the second newtowns' law applied to the body.

${tex.block` \textbf{M}.\dot{V}+\textbf{N}(V).V = \textbf{F} `}

The term of  ${tex`\textbf{M}`} represents the inercial term of the rigid body plus the coriolis effect and ${tex`\textbf{N}`} is dependent of the hidrodynamic effects both in the rigid body and in the coriolis:

${tex.block`  \begin{cases}
    \textbf{M} = M_{RB} + M_{A} \\
    \textbf{N}(V) = C_{A}(V) + C_{RB}(V) + D(V)
 \end{cases} `}

The model presented can be approximated under several functions, for a further explanation about the cited equations above please verify [[4]](#four). For vessel.js library the coefficients ${tex`\textbf{A}_{6 \times 6}`} and ${tex`\textbf{B}_{6 \times 1}`} can be provided from the user. In case they are not provided, the library will approximate the coefficients by the method explained in [[5]](#five).

The matrix relate each other by the following expression:

${tex.block` \textbf{A}_{6 \times 6} = 
 \begin{bmatrix}
  \textbf{null}_{3 \times 3} & R(\delta) \\
  \textbf{null}_{3 \times 3} & -\textbf{M}^{-1}\textbf{N}
 \end{bmatrix} `}

${tex.block` \textbf{B}_{6 \times 1} =
 \begin{bmatrix}
  \textbf{null}_{3 \times 1} \\ \textbf{M}^{-1}\textbf{F}
 \end{bmatrix} `}

Where the term ${tex`R(\delta)`} is the coordinate transformation matrix:

${tex.block`R(\delta) = 
 \begin{bmatrix}
  cos(\varphi) & -\sin(\varphi) & 0 \\
  \sin(\varphi) & cos(\varphi) & 0 \\
  0 & 0 & 1
 \end{bmatrix} `}


`
)}

function _4(md){return(
md`
## <span style="color:rgb(13, 18, 125)">Maneuvering Model

To feed the maneuvering model it is requested to pass by this order the ship, states, propeller, power system and then the maneuvering model. The ship and states were well discussed in <a href="https://observablehq.com/@ferrari212/chapter-1" target="_blank">Chapter 1</a> of this report. Here we are going just post the values of the parsed data for Gunnerus:
`
)}

function _Gunnerus(FileAttachment){return(
FileAttachment("gunnerus.json").json()
)}

function _ship(Vessel,Gunnerus){return(
new Vessel.Ship(Gunnerus)
)}

function _shipState(Vessel,ship){return(
new Vessel.ShipState(ship.designState.getSpecification())
)}

function _8(md){return(
md`
Once setted the ship object and the ship state, we introduce the propeller and wave such as decrivred in the <a href="../section-4-2/index.html" target="_blank">Section 4.1</a> and <a href="../section-4-2/index.html" target="_blank">Section 4.2</a>.
`
)}

function _propeller(d3){return(
d3.json(
  "https://raw.githubusercontent.com/shiplab/vesseljs/dev/examples/others/propeller_specifications/wag_4b_0.55a_1.2p.json"
)
)}

function _wave(Vessel){return(
new Vessel.WaveCreator()
)}

function _11(md){return(
md`
It is writen bellow the power plant data structure used in gunnerus. The power plant follows a similar structure for different engines:
~~~~json 
{
	"main": {
		"noSys": 1,
		"etas": 0.99,
		"etag": 0.95,
		"engines": [
			{
				"MCR": 500,
				"rpmSpeed": 239,
				"weight": 1900,
				"a": 8.64,
				"b": -23.76,
				"c": 228.96,
				"polOrder": 2
			},
			{
				"MCR": 500,
				"rpmSpeed": 239,
				"weight": 1900,
				"a": 8.64,
				"b": -23.76,
				"c": 228.96,
				"polOrder": 2
			}
		]
	}
}
~~~~
`
)}

function _powerPlant(FileAttachment){return(
FileAttachment("gunnerus_power_plant.json").json()
)}

function _13(md,tex){return(
md`
The coefficients ${tex`a`}, ${tex`b`} and ${tex`c`} represents the coefficients of the approximation equation for the motor Specific Fuel Consumption (SFOC) in ${tex`[g/kWh]`} according to the engine load percentage. The following graphic represent the present scenario consumption of the system for a equal percentage load in the engines:
`
)}

function _chart(d3,width,height,xAxis,yAxis,xAxisLabel,yAxisLabel,data,line1)
{
  const svg = d3.create("svg").attr("viewBox", [0, 0, (3 * width) / 2, height]);

  const labelsObj = [
    { title: "Rt", color: "steelblue" },
    { title: "Rtadd", color: "green" }
  ];

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

  // Draw the x and y axes labels.
  svg.append('g').call(xAxisLabel('Speed [knots]'));
  svg.append('g').call(yAxisLabel('Resistance [N]'));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line1);

  return svg.node();
}


function _15(md){return(
md`
Finally we must define the maneuvering json object <code>man</code>, which will represent the coefficients regarding the maneuvering model. The following object is an example for the maneuvering model:
~~~~json
{
  "distHel": 15,
  "m": null,
  "I": null,
  "initial_yaw": 0,
  "initial_angle": 0,
  "M": null,
  "N": [[ 0, 0, 0 ],[ 0, 5.5e4, 6.4e4 ],[ 0, 6.4e4, 1.2e7 ]],
  "helRate": 0.5,
  "rudderRate": 5,
  "maxPropRot": 210,
  "maxTorque": 400
}
~~~~

The values of the mass and inercia, represented by <code>m</code> and <code>I</code> are the constants from the rigid body, in case they are not provided they are approximated by the methods used inside the vessel.js, those two coefficients are used to construct the matrix <code>M</code> in case it is not especified. The <code>N</code> represent the hidrodynamic factor and also can be calculated throught pre made formulas in case it is not provided. The table bellow gives a breaf description for each parameter:
`
)}

function _16(html,tex){return(
html`
<table style="width:100%">
  <tr>
    <th>Parameter</th>
    <th>Description</th> 
    <th>Unit</th>
  </tr>
  <tr>
    <td><code>distHel</code></td>
    <td>Longitudinal distance between the propellers <br> and the center of gravity of the ship</td>
    <td>${tex`m`}</td>
  </tr>
  <tr>
    <td><code>m</code></td>
    <td>Ship total mass</td>
    <td>${tex`kg`}</td>
  </tr>
  <tr>
    <td><code>I</code></td>
    <td>Ship total inercia</td>
    <td>${tex`kg \times m^2`}</td>
  </tr>
  <tr>
    <td><code>M</code></td>
    <td>Matrix of masses in ${tex`3 \times 3`}</td>
    <td>${tex`-`}</td>
  </tr>
  <tr>
    <td><code>N</code></td>
    <td>Matrix of damping in ${tex`3 \times 3`}</td>
    <td>${tex`-`}</td>
  </tr>
  <tr>
    <td><code>helRate</code></td>
    <td>Helix rotation rate</td>
    <td>${tex`RPM/s`}</td>
  </tr>
  <tr>
    <td><code>rudderRate</code></td>
    <td>Rudder angle change rate</td>
    <td>${tex`[degree/s]`}</td>
  </tr>
</table>
`
)}

function _man(FileAttachment){return(
FileAttachment("man_sample.json").json()
)}

function _18(md){return(
md`
## <span style="color:rgb(13, 18, 125)">Mounting manoeuvring object

With the models estabilished before hand above, we can mount the maneuvering displacement model in chain by order stated above with the chain model provided bellow:

`
)}

function _19($0,Vessel,ship,shipState,propeller,wave,$1,$2,powerPlant)
{
  $0.value = new Vessel.HullResistance(ship, shipState, propeller, wave);
  $0.value.writeOutput();

  $1.value = new Vessel.PropellerInteraction(
    ship,
    shipState,
    propeller
  );
  $1.value.writeOutput();

  $2.value = new Vessel.FuelConsumption(ship, shipState, powerPlant);
  $2.value.writeOutput();

  
}


function _20($0,Vessel,ship,shipState,hullRes,propellerInteraction,fuelCons,man)
{
  $0.value = new Vessel.Manoeuvring(
    ship,
    shipState,
    hullRes,
    propellerInteraction,
    fuelCons,
    man
  );
}


function _21(md){return(
md`
## <span style="color:rgb(13, 18, 125)">Displacement calculation steps

To maintain the vessel.js without any external library dependecies the <code>ManouverinModel</code> class was created to handle the derivative calculations. The only argument required for the creation of the <code>ManouverinModel</code> is the <code>manoeuvring</code> object and the <a href="https://www.npmjs.com/package/numeric" target="_blank">numeric</a>:
`
)}

function _manoeuvringMovement(ManoeuvringMovement,manoeuvring){return(
new ManoeuvringMovement(manoeuvring)
)}

function _23(md){return(
md`
The user can follow the following steps to calculate the displacement:

- Set the advance speed by using the <code>setSpeed</code> method, passing the velocity in knots:
~~~~js
manoeuvring.setSpeed(manoeuvringMovement.states.V.u * 1.96);
~~~~

`
)}

function _24(manoeuvringMovement){return(
manoeuvringMovement.states.V.u = 1
)}

function _25(manoeuvring,manoeuvringMovement){return(
manoeuvring.setSpeed(manoeuvringMovement.states.V.u)
)}

function _26(md){return(
md`
- Set the cos and sin of the propeller angle in relation to the center line:
~~~~js
// This particular example uses a 45 degree propeller angle
var propellerAngle = Math.PI  / 4;
var cos = Math.cos( propellerAngle );
var sin = Math.sin( propellerAngle );
~~~~
`
)}

function _angle()
{
  let propellerAngle = Math.PI / 4;
  let cos = Math.cos(propellerAngle);
  let sin = Math.sin(propellerAngle);
  return { cos, sin };
}


function _28(md){return(
md`
- Read the propeller rotation state with the <code>.getPropResult</code> method:
~~~~js
var rotationStates = manoeuvring.getPropResult(manoeuvringMovement.states.n);
~~~~
`
)}

function _rotationStates(manoeuvringMovement,manoeuvring)
{
  manoeuvringMovement.states.n = 10;
  var rotationStates = manoeuvring.getPropResult(manoeuvringMovement.states.n);
  return rotationStates;
}


function _30(md,tex){return(
md`
- Mont the <code>forceVector</code> by subtracting the longitudinal resistance and applying the angle transformations:

${tex.block`F = [T \cdot \cos(\theta) - Rt,~ T \cdot \sin (\theta),~ T \cdot \sin(\theta) \cdot distHel]`}

~~~~js
var Rt = manoeuvring.getRes(manoeuvringMovement.states.V.u);

const distHel = manoeuvringMovement.manoeuvring.distHel;

var forceVector = [
    rotationStates.Fp * cos - Rt,
    rotationStates.Fp * sin,
    rotationStates.Fp * sin * distHel
  ];
~~~~
`
)}

function _forceVector(manoeuvring,manoeuvringMovement,rotationStates,angle)
{
  var Rt = manoeuvring.getRes(manoeuvringMovement.states.V.u);

  const distHel = manoeuvringMovement.manoeuvring.distHel;

  var forceVector = [
    rotationStates.Fp * angle.cos - Rt,
    rotationStates.Fp * angle.sin,
    rotationStates.Fp * angle.sin * distHel
  ];

  return forceVector;
}


function _32(md,tex){return(
md`
- Use the method <code>setMatrixes</code> to set internally the ${tex`\textbf{A}_{6 \times 6}`} and ${tex`\textbf{B}_{6 \times 1}`} matrices that requires the <code>forceVector</code> matrix defined above as first argument and the heeling angle, in this example we are using a heeling angle of ${tex`(3 \cdot \pi) / 2`}. Finnally we can get the displacements by using the method <code>getDisplacements</code>, which will pass the variable states. The results will be stored inside the <code>manoeuvringMovement.states.DX</code>:

~~~~js
manoeuvringMovement.setMatrixes(forceVector, Math.PI / 4);
manoeuvringMovement.getDisplacements(manoeuvringMovement.dt);
~~~~
`
)}

function _33(manoeuvringMovement,forceVector)
{
  manoeuvringMovement.setMatrixes(forceVector, Math.PI / 4);
  manoeuvringMovement.getDisplacements(0.1);
  return manoeuvringMovement.states.DX;
}


function _34(md){return(
md`
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-4-2-pt-2/index.html?collection=@ferrari212/from-hull-to-simulation) || <a href="#top">Top</a> ||
`
)}

function _MutablesModel(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Mutables`
)}

function _propellerInteraction()
{
}


function _hullRes()
{
}


function _fuelCons()
{
}


function _manoeuvring()
{
}


function _GraphModels(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Graphics`
)}

function _data(powerPlant)
{
  let result = [];

  function SFOC(l) {
    let totPower = 0;
    let engines = powerPlant.main.engines;

    engines.forEach(engine => {
      totPower += engine.a * l * l + engine.b * l + engine.c;
    });

    return { x: l, y: totPower };
  }

  let l = 0;

  do {
    result.push(SFOC(l));
    l = l + 0.01;
  } while (l <= 1);

  return result;
}


function _line1(d3,x,y){return(
d3
  .line()
  .x(d => x(d.x))
  .y(d => y(d.y))
)}

function _x(d3,data,margin,width){return(
d3
  .scaleLinear()
  .domain(d3.extent(data, d => d.x))
  .range([margin.left, width - margin.right])
)}

function _y(d3,data,height,margin){return(
d3
  .scaleLinear()
  .domain([d3.min(data, d => d3.min([d.y])), d3.max(data, d => d3.max([d.y]))])
  .nice()
  .range([height - margin.bottom, margin.top])
)}

function _xAxis(height,margin,d3,x,width){return(
g =>
  g.attr("transform", `translate(0,${height - margin.bottom})`).call(
    d3
      .axisBottom(x)
      .ticks(width / 50)
      .tickSizeOuter(0)
  )
)}

function _xAxisLabel(height,margin,width){return(
label => g =>
  g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    // Add label
    .append('text')
    .attr('class', 'axis-label')
    .text(label)
    .attr('x', margin.left + (width - margin.left - margin.right) / 2)
    .attr('y', (margin.bottom * 5) / 6)
)}

function _yAxis(margin,d3,y,data){return(
g =>
  g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g =>
      g
        .select(".tick:last-of-type text")
        .clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.z)
    )
    .call(d3.axisLeft(y).tickSizeOuter(0))
)}

function _yAxisLabel(margin,height){return(
label => g =>
  g
    .attr('transform', `translate(${margin.left},0)`)
    // Add label
    .append('text')
    .attr('class', 'axis-label')
    .text(label)
    .attr('transform', 'rotate(-90)')
    .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
    .attr('y', (-margin.left * 3) / 4)
)}

function _margin(){return(
{ top: 20, right: 30, bottom: 50, left: 75 }
)}

function _height(width){return(
width / 2
)}

function _51(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Libraries`
)}

function _ManoeuvringMovement(numeric){return(
class ManoeuvringMovement {
  constructor(manoeuvring) {
    if (typeof numeric !== "function") {
      console.error("Manoeuvring requires the numeric.js library.");
    }

    this.mvr = manoeuvring;
    this.manoeuvring = manoeuvring.manoeuvring;
    this.states = manoeuvring.states;
    this.getPropResult = manoeuvring.getPropResult;
    this.dt = 0;
  }

  // Insert this inside the ship maneuvring function

  setMatrixes(F = [0, 0, 0], yaw = 0) {
    // this.M_RB = numeric.add(this.M, this.I)
    let mvr = this.mvr;
    let h = mvr.hydroCoeff;
    let u = this.states.V.u;

    // In this case the M_A is constant and the value ws left as it is
    const M_A = [[0, 0, 0], [0, -h.Yvacc, -h.Yracc], [0, -h.Yvacc, -h.Nracc]];

    const M = numeric.add(mvr.M_RB, M_A);
    // const M = [[ 1.1e5, 0, 0 ],
    // 					[ 0, 1.1e5, 8.4e4 ],
    // 					[ 0, 8.4e4, 5.8e6 ]]
    mvr.INVM = numeric.inv(M);

    // The value of N is in relation with the damping
    // mvr.INVMN = numeric.dot(numeric.neg(mvr.INVM), mvr.N)
    const { Cl, Cll, Clll } = mvr.dn;

    const N = this.manoeuvring.N || [
      [0, 0, 0],
      [0, -Cl * h.Yvdn, this.manoeuvring.m * u - Cll * h.Yrdn],
      [0, -h.Yvacc * u - Cll * h.Nvdn, -h.Yracc * u - Clll * h.Nrdn]
    ];

    mvr.INVMN = numeric.dot(numeric.neg(mvr.INVM), N);

    mvr.R = this.parseR(yaw);
    mvr.A = this.parseA(mvr.R, mvr.INVMN);
    const INVMF = numeric.dot(mvr.INVM, F);
    mvr.B = this.parseB(INVMF);
  }

  parseA(R, M) {
    var A = [];

    for (let i = 0; i < 6; i++) {
      A.push([0, 0, 0, 0, 0, 0]);
    }

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (j < 3) {
          A[i][j] = 0;
        } else {
          A[i][j] = i < 3 ? R[i][j - 3] : M[i - 3][j - 3];
        }
      }
    }
    return A;
  }

  parseB(INVMF) {
    return [0, 0, 0, INVMF[0], INVMF[1], INVMF[2]];
  }

  parseR(yaw) {
    var trig = { cos: Math.cos(yaw), sin: Math.sin(yaw) };
    return [[trig.cos, -trig.sin, 0], [trig.sin, trig.cos, 0], [0, 0, 1]];
  }

  getDerivatives(V = { u: 0, v: 0, yaw_dot: 0 }) {
    let mvr = this.mvr;

    var X = [0, 0, 0, this.states.V.u, this.states.V.v, this.states.V.yaw_dot];

    var X_dot = numeric.add(numeric.dot(mvr.A, X), mvr.B);

    return X_dot;
  }

  getDisplacements(dt) {
    let self = this;

    // Parse matrix V
    var X = [0, 0, 0, this.states.V.u, this.states.V.v, this.states.V.yaw_dot];

    let sol = numeric
      .dopri(
        0,
        dt,
        X,
        function(t, V) {
          return self.getDerivatives({ u: X[3], v: X[4], yaw_dot: X[5] });
        },
        1e-8,
        100
      )
      .at(dt);

    // Get global coordinates variation (dx, dy, dyaw)
    // Get local velocity (du, dv, dyaw_dot)
    this.states.DX = { x: sol[0], y: sol[1], yaw: sol[2] };
    this.states.V = { u: sol[3], v: sol[4], yaw_dot: sol[5] };
    this.states.yaw += this.states.DX.yaw;
  }
}
)}

function _Vessel(require){return(
require('@ferrari212/ntnu-vessel-dopri').catch(() => window["Vessel"])
)}

function _numeric(require){return(
require('numeric').catch(() => window["numeric"])
)}

function _d3(require){return(
require("d3@5")
)}

function _56(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _one(md){return(
md`**[1] Holtrop, J. ** - 1984 - A statistical re-analysis of resistance and propulsion data, pg. 272–276. `
)}

function _two(md){return(
md`
**[2] On Dormand-Prince Method ** - Toshinori Kimura - September 24,2009 <a href="http://depa.fquim.unam.mx/amyd/archivero/DormandPrince_19856.pdf" target="_blank"> http://depa.fquim.unam.mx/amyd/archivero/DormandPrince_19856.pdf</a>.
`
)}

function _three(md){return(
md`
**[3] Kt, Kq and Efficiency Curves for the Wageningen B-Series Propellers ** - Sébastien Loisel - Open source repository <a href="https://github.com/sloisel/numeric" target="_blank">https://github.com/sloisel/numeric</a>.
`
)}

function _four(md){return(
md`
**[4] Handbook Marine Craft hydrodynamics and motion control ** - Thor I. Fossen - John Wiley & Sons - United Kingdon.
`
)}

function _five(md){return(
md`
**[5] On an Emprirical Prediction of Hydrodynamic Coefficients for Modern Ship Hulls ** - Tae-II Lee and Kyoung-Soo Ahn and Hyoung-Suk Lee and Deuk-Joon Yum - Marsin 03.
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["loop_render@2.png", {url: new URL("./files/loop_render.png", import.meta.url), mimeType: "image/png", toString}],
    ["gunnerus.json", {url: new URL("../section-2-5/files/jason_one.json", import.meta.url), mimeType: "application/json", toString}],
    ["gunnerus_power_plant.json", {url: new URL("./files/gunnerus_power_plant.json", import.meta.url), mimeType: "application/json", toString}],
    ["man_sample.json", {url: new URL("./files/man_sample.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md","FileAttachment","tex"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("Gunnerus")).define("Gunnerus", ["FileAttachment"], _Gunnerus);
  main.variable(observer("ship")).define("ship", ["Vessel","Gunnerus"], _ship);
  main.variable(observer("shipState")).define("shipState", ["Vessel","ship"], _shipState);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("propeller")).define("propeller", ["d3"], _propeller);
  main.variable(observer("wave")).define("wave", ["Vessel"], _wave);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("powerPlant")).define("powerPlant", ["FileAttachment"], _powerPlant);
  main.variable(observer()).define(["md","tex"], _13);
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","xAxisLabel","yAxisLabel","data","line1"], _chart);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer()).define(["html","tex"], _16);
  main.variable(observer("man")).define("man", ["FileAttachment"], _man);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["mutable hullRes","Vessel","ship","shipState","propeller","wave","mutable propellerInteraction","mutable fuelCons","powerPlant"], _19);
  main.variable(observer()).define(["mutable manoeuvring","Vessel","ship","shipState","hullRes","propellerInteraction","fuelCons","man"], _20);
  main.variable(observer()).define(["md"], _21);
  main.variable(observer("manoeuvringMovement")).define("manoeuvringMovement", ["ManoeuvringMovement","manoeuvring"], _manoeuvringMovement);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer()).define(["manoeuvringMovement"], _24);
  main.variable(observer()).define(["manoeuvring","manoeuvringMovement"], _25);
  main.variable(observer()).define(["md"], _26);
  main.variable(observer("angle")).define("angle", _angle);
  main.variable(observer()).define(["md"], _28);
  main.variable(observer("rotationStates")).define("rotationStates", ["manoeuvringMovement","manoeuvring"], _rotationStates);
  main.variable(observer()).define(["md","tex"], _30);
  main.variable(observer("forceVector")).define("forceVector", ["manoeuvring","manoeuvringMovement","rotationStates","angle"], _forceVector);
  main.variable(observer()).define(["md","tex"], _32);
  main.variable(observer()).define(["manoeuvringMovement","forceVector"], _33);
  main.variable(observer()).define(["md"], _34);
  main.variable(observer("MutablesModel")).define("MutablesModel", ["md"], _MutablesModel);
  main.define("initial propellerInteraction", _propellerInteraction);
  main.variable(observer("mutable propellerInteraction")).define("mutable propellerInteraction", ["Mutable", "initial propellerInteraction"], (M, _) => new M(_));
  main.variable(observer("propellerInteraction")).define("propellerInteraction", ["mutable propellerInteraction"], _ => _.generator);
  main.define("initial hullRes", _hullRes);
  main.variable(observer("mutable hullRes")).define("mutable hullRes", ["Mutable", "initial hullRes"], (M, _) => new M(_));
  main.variable(observer("hullRes")).define("hullRes", ["mutable hullRes"], _ => _.generator);
  main.define("initial fuelCons", _fuelCons);
  main.variable(observer("mutable fuelCons")).define("mutable fuelCons", ["Mutable", "initial fuelCons"], (M, _) => new M(_));
  main.variable(observer("fuelCons")).define("fuelCons", ["mutable fuelCons"], _ => _.generator);
  main.define("initial manoeuvring", _manoeuvring);
  main.variable(observer("mutable manoeuvring")).define("mutable manoeuvring", ["Mutable", "initial manoeuvring"], (M, _) => new M(_));
  main.variable(observer("manoeuvring")).define("manoeuvring", ["mutable manoeuvring"], _ => _.generator);
  main.variable(observer("GraphModels")).define("GraphModels", ["md"], _GraphModels);
  main.variable(observer("data")).define("data", ["powerPlant"], _data);
  main.variable(observer("line1")).define("line1", ["d3","x","y"], _line1);
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], _x);
  main.variable(observer("y")).define("y", ["d3","data","height","margin"], _y);
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width"], _xAxis);
  main.variable(observer("xAxisLabel")).define("xAxisLabel", ["height","margin","width"], _xAxisLabel);
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","data"], _yAxis);
  main.variable(observer("yAxisLabel")).define("yAxisLabel", ["margin","height"], _yAxisLabel);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer()).define(["md"], _51);
  main.variable(observer("ManoeuvringMovement")).define("ManoeuvringMovement", ["numeric"], _ManoeuvringMovement);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("numeric")).define("numeric", ["require"], _numeric);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["md"], _56);
  main.variable(observer("one")).define("one", ["md"], _one);
  main.variable(observer("two")).define("two", ["md"], _two);
  main.variable(observer("three")).define("three", ["md"], _three);
  main.variable(observer("four")).define("four", ["md"], _four);
  main.variable(observer("five")).define("five", ["md"], _five);
  return main;
}
