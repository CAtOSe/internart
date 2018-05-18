$(function(){
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
      $('.linear-activity').removeClass('hide');
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
          url: '/api/g/upload',
          method: 'POST',
          contentType: false,
          processData: false,
          data: formData
        }).done(function(data) {
          form.removeClass('uploading');
          form[0].reset();
          $('.linear-activity').addClass('hide');
          if (data.status.code == 201) {
            $.ajax({
              url: '/api/g/editForm',
              method: 'POST',
              data: {
                artID: data.id
              }
            }).done(function(page) {
              $('main').remove();
              $('body').append(page);
            });
          } else if (data.status.code == 403) {
            if (data.status.message.includes('denied')) {
              popMessage(form, 'bottom', 'center', 'Permission denied', 10, 1500);
            } else window.location.href = "/login";
          } else {
            popMessage(form, 'bottom', 'center', 'Unkown error occured', 10, 1500);
          }
        });
      }
    });
  }
});
