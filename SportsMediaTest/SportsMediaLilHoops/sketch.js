let gameState = 0;
let isMobile = false;
let power = 0;
let powerToggle = false;
let hoopTally = 0;
let misses = 0;
let buttonCD = false;
let buttonTimer = 0;
let roundTime = 30;
let roundFrame = 60;
let balls = [];
let roundDelay = 120;
let whistleBlown = false;
let crashSounds = [];

function preload() {
  //image assets//
  titleImg = loadImage("assets/titleScreen.png");
  gameImg = loadImage("assets/gameScreen.png");
  endImg = loadImage("assets/endScreen.png");
  pressedImg = loadImage("assets/buttonPressed.png");
  ballImg = loadImage("assets/ball.png");

  //sound assets//
   ambientSnd = loadSound("sounds/ambient.mp3");
   clickSnd = loadSound("sounds/click.mp3");
   swishSnd = loadSound("sounds/swish.mp3");
   whistleSnd = loadSound("sounds/whistle.mp3");
   crashSounds.push(loadSound("sounds/smash1.mp3"));
   crashSounds.push(loadSound("sounds/smash2.mp3"));
   crashSounds.push(loadSound("sounds/smash3.mp3"));

  //mobile query//
  let userAgent = navigator.userAgent;
  let mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  isMobile = mobileRegex.test(userAgent);
}

function setup() {
  createCanvas(800, 600);
  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER);
  frameRate(60);

  buttonImg = createImg('assets/buttonUnpressed.png', 'Main Button');
  buttonImg.size(370, 150); 
  let canvas = document.querySelector('canvas');
  buttonImg.position(canvas.offsetLeft + width/2 - buttonImg.width/2, canvas.offsetTop + height/2 + 100);
  buttonImg.mousePressed(buttonPress);

  clickSnd.setVolume(.8);
  ambientSnd.setVolume(0.35);
  userStartAudio();
}

function draw() {
  background(220);

  if (ambientSnd.isPlaying()) {
    
  } else {
    ambientSnd.play();
  }

  if (gameState === 0) {
    image(titleImg, width/2, height/2, width, height);
  } else if (gameState === 1) {
    image(gameImg, width/2, height/2, width, height);

    noStroke();
    fill(255);
    rect(70, 535 - (power * 3.65), 50, 10);

    textSize(80);
    text(hoopTally, 135, 110);

    if (powerToggle) {
      power--;

      if (power > 33) {
        power = power - 0.5;
      }

      if (power > 66) {
        power = power - 0.5;
      }

      if (power < 1) {
        powerToggle = false;
      }
    } else {
      power++;

      if (power > 33) {
        power = power + 0.5;
      }

      if (power > 66) {
        power = power + 0.5;
      }

      if (power > 99) {
        powerToggle = true;
      }
    }
    
    fill(40,40,40);
    textSize(124);
    text(roundTime, width/2, 110);

    if (roundTime > 0) {
      roundFrame--;
      
      if (roundFrame < 1) {
        roundTime--;
        roundFrame = 60;
      }
    } else {

      if (roundDelay > 0) {
        if (whistleBlown) {

        } else {
          whistleSnd.play();
        whistleBlown = true;
        }
        
        roundDelay--;
      } else {
        gameState = 2;
        roundTime = 30;
        roundDelay = 120;
        whistleBlown = false;
      }

      
    }

    for (let b of balls) {
      b.update();
      b.draw();
    }
    balls = balls.filter(b => b.active);


  } else if (gameState === 2) {
    image(endImg, width/2, height/2, width, height);
    textSize(124);
    fill(255);
    text(hoopTally, 235, 290);
    
    text(misses, 565, 290);
  }

  // Update button image based on buttonCD
  if (buttonCD) {
    buttonImg.attribute('src', 'assets/buttonPressed.png');
  } else {
    buttonImg.attribute('src', 'assets/buttonUnpressed.png');
  }

  if (buttonTimer > 0) {
    buttonTimer--;
    if (buttonTimer <= 0) {
      buttonCD = false;
    }
  }
	
}

function buttonPress() {

  if (buttonCD) {

  } else {

    clickSnd.play();
    buttonTimer = 20;
    buttonCD = true;

    if (gameState === 0) {
    gameState = 1;
    whistleSnd.play();
  } else if (gameState === 1) {
    if (roundTime > 0) {
      shootBasketball();
    }
    
  } else if (gameState === 2) {
    gameState = 0;
    hoopTally = 0;
    misses = 0;
  }
}

}

function windowResized() {
  if (isMobile) {
    resizeCanvas(windowWidth, windowHeight);
    let canvas = document.querySelector('canvas');
    buttonImg.position(canvas.offsetLeft + width/2 - buttonImg.width/2, canvas.offsetTop + height/2 + 100);
	} else {
    let canvas = document.querySelector('canvas');
    buttonImg.position(canvas.offsetLeft + width/2 - buttonImg.width/2, canvas.offsetTop + height/2 + 100);
  }
  
}

function shootBasketball() {

  if (power > 65) {
    if (power < 90) {
      ballLand();
    } else {
      misses++;
      ballMiss(1);
    }
  } else {
    misses++;
    ballMiss(0);
  }
}

function ballLand() {
  balls.push(new Ball(150, 500, 0));
}

function ballMiss(highOrLow) {

  if (highOrLow < 1) {
    balls.push(new Ball(150, 500, 1));
  } else {
    balls.push(new Ball(150, 500, 2));
  }
}

class Ball {
  constructor(x, y, over) {
    this.x = x;
    this.y = y;
    this.vx = 7.5;
    this.vy = -20.8333;
    this.g = 0.5;
    this.active = true;
    this.lifeSpan = 90;
    this.highOrLow = over;
    this.hooped = false;
  }

  update() {
    if (this.active) {
      this.x += this.vx;
      if (this.highOrLow === 1) {
        this.y += 4;
        this.x += 4;
      }
      this.y += this.vy;
      if (this.highOrLow === 2) {
        this.y += -3.5;
      }
      this.vy += this.g;
      if (this.lifeSpan > 0) {
        this.lifeSpan--;

        if (this.lifeSpan < 35 && this.hooped === false && this.highOrLow === 0) {
          hoopTally++;
          swishSnd.play();
          this.hooped = true;
        } else if (this.lifeSpan < 15 && this.hooped === false) {
          let randomIndex = floor(random(crashSounds.length))
          crashSounds[randomIndex].play();
          this.hooped = true;
        }
       
      } else {
        this.active = false;
      }
    }
  }

  draw() {
    if (this.active) {
      image(ballImg, this.x, this.y, 55, 55);
    }
  }
}