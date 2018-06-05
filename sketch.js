function setup() {
    canvas1 = createCanvas(600, 400);
    jumpButton = createButton("JUMP!");
    jumpButton.mouseClicked(shakeBalls);
    jumpSlider = createSlider(100, 1000, 250, 50);
    createP("Drag ball radius");
    dragRadSlider = createSlider(5, 100, 30, 1); 
    createP("Click ball radius");
    clickRadSlider = createSlider(5, 100, 50, 1); 
    createP("Drag ball mass");
    dragMassSlider = createSlider(5, 200, 30, 1); 
    createP("Click ball mass");
    clickMassSlider = createSlider(5, 200, 50, 1);
    createP("Gravitation constant");
    gravitySlider = createSlider(0, 100, 30, 1);
    createP("Boundary elasticity");
    bounceSlider = createSlider(0, 1, 0.75, 0.05);
    createP("Impact elasticity");
    impulseSlider = createSlider(0, 1, 0.5, 0.05);    
    createP("Air resitance");
    airSlider = createSlider(0, .2, 0.01, 0.01);

    frameRate(60);
}

// Arrays
let balls = [];

// Parameters
let dragRadius;
let dragMass;
let clickRadius;
let clickMass;

let g;
let bounceDamp;
let impulseDamp;
let airDamp;
let jumpIntensity;


function draw() {
    dragRadius      = dragRadSlider.value();
    dragMass        = dragMassSlider.value();
    clickRadius     = clickRadSlider.value();    
    clickMass       = clickMassSlider.value();
    g               = gravitySlider.value();
    bounceDamp      = bounceSlider.value();
    impulseDamp     = impulseSlider.value();
    airDamp         = airSlider.value();
    jumpIntensity   = jumpSlider.value();
    if (clickMass == 200) clickMass = Infinity;

    background(150);
    fill(255);
    ellipse(mouseX, mouseY, dragRadius);

    // Loop through balls    
    for(let i = balls.length - 1; i >= 0; i--){       
        for(let j = i; j >= 0; j--){
            balls[i].resolveCollision(balls[j]);
        }         
        balls[i].bounce();
        balls[i].move();        
        balls[i].show();              
        if(balls[i].lifecycle() == 250) balls.splice(i,1);

    }    
}

function shakeBalls(){    
    for(let b of balls){
        b.force.y -= jumpIntensity;
    }

}

function mouseClicked(){
    if (mouseX < width && mouseY < height){ 
        if (clickMass > 180) clikMass = Infinity;
        if(balls.length < 500) createBall(mouseX, mouseY, clickRadius, clickMass);
    } 
}

function mouseDragged(){   
    if (mouseX < width && mouseY < height){ 
        if(balls.length < 500) createBall(mouseX, mouseY, dragRadius, dragMass);
    }
}

function createBall(_x, _y, _r, _m = _r){
    let _b = new Circle(_x, _y, _r, _m);
    let overlaps = 0;

    for (let ball of balls){
        if(_b.intersects(ball)){
            overlaps = 1;
            break;
        }
    }
    
    if(!overlaps) {
        balls.push(_b);
    }  
    
    console.log(balls.length);
}

function sign(arg){
    if(arg > 0){
        return 1;
    }else if(arg < 0){
        return -1;
    }else{
        return 0;
    }

}

class Circle {
    constructor (x, y, r, m = r) {
        this.pos = createVector(x, y);
        this.vel = createVector(random(-5, 5), random(-5, -2));
        this.acc = createVector(0, 0);
        this.force = createVector(0, 0);
        this.rad = r;        
        this.mass = m;    
        this.invMass = 1/m;
        this.color = 200;
        this.life = 0;
        if (m == Infinity){
            this.color = 100;
            this.life = 1000;
            this.vel.set(0, 0);
        }
    }

    show() {        
        fill(this.color);        
        ellipse(this.pos.x, this.pos.y, this.rad);
        textAlign(CENTER, CENTER);
        textSize(10);
        fill(255);
        text(round(this.life), this.pos.x, this.pos.y);        
    }

    move() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        if(this.mass != Infinity){
            this.acc = p5.Vector.div(this.force, this.mass);
            this.force.x = -sign(this.vel.x) * (this.vel.x * this.vel.x) * airDamp;
            this.force.y = -sign(this.vel.y) * (this.vel.y * this.vel.y) * airDamp + (g/frameRate()) * this.mass;
        }
    }


    bounce() {
        // Bottom
        if ((this.pos.y > height - this.rad/2) && (this.vel.y > 0)){
            this.vel.y = -this.vel.y * bounceDamp;
            
            // To avoid endless bouncing
            if(abs(this.vel.y) < 2){
                this.vel.y =this.vel.y * 0.7;
            }
        }

        // Position corection            
        let percent = 0.8 // usually 20% to 80%
        let slop = 0.03 // usually 0.01 to 0.1
        let penetration = max(this.pos.y - (height - this.rad/2), 0);
        let correctionMag = max(penetration - slop*this.rad/2, 0) * percent;

        this.pos.y -= correctionMag;        

        // Right
        if ((this.pos.x > width - this.rad/2) && (this.vel.x > 0)){
            this.vel.x = -this.vel.x * bounceDamp;      
        }

        // Position corection 
        penetration = max(this.pos.x - (width - this.rad/2), 0);
        correctionMag = max(penetration - slop*this.rad/2, 0) * percent;

        this.pos.x -= correctionMag;

        // Left
        if ((this.pos.x < this.rad/2) && (this.vel.x < 0)){
            this.vel.x = -this.vel.x * bounceDamp; 
        }

        // Position corection 
        penetration = max(this.rad/2 - this.pos.x, 0);
        correctionMag = max(penetration - slop*this.rad/2, 0) * percent;

        this.pos.x += correctionMag;

        // Top
        if ((this.pos.y < this.rad/2) && (this.vel.y < 0)){
            this.vel.y = -this.vel.y * bounceDamp;            
        }

        // Position corection 
        penetration = max(this.rad/2 - this.pos.y, 0);
        correctionMag = max(penetration - slop*this.rad/2, 0) * percent;

        this.pos.y += correctionMag;
    }

    lifecycle(){
        if ((this.pos.y > height - this.rad) && abs(this.vel.y) < 2){
            return this.life++;
        }else{
            return this.life = 0;
        }

    }

    intersects(other){
        let d = this.pos.dist(other.pos);
        return (d < (this.rad + other.rad)/2);
    }

    resolveCollision(other){
        let d = this.pos.dist(other.pos);
        let coverage = this.rad + other.rad;

        if ((d < coverage/2) && (d != 0)){           
            
             // Calculate relative velocity
            let rv = p5.Vector.sub(other.vel, this.vel);
            let normal = p5.Vector.sub(other.pos, this.pos);
            normal.normalize();
            
            // Calculate relative velocity in terms of the normal direction
            let velAlongNormal = p5.Vector.dot(rv, normal)
            
            // Do not resolve if velocities are separating
            if(velAlongNormal > 0)
                return;
            
            // Calculate restitution
            let e = impulseDamp;
            
            // Calculate impulse scalar
            let j = -(1 + e) * velAlongNormal;
            j /= this.invMass + other.invMass;
            
            // Apply impulse
            let impulse = p5.Vector.mult(normal, j);
            this.vel.sub(p5.Vector.mult(impulse, this.invMass));
            other.vel.add(p5.Vector.mult(impulse, other.invMass)); 
            
            // Position corection            
            let percent = 0.7; // usually 20% to 80%
            let slop = 0.02; // usually 0.01 to 0.1
            let penetration = coverage/2 - d;
            let correctionMag = max(penetration - slop*coverage, 0) / (this.invMass + other.invMass) * percent;
            let correction = p5.Vector.mult(normal, correctionMag);

            this.pos.sub(p5.Vector.mult(correction, this.invMass));
            other.pos.add(p5.Vector.mult(correction, other.invMass));
        }        
    }
}