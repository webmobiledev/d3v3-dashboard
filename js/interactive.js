function drawInteractiveChart() {
    d3.selectAll('#interactiveBar svg').remove();
    var data = [
        {
            city: 'San Antonio', 
            population_2012: 1383505, 
            growth: {
                year_2013:25405, 
                year_2014:26644, 
                year_2015:28593, 
                year_2016:23591, 
                year_2017:24208
            }
        },
        {
            city: 'New York', 
            population_2012: 8383504, 
            growth: {
                year_2013:75138, 
                year_2014:62493, 
                year_2015:61324, 
                year_2016:32967, 
                year_2017:7272
            }
        },
        {
            city: 'Chicago', 
            population_2012: 2717989, 
            growth: {
                year_2013:6493, 
                year_2014:2051, 
                year_2015:-1379, 
                year_2016:-4879, 
                year_2017:-3825
            }
        },
        {
            city: 'Los Angeles', 
            population_2012: 3859267, 
            growth:{
                year_2013:32516, 
                year_2014:30885, 
                year_2015:30791, 
                year_2016:27657, 
                year_2017:18643
            }
        },
        {
            city: 'Phoenix', 
            population_2012: 1495880, 
            growth: {
                year_2013:25302, 
                year_2014:26547, 
                year_2015:27310, 
                year_2016:27003, 
                year_2017:24036
            }
        }
    ];
    
    data = data.sort(function (a, b) {
        return d3.ascending(a.population_2012, b.population_2012);
    });
    
    function getFormattedNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    function drawBarChart() {
        var margin = {top: 0,right: 10,bottom: 0,left: 100};
    
        var width = $('#interactiveBar').width() - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
        
        var svg = d3.select("#interactiveBar").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scale.linear()
            .range([0, width])
            .domain([0, d3.max(data, function (d) {
                return d.population_2012;
            })]);
        
        var y = d3.scale.ordinal()
            .rangeRoundBands([height, 10], .3)
            .domain(data.map(function (d) {
                return d.city;
            }));
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(0)
            .orient("left");
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g")
        
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return y(d.city);
            })
            .attr("height", y.rangeBand())
            .attr("x", 0)
            .attr("width", function (d) {
                return x(d.population_2012);
            })
            .attr("fill", "#999")
            .on("mouseover", function (d) {
                clearLineChart();
                drawLineChart(d);
            });
        
        bars.append("text")
            .attr("class", "label")
            .attr("y", function (d) {
                return y(d.city) + y.rangeBand() / 2 + 4;
            })
            .attr("x", 10)
            .text(function (d) {
                return getFormattedNumber(d.population_2012);
            })
            .attr('font-size', 14)
            .attr("fill", "#fff");
        clearLineChart();
        drawLineChart(data[0]);
    }
    
    drawBarChart();
    
    function clearLineChart() {
        d3.selectAll("#interactiveLine svg").remove();
    }
    
    function getPopulationGrowthData(data) {
        var usableData = [];
        var populationOfFirstYear = data.population_2012;
        var year = 2013;
        Object.keys(data.growth).forEach(k => {
            usableData.push({
                year: year,
                percent: data.growth[k] * 100 / populationOfFirstYear
            });
            populationOfFirstYear += data.growth[k];
            year ++;
        });
        return usableData;
    }
    
    function drawLineChart(data) {
        var convertedData = getPopulationGrowthData(data);
        var	margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = $('#interactiveLine').width() - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
        
        var	x = d3.scale.linear().range([0, width]);
        var	y = d3.scale.linear().range([height, 0]);
        
        var	xAxis = d3.svg.axis().scale(x)
            .orient("bottom").ticks(5);
        
        var	yAxis = d3.svg.axis().scale(y)
            .orient("left");
        
        var	valueline = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.percent); });
            
        var	svg = d3.select("#interactiveLine")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
     
        x.domain(d3.extent(convertedData, function(d) { return d.year; }));
        y.domain([0, d3.max(convertedData, function(d) { return d.percent; })]);
     
        svg.append("path")	
            .attr("class", "line")
            .attr("d", valueline(convertedData));
     
        svg.append("g")		
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
     
        svg.append("g")		
            .attr("class", "y axis")
            .call(yAxis);
            
        svg.append("text")
            .attr("x", -20)
            .attr("y", -5)
            .text("Pct %")
            .style("font-size", 12);
    
        svg.append("text")
            .attr("x", width - 10)
            .attr("y", height + 30)
            .text("Year")
            .style("font-size", 12);
    }
}


drawInteractiveChart();