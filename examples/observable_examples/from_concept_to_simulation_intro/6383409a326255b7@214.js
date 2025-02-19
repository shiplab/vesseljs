// https://observablehq.com/@ferrari212/from-the-hull-to-simulation-a-vessel-js-tutorial@214
function _e1(md){return(
md`# From Concept to Simulation - A [vessel.js](https://github.com/shiplab/vesseljs) tutorial`
)}

function _e2(md){return(
md`## Felipe Ferrari de Oliveira
Master Graduated in Naval Architecture from Norwegian University of Science and Technology (NTNU)`
)}

function _e3(md){return(
md`## <span style="color:rgb(13, 18, 125)"> Introduction

This tutorial introduces the best practices for using the [vessel.js](https://github.com/shiplab/vesseljs); a JavaScript library for data-driven design combining conceptual ship design with a web-based object-oriented approach.

The solution is described in H.M. Gaspar's paper: 

  [***Vessel.js: an open and collaborative ship design object-oriented library***](https://raw.githubusercontent.com/wiki/shiplab/vesseljs/files/IMDC_preprint.pdf).
`
)}

function _4(md){return(
md`
As the tutorial progresses, the following design steps will be covered:

* Detailing a ship general arrangement and lines plan;
* Developing a graphical user interface (GUI) using a system engineering approach; 
* Displaying a 3D rendering of the ship hosted on a web platform;
* Explanation about main analysis and simulation models.

The research ship [Gunnerus](https://www.ntnu.edu/gunnerus) is used as a model in each of the digitalization process steps.

<img src="https://raw.githubusercontent.com/ferrari212/Ship-Design/master/Figures/Gunnerus_starboard_su.jpg" alt="drawing" width="100%"/>
`
)}

function _e5(md){return(
md`## <span style="color:rgb(13, 18, 125)"> Chapters

* Chapter 1 - [From Plane Lines to 3D Hull](./chapter-1/index.html)
* Chapter 2 - [From GA to Blocks](./chapter-2/index.html)
  + Section 2.1 - [Decks and Bulckheads](./chapter-2/index.html)
  + Section 2.2 - [Compartments](./section-2-2/index.html)
  + Section 2.3 - [Tanks](./section-2-3/index.html)
  + Section 2.4 - [Equipments and STL elements](./section-2-4/index.html)
  + Section 2.5 - [Importing External Elements](./section-2-5/index.html)
  + Section 2.6 - [Creating a GLTF realistic model](./section-2-6/index.html)
* Chapter 3 - [Principles of System Engineering Applied to Gunnerus](./chapter-3/index.html)
  + Section 3.1 - [GUI controller interface - Dropdown menu](./section-3-1/index.html)
  + Section 3.2 - [GUI controller interface - Check Box List](./section-3-2/index.html)
* Chapter 4 - [Simulations and Analysis Principles for Vessel.js](./chapter-4/index.html)
  + Section 4.1 - [Coordinate Reference System](./section-4-1/index.html)
  + Section 4.2 pt.1 - [Advance Resistance Analysis - Propeller Model](./section-4-2)
  + Section 4.2 pt.2 - [Advance Resistance Analysis - Resistance Model](./section-4-2-3)
  + Section 4.3 - [Advance Resistance Analysis - Resistance Model](./section-4-3)
`
)}

function _6(md){return(
md`## <span style="color:rgb(13, 18, 125)"> Contribution

This project is licensed under the [CC BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/) which in summary states all the project can be shared or adapted, as long a proper attribuition to the original source is given and in case of modification the new project must be lisced under the same conditions as its original.

You are also invited to contribute with this tutorial by suggesting new recomendations. This tutorial is also subject to evolve according to the modifications in the Vessel.js library.

`
)}

function _7(md){return(
md`## <span style="color:rgb(13, 18, 125)"> Acknowledgment 

  

This project was possible thanks to several partners that helped me to achieve a high standard report. First, I would like to acknowledge the importance of [NTNU](https://www.ntnu.edu/) for financing this project, providing the 3D models and investing in my capacitation as student. This support will definitely help me in my career and contribute to the improvement of technological collaborative solutions. 

  

Seccond, I would like to thank my professor and coordinator [Henrique M. Gaspar](https://www.ntnu.edu/employees/henrique.gaspar) for guiding me through the several tasks I had and for fostering between the students the usage and development of the library [Vessel.js](https://shiplab.github.io/vesseljs/).  

  

The development of this report was also very smooth thanks to the several [examples](https://observablehq.com/collection/@icarofonseca/vessel-js) and snippets provided by [Ícaro Fonseca](https://www.ntnu.no/ansatte/icaro.a.fonseca) and all previews students partners, which together with this report becomes the main guide for [Vessel.js](https://shiplab.github.io/vesseljs/) usage. The leverage potential of the applications provided by this report can be close related not only with the developer partners inside NTNU but also thanks to the huge open source community which this project relies on. 

Finally I would like to acknowledge [Mario Delgado](https://observablehq.com/@mariodelgadosr) for improving [Chapter 1](./chapter-2/index.html) and [Section 2.1](../chapter-2/index.html), making the report more friendly for non maritime professionals and improving the 3D hull visualization. 

`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("e1")).define("e1", ["md"], _e1);
  main.variable(observer("e2")).define("e2", ["md"], _e2);
  main.variable(observer("e3")).define("e3", ["md"], _e3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("e5")).define("e5", ["md"], _e5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  return main;
}
