var hash = window.location.hash.substr(1);
var currentMode = "login";

function showRegister() {
  currentMode = "register";
  $('form.login').addClass('hide');
  $('span.login').removeClass('sel');
  $('form.register').removeClass('hide');
  $('span.register').addClass('sel');
}

function showLogin() {
  currentMode = "login";
  $('form.register').addClass('hide');
  $('span.register').removeClass('sel');
  $('form.login').removeClass('hide');
  $('span.login').addClass('sel');
}

if (hash == "register") showRegister();
$('span.login').on('click', showLogin);
$('span.register').on('click', showRegister);

function check() {
  let f = 0;
  $('form.' + currentMode + ' input').each(function(i) {
    if($(this).val().trim() == "") {
      $(this).addClass('reject');
      f++;
    } else $(this).removeClass('reject');
  });
  if (f > 0) return false;
  else return true;
}

$('form.login').on('submit', function(e) {
  e.preventDefault();
  if (check()) {
    $('.linear-activity').removeClass('hide');
    if (currentMode == 'login') {
      $.ajax({
        url: '/api/u/login',
        method: 'POST',
        data: {
          "loginName": $('form.login input[name=loginName]').val(),
          "loginPassword": $('form.login input[name=loginPassword]').val()
        }
      }).done(function(data){
        if (data.status.code == 200) {
          window.location.href = "/";
        } else if (data.status.code == 204){
          $('.linear-activity').addClass('hide');
          popMessage($('#box'), 'bottom', 'center', 'Invalid credentials', 10, 2000);
        } else {
          $('.linear-activity').addClass('hide');
          popMessage($('#box'), 'bottom', 'center', 'Unkown error occured', 10, 2000);
        }
        $('main#login div#box div.linear-activity').addClass('hide');
      });
    }
  }
});

$('form.register').on('submit', function(e) {
  e.preventDefault();
  check();
  if ($('#pass1').val() != $('#pass2').val()) {
    $('#pass2').addClass('reject');
    popMessage($('#pass2'), 'right', 'center', 'Passwords do not match', 10, 2000);
    return;
  }
  $('.linear-activity').removeClass('hide');
  $.ajax({
    url: '/api/u/createUser',
    method: 'POST',
    data: {
      username: $('form.register input[name=username]').val(),
      fullname: $('form.register input[name=fullname]').val(),
      password: $('#pass2').val(),
      email: $('form.register input[name=email]').val()
    }
  }).done(function(data) {
    if (data.status.code == 201) {
      window.location.href = "/editUser";
    } else {
      popMessage($('#box'), 'bottom', 'center', data.status.message, 10, 2000);
    }
  });

});
