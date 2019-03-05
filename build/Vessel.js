//Vessel.js library, built 2019-01-07 18:37:38.176543
/*
Import like this in HTML:
<script src="Vessel.js"></script>
Then in javascript use classes and functions with a Vessel prefix. Example:
let ship = new Vessel.Ship(someSpecification);
*/

"use strict";

var Vessel = {};
(function () {
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
    } //@EliasHasle

    //Some interpolation helpers. Only linear and bilinear for now.

    /*Function that takes a sorted array as input, and finds the last index that holds a numerical value less than, or equal to, a given value.
    Returns an object with the index and an interpolation parameter mu that gives the position of value between index and index+1.
    */
    function bisectionSearch(array, value) {
        if (value < array[0]) {
            console.warn("bisectionSearch: requested value below lowest array element. Returning undefined.");
            return {
                index: undefined,
                mu: undefined
            };
        }
        let index = 0,
            upper = array.length;
        while (upper > index + 1) {
            let c = Math.floor(0.5 * (index + upper));
            if (array[c] === value) return {
                index: c,
                mu: 0
            };
            else if (array[c] < value) index = c;
            else upper = c;
        }
        /*if (index === array.length) {
        	console.error("bisectionSearch: index===array.length. This should never happen.");
        }*/
        let mu = (value - array[index]) / (array[index + 1] - array[index]);
        if (index === array.length - 1) {
            console.warn("bisectionSearch: Reached end of array. Simple interpolation will result in NaN.");
            mu = undefined;
        }
        return {
            index,
            mu
        };
    }

    //linear interpolation
    //Defaults are not finally decided
    //returns NaN if a and b are NaN or mu is NaN.
    function lerp(a, b, mu = 0.5) {
        if (isNaN(a)) return b;
        if (isNaN(b)) return a;
        return (1 - mu) * a + mu * b;
    }

    //Test. Not safe yet.
    function linearFromArrays(xx, yy, x) {
        let {
            index,
            mu
        } = bisectionSearch(xx, x);
        if (index === undefined || mu === undefined) return 0;
        return lerp(yy[index], yy[index + 1], mu);
    }

    //Source: https://en.wikipedia.org/wiki/Bilinear_interpolation
    //(I have used other sources too)
    function bilinearUnitSquareCoeffs(z00, z01, z10, z11) {
        let a00 = z00; //mux=muy=0
        let a10 = z10 - z00; //mux=1, muy=0
        let a01 = z01 - z00; //mux=0, muy=1
        let a11 = z11 + z00 - z01 - z10; //mux=muy=1
        return [a00, a10, a01, a11];
    }

    function bilinearUnitSquare(z00, z01, z10, z11, mux, muy) {
        let [a00, a10, a01, a11] = bilinearUnitSquareCoeffs(z00, z01, z10, z11);
        return a00 + a10 * mux + a01 * muy + a11 * mux * muy;
    }

    //Find coefficients for 1, x, y, xy.
    //This doesn't yet handle zero-lengths well.
    function bilinearCoeffs(x1, x2, y1, y2, z00, z01, z10, z11) {
        let X = (x2 - x1);
        let Y = (y2 - y1);

        if (X === 0 || Y === 0) {
            //console.warn("bilinearCoeffs: Zero base area. Setting coefficients to zero.");
            return [0, 0, 0, 0];
        }

        let Ainv = 1 / (X * Y);

        //constant coeff:
        let b00 = Ainv * (z00 * x2 * y2 - z10 * x1 * y2 - z01 * x2 * y1 + z11 * x1 * y1);
        //x coeff:
        let b10 = Ainv * (-z00 * y2 + z10 * y2 + z01 * y1 - z11 * y1);
        //y coeff:
        let b01 = Ainv * (-z00 * x2 + z10 * x1 + z01 * x2 - z11 * x1);
        //xy coeff:
        let b11 = Ainv * (z00 - z10 - z01 + z11);

        return [b00, b10, b01, b11];
    }

    //Maybe I could do some simple linear interpolation in collapsed cases.
    //But then I have to be sure what the z values and coefficients mean.
    //I have apparently not documented this well.
    function bilinear(x1, x2, y1, y2, z11, z12, z21, z22, x, y) {
        let [b00, b10, b01, b11] =
        bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22);
        let fromCoeffs = b00 + b10 * x + b01 * y + b11 * x * y;

        //The following is supposed to be equivalent. Some tests yielding identical results (and no tests so far yielding different results) suggest that the calculations are in fact equivalent.
        /*let mux = (x-x1)/(x2-x1);
        let muy = (y-y1)/(y2-y1);
        let fromUnitSquare = bilinearUnitSquare(z11, z12, z21, z22, mux, muy);

        console.log("fromCoeffs=", fromCoeffs, ", fromUnitSquare=", fromUnitSquare);*/

        return fromCoeffs;
    }
    //@EliasHasle

    //All inputs are numbers. The axes are given by a single coordinate.
    function steiner(I, A, sourceAxis, targetAxis) {
        return I + A * (sourceAxis - targetAxis) ** 2;
    }

    //Calculate area, center, Ix, Iy.
    function trapezoidCalculation(xbase0, xbase1, xtop0, xtop1, ybase, ytop) {
        let a = xbase1 - xbase0;
        let b = xtop1 - xtop0;
        let h = ytop - ybase;
        if (a < 0 || b < 0 || h < 0) {
            console.warn("trapezoidCalculation: Unsupported input. Possibly not a valid trapezoid.");
        }
        let A = 0.5 * (a + b) * h;
        let yc = (a == 0 && b == 0) ? ybase + 0.5 * h : ybase + h * (2 * a + b) / (3 * (a + b));
        let d = xbase0 + 0.5 * a; //shorthand
        let xc = h === 0 ? 0.25 * (xbase0 + xbase1 + xtop0 + xtop1) : d + (xtop0 + 0.5 * b - d) * (yc - ybase) / h;
        let Ix = (a == 0 && b == 0) ? 0 : h ** 3 * (a ** 2 + 4 * a * b + b ** 2) / (36 * (a + b));

        //For Iy I must decompose (I think negative results will work fine):
        let Art1 = 0.5 * (xtop0 - xbase0) * h;
        let xcrt1 = xbase0 + (xtop0 - xbase0) / 3;
        let Iyrt1 = (xtop0 - xbase0) ** 3 * h / 36;
        let Arec = (xbase1 - xtop0) * h;
        let xcrec = 0.5 * (xtop0 + xbase1);
        let Iyrec = (xbase1 - xtop0) ** 3 * h / 12;
        let Art2 = 0.5 * (xbase1 - xtop1) * h;
        let xcrt2 = (xtop1 + (xbase1 - xtop1) / 3);
        let Iyrt2 = (xbase1 - xtop1) ** 3 * h / 36;

        let Iy = steiner(Iyrt1, Art1, xcrt1, xc) +
            steiner(Iyrec, Arec, xcrec, xc) +
            steiner(Iyrt2, Art2, xcrt2, xc);

        let maxX = Math.max.apply(null, [xbase0, xbase1, xtop0, xtop1]);
        let minX = Math.min.apply(null, [xbase0, xbase1, xtop0, xtop1]);
        let maxY = Math.max(ybase, ytop);
        let minY = Math.min(ybase, ytop);

        return {
            A: A,
            xc: xc,
            yc: yc,
            Ix: Ix,
            Iy: Iy,
            maxX: maxX,
            minX: minX,
            maxY: maxY,
            minY: minY
        };
    }

    function combineAreas(array) {
        let A = 0;
        let xc = 0;
        let yc = 0;
        let maxX = 0,
            minX = 0,
            maxY = 0,
            minY = 0;
        let L = array.length;
        for (let i = 0; i < L; i++) {
            let e = array[i];
            A += e.A;
            xc += e.xc * e.A;
            yc += e.yc * e.A;
            if (!isNaN(e.maxX) && e.maxX > maxX)
                maxX = e.maxX;
            if (!isNaN(e.minX) && e.minX < minX)
                minX = e.minX;
            if (!isNaN(e.maxY) && e.maxY > maxY)
                maxY = e.maxY;
            if (!isNaN(e.minY) && e.minY < minY)
                minY = e.minY;
        }
        let Ix = 0;
        let Iy = 0;

        if (A !== 0) {
            xc /= A;
            yc /= A;
        } else {
            //console.warn("Zero area combination.");
            //console.trace();
            xc /= L;
            yc /= L;
        }

        for (let i = 0; i < array.length; i++) {
            let e = array[i];
            Ix += steiner(e.Ix, e.A, e.yc, yc);
            Iy += steiner(e.Iy, e.A, e.xc, xc);
        }

        return {
            A: A,
            xc: xc,
            yc: yc,
            Ix: Ix,
            Iy: Iy,
            maxX: maxX,
            minX: minX,
            maxY: maxY,
            minY: minY
        };
    }

    //x and y here refers to coordinates in the plane that is being calculated on.
    function sectionCalculation({
        xs,
        ymins,
        ymaxs
    }) {
        //console.group/*Collapsed*/("sectionCalculation");
        //console.info("Arguments (xs, ymins, ymaxs): ", arguments[0]);

        let calculations = [];
        for (let i = 0; i < xs.length - 1; i++) {
            let xbase = xs[i];
            let xtop = xs[i + 1];
            let ybase0 = ymins[i] || 0;
            let ybase1 = ymaxs[i] || 0;
            let ytop0 = ymins[i + 1] || 0;
            let ytop1 = ymaxs[i + 1] || 0;

            calculations.push(trapezoidCalculation(ybase0, ybase1, ytop0, ytop1, xbase, xtop));
        }

        let C = combineAreas(calculations); //Might be zero areas!

        let output = {
            A: C.A,
            maxX: C.maxY,
            minX: C.minY,
            maxY: C.maxX,
            minY: C.minX,
            xc: C.yc,
            yc: C.xc,
            Ix: C.Iy,
            Iy: C.Ix,
            Abb: (C.maxY - C.minY) * (C.maxX - C.minX)
        };
        //console.info("Output: ", output);
        //console.groupEnd();
        return output;
    }

    //For wetted area. I think this is right, but it is not tested.
    //The numerical integral will not scale well with larger geometries.
    //Then the full analytical solution is needed.
    function bilinearArea(x1, x2, y1, y2, z11, z12, z21, z22, segs = 5) {
        let [b00, b10, b01, b11] = bilinearCoeffs(x1, x2, y1, y2, z11, z12, z21, z22);
        /*
        z(x,y) = b00 + b10*x + b01*y + b11*xy
        Partial derivative in x: b10 + b11*y
        Partial derivative in y: b01 + b11*x
        I think this will be right:
        Tx(y) = (1, 0, b10+b11*y)
        Ty(x) = (0, 1, b01+b11*x)
        Then:
        Tx X Ty = (-(b10+b11*y), -(b01+b11*x), 1)
        |Tx X Ty| = sqrt((b10+b11*y)^2 + (b01+b11*x)^2 + 1)

        Now, to get the area I need to integrate |Tx X Ty| over X,Y.

        Wolfram Alpha gave me this for the inner integral using x (indefinite):
        integral sqrt((b01 + b11 x)^2 + 1 + (b10+b11*y)^2) dx = ((b01 + b11*x) sqrt((b01 + b11*x)^2 + 1 + (b10+b11*y)^2) + (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x))/(2*b11) + constant
        That means this for the definite integral:
        ((b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + 1 + (b10+b11*y)^2*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2))/(2*b11) - ((b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1))/(2*b11)
        =
        (b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2)/(2*b11)
        +(1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2)/(2*b11))
        - (b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2)/(2*b11)
        - (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1)/(2*b11)
        =
        (b01 + b11*x2)*sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2)/(2*b11)
        - (b01 + b11*x1)*sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2)/(2*b11)
        +(1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x2)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x2)/(2*b11))
        - (1 + (b10+b11*y)^2)*ln(sqrt((b01 + b11*x1)^2 + 1 + (b10+b11*y)^2) + b01 + b11*x1)/(2*b11)

        The two first integrals are similar, and the two last are also similar. With A=+-(b01 + b11*xi)/(2*b11), B=(b01 + b11*xi)^2+1, C=b10 and D=b11 (where xi represents either x1 or x2, and +- represents + for x2 and - for x1), I can calculate the integral of sqrt(B+(C+D*y)^2) and multiply by A. That integral is on the same form as the first one.

        The two last integrals can be represented by setting A=+-1/(2*b11), B=(b01 + b11*xi)^2+1, C=b01+b11*xi, D=b10, E=b11, and calculating the integral of (1+(D+E*y)^2)*ln(sqrt(B+(D+E*y)^2)+C), and multiplying by A.
        Here is the integration result from Wolfram Alpha:
        integral(1 + (D + E y)^2) log(sqrt(B + (D + E y)^2) + C) dy = (-(6 (B^2 - 2 B C^2 - 3 B + C^4 + 3 C^2) tan^(-1)((D + E y)/sqrt(B - C^2)))/sqrt(B - C^2) + (6 (B^2 - 2 B C^2 - 3 B + C^4 + 3 C^2) tan^(-1)((C (D + E y))/(sqrt(B - C^2) sqrt(B + (D + E y)^2))))/sqrt(B - C^2) + 6 (B - C^2 - 3) (D + E y) + 3 C (-3 B + 2 C^2 + 6) log(sqrt(B + (D + E y)^2) + D + E y) + 3 C (D + E y) sqrt(B + (D + E y)^2) + 6 ((D + E y)^2 + 3) (D + E y) log(sqrt(B + (D + E y)^2) + C) - 2 (D + E y)^3)/(18 E) + constant

        I am glad I did not try to do this by hand. But combining these formulae, we can get an exact integral of the area of a bilinear patch. Later. Bilinear patches are not an exact representation anyway. We may opt for something else.
        */

        //Simple numerical calculation of double integral:
        let A = 0;
        let X = x2 - x1,
            Y = y2 - y1;
        let N = segs,
            M = segs;
        for (let i = 0; i < N; i++) {
            let x = x1 + ((i + 0.5) / N) * X;
            for (let j = 0; j < M; j++) {
                let y = y1 + ((j + 0.5) / M) * Y;
                A += Math.sqrt((b10 + b11 * y) ** 2 + (b01 + b11 * x) ** 2 + 1);
            }
        }
        A *= X * Y / (N * M); //dx dy

        return A;
    }

    /*Calculates the (arithmetic) average of the area of the two possible triangulations of the quad element (using two triangles).
    This requires the base of the quad to be convex. If the base is arrowhead shaped,
    The calculation will fail in undefined ways.
    */
    function elementArea(v1, v2, v3, v4) {
        let A1 = Math.abs(signedTriangleArea(v1, v2, v3)) + Math.abs(signedTriangleArea(v3, v4, v1));
        let A2 = Math.abs(signedTriangleArea(v2, v3, v4)) + Math.abs(signedTriangleArea(v4, v1, v2));
        let A = 0.5 * (A1 + A2);
        return A;
    }

    function signedTriangleArea(v1, v2, v3) {
        let u = Vectors.sub(v2, v1);
        let v = Vectors.sub(v3, v1);
        let c = Vectors.cross(u, v);
        let A = 0.5 * Vectors.norm(c);
        return A;
    } //@EliasHasle

    //I have been doing some tests here of a simplified calculation.
    //The results so far indicate that, for the prism hull, the results are almost identical, except that with the simple calculation the center of volume is almost right (but wrong enough to disqualify such a simple calculation).
    /*Note that the coordinate system used here has xy as a grid, with z as heights on the grid, but in the intended application, which is calculations on transverse hull offsets, this z corresponds to the vessel y axis, and y corresponds to the vessel z axis. In any application of this function, the conversion between coordinate systems must be taken care of appropriately.*/
    // xy
    function patchColumnCalculation(x1, x2, y1, y2, z00, z01, z10, z11) {
        //VOLUME:
        //Analysis based on a bilinear patch:
        // /*
        // From here I call mux for x, and muy for y.
        // Integral over unit square:
        // INT[x from 0 to 1, INT[y from 0 to 1, (a00 + a10*x + a01*y + a11*x*y) dy] dx]
        // = INT[x from 0 to 1, (a00+a10*x+0.5*a01+0.5*a11*x) dx]
        // = a00 + 0.5*a10 + 0.5*a01 + 0.25*a11
        // Note that by expanding a00,a10,a01,a11, it is demonstrated that this (rather unsurprisingly) is exactly equivalent to taking the average z offset of the control points.
        // */
        let X = x2 - x1;
        let Y = y2 - y1;
        let Ab = X * Y; //area of base of patch column
        //let zAvg = (a00 + 0.5*a10 + 0.5*a01 + 0.25*a11);
        let zAvg = 0.25 * (z00 + z01 + z10 + z11); //equivalent
        let V = Math.abs(Ab * zAvg); //works

        //CENTER OF VOLUME
        let zc = 0.5 * zAvg;

        //Very approximate center of volume
        //(does not account for different signs on z values,
        //but that should be OK for hull offsets)
        //let xc = (x1*(z00+z01)+x2*(z10+z11))/((z00+z01+z10+z11) || 1);
        //let yc = (y1*(z00+z10)+y2*(z01+z11))/((z00+z01+z10+z11) || 1);

        // /*
        // To find xc properly, I need to integrate x*z over the unit square, divide by zAvg(?) and scale and translate to ship coordinates afterwards:
        // INT[x from 0 to 1, INT[y from 0 to 1, x*(a00 + a10*x + a01*y + a11*x*y) dy] dx] =
        // INT[x from 0 to 1, INT[y from 0 to 1, (a00*x + a10*x^2 + a01*xy + a11*x^2*y) dy] dx] =
        // INT[x from 0 to 1, (a00*x + a10*x^2 + 0.5*a01*x + 0.5*a11*x^2) dx]
        // = (0.5*a00 + a10/3 + 0.25*a01 + a11/6)
        //Trying to expand the coeffs to original z offsets:
        // = (0.5*z00 + (z10-z00)/3 + 0.25*(z01-z00) + (z00+z00-z01-z10)/6)
        // = ((1/12)*z00 + (1/6)*z10 + (1/12)*z01 + (1/6)*z00)
        //Divide by zAvg to get muxc, then scale and translate to xc.
        let xc = x1 + X * (((1 / 12) * z00 + (1 / 6) * z10 + (1 / 12) * z01 + (1 / 6) * z11) / (zAvg || 1));
        //console.log("x1=%.2f, X=%.2f, muxc = %.2f", x1, X, (((1/12)*z00 + (1/6)*z10 + (1/12)*z01 + (1/6)*z11) / (zAvg || 1)));
        //Similar for yc (modified symmetrically)
        let yc = y1 + Y * (((1 / 12) * z00 + (1 / 12) * z10 + (1 / 6) * z01 + (1 / 6) * z11) / (zAvg || 1));
        let [a00, a10, a01, a11] = bilinearUnitSquareCoeffs(z00, z01, z10, z11);

        //console.log("Patch column Cv = (%.2f, %.2f, %.2f)", xc,yc,zc);

        //AREA
        //These two methods give very similar results, within about 1% difference for the fishing boat hull (used in PX121.json).
        //Simple triangle average approximation for area (works)
        /*let As = elementArea(
        	{x: x1, y: y1, z: z00},
        	{x: x1, y: y2, z: z01},
        	{x: x2, y: y1, z: z10},
        	{x: x2, y: y2, z: z11});*/
        //Bilinear area calculation. Works too, but is currently numerical, and quite complex (which means it is bug-prone and hard to maintain). But it is more exact, even with just a few segments for numerical integration (the last, optional, parameter)
        let As = Math.abs(bilinearArea(x1, x2, y1, y2, z00, z01, z10, z11));

        return {
            Ab: Ab,
            As: As,
            V: V,
            Cv: {
                x: xc,
                y: yc,
                z: zc
            }
        };
    }

    //Input: array of objects with calculation results for elements.
    //Output: the combined results.
    function combineVolumes(array) {
        let V = 0;
        let As = 0;
        let Cv = {
            x: 0,
            y: 0,
            z: 0
        };
        let L = array.length;
        //if (L===0) return {V,As,Cv};
        for (let i = 0; i < L; i++) {
            let e = array[i];
            V += e.V;
            As += e.As; //typically wetted area
            //console.log(e.Cv);
            Cv = Vectors.add(Cv, Vectors.scale(e.Cv, e.V));
        }
        Cv = Vectors.scale(Cv, 1 / (V || L || 1));

        //console.info("combineVolumes: Combined Cv is (" + Cv.x + ", " + Cv.y + ", " + Cv.z + ").");

        return {
            V,
            As,
            Cv
        }; //{V: V, As: As, Cv: Cv};
    }
    //@MrEranwe
    //@EliasHasle

    "use strict";
    //Elias notes:
    //LCB and LCG were obviously considered in another coordinate system than we are using. I have corrected this, assuming that the wrong coordinate system had the origin centered longitudinally.
    //The hull mass is off by several orders of magnitude. Checking the paper, it seems likely that the "typical" K parameters are aimed at producing units of tonnes, not kg.
    //It is not mathematically correct to strip down the structural weight calculation the way it is done here, because the exponentiation (E^1.36) cannot be simply decomposed as a sum of exponentiated terms (with the same exponent).
    //Elias has only reviewed and modified the hull weight calculation.

    // This function estimates the structural weight of the hull. This includes the weight of the basic hull to its depth amidships.

    // It is based on Watson and Gilfillan modeling approach using a specific modification of the Lloyd’s Equipment Numeral E as the independent variable.
    //
    //
    // Inputs
    // K is the structural weight coefficient. Parsons, chapter 11, table 11.VII.
    // L is LWL or LBP
    // B is molded beam
    // T is molded draft
    // D is molded depth
    // Superstructures and shiphouses are not being considered in the weight
    // CB is the block coefficient
    // LCB is the Longitudinal Center of Bouyancy
    //
    // Return
    // It returns an object on the format {mass:1234, cg: {x:4,y:3,z:2}}, where the unit of mass is unclear, and x,y,z is in meters from aft,center,bottom, respectively.

    function parametricWeightHull(K, L, B, T, D, CB, Fn) {

        // Calculates estimated structural weight
        // E is the Lloyd’s Equipment Numeral
        let E = L * (B + T) + 0.85 * L * (D - T);
        // CbCorrected is the estimated corrected block coefficient
        let CBCorrected = CB + (1 - CB) * ((0.8 * D - T) / (3 * T));
        // W is the estimated structural weight
        let W = K * Math.pow(E, 1.36) * (1 + 0.5 * (CBCorrected - 0.7));

        // Calculates LCG and VCG
        // VCGHull is the Vertical Center of Gravity of the hull
        let VCGHull = 0;
        if (L < 120) {
            VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2)) + 0.008 * D * (L / D - 6.5);
        } else {
            VCGHull = 0.01 * D * (46.6 + 0.135 * (0.81 - CB) * Math.pow(L / D, 2));
        }
        // LCB is the longitudinal Center of Buoyancy converted from
        // percentage plus forward of amidships to meters from aft
        let LCB = Fn ? 0.5 * L + (9.7 - 45 * Fn) * L / 100 : L * 0.516;
        // LCGHull is the Longitudinal Center of Gravity of the hull in meters from aft
        let LCGHull = LCB - 0.15 * L / 100;

        // Returns the object

        return {
            mass: W,
            cg: {
                x: LCGHull,
                y: 0,
                z: VCGHull
            }
        };
    }

    // This function estimates the remainder of the Dead Ship Weight. It includes the fuel, the lube oil, the fresh water, the crew and the provisions and stores.
    //
    //
    // Inputs
    // Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
    // LBP is the Lenght Between Perpendiculars.
    // D is molded depth
    //
    // Return
    // It returns an object with the properties mass.

    function parametricWeightDeadweight(SFR, MCR, speed, person, day) {

        // Calculates estimated  weight
        let Wfo = SFR * MCR * speed * 1.1; // Fuel oil Weight
        let Wlo = 0; // Lube oil Weight
        if (speed > 10) {
            Wlo = 15;
        } else {
            Wlo = 20
        }
        let Wfw = 0.17 * person; // Weight of fresh water
        let Wce = 0.17 * person; // Weight of crew and effects
        let Wpr = 0.01 * person * day; // Weight of provisions and stores
        let W = Wfo + Wlo + Wfw + Wce + Wpr; // Total weigth


        // VCGOut is the Vertical Center of Gravity of the Deadweight. Depends on designer
        // LCGOut is the Longitudinal Center of Gravity of the Deadweight. Depends on designer

        // Returns the object

        return {
            mass: W
        };
    }

    // This function estimates the structural weight of the machinery, main engine(s) and the remainder of the machinery weight.
    //
    //
    // Inputs
    // MCR is the total capacity of all generators in kW.
    // hdb is the innerbootom height of the engine room
    // Der is the height og the overhead of the engine room
    // L is LWL or LBP
    // B is molded beam
    // T is molded draft
    //
    // Return
    // It returns an object with the properties mass and the VCG.

    function parametricWeightMachinery(MCR, hdb, Der, B, T, L, test) {
        // Calculates estimated machinery weight
        let W = 0.72 * Math.pow(MCR, 0.78);
        // Calculates LCG and VCG

        // req1 and req2 are the Coast Guard requirements for the hdb
        let req1 = (32 * B + 190 * Math.sqrt(T)) / 1000;
        let req2 = (45.7 + 0.417 * L) / 100;
        let reqmax = Math.max(req1, req2, hdb);

        // VCGMach is the Vertical Center of Gravity of the machinery
        let VCGMach = hdb + 0.35 * (Der - hdb);

        // LCGMach is the Longitudinal Center of Gravity of the machinery. Depends on designer

        // Returns the object

        return {
            mass: W,
            VCG: VCGMach
        };
    }


    // This function estimates the remainder of the Light Ship Weight. It includes outfit: electrical plant, distributive auxiliary systems and hull engineering: bits, chocks, hatch covers...
    //
    //
    // Inputs
    // Co is the outfit weight coefficient. Parsons Chapter 11 Figure 11.17. Pag 24.
    // LBP is the Lenght Between Perpendiculars.
    // D is molded depth
    //
    // Return
    // It returns an object with the properties mass and VCG.

    function parametricWeightOutfit(Co, LBP, D) {

        // Calculates estimated  weight
        let W = Co * LBP;

        // VCGOut is the Vertical Center of Gravity of the outfits
        let VCGOut = 0;
        if (LBP < 125) {
            VCGOut = D + 1.25
        } else if (LBP < 250) {
            VCGOut = D + 1.25 + 0.01 * (LBP - 125)
        } else {
            VCGOut = D + 2.5
        }

        // LCGOut is the Longitudinal Center of Gravity of the Outfits. Depends on designer

        // Returns the object

        return {
            mass: W,
            VCG: VCGOut
        };
    }
    //@EliasHasle

    //Very unoptimized for now.
    function combineWeights(array) {
        let M = array.reduce((sum, e) => sum + e.mass, 0);
        let cgms = array.map(e => Vectors.scale(e.cg, e.mass));
        let CG = Vectors.scale(Vectors.sum(cgms), 1 / M);

        return {
            mass: M,
            cg: CG
        };
    } //@EliasHasle

    /*Base class for objects that are constructed from
    a literal object.

    Constructors can take more parameters than the specification, but the specification must be the first parameter.

    setFromSpecification will typically be overridden by derived classes. Overriding implementations will typically do some sanity checking.

    getSpecification will also typically be overridden. The default implementation here is just a sketch. Maybe not even correct for the simplest subclasses.

    Maybe this can be improved by implementing fromJSON and to toJSON methods.
    */

    function JSONSpecObject(specification) {
        if (specification === null) {
            console.warn("JSONSpecObject: null specification provided. Defaulting to empty specification.");
            specification = {};
        } else if (typeof specification === "object") {}
        /*else if (typeof specification === "string") {
        	try {
        		specification = JSON.parse(specification);
        	} catch(e) {
        		console.error("JSONSpecObject: "+ e.message + "\n Defaulting to empty specification.");
        		specification = {};
        	}
        }*/
        else {
            if (typeof specification !== "undefined") {
                console.error("JSONSpecObject: Invalid constructor parameter. Defaulting to empty specification.");
            }
            specification = {};
        }
        this.setFromSpecification(specification);
    }
    JSONSpecObject.prototype = Object.create(Object.prototype);
    Object.assign(JSONSpecObject.prototype, {
        constructor: JSONSpecObject,
        setFromSpecification: function (specification) {
            //No sanity checking by default.
            Object.assign(this, specification);
            return this;
        },
        getSpecification: function () {
            let spec = {};
            for (k of Object.keys(this)) {
                if (this.hasOwnProperty(k)) spec[k] = this[k];
            }
            return spec;
        },
        //toJSON is the standard way. Added here for testing.
        toJSON: function () {
            return this.getSpecification();
        },
        //fromJSON is added as an alternative and better name.
        fromJSON: function (spec) {
            return this.setFromSpecification(spec);
        }
    }); //@EliasHasle

    /*
    Notes:
    For calculated values, I envision a lazy calculation pattern, where all properties involved in calculations are only accessed by specialized getters and setters, and calculated properties have some kind of needsUpdate flag or version number (that is set by any setters that will directly or indirectly affect the property). When, and only when, running the getter for the given property, the flag/version is checked, and if false (same version as in cache) the getter just returns the stored value. If true, the getter starts the calculation of the value, invoking other getters.

    Suggested calculations to do:
    - Inertia matrix (will need more detailed properties of parts).
    */

    function Ship(specification) {
        JSONSpecObject.call(this, specification);
    }
    Ship.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(Ship.prototype, {
        constructor: Ship,
        setFromSpecification: function (specification) {
            this.attributes = specification.attributes || {};
            this.structure = new Structure(specification.structure /*,this*/ );
            //baseObjects and derivedObjects are arrays in the specification, but are objects (hashmaps) in the constructed ship object:
            this.baseObjects = {};
            for (let i = 0; i < specification.baseObjects.length; i++) {
                let os = specification.baseObjects[i];
                this.baseObjects[os.id] = new BaseObject(os);
            }

            this.derivedObjects = {};
            for (let i = 0; i < specification.derivedObjects.length; i++) {
                let os = specification.derivedObjects[i];
                this.derivedObjects[os.id] = new DerivedObject(os, this.baseObjects);
            }

            this.designState = new ShipState(specification.designState);
            return this;
        },
        getSpecification: function () {
            let specification = {};
            specification.attributes = this.attributes;
            specification.structure = this.structure.getSpecification();

            specification.baseObjects = Object.values(this.baseObjects).map(o => o.getSpecification());
            specification.derivedObjects = Object.values(this.derivedObjects).map(o => o.getSpecification());

            specification.designState = this.designState.getSpecification();

            return specification;
        },
        //This should probably be separated in lightweight and deadweight
        //Then this function should be replaced by a getDisplacement
        getWeight: function (shipState) {
            shipState = shipState || this.designState;

            let components = [];

            components.push(
                this.structure.getWeight(this.designState)
            );

            //DEBUG
            //console.log(components);

            for (let o of Object.values(this.derivedObjects)) {
                components.push(o.getWeight(shipState));
            }

            var W = combineWeights(components);
            //console.info("Calculated weight object: ", W);
            return W;
        },
        calculateDraft: function (shipState, epsilon = 0.001, rho = 1025) {
            let w = this.getWeight(shipState);
            let M = w.mass;
            return this.structure.hull.calculateDraftAtMass(M, epsilon, rho);
        },
        //Separates between longitudinal and transverse GM
        //To avoid confusion, no "default" GM or BM is specified in the output.
        calculateStability: function (shipState) {
            let w = this.getWeight(shipState);
            let KG = w.cg.z;
            let LCG = w.cg.x;
            let T = this.structure.hull.calculateDraftAtMass(w.mass);
            let {
                BMt,
                BMl,
                KB,
                LCB,
                LCF,
                LWL,
                BWL
            } = this.structure.hull.calculateAttributesAtDraft(T);
            let GMt = KB + BMt - KG;
            let GMl = KB + BMl - KG;

            // avaiable just for small angles < 3°
            // this calculation can be incorporated to Vessesl.js with no problem
            let trim = (LCB - LCG) / GMl;
            let draftfp = 0;
            let draftap = 0;
            let trimd = 0;

            if (trim < Math.tan(3 * Math.PI / 180)) {
                draftfp = T - (LWL - LCF) * trim;
                draftap = T + (LCF) * trim;
                trimd = draftfp - draftap;
            } else {
                draftfp = null;
                draftap = null;
                trimd = null;
            }
            //change the trim for angles
            trim = Math.atan(trim) * 180 / Math.PI;
            console.log(trimd);

            let heel = w.cg.y / GMt;
            //change the hell for meters
            heel *= BWL;

            return {
                w,
                T,
                GMt,
                GMl,
                KB,
                BMt,
                BMl,
                KG,
                trim,
                draftfp,
                draftap,
                trimd,
                heel
            };
        },
        getFuelMass: function (shipState) {
            shipState = shipState || this.designState;

            let fuelMass = {};
            fuelMass.totalMass = 0;
            fuelMass.tankMass = {};
            fuelMass.tankStates = {};
            for (let o of Object.values(this.derivedObjects)) {
                if (o.affiliations.group === "fuel tanks") {
                    fuelMass.tankStates[o.id] = shipState.getObjectState(o);
                    fuelMass.tankMass[o.id] = o.baseObject.weightInformation.contentDensity * o.baseObject.weightInformation.volumeCapacity * fuelMass.tankStates[o.id].fullness;
                    fuelMass.totalMass += fuelMass.tankMass[o.id];
                }
            }
            return fuelMass;
        },
        subtractFuelMass: function (mass, shipState) {
            shipState = shipState || this.designState;

            var fuelMass = this.getFuelMass(shipState);
            var totalFuel = fuelMass.totalMass;
            var tankEntr = Object.entries(fuelMass.tankMass);

            var fuelCap = 0;
            for (var tk = 0; tk < tankEntr.length; tk++) {
                var tkId = tankEntr[tk][0];
                fuelCap += this.derivedObjects[tkId].baseObject.weightInformation.volumeCapacity * this.derivedObjects[tkId].baseObject.weightInformation.contentDensity;
            }

            // check if tanks have necessary fuel
            if (mass <= totalFuel) { // if yes, subtract mass in the same proportion
                for (var tk = 0; tk < tankEntr.length; tk++) {
                    var tkId = tankEntr[tk][0];
                    shipState.objectCache[tkId].state.fullness -= mass / fuelCap;
                }
            } else { // if not, make tanks empty
                mass -= totalFuel;
                for (var tk = 0; tk < tankEntr.length; tk++) {
                    var tkId = tankEntr[tk][0];
                    shipState.objectCache[tkId].state.fullness = 0;
                }
                console.error("Vessel ran out of fuel before " + mass.toFixed(2) + " tons were subtracted.");
            }

            // update related states. In the future, make this consistent with improved caching system
            for (var prop in shipState.objectCache) {
                shipState.objectCache[prop].thisStateVer++;
            }
            shipState.version++;
        }
    });
    //@EliasHasle

    function Structure(spec /*, ship*/ ) {
        //this.ship = ship;
        JSONSpecObject.call(this, spec);
    }
    Structure.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(Structure.prototype, {
        setFromSpecification: function (spec) {
            this.hull = new Hull(spec.hull /*, this.ship*/ );
            this.decks = spec.decks;
            /*{};
            		let dspecs = spec.decks;
            		let decks = this.decks;
            		let dnames = Object.keys(dspecs);
            		for (let i = 0; i < dnames.length; i++) {
            			let name = dnames[i];
            			let dspec = dspecs[name];
            			decks[name] = new Deck(dspec,this.ship);
            		}*/
            this.bulkheads = spec.bulkheads;
            /*{};
            		let bhspecs = spec.bulkheads;
            		let bulkheads = this.bulkheads;
            		let bhnames = Object.keys(bhspecs);
            		for (let i = 0; i < bhnames.length; i++) {
            			let name = bhnames[i];
            			let bhspec = bhspecs[name];
            			bulkheads[name] = new Bulkhead(bhspec,this.ship);
            		}*/

            return this;
        },
        getSpecification: function () {
            let spec = {
                hull: this.hull.getSpecification(),
                decks: this.decks,
                bulkheads: this.bulkheads
            };
            /*{decks: {}, bulkheads: {}};

            		spec.hull = this.hull.getSpecification();

            		let sd = spec.decks;
            		let dk = Object.keys(this.decks);
            		for (let i = 0; i < dk.length; i++) {
            			sd[dk[i]] = this.decks[dk[i]].getSpecification();
            		}

            		let sbh = spec.bulkheads;
            		let bhk = Object.keys(this.bulkheads);
            		for (let i = 0; i < bhk.length; i++) {
            			sbh[bhk[i]] = this.bulkheads[bhk[i]].getSpecification();
            		}*/

            return spec;
        },
        //This is all dummy calculations
        getWeight: function (designState) {
            let components = [];
            //Hull
            components.push(this.hull.getWeight(designState));

            //structure:
            let decks = Object.values(this.decks);
            for (let i = 0; i < decks.length; i++) {
                let d = decks[i];
                let zc = d.zFloor + 0.5 * d.thickness;
                let yc = d.yCentre;
                let b = d.breadth;
                let wlc = this.hull.waterlineCalculation(zc, {
                    minX: d.xAft,
                    maxX: d.xFwd,
                    minY: yc - 0.5 * b,
                    maxY: yc + 0.5 * b
                });
                components.push({
                    //approximation
                    mass: wlc.Awp * d.thickness * d.density,
                    cg: {
                        x: wlc.xc,
                        y: wlc.yc,
                        z: zc
                    }
                });
            }

            let bulkheads = Object.values(this.bulkheads);
            for (let i = 0; i < bulkheads.length; i++) {
                let bh = bulkheads[i];
                let xc = bh.xAft + 0.5 * bh.thickness;
                let sc = this.hull.stationCalculation(xc);
                components.push({
                    //approximation
                    mass: sc.A * bh.thickness * bh.density,
                    cg: {
                        x: xc,
                        y: sc.yc,
                        z: sc.zc
                    }
                });
            }

            let output = combineWeights(components);
            //console.info("Total structural weight: ", output);
            return output;
        }
    }); //@EliasHasle

    /*When having a class for this, the specification can possibly be in one of several formats, and the handling will be contained in this class.

    I have tried to remove the dependency on the ship object here. This is in order to be able to optimize updates.

    This class needs more comments, for shure.

    And the geometric calculations are faulty.
    */

    function Hull(spec) {
        JSONSpecObject.call(this, spec);
    }
    Hull.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(Hull.prototype, {
        constructor: Hull,
        setFromSpecification: function (spec) {
            this.halfBreadths = spec.halfBreadths;
            //this.buttockHeights = spec.buttockHeights;
            this.attributes = spec.attributes; //this could/should include LOA, BOA, Depth
            this.levelsNeedUpdate = true;
            this.style = spec.style || {};
            return this;
        },
        getSpecification: function () {
            return {
                halfBreadths: this.halfBreadths,
                //buttockHeights: this.buttockHeights
                attributes: this.attributes,
                style: this.style
            };
        },
        //to facilitate economical caching, it may be best to have a few numerical parameters to this function instead of letting it depend on the whole designState. Or maybe the designState is static enough.
        getWeight: function (designState) {
            let ha = this.attributes;
            let B = ha.BOA;
            let D = ha.Depth;
            let cp = designState.calculationParameters;
            let K = cp.K;
            let L = cp.LWL_design;
            let T = cp.Draft_design;
            let Cb = cp.Cb_design;
            let vsm = 0.514444 * cp.speed; // Convert the design speed from knots to m/s
            let Fn = vsm / Math.pow(9.81 * L, 0.5); // Calculates Froude number

            //This is not a good way to estimate the hull weight.
            let parsons = parametricWeightHull(K, L, B, T, D, Cb, Fn);
            parsons.mass *= 1000; //ad hoc conversion to kg, because the example K value is aimed at ending with tonnes.

            let output = parsons;
            //console.info("Hull weight:", output);
            return output;
        },
        /*
        Testing new version without nanCorrectionMode parameter, that defaults to setting lower NaNs to 0 and extrapolating highest data entry for upper NaNs (if existant, else set to 0). Inner NaNs will also be set to zero.

        Input:
        z: level from bottom of ship (absolute value in meters)

        Output:
        Array representing waterline offsets for a given height from the keel (typically a draft).
        */
        getWaterline: function (z) {
            let ha = this.attributes;
            let zr = z / ha.Depth; //using zr requires fewer operations and less memory than a scaled copy of wls.
            let wls = this.halfBreadths.waterlines; //.map(wl=>wl*ha.Depth);
            let sts = this.halfBreadths.stations;
            let tab = this.halfBreadths.table;

            if (zr < wls[0]) {
                //console.warn("getWaterLine: z below lowest defined waterline. Defaulting to all zero offsets.");
                return new Array(sts.length).fill(0);
            } else {
                let a, mu;
                if (zr > wls[wls.length - 1]) {
                    //console.warn("getWaterLine: z above highest defined waterline. Proceeding with highest data entries.");
                    a = wls.length - 2; //if this level is defined...
                    mu = 1;
                    //wl = tab[a].slice();
                } else {
                    ({
                        index: a,
                        mu: mu
                    } = bisectionSearch(wls, zr));
                    if (a === wls.length - 1) {
                        a = wls.length - 2;
                        mu = 1;
                    }
                }

                //Try to do linear interpolation between closest data waterlines, but handle null values well:
                let wl = new Array(sts.length);
                for (let j = 0; j < wl.length; j++) {
                    let lower, upper;
                    let b = a;
                    //Find lower value for interpolation
                    if (tab[b][j] !== null && !isNaN(tab[b][j])) {
                        lower = tab[b][j];
                    } else {
                        b = a + 1;
                        while (b < wls.length && (isNaN(tab[b][j]) || tab[b][j] === null)) {
                            b++;
                        }
                        if (b !== wls.length) {
                            //Inner NaN
                            lower = 0;
                        } else {
                            //Upper NaN, search below:
                            b = a - 1;
                            while (b >= 0 && (isNaN(tab[b][j]) || tab[b][j] === null)) {
                                b--;
                            }
                            if (b === -1) {
                                //No number found:
                                lower = 0;
                                upper = 0;
                            } else {
                                lower = tab[b][j];
                                upper = lower;
                            }
                        }
                    }
                    //Find upper value for interpolation
                    let c = a + 1;
                    if (upper !== undefined) {
                        /*upper found above*/ } else if (tab[c][j] !== null && !isNaN(tab[c][j])) {
                        upper = tab[c][j];
                    } else {
                        //The cell value is NaN.
                        //Upper is not defined.
                        //That means either tab[a][j] is a number
                        //or tab[a][j] is an inner NaN and
                        //there exists at least one number above it.
                        //In both cases I have to check above a+1.
                        c = a + 2;
                        while (c < wls.length && (isNaN(tab[c][j]) || tab[c][j] === null)) {
                            c++;
                        }
                        if (c === wls.length) upper = lower;
                        else {
                            upper = tab[c][j];
                        }
                    }
                    //Linear interpolation
                    wl[j] = lerp(lower, upper, mu);
                    //Scale numerical values
                    if (wl[j] !== null && !isNaN(wl[j])) wl[j] *= 0.5 * ha.BOA;
                }
                return wl;
            }
        },
        //This must be debugged more. getWaterline got an overhaul, but this did not.
        getStation: function (x) {
            let ha = this.attributes;
            let xr = x / ha.LOA;
            let sts = this.halfBreadths.stations;
            let wls = this.halfBreadths.waterlines;
            let tab = this.halfBreadths.table;

            let {
                index: a,
                mu: mu
            } = bisectionSearch(sts, xr);

            let st;
            if (a < 0 || a >= sts.length) st = new Array(wls.length).fill(null);
            else if (a + 1 === sts.length) st = tab.map(row => row[sts.length - 1]);
            else {
                st = [];
                for (let j = 0; j < wls.length; j++) {
                    let after = tab[j][a];
                    let forward = tab[j][a + 1];
                    if ((after === null || isNaN(after)) && (forward === null || isNaN(forward))) {
                        st.push(null);
                    } else {
                        //Simply correcting by "|| 0" is not consistent with what is done in getWaterline. It may be better to correct upper nulls by nearest neighbor below.
                        st.push(lerp(after || 0, forward || 0, mu));
                    }
                }
            }
            for (let j = 0; j < this.halfBreadths.waterlines.length; j++) {
                st[j] *= 0.5 * ha.BOA;
                if (isNaN(st[j]) || st[j] === null) st[j] = null;
            }
            return st;
        },
        //typically deck bounds
        waterlineCalculation: function (z, bounds) {
            let {
                minX,
                maxX,
                minY,
                maxY
            } = bounds || {};

            //console.group/*Collapsed*/("waterlineCalculation.");
            //console.info("Arguments: z=", z, " Boundaries: ", arguments[1]);

            let wl = this.getWaterline(z);
            //console.info("wl: ", wl); //DEBUG

            let LOA = this.attributes.LOA;

            let sts = this.halfBreadths.stations.slice();
            for (let i = 0; i < sts.length; i++) {
                sts[i] *= LOA;
            }

            let hasMinX = (minX !== undefined) && minX !== sts[0];
            let hasMaxX = (maxX !== undefined) && maxX !== sts[sts.length - 1];
            if (hasMinX || hasMaxX) {
                let first = 0;
                let wlpre;
                if (hasMinX) {
                    let muf;
                    ({
                        index: first,
                        mu: muf
                    } = bisectionSearch(sts, minX));
                    let lower = wl[first];
                    let upper = wl[first + 1];
                    if ((lower === null || isNaN(lower)) && (upper === null || isNaN(upper))) {
                        wlpre = null;
                    } else {
                        wlpre = lerp(lower || 0, upper || 0, muf);
                    }
                }
                let last = sts.length - 1;
                let wlsuff;
                if (hasMaxX) {
                    let mul;
                    ({
                        index: last,
                        mu: mul
                    } = bisectionSearch(sts, maxX));
                    let lower = wl[last];
                    let upper = wl[last + 1];
                    if ((lower === null || isNaN(lower)) && (upper === null || isNaN(upper))) {
                        wlsuff = null;
                    } else {
                        wlsuff = lerp(lower || 0, upper || 0, mul);
                    }
                }

                //Add virtual entries according to specified boundaries:
                sts = sts.slice(first + 1, last + 1);
                wl = wl.slice(first + 1, last + 1);
                if (hasMinX) {
                    sts.unshift(minX);
                    wl.unshift(wlpre);
                }
                if (hasMaxX) {
                    sts.push(maxX);
                    wl.push(wlsuff);
                }
            }

            //This does not yet account properly for undefined minY, maxY.
            let port = [],
                star = [];
            for (let i = 0; i < wl.length; i++) {
                if (wl[i] === null || isNaN(wl[i])) {
                    star[i] = minY || null;
                    port[i] = maxY || null;
                } else {
                    star[i] = Math.max(-wl[i], minY || -wl[i]);
                    port[i] = Math.min(wl[i], maxY || wl[i]);
                }
            }

            //DEBUG
            //console.info("Arguments to sectionCalculation:", sts, star, port);

            //sectionCalculation can potentially be served some nulls.
            let sc = sectionCalculation({
                xs: sts,
                ymins: star,
                ymaxs: port
            });
            let LWL = sc.maxX - sc.minX;
            let BWL = sc.maxY - sc.minY;
            let Cwp = sc.A / (LWL * BWL);
            let APP = this.attributes.APP || sc.minX;
            let FPP = this.attributes.FPP || sc.maxX;
            let LBP = FPP - APP;

            let output = {
                z: z,
                xc: sc.xc,
                yc: sc.yc,
                Awp: sc.A,
                Ix: sc.Ix,
                Iy: sc.Iy,
                maxX: sc.maxX,
                minX: sc.minX,
                maxY: sc.maxY,
                minY: sc.minY,
                Cwp: Cwp,
                LWL: LWL,
                LBP: LBP,
                BWL: BWL
            };
            //console.info("Output from waterlineCalculation: ", output);
            //console.groupEnd();
            return output;
        },
        //Not done, and not tested
        //The optional maxZ parameter is introduced for enabling below-water calculations. More bounds will add more complexity, although then some common logic may perhaps be moved from this method and waterlineCalculation to sectionCalculation.
        stationCalculation: function (x, maxZ) {
            let wls = this.halfBreadths.waterlines.map(wl => this.attributes.Depth * wl);
            let port = this.getStation(x);
            if (maxZ !== null && !isNaN(maxZ)) {
                let {
                    index,
                    mu
                } = bisectionSearch(wls, maxZ);
                if (index < wls.length - 1) {
                    wls[index + 1] = lerp(wls[index], wls[index + 1], mu);
                    port[index + 1] = lerp(port[index], port[index + 1], mu);
                    wls = wls.slice(0, index + 2);
                    port = port.slice(0, index + 2);
                }
            }
            let star = port.map(hb => -hb);

            let sc = sectionCalculation({
                xs: wls,
                ymins: star,
                ymaxs: port
            });
            return {
                x: x, //or xc? or cg.. Hm.
                yc: sc.yc,
                zc: sc.xc,
                A: sc.A,
                Iz: sc.Ix,
                Iy: sc.Iy,
                maxZ: sc.maxX,
                minZ: sc.minX,
                maxY: sc.maxY,
                minY: sc.minY
            };
        },

        /*
        Known issues:
        nulls in the offset table will be corrected to numbers in this calculation, whereas the intended meaning of a null supposedly is that there is no hull at that position. This means the calculation can overestimate the wetted area (and possibly make other errors too).
        */
        //Important: calculateAttributesAtDraft takes one mandatory parameter T. (The function defined here is immediately called during construction of the prototype, and returns the proper function.)
        calculateAttributesAtDraft: function () {
            function levelCalculation(hull,
                z,
                prev = {
                    z: 0,
                    Vs: 0,
                    Vbb: 0,
                    As: 0,
                    minX: 0,
                    maxX: 0,
                    minY: 0,
                    maxY: 0,
                    prMinY: 0,
                    prMaxY: 0,
                    Ap: 0,
                    Cv: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }) {

                let wlc = hull.waterlineCalculation(z, {});
                let lev = {};
                Object.assign(lev, wlc);
                //Projected area calculation (approximate):
                lev.prMinY = wlc.minY;
                lev.prMaxY = wlc.maxY;
                //DEBUG:
                //console.info("prev.Ap = ", prev.Ap);
                //console.info("Parameters to trapezoidCalculation: (%.2f, %.2f, %.2f, %.2f, %.2f, %.2f)", prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z);
                let AT = trapezoidCalculation(prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z)["A"];
                //console.log("Calculated area of trapezoid: ", AT);
                lev.Ap = prev.Ap + AT;
                //lev.Ap = prev.Ap
                //	+ trapezoidCalculation(prev.prMinY, prev.prMaxY, lev.prMinY, lev.prMaxY, prev.z, z)["A"];
                //DEBUG END


                //level bounds are for the bounding box of the submerged part of the hull
                if (wlc.minX !== null && !isNaN(wlc.minX) && wlc.minX <= prev.minX)
                    lev.minX = wlc.minX;
                else
                    lev.minX = prev.minX;
                if (wlc.maxX !== null && !isNaN(wlc.maxX) && wlc.maxX >= prev.maxX)
                    lev.maxX = wlc.maxX;
                else
                    lev.maxX = prev.maxX;
                if (wlc.minY !== null && !isNaN(wlc.minY) && wlc.minY <= prev.minY)
                    lev.minY = wlc.minY;
                else
                    lev.minY = prev.minY;
                if (wlc.maxY !== null && !isNaN(wlc.maxY) && wlc.maxY >= prev.maxY)
                    lev.maxY = wlc.maxY;
                else
                    lev.maxY = prev.maxY;

                lev.Vbb = (lev.maxX - lev.minX) * (lev.maxY - lev.minY) * z;

                //Keep level maxX and minX for finding end cap areas:
                lev.maxXwp = wlc.maxX;
                lev.minXwp = wlc.minX;

                //Find bilinear patches in the slice, and combine them.
                //Many possibilities for getting the coordinate systems wrong.
                let calculations = [];
                let sts = hull.halfBreadths.stations.map(st => st * hull.attributes.LOA);
                let wl = hull.getWaterline(z);
                let prwl = hull.getWaterline(prev.z);
                for (let j = 0; j < sts.length - 1; j++) {
                    let port =
                        patchColumnCalculation(sts[j], sts[j + 1], prev.z, z, -prwl[j], -wl[j], -prwl[j + 1], -wl[j + 1]);
                    calculations.push(port);
                    let star =
                        patchColumnCalculation(sts[j], sts[j + 1], prev.z, z, prwl[j], wl[j], prwl[j + 1], wl[j + 1]);
                    calculations.push(star);
                }
                //console.log(calculations); //DEBUG
                let C = combineVolumes(calculations);
                //Cv of slice. Note that switching of yz must
                //be done before combining with previous level
                let Cv = {
                    x: C.Cv.x,
                    y: C.Cv.z,
                    z: C.Cv.y
                };

                lev.Vs = prev.Vs + C.V; //hull volume below z
                lev.As = prev.As + C.As; //outside surface below z

                //End caps:
                if (lev.minXwp <= sts[0])
                    lev.As += hull.stationCalculation(lev.minXwp, z)["A"];
                if (lev.maxXwp >= sts[sts.length - 1])
                    lev.As += hull.stationCalculation(lev.maxXwp, z)["A"];

                //center of volume below z (some potential for accumulated rounding error when calculating an accumulated average like this):
                lev.Cv = Vectors.scale(Vectors.add(
                    Vectors.scale(prev.Cv, prev.Vs),
                    Vectors.scale(Cv, C.V)
                ), 1 / (lev.Vs || 2));

                lev.Cb = lev.Vs / lev.Vbb;
                lev.Cp = lev.Vs / (lev.Ap * (lev.maxX - lev.minX));

                return lev;
            }

            //Here is the returned function calculateAttributesAtDraft(T):
            return function (T) {
                if (T === null || isNaN(T)) {
                    console.error("Hull.prototype.calculateAttributesAtDraft(T): No draft specified. Returning undefined.");
                    return;
                } else if (T < 0 || T > this.attributes.Depth) {
                    console.error("Hull.prototype.calculateAttributesAtDraft(T): Draft parameter " + T + "outside valid range of [0,Depth]. Returning undefined.");
                }

                let wls = this.halfBreadths.waterlines.map(wl => this.attributes.Depth * wl);

                //This is the part that can be reused as long as the geometry remains unchanged:
                if (this.levelsNeedUpdate) {
                    this.levels = [];
                    for (let i = 0; i < wls.length; i++) {
                        let z = wls[i];
                        let lev = levelCalculation(this, z, this.levels[i - 1]);
                        //Bottom cap, only on the lowest level:
                        if (i === 0) {
                            lev.As += lev.Awp;
                        }
                        this.levels.push(lev);
                    }
                    this.levelsNeedUpdate = false;
                }

                //Find highest data waterline below or at water level:
                let {
                    index,
                    mu
                } = bisectionSearch(wls, T);

                //console.info("Highest data waterline below or at water level: " + index);
                //console.log(this.levels);
                let lc;
                if (mu === 0) lc = this.levels[index];
                else lc = levelCalculation(this, T, this.levels[index]);

                //Filter and rename for output
                return {
                    xcwp: lc.xc, //water plane values
                    LCF: lc.xc,
                    ycwp: lc.yc,
                    TCF: lc.yc,
                    Awp: lc.Awp,
                    Ixwp: lc.Ix,
                    BMt: lc.Ix / lc.Vs,
                    Iywp: lc.Iy,
                    BMl: lc.Iy / lc.Vs,
                    maxXs: lc.maxX, //boundaries of the submerged part of the hull
                    minXs: lc.minX,
                    maxYs: lc.maxY,
                    minYs: lc.minY,
                    Cwp: lc.Cwp,
                    LWL: lc.LWL,
                    LBP: lc.LBP,
                    BWL: lc.BWL,
                    Ap: lc.Ap, //projected area in length direction
                    Cp: lc.Cp, //prismatic coefficient
                    //Vbb: lc.Vbb,
                    Vs: lc.Vs, //volume of submerged part of the hull
                    Cb: lc.Cb,
                    Cm: lc.Cb / lc.Cp,
                    As: lc.As, //wetted area
                    Cv: lc.Cv, //center of buoyancy
                    LCB: lc.Cv.x,
                    TCB: lc.Cv.y,
                    KB: lc.Cv.z
                }
            };
        }(),
        //M is the mass (in kg) of the ship
        calculateDraftAtMass: function (M, epsilon = 0.001, rho = 1025) {
            let VT = M / rho; //Target submerged volume (1025=rho_seawater)
            //Interpolation:
            let a = 0;
            let b = this.attributes.Depth; //depth is not draft ¿?
            let t = 0.5 * b;
            //Souce: https://en.wikipedia.org/wiki/Secant_method
            // Secant Method to Find out where is the zero point
            // Used to find out the Draft but can be generalized
            let V1 = 0 - VT;
            let V2 = VT; //Just inserting V2 an ordinary value to not have to calculate it twice
            let n = 0;
            while (Math.abs(t - a) > epsilon) {
                //This following condition force just receive draft from [0;Depth]
                if (t > b) {
                    t = b;
                }

                V2 = this.calculateAttributesAtDraft(t)["Vs"] - VT;
                // debugger
                let dx = (V2 - V1) / (t - a);
                if (dx > 0.1 || dx < -0.1) {
                    a = t;
                    V1 = V2;
                    t = t - V2 / dx;
                    //In case the derived of function is close to 0 we can follow the Bisection method
                    //Source: https://en.wikipedia.org/wiki/Bisection_method
                } else {
                    let ts = 0.5 * (a + t); //intermediate point
                    let Vs = this.calculateAttributesAtDraft(ts)["Vs"] - VT; //this values must be calculated twice, see better example
                    if (Vs > 0) {
                        t = ts;
                        V2 = Vs;
                    } else {
                        a = ts;
                        V1 = Vs;
                    }
                }
            }
            return t
        }
    });
    //@EliasHasle
    //@EliasHasle

    /*
    Depends on JSONSpecObject.js
    */

    function BaseObject(specification) {
        this.weightCache = {};
        JSONSpecObject.call(this, specification);
    }
    BaseObject.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(BaseObject.prototype, {
        constructor: BaseObject,
        setFromSpecification: function (spec) {
            this.id = spec.id;
            this.affiliations = spec.affiliations || {};
            this.boxDimensions = spec.boxDimensions || {
                length: undefined,
                width: undefined,
                height: undefined
            };
            this.weightInformation = spec.weightInformation;
            this.cost = spec.cost || {
                currency: undefined,
                value: undefined
            };
            this.capabilities = spec.capabilities || {};
            this.file3D = spec.file3D;
            this.baseState = spec.baseState;
            return this;
        },
        getSpecification: function () {
            return {
                id: this.id,
                affiliations: this.affiliations,
                boxDimensions: this.boxDimensions,
                weightInformation: this.weightInformation,
                cost: this.cost,
                capabilities: this.capabilities,
                file3D: this.file3D,
                baseState: this.baseState
            };
        },
        //Maybe this will take more state parameters than just fullness.
        getWeight: function (fullness) {
            fullness = fullness || 0;

            let wi = this.weightInformation;
            //Should maybe have been this.capabilities.weightInformation?

            //(Fluid) container properties default to no content:
            let d = wi.contentDensity || 0;
            let v = wi.volumeCapacity || 0;
            //Maybe we should have another handling of cargo (with variable density)

            let m = wi.lightweight + d * v * fullness;
            let cg;
            if (wi.fullnessCGMapping !== undefined) {
                let fcgm = wi.fullnessCGMapping;
                let fs = fcgm.fullnesses;
                let cgs = fcgm.cgs;
                //Find closest entries:
                let {
                    index: i,
                    mu: mu
                } = bisectionSearch(fs, fullness);
                cg = [];
                for (let j = 0; j < 3; j++) {
                    let c;
                    if (i < fs.length - 1)
                        //Linear interpolation between closest entries:
                        c = lerp(cgs[i][j], cgs[i + 1][j], mu);
                    else c = cgs[i][j];
                    //if (c===null || isNaN(c)) console.error("BaseObject.getWeight: Invalid value found after interpolation.");
                    cg.push(c);
                }
            } else if (wi.cg !== undefined) {
                //console.log("BaseObject.getWeight: Using specified cg.");
                cg = wi.cg;
            } else {
                console.warn("BaseObject.getWeight: No cg or fullnessCGMapping supplied. Defaults to center of bounding box.");
                cg = [0, 0, 0.5 * this.boxDimensions.height];
            }
            let w = {
                mass: m,
                cg: {
                    x: cg[0],
                    y: cg[1],
                    z: cg[2]
                }
            };
            return w;
        }
    }); //@EliasHasle

    /*
    Depends on JSONSpecObject.js
    */

    function DerivedObject(specification, baseObjects) {
        this.baseObjects = baseObjects;
        JSONSpecObject.call(this, specification);
    }
    DerivedObject.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(DerivedObject.prototype, {
        constructor: DerivedObject,
        setFromSpecification: function (spec) {
            this.id = spec.id;
            this.group = spec.group || null;
            this.affiliations = spec.affiliations;
            if (typeof spec.baseObject === "string") {
                this.baseObject = this.baseObjects[spec.baseObject];
            } else {
                this.baseObject = new BaseObject(spec.baseObject);
            }
            this.referenceState = spec.referenceState;
            //this.referenceStateVersion = 0;
            this.style = spec.style || {};
            return this;
        },
        getSpecification: function () {
            let spec = {
                id: this.id,
                group: this.group,
                affiliations: this.affiliations,
                referenceState: this.referenceState,
                style: this.style
            };
            if (this.baseObjects[this.baseObject.id] !== undefined) {
                spec.baseObject = this.baseObject.id;
            } else {
                spec.baseObject = this.baseObject.getSpecification();
            }

            return spec;
        },
        getWeight: function (state) {
            let oState = state.getObjectState(this);

            //Support disabled objects:
            if (oState.exists === false) {
                return {
                    mass: 0,
                    cg: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                };
            }

            let p = {
                x: oState.xCentre,
                y: oState.yCentre,
                z: oState.zBase
            };

            let w = this.baseObject.getWeight(oState.fullness);
            let m = w.mass;
            let cg = Vectors.add(p, w.cg);

            if (isNaN(cg.x + cg.y + cg.z)) {
                console.error("DerivedObject.getWeight: returning NaN values.");
            }

            return {
                mass: m,
                cg: cg
            };
        }
    }); //@EliasHasle

    /*
    The object state assignments could/should also have a baseByGroup. A group of baseObjects could for instance be a category including all tanks that carry a given compound, regardless of their size and shape. Maybe "group" is not a good name for something that can be set freely. Maybe "label" or "tag" or something else. The same goes for derivedByGroup.

    With this, there would be five types of assignments:
    common: All objects.
    baseByGroup: Applies to every object that has its base object's property "group" set to the given name.
    baseByID: Applies to all objects that have base object consistent with the given ID:
    derivedByGroup: Applies to every object that has its property "group" set to the given name.
    derivedByID: Applies only to the object with given ID.

    Assignments of subsequent types override assignments of previous types.
    */

    /*
    The caching and version control is clumsy (and incomplete). I (Elias) have done some separate testing of ways to do it properly. This must be implemented later.
    */

    /*
    ShipState now mainly accounts for load state, by which I mean the states of objects in the ship. We need to find out how to best handle other state properties, like global position, heading etc., not to mention properties that change fast, and that depend on time and current state (motion fluctuations etc.).
    */

    function ShipState(specification) {
        this.version = 0;
        this.objectCache = {};
        this.continuous = {};
        this.discrete = {};
        JSONSpecObject.call(this, specification);
    }
    ShipState.prototype = Object.create(JSONSpecObject.prototype);
    Object.assign(ShipState.prototype, {
        constructor: ShipState,
        getSpecification: function () {
            if (this.cachedVersion !== this.version) {
                var spec = {
                    calculationParameters: this.calculationParameters,
                    objectOverrides: this.objectOverrides //{}
                };

                //Sketchy, but versatile:
                spec = JSON.parse(JSON.stringify(spec));

                this.specCache = spec;
                this.cachedVersion = this.version;
            }
            return this.specCache;
        },
        clone: function () {
            return new ShipState(this.getSpecification());
        },
        getObjectState: function (o) {
            if (this.objectCache[o.id] !== undefined) {
                let c = this.objectCache[o.id];
                if (c.thisStateVer === this.version
                    /*&& c.baseStateVer === o.baseObject.baseStateVersion
                    && c.refStateVer === o.referenceStateVersion*/
                ) {
                    console.log("ShipState.getObjectState: Using cache.");
                    return c.state;
                }
            }
            console.log("ShipState.getObjectState: Not using cache.");

            let state = {};
            Object.assign(state, o.baseObject.baseState);
            Object.assign(state, o.referenceState);
            let oo = this.objectOverrides;
            let sources = [oo.common, oo.baseByID[o.baseObject.id], oo.derivedByGroup[o.affiliations.group], oo.derivedByID[o.id]];
            for (let i = 0; i < sources.length; i++) {
                let s = sources[i];
                if (!s) continue;
                let sk = Object.keys(s);
                for (let k of sk) {
                    //Override existing properties only:
                    if (state[k] !== undefined) {
                        state[k] = s[k];
                    }
                }
            }

            this.objectCache[o.id] = {
                thisStateVer: this.version,
                /*baseStateVer: o.baseObject.baseStateVersion,
                refStateVer: o.referenceStateVersion,*/
                state: state
            };

            return state;
        },
        //o is an object, k is a key to a single state property
        getObjectStateProperty: function (o, k) {
            return this.getObjectState(o)[k];
            //I have commented out a compact, but not very efficient, implementation of Alejandro's pattern, that does not fit too well with my caching solution.
            /*		let oo = this.objectOverrides;
            		let sources = [oo.derivedByID[o.id], oo.derivedByGroup[o.affiliations.group], oo.baseByID[o.baseObject.id], oo.common, o.getReferenceState(), o.baseObject.getBaseState()].filter(e=>!!e);
            		for (let i = 0; i < sources.length; i++) {
            			if (sources[i][k] !== undefined) return sources[i][k];
            		}
            		return; //undefined*/
        },
        //Sets this state exclusively from parameter.
        setFromSpecification: function (spec) {
            this.objectCache = {}; //reset cache
            if (!spec) {
                Object.assign(this, {
                    calculationParameters: {},
                    //Named overrides because only existing corresponding properties will be set
                    objectOverrides: {
                        commmon: {},
                        //baseByGroup: {},
                        baseByID: {},
                        derivedByGroup: {},
                        derivedByID: {}
                    }
                });
                return;
            }

            this.calculationParameters = spec.calculationParameters || {};
            this.objectOverrides = {};
            let oo = this.objectOverrides;
            let soo = spec.objectOverrides || {};
            oo.common = soo.common || {};
            oo.baseByID = soo.baseByID || {};
            oo.derivedByGroup = soo.derivedByGroup || {};
            oo.derivedByID = soo.derivedByID || {};

            this.version++;

            return this;
        },
        //Overrides existing directives and adds new ones.
        extend: function (spec) {
            Object.assign(this.calculationParameters, spec.calculationParameters);
            this.calculatedProperties = {};
            let oo = this.objectOverrides;
            let soo = spec.objectOverrides || {};
            Object.assign(oo.common, soo.common);
            let sources = [soo.baseByID, soo.derivedByGroup, soo.derivedByID];
            let targets = [oo.baseByID, oo.derivedByGroup, oo.derivedByID];
            for (let i = 0; i < sources.length; i++) {
                if (!sources[i]) continue;
                let sk = Object.keys(sources[i]);
                for (let k of sk) {
                    if (targets[i][k] !== undefined) {
                        Object.assign(targets[i][k], sources[i][k]);
                    } else {
                        targets[i][k] = sources[i][k];
                    }
                }
            }

            this.version++;
        },
        //Applies only directives of spec that have a corresponding directive in this.
        override: function (spec) {
            let oo = this.objectOverrides;
            let soo = spec.objectOverrides;

            let sources = [spec.calculationParameters, soo.common];
            let targets = [this.calculationParameters, oo.common];
            for (let i = 0; i < sources.length; i++) {
                if (!sources[i]) continue;
                let sk = Object.keys(sources[i]);
                for (let k of sk) {
                    if (targets[i][k] !== undefined) {
                        targets[i][k] = sources[i][k];
                    }
                }
            }

            sources = [soo.common, soo.baseByID, soo.derivedByGroup, soo.derivedByID];
            targets = [oo.common, oo.baseByID, oo.derivedByGroup, oo.derivedByID];

            for (let i = 0; i < sources.length; i++) {
                if (!sources[i]) continue;
                let specKeys = Object.keys(sources[i]);
                for (let key of specKeys) {
                    if (targets[i][key] !== undefined) {
                        let t = targets[i][key];
                        let s = sources[i][key];
                        if (!s) continue;
                        let sk = Object.keys(s);
                        //Loop over individual properties in assignments, and override only:
                        for (let k of sk) {
                            if (t[k] !== undefined) {
                                t[k] = s[k];
                            }
                        }
                    }
                }
            }

            this.version++;
        }
    });

    function StateModule(ship, states) {
        this.ship = ship;
        this.states = states;
    }

    Object.assign(StateModule.prototype, {
        // return getters listed on an output array inside the simulation object
        returnOutput: function () {
            let resObj = {};
            for (let i = 0; i < this.output.length; i++) {
                let output = this[this.output[i]];
                if (typeof output === "number") {
                    resObj[this.output[i]] = output;
                } else if (typeof output === "object") {
                    Object.assign(resObj, output);
                }
            }
            return resObj;
        },
        // write getter output to shipState
        writeOutput: function () {
            let stateName = this.constructor.name;
            if (this.states.discrete[stateName] === undefined) {
                this.states.discrete[stateName] = {
                    state: {},
                    thisStateVer: 0
                };
            }
            for (let i = 0; i < this.output.length; i++) {
                let output = this[this.output[i]];
                if (typeof output === "number") {
                    this.states.discrete[stateName].state[this.output[i]] = output;
                } else if (typeof output === "object") {
                    Object.assign(this.states.discrete[stateName].state, output);
                }
            }
            this.states.discrete[stateName].thisStateVer++;
        },
        setDraft: function () {
            let draft = this.ship.calculateDraft(this.states);
            if (this.states.discrete.FloatingCondition === undefined) {
                this.states.discrete.FloatingCondition = {
                    state: {},
                    thisStateVer: 0
                };
            }
            Object.assign(this.states.discrete.FloatingCondition.state, this.ship.structure.hull.calculateAttributesAtDraft(draft));
            Object.assign(this.states.discrete.FloatingCondition.state, this.ship.calculateStability(this.states));
            this.states.discrete.FloatingCondition.thisStateVer++;
        },
        // write argument speed to vessel state. If undefined, use vessel's design speed
        setSpeed: function (speed) {
            if (this.states.discrete.Speed === undefined) {
                this.states.discrete.Speed = {
                    state: {},
                    thisStateVer: 0
                };
            }
            if (typeof speed === "undefined" && typeof this.ship.designState.calculationParameters.speed !== "undefined") {
                speed = this.ship.designState.calculationParameters.speed;
            }
            this.states.discrete.Speed.state.speed = speed; // knots
            this.states.discrete.Speed.thisStateVer++;
        },
        // write argument heading angle to vessel state. if undefined, use 0 degrees
        // 0 degrees corresponds to vessel pointing to north. clockwise orientation.
        setHeading: function (angle) {
            if (this.states.discrete.Heading === undefined) {
                this.states.discrete.Heading = {
                    state: {},
                    thisStateVer: 0
                };
            }
            if (typeof angle === "undefined") {
                angle = 0;
            }
            this.states.discrete.Heading.state.heading = angle;
            this.states.discrete.Heading.thisStateVer++;
        },
        // cache memoization pattern adapted from http://b-studios.de/blog/2013/11/18/lazy-attributes-in-ecmascript-5/
        // in the future, expand version comparison also to parameters stored inside each constructor
        memoized: function (init, cacheName) {
            return {
                enumerable: true,
                configurable: false,
                get: function cache() {
                    // if state module uses a wave creation object
                    let hasWave;
                    if (this.wavCre !== undefined) {
                        hasWave = true;
                    } else { // if it has only a ship module
                        hasWave = false;
                    }

                    if (this.cache[cacheName] === undefined) {
                        this.cache[cacheName] = {};
                        for (let i = 0; i < this.cacheDependence.length; i++) {
                            let dependenceName = this.cacheDependence[i];
                            this.cache[cacheName][dependenceName + "Version"] = 0;
                        }
                        if (hasWave) {
                            this.cache[cacheName].waveStateVersion = 0;
                        }
                    }

                    let needsUpdate = false;
                    for (let i = 0; i < this.cacheDependence.length; i++) {
                        let dependenceName = this.cacheDependence[i];
                        if (this.cache[cacheName][dependenceName + "Version"] !== this.states.discrete[dependenceName].thisStateVer) {
                            needsUpdate = true;
                            break;
                        }
                    }
                    if (hasWave && needsUpdate === false) {
                        if (this.cache[cacheName].waveStateVersion !== this.wavCre.version) {
                            needsUpdate = true;
                        }
                    }

                    if (needsUpdate) {
                        this.cache[cacheName].value = init.call(this);
                        for (let i = 0; i < this.cacheDependence.length; i++) {
                            let dependenceName = this.cacheDependence[i];
                            this.cache[cacheName][dependenceName + "Version"] = this.states.discrete[dependenceName].thisStateVer;
                        }
                        if (hasWave) {
                            this.cache[cacheName].waveStateVersion = this.wavCre.version;
                        }
                    }
                    return this.cache[cacheName].value;
                }
            };
        }
    });
    // simple function to output regular wave pattern
    function WaveCreator(defList, waveDuration = 3600) { // wave creator constructor
        this.waveDef = {}; // store wave definition
        this.version = 0; // version counter for memorisation pattern
        // set a regular wave definition
        this.setWaveDef = function (freq, amp, head) {
            var newWaveDef;
            newWaveDef = {
                waveFreq: freq, // angular frequency
                waveAmplitude: amp,
                heading: head // 0 to 360. 180 corresponds to head seas
            };
            if (JSON.stringify(this.waveDef) !== JSON.stringify(newWaveDef)) {
                this.waveDef = newWaveDef;
                this.version++;
            }
        };
        this.defList = defList || [ // list wave definitions
            [0.6, 2.25, 180],
            [1.1, 1.75, 150]
        ];
        this.setRandom = function () { // set a wave definition randomly
            var rand = this.defList[Math.floor(Math.random() * this.defList.length)];
            this.setWaveDef(rand[0], rand[1], rand[2]);
        };
        this.setTime = function (time) {
            // change wave definition along time
            var noSpans = time / waveDuration;
            var coord = Math.floor(noSpans % this.defList.length);

            this.setWaveDef(this.defList[coord][0], this.defList[coord][1], this.defList[coord][2]);
        };
    }
    // adapted from http://www.shiplab.ntnu.co/app/shipmotion/

    function WaveMotion(ship, states, wavCre, position = 0, critDampPercentage = 20, g = 9.81, rho = 1025) {
        StateModule.call(this, ship, states);
        if (typeof this.states.discrete.FloatingCondition === "undefined") {
            this.setDraft();
        }
        if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
            this.setSpeed(); // use its design speed
        }
        if (typeof this.states.discrete.Heading === "undefined") {
            this.setHeading();
        }
        this.floatState = this.states.discrete.FloatingCondition.state;
        this.speedState = this.states.discrete.Speed.state;
        this.headingState = this.states.discrete.Heading.state;
        this.wavCre = wavCre;
        this.position = position; // measured position in % of LOA
        this.g = g;
        this.rho = rho;
        this.critical_damping_percentage = critDampPercentage; // this parameter is used to take into account the water viscosity
        this.delta = this.ship.structure.hull.attributes.prismaticLengthRatio; // length ratio of two prismatic bodies that represent the ship
        this.output = ["verticalMotion"];

        this.cacheDependence = ["FloatingCondition", "Speed", "Heading"];
        this.cache = {};
    }

    WaveMotion.prototype = Object.create(StateModule.prototype);

    Object.assign(WaveMotion.prototype, {
        constructor: WaveMotion
    });

    Object.defineProperties(WaveMotion.prototype, {
        coefficients: StateModule.prototype.memoized(function () {
            var bethaDeg = Math.abs(this.wavCre.waveDef.heading - this.headingState.heading);
            var betha = bethaDeg * Math.PI / 180;
            var speedSI = 0.514444 * this.speedState.speed;
            var Froude_N = speedSI / Math.sqrt(this.g * this.floatState.LWL);
            //var wave_period = 2*Math.PI/this.wavCre.waveDef.waveFreq;
            var wave_number = Math.pow(this.wavCre.waveDef.waveFreq, 2) / this.g;
            var eff_wave_number = Math.abs(wave_number * Math.cos(betha));
            var smith_factor = Math.exp(-wave_number * this.floatState.T);
            var alpha = 1 - Froude_N * Math.sqrt(wave_number * this.floatState.LWL) * Math.cos(betha);
            var encounter_frequency = this.wavCre.waveDef.waveFreq * alpha;

            return {
                betha,
                Froude_N,
                wave_number,
                eff_wave_number,
                smith_factor,
                alpha,
                encounter_frequency
            };
        }, "coefficients"),
        verticalMotion: StateModule.prototype.memoized(function () {
            var Breadth = this.floatState.BWL * this.floatState.Cb;
            var cgDistance = this.position / 100 * this.ship.structure.hull.attributes.LOA - this.states.discrete.FloatingCondition.state.w.cg.x;
            var sectional_hydro_damping = 2 * Math.sin(0.5 * this.coefficients.wave_number * Breadth * Math.pow(this.coefficients.alpha, 2)) * Math.exp(-this.coefficients.wave_number *
                this.floatState.T * Math.pow(this.coefficients.alpha, 2));

            var a, b;
            a = Math.pow(1 - this.coefficients.wave_number * this.floatState.T, 2);
            b = Math.pow((Math.pow(sectional_hydro_damping, 2) / (this.coefficients.wave_number * Breadth * Math.pow(this.coefficients.alpha, 3))), 2);
            var f = Math.sqrt(a + b);
            var eta = 1 / (Math.sqrt(Math.pow((1 - 2 * this.coefficients.wave_number * this.floatState.T * Math.pow(this.coefficients.alpha, 2)), 2) + Math.pow(Math.pow(sectional_hydro_damping, 2) /
                (this.coefficients.wave_number * Breadth * Math.pow(this.coefficients.alpha, 2)), 2)));

            var F = this.coefficients.smith_factor * f * (2 / (this.coefficients.eff_wave_number * this.floatState.LWL)) * Math.sin(this.coefficients.eff_wave_number * this.floatState.LWL / 2);
            var FRF_Heave = this.wavCre.waveDef.waveAmplitude * eta * F;

            var G = this.coefficients.smith_factor * f * (24 / (Math.pow(this.coefficients.eff_wave_number * this.floatState.LWL, 2) * this.floatState.LWL)) * (Math.sin(this.coefficients.eff_wave_number *
                this.floatState.LWL / 2) - (this.coefficients.eff_wave_number * this.floatState.LWL / 2) * Math.cos(this.coefficients.eff_wave_number * this.floatState.LWL / 2));
            var FRF_Pitch = this.wavCre.waveDef.waveAmplitude * eta * G;

            var Pitch_Movement = Math.abs(FRF_Pitch * cgDistance);
            var Pitch_Acceleration = Math.pow(this.coefficients.encounter_frequency, 2) * Pitch_Movement;

            var Heave_Amplitude = Math.abs(FRF_Heave);
            var Heave_Acceleration = Math.pow(this.coefficients.encounter_frequency, 2) * Math.abs(FRF_Heave);

            var Vertical_Movement = Math.sqrt(Math.pow(Heave_Amplitude, 2) + Math.pow(Pitch_Movement, 2));
            var Vertical_Acceleration = Math.pow(this.coefficients.encounter_frequency, 2) * Vertical_Movement;

            return {
                pitchAmp: FRF_Pitch,
                pitchMov: Pitch_Movement,
                pitchAcc: Pitch_Acceleration,
                heaveAmp: Heave_Amplitude,
                heaveAcc: Heave_Acceleration,
                verticalMov: Vertical_Movement,
                verticalAcc: Vertical_Acceleration
            };
        }, "verticalMotion"),
        bendingMoment: StateModule.prototype.memoized(function () {
            var Cb_mom = Math.max(0.6, this.floatState.Cb);
            var phi = 2.5 * (1 - Cb_mom);
            var F_Cb = Math.pow(1 - phi, 2) + 0.6 * this.coefficients.alpha * (2 - phi);
            var F_v = 1 + 3 * Math.pow(this.coefficients.Froude_N, 2);
            return this.wavCre.waveDef.waveAmplitude * (this.coefficients.smith_factor * ((1 - this.coefficients.wave_number * this.floatState.T) / (Math.pow(this.floatState.LWL * this.coefficients.eff_wave_number, 2))) *
                (1 - Math.cos(this.coefficients.eff_wave_number * this.floatState.LWL / 2) - (this.coefficients.eff_wave_number * this.floatState.LWL / 4) * Math.sin(this.coefficients.eff_wave_number * this.floatState.LWL / 2)) *
                F_v * F_Cb * Math.pow(Math.abs(Math.cos(this.coefficients.betha)), 1 / 3)) * this.rho * this.g * this.floatState.BWL * Math.pow(this.floatState.LWL, 2) / 1000000;
        }, "bendingMoment"),
        rollAmp: StateModule.prototype.memoized(function () {
            // estimate natural roll period
            var naturalPeriod = (2 * this.floatState.BWL * Math.PI * (0.35 + 0.45) / 2) / Math.pow(this.g * this.floatState.GMt, 0.5);

            var breadth_ratio = (this.floatState.Cwp - this.delta) / (1 - this.delta);
            var A_0 = this.floatState.Cb * this.floatState.BWL * this.floatState.T / (this.delta + breadth_ratio * (1 - this.delta));

            var Breadth_draft_ratio0 = this.floatState.BWL / this.floatState.T;
            var a0, b0, d0;
            if ((3 <= Breadth_draft_ratio0) && (Breadth_draft_ratio0 <= 6)) {
                a0 = 0.256 * Breadth_draft_ratio0 - 0.286;
                b0 = -0.11 * Breadth_draft_ratio0 - 2.55;
                d0 = 0.033 * Breadth_draft_ratio0 - 1.419;
            } else if ((1 <= Breadth_draft_ratio0) && (Breadth_draft_ratio0 < 3)) {
                a0 = -3.94 * Breadth_draft_ratio0 + 13.69;
                b0 = -2.12 * Breadth_draft_ratio0 - 1.89;
                d0 = 1.16 * Breadth_draft_ratio0 - 7.97;
            } else {
                console.error("The B/T relation is not being respected for the roll formula. It should be 1 <= B/T < 6, not" + " " + (this.floatState.BWL / this.floatState.T).toFixed(2) + ".");
            }
            var b_44_0 = this.rho * A_0 * Math.pow(this.floatState.BWL, 2) * a0 * Math.exp(b0 * Math.pow(this.coefficients.encounter_frequency, -1.3)) * Math.pow(this.coefficients.encounter_frequency, d0) /
                (Math.sqrt(this.floatState.BWL / (2 * this.g)));

            var A_1 = breadth_ratio * A_0;
            var B_1 = breadth_ratio * this.floatState.BWL;
            var Breadth_draft_ratio1 = B_1 / this.floatState.T;
            var a1, b1, d1;
            if ((3 <= Breadth_draft_ratio1) && (Breadth_draft_ratio1 <= 6)) {
                a1 = 0.256 * Breadth_draft_ratio1 - 0.286;
                b1 = -0.11 * Breadth_draft_ratio1 - 2.55;
                d1 = 0.033 * Breadth_draft_ratio1 - 1.419;
            } else if ((1 <= Breadth_draft_ratio1) && (Breadth_draft_ratio1 < 3)) {
                a1 = -3.94 * Breadth_draft_ratio1 + 13.69;
                b1 = -2.12 * Breadth_draft_ratio1 - 1.89;
                d1 = 1.16 * Breadth_draft_ratio1 - 7.97;
            } else {
                console.error("The vessel dimensions are out of range for the roll formula.");
            }
            var b_44_1 = this.rho * A_1 * Math.pow(B_1, 2) * a1 * Math.exp(b1 * Math.pow(this.coefficients.encounter_frequency, -1.3)) * Math.pow(this.coefficients.encounter_frequency, d1) /
                (Math.sqrt(B_1 / (2 * this.g)));

            var b_44 = this.floatState.LWL * b_44_0 * (this.delta + b_44_1 * (1 - this.delta) / b_44_0);
            var critical_damping_frac = this.critical_damping_percentage / 100;
            var restoring_moment_coeff = this.g * this.rho * this.floatState.Cb * this.floatState.LWL * this.floatState.BWL * this.floatState.T * this.floatState.GMt;
            var add_damping = restoring_moment_coeff * naturalPeriod / Math.PI;

            var damping_ratio = Math.sqrt(b_44_1 / b_44_0);
            var roll_hydro_damping = b_44 + add_damping * critical_damping_frac;

            var excitation_frequency, A, B, C, D;

            if (this.wavCre.waveDef.heading == 90 || this.wavCre.waveDef.heading == 270) {
                excitation_frequency = Math.sqrt(this.rho * Math.pow(this.g, 2) * b_44_0 / this.coefficients.encounter_frequency) * (this.delta + damping_ratio *
                    (1 - this.delta)) * this.floatState.LWL;
            } else {
                A = Math.abs(Math.sin(this.coefficients.betha)) * Math.sqrt(this.rho * Math.pow(this.g, 2) / this.coefficients.encounter_frequency) * Math.sqrt(b_44_0) * 2 / this.coefficients.eff_wave_number;
                B = Math.pow(Math.sin(0.5 * this.delta * this.floatState.LWL * this.coefficients.eff_wave_number), 2);
                C = Math.pow(damping_ratio * Math.sin(0.5 * (1 - this.delta) * this.floatState.LWL * this.coefficients.eff_wave_number), 2);
                D = 2 * damping_ratio * Math.sin(0.5 * this.delta * this.floatState.LWL * this.coefficients.eff_wave_number) * Math.sin(0.5 * (1 - this.delta) *
                    this.floatState.LWL * this.coefficients.eff_wave_number) * Math.cos(0.5 * this.floatState.LWL * this.coefficients.eff_wave_number);
                excitation_frequency = A * Math.sqrt(B + C + D);
            }

            A = Math.pow(-Math.pow(this.coefficients.encounter_frequency * naturalPeriod / (2 * Math.PI), 2) + 1, 2);
            B = Math.pow(restoring_moment_coeff, 2);
            C = Math.pow(this.coefficients.encounter_frequency * roll_hydro_damping, 2);

            return this.wavCre.waveDef.waveAmplitude * excitation_frequency / (Math.sqrt(A * B + C));
        }, "rollAmp")
    });

    function Positioning(ship, states, path) {
        this.ship = ship;
        this.states = states;

        this.routeData = {};
        this.routeData.pathVec = [];
        this.routeData.unitPath = [];
        this.routeData.heading = [];
        this.routeData.totalDist = 0;
        this.routeData.legDistance = [];
        for (var leg = 0; leg < path.length - 1; leg++) {
            this.routeData.pathVec[leg] = path[leg + 1].map((num, idx) => num - path[leg][idx]);
            this.routeData.legDistance[leg] = Math.sqrt(this.routeData.pathVec[leg].map((num) => Math.pow(num, 2)).reduce((num1, num2) => num1 + num2));
            this.routeData.unitPath[leg] = this.routeData.pathVec[leg].map((num) => num / this.routeData.legDistance[leg]);

            // get heading in relation to North/y axis
            var heading = Math.acos(this.routeData.pathVec[leg][1] / this.routeData.legDistance[leg]);
            heading *= 180 / Math.PI; // convert to degrees

            if (this.routeData.pathVec[leg][0] < 0) {
                heading = 360 - heading;
            }
            this.routeData.heading[leg] = heading;

            this.routeData.totalDist += this.routeData.legDistance[leg];
        }

        // initialize vessel on path
        this.states.continuous.Positioning = {};
        this.states.continuous.Positioning.position = path[0];
        this.states.continuous.Positioning.travelLegDist = 0;
        this.states.continuous.Positioning.travelDist = 0;
        this.positionState = this.states.continuous.Positioning;

        this.states.discrete.Leg = {
            state: {
                leg: 0
            },
            thisStateVer: 1
        };
        this.legState = this.states.discrete.Leg.state;

        if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
            StateModule.prototype.setSpeed.call(this); // use its design speed
        }
        if (typeof this.states.discrete.Heading === "undefined") {
            StateModule.prototype.setHeading.call(this, this.routeData.heading[0]);
        }

        this.advanceShip = function (timeStep) { // calculate advanced distance during one time step
            var remVec, remDist;
            var advDist = timeStep * 1 / 3600 * this.states.discrete.Speed.state.speed;

            while (0 < advDist) {
                remVec = path[this.legState.leg + 1].map((num, idx) => num - this.positionState.position[idx]);
                remDist = Math.sqrt(remVec.map((num) => Math.pow(num, 2)).reduce((num1, num2) => num1 + num2));
                if (advDist <= remDist) {
                    this.positionState.position = this.positionState.position.map((num, idx) => num + advDist * this.routeData.unitPath[this.legState.leg][idx]);

                    // add to traveled distance
                    this.positionState.travelLegDist = this.positionState.travelLegDist + advDist;
                    this.positionState.travelDist = this.positionState.travelDist + advDist;

                    advDist = 0;
                } else if (path[this.legState.leg + 2] !== undefined) { // trip has another leg
                    // change direction and continue sailing
                    advDist -= remDist;
                    this.positionState.position = path[this.legState.leg + 1];

                    // add to traveled distance
                    this.positionState.travelLegDist = 0;
                    this.positionState.travelDist = this.positionState.travelDist + remDist;

                    this.legState.leg++;
                    this.states.discrete.Leg.thisStateVer++;

                    StateModule.prototype.setHeading.call(this, this.routeData.heading[this.legState.leg]);
                    console.log("Vessel reached pivot point in navigation and entered leg " + this.legState.leg + ".");
                } else {
                    this.positionState.position = this.positionState.position.map((num, idx) => num + advDist * this.routeData.unitPath[this.legState.leg][idx]);

                    // add to traveled distance
                    this.positionState.travelLegDist = this.positionState.travelLegDist + advDist;
                    this.positionState.travelDist = this.positionState.travelDist + advDist;

                    console.log("Vessel reached final destination.");
                    break;
                }
            }
        };
    }

    function FuelConsumption(ship, states, powerPlant) {
        StateModule.call(this, ship, states);
        this.propellerState = this.states.discrete.PropellerInteraction.state;

        this.setAuxPower = function (Paux) {
            if (typeof Paux === "undefined") {
                Paux = 0;
            }
            if (typeof this.states.discrete.AuxPower === "undefined") { // Ps and Paux in W each
                this.states.discrete.AuxPower = {
                    state: {},
                    thisStateVer: 0
                }
            }
            this.states.discrete.AuxPower.state.Paux = Paux;
            this.states.discrete.AuxPower.thisStateVer++;
        }
        if (typeof this.states.discrete.AuxPower === "undefined") { // Ps and Paux in W each
            this.setAuxPower(0);
        }
        this.auxPowerState = this.states.discrete.AuxPower.state;

        this.powerPlant = powerPlant;
        this.output = ["consumptionRate"];

        this.cacheDependence = ["PropellerInteraction"];
        this.cache = {};
    }

    FuelConsumption.prototype = Object.create(StateModule.prototype);

    Object.assign(FuelConsumption.prototype, {
        constructor: FuelConsumption
    });

    Object.defineProperties(FuelConsumption.prototype, {
        consumptionRate: StateModule.prototype.memoized(function () { // consumption rate in kg/s
            // share load among engines in a system's array
            function shareLoad(system, load) {
                var triggerRatio = 0.8; // define loading rate at which next engine in the power system will be activated for sharing loads
                var cons = 0;

                var engCapac = [];
                for (var i = 0; i < system.engines.length; i++) {
                    engCapac[i] = system.engines[i].MCR;
                }

                if (typeof system.etag === "number") { // diesel electrical system
                    load = load / (system.etas * system.etag);
                } else { // diesel mechanical system
                    load = load / system.etas; // consumption rate in kg/s
                }

                // distribute loads among engines
                var totalCapac = engCapac.reduce((a, b) => a + b, 0);
                var partCapac = totalCapac - engCapac[engCapac.length - 1];
                var loads = Array(engCapac.length);
                if (load <= triggerRatio * partCapac) { // if not all engines are loaded above trigger ratio, load them according to trigger rate ceil
                    var capSum = 0;
                    loads.fill(0);
                    for (var eng = 0; eng < engCapac.length; eng++) {
                        capSum += engCapac[eng];
                        if (load <= triggerRatio * capSum) { // if engines can support load
                            for (i = 0; i <= eng; i++) { // distribute load proportionally to engines' capacities
                                loads[i] = load / capSum;
                            }
                            break;
                        }
                    }
                } else if (triggerRatio * partCapac < load && load <= totalCapac) { // if all engines are loaded above trigger ratio, make them all have same load %
                    loads.fill(load / totalCapac);
                } else if (load > totalCapac) {
                    console.error("Engines are overloaded. Power plant can't provide current required power.");
                    loads.fill(1);
                }

                // calculate SFOC value for each activated engine
                var SFOC;
                for (i = 0; i < loads.length; i++) {
                    if (loads[i] > 0) { // if engine is active
                        if (system.engines[i].polOrder === 3) {
                            SFOC = system.engines[i].a * Math.pow(loads[i], 3) + system.engines[i].b * Math.pow(loads[i], 2) + system.engines[i].c * loads[i] + system.engines[i].d;
                        } else if (system.engines[i].polOrder === 2) {
                            SFOC = system.engines[i].a * Math.pow(loads[i], 2) + system.engines[i].b * loads[i] + system.engines[i].c;
                        }
                        cons += SFOC / (1000 * 3600) * loads[i] * engCapac[i]; // consumption rate in kg/s
                    }
                }
                return cons;
            }

            var consumptionRate;
            if (typeof this.powerPlant.auxiliary === "object") { // calculate results for vessels which have main and auxiliary power systems
                consumptionRate = this.powerPlant.main.noSys * shareLoad(this.powerPlant.main, this.propellerState.Ps / (1000 * this.powerPlant.main.noSys));
                consumptionRate += shareLoad(this.powerPlant.auxiliary, this.auxPowerState.Paux / 1000);
            } else { // calculate results for vessels which have only one power system
                consumptionRate = shareLoad(this.powerPlant.main, (this.propellerState.Ps + this.auxPowerState.Paux) / 1000);
            }
            return consumptionRate;
        })
    }, "consumptionRate");
    // partially adapted from http://www.shiplab.ntnu.co/app/holtrop/

    function HullResistance(ship, states, propeller, wavCre, g = 9.81, rho = 1025, mi = 0.00122) {
        StateModule.call(this, ship, states);
        this.propeller = propeller;
        if (typeof this.states.discrete.FloatingCondition === "undefined") {
            this.setDraft();
        }
        if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
            this.setSpeed(); // use its design speed
        }
        this.speedState = this.states.discrete.Speed.state;
        this.floatState = this.states.discrete.FloatingCondition.state;
        this.wavCre = wavCre;
        this.g = g;
        this.rho = rho;
        this.mi = mi; // dynamic viscosity
        this.b = this.ship.structure.hull.attributes.bulb; // has a bulb? Boolean.
        this.tr = this.ship.structure.hull.attributes.transom; // transom. Boolean.
        this.cstern = this.ship.structure.hull.attributes.cstern; // afterbody form.
        // Pram with Gondola = -25, V-Shaped Sections = -10, Normal Section Shape = 0, U-Shaped Sections with Hognes Stern = 10
        this.appendices = this.ship.structure.hull.attributes.appendices; // appendices information
        // skegRudder has coeff from 1.5 to 2.0
        // sternRudder has coeff from 1.3 to 1.5
        // twinScrewBalanceRudder has coeff 2.8
        // shaftBrackets has coeff 3.0
        // skeg has coeff from 1.5 to 2.0
        // strutBossings has coeff 3.0
        // hullBossings has coeff 2.0
        // shafts have coeff from 2 to 4
        // stabilizerFins has coeff 2.8
        // dome has coeff 2.7
        // bilgeKeel has coeff 1.4
        this.output = ["totalResistance", "efficiency"];

        this.cacheDependence = ["FloatingCondition", "Speed"];
        this.cache = {};
    }

    HullResistance.prototype = Object.create(StateModule.prototype);

    Object.assign(HullResistance.prototype, {
        constructor: HullResistance
    });

    Object.defineProperties(HullResistance.prototype, {
        coefficients: StateModule.prototype.memoized(function () {
            var lcb = 100 * (this.floatState.LCB - (this.floatState.minXs + this.floatState.LWL / 2)) / this.floatState.LWL; // %

            var Tfore;
            if (this.floatState.draftfp === null) {
                Tfore = this.floatState.T;
            } else {
                Tfore = this.floatState.draftfp;
            }
            var Taft;
            if (this.floatState.draftap === null) {
                Taft = this.floatState.T;
            } else {
                Taft = this.floatState.draftap;
            }
            var T = (Tfore + Taft) / 2; // m, average draft
            var hb = Tfore / 2;
            var abt = Math.PI * Math.pow(Tfore / 2, 2) * this.b / 7.7; // transverse sectional bulb area
            var c3 = 0.56 * (Math.pow(abt, 1.5)) / (this.floatState.BWL * T * (0.31 * Math.pow(abt, 0.5) + Tfore - hb));
            var c2 = Math.exp(-1.89 * Math.pow(c3, 0.5));

            var c4;
            if (Tfore / this.floatState.LWL > 0.04) {
                c4 = 0.04;
            } else {
                c4 = Tfore / this.floatState.LWL;
            }
            // correlation allowance coefficient
            var ca = 0.006 * Math.pow(this.floatState.LWL + 100, -0.16) - 0.00205 + 0.003 * Math.pow(this.floatState.LWL / 7.5, 0.5) * Math.pow(this.floatState.Cb, 4) * c2 * (0.04 - c4);
            var wa = this.floatState.LWL * (2 * T + this.floatState.BWL) * Math.pow(this.floatState.Cm, 0.5) * (0.453 + 0.4425 * this.floatState.Cb - 0.2862 * this.floatState.Cm - 0.003467 *
                this.floatState.BWL / T + 0.3696 * this.floatState.Cwp) + 2.38 * abt / this.floatState.Cb; // wetted area

            var lr = this.floatState.LWL * (1 - this.floatState.Cp + (0.06 * this.floatState.Cp * (lcb / 100) / (4 * this.floatState.Cp - 1)));
            var c14 = 1 + 0.011 * this.cstern;
            var k = 0.93 + (0.487118 * c14 * Math.pow(this.floatState.BWL / this.floatState.LWL, 1.06806) * Math.pow(T / this.floatState.LWL, 0.46106) * Math.pow(this.floatState.LWL /
                lr, 0.121563) * Math.pow(Math.pow(this.floatState.LWL, 3) / this.floatState.Vs, 0.36486) * Math.pow(1 - this.floatState.Cp, -0.604247)); // form factor

            var speedSI = 0.514444 * this.speedState.speed; // convert the speed from knots to m/s
            var re = this.rho * this.floatState.LWL * speedSI / this.mi; // Reynolds number
            var cf = 0.075 / Math.pow((Math.log(re) / Math.log(10)) - 2, 2); // frictional coefficient

            return {
                lcb,
                Tfore,
                Taft,
                T,
                hb,
                c2,
                ca,
                abt,
                wa,
                lr,
                k,
                speedSI,
                cf
            };
        }, "coefficients"),
        calmResistance: StateModule.prototype.memoized(function () { // N, total hull resistance in calm waters
            var at = 0.95 * (this.coefficients.Taft - this.coefficients.Taft * 0.9225) * this.floatState.BWL * 0.89 * this.tr; // transom stern area
            var c3 = 0.56 * (Math.pow(this.coefficients.abt, 1.5)) / (this.floatState.BWL * this.coefficients.T * (0.31 * Math.pow(this.coefficients.abt, 0.5) + this.coefficients.Tfore - this.coefficients.hb));
            var rf = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * this.coefficients.wa * this.coefficients.cf; // frictional resistance

            var fnt;
            if (at === 0) {
                fnt = 0;
            } else {
                fnt = this.coefficients.speedSI / (Math.pow(2 * this.g * at / (this.floatState.BWL + this.floatState.BWL * this.floatState.Cwp), 0.5));
            }
            var c6;
            if (fnt < 5) {
                c6 = 0.2 * (1 - 0.2 * fnt);
            } else {
                c6 = 0;
            }
            var rtr = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * at * c6; // stern resistance
            var sapp = 0;
            var mult = 0;
            for (var prop in this.appendices) {
                sapp += this.appendices[prop].area;
                mult += this.appendices[prop].coeff * this.appendices[prop].area;
            }

            var k2;
            if (sapp !== 0) {
                k2 = mult / sapp;
            } else {
                k2 = 0;
            }
            var rapp = 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * sapp * k2 * this.coefficients.cf; // appendage resistance
            var fn = this.coefficients.speedSI / Math.pow(this.g * this.floatState.LWL, 0.5); //Froude number

            var c7;
            if (this.floatState.BWL / this.floatState.LWL < 0.11) {
                c7 = 0.229577 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.33333);
            } else if (this.floatState.BWL / this.floatState.LWL < 0.25) {
                c7 = this.floatState.BWL / this.floatState.LWL;
            } else {
                c7 = 0.5 - 0.0625 * this.floatState.LWL / this.floatState.BWL;
            }
            // calculate the half angle of entrance
            var ie = 1 + 89 * Math.exp(-Math.pow(this.floatState.LWL / this.floatState.BWL, 0.80856) * Math.pow(1 - this.floatState.Cwp, 0.30484) * Math.pow(1 - this.floatState.Cp - 0.0225 *
                (this.coefficients.lcb / 100), 0.6367) * Math.pow(this.coefficients.lr / this.floatState.BWL, 0.34574) * Math.pow(100 * (this.floatState.Vs / Math.pow(this.floatState.LWL, 3)), 0.16302));
            var c1 = 2223105 * Math.pow(c7, 3.78613) * Math.pow(this.coefficients.T / this.floatState.BWL, 1.07961) * Math.pow(90 - ie, -1.37565);
            var c5 = 1 - (0.8 * at) / (this.floatState.BWL * this.coefficients.T * this.floatState.Cm);

            var c15;
            if (Math.pow(this.floatState.LWL, 3) / this.floatState.Vs < 512) {
                c15 = -1.69385;
            } else if (Math.pow(this.floatState.LWL, 3) / this.floatState.Vs < 1726.91) {
                c15 = -1.69385 + (this.floatState.LWL / Math.pow(this.floatState.Vs, 1 / 3) - 8) / 2.36;
            } else {
                c15 = 0;
            }

            var c16;
            if (this.floatState.Cp < 0.8) {
                c16 = 8.07981 * this.floatState.Cp - 13.8673 * Math.pow(this.floatState.Cp, 2) + 6.984388 * Math.pow(this.floatState.Cp, 3);
            } else {
                c16 = 1.73014 - 0.7067 * this.floatState.Cp;
            }
            var m1 = 0.0140407 * (this.floatState.LWL / this.coefficients.T) - 1.75254 * ((Math.pow(this.floatState.Vs, 1 / 3)) / this.floatState.LWL) - 4.79323 * (this.floatState.BWL / this.floatState.LWL) - c16;

            var lambda;
            if (this.floatState.LWL / this.floatState.BWL > 12) {
                lambda = 1.446 * this.floatState.Cp - 0.36;
            } else {
                lambda = 1.446 * this.floatState.Cp - 0.03 * (this.floatState.LWL / this.floatState.BWL);
            }
            var c17 = 6919.3 * Math.pow(this.floatState.Cm, -1.3346) * Math.pow(this.floatState.Vs / Math.pow(this.floatState.LWL, 3), 2.00977) * Math.pow(this.floatState.LWL / this.floatState.BWL - 2, 1.40692);
            var m3 = -7.2035 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.326869) * Math.pow(this.coefficients.T / this.floatState.BWL, 0.605375);
            var m4_0_4 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.4, -3.29));
            var rwa_0_4 = c1 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m1 * Math.pow(0.4, -0.9) + m4_0_4 * Math.cos(lambda * Math.pow(0.4, -2)));
            var m4_0_55 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(0.55, -3.29));
            var rwa_0_55 = c17 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m3 * Math.pow(0.55, -0.9) + m4_0_55 * Math.cos(lambda *
                Math.pow(0.55, -2)));

            var m4, rwa, rwb, rwab;
            if (fn === 0) {
                m4 = 0;
                rwa = 0; // wave resistance for Froude < 0.4
                rwb = 0; // wave resistance for Froude > 0.55
                rwab = 0;
            } else {
                m4 = c15 * 0.4 * Math.exp(-0.034 * Math.pow(fn, -3.29));
                rwa = c1 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m1 * Math.pow(fn, -0.9) + m4 * Math.cos(lambda * Math.pow(fn, -2)));
                rwb = c17 * this.coefficients.c2 * c5 * this.floatState.Vs * this.rho * this.g * Math.exp(m3 * Math.pow(fn, -0.9) + m4 * Math.cos(lambda * Math.pow(fn, -2)));
                rwab = rwa_0_4 + (10 * fn - 4) * (rwa_0_55 - rwa_0_4) / 1.5;
            }

            var rw;
            if (fn < 0.4) {
                rw = rwa;
            } else if (fn <= 0.55) {
                rw = rwab;
            } else {
                rw = rwb;
            }
            var fni = this.coefficients.speedSI / Math.sqrt(this.g * (this.coefficients.Tfore - this.coefficients.hb - 0.25 * Math.pow(this.coefficients.abt, 0.5)) + (0.15 * Math.pow(this.coefficients.speedSI, 2)));
            var pb = (0.56 * Math.pow(this.coefficients.abt, 0.5)) / (this.coefficients.Tfore - 1.5 * this.coefficients.hb);

            var rb;
            if (this.coefficients.abt === 0) {
                rb = 0;
            } else {
                rb = (0.11 * Math.exp(-3 * Math.pow(pb, -2)) * Math.pow(fni, 3) * Math.pow(this.coefficients.abt, 1.5) * this.rho * this.g) / (1 + Math.pow(fni, 2));
            }

            var ra = 0.91 * 0.5 * this.rho * Math.pow(this.coefficients.speedSI, 2) * this.coefficients.wa * this.coefficients.ca;
            if ((this.floatState.LWL / this.floatState.BWL <= 3.9) || (this.floatState.LWL / this.floatState.BWL >= 15)) {
                console.error("The L/B relation is not being respected. It should be 3.9 < L/B < 15, not" + " " + (this.floatState.LWL / this.floatState.BWL).toFixed(2) + ".");
            }
            if ((this.floatState.BWL / this.coefficients.T <= 2.1) || (this.floatState.BWL / this.coefficients.T >= 4)) {
                console.error("The B/T relation is not being respected. It should be 2.1 < B/T < 4, not" + " " + (this.floatState.BWL / this.coefficients.T).toFixed(2) + ".");
            }
            if ((this.floatState.Cp <= 0.55) || (this.floatState.Cp >= 0.85)) {
                console.error("The prismatic coefficient is not being respected. It should be 0.55 < Cp < 0.85, not" + " " + this.floatState.Cp.toFixed(2) + ".");
            }

            var Rt = this.coefficients.k * rf + rapp + rw + rb + rtr + ra;

            return Rt;
        }, "calmResistance"),
        totalResistance: StateModule.prototype.memoized(function () {
            var Hw = 2 * this.wavCre.waveDef.waveAmplitude; // wave height

            var Rtadd; // N, total resistance including added wave resistance
            if (Hw <= 2) { // use Kreitner formula
                var raddw = 0.64 * Math.pow(Hw * this.floatState.BWL, 2) * this.floatState.Cb * this.rho * this.g / this.floatState.LWL;
                Rtadd = this.calmResistance + raddw;
            } else { // add 20% sea margin
                Rtadd = 1.2 * this.calmResistance;
            }

            var Pe = this.coefficients.speedSI * Rtadd; // effective power

            return {
                Rtadd,
                Pe
            };
        }, "totalResistance"),
        efficiency: StateModule.prototype.memoized(function () {
            var c8;
            if (this.floatState.BWL / this.coefficients.Taft < 5) {
                c8 = this.floatState.BWL * this.coefficients.wa / (this.floatState.LWL * this.propeller.D * this.coefficients.Taft);
            } else {
                c8 = this.coefficients.wa * (7 * this.floatState.BWL / this.coefficients.Taft - 25) / (this.floatState.LWL * this.propeller.D * (this.floatState.BWL / this.coefficients.Taft - 3));
            }

            var c9;
            if (c8 < 28) {
                c9 = c8;
            } else {
                c9 = 32 - 16 / (c8 - 24);
            }

            var c11;
            if (this.coefficients.Taft / this.propeller.D < 2) {
                c11 = this.coefficients.Taft / this.propeller.D;
            } else {
                c11 = 0.0833333 * Math.pow(this.coefficients.Taft / this.propeller.D, 3) + 1.33333;
            }

            var c19;
            if (this.floatState.Cp < 0.7) {
                c19 = 0.12997 / (0.95 - this.floatState.Cb) - 0.11056 / (0.95 - this.floatState.Cp);
            } else {
                c19 = 0.18567 / (1.3571 - this.floatState.Cm) - 0.71276 + 0.38648 * this.floatState.Cp;
            }
            var Cp1 = 1.45 * this.floatState.Cp - 0.315 - 0.0225 * this.coefficients.lcb;
            var cv = this.coefficients.k * this.coefficients.cf + this.coefficients.ca;
            var c20 = 1 + 0.015 * this.cstern;

            var w; // wake factor
            if (this.propeller.noProps === 1) {
                w = c9 * c20 * cv * this.floatState.LWL / this.coefficients.Taft * (0.050776 + 0.93405 * c11 * cv / (1 - Cp1)) + 0.27915 * c20 * Math.pow(this.floatState.BWL / (this.floatState.LWL * (1 - Cp1)), 0.5) + c19 * c20;
            } else if (this.propeller.noProps === 2) {
                w = 0.3095 * this.floatState.Cb + 10 * cv * this.floatState.Cb - 0.23 * this.propeller.D / Math.pow(this.floatState.BWL * this.coefficients.T, 0.5);
            }

            var t; // thrust deduction factor
            if (this.propeller.noProps === 1) {
                t = 0.25014 * Math.pow(this.floatState.BWL / this.floatState.LWL, 0.28956) * Math.pow(Math.pow(this.floatState.BWL * this.coefficients.T, 0.5) / this.propeller.D, 0.2624) /
                    Math.pow(1 - this.floatState.Cp + 0.0225 * this.coefficients.lcb, 0.01762) + 0.0015 * this.cstern;
            } else if (this.propeller.noProps === 2) {
                t = 0.325 * this.floatState.Cb - 0.1885 * this.propeller.D / Math.pow(this.floatState.BWL * this.coefficients.T, 0.5);
            }

            var etah = (1 - t) / (1 - w); // hull efficiency

            return {
                w,
                t,
                etah
            };
        }, "efficiency")
    });
    // This module simulates the propeller and its interaction with hull and engine.

    function PropellerInteraction(ship, states, propeller, rho = 1025) {
        StateModule.call(this, ship, states); // get resistance results in N, W from vessel state
        this.propeller = propeller;
        if (typeof this.states.discrete.FloatingCondition === "undefined") {
            this.setDraft();
        }
        if (typeof this.states.discrete.Speed === "undefined") { // if vessel does not have a speed state
            this.setSpeed(); // use its design speed
        }
        this.speedState = this.states.discrete.Speed.state;
        this.floatState = this.states.discrete.FloatingCondition.state;
        this.resistanceState = this.states.discrete.HullResistance.state;
        this.rho = rho; // kg/m³
        this.output = ["propulsion"];

        this.cacheDependence = ["FloatingCondition", "Speed"];
        this.cache = {};
    }

    PropellerInteraction.prototype = Object.create(StateModule.prototype);

    Object.assign(PropellerInteraction.prototype, {
        constructor: PropellerInteraction
    });

    Object.defineProperties(PropellerInteraction.prototype, {
        propulsion: StateModule.prototype.memoized(function () {
            // convert vessel speed from knots to m/s
            var speedSI = 0.514444 * this.speedState.speed;
            var lcb = 100 * (this.floatState.LCB - (this.floatState.minXs + this.floatState.LWL / 2)) / this.floatState.LWL; // %
            var Va = speedSI / (1 - this.resistanceState.w); // m/s
            var T = this.resistanceState.Rtadd / (this.propeller.noProps * (1 - this.resistanceState.t)); // N, thrust

            var acoeff = T / (this.rho * Math.pow(this.propeller.D * Va, 2));
            var bcoeff = this.propeller.beta2;
            var ccoeff = -this.propeller.beta1;
            var J = (-bcoeff + Math.pow(Math.pow(bcoeff, 2) - 4 * acoeff * ccoeff, 0.5)) / (2 * acoeff);

            var n = Va / (J * this.propeller.D); // rps
            // var npm = 60*n;

            var KT = this.propeller.beta1 - this.propeller.beta2 * J;
            var KQ = this.propeller.gamma1 - this.propeller.gamma2 * J;
            var eta0 = J * KT / (2 * Math.PI * KQ);

            var etar;
            if (this.propeller.noProps === 1) {
                etar = 0.9922 - 0.05908 * this.propeller.AeAo + 0.07424 * (this.floatState.Cp - 0.0225 * lcb);
            } else if (this.propeller.noProps === 2) {
                etar = 0.9737 + 0.111 * (this.floatState.Cp - 0.0225 * lcb) - 0.06325 * this.propeller.P / this.propeller.D;
            }
            var eta = eta0 * this.resistanceState.etah * etar;
            var Ps = this.resistanceState.Pe / eta; // W, required brake power

            return {
                eta,
                Ps,
                n
            };
        }, "propulsion")
    });
    //@EliasHasle

    //Depends on Ship and the other core classes.

    /*
    Handy function for letting the user load a ship design from a local file. (Based on Elias Hasles browseFile function.)

    Typical usage:
    <a onclick="browseShip(useShip)">Click here</a>
    where useShip takes the loaded ship design as a parameter adn does something with it.

    According to the ECMAScript standard, it is required that the file browsing is initiated by the user. Google Chrome seems to handle indirect initiation very well, such as having this function in a click handler.
    */

    "use strict";
    var browseShip = function () {
        var browseButton;
        return function (callback) {
            browseButton = document.createElement("input");
            Object.assign(browseButton, {
                type: "file",
                multiple: false,
                style: "display: none",
                accept: ".json, application/json",
                onchange: function (e) {
                    //console.log("Change event triggered on browse.");
                    let file = browseButton.files[0];
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        let result = event.target.result;
                        let specification = JSON.parse(result);
                        let ship = new Ship(specification);
                        callback(ship);
                    }
                    reader.readAsText(file);
                }
            });
            browseButton.click();
        };
    }(); //@EliasHasle

    //Depends on Ship and the other core classes.

    /*
    Handy function for loading a ship design from file.

    Typical usage:
    var myShip;
    var filePath = "ships/myShip.json";
    Vessel.loadShip(filePath, function(ship) {
    	myShip = ship;
    	doSomething();
    });

    */

    function loadShip(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.addEventListener("load", function (event) {
            var response = event.target.response;
            var specification = JSON.parse(response);
            var ship = new Ship(specification);
            callback(ship);
        });
        request.send(null);
    } //@EliasHasle

    //Very simple download of the specification of a given ship design. Depends on a working getSpecification method.

    function downloadShip(ship) {
        let specification = ship.getSpecification();
        let output = JSON.stringify(specification);
        let link = document.createElement("a");
        link.href = "data:application/json," + encodeURI(output);
        link.download = "shipdesignspecification.json";
        link.target = "_blank";
        link.click();
    }
    Object.assign(Vessel, {
        /*JSONSpecObject: JSONSpecObject,*/
        Ship: Ship,
        Structure: Structure,
        Hull: Hull,
        BaseObject: BaseObject,
        DerivedObject: DerivedObject,
        ShipState: ShipState,
        StateModule: StateModule,
        WaveCreator: WaveCreator,
        WaveMotion: WaveMotion,
        Positioning: Positioning,
        FuelConsumption: FuelConsumption,
        HullResistance: HullResistance,
        PropellerInteraction: PropellerInteraction,
        browseShip: browseShip,
        loadShip: loadShip,
        downloadShip: downloadShip,
        f: {
            linearFromArrays: linearFromArrays,
            bilinear: bilinear,
            bisectionSearch
        },
        Vectors: Vectors
    });
})();