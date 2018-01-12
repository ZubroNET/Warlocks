var socket;
var players = {};
var land;
var bullets = {};
var img;
var inter = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  img = loadImage('img/lava.jpg');
  for (var i = 0; i < width / 128; i++) {
    for (var j = 0; j < height / 128; j++) {
      image(img, i * 128, j * 128);
    }
  }
  land = new Land();
  socket = io.connect('http://localhost:8080');

  // socket.on('move', function(data) {
  //   players = data;
  // });
  // socket.on('land', function(land) {
  //   Land = land;
  // });
  socket.on('newPlayer', function(playerInfo) {
    players[playerInfo.id] = new Player(0, 0, playerInfo.id, playerInfo.col, playerInfo.name);
  });
  socket.on('playerDisconnect', function(id){
    delete players[id];
  });
  // socket.on('bullets', function(data) {
  //   bullets = data;
  // });
  socket.on('data', function(data) {
    players = data['players'];
    bullets = data['bullets'];
    Land = data['land'];
  });
  socket.on('newBullet', function(bulletInfo) {
    bullets[bulletInfo.id] = new Bullet(bulletInfo.x, bulletInfo.y);
  });
  socket.on('deleteBullet', function(id) {
    delete bullets[id];
  });
  socket.on('players', function(data) {
    for (var id in data.players) {
      players[id].x = data.players[id].x;
      players[id].y = data.players[id].y;
      players[id].angle = degrees(data.players[id].angle);
      players[id].overload = data.players[id].overload;
      players[id].hp = data.players[id].hp;
      players[id].alive = data.players[id].alive;
      players[id].deaths = data.players[id].deaths;
    }
    for (var id in data.bullets) {
      bullets[id].x = data.bullets[id].x;
      bullets[id].y = data.bullets[id].y;
    }
    if (data.land != null) {
      land.d = data.land.d;
    }
  });
  socket.on('disconnect', function() {
    //alert('Server is down');
    //window.location.replace("http://google.com");
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
  ellipse(land.x, land.y, land.d, land.d);
  drawScoreboard();
  for (var id in players) {
    showPlayer(players[id]);
  }
  for (var id in bullets) {
    showBullet(bullets[id]);
  }
  // move();

}

function Player() {
  this.x;
  this.y;
}

function setName(name) {
  socket.emit('name', name);
}

function submitName() {
  var name = document.getElementById('name').value;
  if(name.length > 2 && name.length < 15){
      document.getElementById('defaultCanvas0').style.display = 'block';
      document.getElementsByClassName('container')[0].style.display = 'none';
      socket.emit('createPlayer', name);
  }else{
    alert("Minimum 3 characters, maximum 14 characters");
  }
}

function keyPressed(){
  if(keyCode === ENTER)
        submitName  ();
}

function stopRKey(evt) {
  var evt = (evt) ? evt : ((event) ? event : null);
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

document.onkeypress = stopRKey;

function showPlayer(player) {
  var color;
  // if (player.alive == 1){
  //   color = player.col;
  // } else {
  //   color = color(150, 100);
  // }
  player.px = lerp(player.px, player.x, 0.2);
  player.py = lerp(player.py, player.y, 0.2);
  player.p_angle = lerpAngle(player.p_angle, player.angle, 0.2);

  if (inter) {
    var x = player.px;
    var y = player.py;
    var angle = player.p_angle;
  } else {
    var x = player.x;
    var y = player.y;
    var angle = player.angle;
  }
  push();

  //ratation
  translate(x, y);
  rotate(angle);

  //hands
  push();
  if (player.alive == 1) {
    fill(player.col);
  } else {
    fill(150, 180);
  }
  rotate(90);
  rotate(45);
  stroke(53, 53, 77);
  strokeWeight(4);
  ellipse(0, -player.r - 5, 20, 20);
  rotate(-90);
  ellipse(0, -player.r - 5, 20, 20);
  pop();

  //body
  if (player.alive == 1) {
    fill(player.col);
  } else {
    fill(150, 180);
  }
  strokeWeight(player.strokeWeight);
  stroke(53, 53, 77);
  ellipse(0, 0, player.r * 2, player.r * 2);

  //name
  push();
  rotate(-angle);
  fill(255);
  stroke(53, 53, 77);
  text(player.name, 0, 5);
  pop();

  //hp
  push();
  rotate(-angle);
  fill(120);
  strokeWeight(3);
  stroke(53, 53, 77);
  rect(-player.r, player.r + 5, player.r * 2, 8);
  fill(0, 255, 0);
  rect(-player.r, player.r + 5, map(player.hp, 0, 100, 0, player.r * 2), 8);
  pop();

  //overload
  push();
  rotate(-angle);
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

  bullet.px = lerp(bullet.px, bullet.x, 0.2);
  bullet.py = lerp(bullet.py, bullet.y, 0.2);
  if (inter) {
    var x = bullet.px;
    var y = bullet.py;
  } else {
    var x = bullet.x;
    var y = bullet.y;
  }

  strokeWeight(bullet.strokeWeight);
  fill(255);
  ellipse(x, y, bullet.r * 2, bullet.r * 2);
}

function mousePressed() {
  if (players[socket.id] != null && players[socket.id].overload == 100) {
    var angle = atan2((mouseY) - (height / 2) - players[socket.id].y, mouseX - (width / 2) - players[socket.id].x);
    socket.emit('shoot', angle);
  }
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
  this.angle = 0;
  this.p_angle = 1;
  this.overload = 100;
  this.strokeWeight = 4;
  this.alive = 1;
  this.deaths = 0;
}

function Bullet(x, y) {
  this.x = x;
  this.y = y;
  this.px = x;
  this.py = y;
  this.r = 8;
  this.strokeWeight = 2;
}

function lerpAngle(start, stop, amt) {


  var dif = stop - start;


  if (abs(dif) > 180) {
    if (dif > 0) {
      dif -= 360;
      //dif*-1;
    } else {
      dif += 360;
      dif * -1;
    }
  }
  return amt * dif + start;


}
setInterval(function() {
  if (players[socket.id] != null) {
    var dx = mouseX - width / 2 - players[socket.id].x;
    var dy = mouseY - height / 2 - players[socket.id].y;
    var angle = radians(atan2(dy, dx));
    socket.emit('angle', angle);
    //console.log(degrees(angle));
  }

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
}, 1000 / 30);

function Land() {
  this.x = 0;
  this.y = 0;
  this.d = 1000;
}

function drawScoreboard() {
  push();
  noStroke();
  fill(50, 200);
  rect(width / 32 * 11, -height / 32 * 15, width / 8, height / 4, 20);
  translate(width / 32 * 11, -height / 32 * 15+10);
  var count = 1;
  textAlign(LEFT);
  fill(255);
  strokeWeight(2);
  stroke(53, 53, 77);
  textSize(16);
  text('NAME',20, count * 20);
  text('DEATHS',120, count * 20);
  count++;
  stroke(53, 53, 77);
  for(var id in players){
    text(players[id].name,20, count * 20);
    text(players[id].deaths,120, count * 20);
    count++;
  }
  pop();
}
