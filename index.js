(function() {
  var app, app_id, base_path, controller_inject, controller_slides, dir, express, fs, http, iface, ifaces, index, inject_scripts, io, ip, optimist, os, receiver_inject, receiver_slides, remote_map, rnav, server;

  fs = require('fs');

  os = require('os');

  express = require('express');

  http = require('http');

  optimist = require('optimist');

  base_path = process.cwd();

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

  app.get('/js/reveal_remote.js', function(req, res) {
    return fs.readFile("" + __dirname + "/lib/reveal_remote.js", 'utf8', function(err, content) {
      res.writeHeader(200);
      return res.end(content.replace(/__hostname__/, "" + ip + ":" + (app.get('port'))));
    });
  });

  dir = optimist.argv._[0];

  if (dir.charAt(0) === "/") base_path = '';

  index = optimist.argv['index'] || 'index.html';

  receiver_slides = '';

  controller_slides = '';

  inject_scripts = function(html, sname) {
    var bottom, top, _ref;
    _ref = html.split('</head>'), top = _ref[0], bottom = _ref[1];
    top += '<script type="text/javascript" src="/socket.io/socket.io.js"></script>';
    top += "<script type='text/javascript' src='/js/" + sname + ".js'></script>";
    return [top, bottom].join('\n</head>');
  };

  receiver_inject = function(err, html) {
    return receiver_slides = inject_scripts(html, 'reveal_remote');
  };

  controller_inject = function(err, html) {
    return controller_slides = inject_scripts(html, 'reveal_remote');
  };

  fs.readdir(dir, function(err, list) {
    return list.forEach(function(file) {
      if (file === index) {
        fs.readFile("" + base_path + "/" + dir + "/" + file, 'utf8', receiver_inject);
        fs.readFile("" + base_path + "/" + dir + "/" + file, 'utf8', controller_inject);
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
    return res.end(receiver_slides);
  });

  app.get('/controller', function(req, res) {
    res.writeHeader(200);
    return res.end(controller_slides);
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
    return console.log("Point your controller to http://" + ip + ":" + (app.get('port')) + "/controller");
  });

  io = require('socket.io').listen(server);

  app_id = null;

  remote_map = {};

  rnav = function(aid, sock) {
    return function(data) {
      return sock.emit("reveal_navigate" + aid, data);
    };
  };

  io.sockets.on('connection', function(socket) {
    socket.emit('startup');
    return socket.on('init', function() {
      var sock;
      if (app_id) {
        socket.emit('app_id', {
          app_id: app_id
        });
        sock = remote_map[app_id];
        socket.on("tell_" + app_id, rnav(app_id, sock));
        sock.on("tell_" + app_id, rnav(app_id, socket));
        return app_id = null;
      } else {
        app_id = parseInt(Math.random(100) * 1000, 10);
        remote_map[app_id] = {};
        socket.emit('app_id', {
          app_id: app_id
        });
        return remote_map[app_id] = socket;
      }
    });
  });

}).call(this);
