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
  if (coverHeight+$('.info:first').outerHeight() < $('.photo').outerHeight()) {
    coverHeight = $('.photo').outerHeight() - $('.info:first').outerHeight();
  }
  $('.cover').height(coverHeight);
  if (isMobile()) {
    $('.photo').css('top', coverHeight/2);
    $('.changePhoto').attr('style','');
    $('.changePhoto').css('top', coverHeight/2);
  } else {
    $('.photo').attr('style','');
    $('.changePhoto').attr('style','');
  }
  photoLoc = getLocation($('.photo'));
  if (!isMobile()) {
    $('.info:first').attr('style','');
    $('.info:first').css('paddingLeft', photoLoc.left + photoLoc.width);
    $('.changePhoto').css('marginLeft', photoLoc.left);
  } else {
    $('.info:first').attr('style','');
    $('.info:first').css('paddingTop', photoLoc.height - coverHeight/2);
  }
  photoLoc = getLocation($('.photo'));
  $('.changePhoto').width(photoLoc.width);
  $('.changePhoto').height(photoLoc.height);
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
