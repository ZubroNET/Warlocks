var socket;
var playersList = {};
function setup(){
    createCanvas(500,500);
    background(100);
    socket = io.connect('http://localhost:3000');

    socket.on('move', function(players) {
      playersList = players;
    });
    textAlign(CENTER);
}

function draw(){
  background(50);
  for(var id in playersList){
    fill(color(playersList[id].col));
    stroke(255);
    ellipse(playersList[id].x, playersList[id].y, 30, 30);
    fill(255);
    noStroke();
    text(playersList[id].id, playersList[id].x, playersList[id].y-20);
  }
    move();
}

function Player(){
    this.x;
    this.y;
}

function move() {
    var data = {
        x:0,
        y:0
    };
    if(keyIsDown(87)) data.y =-3;
    if(keyIsDown(83)) data.y =3;
    if(keyIsDown(65)) data.x =-3;
    if(keyIsDown(68)) data.x =3;
    socket.emit('move',data);
}
