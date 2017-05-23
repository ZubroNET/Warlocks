var socket;
var playersList = {};
function setup(){
    createCanvas(windowWidth,windowHeight);
    background(100);
    socket = io.connect('http://localhost:3000');

    socket.on('move', function(players) {
      playersList = players;
    });
    textAlign(CENTER);
}

function draw(){
  background(200,100,0);
  for(var id in playersList){
    showPlayer(playersList[id]);
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

function submitName(){
  document.getElementById('defaultCanvas0').style.display = 'block';
  document.getElementsByClassName('container')[0].style.display = 'none';
  var name = document.getElementById('name').value;
  socket.emit('createPlayer', name);
}

function showPlayer(player){
  //body
  fill(color(player.col));
  stroke(255);
  ellipse(player.x, player.y, player.r*2, player.r*2);

  //name
  fill(255);
  noStroke();
  text(player.name, player.x, player.y + 5);

  //hp
  fill(120);
  rect(player.x - player.r, player.y + player.r + 5, player.r*2, 5);
  fill(0,255,0);
  rect(player.x - player.r, player.y + player.r + 5, map(player.hp, 0, 100, 0, player.r*2), 5);
}
