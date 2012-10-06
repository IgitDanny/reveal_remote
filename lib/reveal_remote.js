var app_id, setup, socket;

socket = io.connect("http://__hostname__");

app_id = null;

setup = function() {
  var from_socket;
  from_socket = false;
  return socket.on('init', function(data) {
    app_id = data['app_id'];
    socket.on("reveal_navigate" + app_id, function(data) {
      from_socket = true;
      return Reveal.navigateTo(data.h, data.v);
    });
    return document.addEventListener("slidechanged", function() {
      if (!from_socket) socket.emit("tell_" + app_id, Reveal.getIndices());
      return from_socket = false;
    });
  });
};

document.addEventListener("DOMContentLoaded", setup);
