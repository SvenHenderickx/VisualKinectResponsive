// set to true if using live kinectron data
let liveData = true;

// fill in kinectron ip address here ie. "127.16.231.33"
let kinectronIpAddress = "145.93.44.6";

// declare kinectron
let kinectron = null;

var xHead;
var yHead;

var xRight;
var yRight;
var xLeft;
var yLeft;

var handsClose = [];

function setup() {
  createCanvas(1920,1080);

  kinectron = new Kinectron("145.93.45.31");

  kinectron.makeConnection();

  kinectron.startTrackedBodies(drawBody);

  // createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
}

function drawBody(body){
  // background(0);
  for(var i = 0; i < body.joints.length; i++){

    if(i == 3){
      // fill(255,0,0);
      // ellipse(body.joints[i].depthX * width, body.joints[i].depthY * height, 20, 20);
      if(i == 3){
        xHead = body.joints[i].depthX * width;
        yHead = body.joints[i].depthY * height;
      }
    }

    if(i == 11 || i == 7){
      if(i == 11){
        xRight = body.joints[i].depthX * width;
        yRight = body.joints[i].depthY * height;
      }
      if(i == 7){
        xLeft = body.joints[i].depthX * width;
        yLeft = body.joints[i].depthY * height;
      }
    }
  }

  checkHandDistance(body);
}

// Rain ~!!!!

var allParticles = [];
var globalHue = 120;
var spawnPerFrame = 3;
var mouseSize = 120;
let bubbles = [];
var bubblesArr = [];

function Particle(x, y) {
  this.lastPos = new p5.Vector(x, y);
  this.pos = new p5.Vector(x, y);
  this.vel = new p5.Vector(0, 0);
  this.acc = new p5.Vector(0, 0);
  this.size = random(2, 20);
  this.h = globalHue;
}


function draw() {

  noStroke();
  fill(0, 5);
  rect(0, 0, width, height);


  for (var i = 0; i < spawnPerFrame; i++) {
  	allParticles.push(new Particle(random(width), 0));
  }

  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].acc.add(new p5.Vector(0, allParticles[i].size*0.0025));

    // Quick check to avoid calculating distance if possible.
    if (abs(allParticles[i].pos.x-xHead) < mouseSize) {
      d = dist(xHead, yHead, allParticles[i].pos.x, allParticles[i].pos.y);
      if (d < mouseSize) {
        var vec = new p5.Vector(xHead, yHead-mouseSize);
        vec.sub(new p5.Vector(allParticles[i].pos.x, allParticles[i].pos.y));
        vec.normalize();
        allParticles[i].vel.add(vec);

        allParticles[i].h += 1.5;
        if (allParticles[i].h > 360) {
          allParticles[i].h = 0;
        }
      }
    }

    allParticles[i].vel.add(allParticles[i].acc);
    allParticles[i].pos.add(allParticles[i].vel);
    allParticles[i].acc.mult(0);

    stroke(allParticles[i].h, 360, 360);
    strokeWeight(allParticles[i].size);
    line(allParticles[i].lastPos.x, allParticles[i].lastPos.y,
         allParticles[i].pos.x, allParticles[i].pos.y);

    allParticles[i].lastPos.set(allParticles[i].pos.x, allParticles[i].pos.y);

    if (allParticles[i].pos.y > height || allParticles[i].pos.x < 0 || allParticles[i].pos.x > width) {
      allParticles.splice(i, 1);
    }
  }

  globalHue += 0.015;
  if (globalHue > 360) {
    globalHue = 0;
  }
}

function checkHandDistance(body){


  var bodyDouble = false;
  var distance = dist(xRight, yRight, xLeft, yLeft);

  if(distance < 150){
    for(var i = 0; i < handsClose.length; i++){
      if(handsClose[i] == body.trackingId){
        bodyDouble = true;
      }
    }

    if(bodyDouble == false){
      handsClose.push(body.trackingId);
      console.log("added body");
      createbubble(body.trackingId);
    }

  }
  else{
    var index = handsClose.indexOf(body.trackingId);
    if(index > -1){
      handsClose.splice(index, 1);
      console.log("removed body");
    }
  }

  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].showTheBubble(body.trackingId, distance);
  }

  if(handsClose.length > 3){
    spawnPerFrame = 1;
  }
  else{
    spawnPerFrame = 3;
  }
}

function createbubble(bId) {
    let r = 0;
    let b = new Bubble(xRight, yRight, r, bId);

    bubbles.push(b);
}


class Bubble {
  constructor(x, y, r, bId) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.bId = bId;
  }

  show() {
    //stroke(255);
    //strokeWeight(4);
    //noFill();


    ellipse(this.x, this.y, this.r * 2);
    if(this.r < 100){
        this.r = this.r + 2;
    }
    fill(0);
    text(this.r, this.x-9, this.y+2);
    // console.log(this.r);
  }

  showTheBubble(bodyId, curDis){
    if(bodyId == this.bId){
      fill(250, 200, 200);
      ellipse(this.x, this.y, this.r * 2);

      if(this.r < 101 && curDis < 150){
        this.r++;
      }
      else{
        if(this.r < 0){
          for(var i = 0; i < bubbles.length; i++){
            if(bubbles[i] == this){
              bubbles.splice(i, 1);
            }
          }
        }
        this.r--;
      }

      fill(0);
      text(this.r, this.x-9, this.y+2);
    }

  }
}
