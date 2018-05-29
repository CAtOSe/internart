$(function(){
  $('.votes i').on('click', function(){
    $.ajax({
      url: '/api/g/vote',
      method: 'POST',
      data: {
        artID: artID
      }
    }).done(function(data){
      if (data.status.code == 200 && data.status.message == "Voted") {
        $('.votes').addClass('voted');
        $('.votes i').addClass('hover');
        $('.votes span').html(data.votes.toString());
      } else if (data.status.code == 200 && data.status.message == "DeVoted") {
        $('.votes').removeClass('voted');
        $('.votes i').addClass('hover');
        $('.votes span').html(data.votes.toString());
      } else {
        $('.votes i').removeClass('hover');
      }
    });
  });
});
