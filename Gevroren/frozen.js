// set to true if using live kinectron data
let liveData = true;

// fill in kinectron ip address here ie. "127.16.231.33"
let kinectronIpAddress = "145.93.181.150";

// declare kinectron
let kinectron = null;

var xHead;
var yHead;

var xRight;
var yRight;
var xLeft;
var yLeft;

/*
Frozen brush

Makes use of a delaunay algorithm to create crystal-like shapes.
I did NOT develop delaunay.js, and not sure who the author really is to give proper credit.

Controls:
  - Drag the mouse.
    - Press any key to toggle between fill and stroke.

Inspired by:
  Makio135's sketch www.openprocessing.org/sketch/385808

Author:
  Jason Labbe

Site:
  jasonlabbe3d.com
*/

var allParticles = [];
var maxLevel = 5;
var useFill = false;

var data = [];


// Moves to a random direction and comes to a stop.
// Spawns other particles within its lifetime.
function Particle(x, y, level) {
  this.level = level;
  this.life = 0;
  
  this.pos = new p5.Vector(x, y);
  this.vel = p5.Vector.random2D();
  this.vel.mult(map(this.level, 0, maxLevel, 5, 2));
  
  this.move = function() {
    this.life++;
    
    // Add friction.
    this.vel.mult(0.9);
    
    this.pos.add(this.vel);
    
    // Spawn a new particle if conditions are met.
    if (this.life % 10 == 0) {
      if (this.level > 0) {
        this.level -= 1;
        var newParticle = new Particle(this.pos.x, this.pos.y, this.level-1);
        allParticles.push(newParticle);
      }
    }
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);

    kinectron = new Kinectron("145.93.81.21");

    kinectron.makeConnection();

    kinectron.startTrackedBodies(drawBody);
  
  colorMode(HSB, 360);
  
  textAlign(CENTER);
  
  background(0);
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

    checkHead();
    checkHandDistance();
}

function draw() {
  // Create fade effect.
  noStroke();
  fill(0, 30);
  rect(0, 0, width, height);
  
  // Move and spawn particles.
  // Remove any that is below the velocity threshold.
  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].move();
    
    if (allParticles[i].vel.mag() < 0.5) {
      allParticles.splice(i, 1);
    }
  }
  
  if (allParticles.length > 0) {
    // Run script to get points to create triangles with.
    data = Delaunay.triangulate(allParticles.map(function(pt) {
      return [pt.pos.x, pt.pos.y];
    }));
    
    strokeWeight(0.1);
    
    // Display triangles individually.
    for (var i = 0; i < data.length; i += 3) {
      // Collect particles that make this triangle.
      var p1 = allParticles[data[i]];
      var p2 = allParticles[data[i+1]];
      var p3 = allParticles[data[i+2]];
      
      // Don't draw triangle if its area is too big.
      var distThresh = 500;
      
      if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
        continue;
      }
      
      if (dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }
      
      if (dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }
      
      // Base its hue by the particle's life.
      if (useFill) {
        noStroke();
        fill(165+p1.life*1.5, 360, 360);
      } else {
        noFill();
        stroke(165+p1.life*1.5, 360, 360);
      }
      
      triangle(p1.pos.x, p1.pos.y, 
               p2.pos.x, p2.pos.y, 
               p3.pos.x, p3.pos.y);
    }
  }
  
  noStroke();
  fill(255);
  //text("Click and drag the mouse\nPress any key to change to fill/stroke", width/2, height-50);
}


function checkHead() {
  allParticles.push(new Particle(xHead, yHead, maxLevel));
}

function checkHandDistance(){
    var distance = dist(xRight, yRight, xLeft, yLeft);
    console.log(distance);
    if(distance < 300){
        fill(0,0,255);
        ellipse(width / 2, height / 2, 50, 50);
    }
}

// function checkHandDistance(){
//     var distance = dist(xRight, yRight, xLeft, yLeft);
//     console.log(distance);
//     if(distance < 101){
//         fill(0,0,255);
//         ellipse(width / 2, height / 2, 50, 50);
//     }
// }

/*function createbubble(bId) {
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

    showTheBubble(bodyId, curDis) {
        if (bodyId == this.bId) {
            fill(20, 20);
            ellipse(this.x, this.y, this.r * 2);
            //image(img, this.x, this.y);

            if (curDis < 150 && this.r < 101) {
                this.r = this.r + 25;
            }

            if (curDis > 150 && this.r > 0) {
                this.r = this.r - 20;
            }

            if (this.r < 0 && curDis > 150) {
                for (var i = 0; i < bubbles.length; i++) {
                    if (bubbles[i] == this) {
                        bubbles.splice(i, 1);
                    }
                }
            }

        }
    }*/

function keyPressed() {
  useFill = ! useFill;
}
/*
var refreshDuration = 5000;
var refreshTimeout;
var numPointsX;
var numPointsY;
var unitWidth;
var unitHeight;
var points;
var g;

function onLoad()
{   g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('width','1920');
    g.setAttribute('height','1080');
    document.getElementById('groep').appendChild(g);


    var unitSize = (window.innerWidth+window.innerHeight)/40;
    numPointsX = Math.ceil(1920/unitSize)+1;
    numPointsY = Math.ceil(1080/unitSize)+1;
    unitWidth = Math.ceil(1920/(numPointsX-1));
    unitHeight = Math.ceil(1080/(numPointsY-1));

    points = [];

    for(var y = 0; y < numPointsY; y++) {
        for(var x = 0; x < numPointsX; x++) {
            points.push({x:unitWidth*x, y:unitHeight*y, originX:unitWidth*x, originY:unitHeight*y});
        }
    }

    randomize();

    for(var i = 0; i < points.length; i++) {
        if(points[i].originX != unitWidth*(numPointsX-1) && points[i].originY != unitHeight*(numPointsY-1)) {
            var topLeftX = points[i].x;
            var topLeftY = points[i].y;
            var topRightX = points[i+1].x;
            var topRightY = points[i+1].y;
            var bottomLeftX = points[i+numPointsX].x;
            var bottomLeftY = points[i+numPointsX].y;
            var bottomRightX = points[i+numPointsX+1].x;
            var bottomRightY = points[i+numPointsX+1].y;

            var rando = Math.floor(Math.random()*2);

            for(var n = 0; n < 2; n++) {
                var polygon = document.createElementNS(g.namespaceURI, 'polygon');

                if(rando==0) {
                    if(n==0) {
                        polygon.point1 = i;
                        polygon.point2 = i+numPointsX;
                        polygon.point3 = i+numPointsX+1;
                        polygon.setAttribute('points',topLeftX+','+topLeftY+' '+bottomLeftX+','+bottomLeftY+' '+bottomRightX+','+bottomRightY);
                    } else if(n==1) {
                        polygon.point1 = i;
                        polygon.point2 = i+1;
                        polygon.point3 = i+numPointsX+1;
                        polygon.setAttribute('points',topLeftX+','+topLeftY+' '+topRightX+','+topRightY+' '+bottomRightX+','+bottomRightY);
                    }
                } else if(rando==1) {
                    if(n==0) {
                        polygon.point1 = i;
                        polygon.point2 = i+numPointsX;
                        polygon.point3 = i+1;
                        polygon.setAttribute('points',topLeftX+','+topLeftY+' '+bottomLeftX+','+bottomLeftY+' '+topRightX+','+topRightY);
                    } else if(n==1) {
                        polygon.point1 = i+numPointsX;
                        polygon.point2 = i+1;
                        polygon.point3 = i+numPointsX+1;
                        polygon.setAttribute('points',bottomLeftX+','+bottomLeftY+' '+topRightX+','+topRightY+' '+bottomRightX+','+bottomRightY);
                    }
                }

                polygon.setAttribute('fill','rgba(15,94,156,'+(Math.random()*(1 - 0.2) + 0.5)+')');
                var animate = document.createElementNS('http://www.w3.org/2000/svg','animate');
                animate.setAttribute('fill','freeze');
                animate.setAttribute('attributeName','points');
                animate.setAttribute('dur',refreshDuration+'ms');
                animate.setAttribute('calcMode','linear');
                polygon.appendChild(animate);
                g.appendChild(polygon);
            }
        }
    }

    refresh();

}

function randomize() {
    for(var i = 0; i < points.length; i++) {
        if(points[i].originX != 0 && points[i].originX != unitWidth*(numPointsX-1)) {
            points[i].x = points[i].originX + Math.random()*unitWidth-unitWidth/2;
        }
        if(points[i].originY != 0 && points[i].originY != unitHeight*(numPointsY-1)) {
            points[i].y = points[i].originY + Math.random()*unitHeight-unitHeight/2;
        }
    }
}

function refresh() {
    console.log('refreshed');
    randomize();
    for(var i = 0; i < g.childNodes.length; i++) {
        var polygon = g.childNodes[i];
        var animate = polygon.childNodes[0];
        if(animate.getAttribute('to')) {
            animate.setAttribute('from',animate.getAttribute('to'));
        }
        animate.setAttribute('to',points[polygon.point1].x+','+points[polygon.point1].y+' '+points[polygon.point2].x+','+points[polygon.point2].y+' '+points[polygon.point3].x+','+points[polygon.point3].y);
        console.log(typeof animate.beginElement);
        animate.beginElement();
        animate.beginElement();
    }
    refreshTimeout = setTimeout(function() {refresh();}, refreshDuration);
}

window.onload = onLoad;
*/