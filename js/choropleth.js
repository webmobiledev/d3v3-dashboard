function drawUSMap() {
    d3.selectAll('#choropleth svg').remove();
    var width = $('#choropleth').width(),
        height = 500,
        valMin = 0,
        valMax = 100,
        steps = 10,
        breaks = d3.range(0, steps).map(function(d){ return d / (steps - 1); });

    var educationDataById = d3.map();

    var colors = ["#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d","#3c0276","#320163","#240048"];
    
    var quantize = d3.scale.quantize()
        .domain([valMin, valMax])
            .range(colors);

    var linear = d3.scale.linear()
        .domain(breaks)
            .range(colors);
    
    var legendQuantize = d3.legend.color()
        .classPrefix("colorLegend_")
        .labelFormat(d3.format("0f"))
        .shape("rect")
        .shapePadding(0)
        .scale(quantize);

    var svg = d3.select("#choropleth").append("svg")
        .attr("width", width)
        .attr("height", height);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .direction('n')
        .html(function(d) {
            return "County: " + educationDataById.get(d.id).name + "<br/>" +
                "Percentage Educated: " + educationDataById.get(d.id).percent + "<br/>" + 
                "Qualified Professionals: " + educationDataById.get(d.id).qualified_professionals + "<br/>" + 
                "High school graduates: " + educationDataById.get(d.id).high_school + "<br/>" +
                "Middle school or lower graduates: " + educationDataById.get(d.id).middle_school_or_lower;
        });
        
    svg.call(tip);
    
    var gradient = svg.append("defs")
    .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradient.selectAll("stop") 
        .data(d3.zip(breaks, colors))                  
        .enter().append("stop")
        .attr("offset", function(d) { return d[0]; })   
        .attr("stop-color", function(d) { return d[1]; });
    
    var projection = d3.geo.albersUsa()
        .scale(width > 800 ? 1000 : width)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.csv, "data/education.csv", function(d) { 
            educationDataById.set(d.id, {
                percent: d.percent_educated, 
                state: d.State, 
                name: d.name
            }); 
        })
        .defer(d3.csv, "data/education_details.csv", function(d) {
            educationDataById.set(d.id, {
                ...educationDataById.get(d.id),
                qualified_professionals: d.qualified_professionals, 
                middle_school_or_lower: d.middle_school_or_lower, 
                high_school: d.high_school
            }); 
        })
        .await(ready);

    function ready(error, us) {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("fill", function(d) { return quantize(educationDataById.get(d.id) && educationDataById.get(d.id).percent || 0); })
            .attr("d", path)
            .on('mouseover',tip.show)
            .on('mouseout', tip.hide);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);
        
        svg.append("g")
            .attr("class", "legendQuantize")
            .attr("transform", "translate("+(width - 100)+",300)");

        svg.select(".legendQuantize")
            .call(legendQuantize);
    }

    d3.select(self.frameElement).style("height", height + "px");
}

drawUSMap();

