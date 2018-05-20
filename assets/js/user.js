function isMobile() {
  if ($(window).width() <= 486) return true;
  return false;
}

var img = new Image();

function resize(h, w){
  let coverHeight = ($(window).width()*h)/w;
  let photoLoc;
  if (coverHeight > $(window).height()*0.5) {
    coverHeight = $(window).height()*0.5;
  }
  if (coverHeight+$('.info').outerHeight() < $('.photo').outerHeight()) {
    coverHeight = $('.photo').outerHeight() - $('.info').outerHeight();
  }
  $('.cover').height(coverHeight);
  if (isMobile()) {
    $('.photo').css('top', coverHeight/2);
  } else {
    $('.photo').attr('style','');
  }
  photoLoc = getLocation($('.photo'));
  if (!isMobile()) {
    $('.info').attr('style','');
    $('.info').css('paddingLeft', photoLoc.left + photoLoc.width);
  } else {
    $('.info').attr('style','');
    $('.info').css('paddingTop', photoLoc.height - coverHeight/2);
  }
}

img.onload = function(){
  var height = img.height;
  var width = img.width;

  resize(height, width);

  $(window).on('resize', function() {
    resize(height, width);
  });
}
img.onerror = function () {
  resize(0, 1);
  $(window).on('resize', function() {
    resize(0, 1);
  });
}
img.src = '/users/cover/' + userID;
