Power plant objects can be assembled from an engine library. For fuel consumption simulations, the properties of an engine specification should include `MCR` and coefficients for approximation of the SFOC curve as a 2nd or 3rd order polynomial. If property `polOrder = 2`:

SFOC(load) = a\*load² + b\*load + c

If `polOrder = 3`:

SFOC(load) = a\*load³ + b\*load²+ c\*load + d

Where load is the ratio between an engine's current working load and its MCR. An example of engine specification would be:
```json
{
	"MCR": 11000, // [kW]
	"a": 90,
	"b": 130,
	"c": 210,
	"polOrder": 2
}
```

A power plant object should have at least one main power providing system, as in this diesel electric example:
```js
var powerPlant1 = {
	main: {
		etas: 0.95, // shaft efficiency
		etag: 0.95, // generator efficiency
		engines: [CAT_3516C, CAT_3516C, CAT_C32, CAT_C32]
	}
};
```

In this case, the diesel electrical system supplies power for both propulsion and auxiliary systems. Grouping multiple engines in the same array means they are able to share loads. The array order defines the starting order of engines as the demanded power load increases. Shaft efficiency (etas) and generator efficiency (etag) are taken as constant.

A power plant object may instead have one main power plant with two independent systems which do not share loads. For example, two diesel mechanical systems, each with one or more engines coupled to a propeller. In this case, the power plant should have an auxiliary diesel electrical system for powering other systems. In the following example, this auxiliary system includes two high-speed engines:
```js
// create a diesel mechanical power plant
var powerPlant2 = {
	main: {
		noSys: 2,
		etas: 0.99,
		engines: [CAT_3516C]
	},
	auxiliary: {
		etas: 0.95,
		etag: 0.95,
		engines: [CAT_C32, CAT_C32]
	}
};
```

The power plant specifications examplified above are included as files `diesel_mechanical1.json` and `diesel_electrical2.json` in this folder. Alternatively, the engine specifications can be uploaded directly to a script with `XMLHttpRequest()` and then be handled to assemble new power plants.
