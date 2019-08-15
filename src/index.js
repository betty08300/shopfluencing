// const svg = d3.select('svg');
// svg.style('background-color', 'orange');
import * as d3 from 'd3'
import '../src/scss/index.scss'


const result = {}

d3.csv('/data/shopfluencing.csv').then(dataArr => {
    dataArr.forEach((row) => {
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

    let startingData = result['Gender'];
    // console.log(startingData);

    // Build right side charts
    buildRightCharts(startingData)

    buildPieChart(startingData['Male voters'])

})

let buildRightCharts = (segmentsData) => {
    // {
    //     'Male voters': {fb: 10, ig:20},
    //     'Female voters': 432
    // }

    // Build a chart for each subSegment data
    // ie. Gender segment has Male and Female subsegments
    for (let subSegmentTitle in segmentsData) {
        buildRightChart(subSegmentTitle, segmentsData[subSegmentTitle])
    }
}

var buildRightChart = function (title, subSegmentData) {
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

    svg.append('text')
        .attr('x', (width / 2))
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .text(title)

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

let buildLeftSide = function (result) {
    let segmentsArr = Object.keys(result);
    let leftSideContainer = document.getElementsByClassName('left-side')[0];

    for (let i = 0; i < segmentsArr.length; i++) {
        let label = segmentsArr[i];

        // Create child div
        let div = document.createElement('div');
        div.className = 'segment-label';
        let textNode = document.createTextNode(label);
        div.appendChild(textNode);

        // Set onclick handler for each div
        div.onclick = function() { handleSegmentClick(result[label]) }

        // Append div to left side container
        leftSideContainer.appendChild(div)
    }
}

let handleSegmentClick = function (segmentsData) {
    console.log(segmentsData);
    // Remove all child svg charts inside the right-side div
    d3.select(".right-side").selectAll('svg').remove();
    // Rebuild charts for segmentsData
    buildRightCharts(segmentsData)



    
    d3.select(".middle-side").selectAll('svg').remove();
    console.log(segmentsData)

    // let platformObj = {}
    // for (let key in segmentsData) {
    //     let obj = segmentsData[key];
    //     for (let platformKey in obj) {
    //         let count = obj[platformKey];
    //         platformObj[platformKey] = platformObj[platformKey] || 0
    //         platformObj[platformKey] += parseInt(count)
    //     }
    // }
    // buildPieChart(platformObj);


    let subsegmentObj = {}
    for (let subSegmentKey in segmentsData) {

        let platformCounts = segmentsData[subSegmentKey];
        let sum = 0
        Object.values(platformCounts).forEach(count => {
            sum += parseInt(count)
        });
        subsegmentObj[subSegmentKey] = sum
    }
    buildPieChart(subsegmentObj);
}

let buildPieChart = function (dataObj) {
    // {
    //     'Male voters': 124,
    //     'Female voters': 432
    // }
    
    console.log(dataObj);
    // set the dimensions and margins of the graph
    var width = 800,
        height = 800,
        margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select(".middle-side")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  
    var data = dataObj

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(data)
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function (d) { return d.value; })
    var data_ready = pie(d3.entries(data))

    var arc = d3.arc()              //this will create <path> elements for us using arc data
        .outerRadius(radius);
    var arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(data_ready)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
        .attr("class", "slice");    //allow us to style things in the slices (like text)

    // arcs.append("svg:path")
    //         .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
    //         .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    arcs.append("svg:text")                                     //add a label to each slice
        .attr("transform", function (d) {                    //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.innerRadius = 0;
            d.outerRadius = radius;
            return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle")                          //center the text on it's origin
        .text(function (d) { return `${d.data.key} (${d.data.value})` });

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
}