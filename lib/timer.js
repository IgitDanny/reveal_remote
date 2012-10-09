var timer_setup;

timer_setup = function() {
  var addSecond, secs, timer;
  timer = document.createElement('div');
  timer.setAttribute('id', 'timer');
  document.getElementsByTagName('body')[0].appendChild(timer);
  secs = 0;
  addSecond = function() {
    secs += 1;
    document.getElementById('timer').innerText = ([parseInt(secs / 60 / 60, 10), parseInt(secs / 60, 10) % 60, secs % 60].map(function(v) {
      if (v < 10) {
        return '0' + v;
      } else {
        return v;
      }
    })).join(':');
    return setTimeout(addSecond, 1000);
  };
  return addSecond();
};

document.addEventListener("DOMContentLoaded", timer_setup);
