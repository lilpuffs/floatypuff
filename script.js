var firebaseConfig = {
    apiKey: "AIzaSyDDlEeoeCpumzV4qFTVGjb62G9pgM-RhhM",
    authDomain: "floatypuffs.firebaseapp.com",
    projectId: "floatypuffs",
    storageBucket: "floatypuffs.appspot.com",
    messagingSenderId: "21590134748",
    appId: "1:21590134748:web:6be268c042e8867bd94919",
    measurementId: "G-243DBWKD18"
  };
        firebase.initializeApp(firebaseConfig);
        var db = firebase.firestore();

let bird;
let pipes = [];
let score = 0;
let birdImage;
let topPipeImage;
let bottomPipeImage;
let gameOver = false;
let highScore;

function preload() {
  birdImage = loadImage('puff2-min.png');
  topPipeImage = loadImage('top-min.png');
  bottomPipeImage = loadImage('bottom-min.png');
}

function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  pipes.push(new Pipe());
  highScore = getCookie("highScore");
  canvas = createCanvas(400, 600);
  canvas.touchStarted(startTouch);
}

function startTouch() {
  if (gameOver) {
    resetGame();
  } else {
    bird.up();
  }
}

function draw() {
  let fromColor = color(0, 191, 255);
  let toColor = color(65, 105, 225);
  backgroundGradient(fromColor, toColor);

  if (!gameOver) {
    bird.update();
    bird.show();

    if (frameCount % 100 === 0) {
      pipes.push(new Pipe());
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      pipes[i].show();

      if (pipes[i].hits(bird)) {
        console.log("Game over!");
        gameOver = true;
      }

      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
        score++;
      }
    }

    if (score > highScore) {
      highScore = score;
      setCookie("highScore", highScore, 365);
    }

    displayScores();
  } else {
    displayGameOver();
  }
}

function displayScores() {
  fill(0);
  textFont('Silkscreen');
  textSize(24);
  let scoreText = "Score: " + score;
  let scoreTextWidth = textWidth(scoreText);
  
  text(scoreText, width / 2 - scoreTextWidth / 2, 30);
  textSize(12);
  let highScoreText = "High Score: " + highScore;
  let highScoreTextWidth = textWidth(highScoreText);
  text(highScoreText, width / 2 - highScoreTextWidth / 2, 50);
}

function displayGameOver() {
  fill(255, 0, 0);
  textSize(26);
  textFont('Silkscreen');
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2 - 20);
  text("Tap/Spacebar/Click", width / 2, height / 2 + 40);
  text("to Reset", width / 2, height / 2 + 70);
  fill(255);
  textSize(15);
  textAlign(CENTER, CENTER, CENTER);
  let scoreText = "Your Score: " + score;
  let scoreTextWidth = textWidth(scoreText);
  text(scoreText, width / 2 - scoreTextWidth / 18, height / 2 + 150);
}

function mousePressed() {
  if (!gameOver) {
    bird.up();
  } else {
    resetGame();
  }
}

function keyPressed() {
  if (key === " " && gameOver) {
    resetGame();
  } else if (key === " ") {
    bird.up();
  }
}

function resetGame() {
  pipes = [];
  bird = new Bird();
  score = 0;
  gameOver = false;
}

class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 64;
    this.gravity = 0.6;
    this.lift = -15;
    this.velocity = 0;
    this.angle = 0; // Angle for tilting
    this.rotationSpeed = 0.1; // Speed of rotation
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle); // Rotate the bird
    image(birdImage, -16, -16, 32, 32); // Adjust image position for rotation
    pop();
  }

  up() {
    this.velocity += this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Tilt the bird based on velocity
    if (this.velocity > 0) {
      this.angle += this.rotationSpeed; // Tilt down
    } else {
      this.angle -= this.rotationSpeed; // Tilt up
    }

    // Limit the tilt angle
    this.angle = constrain(this.angle, -PI / 6, PI / 6);

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
  }
}

class Pipe {
  constructor() {
    this.spacing = 175;
    this.top = random(height / 6, 3 / 4 * height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 40;
    this.speed = 2;
  }

  show() {
    image(topPipeImage, this.x, 0, this.w, this.top);
    image(bottomPipeImage, this.x, height - this.bottom, this.w, this.bottom);
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    return this.x < -this.w;
  }

  hits(bird) {
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
  return null;
}
function backgroundGradient(from, to) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(from, to, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
}
