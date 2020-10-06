function find_countries(find_md) {

  country_list = new Set();
  for(i=0; i<find_md.length; i++) {
    country_list.add(find_md[i]['Country']);
  }

  // if(list.has('India'))
  //   console.log('**');
  return country_list;
}



  var populationById = {}, populationByName = {};
  var d_feat = null;
  // d3.selectAll(".map_svg").remove();

  // console.log(md.length);
  // for(i=0; i<md.length; i++) {
  //   if(md[i]['Country']=='India')
  //     console.log("i");
  //   // else
  //   //   console.log('wtf');
  // }

  // Map
  var map_data = null;
  var clicked_country = null;
  var fill_color = null;

  countries_no_data = ["Greenland","Sudan","Montenegro","Macedonia","Slovakia","Kyrgyzstan","Laos","Taiwan","Myanmar","Kuwait","Falkland Islands"];

  var format = d3.format(",");

  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) +"</span>";
              })

  var width = document.querySelector('#map_chart').offsetWidth;
  var height = document.querySelector('#map_chart').offsetHeight;
  var margin = {top: 0, right: 0, bottom: 0, left: 0};

  var color1 = d3.scale.threshold()
          .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000, 1700000000])
          .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)","rgb(255,165,0)"]);

  var color2 = d3.scale.threshold()
      .domain([1700000000])
      .range(["rgb(169,169,169)"]);

  var color3 = d3.scale.threshold()
      .domain([1700000000])
      .range(["rgb(0,0,0)"]);

  // var path = d3.geo.path();

  var svg = d3.select("#map_chart")
              .append("svg")
              .attr("class", "map_svg")
              .attr("width", width)
              .attr("height", height)
              .call(d3.behavior.zoom().on("zoom", function () {
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
  }))
              .append('g')
              .attr('class', 'map');

  var projection = d3.geo.mercator()
                     .scale(130)
                    .translate( [width / 2, height / 1.5]);

  var path_map = d3.geo.path().projection(projection);

  svg.call(tip);

  function update_map(md) {

    // d3.select('.map_svg').remove();

    // console.log("Map here");
    // console.log(md.length);
    //
    // temp_Set = new Set();
    // for(idk=0; idk<md.length; idk++) {
    //   temp_Set.add(md[idk]['Country']);
    // }
    // console.log(temp_Set);

      var sampled_countries = find_countries(md);

    // console.log(d_feat);

    queue()
        .defer(d3.json, "datasets/world_countries.json")
        .defer(d3.tsv, "datasets/world_population.tsv")
        .await(ready);

    function ready(error, m_data, population) {


        population.forEach(function(d) {

          populationById[d.id] = +d.population;
          populationByName[d.id] = d.name;

        });

        m_data.features.forEach(function(d) {
          d.population = populationById[d.id]
        });

    var feat = svg.append("g")
        .attr("class", "countries")
      .selectAll("path")
        .data(m_data.features);

    feat
      .enter().append("path")
        .attr("d", path_map)
        .attr('id', function(d) {
            return 'country_'+d.id;
        })
        // .style("fill", function(d) { return color(populationById[d.id]); })
        .style("fill", function(d) {
              if(countries_no_data.includes(populationByName[d.id]))
                return color3(populationById[d.id]);
              else if(sampled_countries.has(populationByName[d.id]))
                return color1(populationById[d.id]);
              else
                return color2(populationById[d.id]);
            })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        // tooltips
          .style("stroke","white")
          .style('stroke-width', 0.3)
          .on('mouseover',function(d){

            if(sampled_countries.has(populationByName[d.id])) {
              tip.show(d);

              d3.select(this)
                .style("opacity", 1)
                .style("stroke","white")
                .style("stroke-width",3);
            }

          })
          .on('mouseout', function(d){

            if(sampled_countries.has(populationByName[d.id])) {
              tip.hide(d);

              d3.select(this)
                .style("opacity", 0.8)
                .style("stroke","white")
                .style("stroke-width",0.3);

            }
          }).on('click', function(d) {

            if(sampled_countries.has(populationByName[d.id])) {

              temp_id = clicked_country;

              // Remove highlight if exists
              if(clicked_country!=null) {
                unhighlight_pc_country();
                d3.select(clicked_country).style('fill', fill_color);
                clicked_country = null;
                fill_color = null;
              }

              // Add new highlight
              if(temp_id!=('#country_'+d.id)) {
                highlight_pc_country(populationByName[d.id]);
                clicked_country = '#country_'+d.id;
                fill_color = d3.select('#country_'+d.id).style('fill');
                d3.select('#country_'+d.id).style('fill', 'yellow');
              }

            }

          });

    svg.append("path")
        .datum(topojson.mesh(m_data.features, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path_map);
    }
  }
