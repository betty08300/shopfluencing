import * as d3 from 'd3'
import '../src/scss/index.scss'

export const buildPieChart = function (dataObj) {
    // {
    //     'Male voters': 124,
    //     'Female voters': 432
    // }

    console.log(dataObj);
    // set the dimensions and margins of the graph
    let width = window.innerWidth/2,
        height = window.innerWidth/2,
        margin = 50

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    let radius = (Math.min(width, height) - margin) / 2

    // append the svg object to the div called 'my_dataviz'
    let svg = d3.select(".middle-side")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    let data = dataObj

    // set the color scale
    let color = d3.scaleOrdinal()
        .domain(data)
        .range(['#574da0', '#6d68ab', '#8583ba', '#a6a6ce', '#bba7ce', '#a083ba', '#8c68aa', '#7c4da1', '#74479b'])
        // .range(['#8E8BE0', '#6A66CB', '#4C48B4', '#713EAF', '#8D5DC7', '#AC84DD', '#81B0DA', '#5990C2', '#3A74A8'])
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#594766", "#6981A3"])

    // Compute the position of each group on the pie:
    let pie = d3.pie()
        .value(function (d) { return d.value; })

    let data_ready = pie(d3.entries(data))

    let arc = d3.arc()              //this will create <path> elements for us using arc data
        .outerRadius(radius);

    let arcLabel = d3.arc()
        .outerRadius(radius / 4)
        .innerRadius(radius - 5);

    let arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(data_ready)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
        .attr("class", "slice");    //allow us to style things in the slices (like text)

    // animation 
    arcs.append("path")
        .attr("fill", function (d, i) { return color(i); })
        .transition()
        .ease(d3.easeBounce)
        .duration(1500)
        .attrTween("d", tweenPie);
    // arcs.append("svg:path")
    //         .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
    //         .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

    arcs.append("svg:text")                                     //add a label to each slice
        // .attr("transform", function (d) {                    //set the label's origin to the center of the arc
        //     //we have to make sure to set these before calling arc.centroid
        //     d.innerRadius = 0;
        //     d.outerRadius = radius;
        //     return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
        // })
        .attr("transform", function (d) {
            // console.warn(d.data.key, d.startAngle, d.endAngle);
            if(d.endAngle - d.startAngle > 2){
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";
            }else {
                let midAngle = d.endAngle < Math.PI ? d.startAngle / 2 + d.endAngle / 2 : d.startAngle / 2 + d.endAngle / 2 + Math.PI;
                let midAngleDegrees = (midAngle * 57.295779513);
    
                if ((midAngleDegrees - 180) > 90 && (midAngleDegrees - 180) < 180) midAngleDegrees -= 180;
                return "translate(" + arcLabel.centroid(d)[0] + ", " + arcLabel.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngleDegrees) + ")";
            }


        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")                          //center the text on it's origin
        .text(function (d) { return `${d.data.key} (${d.data.value})` });

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    // svg
    //     .selectAll('whatever')
    //     .data(data_ready)
    //     .enter()
    //     .append('path')
    //     .attr('d', d3.arc()
    //         .innerRadius(0)
    //         .outerRadius(radius)
    //     )
    //     .attr('fill', function (d) { return (color(d.data.key)) })
    //     .attr("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .style("opacity", 0.7)

    

    function tweenPie(b) {
        b.innerRadius = 0;
        let i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
        return function (t) { return arc(i(t)); };
    }

    function tweenDonut(b) {
        b.innerRadius = radius * .6;
        let i = d3.interpolate({ innerRadius: 0 }, b);
        return function (t) { return arc(i(t)); };
    }    
}