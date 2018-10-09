(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $("#buck").hover(function(){
      $(this).attr("src", "assets/img/headshot_candy.jpg");
    }, function(){
      $(this).attr("src", "assets/img/headshot.jpg");
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space