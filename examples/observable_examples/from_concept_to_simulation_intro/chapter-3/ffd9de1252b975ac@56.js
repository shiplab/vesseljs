// https://observablehq.com/@ferrari212/chapter-3-principles-of-system-engineering-applied-to-gunn@56
function _1(md){return(
md`# Chapter 3 - Principles of System Engineering Applied to Gunnerus`
)}

function _2(md){return(
md `[System Engineering](https://en.wikipedia.org/wiki/Systems_engineering) is a project managing approach which aims to develop an operable system capable of meeting the requirements defined by the stakeholders with the identification in a holistic approach of the several conflicts, relations and constrains between its different parts. **[1]** 

  

A part is a single unit element that only in the interaction with other parts can produce the desirable result and increase the value of the objects, forming then a system. The parts can constitute of people, hardware, software, facilities, policies, and documents depending of system nature considered.  

  

A ship can be considered as a system, being constitute of different parts which the System Engineering concept can help to identify the several conflicts between the elements. To give a simple example about elements interaction take the directional and propulsion subsystems, an increasing in the propulsive power can signify an increasing in the rudder system to compensate the momentum variation necessary to maintain the same maneuverability goal. Similarly, an alteration in the rudder system, such as the rudder size increasing for a better stability control, also requires an increasing in the propulsive power to compensate the extra drag force produced.  

  

In this Chapter, it is going to be discussed:

* The graphical user interfaces (GUI) to improve the interability with the visualization;
* A Ship systems classification using the System Engineering approach;
* An interactive visualization between the parts.


The GUI can be applied for several other applications as well, and the library **[2]** has several examples about how to use them for simulation purpose.     

`
)}

function _3(md){return(
md `
<p style="text-align: center;font-size: 25px;"> [<< Previous](../section-2-2/index.html) || <a href="#top">Top</a> || [Next >>](../section-3-1/index.html) </p> 
`
)}

function _4(md){return(
md`### <span style="color:rgb(13, 18, 125)"> References`
)}

function _5(md){return(
md`
**[1] NASA System Engineering Handbook ** – National Aeronautics and Space Adminstration, Washington, D.C.

**[2] Vessel.js ** - Lybrary Website [http://vesseljs.org/](https://shiplab.github.io/vesseljs/)
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
