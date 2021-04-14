// adapted from https://bl.ocks.org/mbostock/3887118
class LineChartEfficiency {
	// Function to create a chart line with d3.js
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
	var fontSize = "10";

	this.margin = {top: 30, right: 30, bottom: 30, left: 40};
	this.width = size.width - this.margin.left - this.margin.right;
	this.height = size.height - this.margin.top - this.margin.bottom;

	// debugger
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

		lineChart.svg.append("circle")
			.attr('cx', xf(x))
			.attr('cy', yf(y) )
			.attr('r', r + 'px')
			.style('fill', color);    
	}

}