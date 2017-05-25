var socket;
var playersList = {};
var playerId;
function setup(){
    createCanvas(windowWidth,windowHeight);
    background(100);
    socket = io.connect('http://192.168.0.54:8080');

    socket.on('move', function(players) {
      playersList = players;
    });
    socket.on('id', function(id){
      playerId = id;
    });
    textAlign(CENTER);
}

function draw(){
  background(200,100,0);
  for(var id in playersList){
    showPlayer(playersList[id]);
  }
  move();
  socket.send("hi");
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

function mouseMoved(){
  if(playersList[playerId] != null){
    var dx = mouseX - playersList[playerId].x;
    var dy = mouseY - playersList[playerId].y;
    var angle = atan2(dy, dx);
    socket.emit('angle', angle);
  }
}

function setName(name){
    socket.emit('name', name);
}

function submitName(){
  document.getElementById('defaultCanvas0').style.display = 'block';
  document.getElementsByClassName('container')[0].style.display = 'none';
  var name = document.getElementById('name').value;
  socket.emit('createPlayer', name);
}

function showPlayer(player){
  push();

  //ratation
  translate(player.x, player.y);
  rotate(player.angle);

  //hands
  push();
  fill(color(player.col));
  rotate(PI/2);
  rotate(PI/4);
  stroke(53,53,77);
  strokeWeight(4);
  ellipse(0, -player.r-5, 20, 20);
  rotate(-PI/4*2);
  ellipse(0, -player.r-5, 20, 20);
  pop();

  //body
  fill(color(player.col));
  strokeWeight(4);
  stroke(53,53,77);
  ellipse(0, 0, player.r*2, player.r*2);

  //name
  push();
  rotate(-player.angle);
  fill(255);
  stroke(53,53,77);
  text(player.name, 0, 5);
  pop();

  //hp
  push();
  rotate(-player.angle);
  fill(120);
  strokeWeight(3);
  stroke(53,53,77);
  rect(-player.r, player.r + 5, player.r*2, 8);
  fill(0,255,0);
  rect(-player.r, player.r + 5, map(player.hp, 0, 100, 0, player.r*2), 8);
  pop();

  pop();
}
