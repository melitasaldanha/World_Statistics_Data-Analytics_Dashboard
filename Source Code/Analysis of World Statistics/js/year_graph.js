var lollipop_w = document.querySelector('#lollipop_chart').offsetWidth;
var lollipop_h = document.querySelector('#lollipop_chart').offsetHeight;
var lollipop_margin = {top: 0, right: lollipop_w*0.15, bottom: lollipop_h*0.1, left: lollipop_w*0.15},
    lollipop_width = lollipop_w - lollipop_margin.left - lollipop_margin.right,
    lollipop_height = lollipop_h - lollipop_margin.top - lollipop_margin.bottom;
var rem_years_lp = new Set([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010]);

// append the svg object to the body of the page
var lollipop_svg = d3.select("#lollipop_chart")
  .append("svg")
    .attr("class","lollipop_svg")
    .attr("width", lollipop_width + lollipop_margin.left + lollipop_margin.right)
    .attr("height", lollipop_height + lollipop_margin.top + lollipop_margin.bottom)
  .append("g")
    .attr("class","lollipop_svg_g")
    .attr("transform",
          "translate(" + lollipop_margin.left + "," + lollipop_margin.top + ")");

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
      .range([ 0, lollipop_width]);

      // x.append("text")
      //   .attr("transform",
      //         "translate(" + (lollipop_width/2) + " ," +
      //                        (lollipop_height + lollipop_margin.top + 40) + ")")
      //   .style("text-anchor", "middle")
      //   .text("Health Expenditure");

    d3.selectAll('.inner_g_x').remove();
    d3.selectAll('.inner_g_y').remove();
    lollipop_svg
      .append("g")
      .attr("class", "inner_g_x")
      .attr("transform", "translate(0," + lollipop_height + ")")
      .attr("stroke", "white")
      .attr("stroke-width", 0.4)
      .call(d3.svg.axis()
          .scale(x)
          .orient("bottom"))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // lollipop_svg
      //     .append("text")
      //     .attr("transform",
      //           "translate(" + (lollipop_width/2) + " ," +
      //                          (lollipop_height) + ")")
      //      .style('stroke', 'white')
      //      .attr("stroke-width", 0.4)
      //      .style("text-anchor", "middle")
      //     .text("Health Expenditure");

  // Y axis
  var y = d3.scale.ordinal()
    .rangeBands([ 0, lollipop_height], 1)
    .domain(graph_data.map(function(d) { return d.key; }));
    // .padding(1);
  lollipop_svg.append("g")
  .attr("class", "inner_g_y")
    .attr("stroke", "white")
    .attr("stroke-width", 0.4)
    .call(d3.svg.axis()
          .scale(y)
          .orient("left"))


  // Lines
  var lollipop_line = lollipop_svg.selectAll(".lollipop_line")
    .data(graph_data);

  lollipop_line
    .enter()
    .append("line")
    .attr("class", "lollipop_line")
    .attr('id', function(d) {
        return 'line_'+d.key;
    })
    .on('mouseover',function(d){

      lollipop_svg.append("text")
       .attr('class', 'val')
       .style('fill', 'white')
       .attr('x', function() {
           return lollipop_width + 12;
       })
       .attr('y', function() {
           return y(d.key) + 3;
       })
       .text(function() {
           return [d.values];  // Value of the text
       });

    })
    .on('mouseout', function(d) {

      d3.selectAll('.val')
          .remove();

    }).on('click', function(d) {


      if(rem_years_lp.has(d.key)) {
        // Add grey
        d3.select('#line_'+d.key).style('stroke', 'grey');
        d3.select('#circle_'+d.key).style('fill', 'grey');

        // Remove from remaininng list
        rem_years_lp.delete(d.key);

      } else {
        // Remove grey
        d3.select('#line_'+d.key).style('stroke', '#003399');
        d3.select('#circle_'+d.key).style('fill', '#003399');

        // Add to rem list
        rem_years_lp.add(d.key);
      }

      // Update constraints
      update_constraints('Year', Array.from(rem_years_lp))
    });

  lollipop_line
      .transition()
      .duration(1000)
        .attr("x1", function(d) { return x(d.values); })
        .attr("x2", x(0))
        .attr("y1", function(d) { return y(parseInt(d.key)); })
        .attr("y2", function(d) { return y(parseInt(d.key)); })
        .attr("stroke", function(d) {
            if(rem_years_lp.has(d.key))
              return "#003399";
            else
              return "grey";
        })
        .attr("stroke-width", 3);

  // Circles
  var circle = lollipop_svg.selectAll(".lollipop_circle")
    .data(graph_data);

  circle
    .enter()
    .append("circle")
    .attr("class", "lollipop_circle")
    .attr('id', function(d) {
        return 'circle_'+d.key;
    })
    .on('mouseover',function(d){

      lollipop_svg.append("text")
       .attr('class', 'val')
       .style('fill', 'white')
       .attr('x', function() {
           return lollipop_width + 12;
       })
       .attr('y', function() {
           return y(d.key) + 3;
       })
       .text(function() {
           return [d.values];  // Value of the text
       });

    })
    .on('mouseout', function(d) {

      d3.selectAll('.val')
          .remove();

    }).on('click', function(d) {


      if(rem_years_lp.has(d.key)) {
        // Add grey
        d3.select('#line_'+d.key).style('stroke', 'grey');
        d3.select('#circle_'+d.key).style('fill', 'grey');

        // Remove from remaininng list
        rem_years_lp.delete(d.key);

      } else {
        // Remove grey
        d3.select('#line_'+d.key).style('stroke', '#003399');
        d3.select('#circle_'+d.key).style('fill', '#003399');

        // Add to rem list
        rem_years_lp.add(d.key);
      }

      // Update constraints
      update_constraints('Year', Array.from(rem_years_lp))
    });

  circle
      .transition()
      .duration(1000)
        .attr("cx", function(d) { return x(d.values); })
        .attr("cy", function(d) { return y(parseInt(d.key)); })
        .attr("r", "5")
        .style("fill", function(d) {
            if(rem_years_lp.has(d.key))
              return "#003399";
            else
              return "grey";
        })
        .attr("stroke", "white");
}

// update_year_graph();
