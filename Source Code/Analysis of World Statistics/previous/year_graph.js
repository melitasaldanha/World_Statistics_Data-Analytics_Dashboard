var w = document.querySelector('#lollipop_chart').offsetWidth;
var h = document.querySelector('#lollipop_chart').offsetHeight;
var margin = {top: 0, right: w*0.05, bottom: h*0.1, left: w*0.15},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#lollipop_chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function getCountOfCountries(d) {

  count_data = {};

  for(i=2000; i<=2010; i++)
    count_data[i] = new Set();

  for(i=0; i<d.length; i++)
    count_data[parseInt(d[i]['Year'])].add(d[i]['Country']);

  graph_data = []

  for(i=2000; i<=2010; i++)
    graph_data.push({key:i, values:count_data[i].size});

  graph_data.sort(function (a,b) {return d3.ascending(a.key, b.key);});

  return graph_data;
}

function update_year_graph(d) {

  graph_data = getCountOfCountries(d);

    // Add X axis
    var x = d3.scale.linear()
      .domain([0, d3.max(graph_data, function(d){
  			return +d.values;})])
      .range([ 0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .call(d3.svg.axis()
          .scale(x)
          .orient("bottom"))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

  // Y axis
  var y = d3.scale.ordinal()
    .rangeBands([ 0, height], 1)
    .domain(graph_data.map(function(d) { return d.key; }));
    // .padding(1);
  svg.append("g")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .call(d3.svg.axis()
          .scale(y)
          .orient("left"))


  // Lines
  var line = svg.selectAll(".lollipop_line")
    .data(graph_data);

  line
    .enter()
    .append("line")
    .attr("class", "lollipop_line");

  line
      .transition()
      .duration(1000)
        .attr("x1", function(d) { return x(d.values); })
        .attr("x2", x(0))
        .attr("y1", function(d) { return y(parseInt(d.key)); })
        .attr("y2", function(d) { return y(parseInt(d.key)); })
        .attr("stroke", "red")
        .attr("stroke-width", 3);

  // Circles
  var circle = svg.selectAll(".lollipop_circle")
    .data(graph_data);

  circle
    .enter()
    .append("circle")
    .attr("class", "lollipop_circle");

  circle
      .transition()
      .duration(1000)
        .attr("cx", function(d) { return x(d.values); })
        .attr("cy", function(d) { return y(parseInt(d.key)); })
        .attr("r", "5")
        .style("fill", "red")
        .attr("stroke", "white");
}

// update_year_graph();
