var players = {};
var bullets = {};
var Land = {
  x: 0,
  y: 0,
  d: 1000
};

//server setup
var express = require('express');
var app = express();
var server = app.listen(8080, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at' + ':' + port);
}
app.use(express.static('public'));
var io = require('socket.io')(server);

//the rest
io.sockets.on('connection', function(socket) {
  console.log("New player ID: '" + socket.id + "'");
  var data = {};
  data['players'] = players;
  data['bullets'] = bullets;
  data['land'] = Land;
  socket.emit('data', data);

  socket.on('disconnect', function() {
    console.log("Client has disconnected");
    delete players[socket.id];
  });

  socket.on('createPlayer', function(name) {
    console.log("new player papi");
    players[socket.id] = new Player(0, 0, socket.id, getRandomColor(), name);
    var playerInfo = {
        id : socket.id,
        col: players[socket.id].col,
        name : players[socket.id].name
    }
    io.sockets.emit('newPlayer', playerInfo);
  });

  socket.on('move', function(data) {
    if (players[socket.id] != null) {
      if (data.up) players[socket.id].y += -3;
      if (data.down) players[socket.id].y += 3;
      if (data.right) players[socket.id].x += 3;
      if (data.left) players[socket.id].x += -3;
      //io.sockets.emit('move', players);
    }
  });

  socket.on('angle', function(angle) {
    if (players[socket.id] != null) {
      players[socket.id].angle = angle;
      //io.sockets.emit('move', players);
    }
  });

  socket.on('shoot', function(data) {
    if (players[socket.id] != null) {
      if (players[socket.id].overload == 100) {
        //bullets.push(new Bullet(socket.id, data));
        bullets[socket.id] = new Bullet(players[socket.id].angle, socket.id);
        players[socket.id].overload = 0;
      }
    }
  });
});

function Player(x, y, id, col, name) {
  this.x = x;
  this.y = y;
  this.r = 30;
  this.id = id;
  this.col = col;
  this.name = name;
  this.hp = 100;
  this.angle;
  this.overload = 100;
  this.strokeWeight = 4;
  this.alive = true;

  this.hit = 0;
  this.bulletAngle;

  this.update = function() {
    var x = Math.abs(this.x);
    var y = Math.abs(this.y);
    var d = Math.sqrt(x * x + y * y);
    if (d > Land.d / 2 - this.r + 4 && this.hp > 0) {
      this.hp--;
    }
    if (this.overload < 100) {
      this.overload += 0.5;
    }
    if (this.hit) {
      this.onHit();
    }
    if (this.hp == 0) {
      this.alive = false;
    }
  }

  this.onHit = function() {
    var dX = Math.cos(this.bulletAngle);
    var dY = Math.sin(this.bulletAngle);
    this.x = this.x + 5 * dX;
    this.y = this.y + 5 * dY;
    this.hit--;
  }
}

function Bullet(angle, id) {
  this.x = players[id].x;
  this.y = players[id].y;
  this.r = 8;
  this.angle = angle;
  this.speed = 15;
  this.strokeWeight = 2;
  this.playerId = id;

  this.update = function() {
    var dX = Math.cos(this.angle);
    var dY = Math.sin(this.angle);
    this.x = this.x + this.speed * dX;
    this.y = this.y + this.speed * dY;
  }

  this.collides = function() {
    for (var id in players)
      if (this.playerId != id) {
        var a = Math.abs(this.x - players[id].x);
        var b = Math.abs(this.y - players[id].y);
        var d = Math.sqrt(a * a + b * b);
        if (d < players[id].r + players[id].strokeWeight + this.strokeWeight) {
          players[id].hit = 40;
          players[id].bulletAngle = this.angle;
          return true;
        } else {
          return false;
        }
      }
    if (this.x > 2000 || this.x < -2000 || this.y > 2000 || this.y < -2000) {
      return true;
    }
  }

}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//main loop
setInterval(function() {
  if (Land.d > 0) {
    Land.d -= 0.1;
  }
  io.sockets.emit('land', Land);

  for (var id in players) {
    players[id].update();
  }
  for (var id in bullets) {
    bullets[id].update();
    if (bullets[id].collides()) {
      delete bullets[id];
    }
  }
  io.sockets.emit('bullets', bullets);
  //io.sockets.emit('players', players);
  var o = {};
  for (var id in players) {
    o[id] = {
      x: players[id].x,
      y: players[id].y,
      angle: players[id].angle
    }
  }
  io.sockets.emit('players', o);

}, 1000 / 15);
