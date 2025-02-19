// https://observablehq.com/@ferrari212/chapter-4-simulations-and-analysis-principles-for-vessel-j@56
function _1(md){return(
md`# Chapter 4 - Simulations and Analysis Principles for Vessel.js`
)}

function _2(md){return(
md`Simulations and Analysis in Naval Architecture is held to predict the system behavior in different scenarios   according to situations faced during previews operation for improvements purpose or regulatory approval requirements. The level of details in the simulations during the design phase also permits the user to identify earlier failure and avoid the components over dimension, averting unnecessary costs with material and labor **[1]**.

In this report is used the terminology applied in **[2]**, which relates the engineering analysis with its foundations in Newtonian mechanics as a way to find a cause effect relation. The simulation differs slightly from the analysis by inserting the time as a variant for the performance evaluation.

On this chapter we are going to introduce how to use the Vessel.js **[3]** lybrary to create simulations and analysis, using its predefined models. This chapter will be separated according to the following topics:

* Coordinate reference system;
* Advance Resistance Analysis;
* A Brief Explanation of Maneuvering Mathematical Model.
`
)}

function _3(md){return(
md`
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-3-2/index.html) || <a href="#top">Top</a> || [Next >>](../section-4-1/index.html) </p> 
`
)}

function _4(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _5(md){return(
md`
**[1] Designing a Web Platform for Digital Twin Ship ** - Felipe Ferrari, Mater Thesis in the Norwegian University of Science and Technology, Juni 2021.

**[2] Merging Physics, Big Data Analytics and Simulation for the Next-Generation Digital Twins ** - Stein Ove Erikstad, September 2017 
<a href="https://www.researchgate.net/publication/320196420_Merging_Physics_Big_Data_Analytics_and_Simulation_for_the_Next-Generation_Digital_Twins" target="_blank"> https://www.researchgate.net/publication</a>

**[3] Vessel.js ** - Lybrary Website <a href="https://shiplab.github.io/vesseljs/" target="_blank"> http://vesseljs.org/ </a>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  return main;
}
