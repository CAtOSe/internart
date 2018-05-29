$(function(){
  var cookies;
  var pop_id;

  function readCookie(name,c,C,i){
    if(cookies){ return cookies[name]; }
    c = document.cookie.split('; ');
    cookies = {};
    for(i=c.length-1; i>=0; i--){
      C = c[i].split('=');
      cookies[C[0]] = C[1];
    }

    return cookies[name];
  }
  window.readCookie = readCookie; // or expose it however you want
  if (readCookie('username') != undefined) {
    $('nav span#userBar span.loggedIn').html(readCookie('username'));
    $('.loggedIn').removeClass('hide');
    $('nav img').attr('src', '/users/avatar/' + readCookie('id'));
    $('nav span#userBar div#loginBar').addClass('hide');
    $('nav span#userBar').on('click', function(e){
        if ($('.userBarExt').length == 0) {
          let pop = popCustom($('#userBar'), 'bottom', 'right', '<div class="userBarExt shadow"><a class="delink" href="/u/' + readCookie('id') + '">Profile</a><a class="delink" href="/upload">Upload</a><a class="delink pointer" id="logout">Logout</a></div>');
          $(document).click(function(evnt) {
            if (evnt.target != $('span#userBar')[0] && evnt.target != $('img.loggedIn')[0] && evnt.target != $('span.loggedIn.smallHide')[0]) {
              removePopup(pop_id);
            }
          });
          $('#logout').on('click', function(e){
            $.ajax({
              url: '/api/u/logout',
              method: 'POST'
            }).done(function(data) {
              if (data.status.code == 200 || data.status.code == 403) {
                $('nav span#userBar div#loginBar').removeClass('hide');
                $('.loggedIn').addClass('hide');
                popMessage($('nav'), 'bottom', 'right', data.status.message, 10, 1500);
                console.log(data.status.code);
              } else {
                popMessage($('nav'), 'bottom', 'right', 'Unkown error occured', 10, 1500);
              }
              window.location.href = "/";
            });
          });
          pop_id = pop.id;
        } else {
          removePopup(pop_id);
        }
    });
  }
});
