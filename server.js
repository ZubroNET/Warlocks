var players = {};
var Land = {
  x : 0,
  y : 0,
  d : 1000
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
io.sockets.on('connection', function (socket) {
    console.log("New player ID: '" + socket.id + "'");

    socket.on('disconnect', function () {
        console.log("Client has disconnected");
        delete players[socket.id];
    });

    socket.on('createPlayer', function(name){
      players[socket.id] = new Player(0, 0, socket.id, getRandomColor(), name);
      socket.emit('id',socket.id);
      socket.emit('land', Land);
      //io.clients[socket.id].send('test', socket.id);
    });

    socket.on('move', function (data) {
        if (players[socket.id] != null) {
          if(data.up) players[socket.id].y += -3;
          if(data.down) players[socket.id].y += 3;
          if(data.right) players[socket.id].x += 3;
          if(data.left) players[socket.id].x += -3;
          io.sockets.emit('move', players);
        }
    });

    socket.on('angle', function(angle){
      players[socket.id].angle = angle;
      io.sockets.emit('move', players);
    });
}
);

function Player(x, y, id, col, name) {
    this.x = x;
    this.y = y;
    this.r = 30;
    this.id = id;
    this.col = col;
    this.name = name;
    this.hp = 100;
    this.angle;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

setInterval(function(){
  if(Land.d >0){
    Land.d--;
  }
  io.sockets.emit('land', Land);
}, 300);

setInterval(function(){
  for(var id in players){
    var x = Math.abs(players[id].x);
    var y = Math.abs(players[id].y);
    var d = Math.sqrt(x*x + y*y);
    if(d > Land.d/2-players[id].r+4 && players[id].hp > 0){
      players[id].hp--;
    }
  }
}, 17);
