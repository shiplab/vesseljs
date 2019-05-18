// adapted from https://bl.ocks.org/mbostock/3887118
scatterPlot = function(data, value, cost) {
	d3.select("#scatterSVG").remove();

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var opacity = function(d) {
		if (d.front) {return 1;}
		else {return 0.1;}
	};

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select("#scatter").append("svg")
		.attr("id", "scatterSVG")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	data.forEach(function(d) {
		d[value] = +d[value];
		d[cost] = +d[cost];
	});

	x.domain(d3.extent(data, function(d) {return d[cost];})).nice();
	y.domain(d3.extent(data, function(d) {return d[value];})).nice();

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(cost);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(value);

	svg.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) {return x(d[cost]);})
		.attr("cy", function(d) {return y(d[value]);})
		.on("click", function(d) {document.getElementById("designData").innerHTML = JSON.stringify(d, null, 2);})
		.style("fill-opacity", opacity);

	if (data[0]["power plant index"] === undefined) {
		svg.selectAll(".dot")
			.style("fill", "steelblue");
	} else {
		var color = d3.scale.category10();

		svg.selectAll(".dot")
			.style("fill", function(d) {return color("power plant " + d["power plant index"]);});

		var legend = svg.selectAll(".legend")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {return "translate(0," + i * 20 + ")";});

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {return d;});
	}
};
