$('#Population Density').find("#slider-distance").find("*").prop("disabled", true);
$('#Health Expenditure Govt').find("#slider-distance").find("*").prop("disabled", true);
$('#Health Expenditure Pvt').find("#slider-distance").find("*").prop("disabled", true);
$('#Health Expenditure Indv').find("#slider-distance").find("*").prop("disabled", true);
$('#Life Expectancy').find("#slider-distance").find("*").prop("disabled", true);
$('#Education Expenditure').find("#slider-distance").find("*").prop("disabled", true);
$('#Mean years in school').find("#slider-distance").find("*").prop("disabled", true);
$('#Average Income').find("#slider-distance").find("*").prop("disabled", true);
$('#Employment Rate').find("#slider-distance").find("*").prop("disabled", true);
$('#Income Inequality').find("#slider-distance").find("*").prop("disabled", true);
$('#Child Mortality Rate').find("#slider-distance").find("*").prop("disabled", true);
$('#Adult Mortality Rate').find("#slider-distance").find("*").prop("disabled", true);
$('#Suicides').find("#slider-distance").find("*").prop("disabled", true);
$('#Murders').find("#slider-distance").find("*").prop("disabled", true);

$('.gender').find("*").prop("disabled", true);

initial_map = { 'Population Density':[0, 25000],
'Health Expenditure Govt':[0, 200],
'Health Expenditure Pvt':[0, 100],
'Health Expenditure Indv':[0, 100],
'Life Expectancy':[0, 100],
'Education Expenditure':[0, 25],
'Mean years in school':[0, 20],
'Average Income':[0, 40000],
'Employment Rate':[0, 100],
'Income Inequality':[0, 100],
'Child Mortality Rate':[0, 600],
'Adult Mortality Rate':[0, 1000],
'Suicides':[0, 220000],
'Murders':[0, 6000]
}


updated_map = { 'Population Density':[0, 25000],
'Health Expenditure Govt':[0, 200],
'Health Expenditure Pvt':[0, 100],
'Health Expenditure Indv':[0, 100],
'Life Expectancy':[0, 100],
'Education Expenditure':[0, 25],
'Mean years in school':[0, 20],
'Average Income':[0, 40000],
'Employment Rate':[0, 100],
'Income Inequality':[0, 100],
'Child Mortality Rate':[0, 600],
'Adult Mortality Rate':[0, 1000],
'Suicides':[0, 220000],
'Murders':[0, 6000]
}

console.log(initial_map);

function func1(node){
  // console.log(node);
  node.value=Math.min(node.value,node.parentNode.childNodes[5].value-1);
  var value=(100/(parseInt(node.max)-parseInt(node.min)))*parseInt(node.value)-(100/(parseInt(node.max)-parseInt(node.min)))*parseInt(node.min);
  var children = node.parentNode.childNodes[1].childNodes;
  children[1].style.width=value+'%';
  children[5].style.left=value+'%';
  children[7].style.left=value+'%';
  children[11].style.left=value+'%';
  children[11].childNodes[1].innerHTML=node.value;
  id = node.parentNode.parentNode.id;
  right = node.parentNode.querySelector('#rightthumb');
  // console.log("Left node " + node.value + "\nRight node "+ right.value +"\nColumn "+id);

}


function func2(node){
    node.value=Math.max(node.value,node.parentNode.childNodes[3].value-(-1));
  var value=(100/(parseInt(node.max)-parseInt(node.min)))*parseInt(node.value)-(100/(parseInt(node.max)-parseInt(node.min)))*parseInt(node.min);
  var children = node.parentNode.childNodes[1].childNodes;
  children[3].style.width=(100-value)+'%';
  children[5].style.right=(100-value)+'%';
  children[9].style.left=value+'%';
  children[13].style.left=value+'%';
  children[13].childNodes[1].innerHTML=node.value;
  left = node.parentNode.querySelector('#leftthumb');
  id = node.parentNode.parentNode.id;
}

function call_updateconstraint(node){

  main_node = node.parentNode.parentNode;
  id = main_node.id;
  checkbox = main_node.querySelector('input[type="checkbox"]');
  if(checkbox.checked==true){
    if(node.id=="leftthumb"){
      right = node.parentNode.querySelector('#rightthumb');
      update_constraints(id, [node.value, right.value])
      // updated_map[id]=[node.value, right.value]
      // console.log(updated_map);
    }
    else if (node.id=="rightthumb") {
      left = left = node.parentNode.querySelector('#leftthumb');
      update_constraints(id, [left.value, node.value])
      // updated_map[id]=[left.value, node.value]
      // console.log(updated_map);
    }

  }

}

function enableslider(node){
  if($(node). prop("checked") == true){
    parent = node.parentNode;
    // $(parent).find("#slider-distance").find("*").prop("disabled", false);
    slider_distance = parent.querySelector("#slider-distance")
    // $(parent).find("#slider-distance").find("*").prop("disabled", true);
    $(slider_distance).find("*").prop("disabled", false);
    line = slider_distance.querySelector("#line");
    thumb1 = slider_distance.querySelector("#t1");
    thumb2 = slider_distance.querySelector("#t2");
    invleft = slider_distance.querySelector("#ivl");
    invright = slider_distance.querySelector("#ivr");
    $(line).css('background-color', '#003399');
    $(thumb1).css('background-color', '#FFF');
    $(thumb2).css('background-color', '#FFF');
    $(invleft).css('background-color', '#CCC');
    $(invright).css('background-color', '#CCC');
    leftnode = parent.querySelector('#leftthumb');
    func1(leftnode);
    rightnode = parent.querySelector('#rightthumb');
    func2(rightnode);

  }
  else if($(node). prop("checked") == false){
    parent = node.parentNode;
    slider_distance = parent.querySelector("#slider-distance")
    // $(parent).find("#slider-distance").find("*").prop("disabled", true);
    $(slider_distance).find("*").prop("disabled", true);
    line = slider_distance.querySelector("#line");
    thumb1 = slider_distance.querySelector("#t1");
    thumb2 = slider_distance.querySelector("#t2");
    invleft = slider_distance.querySelector("#ivl");
    invright = slider_distance.querySelector("#ivr");
    $(line).css('background-color', 'grey');
    $(thumb1).css('background-color', 'grey');
    $(thumb2).css('background-color', 'grey');
    $(invleft).css('background-color', 'grey');
    $(invright).css('background-color', 'grey');
    update_constraints(parent.id, initial_map[parent.id])
    // updated_map[parent.id]=initial_map[parent.id]
    // console.log(updated_map);
  }
}

function checkgender(node){

  glist = []
  if(document.getElementById('gen').checked==true){
    if(document.getElementById('Male').checked==true){
      glist.push('Male');
    }
    if(document.getElementById('Female').checked==true){
      glist.push('Female')
    }
    update_constraints('Gender', glist);
  }
}
function enablegendercheck(node){
  if($(node). prop("checked") == true){
    $('.gender').find("*").prop("disabled", false);
  }
  else if($(node). prop("checked") == false){
    $('.gender').find("*").prop("disabled", true);
    console.log('Gender', ['Male', 'Female'])
  }
}
