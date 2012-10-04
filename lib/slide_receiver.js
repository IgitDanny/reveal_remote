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
      console.log('got message', data['direction'].toLowerCase());
      switch (data['direction'].toLowerCase()) {
        case "left":
          return Reveal.navigateLeft();
        case "right":
          return Reveal.navigateRight();
        case "up":
          return Reveal.navigateUp();
        case "down":
          return Reveal.navigateDown();
        case "prev":
          return Reveal.navigatePrev();
        case "next":
          return Reveal.navigateNext();
        default:
          return console.log('invalid instruction');
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", setup);
