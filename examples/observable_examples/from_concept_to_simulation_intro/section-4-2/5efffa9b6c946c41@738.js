// ../section-4-2/index.html@738
function _1(md){return(
md`# Section 4.2 Advance Resistance Analysis - Pt.1: Propeller Model`
)}

function _2(md,tex){return(
md`
Currently, Vessel.js library contains four analysis types: <a href="https://github.com/shiplab/vesseljs/blob/b3116b61dc1ff3f5d29d16a69b8784a0c569ab1c/build/vessel.js#L1015" target="_blank">Hull</a> (ship form and weight calculation), <a href="https://github.com/shiplab/vesseljs/blob/b3116b61dc1ff3f5d29d16a69b8784a0c569ab1c/build/vessel.js#L2398" target="_blank">Total Resistance</a>, <a href="https://github.com/shiplab/vesseljs/blob/b3116b61dc1ff3f5d29d16a69b8784a0c569ab1c/build/vessel.js#L2044" target="_blank">Wave Motion</a>, and <a href="https://github.com/shiplab/vesseljs/blob/b3116b61dc1ff3f5d29d16a69b8784a0c569ab1c/build/vessel.js#L2295" target="_blank"> Fuel Consumption</a>.

On this section, the report will explain how to use the analysis modules as a tool for new projects. The <a href="https://github.com/shiplab/vesseljs/blob/b3116b61dc1ff3f5d29d16a69b8784a0c569ab1c/build/vessel.js#L2398" target="_blank">Total Resistance</a> module was choosen as an example guide due the extention of the component, which uses in addition the propeller information and the wave pattern for calculation. For practical informations regarding the usage of the other modules I recommend the articles <a href="https://observablehq.com/@icarofonseca/stability-calculate-static-stability-of-a-vessel?collection=@icarofonseca/vessel-js" target="_blank">Hydrostatics and Static Stability</a>, <a href="https://observablehq.com/@icarofonseca/wave-response-with-closed-form-expressions?collection=@icarofonseca/vessel-js" target="_blank">Wave Response with Closed-Form Expressions</a> and <a href="https://observablehq.com/@icarofonseca/object-weight-define-and-calculate-a-tanks-weight-and-cente/3?collection=@icarofonseca/vessel-js" target="_blank">Object Weight - Define and calculate a tank's weight and center of gravity</a>. Althought the project are explained from one module perspective, the concepts here presented are easielly transferable into the other analyzes cases as well.

## <span style="color:rgb(13, 18, 125)">Propeller Modeling

Assuming that the ship is setted as explained in the previews Chapters of this report, the first step for the resistance calculation is to define a propeller information module, which is stored in a JSON object and will be used to calculate the hull propeller interaction efficiency due the propeller variation in hull pressure. The following propeller is inspired according to Wangeningen B-Series [[1]](#one) libraries with expecifications bellow:
${tex.block`n_{blades} = 4;~P/D = 1.2;~A_e/A_0 = 0.55`}
`
)}

function _propeller(FileAttachment){return(
FileAttachment("wag_4b_0.55a_1.2p.json").json()
)}

function _4(md,tex){return(
md`The torque coefficient ${tex`K_t`} and ${tex`K_q`} are modeled according to a linear approximation adopted by [[2]](#two):
${tex.block`\begin{cases}
        K_T(J) = \beta_1 - \beta_2 \cdot J \\
        K_Q(J) = \gamma_1 - \gamma_2 \cdot J 
    \end{cases}`}

With the values from ${tex`K_t`} and ${tex`K_q`} it is possible to calculate the efficiency of the propeller:
${tex.block`
        K_T(J) = \frac{T}{\rho \cdot n_p^2 \cdot D^4} ;\\
        ~\\
        K_Q(J) = \frac{Q}{\rho \cdot n_p^2 \cdot D^5} ;\\
        ~\\
        \eta = \frac{1}{2 \pi} \cdot \frac{K_T(J) \cdot J}{K_Q(J)}; \\
        ~\\
        J = \frac{Va}{n_p \cdot D} 
`}

The equations above give back the following graphic:
`
)}

function _chart(d3,width,height,xAxis,yAxis,appendLabel,data,line1,line2,line3)
{
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const labelsObj = [
    { title: "Kt", color: "steelblue" },
    { title: "10 X Kq", color: "green" },
    { title: "Eff.", color: "red" }
  ];

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

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

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line3);

  return svg.node();
}


function _6(md){return(
md`
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-4-1/index.html) || <a href="#top">Top</a> || [Next >>](../section-4-2-pt-2/index.html) </p> 
`
)}

function _MutablesModel(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Mutable`
)}

function _propellerInteraction()
{
}


function _9(Vessel,$0,ship,shipState,propeller,$1)
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

function _GraphModels(md){return(
md`### <span style="color:rgb(13, 18, 125)"> Graphics`
)}

function _data(propeller)
{
  const D = propeller.D;
  const [beta1, beta2] = [propeller.beta1, propeller.beta1];
  const [gamma1, gamma2] = [propeller.gamma1, propeller.gamma2];
  let result = [];

  var kt = J => {
    return beta1 - beta2 * J;
  };

  var kq = J => {
    return gamma1 - gamma2 * J;
  };

  var eff = (J, kt, kq) => {
    return (kt * J) / (2 * Math.PI * kq);
  };

  var calculateOutput = J => {
    const KT = kt(J);
    const KQ = kq(J);
    const EFF = eff(J, KT, KQ);

    return { x: J, y: KT, z: 10 * KQ, w: EFF };
  };

  let j = 0;

  do {
    result.push(calculateOutput(j));
    j = j + 0.01;
  } while (j <= 1.0);

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

function _line3(d3,x,y){return(
d3
  .line()
  .x(d => x(d.x))
  .y(d => y(d.w))
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

function _margin(){return(
{ top: 20, right: 30, bottom: 30, left: 40 }
)}

function _height(width){return(
width / 2
)}

function _appendLabel(width,height){return(
e => g => {
  e.forEach((el, i) => {
    g.append("circle")
      .attr("cx", width - 150)
      .attr("cy", .1 * height + 30 * i)
      .attr("r", 6)
      .style("fill", el.color);

    g.append("text")
      .attr("x", width - 130)
      .attr("y", .1 * height + 30 * i)
      .text(el.title)
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  });
}
)}

function _27(md){return(
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

function _Ship3D(THREE,Vessel)
{
  //@EliasHasle

  /*
Draft for new version. More modularized, and interacts with a ship state.
Uses an additional coordinate system for motions.
The position.xy and rotation.z of the Ship3D object plane the ship in the 3D world.
(Not geographically)
position.z is the (negative) draft.
fluctCont is a "fluctuations container" to be used for dynamically
changing motions like heave, pitch, roll.
cmContainer centers the motion on the center of gravity.
normalizer nulls out the center of gravity height before the draft is applied.


THREE.js Object3D constructed from Vessel.js Ship object.

There are some serious limitations to this:
1. null values encountered are assumed to be either at the top or bottom of the given station.
2. The end caps and bulkheads are sometimes corrected with zeros where they should perhaps have been clipped because of null values.

TODO: Use calculated draft for position.z, and place the ship model in a motion container centered at the calculated metacenter.
*/

  //var hMat; //global for debugging

  function Ship3D(
    ship,
    { shipState, stlPath, deckOpacity = 0.2, objectOpacity = 0.5 }
  ) {
    THREE.Group.call(this);

    this.normalizer = new THREE.Group();
    this.fluctCont = new THREE.Group();
    this.fluctCont.rotation.order = "ZYX"; //right?
    this.cmContainer = new THREE.Group();
    this.fluctCont.add(this.cmContainer);
    this.normalizer.add(this.fluctCont);
    this.add(this.normalizer);

    Object.defineProperty(this, "draft", {
      get: function() {
        return -this.position.z;
      } /*,
		set: function(value) {
			this.position.z = -value;
		}*/
    });
    Object.defineProperty(this, "surge", {
      get: function() {
        return this.fluctCont.position.x;
      },
      set: function(value) {
        this.fluctCont.position.x = value;
        //this.shipState.motion.surge = value;
      }
    });
    Object.defineProperty(this, "sway", {
      get: function() {
        return this.fluctCont.position.y;
      },
      set: function(value) {
        this.fluctCont.position.y = value;
        //this.shipState.motion.sway = value;
      }
    });
    Object.defineProperty(this, "heave", {
      get: function() {
        return this.fluctCont.position.z;
      },
      set: function(value) {
        this.fluctCont.position.z = value;
        //this.shipState.motion.heave = value;
      }
    });
    Object.defineProperty(this, "yaw", {
      get: function() {
        return this.fluctCont.rotation.z;
      },
      set: function(value) {
        this.fluctCont.rotation.z = value;
        //this.shipState.motion.yaw = value;
      }
    });
    Object.defineProperty(this, "pitch", {
      get: function() {
        return this.fluctCont.rotation.y;
      },
      set: function(value) {
        this.fluctCont.rotation.y = value;
        //this.shipState.motion.pitch = value;
      }
    });
    Object.defineProperty(this, "roll", {
      get: function() {
        return this.fluctCont.rotation.x;
      },
      set: function(value) {
        this.fluctCont.rotation.x = value;
        //this.shipState.motion.roll = value;
      }
    });

    this.objectOpacity = objectOpacity;

    this.ship = ship;
    this.shipState = shipState || ship.designState.clone();

    let hull = ship.structure.hull;

    let LOA = hull.attributes.LOA;
    let BOA = hull.attributes.BOA;
    let Depth = hull.attributes.Depth;

    //console.log("LOA:%.1f, BOA:%.1f, Depth:%.1f",LOA,BOA,Depth);
    let {
      w: { cg, mass },
      T,
      GMt,
      GMl
    } = ship.calculateStability(this.shipState);

    this.cmContainer.position.set(-cg.x, -cg.y, -cg.z);
    this.normalizer.position.z = cg.z;
    this.position.z = -T;

    let designDraft = ship.designState.calculationParameters.Draft_design;
    this.hull3D = new Hull3D(hull, designDraft);
    this.cmContainer.add(this.hull3D);

    //DEBUG, to show only hull:
    //return;

    let stations = hull.halfBreadths.stations;
    //Decks:
    var decks = new THREE.Group();
    let deckMat = new THREE.MeshPhongMaterial({
      color: 0xcccccc /*this.randomColor()*/,
      transparent: true,
      opacity: deckOpacity,
      side: THREE.DoubleSide
    });
    //deckGeom.translate(0,0,-0.5);
    let ds = ship.structure.decks;
    //let dk = Object.keys(ds);
    let stss = stations.map(st => LOA * st); //use scaled stations for now
    //console.log(dk);
    //for (let i = 0; i < dk.length; i++) {
    for (let dk in ds) {
      //let d = ds[dk[i]]; //deck in ship structure
      let d = ds[dk];

      //Will eventually use BoxBufferGeometry, but that is harder, because vertices are duplicated in the face planes.
      let deckGeom = new THREE.PlaneBufferGeometry(1, 1, stss.length, 1); //new THREE.BoxBufferGeometry(1,1,1,sts.length,1,1);
      //console.log("d.zFloor=%.1f", d.zFloor); //DEBUG
      let zHigh = d.zFloor;
      let zLow = d.zFloor - d.thickness;
      let wlHigh = hull.getWaterline(zHigh);
      let wlLow = hull.getWaterline(zLow);
      let pos = deckGeom.getAttribute("position");
      let pa = pos.array;
      for (let j = 0; j < stss.length + 1; j++) {
        //This was totally wrong, and still would benefit from
        //not mapping directly to stations, as shorter decks will
        //Get zero-width sections
        let x = stss[j]; //d.xAft+(j/stss.length)*(d.xFwd-d.xAft);
        if (isNaN(x)) x = stss[j - 1];
        x = Math.max(d.xAft, Math.min(d.xFwd, x));
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
      //console.log("d.xFwd=%.1f, d.xAft=%.1f, 0.5*d.breadth=%.1f", d.xFwd, d.xAft, 0.5*d.breadth);
      //console.log(pa);
      let mat = deckMat;
      if (d.style) {
        mat = new THREE.MeshPhongMaterial({
          color:
            typeof d.style.color !== "undefined" ? d.style.color : 0xcccccc,
          transparent: true,
          opacity:
            typeof d.style.opacity !== "undefined"
              ? d.style.opacity
              : deckOpacity,
          side: THREE.DoubleSide
        });
      }
      let deck = new THREE.Mesh(deckGeom, mat);
      deck.name = dk; //[i];

      // The try verification is used to verify if the group affiliation was inserted in the JSON structure,
      // the affiliation must be decided in the future if it will be incorporate into the main structure of the group
      // or if there is a better approach to classify it.
      // @ferrari212
      try {
        deck.group = d.affiliations.group;
      } catch (error) {
        console.warn('Group tag were introduced to deck object');
        console.warn(error);
      }

      deck.position.z = d.zFloor;
      //deck.scale.set(d.xFwd-d.xAft, d.breadth, d.thickness);
      //deck.position.set(0.5*(d.xFwd+d.xAft), 0, d.zFloor);
      decks.add(deck);
    }
    this.decks = decks;
    this.cmContainer.add(decks);

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
    this.cmContainer.add(this.blocks);

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
      if (
        typeof object.style.color !== "undefined" ||
        typeof object.style.opacity !== "undefined"
      ) {
        let color =
          typeof object.style.color !== "undefined"
            ? object.style.color
            : this.randomColor();
        let opacity =
          typeof object.style.opacity !== "undefined"
            ? object.style.opacity
            : this.objectOpacity;
        mat = new THREE.MeshPhongMaterial({
          color,
          transparent: true,
          opacity
        });
      } else {
        let name = this.stripName(object.id);
        if (this.materials[name] !== undefined) {
          mat = this.materials[name];
        } else {
          mat = new THREE.MeshPhongMaterial({
            color: this.randomColor(),
            transparent: true,
            opacity: this.objectOpacity
          });
          this.materials[name] = mat;
        }
      }

      let bo = object.baseObject;

      //Position
      let s = this.ship.designState.getObjectState(object);
      let x = s.xCentre;
      let y = s.yCentre;
      let z = s.zBase;

      //Small position jitter to avoid z-fighting
      let n = 0.01 * (2 * Math.random() - 1);
      x += n;
      y += n;
      z += n;

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
            m.name = object.id;
            m.group =
              bo.affiliations.group != undefined
                ? bo.affiliations.group
                : undefined;
            self.blocks.add(m);
          },
          undefined,
          function onError() {
            console.warn(
              "Error loading STL file " +
                bo.file3D +
                ". Falling back on placeholder."
            );
            let m = new THREE.Mesh(this.boxGeom, mat);
            m.position.set(x, y, z);
            m.scale.set(d.length, d.breadth, d.height);
            m.name = object.id;
            m.group =
              bo.affiliations.group != undefined
                ? bo.affiliations.group
                : undefined;
            this.blocks.add(m);
          }
        );
      } else {
        //Placeholder:
        let m = new THREE.Mesh(this.boxGeom, mat);
        m.position.set(x, y, z);
        m.scale.set(d.length, d.breadth, d.height);
        m.name = object.id;
        m.group =
          bo.affiliations.group != undefined
            ? bo.affiliations.group
            : undefined;
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

  //Class to contain the geometry of a hull side.
  //(Should perhaps be replaced by a HullGeometry class, but then
  //it cannot be a simple subclass of PlaneBufferGeometry.)
  //After instantiation, stations, waterlines and table can be modified or replaced,
  //but the data dimensions NxM must remain the same.
  function HullSideGeometry(stations, waterlines, table) {
    this.stations = stations;
    this.waterlines = waterlines;
    this.table = table;
    this.N = stations.length;
    this.M = waterlines.length;
    //Hull side, in principle Y offsets on an XZ plane:
    //Even though a plane geometry is usually defined in terms of Z offsets on an XY plane, the order of the coordinates for each vertex is not so important. What is important is to get the topology right. This is ensured by working with the right order of the vertices.
    THREE.PlaneBufferGeometry.call(
      this,
      undefined,
      undefined,
      this.N - 1,
      this.M - 1
    );

    this.update();
  }

  HullSideGeometry.prototype = Object.create(
    THREE.PlaneBufferGeometry.prototype
  );
  Object.assign(HullSideGeometry.prototype, {
    update: function() {
      let pos = this.getAttribute("position");
      let pa = pos.array;

      const N = this.N;
      const M = this.M;

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
          pa[c] = this.stations[i]; //x
          //DEBUG, OK. No attempts to read outside of table
          /*if(typeof table[j] === "undefined") console.error("table[%d] is undefined", j);
				else if (typeof table[j][i] === "undefined") console.error("table[%d][%d] is undefined", j, i);*/
          //y
          pa[c + 1] = this.table[j][i]; //y
          pa[c + 2] = this.waterlines[j]; //z
          c += 3;
        }
      }
      //console.error("c-pa.length = %d", c-pa.length); //OK, sets all cells

      //Get rid of nulls by merging their points with the closest non-null point in the same station:
      /*I am joining some uvs too. Then an applied texture will be cropped, not distorted, where the hull is cropped.*/
      let uv = this.getAttribute("uv");
      let uva = uv.array;
      //Iterate over stations
      for (let i = 0; i < N; i++) {
        let firstNumberJ;
        let lastNumberJ;
        //Iterate over waterlines
        let j;
        for (j = 0; j < M; j++) {
          let y = this.table[j][i];
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
          //console.log("null encountered.");
        }

        //Continue up the hull (with same j counter), searching for upper number. This does not account for the existence of numbers above the first null encountered.
        for (; j < M; j++) {
          let y = this.table[j][i];
          if (y === null) {
            //console.log("null encountered.");
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
      this.computeVertexNormals();
    }
  });

  function Hull3D(hull, design_draft) {
    THREE.Group.call(this);

    this.hull = hull;
    this.group = "Hull3D";
    this.design_draft =
      design_draft !== undefined ? design_draft : 0.5 * hull.attributes.Depth;
    this.upperColor =
      typeof hull.style.upperColor !== "undefined"
        ? hull.style.upperColor
        : 0x33aa33;
    this.lowerColor =
      typeof hull.style.lowerColor !== "undefined"
        ? hull.style.lowerColor
        : 0xaa3333;
    this.opacity =
      typeof hull.style.opacity !== "undefined" ? hull.style.opacity : 0.5;

    this.update();
  }
  Hull3D.prototype = Object.create(THREE.Group.prototype);

  Object.assign(Hull3D.prototype, {
    //Experimental addition. Broken.
    addStation: function(p) {
      const hb = this.hull.halfBreadths;
      const { index, mu } = Vessel.f.bisectionSearch(hb.stations, p);
      hb.stations.splice(index, 0, p);
      for (let i = 0; i < hb.waterlines.length; i++) {
        hb.table[i].splice(index, 0, 0);
      }

      this.update();
    },
    //Experimental addition
    addWaterline: function(p) {
      const hb = this.hull.halfBreadths;
      const { index, mu } = Vessel.f.bisectionSearch(hb.waterlines, p);
      hb.waterlines.splice(index, 0, p);
      hb.table.splice(index, 0, new Array(hb.stations.length).fill(0));

      this.update();
    },
    //or updateGeometries?
    update: function() {
      const hull = this.hull;
      const upperColor = this.upperColor;
      const lowerColor = this.lowerColor;
      const design_draft = this.design_draft;
      const opacity = this.opacity;

      let LOA = hull.attributes.LOA;
      let BOA = hull.attributes.BOA;
      let Depth = hull.attributes.Depth;

      //None of these are changed during correction of the geometry.
      let stations = hull.halfBreadths.stations;
      let waterlines = hull.halfBreadths.waterlines;
      let table = hull.halfBreadths.table;

      if (this.hGeom) this.hGeom.dispose();
      this.hGeom = new HullSideGeometry(stations, waterlines, table);

      let N = stations.length;
      let M = waterlines.length;

      //Bow cap:
      let bowPlaneOffsets = hull.getStation(LOA).map(str => str / (0.5 * BOA)); //normalized
      if (this.bowCapG) this.bowCapG.dispose();
      this.bowCapG = new THREE.PlaneBufferGeometry(
        undefined,
        undefined,
        1,
        M - 1
      );
      let pos = this.bowCapG.getAttribute("position");
      let pa = pos.array;
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
      if (this.aftCapG) this.aftCapG.dispose();
      this.aftCapG = new THREE.PlaneBufferGeometry(
        undefined,
        undefined,
        1,
        M - 1
      );
      pos = this.aftCapG.getAttribute("position");
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
      if (this.bottomCapG) this.bottomCapG.dispose();
      this.bottomCapG = new THREE.PlaneBufferGeometry(
        undefined,
        undefined,
        N - 1,
        1
      );
      pos = this.bottomCapG.getAttribute("position");
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
      if (!this.hMat) {
        let phong = THREE.ShaderLib.phong;
        let commonDecl =
          "uniform float wlThreshold;uniform vec3 aboveWL; uniform vec3 belowWL;\nvarying float vZ;";
        this.hMat = new THREE.ShaderMaterial({
          uniforms: THREE.UniformsUtils.merge([
            phong.uniforms,
            {
              wlThreshold: new THREE.Uniform(0.5),
              aboveWL: new THREE.Uniform(new THREE.Color()),
              belowWL: new THREE.Uniform(new THREE.Color())
            }
          ]),
          vertexShader:
            commonDecl +
            phong.vertexShader
              .replace("main() {", "main() {\nvZ = position.z;")
              .replace("#define PHONG", ""),
          fragmentShader:
            commonDecl +
            phong.fragmentShader
              .replace(
                "vec4 diffuseColor = vec4( diffuse, opacity );",
                "vec4 diffuseColor = vec4( (vZ>wlThreshold)? aboveWL.rgb : belowWL.rgb, opacity );"
              )
              .replace("#define PHONG", ""),
          side: THREE.DoubleSide,
          lights: true,
          transparent: true
        });
      }
      this.hMat.uniforms.wlThreshold.value = this.design_draft / Depth;
      this.hMat.uniforms.aboveWL.value = new THREE.Color(upperColor);
      this.hMat.uniforms.belowWL.value = new THREE.Color(lowerColor);
      this.hMat.uniforms.opacity.value = opacity;

      if (this.port) this.remove(this.port);
      this.port = new THREE.Mesh(this.hGeom, this.hMat);
      if (this.starboard) this.remove(this.starboard);
      this.starboard = new THREE.Mesh(this.hGeom, this.hMat);
      this.starboard.scale.y = -1;
      this.add(this.port, this.starboard);

      //Caps:
      if (this.bowCap) this.remove(this.bowCap);
      this.bowCap = new THREE.Mesh(this.bowCapG, this.hMat);
      if (this.aftCap) this.remove(this.aftCap);
      this.aftCap = new THREE.Mesh(this.aftCapG, this.hMat);
      if (this.bottomCap) this.remove(this.bottomCap);
      this.bottomCap = new THREE.Mesh(this.bottomCapG, this.hMat);

      this.add(this.bowCap, this.aftCap, this.bottomCap);

      this.scale.set(LOA, 0.5 * BOA, Depth);
    }
  });

  return Ship3D;
}


function _d3(require){return(
require("d3@6")
)}

function _legendcolor(require){return(
require("d3-svg-legend")
)}

function _33(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _one(md){return(
md`
**[1] Kt, Kq and Efficiency Curves for the Wageningen B-Series Propellers ** - Barnitsas M.M., Ray D., Kinley P. - June 1981 <a href="https://deepblue.lib.umich.edu/handle/2027.42/91702" target="_blank"> https://deepblue.lib.umich.edu/handle/2027.42/91702</a>.
`
)}

function _two(md){return(
md`
**[2] Maneuvering And Control Of Marine Vehicles ** - Triantafyllou, Michael S., and Franz S. Hover. - MIT Press - 2004. <a href="https://ocw.mit.edu/courses/mechanical-engineering/2-154-maneuvering-and-control-of-surface-and-underwater-vehicles-13-49-fall-2004/lecture-notes/1349_notes.pdf" target="_blank"> https://ocw.mit.edu/courses/mechanical-engineering</a>.
`
)}

function _three(md){return(
md`**[3] Holtrop, J. ** - 1984 - A statistical re-analysis of resistance and propulsion data, pg. 272–276. `
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["wag_4b_0.55a_1.2p.json", {url: new URL("./files/0cf98d1a476edf17bb6c1ed0032a9323a5cc0025652375a792296ed4b9d5bf607596a18f56d9acdc471290c34f96a85d78b75419bec2e0e566cdadfbf31f3164.json", import.meta.url), mimeType: "application/json", toString}],
    ["gunnerus.json", {url: new URL("../section-2-5/files/jason_one.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md","tex"], _2);
  main.variable(observer("propeller")).define("propeller", ["FileAttachment"], _propeller);
  main.variable(observer()).define(["md","tex"], _4);
  main.variable(observer("chart")).define("chart", ["d3","width","height","xAxis","yAxis","appendLabel","data","line1","line2","line3"], _chart);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer("MutablesModel")).define("MutablesModel", ["md"], _MutablesModel);
  main.define("initial propellerInteraction", _propellerInteraction);
  main.variable(observer("mutable propellerInteraction")).define("mutable propellerInteraction", ["Mutable", "initial propellerInteraction"], (M, _) => new M(_));
  main.variable(observer("propellerInteraction")).define("propellerInteraction", ["mutable propellerInteraction"], _ => _.generator);
  main.variable(observer()).define(["Vessel","mutable hullRes","ship","shipState","propeller","mutable propellerInteraction"], _9);
  main.define("initial hullRes", _hullRes);
  main.variable(observer("mutable hullRes")).define("mutable hullRes", ["Mutable", "initial hullRes"], (M, _) => new M(_));
  main.variable(observer("hullRes")).define("hullRes", ["mutable hullRes"], _ => _.generator);
  main.variable(observer("ThreDModels")).define("ThreDModels", ["md"], _ThreDModels);
  main.variable(observer("Gunnerus")).define("Gunnerus", ["FileAttachment"], _Gunnerus);
  main.variable(observer("ship")).define("ship", ["Vessel","Gunnerus"], _ship);
  main.variable(observer("shipState")).define("shipState", ["Vessel","ship"], _shipState);
  main.variable(observer("GraphModels")).define("GraphModels", ["md"], _GraphModels);
  main.variable(observer("data")).define("data", ["propeller"], _data);
  main.variable(observer("line1")).define("line1", ["d3","x","y"], _line1);
  main.variable(observer("line2")).define("line2", ["d3","x","y"], _line2);
  main.variable(observer("line3")).define("line3", ["d3","x","y"], _line3);
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], _x);
  main.variable(observer("y")).define("y", ["d3","data","height","margin"], _y);
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x","width"], _xAxis);
  main.variable(observer("yAxis")).define("yAxis", ["margin","d3","y","data"], _yAxis);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("appendLabel")).define("appendLabel", ["width","height"], _appendLabel);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer("THREE")).define("THREE", ["require"], _THREE);
  main.variable(observer("Vessel")).define("Vessel", ["require"], _Vessel);
  main.variable(observer("Ship3D")).define("Ship3D", ["THREE","Vessel"], _Ship3D);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("legendcolor")).define("legendcolor", ["require"], _legendcolor);
  main.variable(observer()).define(["md"], _33);
  main.variable(observer("one")).define("one", ["md"], _one);
  main.variable(observer("two")).define("two", ["md"], _two);
  main.variable(observer("three")).define("three", ["md"], _three);
  return main;
}
