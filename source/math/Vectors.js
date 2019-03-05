//@EliasHasle

//Some small helpers for operations on 3D vectors
//A vector is simply defined as an object with properties x,y,z.

var Vectors = {
	scale: function (v, s) {
		return {
			x: s * v.x,
			y: s * v.y,
			z: s * v.z
		};
	},

	norm: function (v) {
		return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
	},

	normalize: function (v) {
		let l = norm(v);
		return {
			x: v.x / l,
			y: v.y / l,
			z: v.z / l
		};
	},

	normSquared: function (v) {
		return v.x ** 2 + v.y ** 2 + v.z ** 2;
	},

	/*Adds two or more vectors given as individual parameters,
	and returns a new vector that is the component-wise
	sum of the input vectors.*/
	add: function (u, v, ...rest) {
		if (rest.length > 0) return Vectors.sum([u, v] + rest);
		return {
			x: u.x + v.x,
			y: u.y + v.y,
			z: u.z + v.z
		};
	},

	//Takes an array of vectors as input, and returns a new vector
	//that is the component-wise sum of the input vectors.
	sum: function (vectors) {
		let S = {
			x: 0,
			y: 0,
			z: 0
		};
		for (let i = 0; i < vectors.length; i++) {
			let v = vectors[i];
			S.x += v.x;
			S.y += v.y;
			S.z += v.z;
		}
		return S;
	},

	//Takes two vector parameters u,v, and returns the vector u-v.
	sub: function (u, v) {
		//return Vectors.add(u, Vectors.scale(v, -1)); //equivalent
		return {
			x: u.x - v.x,
			y: u.y - v.y,
			z: u.z - v.z
		};
	},

	dot: function (u, v) {
		return u.x * v.x + u.y * v.y + u.z * v.z;
	},

	cross: function (u, v) {
		return {
			x: u.y * v.z - u.z * v.y,
			y: u.z * v.x - u.x * v.z,
			z: u.x * v.y - u.y * v.x
		};
	}
}