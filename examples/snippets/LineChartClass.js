// adapted from https://bl.ocks.org/mbostock/3887118
class LineChartClass {
	// Class to create a chart line with d3.js
	// id: set id in the svg (string)
	// data: data object containing the {time: xkey used (float), ykey: value defined for ykey key (value)}
	// xkey: key to define xkey key (stringxlabel)
	// ylabel: xAxisBottom title (string)
	// ykey: key to define ykey key (string)
	// ylabel: yAxisLeft title (string)
	// parentId: parent string id (string)
	// size: object containing the {width: (float), height: (float)}
	constructor(id, data, objLabel, parentId = "lineChart", size = {width: 350, height: 350}) {
		this.id = id;
		this.data = data;
		this.xkey = objLabel.xkey;
		this.xlabel = objLabel.xlabel;
		this.ykey = objLabel.ykey;
		this.ylabel = objLabel.ylabel;
		this.parentId = parentId

		d3.select("#" + id).remove();

		this.margin = {top: 30, right: 30, bottom: 30, left: 40};
		this.width = size.width - this.margin.left - this.margin.right;
		this.height = size.height - this.margin.top - this.margin.bottom;

	}

}

class PositionGraph extends LineChartClass {
	constructor(id, data, objLabel, parentId, size) {
		super(id, data, objLabel, parentId , size)

		var fontSize = "10";

		// changed the widht and height
		var x = d3.scale.linear()
		.range([0, this.width]); // This is where the axis is placed: from 0px to (this.width)px

		var y = d3.scale.linear()
			.domain(d3.extent(data.map((d) => d[objLabel.xkey]))).nice() // This is what is written on the Axis: from 0 to 100
			.range([this.height, 0]);

		var xAxisBottom = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickSize(1);

		var xAxisCenter = d3.svg.axis()
			.scale(x)
			.tickSize(1);

		var xAxisTop = d3.svg.axis()
			.scale(x)
			.orient("top")
			.tickSize(1);

		var yAxisLeft = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickSize(1);

		var yAxisCenter = d3.svg.axis()
			.scale(y)
			.orient("right")
			.tickSize(1);

		var yAxisRight = d3.svg.axis()
			.scale(y)
			.orient("right")
			.tickSize(1);

		this.svg = d3.select("#" + this.parentId).append("svg")
			.attr("id", id)
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// x.domain(d3.extent(data, function(d) {return d[xkey]})).nice();
		// y.domain([-10, d3.max(data, function(d) {return d[ykey];})]).nice();
		x.domain([-500, 500]).nice();
		y.domain([-500, 500]).nice();

		data.fit = {x ,y}
		this.x = x
		this.y = y

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(xAxisBottom)
			.attr("font-size", fontSize)
			.append("text")
			.attr("class", "label")
			.attr("x", this.width - 5)
			.attr("y", 25)
			.style("text-anchor", "end")
			.text(objLabel.xlabel);

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height/2 + ")")
			.call(xAxisCenter)
			.attr("font-size", 0)

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0, 0)")
			.call(xAxisTop)
			.attr("font-size", fontSize)

		this.svg.append("g")
			.attr("class", "y axis")
			.call(yAxisLeft)
			.attr("font-size", fontSize)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", -35)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(objLabel.ylabel);

		this.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + this.width + ", 0)")
			.call(yAxisRight)
			.attr("font-size", fontSize)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")

		this.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + this.width/2 + ", 0)")
			.call(yAxisCenter)
			.attr("font-size", 0)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")

		this.svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 5)
			.attr("cx", function(d) {return x(d[objLabel.xkey]);})
			.attr("cy", function(d) {return y(d[objLabel.ykey]);});

		this.svg.selectAll(".dot")
			.style("fill", "steelblue");


			// MODELS OF APPEND FUNCTIONS

			// lineChart.svg.append("rect")
			// .attr('class', 'legend-rect')
			// .attr("x", 100)
			// .attr("y", 100)
			// .attr("width", 20)
			// .attr("height", 20)
			// .style("fill", "red");

			// 	lineChart.svg.append("circle")
			// .attr('cx',106.661513 )
			//   .attr('cy', 35.05917399 )
			//   .attr('r','100px')
			//   .style('fill', 'red');  
	}

	draw = (x, y, r = 1, color = "red") => {
		var xf = this.x;
		var yf = this.y;

		this.svg.append("circle")
			.attr('cx', xf(x))
			.attr('cy', yf(y) )
			.attr('r', r + 'px')
			.style('fill', color);    
	}
	
}

class ConsGraph extends LineChartClass {
	constructor(id, data, objLabel, parentId, size) {
		super(id, data, objLabel, parentId , size)

		var fontSize = "10";

		// changed the widht and height
		var x = d3.scale.linear()
		.range([0, this.width]); // This is where the axis is placed: from 0px to (this.width)px

		var y = d3.scale.linear()
			.domain(d3.extent(data.map((d) => d[objLabel.xkey]))).nice() // This is what is written on the Axis: from 0 to 100
			.range([this.height, 0]);

		var xAxisBottom = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickSize(1);

		var xAxisCenter = d3.svg.axis()
			.scale(x)
			.tickSize(1);

		// var xAxisTop = d3.svg.axis()
		// 	.scale(x)
		// 	.orient("top")
		// 	.tickSize(1);

		var yAxisLeft = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickSize(1);

		var yAxisCenter = d3.svg.axis()
			.scale(y)
			.orient("right")
			.tickSize(1);

		// var yAxisRight = d3.svg.axis()
		// 	.scale(y)
		// 	.orient("right")
		// 	.tickSize(1);

		this.svg = d3.select("#" + this.parentId).append("svg")
			.attr("id", id)
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// x.domain(d3.extent(data, function(d) {return d[xkey]})).nice();
		// y.domain([-10, d3.max(data, function(d) {return d[ykey];})]).nice();
		x.domain([0, 1]).nice();
		y.domain([0, 1]).nice();

		data.fit = {x ,y}
		this.x = x
		this.y = y

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(xAxisBottom)
			.attr("font-size", fontSize)
			.append("text")
			.attr("class", "label")
			.attr("x", this.width - 5)
			.attr("y", 25)
			.style("text-anchor", "end")
			.text(objLabel.xlabel);

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height/2 + ")")
			.call(xAxisCenter)
			.attr("font-size", 0)

		// this.svg.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(0, 0)")
		// 	.call(xAxisTop)
		// 	.attr("font-size", fontSize)

		this.svg.append("g")
			.attr("class", "y axis")
			.call(yAxisLeft)
			.attr("font-size", fontSize)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", -35)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(objLabel.ylabel);

		// this.svg.append("g")
		// 	.attr("class", "y axis")
		// 	.attr("transform", "translate(" + this.width + ", 0)")
		// 	.call(yAxisRight)
		// 	.attr("font-size", fontSize)
		// 	.append("text")
		// 	.attr("class", "label")
		// 	.attr("transform", "rotate(-90)")

		this.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + this.width/2 + ", 0)")
			.call(yAxisCenter)
			.attr("font-size", 0)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")

		this.svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 5)
			.attr("cx", function(d) {return x(d[objLabel.xkey]);})
			.attr("cy", function(d) {return y(d[objLabel.ykey]);});

		this.svg.selectAll(".dot")
			.style("fill", "steelblue");


			// MODELS OF APPEND FUNCTIONS

			// lineChart.svg.append("rect")
			// .attr('class', 'legend-rect')
			// .attr("x", 100)
			// .attr("y", 100)
			// .attr("width", 20)
			// .attr("height", 20)
			// .style("fill", "red");

			// 	lineChart.svg.append("circle")
			// .attr('cx',106.661513 )
			//   .attr('cy', 35.05917399 )
			//   .attr('r','100px')
			//   .style('fill', 'red');  
	}

	draw = (x, y, r = 1, color = "red") => {
		var xf = this.x;
		var yf = this.y;


		this.svg.append("circle")
			.attr('cx', xf(x))
			.attr('cy', yf(y) )
			.attr('r', r + 'px')
			.style('fill', color);    
	}

	drawLineGeneric = (x, y, propeller, r = 1, color = "red") => {
		var xf = this.x;
		var yf = this.y;
		
		var maxTorque = 400000; // Maximum torque of the motor [N.m]
		var maxRot = propeller.maxRot / 60 // Maximum Rotation of the motor [Hz]
		var PotMax = 2*500000; // this is especified in the motor example and should be let here
		var minRot = 0.1 * maxRot; // [Hz]

		// The maximun Q is when J = 0. KQ = gamma1
		// var Qmax = propeller.gamma1 * 1025 * Math.pow(minRot, 2) * Math.pow(propeller.D, 5);
		var PotMin = maxTorque * minRot;

		var yini	= PotMin/PotMax;

		var rotAtMaxPot = PotMax/maxTorque;

		var xFin = rotAtMaxPot / maxRot;

		// This is for appending the value path
		// svg.append("path")
    //   .datum(data)
    //   .attr("fill", "none")
    //   .attr("stroke", "black")
    //   .attr("stroke-width", 2.5)
    //   .attr("stroke-linejoin", "round")
    //   .attr("stroke-linecap", "round")
    //   .attr("stroke-dasharray", `0,${l}`)
    //   .attr("d", line)

		// data = {orient: "left", name: "1956", x: 3683.6965, y: 2.3829}

		// Appending Lines
		this.svg.append("line")
			.style("stroke-dasharray", ("10,3"))  // dash
			.style("stroke", "red")  // colour the line
			.attr("x1", xf(0.1))     
			.attr("y1", yf(0))    
			.attr("x2", xf(0.1))
			.attr("y2", yf(yini));
		this.svg.append("line")
			.style("stroke-dasharray", ("10,3"))  // dash
			.style("stroke", "red")  // colour the line 
			.attr("x1", xf(0.1))
			.attr("y1", yf(yini))
			.attr("x2", xf(xFin))
			.attr("y2", yf(1));
		this.svg.append("line")
			.style("stroke-dasharray", ("10,3"))  // dash
			.style("stroke", "red")  // colour the line 
			.attr("x1", xf(xFin))
			.attr("y1", yf(1))
			.attr("x2", xf(1))
			.attr("y2", yf(1));
		this.svg.append("line")
			.style("stroke-dasharray", ("10,3"))  // dash
			.style("stroke", "red")  // colour the line 
			.attr("x1", xf(1))
			.attr("y1", yf(1))
			.attr("x2", xf(1))
			.attr("y2", yf(0));
	}
	
}



// LineChartClass = function(id, data, ykey, ylabel) {
// 	// Function to create a chart line with d3.js
// 	// id: set id in the svg (string)
// 	// data: data object containing the {time: xkey used (float), ykey: value defined for ykey key (value)}
// 	// ykey: key to define ykey key (string)
// 	// ylabel: yAxisLeft title (string)

// 	// dependecies: d3.js

// 	d3.select("#" + id).remove();
// 	var fontSize = "20";

// 	var margin = {top: 10, right: 20, bottom: 30, left: 40},
// 		width = 430 - margin.left - margin.right,
// 		height = 250 - margin.top - margin.bottom;

// 	var x = d3.scale.linear()
// 		.range([0, width]);

// 	var y = d3.scale.linear()
// 		.range([height, 0]);

// 	var xAxisBottom = d3.svg.axis()
// 		.scale(x)
// 		.orient("bottom");

// 	var yAxisLeft = d3.svg.axis()
// 		.scale(y)
// 		.orient("left");

// 	var svg = d3.select("#lineChart").append("svg")
// 		.attr("id", id)
// 		.attr("width", width + margin.left + margin.right)
// 		.attr("height", height + margin.top + margin.bottom)
// 		.append("g")
// 		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 	x.domain(d3.extent(data, function(d) {return d.time;})).nice();
// 	y.domain([0, d3.max(data, function(d) {return d[ykey];})]).nice();

// 	svg.append("g")
// 		.attr("class", "x axis")
// 		.attr("transform", "translate(0," + height + ")")
// 		.call(xAxisBottom)
// 		.attr("font-size", fontSize)
// 		.append("text")
// 		.attr("class", "label")
// 		.attr("x", width)
// 		.attr("y", -6)
// 		.style("text-anchor", "end")
// 		.text("Time (s)");

// 	svg.append("g")
// 		.attr("class", "y axis")
// 		.call(yAxisLeft)
// 		.attr("font-size", fontSize)
// 		.append("text")
// 		.attr("class", "label")
// 		.attr("transform", "rotate(-90)")
// 		.attr("y", 6)
// 		.attr("dy", ".71em")
// 		.style("text-anchor", "end")
// 		.text(ylabel);

// 	svg.selectAll(".dot")
// 		.data(data)
// 		.enter().append("circle")
// 		.attr("class", "dot")
// 		.attr("r", 1.5)
// 		.attr("cx", function(d) {return x(d.time);})
// 		.attr("cy", function(d) {return y(d[ykey]);});

// 	svg.selectAll(".dot")
// 		.style("fill", "steelblue");
// };
