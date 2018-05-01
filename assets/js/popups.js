var popups = [];

$(function() {
  $('body').append('<div class="popups"></div>');
});

function getLocation(elem) {
  let offsets = {
    right: Math.round($(window).width() - elem[0].getBoundingClientRect().right),
    left: Math.round(elem[0].getBoundingClientRect().left),
    top: Math.round(elem[0].getBoundingClientRect().top),
    height: Math.round(elem[0].getBoundingClientRect().height),
    width: Math.round(elem[0].getBoundingClientRect().width)
  }
  return offsets;
}

function removePopup(id) {
  for (let [i, pop] of popups.entries()) {
    if (pop.id == id) {
      $('#'+id).addClass('hide').remove();
      popups.splice(i, 1);
    }
  }
}

function popMessage(elem, dir, anchor, text, offset = 0, time = 0) {
  let popup = {
    id: Math.round(Math.random()*100000),
    element: 0,
    type: 'Message',
    location: {
      top: 0,
      left: 0
    },
    text: text
  };

  $('.popups').append('<span class="popup" id="' + popup.id + '">' + text + '</span>');
  let popup_element = $('.popups #'+popup.id);
  let loc = getLocation(elem);

  if (dir == 'bottom') {
    popup.location.top = loc.top + loc.height + offset;
    console.log(popup.location.top, loc.top, loc.height, offset);
    if (anchor == 'left') {
      popup.location.left = loc.left;
    } else if (anchor == 'center') {
      popup.location.left = loc.left + (loc.width/2 - popup_element.outerWidth()/2);
    } else if (anchor == 'right') {
      console.log(popup_element.outerWidth());
      popup.location.left = loc.left + loc.width - popup_element.outerWidth();
    }
  } else if (dir == 'top') {
    popup.location.top = loc.top - popup_element.outerHeight() - offset;
    if (anchor == 'left') {
      popup.location.left = loc.left;
    } else if (anchor == 'center') {
      popup.location.left = loc.left + (loc.width/2 - popup_element.outerWidth()/2);
    } else if (anchor == 'right') {
      console.log(popup_element.outerWidth());
      popup.location.left = loc.left + loc.width - popup_element.outerWidth();
    }
  } else if (dir == 'left') {
    popup.location.left = loc.left - popup_element.outerWidth() - offset;
    if (anchor == 'top') {
      popup.location.top = loc.top;
    } else if (anchor == 'center') {
      popup.location.top = loc.top + (loc.height/2 - popup_element.outerHeight()/2);
    } else if (anchor == 'bottom') {
      popup.location.top = loc.top + loc.height - popup_element.outerHeight();
    }
  } else if (dir == 'right') {
    popup.location.left = loc.left + loc.width + offset;
    if (anchor == 'top') {
      popup.location.top = loc.top;
    } else if (anchor == 'center') {
      popup.location.top = loc.top + (loc.height/2 - popup_element.outerHeight()/2);
    } else if (anchor == 'bottom') {
      popup.location.top = loc.top + loc.height - popup_element.outerHeight();
    }
  }

  popup_element.css({
    'top': popup.location.top,
    'left': popup.location.left
  });
  popup_element = $('.popups #'+popup.id);
  popup.element = popup_element;
  popups.push(popup);
  if (time > 0) {
    setTimeout(function() { removePopup(popup.id) }, time);
  }
  return popup;
}




function popCustom(elem, dir, anchor, text, offset = 0, time = 0) {
  let popup = {
    id: Math.round(Math.random()*100000),
    element: 0,
    type: 'Custom',
    location: {
      top: 0,
      left: 0
    },
    text: text
  };

  $('.popups').append(text);
  let popup_element = $('.popups > *:last').attr('id', popup.id);
  let loc = getLocation(elem);

  if (dir == 'bottom') {
    popup.location.top = loc.top + loc.height + offset;
    if (anchor == 'left') {
      popup.location.left = loc.left;
    } else if (anchor == 'center') {
      popup.location.left = loc.left + (loc.width/2 - popup_element.outerWidth()/2);
    } else if (anchor == 'right') {
      popup.location.left = loc.left + loc.width - popup_element.outerWidth();
    }
  } else if (dir == 'top') {
    popup.location.top = loc.top - popup_element.outerHeight() - offset;
    if (anchor == 'left') {
      popup.location.left = loc.left;
    } else if (anchor == 'center') {
      popup.location.left = loc.left + (loc.width/2 - popup_element.outerWidth()/2);
    } else if (anchor == 'right') {
      console.log(popup_element.outerWidth());
      popup.location.left = loc.left + loc.width - popup_element.outerWidth();
    }
  } else if (dir == 'left') {
    popup.location.left = loc.left - popup_element.outerWidth() - offset;
    if (anchor == 'top') {
      popup.location.top = loc.top;
    } else if (anchor == 'center') {
      popup.location.top = loc.top + (loc.height/2 - popup_element.outerHeight()/2);
    } else if (anchor == 'bottom') {
      popup.location.top = loc.top + loc.height - popup_element.outerHeight();
    }
  } else if (dir == 'right') {
    popup.location.left = loc.left + loc.width + offset;
    if (anchor == 'top') {
      popup.location.top = loc.top;
    } else if (anchor == 'center') {
      popup.location.top = loc.top + (loc.height/2 - popup_element.outerHeight()/2);
    } else if (anchor == 'bottom') {
      popup.location.top = loc.top + loc.height - popup_element.outerHeight();
    }
  }

  popup_element.css({
    'top': popup.location.top,
    'left': popup.location.left
  });
  popup_element = $('.popups #'+popup.id);
  popup.element = popup_element;
  popups.push(popup);
  if (time > 0) {
    setTimeout(function() { removePopup(popup.id) }, time);
  }
  return popup;
}
