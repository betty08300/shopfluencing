// const svg = d3.select('svg');
// svg.style('background-color', 'orange');


const result = {}

d3.csv('/data/shopfluencing.csv').then(data => {
    data.forEach((row, index) => {
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
    
    
    

})






