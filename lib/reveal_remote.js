var app_id, setup, socket;

socket = io.connect("http://__hostname__");

app_id = null;

setup = function() {
  var from_socket;
  from_socket = false;
  socket.on('startup', function() {
    return socket.emit('init');
  });
  return socket.on('app_id', function(data) {
    if (!app_id) app_id = data['app_id'];
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
