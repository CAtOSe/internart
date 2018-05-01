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
    $('main#login div#box div.linear-activity').removeClass('hide');
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
          $('main#login div#box div.linear-activity').addClass('hide');
          popMessage($('#box'), 'bottom', 'center', 'Invalid credentials', 10, 2000);
        } else {
          $('main#login div#box div.linear-activity').addClass('hide');
          popMessage($('#box'), 'bottom', 'center', 'Unkown error occured', 10, 2000);
        }
        $('main#login div#box div.linear-activity').addClass('hide');
      });
    } else {
      console.log('TODO REGISTER');
    }
  }
});
