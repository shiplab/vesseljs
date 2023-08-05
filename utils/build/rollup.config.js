import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
// import resolve from "@rollup/plugin-node-resolve";

const builds = [ {
	input: "source/jsm/vessel.js",
	output: {
		format: "esm",
		file: "build/vessel.module.js",
	},
	plugins: [
		commonjs()
	]
},
{
	input: "source/jsm/vessel.js",
	output: {
		format: "esm",
		file: "build/vessel.module.min.js",
	},
	plugins: [
		terser()
	]
}
];

export default ( args ) => builds;
