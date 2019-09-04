// const svg = d3.select('svg');
// svg.style('background-color', 'orange');
import * as d3 from 'd3'
import '../src/scss/index.scss'
import * as PieAPI from './pie';
import * as GraphApI from './graph';


const result = {}

d3.csv('./dist/shopfluencing.csv').then(dataArr => {
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

    let startingData = result['All Users'];
    // console.log(startingData);

    // Build right side charts
    buildRightCharts(startingData)

    let subsegmentObj = {}
    for (let subSegmentKey in startingData) {
        let platformCounts = startingData[subSegmentKey];
        let sum = 0
        Object.values(platformCounts).forEach(count => {
            sum += parseInt(count)
        });
        subsegmentObj[subSegmentKey] = sum
    }
    PieAPI.buildPieChart(subsegmentObj)

    GraphApI.buildgraph(result)

})

// window.addEventListener('resize', )

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
    // set the dimensions and margins of the 
    let w = window.innerWidth * 0.25
    let h = w / 1.6666667
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

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

    let colorsMap = {
        'Facebook': '#98abc5',
        'Instagram': '#8a89a6',
        'Twitter': '#90CAF9',
        'Snapchat': '#FFCC80',
        'None': '#B0BEC5',
    }
    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(chartData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.platformName); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(0); })
        .attr("height", function (d) { return height - y(0); })
        .attr('fill', function(d) { return colorsMap[d.platformName]});

    svg.selectAll('rect')
        .transition()
        .duration(800)
        .attr('y', (d) => { return y(d.count); })
        .attr('height', (d) => { return height - y(d.count); })
        .delay((d, i) => { return (i * 80); });

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
    PieAPI.buildPieChart(subsegmentObj);
}

function resizeFunction() {

}

