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
    if(playersList[id].name != null){text(playersList[id].name, playersList[id].x, playersList[id].y-20)};
  }
    move();
}

function Player(){
    this.x;
    this.y;
}

function move() {
    var data = {
        up:false,
        down:false,
        right:false,
        left:false
    };
    if(keyIsDown(87)) data.up =true;
    if(keyIsDown(83)) data.down =true;
    if(keyIsDown(68)) data.right =true;
    if(keyIsDown(65)) data.left =true;
    socket.emit('move',data);
}

function setName(name){
    socket.emit('name', name);
}
