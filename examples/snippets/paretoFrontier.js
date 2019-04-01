// sort d3 data object in order of increasing cost
function sort(data, cost) {
	data.sort(function(x, y) {
		return d3.ascending(x[cost], y[cost]);
	});
}

// compute pareto frontier, assuming order array indexes datum according to increasing costs
function computePareto(data, value, cost) {
	var i = 0;
	data[i].front = true;
	for (var j = i + 1; j < data.length; j++) {
		if (data[j][value] > data[i][value]) {
			if (data[i][cost] === data[j][cost]) { // if new optimal solution has same cost as last one
				data[i].front = false; // overwrite last one
				data[j].front = true;
			} else {
				data[j].front = true;
			}
			i = j;
			continue;
		} else {
			data[j].front = false;
		}
	}
}
