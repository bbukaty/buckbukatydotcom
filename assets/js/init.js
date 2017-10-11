(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $("#buck").hover(function(){
      $(this).attr("src", "assets/img/buck_alt.jpg");
    }, function(){
      $(this).attr("src", "assets/img/buck.jpg");
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space