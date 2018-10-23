var kinectron;

var xRight;
var yRight;
var xLeft;
var yLeft;

function setup() {
  createCanvas(1920,1080);

  kinectron = new Kinectron("145.93.182.29");

  kinectron.makeConnection();

  kinectron.startTrackedBodies(drawBody);
}

function draw() {
  // background(220);
}

function drawBody(body){
  background(0);
  for(var i = 0; i < body.joints.length; i++){

    if(i == 11 || i == 7){
      fill(255,0,0);
      ellipse(body.joints[i].depthX * width, body.joints[i].depthY * height, 20, 20);
      if(i == 11){
        xRight = body.joints[i].depthX * width;
        yRight = body.joints[i].depthY * height;
      }
      if(i == 7){
        xLeft = body.joints[i].depthX * width;
        yLeft = body.joints[i].depthY * height;
      }

    }
    else{
      fill(0,0,0);
      ellipse(body.joints[i].depthX * width, body.joints[i].depthY * height, 5, 5);
    }

    checkHandDistance();
  }
}

function checkHandDistance(){
  var distance = dist(xRight, yRight, xLeft, yLeft);
  console.log(distance);
  if(distance < 300){
    fill(0,0,255);
    ellipse(width / 2, height / 2, 50, 50);
  }
}
