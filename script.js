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
  birdImage = loadImage('https://cdn.discordapp.com/attachments/887521357548638249/1220523800698028113/puff2.png?ex=660f405e&is=65fccb5e&hm=1419d100daa64a536b0c87c53b1acdf3d81967ce38147bef451a8d79a7c5dc97&');
  topPipeImage = loadImage('https://cdn.discordapp.com/attachments/887521357548638249/1220573506463465603/top.png?ex=660f6ea9&is=65fcf9a9&hm=f0affea109fb5c9ed1fa7172f4e08c2b63950479f5f5620251d11b69094bad3c&');
  bottomPipeImage = loadImage('https://cdn.discordapp.com/attachments/887521357548638249/1220571772957626429/bottom.png?ex=660f6d0b&is=65fcf80b&hm=7a1b18f8a8409436c6d2722c0d6f9baf13046d7861f463e8910c27b83007ac8c&');
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

let username = null;

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

  // Prompt for username input only if the game is over and username is not set
  if (gameOver && !username) {
    username = prompt("Enter your username");
    handleFormSubmit(username);
  }
}


function handleFormSubmit(username) {
  // Sign in anonymously and save the username and high score
  firebase.auth().signInAnonymously()
    .then((user) => {
      console.log('Logged in as anonymous');
      return db.collection('users').doc(user.uid).set({
        username: username,
        highScore: highScore
      });
    })
    .then(() => {
      console.log('Username and high score saved');
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(`Error: ${errorCode}, ${errorMessage}`);
    });
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
  gameOver = false;

  let storedHighScore = getCookie("highScore"); // Get the stored high score

  // Convert storedHighScore to a number, or default to 0 if it's null
  storedHighScore = storedHighScore ? parseInt(storedHighScore) : 0;

  // Check if the current score is higher than the stored high score
  if (score > storedHighScore) {
    // Update the stored high score
    storedHighScore = score;
    setCookie("highScore", storedHighScore, 365);

    // Sign in anonymously and save the username, high score, and current score to Firestore
    firebase.auth().signInAnonymously()
      .then((user) => {
        console.log('Logged in as anonymous');
        return db.collection('users').doc(user.uid).set({
          username: username,
          highScore: storedHighScore,
          score: score // Add the current score to Firestore
        });
      })
      .then(() => {
        console.log('Username and score saved');
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(`Error: ${errorCode}, ${errorMessage}`);
      });
  }

  // Reset the score to 0
  score = 0;
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
