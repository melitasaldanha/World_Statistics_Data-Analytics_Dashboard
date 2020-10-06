// Parallel Coordinates

var pc_width = document.querySelector("#parallel_coordinates_chart").offsetWidth,
    pc_height = (document.querySelector("#parallel_coordinates_chart").offsetHeight);


var m = [80, 0, 4, 15],
    pc_w = pc_width - m[1] - m[3],
    pc_h = pc_height - m[0] - m[2],
    xscale_pc = d3.scale.ordinal().rangePoints([0, pc_w], 1),
    yscale_pc = {},
    dragging = {},
    line_pc = d3.svg.line(),
    axis_pc = d3.svg.axis().orient("left").ticks(1+pc_height/50),
    pc_data,
    foreground,
    background,
    highlighted_pc,
    dimensions_pc,
    legend_pc,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [];

var all_regions = ["ASIA (EX. NEAR EAST)",
                    "EASTERN EUROPE",
                    "WESTERN EUROPE",
                    "NORTHERN AFRICA",
                    "SUB-SAHARAN AFRICA",
                    "LATIN AMER. & CARIB",
                    "C.W. OF IND. STATES",
                    "OCEANIA",
                    "NEAR EAST",
                    "NORTHERN AMERICA",
                    "BALTICS"]

  var colors = {
    "ASIA (EX. NEAR EAST)": [2,87,48],
    // "ASIA (EX. NEAR EAST) - Female": [270,100,80],
    "EASTERN EUROPE": [5,54,53],
    // "EASTERN EUROPE - Female": [180,100,80],
    "WESTERN EUROPE": [260,50,61],
    // "WESTERN EUROPE - Female": [0,109,80],
    "NORTHERN AFRICA": [94,68,53],
    // "NORTHERN AFRICA - Female": [60,100,80],
    "SUB-SAHARAN AFRICA": [234,58,36],
    // "SUB-SAHARAN AFRICA - Female": [210,100,70],
    "LATIN AMER. & CARIB": [175,58,20],
    // "LATIN AMER. & CARIB - Female": [30,100,70],
    "C.W. OF IND. STATES": [0,100,83],
    // "C.W. OF IND. STATES - Female": [120,100,80],
    "OCEANIA": [317,59,48],
    // "OCEANIA - Female": [300,100,90],
    "NEAR EAST": [317,21,31],
    // "NEAR EAST - Female": [320,100,70],
    "NORTHERN AMERICA": [56,86,52],
    // "NORTHERN AMERICA - Female": [274,30,76],
    "BALTICS": [20,96,52]
    // "BALTICS - Female": [90,100,40]
  };


// Scale chart and canvas height
var pc = d3.select("#parallel_coordinates_chart")
    .style("height", (pc_h + m[0] + m[2]) + "px")

pc.selectAll("canvas")
    .attr("width", pc_w)
    .attr("height", pc_h)
    .style("padding", m.join("px ") + "px");


// Foreground canvas for primary view
foreground = document.getElementById('foreground_pc').getContext('2d');
foreground.globalCompositeOperation = "destination-over";
foreground.strokeStyle = "rgba(255,255,255,0.1)";
foreground.lineWidth = 1.7;
foreground.fillText("Loading...",pc_w/2,pc_h/2);

// Highlight canvas for temporary interactions
highlighted_pc = document.getElementById('highlight_pc').getContext('2d');
highlighted_pc.strokeStyle = "rgba(0,100,160,1)";
highlighted_pc.lineWidth = 4;

// Background canvas
background = document.getElementById('background_pc').getContext('2d');
background.strokeStyle = "rgba(0,100,160,0.1)";
background.lineWidth = 1.7;

var pc_svg = null, g = null;

function update_pc_and_region(new_pc_data) {
    // pc.selectAll("svg").remove();

    pc_data = new_pc_data;

    // Render full foreground
    brush();
}

// SVG for ticks, labels, and interactions
pc_svg = pc.select("svg")
    .attr("width", pc_w + m[1] + m[3])
    .attr("height", pc_h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Load the data and visualization
d3.csv("datasets/Final_Dataset.csv", function(raw_data) {
  // Convert quantitative scales to floats
  pc_data = raw_data.map(function(d) {
    for (var k in d) {
      if (!_.isNaN(raw_data[0][k] - 0) && k != 'id') {
        d[k] = parseFloat(d[k]) || 0;
      }
    };
    return d;
  });



  // Extract the list of numerical dimensions and create a scale for each.
  xscale_pc.domain(dimensions_pc = d3.keys(pc_data[0]).filter(function(k) {
    return (_.isNumber(pc_data[0][k])) && (yscale_pc[k] = d3.scale.linear()
      .domain(d3.extent(pc_data, function(d) { return +d[k]; }))
      .range([pc_h, 0]));
  }));

  // Add a group element for each dimension.
  var g = pc_svg.selectAll(".dimension_pc")
      .data(dimensions_pc)
    .enter().append("svg:g")
      .attr("class", "dimension_pc")
      .attr("transform", function(d) { return "translate(" + xscale_pc(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xscale_pc(d);
          this.__dragged__ = false;
          d3.select("#foreground_pc").style("opacity", "0.35");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(pc_w, Math.max(0, this.__origin__ += d3.event.dx));
          dimensions_pc.sort(function(a, b) { return position(a) - position(b); });
          xscale_pc.domain(dimensions_pc);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
          brush_count++;
          this.__dragged__ = true;

          console.log("dragging");

          // Feedback for axis deletion if dropped
          if (dragging[d] < 12 || dragging[d] > pc_w-12) {
            d3.select(this).select(".background").style("fill", "#b00");
          } else {
            d3.select(this).select(".background").style("fill", null);
          }
        })
        .on("dragend", function(d) {
          if (!this.__dragged__) {
            // no movement, invert axis
            var extent = invert_axis(d);

          } else {
            // reorder axes
            d3.select(this).transition().attr("transform", "translate(" + xscale_pc(d) + ")");

            var extent = yscale_pc[d].brush.extent();
          }

          // remove axis if dragged all the way left
          if (dragging[d] < 12 || dragging[d] > pc_w-12) {
            remove_axis(d,g);
          }

          // TODO required to avoid a bug
          xscale_pc.domain(dimensions_pc);
          update_ticks(d, extent);

          // rerender
          d3.select("#foreground_pc").style("opacity", null);
          brush();
          delete this.__dragged__;
          delete this.__origin__;
          delete dragging[d];
        }))

  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis_pc")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis_pc.scale(yscale_pc[d])); })
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-25)")
      .attr("y", -10)
      .attr("x", function(d,i) {return (i==0||i==13||i==14) ? 10 : 30} )
      .attr("class", "label")
      .text(String)
      .append("title")
        .text("Click to invert. Drag to reorder");

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(yscale_pc[d].brush = d3.svg.brush().y(yscale_pc[d]).on("brush", brush)); })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -23)
      .attr("width", 36)
      .append("title")
        .text("Drag up or down to brush along this axis");

  g.selectAll(".extent")
      .append("title")
        .text("Drag or resize this filter");


  legend_pc = create_legend(colors, brush);

  // Render full foreground
  brush();

});

// copy one canvas to another, grayscale_pc
function gray_copy(source, target) {
  var pixels = source.getImageData(0,0,pc_w,pc_h);
  target.putImageData(grayscale_pc(pixels),0,0);
}

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function grayscale_pc(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

function create_legend(colors,brush) {
  // create legend
  var legend_data = d3.select("#region_legend")
    .html("")
    .selectAll(".row")
    .data( _.keys(colors) )

  // filter by group
  var legend_pc = legend_data
    .enter().append("div")
      .attr("title", "Hide group")
      .on("click", function(d) {
        // toggle food group
        if (_.contains(excluded_groups, d)) {

          // Add region
          d3.select(this).attr("title", "Hide group")
          excluded_groups = _.difference(excluded_groups,[d]);
          brush();
        } else {

          // Remove region
          d3.select(this).attr("title", "Show group")
          excluded_groups.push(d);
          brush();
        }

        // Update constraints
        rem_regions = _.difference(all_regions, excluded_groups);
        update_constraints('Region', rem_regions);

      });

  legend_pc
    .append("span")
    .style("background", function(d,i) { return color(d,0.85)})
    .attr("class", "color-bar");

  legend_pc
    .append("span")
    .attr("class", "tally")
    .text(function(d,i) { return 0});

  legend_pc
    .append("span")
    .text(function(d,i) { return " " + d});

  return legend_pc;
}

// render polylines i to i+render_speed
function render_range(selection, i, max, opacity) {
  selection.slice(i,max).forEach(function(d) {
    path(d, foreground, color(d.Region,opacity));
  });
};

// simple data table
function data_table(sample) {

  var table = d3.select("#food-list")
    .html("")
    .selectAll(".row")
      .data(pc_data)
    .enter().append("div")
      .on("mouseover", highlight_pc_country)
      .on("mouseout", unhighlight_pc_country);
}

// Adjusts rendering speed
function optimize(timer) {
  var delta = (new Date()).getTime() - timer;
  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
  render_speed = Math.min(render_speed, 300);
  return (new Date()).getTime();
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
  d3.select("#rendered-count").text(i);
  d3.select("#rendered-bar")
    .style("width", (100*i/n) + "%");
  d3.select("#render-speed").text(render_speed);
}

// Feedback on selection
function selection_stats(opacity, n, total) {
  d3.select("#data-count").text(total);
  d3.select("#selected-count").text(n);
  d3.select("#selected-bar").style("width", (100*n/total) + "%");
  d3.select("#opacity").text((""+(opacity*100)).slice(0,4) + "%");
}

// Highlight single polyline
function highlight_pc_country(cntry_name) {

  var list_cntry_tuples = [];
  var cntry_reg = "";

  for(pi = 0; pi<pc_data.length; pi++) {
    if(pc_data[pi]['Country']==cntry_name) {
      list_cntry_tuples.push(pc_data[pi]);
      cntry_reg = pc_data[pi]['Region'];
    }
  }

  d3.select("#foreground_pc").style("opacity", "0.25");
  d3.selectAll(".row").style("opacity", function(p) { return (cntry_reg == p) ? null : "0.3" });

  for(pt = 0; pt<list_cntry_tuples.length; pt++) {
    path(list_cntry_tuples[pt], highlighted_pc, color(cntry_reg, 1));
  }
}

// Remove highlight
function unhighlight_pc_country() {
  d3.select("#foreground_pc").style("opacity", null);
  d3.selectAll(".row").style("opacity", null);
  highlighted_pc.clearRect(0,0,pc_w,pc_h);
}

function invert_axis(d) {
  // save extent before inverting
  if (!yscale_pc[d].brush.empty()) {
    var extent = yscale_pc[d].brush.extent();
  }
  if (yscale_pc[d].inverted == true) {
    yscale_pc[d].range([pc_h, 0]);
    d3.selectAll('.label')
      .filter(function(p) { return p == d; })
      .style("text-decoration", null);
    yscale_pc[d].inverted = false;
  } else {
    yscale_pc[d].range([0, pc_h]);
    d3.selectAll('.label')
      .filter(function(p) { return p == d; })
      .style("text-decoration", "underline");
    yscale_pc[d].inverted = true;
  }
  return extent;
}

function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  ctx.beginPath();
  var x0 = xscale_pc(0)-15,
      y0 = yscale_pc[dimensions_pc[0]](d[dimensions_pc[0]]);   // left edge
  ctx.moveTo(x0,y0);
  dimensions_pc.map(function(p,i) {
    var x = xscale_pc(p),
        y = yscale_pc[p](d[p]);
    var cp1x = x - 0.88*(x-x0);
    var cp1y = y0;
    var cp2x = x - 0.12*(x-x0);
    var cp2y = y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    x0 = x;
    y0 = y;
  });
  ctx.lineTo(x0+15, y0);                               // right edge
  ctx.stroke();
};

function color(d,a) {
  var c = colors[d];
  return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
}

function position(d) {
  var v = dragging[d];
  return v == null ? xscale_pc(d) : v;
}

// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
  brush_count++;
  var actives = dimensions_pc.filter(function(p) { return !yscale_pc[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale_pc[p].brush.extent(); });

  // hack to hide ticks beyond extent
  var b = d3.selectAll('.dimension_pc')[0]
    .forEach(function(element, i) {
      var dimension_pc = d3.select(element).data()[0];
      if (_.include(actives, dimension_pc)) {
        var extent = extents[actives.indexOf(dimension_pc)];
        d3.select(element)
          .selectAll('text')
          .style('font-weight', 'bold')
          .style('font-size', '13px')
          .style('display', function() {
            var value = d3.select(this).data();
            return extent[0] <= value && value <= extent[1] ? null : "none"
          });
      } else {
        d3.select(element)
          .selectAll('text')
          .style('font-size', null)
          .style('font-weight', null)
          .style('display', null);
      }
      d3.select(element)
        .selectAll('.label')
        .style('display', null);
    });

  // bold dimensions with label
  d3.selectAll('.label')
    .style("font-weight", function(dimension_pc) {
      if (_.include(actives, dimension_pc)) return "bold";
      return null;
    });

  // Get lines within extents
  var selected = [];
  pc_data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.Region);
    })
    .map(function(d) {
      return actives.every(function(p, dimension_pc) {
        return extents[dimension_pc][0] <= d[p] && d[p] <= extents[dimension_pc][1];
      }) ? selected.push(d) : null;
    });

  // // free text search
  // var query = d3.select("#search")[0][0].value;
  // if (query.length > 0) {
  //   selected = search(selected, query);
  // }

  if (selected.length < pc_data.length && selected.length > 0) {
    d3.select("#scale_selection").attr("disabled", null);
    d3.select("#exclude_data").attr("disabled", null);
  } else {
    d3.select("#scale_selection").attr("disabled", "disabled");
    d3.select("#exclude_data").attr("disabled", "disabled");
  };


  // total by food group
  var tallies = _(selected)
    .groupBy(function(d) { return d.Region; })

  // include empty groups
  _(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });

  legend_pc
    .style("text-decoration", function(d) { return _.contains(excluded_groups,d) ? "line-through" : null; })
    .attr("class", function(d) {
      return (tallies[d].length > 0)
           ? "row"
           : "row off";
    });

  legend_pc.selectAll(".color-bar")
    .style("width", function(d) {
      return Math.ceil(600*tallies[d].length/pc_data.length) + "px"
    });

  legend_pc.selectAll(".tally")
    .text(function(d,i) { return tallies[d].length });

  // Render selected lines
  paths(selected, foreground, brush_count, true);
}

// render a set of polylines on a canvas
function paths(selected, ctx, count) {
  var n = selected.length,
      i = 0,
      opacity = d3.min([2/Math.pow(n,0.3),1]),
      timer = (new Date()).getTime();

  selection_stats(opacity, n, pc_data.length)

  shuffled_data = _.shuffle(selected);

  data_table(shuffled_data.slice(0,25));

  ctx.clearRect(0,0,pc_w+1,pc_h+1);

  // render all lines until finished or a new brush event
  function animloop(){
    if (i >= n || count < brush_count) return true;
    var max = d3.min([i+render_speed, n]);
    render_range(shuffled_data, i, max, opacity);
    render_stats(max,n,render_speed);
    i = max;
    timer = optimize(timer);  // adjusts render_speed
  };

  d3.timer(animloop);
}

// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
  // update brushes
  if (d) {
    var brush_el = d3.selectAll(".brush")
        .filter(function(key) { return key == d; });
    // single tick
    if (extent) {
      // restore previous extent
      brush_el.call(yscale_pc[d].brush = d3.svg.brush().y(yscale_pc[d]).extent(extent).on("brush", brush));
    } else {
      brush_el.call(yscale_pc[d].brush = d3.svg.brush().y(yscale_pc[d]).on("brush", brush));
    }
  } else {
    // all ticks
    d3.selectAll(".brush")
      .each(function(d) { d3.select(this).call(yscale_pc[d].brush = d3.svg.brush().y(yscale_pc[d]).on("brush", brush)); })
  }

  brush_count++;

  show_ticks();

  // update axes
  d3.selectAll(".axis_pc")
    .each(function(d,i) {
      // hide lines for better performance
      d3.select(this).selectAll('line').style("display", "none");

      // transition axis numbers
      d3.select(this)
        .transition()
        .duration(720)
        .call(axis_pc.scale(yscale_pc[d]));

      // bring lines back
      d3.select(this).selectAll('line').transition().delay(800).style("display", null);

      d3.select(this)
        .selectAll('text')
        .style('font-weight', null)
        .style('font-size', null)
        .style('display', null);
    });
}

// Rescale to new dataset domain
function rescale() {
  // reset yscale_pcs, preserving inverted state
  dimensions_pc.forEach(function(d,i) {
    if (yscale_pc[d].inverted) {
      yscale_pc[d] = d3.scale.linear()
          .domain(d3.extent(pc_data, function(p) { return +p[d]; }))
          .range([0, pc_h]);
      yscale_pc[d].inverted = true;
    } else {
      yscale_pc[d] = d3.scale.linear()
          .domain(d3.extent(pc_data, function(p) { return +p[d]; }))
          .range([pc_h, 0]);
    }
  });

  update_ticks();

  // Render selected data
  paths(pc_data, foreground, brush_count);
}

// Get polylines within extents
function actives() {
  var actives = dimensions_pc.filter(function(p) { return !yscale_pc[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale_pc[p].brush.extent(); });

  // filter extents and excluded groups
  var selected = [];
  pc_data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.Region);
    })
    .map(function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? selected.push(d) : null;
  });

  return selected;
}

// Export data
function export_csv() {
  var keys = d3.keys(pc_data[0]);
  var rows = actives().map(function(row) {
    return keys.map(function(k) { return row[k]; })
  });
  var csv = d3.csv.format([keys].concat(rows)).replace(/\n/g,"<br/>\n");
  var styles = "<style>body { font-family: sans-serif; font-size: 12px; }</style>";
  window.open("text/csv").document.write(styles + csv);
}

// scale to window size
window.onresize = function() {
  pc_width = document.body.clientWidth,
  pc_height = d3.max([document.body.clientHeight-500, 220]);

  pc_w = pc_width - m[1] - m[3],
  pc_h = pc_height - m[0] - m[2];

  var pc = d3.select("#parallel_coordinates_chart")
      .style("height", (pc_h + m[0] + m[2]) + "px")

  pc.selectAll("canvas")
      .attr("width", pc_w)
      .attr("height", pc_h)
      .style("padding", m.join("px ") + "px");

  pc.select(".pc_svg")
      .attr("width", pc_w + m[1] + m[3])
      .attr("height", pc_h + m[0] + m[2])
    .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  xscale_pc = d3.scale.ordinal().rangePoints([0, pc_w], 1).domain(dimensions_pc);
  dimensions_pc.forEach(function(d) {
    yscale_pc[d].range([pc_h, 0]);
  });

  d3.selectAll(".dimension_pc")
    .attr("transform", function(d) { return "translate(" + xscale_pc(d) + ")"; })
  // update brush placement
  d3.selectAll(".brush")
    .each(function(d) { d3.select(this).call(yscale_pc[d].brush = d3.svg.brush().y(yscale_pc[d]).on("brush", brush)); })
  brush_count++;

  // update axis placement
  axis_pc = axis_pc.ticks(1+pc_height/50),
  d3.selectAll(".axis_pc")
    .each(function(d) { d3.select(this).call(axis_pc.scale(yscale_pc[d])); });

  // render data
  brush();
};


// Remove all but selected from the dataset
function scale_selection() {
  d3.select("#original_data").attr("disabled", null);
  new_data = actives();
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
    return false;
  }
  pc_data = new_data;
  rescale();
}

// Exclude selected from the dataset
function exclude_data() {
  d3.select("#original_data").attr("disabled", null);
  new_data = _.difference(pc_data, actives());
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'.");
    return false;
  }
  pc_data = new_data;
  rescale();
}

// Go to original data
function original_data() {
  d3.select("#original_data").attr("disabled", "disabled");
  // new_data = actives();
  // if (new_data.length == 0) {
  //   alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
  //   return false;
  // }
  // data = new_data;
  // rescale();
}

function remove_axis(d,g) {
  dimensions_pc = _.difference(dimensions_pc, [d]);
  xscale_pc.domain(dimensions_pc);
  g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
  g.filter(function(p) { return p == d; }).remove();
  update_ticks();
}

d3.select("#scale_selection").on("click", scale_selection);
d3.select("#exclude_data").on("click", exclude_data);
d3.select("#original_data").on("click", original_data);
d3.select("#export-data").on("click", export_csv);


// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks);
d3.select("#show-ticks").on("click", show_ticks);


function hide_ticks() {
  d3.selectAll(".axis_pc g").style("display", "none");
  //d3.selectAll(".axis_pc path").style("display", "none");
  d3.selectAll(".background").style("visibility", "hidden");
  d3.selectAll("#hide-ticks").attr("disabled", "disabled");
  d3.selectAll("#show-ticks").attr("disabled", null);
};

function show_ticks() {
  d3.selectAll(".axis_pc g").style("display", null);
  //d3.selectAll(".axis_pc path").style("display", null);
  d3.selectAll(".background").style("visibility", null);
  d3.selectAll("#show-ticks").attr("disabled", "disabled");
  d3.selectAll("#hide-ticks").attr("disabled", null);
};

function dark_theme() {
  d3.select("body").attr("class", "dark");
  d3.selectAll("#dark-theme").attr("disabled", "disabled");
  d3.selectAll("#light-theme").attr("disabled", null);
}
