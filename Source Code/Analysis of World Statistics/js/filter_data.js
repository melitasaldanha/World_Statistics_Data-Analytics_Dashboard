// Original data
var og_data = null;

// Constraints
var constraint = {}

// Set initial constraints
constraint['Gender'] = ['Male', 'Female'];
constraint['Population Density'] = [0, 25000];
constraint['Health Expenditure Govt'] = [0, 100];
constraint['Health Expenditure Pvt'] = [0, 100];
constraint['Health Expenditure Indv'] = [0, 100];
constraint['Life Expectancy'] = [0, 100];
constraint['Education Expenditure'] = [0, 25];
constraint['Mean years in school'] = [0, 20];
constraint['Average Income'] = [0, 4000];
constraint['Employment Rate'] = [0, 100];
constraint['Income Inequality'] = [0, 100];
constraint['Child Mortality Rate'] = [0, 600];
constraint['Adult Mortality Rate'] = [0, 1000];
constraint['Suicides'] = [0, 220000];
constraint['Murders'] = [0, 60000];
constraint['Region'] = ["ASIA (EX. NEAR EAST)",
                        "EASTERN EUROPE",
                        "WESTERN EUROPE",
                        "NORTHERN AFRICA",
                        "SUB-SAHARAN AFRICA",
                        "LATIN AMER. & CARIB",
                        "C.W. OF IND. STATES",
                        "OCEANIA",
                        "NEAR EAST",
                        "NORTHERN AMERICA",
                        "BALTICS"];
constraint['Year'] = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];


// function update_charts(filtered_data, filtered_year, filtered_region) {
//
//   update_year_graph(filtered_year);
//   update_map(filtered_data);
//   update_pc_and_region(filtered_region);
// }

// Read data
d3.csv("datasets/Final_Dataset.csv", function(raw_data) {

  // Convert quantitative scales to floats
  og_data = raw_data;
  getRadarDimensions(og_data);

  // Initial
  // update_charts(data, data, data);
  update_year_graph(og_data);
  update_map(og_data);
  // update_pc_and_region(data);
});

// Check if row of data satisfies all constraints
function check_constraints(row) {
  return (
            (constraint['Gender']).includes(row['Gender']) &&
            (row['Population Density']>=constraint['Population Density'][0] && row['Population Density']<=constraint['Population Density'][1]) &&
            (row['Health Expenditure Govt']>=constraint['Health Expenditure Govt'][0] && row['Health Expenditure Govt']<=constraint['Health Expenditure Govt'][1]) &&
            (row['Health Expenditure Pvt']>=constraint['Health Expenditure Pvt'][0] && row['Health Expenditure Pvt']<=constraint['Health Expenditure Pvt'][1]) &&
            (row['Health Expenditure Indv']>=constraint['Health Expenditure Indv'][0] && row['Health Expenditure Indv']<=constraint['Health Expenditure Indv'][1]) &&
            (row['Life Expectancy']>=constraint['Life Expectancy'][0] && row['Life Expectancy']<=constraint['Life Expectancy'][1]) &&
            (row['Education Expenditure']>=constraint['Education Expenditure'][0] && row['Education Expenditure']<=constraint['Education Expenditure'][1]) &&
            (row['Mean years in school']>=constraint['Mean years in school'][0] && row['Mean years in school']<=constraint['Mean years in school'][1]) &&
            (row['Average Income']>=constraint['Average Income'][0] && row['Average Income']<=constraint['Average Income'][1]) &&
            (row['Employment Rate']>=constraint['Employment Rate'][0] && row['Employment Rate']<=constraint['Employment Rate'][1]) &&
            (row['Income Inequality']>=constraint['Income Inequality'][0] && row['Income Inequality']<=constraint['Income Inequality'][1]) &&
            (row['Child Mortality Rate']>=constraint['Child Mortality Rate'][0] && row['Child Mortality Rate']<=constraint['Child Mortality Rate'][1]) &&
            (row['Adult Mortality Rate']>=constraint['Adult Mortality Rate'][0] && row['Adult Mortality Rate']<=constraint['Adult Mortality Rate'][1]) &&
            (row['Suicides']>=constraint['Suicides'][0] && row['Suicides']<=constraint['Suicides'][1]) &&
            (row['Murders']>=constraint['Murders'][0] && row['Murders']<=constraint['Murders'][1])
        );
}

function update_constraints(name, value) {

  // Change constraint value to new constraints
  if(name!='Gender' && name!='Region') {
    new_value = [parseInt(value[0]), parseInt(value[1])];
    constraint[name] = new_value;
  } else {
    constraint[name] = value;
  }

  // Filter data based on constraints
  var filtered_data = [], filtered_year = [], filtered_region = [];
  for(i=0; i<og_data.length; i++) {
    if(check_constraints(og_data[i])) {
      var yr = (constraint['Year']).includes(parseInt(og_data[i]['Year']));
      var reg = (constraint['Region']).includes(og_data[i]['Region']);
      if(yr && reg)
        filtered_data.push(og_data[i]);
      if(reg)
        filtered_year.push(og_data[i]);
      if(yr)
        filtered_region.push(og_data[i]);
    }

    // if(og_data[i]['Country']=="India") {
    //   row = og_data[i];
    //   console.log((og_data[i]['Health Expenditure Govt']) + (constraint['Health Expenditure Govt'][0]) + (constraint['Health Expenditure Govt'][1]));
    //   console.log(og_data[i]['Population Density']);
    //   console.log(row['Population Density']>=constraint['Population Density'][0] && row['Population Density']<=constraint['Population Density'][1]);
    //   console.log(og_data[i]['Health Expenditure Pvt']);
    //   console.log(row['Health Expenditure Pvt']>=constraint['Health Expenditure Pvt'][0] && row['Health Expenditure Pvt']<=constraint['Health Expenditure Pvt'][1]);
    //   console.log(og_data[i]['Health Expenditure Indv']);
    //   console.log(row['Health Expenditure Indv']>=constraint['Health Expenditure Indv'][0] && row['Health Expenditure Indv']<=constraint['Health Expenditure Indv'][1]);
    //   console.log(og_data[i]['Life Expectancy']);
    //   console.log(row['Life Expectancy']>=constraint['Life Expectancy'][0] && row['Life Expectancy']<=constraint['Life Expectancy'][1]);
    //   console.log(og_data[i]['Region']);
    //   console.log(row['Suicides']>=constraint['Suicides'][0] && row['Suicides']<=constraint['Suicides'][1]);
    //   console.log(og_data[i]['Year']);
    //   console.log(row['Murders']>=constraint['Murders'][0] && row['Murders']<=constraint['Murders'][1]);
    //   console.log(og_data[i]['Gender']);
    //   console.log(constraint['Gender'].includes(row['Gender']));
    //
    //   console.log("**");
    //   console.log(row['Murders']);
    //   //   console.log("true");
    //   // else
    //   //   console.log("false");
    // }
}

  // console.log(filtered_data.length);
  //
  // temp_Set = new Set();
  // for(idk=0; idk<filtered_data.length; idk++) {
  //   temp_Set.add(filtered_data[idk]['Country']);
  // }
  // console.log(temp_Set);

  update_year_graph(filtered_year.slice());
  update_map(filtered_data.slice());

  if(name!='Region')
    update_pc_and_region(filtered_region);
}

// function enable() {
//   // update_constraints('Year', [2000, 2005]);
//   // update_constraints('Gender', ['Male', 'Female']);
//   update_constraints('Health Expenditure Govt', [0, 10]);
// }
