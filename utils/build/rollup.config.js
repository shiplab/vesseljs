import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import zip from 'rollup-plugin-zip'
// import resolve from "@rollup/plugin-node-resolve";

const zipPlugin = zip({ 
	file: "build/vessel.zip",
	// include: ["build/vessel.module.js", "build/vessel.module.min.js"] // Files to include
});

const builds = [
	{
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
	},
	{
		input: ["build/vessel.module.js", "build/vessel.module.min.js"],
		output: {
			dir: "./", // required, but irrelevant for zip
		},
		plugins: [
			zipPlugin
		]
	}
];

export default ( args ) => builds;
