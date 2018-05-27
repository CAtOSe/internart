$(function() {
  $("#colorPicker").spectrum({
      showInput: true,
      color: '#' + bgColor,
      preferredFormat: 'hex',
      replacerClassName: 'colorPickerReplacer',
      move: function(color) {
        $('#art').css('backgroundColor', color.toHexString());
      },
      change: function(color) {
        $('#art').css('backgroundColor', color.toHexString());
      }
  });
});
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
      bgColor: $("#colorPicker").spectrum("get").toHex()
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
    if (evnt.target == $('#deleteArtwork')[0]) {
    } else if (evnt.target == $('#delConfBtn')[0]) {
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
    } else {
      removePopup(delPop.id);
    }
  });
});
