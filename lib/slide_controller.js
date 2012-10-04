var app_id, phone, setup, socket;

socket = io.connect("http://__hostname__");

phone = true;

app_id = null;

setup = function() {
  socket.on('startup', function(data) {
    return socket.emit('init', {
      phone: phone
    });
  });
  return socket.on('app_id', function(data) {
    var upgradeNav;
    if (!app_id) app_id = data['app_id'];
    upgradeNav = function() {
      if (Reveal && Reveal.navigateNext) {
        return document.addEventListener("slidechanged", function() {
          return socket.emit("tell_browser" + app_id, Reveal.getIndices());
        });
      } else {
        return setTimeout(upgradeNav, 200);
      }
    };
    return setTimeout(upgradeNav, 200);
  });
};

document.addEventListener("DOMContentLoaded", setup);
