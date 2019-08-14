// const svg = d3.select('svg');
// svg.style('background-color', 'orange');
import * as d3 from 'd3'


const result = {}

// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
var y = d3.scaleLinear()
    .range([height, 0]);
    
d3.csv('/data/shopfluencing.csv').then(data => {
    data.forEach((row) => {
        // debugger
        let segmentType = row['Segment Type'];
        let segmentDescription = row['Segment Description'];
        let platform = row['Platform']
        // this is a shortcut to check if result has the segmentType key already
        // this means use the same value if it not undefined. if it is undefined, 
        // that means we have never set it before, so start it with an empty {}
        result[segmentType] = result[segmentType] || {};
        result[segmentType][segmentDescription] = result[segmentType][segmentDescription] || {}
        result[segmentType][segmentDescription][platform] = row['Count']
    })
    console.log(result);

    
    let ethnicityData = result['Ethnicity'];
    console.log(ethnicityData);

    for (let key in ethnicityData) {
        let segmentData = ethnicityData[key];
        buildChart(segmentData)
    }

    
    
})

var buildChart = function(segmentData) {
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let chartData = [];
    for (let platform in segmentData) {
        let count = segmentData[platform];
        let obj = {
            'platformName': platform,
            'count': count
        }
        chartData.push(obj);
    }


    // format the data
    chartData.forEach(function (d) {
        d.count = +d.count;
    });

    // Scale the range of the data in the domains
    x.domain(chartData.map(function (d) { return d.platformName; }));
    y.domain([0, d3.max(chartData, function (d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(chartData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.platformName); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.count); })
        .attr("height", function (d) { return height - y(d.count); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}







