// $(document).ready(function(){
//     $('input[type="radio"]').click(function(){
//         var inputValue = $(this).attr("value");
//         console.log(inputValue);
//         var targetBox = $("." + inputValue);
//         $(".left_menu").not(targetBox).hide();
//         $(targetBox).show();
//     });
// });

function displayOverall(){
  document.getElementById('feature_comparison').style.display="none";
  document.getElementById('overall_comparison').style.display="block";
  document.getElementById('right_bottom_heatmap').style.display="none";
  document.getElementById('right_bottom_left_vis').style.display="block";
  document.getElementById('right_bottom_right_vis').style.display="block";
}

function displayIndividual(){
  document.getElementById('overall_comparison').style.display="none";
  document.getElementById('feature_comparison').style.display="block";
  document.getElementById('right_bottom_left_vis').style.display="none";
  document.getElementById('right_bottom_right_vis').style.display="none";
  document.getElementById('right_bottom_heatmap').style.display="block";

}
