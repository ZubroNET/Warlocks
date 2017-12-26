var socket;
var players = {};
var Land = {};
var bullets = {};
var img;
var inter = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  img = loadImage('img/lava.jpg');
  for (var i = 0; i < width / 128; i++) {
    for (var j = 0; j < height / 128; j++) {
      image(img, i * 128, j * 128);
    }
  }
  socket = io.connect('http://localhost:8080');

  // socket.on('move', function(data) {
  //   players = data;
  // });
  socket.on('land', function(land) {
    Land = land;
  });
  socket.on('newPlayer', function(playerInfo) {
    players[playerInfo.id] = new Player(0,0,playerInfo.id, playerInfo.col, playerInfo.name);
  console.log(playerInfo.col);
  });
  socket.on('bullets', function(data) {
    bullets = data;
  });
  socket.on('data', function(data) {
    console.log(data);
    players = data['players'];
    bullets = data['bullets'];
    Land = data['land'];
  });
  socket.on('players', function(data) {
    for (var id in data) {
      players[id].x = data[id].x;
      players[id].y = data[id].y;
      players[id].angle = data[id].angle;
    }
  });
  socket.on('disconnect', function() {
    alert('Server is down');
    window.location.replace("http://google.com");
  });
  textAlign(CENTER);
  translate(width / 2, height / 2);
}

function draw() {
  for (var i = -width / 2; i < width / 2; i += 128) {
    for (var j = -height / 2; j < height / 2; j += 128) {
      image(img, i, j);
    }
  }
  stroke(53, 53, 77);
  strokeWeight(8);
  fill(100);
  ellipse(Land.x, Land.y, Land.d, Land.d);
  for (var id in players) {
    showPlayer(players[id]);
  }
  for (var id in bullets) {
    showBullet(bullets[id]);
  }
  move();


  if (players[socket.id] != null) {
    if (!players[socket.id].alive) {
      fill(255);
      textStyle(BOLD);
      textSize(200);
      textAlign(CENTER)
      text("WASTED", 0, 0);
    }
  }
}

function Player() {
  this.x;
  this.y;
}

function move() {
  var data = {
    up: false,
    down: false,
    right: false,
    left: false
  };
  if (keyIsDown(87)) data.up = true;
  if (keyIsDown(83)) data.down = true;
  if (keyIsDown(68)) data.right = true;
  if (keyIsDown(65)) data.left = true;
  socket.emit('move', data);
}

function mouseMoved() {
  if (players[socket.id] != null) {
    var dx = mouseX - width / 2 - players[socket.id].x;
    var dy = mouseY - height / 2 - players[socket.id].y;
    var angle = atan2(dy, dx);
    socket.emit('angle', angle);
  }
}

function setName(name) {
  socket.emit('name', name);
}

function submitName() {
  document.getElementById('defaultCanvas0').style.display = 'block';
  document.getElementsByClassName('container')[0].style.display = 'none';
  var name = document.getElementById('name').value;
  socket.emit('createPlayer', name);
}

function showPlayer(player) {
  if (!player.alive)
    return;
    player.px = lerp(player.px, player.x, 0.2);
    player.py = lerp(player.py, player.y, 0.2);
    if(inter){
      var x = player.px;
      var y = player.py;
    }else{
      var x = player.x;
      var y = player.y;
    }
  push();

  //ratation
  translate(x, y);
  rotate(player.angle);

  //hands
  push();
  fill(color(player.col));
  rotate(PI / 2);
  rotate(PI / 4);
  stroke(53, 53, 77);
  strokeWeight(4);
  ellipse(0, -player.r - 5, 20, 20);
  rotate(-PI / 4 * 2);
  ellipse(0, -player.r - 5, 20, 20);
  pop();

  //body
  fill(color(player.col));
  strokeWeight(player.strokeWeight);
  stroke(53, 53, 77);
  ellipse(0, 0, player.r * 2, player.r * 2);

  //name
  push();
  rotate(-player.angle);
  fill(255);
  stroke(53, 53, 77);
  text(player.name, 0, 5);
  pop();

  //hp
  push();
  rotate(-player.angle);
  fill(120);
  strokeWeight(3);
  stroke(53, 53, 77);
  rect(-player.r, player.r + 5, player.r * 2, 8);
  fill(0, 255, 0);
  rect(-player.r, player.r + 5, map(player.hp, 0, 100, 0, player.r * 2), 8);
  pop();

  //overload
  push();
  rotate(-player.angle);
  fill(120);
  strokeWeight(3);
  stroke(53, 53, 77);
  rect(-player.r, player.r + 13, player.r * 2, 8);
  fill(0, 0, 255);
  rect(-player.r, player.r + 13, map(player.overload, 0, 100, 0, player.r * 2), 8);
  pop();

  pop();
}

function showBullet(bullet) {
  strokeWeight(bullet.strokeWeight);
  fill(255);
  ellipse(bullet.x, bullet.y, bullet.r * 2, bullet.r * 2);
}

function mousePressed() {
  console.log("MouseX: " + (mouseX - (width / 2) - players[socket.id].x));
  console.log("MouseY: " + (mouseY - (height / 2) - players[socket.id].y));
  var angle = atan2((mouseY) - (height / 2) - players[socket.id].y, mouseX - (width / 2) - players[socket.id].x);
  console.log(angle);
  socket.emit('shoot', angle);
}

function Player(x, y, id, col, name) {
  this.x = x;
  this.y = y;

  this.px = 0;
  this.py = 0;

  this.r = 30;
  this.id = id;
  this.col = col;
  this.name = name;
  this.hp = 100;
  this.angle;
  this.overload = 100;
  this.strokeWeight = 4;
  this.alive = true;
}
