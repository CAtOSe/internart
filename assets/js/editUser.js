var formMode = '';
$(function(){
  $('input.name').val(fullname);
  $('textarea').val(description);

  let form = $('#fileInfo');

  $('#fileUpload').on('change', function(){
    form.trigger('submit');
  });

  var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();
  if (isAdvancedUpload) {
    form.addClass('advUpload');
    $('#fileInfo > div > div > span').addClass('advUpload');
  }

  if (isAdvancedUpload) {
    var droppedFiles = false;
    form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
    })
    .on('dragover dragenter', function() {
      form.addClass('drag');
    })
    .on('dragleave dragend drop', function() {
      form.removeClass('drag');
    })
    .on('drop', function(e) {
      droppedFiles = e.originalEvent.dataTransfer.files;
      if (droppedFiles.length > 1) {
        popMessage(form, 'bottom', 'center', 'Only one file allowed', 10, 1500);
      } else {
        form.trigger('submit');
      }
    });
    form.on('submit', function(e) {
      $('.uploadProfile .linear-activity').removeClass('hide');
      if (form.hasClass('uploading')) return false;
      form.addClass('uploading');
      if (isAdvancedUpload) {
        e.preventDefault();
        var formData = new FormData();
        if (droppedFiles[0] != undefined) {
          formData.append('fileUpload', droppedFiles[0]);
        } else {
          formData.append('fileUpload', $('#fileUpload')[0].files[0]);
        }
        $.ajax({
          url: '/api/u/upload-' + formMode + '/' + userID,
          method: 'POST',
          contentType: false,
          processData: false,
          data: formData
        }).done(function(data) {
          form.removeClass('uploading');
          form[0].reset();
          $('.uploadProfile .linear-activity').addClass('hide');
          if (data.status.code == 201) {
            if (formMode == 'profile') $('.photo')[0].src = '/users/avatar/' + userID + '?' + new Date().getTime();
            else $('.cover').css('backgroundImage', "url('/users/cover/" + userID + '?' + new Date().getTime() + "')");
            resize();
            $('.uploadProfile').addClass('hide');
          } else {
            popMessage(form, 'bottom', 'center', data.status.message, 10, 1500);
          }
        });
      }
    });
  }
});

$('#saveBtn').on('click', function() {
  $('.linear-activity.edit').removeClass('hide');
  $.ajax({
    method: 'POST',
    url: '/api/u/edit',
    data: {
      id: userID,
      fullname: $('input.name').val(),
      description: $('textarea').val()
    }
  }).done(function(data){
    $('.linear-activity.edit').addClass('hide');
    if (data.status.code == 200) {
      popMessage($('#saveBtn'), 'top', 'right', 'Changes saved', 10, 1500);
    } else {
      popMessage($('#saveBtn'), 'top', 'right', 'Unknown error occured', 10, 1500);
    }
  });
});

function openUpload(mode) {
  if (mode != 'profile' && mode != 'cover') return;
  formMode = mode;
  $('.title').html('Upload ' + mode + ' photo');
  $('.uploadProfile').removeClass('hide');
  $(document).on('click', function(e) {
    if (e.target == $('.uploadProfile')[0] || e.target == $('#cancelUpload')[0]) {
      $('.uploadProfile').addClass('hide');
    }
  });
}

$('#changeCover').on('click', function() {
  openUpload('cover');
});
$('#changePhoto').on('click', function() {
  openUpload('profile');
});
