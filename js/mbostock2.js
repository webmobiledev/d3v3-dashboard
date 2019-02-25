function drawMbostock2() {
    var iMbostockIndex = 0;
    var arrMbostockData = [];
    
    function myfunc_adddata(data) {
        arrMbostockData[arrMbostockData.length] = data;
    }
    
    function myfunc_mbostock(classes) {
        d3.selectAll('#mbostock2 svg').remove();
    
        var diameter = $('#mbostock2').width() > 500 ? 500 : $('#mbostock2').width(),
            radius = diameter / 2,
            innerRadius = radius - 100;
    
        var cluster = d3.layout.cluster()
            .size([360, innerRadius])
            .sort(null)
            .value(function (d) { return d.size; });
    
        var bundle = d3.layout.bundle();
    
        var line = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(.85)
            .radius(function (d) { return d.y; })
            .angle(function (d) { return d.x / 180 * Math.PI; });    
    
        var svg = d3.select("#mbostock2").append("svg")
            .attr("width", $('#mbostock2').width())
            .attr("height", diameter)
          .append("g")
            .attr("transform", "translate(" + ($('#mbostock2').width() / 2) + "," + radius + ")scale(1,1)");
    
        var nodes = cluster.nodes(packageHierarchy(classes)),
            links = packageImports(nodes);
    
        svg.selectAll(".link")
            .data(bundle(links))
          .enter().append("path")
            .attr("class", "link")
            .attr("d", line);
    
        svg.selectAll(".node")
            .data(nodes.filter(function (n) { return !n.children; }))
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
          .append("text")
            .attr("dx", function (d) { return d.x < 180 ? 5 : -5; })
            .attr("dy", ".31em")
            .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
            .attr("transform", function (d) { return d.x < 180 ? null : "rotate(180)"; })
            .style("font-size",10)
            .text(function (d) { return d.key; });
    }
                      
    // load data array //
    myfunc_adddata(myData1);
    myfunc_adddata(myData2);
    myfunc_adddata(myData3);
    
    // display data //
    setInterval(function() {
        myfunc_mbostock(arrMbostockData[iMbostockIndex++ % arrMbostockData.length]);
    }, 1000);
    //////////////////
    
    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
        var map = {};
    
        function find(name, data) {
            var node = map[name], i;
            if (!node) {
                node = map[name] = data || { name: name, children: [] };
                if (name.length) {
                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                    node.parent.children.push(node);
                    node.key = name.substring(i + 1);
                }
            }
            return node;
        }
    
        classes.forEach(function (d) {
            find(d.name, d);
        });
    
        return map[""];
    }
    
    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
        var map = {},
            imports = [];
    
        // Compute a map from name to node.
        nodes.forEach(function (d) {
            map[d.name] = d;
        });
    
        // For each import, construct a link from the source to target node.
        nodes.forEach(function (d) {
            if (d.imports) d.imports.forEach(function (i) {
                imports.push({ source: map[d.name], target: map[i] });
            });
        });
    
        return imports;
    }
}

drawMbostock2();
