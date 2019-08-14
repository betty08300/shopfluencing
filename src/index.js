// const svg = d3.select('svg');
// svg.style('background-color', 'orange');
import * as d3 from 'd3'


const result = {}


    
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

    // Build left side with segments
    buildLeftSide(result);
    
    let ethnicityData = result['Ethnicity'];
    console.log(ethnicityData);

    // Build right side charts
    buildRightCharts(ethnicityData)

    // TODO: build middle chart

    buildPieCharts(platform)
    
})

let buildRightCharts = (segmentsData) => {
    // Build a chart for each subSegment data
    // ie. Gender segment has Male and Female subsegments
    for (let subSegment in segmentsData) {
        buildRightChart(segmentsData[subSegment])
    }
}

var buildRightChart = function(subSegmentData) {
    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 300 - margin.left - margin.right,
        height = 180 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(".right-side").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let chartData = [];
    for (let platform in subSegmentData) {
        let count = subSegmentData[platform];
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

let buildLeftSide = function(result) {
    let segmentsArr = Object.keys(result);
    let leftSideContainer = document.getElementsByClassName('left-side')[0];

    for (let i = 0; i < segmentsArr.length; i++) {
        let label = segmentsArr[i];

        // Create child div
        let div = document.createElement('div');
        div.className = 'segment-label';
        // Set onclick handler for each div
        div.onclick = function() { handleSegmentClick(result[label]) }
        let textNode = document.createTextNode(label);
        div.appendChild(textNode);

        // Append div to left side container
        leftSideContainer.appendChild(div)
    }
}

let handleSegmentClick = function(segmentsData) {
    console.log(segmentsData);
    // Remove all child svg charts inside the right-side div
    d3.select(".right-side").selectAll('svg').remove();
    // Rebuild charts for segmentsData
    buildRightCharts(segmentsData)
}

let buildPieCharts = (platformData) => {
    for (let platform in platformData){
        buildPieChart(platformData[platform])
    }
}

let buildPieChart = function (platform){
    const arcs = pie(platform);

    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    svg.append("g")
        .attr("stroke", "white")
        .selectAll("path")
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.platform.name))
        .attr("d", arc)
        .append("title")
        .text(d => `${d.platform.name}: ${d.platform.value.toLocaleString()}`);

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(platform)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.platform.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.platform.value.toLocaleString()));

    return svg.node();
}
