var players = {};
var Land = {
  d : 500
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
      players[socket.id] = new Player(200, 200, socket.id, getRandomColor(), name);
      socket.emit('id',socket.id);
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
