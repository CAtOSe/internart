$('.title').val(title);
$('.description').val(description)

var saveBtn = $('input[type=submit]');

saveBtn.on('click', function() {
  $('.linear-activity').removeClass('hide');
  $.ajax({
    url: '/api/g/edit',
    method: 'POST',
    data: {
      artID: artID,
      title: $('.title').val(),
      description: $('.description').val(),
      bgColor: 'ffffff'
    }
  }).done(function(data) {
    if (data.status.code == 200) {
      window.location.replace("/art/" + artID);
    } else {
      popMessage($('.art-info'), 'top', 'left', 'An error occured', 10, 1500);
    }
    $('.linear-activity').addClass('hide');
  });
});

$('#deleteArtwork').on('click', function() {
  let delPop = popCustom($('#deleteArtwork'), 'bottom', 'right', '<div class="delConfirm"><span>Delete artwork?</span><div><button>Cancel</button><button id="delConfBtn">Delete</button></div></div>');
  $(document).click(function(evnt) {
    if (evnt.target != $('#deleteArtwork')[0]) {
      removePopup(delPop.id);
    }
  });
  $('#delConfBtn').on('click', function() {
    $.ajax({
      method: 'POST',
      url: '/api/g/deleteArtwork',
      data: {
        artID: artID
      }
    }).done(function(data) {
      if (data.status.code == 200) {
        window.location.href = "/";
      } else {
        popMessage($('#deleteArtwork'), 'bottom', 'right', 'Unknown error occured', 10, 1500);
      }
    });
  });
});
