$('#searchBar').on('keydown', function(e) {
  if (e.key == 'Enter') {
    $.ajax({
      url: '/api/g/search',
      method: 'POST',
      data: {
        query: $('#searchBar').val()
      }
    }).done(function(data){
      if (data != '500') {
        $('body > *:not(nav)').remove();
        $('body').append(data);
      } else {
        popMessage($('#searchBar'), 'bottom', 'left', 'Unkown error occured', 16, 2000);
      }
    }).fail(function(data){
      console.log(data);
    });
  }
});
