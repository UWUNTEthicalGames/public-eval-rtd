var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 30
}

var width = 0;
var height = 0;

var color = {
    "Credit history": '#8A7E9D',
    "Environment": '#54575C',
    "Income": '#14577C'

};
var barPadding = 5;

// d3.csv('data in array.txt').then((data) => {
//     console.log(data)
//     d = dataRead(data);
//     d = parseData(d);
//     barChart(d);
// });


export function loadBarChart(barchart_obj, data, extendedName = "") {
	const top_left = barchart_obj.layer.layerToCssPx(0, 0);
	const bot_right = barchart_obj.layer.layerToCssPx(barchart_obj.width, barchart_obj.height);
	width = Math.floor(bot_right[0] - top_left[0] - margin.left - margin.right);
	height = Math.floor(bot_right[1] - top_left[1] - margin.top - margin.bottom);
	console.log(width, height);
	
	// debugger;
	let d = dataRead(data);
	d = parseData(d);
	barChart(d, extendedName);
}

function dataRead(data) {
    const headers1 = data[0];
    const result = [];
    for (var row = 1; row < data.length; row++) {

        var dataObj = {}
        dataObj[headers1[0]] = data[row][0];
        dataObj[headers1[1]] = data[row][1];
        dataObj[headers1[2]] = data[row][2];
        result.push(dataObj)
    }
    return result;
}

function parseData(data) {
    const result = [];
    let row = {};
    let prevColumn = data[0].column;
    data.forEach(d => {
        if (row.key === d.column)
            row.values.push({ key: d.category, value: d.count });
        else if (d.column !== prevColumn) {
            result.push(row);
            row = { key: d.column, values: [{ key: d.category, value: d.count }] }
            prevColumn = d.column;
        }
        else
            row = { key: d.column, values: [{ key: d.category, value: d.count }] }
    });
    result.push(row);
	console.log("parseData result");
	console.log(result);
    return result;
};

function barChart(data, extendedName = "") {
    var rangeBands = [];
    var cummulative = 0;
    data.forEach(function (val, i) {
        val.cummulative = cummulative;
        cummulative += val.values.length;
        val.values.forEach(function (values) {
            values.parentKey = val.key;
            rangeBands.push(i);
        })
    });

    var y_category = d3.scaleLinear().range([height, 0]);

    var y_subCategory = d3.scaleBand().domain(rangeBands).rangeRound([0, width], .1);
    var y_category_domain = y_subCategory.bandwidth() * rangeBands.length;
    y_category.domain([y_category_domain, 0]);

    var x = d3.scaleLinear([0, 20], ["red", "blue"]).range([margin.left, width]);

    /*x.domain([0, d3.max(data, function (cat) {
        return d3.max(cat.values, function (def) {
            return def.value + 1;
        });
    })]);*/

    d3.axisLeft().scale(y_category);

    var xAxis = d3.axisBottom().scale(x);
        //.scale(x).tickFormat(d3.format("s"));

	d3.select("#barchart" + extendedName + "> *").remove(); 
    var svg = d3.select("#barchart" + extendedName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.style('background-color', 'EFEFEF')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (0) + ")");

    svg.append("g")
        .attr("class", "axis")
        .call(xAxis)
        .attr("transform", 'translate(0, ' + (height + 15) + ')')

    var category_g = svg.selectAll(".category")
        .data(data)
        .enter().append("g")
        .attr("class", function (d) {
            return 'category category-' + d.key;
        })
        .attr("transform", function (d) {
            return "translate(0, " + y_category((d.cummulative * y_subCategory.bandwidth())) + ")";
        })
        .attr("fill", function (d) {
            return color[d.key];
        });

    /*category_g.selectAll(".category-label")
        .data(function (d) {
            return [d];
        })
        .enter().append("text")
        .attr("class", function (d) {
            return 'category-label category-label-' + d.key;
        })
        .attr("transform", function (d) {
            var x_label = 0;
            var y_label = y_category((d.values.length * y_subCategory.bandwidth() + barPadding + 5) / 2) + margin.top / 2;
            return "translate(" + x_label + "," + y_label + ")";
        })
        .text(function (d) {
            return d.key;
        })
        .attr('text-anchor', 'middle');*/

    var subCategory_g = category_g.selectAll(".subCategory")
        .data(function (d) {
            return d.values;
        })
        .enter().append("g")
        .attr("class", function (d) {
            return 'subCategory subCategory-' + d.key;
        })
        .attr("transform", function (d, i) {
            return "translate(0," + y_category((i * y_subCategory.bandwidth())) + ")";
        });

    subCategory_g.selectAll(".subCategory-label")
        .data(function (d) {
            return [d];
        })
        .enter().append("text")
        .attr("class", function (d) {
            return 'subCategory-label subCategory-label-' + d.key;
        })
        .attr("transform", function (d) {
            var x_label = 0; // x(d.value) + margin.left;
            var y_label = y_category((y_subCategory.bandwidth()) / 2) + margin.top / 2;
            return "translate(" + x_label + "," + y_label + ")";
        })
        .text(function (d) {
            return d.key;
        })
        .attr('text-anchor', 'middle');

    subCategory_g.selectAll('.rect')
        .data(function (d) {
            return [d];
        })
        .enter()
        .append("rect")
        .transition()
        .duration(0)
        .attr("class", "rect")
        .attr("height", y_category(y_subCategory.bandwidth() - barPadding))
        .attr("y", function (d) {
            return y_category(barPadding) + margin.top / 2;
        })
        .attr("x", function (d) {
            return margin.left;
        })
        .attr("width", function (d) {
            return x(d.value) - margin.left;
        });
}