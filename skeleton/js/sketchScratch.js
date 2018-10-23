// set to true if using live kinectron data
let liveData = true;

// fill in kinectron ip address here ie. "127.16.231.33"
let kinectronIpAddress = "145.93.182.29";

// declare kinectron
let kinectron = null;

// drawHand variables
let start = 30;
let target = 100;
let diameter = start;
let light = 255;
let dark = 100;
let hueValue = light;
let lerpAmt = 0.3;
let state = 'ascending';

// recorded data variables
let sentTime = Date.now();
let currentFrame = 0;
let recorded_skeleton;
let recorded_data_file = "./js/recorded_skeleton.json";

var xRight;
var yRight;
var xLeft;
var yLeft;

function setup() {
  createCanvas(1920,1080);

  kinectron = new Kinectron("145.93.182.29");

  kinectron.makeConnection();

  kinectron.startTrackedBodies(drawBody);

  // createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 200);
}

function drawBody(body){
  background(0);
  for(var i = 0; i < body.joints.length; i++){

    if(i == 11 || i == 7){
      // fill(255,0,0);
      // ellipse(body.joints[i].depthX * width, body.joints[i].depthY * height, 20, 20);
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
}

// Rain ~!!!!

var allParticles = [];
var globalHue = 100;
var spawnPerFrame = 1;
var mouseSize = 50;


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
    if (abs(allParticles[i].pos.x-xRight) < mouseSize) {
      d = dist(xRight, yRight, allParticles[i].pos.x, allParticles[i].pos.y);
      if (d < mouseSize) {
        var vec = new p5.Vector(xRight, yRight-mouseSize);
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
