var pop;
if ($('#art').length > 0) {
  $(document).on('click', function(e) {
    if (e.target == $('#adminTools i')[0] && $('.adminToolsPopup').length <= 0) {
      $('#adminTools').addClass('open');
      pop = popCustom($('#adminTools'), 'bottom', 'right', '<div class="adminToolsPopup shadow"><a class="delink pointer" id="removeAdminTools">Remove</a></div>');
    } else if (e.target == $('#removeAdminTools')[0]) {
      console.log('remove');
      $.ajax({
        method: 'POST',
        url: '/api/g/deleteArtwork',
        data: {
          artID: artID
        }
      }).done(function(data) {
        console.log(data);
        if (data.status.code == 200) {
          window.location.href = "/";
        } else {
          popMessage($('.adminToolsPopup'), 'right', 'center', 'Unknown error occured', 10, 1500);
        }
      });
    } else if ($('.adminToolsPopup').length > 0) {
      removePopup(pop.id);
      $('#adminTools').removeClass('open');
    }
  });
}
