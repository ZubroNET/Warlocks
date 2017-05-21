var players = {};
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, listen);
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('listening at' + ':' + port);
}
app.use(express.static('public'));
var io = require('socket.io')(server);


io.sockets.on('connection', function (socket) {
    players[socket.id] = new Player(200, 200, socket.id, getRandomColor());
    console.log("New player ID: '" + socket.id + "'");

    socket.on('disconnect', function () {
        console.log("Client has disconnected");
        delete players[socket.id];
    });

    socket.on('name', function(name){
      players[socket.id].name = name;
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
}
);

function Player(x, y, id, col) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.col = col;
    this.name;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
