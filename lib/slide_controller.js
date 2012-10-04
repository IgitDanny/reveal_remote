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
      var direction, _i, _len, _ref, _results;
      if (Reveal && Reveal.navigateNext) {
        _ref = ["Left", "Right", "Up", "Down", "Prev", "Next"];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          direction = _ref[_i];
          _results.push(document.addEventListener("navigate" + direction, (function(d) {
            return function() {
              return socket.emit("tell_browser" + app_id, {
                direction: d
              });
            };
          })(direction)));
        }
        return _results;
      } else {
        return setTimeout(upgradeNav, 200);
      }
    };
    return setTimeout(upgradeNav, 200);
  });
};

document.addEventListener("DOMContentLoaded", setup);
