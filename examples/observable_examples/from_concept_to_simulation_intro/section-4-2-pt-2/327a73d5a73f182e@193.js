// ../section-4-2-pt-2/index.html@193
function _1(md){return(
md`# Section 4.2 Advance Resistance Analysis - Pt.2: Resistance Model`
)}

function _2(md){return(
md`
With <code>propeller</code> information defined in a JSON format, we can continue by using the models wich constitutes the ship resistance [[3]](#three). To define the resistance it is necessary to first inser a sea state, the simplest one with no disturbance can be defined simpling by assigning a <code>Vessel.WaveCreator()</code> to a variable:
~~~~js 
var wave = new Vessel.WaveCreator();
var hullRes = new Vessel.HullResistance(ship, shipState, propeller, wave);
hullRes.writeOutput();
~~~~
To set the resistance to a specific speed, different from the projected one it must be called the:
~~~~js
var v = 10 // A specified value for the speed in knots
hullRes.setSpeed(v);
~~~~
The <code>hullRes.calmResitance</code> gives the value for the calm resistance, while the <code>hullRes.totalResistance.Rtadd</code> gives the value for the total resistance accounting for the propeller. In addition the total power requested in the propeller is given by <code>hullRes.totalResistance.Pe</code>. The following example shows the results for the speed of 10 knots:
`
)}

function _3(hullRes)
{
  hullRes.setSpeed(10);
  hullRes.calmResistance;
  hullRes.totalResistance.Rtadd;
  hullRes.totalResistance.Pe;
  return {
    R: hullRes.calmResistance,
    Rtadd: hullRes.totalResistance.Rtadd,
    Pe: hullRes.totalResistance.Pe
  };
}


function _4(md){return(
md`
The following graphics shows the value of the resistance according to the speed of the ship in knots
`
)}

function _chart(d3,width,height,xAxis,yAxis,xAxisLabel,yAxisLabel,appendLabel,data,line1,line2)
{
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const labelsObj = [
    { title: "Rt", color: "steelblue" },
    { title: "Rtadd", color: "green" }
  ];

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

  // Draw the x and y axes labels.
  svg.append('g').call(xAxisLabel('Speed [knots]'));
  svg.append('g').call(yAxisLabel('Resistance [N]'));

  // Draw the x and y axes labels.
  svg.append('g').call(appendLabel(labelsObj));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line1);

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line2);

  return svg.node();
}


function _6(md){return(
md`
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-4-2/index.html) || <a href="#top">Top</a> || [Next >>](../section-4-3/index.html) </p> 
`
)}

function _MutablesModel(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Mutable`
)}

function _8(Vessel,$0,ship,shipState,propeller,$1)
{
  var wave = new Vessel.WaveCreator();
  $0.value = new Vessel.HullResistance(ship, shipState, propeller, wave);
  $0.value.writeOutput();

  $1.value = new Vessel.PropellerInteraction(
    ship,
    shipState,
    propeller
  );
}


function _propellerInteraction()
{
}


function _hullRes()
{
}


function _ThreDModels(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Ship Info.`
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

function _propeller(d3){return(
d3.json(
  "https://raw.githubusercontent.com/shiplab/vesseljs/dev/examples/others/propeller_specifications/wag_4b_0.55a_1.2p.json"
)
)}

function _GraphModels(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Graphics`
)}

function _data(hullRes)
{
  let result = [];

  var calculateOutput = V => {
    hullRes.setSpeed(V);
    return {
      x: V,
      y: hullRes.calmResistance,
      z: hullRes.totalResistance.Rtadd
    };
  };

  let v = 0;

  do {
    result.push(calculateOutput(v));
    v = v + 0.01;
  } while (v <= 12.0);

  return result;
}


function _line1(d3,x,y){return(
d3
  .line()
  .x(d => x(d.x))
  .y(d => y(d.y))
)}

function _line2(d3,x,y){return(
d3
  .line()
  .x(d => x(d.x))
  .y(d => y(d.z))
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
  .domain([0, d3.max(data, d => d3.max([d.z, d.z]))])
  .nice()
  .range([height - margin.bottom, margin.top])
)}

function _xAxis(height,margin,d3,x,width){return(
g =>
  g.attr("transform", `translate(0,${height - margin.bottom})`).call(
    d3
      .axisBottom(x)
      .ticks(width / 100)
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

function _appendLabel(width,height){return(
e => g => {
  e.forEach((el, i) => {
    g.append("circle")
      .attr("cx", width - 150)
      .attr("cy", .8 * height + 30 * i)
      .attr("r", 6)
      .style("fill", el.color);

    g.append("text")
      .attr("x", width - 130)
      .attr("y", .8 * height + 30 * i)
      .text(el.title)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  });
}
)}

function _29(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Libraries`
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
  await require("three@0.99.0/examples/js/loaders/GLTFLoader.js").catch(
    () => {}
  );
  return THREE;
}


function _Vessel(require){return(
require('ntnu-vessel@0.1.1/vessel.js').catch(() => window["Vessel"])
)}

function _d3(require){return(
require("d3@6")
)}

function _legendcolor(require){return(
require("d3-svg-legend")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["gunnerus.json", {url: new URL("../section-2-5/files/jason_one.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["hullRes"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","xAxisLabel","yAxisLabel","appendLabel","data","line1","line2"], _chart);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer("MutablesModel")).define("MutablesModel", ["md"], _MutablesModel);
  main.variable(observer()).define(["Vessel","mutable hullRes","ship","shipState","propeller","mutable propellerInteraction"], _8);
  main.define("initial propellerInteraction", _propellerInteraction);
  main.variable(observer("mutable propellerInteraction")).define("mutable propellerInteraction", ["Mutable", "initial propellerInteraction"], (M, _) => new M(_));
  main.variable(observer("propellerInteraction")).define("propellerInteraction", ["mutable propellerInteraction"], _ => _.generator);
  main.define("initial hullRes", _hullRes);
  main.variable(observer("mutable hullRes")).define("mutable hullRes", ["Mutable", "initial hullRes"], (M, _) => new M(_));
  main.variable(observer("hullRes")).define("hullRes", ["mutable hullRes"], _ => _.generator);
  main.variable(observer("ThreDModels")).define("ThreDModels", ["md"], _ThreDModels);
  main.variable(observer("Gunnerus")).define("Gunnerus", ["FileAttachment"], _Gunnerus);
  main.variable(observer("ship")).define("ship", ["Vessel","Gunnerus"], _ship);
  main.variable(observer("shipState")).define("shipState", ["Vessel","ship"], _shipState);
  main.variable(observer("propeller")).define("propeller", ["d3"], _propeller);
  main.variable(observer("GraphModels")).define("GraphModels", ["md"], _GraphModels);
  main.variable(observer("data")).define("data", ["hullRes"], _data);
  main.variable(observer("line1")).define("line1", ["d3","x","y"], _line1);
  main.variable(observer("line2")).define("line2", ["d3","x","y"], _line2);
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], _x);
  main.variable(observer("y")).define("y", ["d3","data","height","margin"], _y);
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width"], _xAxis);
  main.variable(observer("xAxisLabel")).define("xAxisLabel", ["height","margin","width"], _xAxisLabel);
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","data"], _yAxis);
  main.variable(observer("yAxisLabel")).define("yAxisLabel", ["margin","height"], _yAxisLabel);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("appendLabel")).define("appendLabel", ["width","height"], _appendLabel);
  main.variable(observer()).define(["md"], _29);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("legendcolor")).define("legendcolor", ["require"], _legendcolor);
  return main;
}
