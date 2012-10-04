var app_id, setup, socket;

socket = io.connect("http://" + window.location.hostname);

app_id = null;

setup = function() {
  socket.on('startup', function(data) {
    return socket.emit('init', {
      phone: false
    });
  });
  return socket.on('app_id', function(data) {
    if (!app_id) app_id = data['app_id'];
    return socket.on("reveal_navigate" + app_id, function(data) {
      return Reveal.navigateTo(data.h, data.v);
    });
  });
};

document.addEventListener("DOMContentLoaded", setup);
