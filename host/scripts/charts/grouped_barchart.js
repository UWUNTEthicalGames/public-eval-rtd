//import * as d3 from "d3";

var margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 40
},
    width = 560 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
var color = {
    age: '#4A7B9D',
    education: '#54577C'
};
var barPadding = 40;

// d3.csv('data in array.txt').then((data) => {
//     console.log(data)
//     d = dataRead(data);
//     d = parseData(d);
//     barChart(d);
// });




export function loadBarChart() {
	let d = [['column', 'category', 'count'],
	['age', 'young', 4],
	['age', 'old', 6],
	['age', 'older', 1],
	['education', 'GRD', 8],
	['education', 'PHD', 2],
	['education', 'UG', 4],
	['education', 'HS', 5],
	['education', 'MidSchool', 3],
	['gender', 'Male', 6],
	['gender', 'Female', 2]]
	// debugger;
	d = dataRead(d);
	d = parseData(d);
	console.log(d3.select("#barchart"));
	barChart(d);
}

function dataRead(data) {
    let headers1 = data[0]
    let result = []
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
    let result = []
    let row = {}
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
    return result;
};


function barChart(data) {
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

    var x_category = d3.scaleLinear()
        .range([0, width]);


    var x_subCategory = d3.scaleBand().domain(rangeBands).rangeRound([0, width], .1);
    var x_category_domain = x_subCategory.bandwidth() * rangeBands.length;
    x_category.domain([0, x_category_domain]);


    var y = d3.scaleLinear()
        .range([height, 0]);

    y.domain([0, d3.max(data, function (cat) {
        return d3.max(cat.values, function (def) {
            return def.value;
        });
    })]);

    var category_axis = d3.axisBottom()
        .scale(x_category)

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(5)
    //.tickFormat(d3.format(".1s"));

    var svg = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.style('background-color', 'EFEFEF')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
    //   .text("Value");

    var category_g = svg.selectAll(".category")
        .data(data)
        .enter().append("g")
        .attr("class", function (d) {
            return 'category category-' + d.key;
        })
        .attr("transform", function (d) {
            return "translate(" + x_category((d.cummulative * x_subCategory.bandwidth())) + ",0)";
        })
        .attr("fill", function (d) {
            return color[d.key];
        });

    var category_label = category_g.selectAll(".category-label")
        .data(function (d) {
            return [d];
        })
        .enter().append("text")
        .attr("class", function (d) {
            return 'category-label category-label-' + d.key;
        })
        .attr("transform", function (d) {
            var x_label = x_category((d.values.length * x_subCategory.bandwidth() + barPadding) / 2);
            var y_label = height + 30;
            return "translate(" + x_label + "," + y_label + ")";
        })
        .text(function (d) {
            return d.key;
        })
        .attr('text-anchor', 'middle');

    var subCategory_g = category_g.selectAll(".subCategory")
        .data(function (d) {
            return d.values;
        })
        .enter().append("g")
        .attr("class", function (d) {
            return 'subCategory subCategory-' + d.key;
        })
        .attr("transform", function (d, i) {
            return "translate(" + x_category((i * x_subCategory.bandwidth())) + ",0)";
        });

    var subCategory_label = subCategory_g.selectAll(".subCategory-label")
        .data(function (d) {
            return [d];
        })
        .enter().append("text")
        .attr("class", function (d) {
            return 'subCategory-label subCategory-label-' + d.key;
        })
        .attr("transform", function (d) {
            var x_label = x_category((x_subCategory.bandwidth() + barPadding) / 2);
            var y_label = height + 10;
            return "translate(" + x_label + "," + y_label + ")";
        })
        .text(function (d) {
            return d.key;
        })
        .attr('text-anchor', 'middle');


    var rects = subCategory_g.selectAll('.rect')
        .data(function (d) {
            return [d];
        })
        .enter().append("rect")
        .attr("class", "rect")
        .attr("width", x_category(x_subCategory.bandwidth() - barPadding))
        .attr("x", function (d) {
            return x_category(barPadding);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        });
}


