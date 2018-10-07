(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $("#buck").hover(function(){
      $(this).attr("src", "assets/img/profile_mosaic.jpg");
    }, function(){
      $(this).attr("src", "assets/img/profile.jpg");
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space