var app, app_id, base_path, browser_inject, browser_slides, dir, express, fs, handler, http, iface, ifaces, index, inject_scripts, io, ip, optimist, os, phone_inject, phone_slides, remote_map, server;

fs = require('fs');

os = require('os');

express = require('express');

http = require('http');

optimist = require('optimist');

base_path = process.cwd();

handler = function(req, res) {
  res.writeHead(200);
  return res.end('Hello World');
};

ip = false;

ifaces = os.networkInterfaces();

for (iface in ifaces) {
  ifaces[iface].forEach(function(addr) {
    if (!(ip || addr.address === '127.0.0.1') ? addr.family === 'IPv4' : void 0) {
      return ip = addr.address;
    }
  });
}

app = express();

app.set('port', 4101);

app.get('/js/slide_receiver.js', function(req, res) {
  return fs.readFile("" + __dirname + "/lib/slide_receiver.js", function(err, content) {
    res.writeHeader(200);
    return res.end(content);
  });
});

app.get('/js/slide_controller.js', function(req, res) {
  return fs.readFile("" + __dirname + "/lib/slide_controller.js", 'utf8', function(err, content) {
    res.writeHeader(200);
    return res.end(content.replace(/__hostname__/, "" + ip + ":" + (app.get('port'))));
  });
});

dir = optimist.argv._[0];

if (dir.charAt(0) === "/") base_path = '';

index = optimist.argv['index'] || 'index.html';

browser_slides = '';

phone_slides = '';

inject_scripts = function(html, sname) {
  var bottom, top, _ref;
  _ref = html.split('</head>'), top = _ref[0], bottom = _ref[1];
  top += '<script type="text/javascript" src="/socket.io/socket.io.js"></script>';
  top += "<script type='text/javascript' src='/js/" + sname + ".js'></script>";
  return [top, bottom].join('\n</head>');
};

browser_inject = function(err, html) {
  return browser_slides = inject_scripts(html, 'slide_receiver');
};

phone_inject = function(err, html) {
  return phone_slides = inject_scripts(html, 'slide_controller');
};

fs.readdir(dir, function(err, list) {
  return list.forEach(function(file) {
    if (file === index) {
      fs.readFile("" + base_path + "/" + dir + "/" + file, 'utf8', browser_inject);
      fs.readFile("" + base_path + "/" + dir + "/" + file, 'utf8', phone_inject);
    }
    return fs.stat("" + base_path + dir + "/" + file, function(err, stat) {
      if (stat && stat.isDirectory()) {
        console.log("found " + base_path + dir + "/" + file);
        return app.use("/" + file, express.static("" + base_path + "/" + dir + "/" + file));
      }
    });
  });
});

app.get('/', function(req, res) {
  res.writeHeader(200);
  return res.end(browser_slides);
});

app.get('/phone', function(req, res) {
  res.writeHeader(200);
  return res.end(phone_slides);
});

server = http.createServer(app).listen(app.get('port'), function() {
  var exec;
  console.log("Server started listening on port " + (app.get('port')) + "\n\n");
  console.log("-------------------------------------------------------");
  if (os.type() === "Darwin") {
    exec = require('child_process').exec;
    exec("open http://" + ip + ":" + (app.get('port')));
  } else {
    console.log("Start your slideshow by going to http://" + ip + ":" + (app.get('port')) + " on your browsers computer");
  }
  return console.log("Then point your phone to http://" + ip + ":" + (app.get('port')) + "/phone");
});

io = require('socket.io').listen(server);

app_id = null;

remote_map = {};

io.sockets.on('connection', function(socket) {
  socket.emit('startup');
  return socket.on('init', function(data) {
    var sock;
    if (data.phone) {
      if (app_id) {
        remote_map[app_id]['phone'] = socket;
        socket.app_id = app_id;
        socket.emit('app_id', {
          app_id: app_id
        });
        sock = remote_map[app_id]['computer'];
        return socket.on("tell_browser" + app_id, (function(aid, sock) {
          return function(data) {
            return sock.emit("reveal_navigate" + aid, data);
          };
        })(app_id, sock));
      }
    } else {
      app_id = parseInt(Math.random(100) * 1000, 10);
      remote_map[app_id] = {
        computer: null,
        phone: null
      };
      socket.app_id = app_id;
      socket.emit('app_id', {
        app_id: app_id
      });
      return remote_map[app_id]['computer'] = socket;
    }
  });
});
