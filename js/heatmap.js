function drawHeatMap(house) {
    d3.selectAll('#heatmap svg').remove();

    var margin = { top: 50, right: 0, bottom: 100, left: 0 },
        width = $('#heatmap').width() - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        gridSize = Math.floor((height - margin.bottom) / 7),
        legendElementWidth = gridSize * 1.2,
        buckets = 9,
        colors = ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"];

    var svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left + width / 2 - (height - 100) / 2) + "," + margin.top + ")");

    d3.csv("data/heatmap.csv", function(data) {
        var convertedData = {};
        var spellTypes = [], books = [];
        data.forEach(d => {
            if (d.House && !convertedData[d.House]) {
                convertedData[d.House] = [];
            } else {
                Object.keys(d).forEach(k => {
                    if (convertedData[d.House] && k !== 'House' && k !== 'SpellType') {
                        if (spellTypes.indexOf(d.SpellType) < 0) {
                            spellTypes.push(d.SpellType);
                        }
                        if (books.indexOf(k) < 0) {
                            books.push(k);
                        }
                        convertedData[d.House].push({
                            book: books.indexOf(k) + 1,
                            spellType: spellTypes.indexOf(d.SpellType) + 1,
                            value: d[k]
                        });
                    }
                });
            }
        });

        d3.select("#house-select").append("text")
            .text("House")
            .style({"font-size": 14});

        svg.selectAll(".bookLabel")
            .data(books)
            .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style({"text-anchor": "end", "font-size": 12})
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")");

        var spellTypesAxis = svg.selectAll(".spellTypeLabel")
            .data(spellTypes)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(" + i * gridSize + "," + (height - 90) + ")"
            });
            
        spellTypesAxis.append("text")
            .text(function(d) { return d; })
            .style({"text-anchor": "end", "font-size": 12})
            .attr("transform", "translate(" + gridSize / 2 + ", -6) rotate(-90)");

        svg.append("text")
            .attr("x", -40)
            .attr("y", -10)
            .text("Book")
            .style({"font-size": 14});

        svg.append("text")
            .attr("x", gridSize * spellTypes.length + 10)
            .attr("y", height - 80)
            .text("Spell Type")
            .style({"font-size": 14});

        var colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, d3.max(convertedData[house], function (d) { return d.value; })])
            .range(colors);

        var cards = svg.selectAll(".hour")
            .data(convertedData[house], function(d) {return d.book + ':' + d.spellType;});

        cards.append("title");

        cards.enter().append("rect")
            .attr("x", function(d) { return (d.spellType - 1) * gridSize; })
            .attr("y", function(d) { return (d.book - 1) * gridSize; })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style({"fill": colors[0], "stroke": "#eee"});

        cards.transition().duration(1000)
            .style("fill", function(d) { return colorScale(d.value); });

        cards.select("title").text(function(d) { return d.value; });
        
        cards.exit().remove();

        var legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function(d) { return d; });

        legend.enter().append("g")
            .attr("class", "legend");

        legend.append("text")
            .attr("x", 0)
            .attr("y", height - 10)
            .text("No. of Spells")
            .style({"font-size": 12});

        legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2.5)
            .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + 40)
            .style({"font-size": 12});

        legend.exit().remove();
    });
}

drawHeatMap(d3.select('#house').property('value'));
