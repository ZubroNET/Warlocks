var players = {};

// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', function (socket) {
    var id = players.length;
    players[socket.id] = new Player(200, 200, socket.id, getRandomColor());
    console.log("New player");
    console.log(players);

    socket.on('disconnect', function () {
        console.log("Client has disconnected");
        players.splice(id, 1);
    });

    socket.on('move', function (data) {
        if (players[socket.id] != null) {
            players[socket.id].x += data.x;
            players[socket.id].y += data.y;
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
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
