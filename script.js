class Game {
  constructor() {
    this.bear = null;
    this.gameInterval = null;
    this.canvas = document.getElementById("game-canvas");
    this.context = this.canvas.getContext("2d");
    this.canvasWidth = 480;
    this.canvasHeight = 589;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ScoreDuringGame = new ScoreDuringGame();
    document.getElementById("play").addEventListener("click", () => {
        this.flappy_bear((bear) => {
            this.bear = bear;
            document.getElementById('menu_screen').classList.add('hidden');
        });
    });





    this.backgroundImage = new Image();
    this.backgroundImage.src = "images/background.jpg";
    this.bearImage = new Image();
    this.bearImage.src = "images/bear.png";
    this.pipeImage = new Image();
    this.pipeImage.src = "images/log.png";
    this.jumpSound = document.getElementById('jump-sound');
    
    //this.context.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);

    
    
  
    

    document.addEventListener("keydown", (event) => {
        if (event.code === 'Space' && this.bear){
            this.bear.move_jump();
            game.play_jump_sound();
        }
    });
  }

  
  
  play_jump_sound(){
    this.jumpSound.play();
  }

  start_game(){
    this.gameInterval = setInterval(update_game, 1000/60);
  }

  stop_game(){
    clearInterval(this.gameInterval);
  }

  draw_background(){
    this.context.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
  }
  draw_bear(x, y){
    this.context.drawImage(this.bearImage, x, y);
  }
  draw_pipes()
  {
    for (let pipe of this.pipes){
      this.context.drawImage(this.pipeImage, pipe.x, pipe.y);
    }
  }
  flappy_bear(callback) {
  let canvas = document.getElementById("game-canvas");
  let context = canvas.getContext("2d");
  let pipes = new Pipes(canvas, context);
  let bear = new Bear(canvas, context, pipes);

  const update_game = () => {
    const currentTime = performance.now();
    if(!bear.isDead){
    bear.move();}
    pipes.update(currentTime);
    bear.check_collisions(pipes.upperPipes, pipes.lowerPipes);
    if(!bear.isDead){
    bear.draw();
    pipes.draw();}
    for (let pipe of pipes.lowerPipes){
      if (pipe.x + pipe.width < bear.x && !pipe.passed && !bear.isDead){
        this.ScoreDuringGame.increment_score();
        pipe.passed = true;
      }
    }
    if(bear.isDead){
      console.log("helooo");
      pipes.gameOver = true;
      this.stop_game();
      this.ScoreDuringGame.update_high_score();
      this.ScoreDuringGame.reset_score();
      new GameOver(this.bear, this.ScoreDuringGame);
    }
  };
  
  setTimeout(() => {
      callback(bear);
      setInterval(update_game, 1000 / 60);
  }, 100);
  }
}

class Bear {
  constructor(canvas, context, pipes) {
  this.pipes = pipes;
  this.canvas = canvas;
  this.context = context;
  this.x = 0;
  this.y = 0;
  this.width = 30;
  this.height = 25;
  this.speed = 2;
  this.gravity = 0.3;
  this.jump = -6;
  this.velocity = 0;
  this.isJumping = false;
  this.isDead = false;
  this.score = 0;
  this.highScore = 0;
  }

  draw(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.context.fillStyle = "red";
    // this.context.fillRect(this.x, this.y, this.width, this.height);
    this.context.drawImage(game.backgroundImage, 0, 0, game.canvasWidth, game.canvasHeight);
    this.context.drawImage(game.bearImage, this.x, this.y, this.width, this.height);
  }
  
  move() {
  this.x += this.speed;
  this.velocity += this.gravity;
  this.y += this.velocity;

  if (this.x > this.canvas.width / 2){
      const scrollDistance = this.x - this.canvas.width / 2;
      this.canvas.style.transform = `translateX(-${scrollDistance}px)`;
      this.x -= scrollDistance;
  }
      
  if (this.y > this.canvas.height - this.height) {
    this.handle_boundary_collision();
   }
  }

  move_jump(){
    if(!this.isDead){
      this.velocity = this.jump;
    }
  }
    
  check_collisions(upperPipes, lowerPipes) {
  for (let pipe of upperPipes) {
    if (this.is_colliding(pipe)) {
      this.handle_collision(pipe);
    }
  }

  for (let pipe of lowerPipes){
      if(this.is_colliding(pipe)){
          this.handle_collision(pipe);
      }
  }

  if (this.y >= this.canvas.height) {
    this.handle_boundary_collision();
    }
  }
  is_colliding(pipe) {
    //console.log("Bear:", this.x, this.y, this.width, this.height);
    //console.log("Pipe:", pipe.x, pipe.y, pipe.width, pipe.height);

    let collision =
      this.x < pipe.x + pipe.width &&
      this.x + this.width > pipe.x &&
      this.y < pipe.y + pipe.height &&
      this.y + this.height > pipe.y;

    //console.log("Collision:", collision);

    return collision;
  }
  
  handle_collision(){
    this.isDead = true;
    //this.stop_game();
    
    //
  }

  handle_boundary_collision(){
    this.isDead = true;
    //
  }

  reset_game(){
    this.x = 0;
    this.y = 0;
    this.velocity = 0;
    this.isJumping = false;
    this.isDead = false;
    this.pipes.gameOver = false;
    this.pipes.upperPipes = [];
    this.pipes.lowerPipes = [];
    // this.score = 0;
    // call the function that actually starts the game
    }

  // increment_score(){
  //   game.score++;
  // }
}

class Pipes {
  constructor(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  this.upperPipes = [];
  this.lowerPipes = [];
  this.pipeInterval = 1000;
  this.lastPipe = 0;
  this.width = 40;
  this.height = 589;
  this.gapHeight = 150;
  this.pipeSpeed = 4.5;
  this.gameOver = false;
  this.lastPipeX = this.canvas.width;
  }

  draw(){
    //this.context.fillStyle = 'green';
    for(let pipe of this.upperPipes){
      this.context.drawImage(game.pipeImage, pipe.x, 0, this.width, pipe.height);
    }

    for(let pipe of this.lowerPipes){
        this.context.drawImage(game.pipeImage,pipe.x, pipe.y, this.width, this.height);
    }
  }

  newPipe() {
  // const pipeX = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
  // const pipeY = Math.floor(Math.random() * (this.canvas.height - 50)) + 50;
  // const pipe = { x: pipeX, y: pipeY };
  // this.pipes.push(pipe);

    const delay = 1000;
    setTimeout(() => {
    
    if(!this.gameOver){
    const initialOffset = 500;
    const pipeX = Math.floor(Math.random() * (this.canvas.width / 2)) + this.canvas.width + initialOffset;
    const gapPosition = Math.floor(Math.random() * (this.canvas.height - this.gapHeight));
    const upperPipeHeight = gapPosition;
    const lowerPipeY = gapPosition + this.gapHeight;
    const gapBetweenPipes = 500;
    const nextPipeX = pipeX + gapBetweenPipes;

    const pipeWidth = this.width;
    const pipeHeight = this.height;

    const upperPipe = { x: nextPipeX, y: 0, width: pipeWidth, height: upperPipeHeight };
      //const upperPipe = { x: pipeX, y: 0, width: pipeWidth, height: pipeHeight };
    this.upperPipes.push(upperPipe);

    const lowerPipe = { x: nextPipeX, y: lowerPipeY, width: pipeWidth, height: this.canvas.height - lowerPipeY};
    //const lowerPipe = {x:pipeX, y:lowerPipeY, width: pipeWidth, height:pipeHeight};
    this.lowerPipes.push(lowerPipe);

    this.lastPipeX = nextPipeX;
    }
    }, delay);
    }
  

  update(currentTime) {
  if (currentTime - this.lastPipe >= this.pipeInterval) {
    this.newPipe();
    this.lastPipe = currentTime;
  }
    for (let i = 0; i < this.upperPipes.length; i++){
        this.upperPipes[i].x -= this.pipeSpeed;
        if (this.upperPipes[i].x + this.width < 0){
            this.upperPipes.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < this.lowerPipes.length; i++){
        this.lowerPipes[i].x -= this.pipeSpeed;
        if (this.lowerPipes[i].x + this.width < 0){
            this.lowerPipes.splice(i, 1);
            i--;
        }
    }
  }
}


class GameOver{
  constructor(bear, scoreduringgame){
    const modal = document.getElementById("game-over-message");
    this.ScoreDuringGame = scoreduringgame;
    this.score = this.ScoreDuringGame.score;
    modal.style.display = "block";

    const scoreDisplay = document.getElementById("game-over-score");
    const highScoreDisplay = document.getElementById("game-over-high-score");

    //scoreDisplay.textContent = `Score: ${this.score}`;
    //highScoreDisplay.textContent = `High Score: ${this.ScoreDuringGame.highScore}`;

    const close_button = document.getElementsByClassName("close")[0];
    close_button.onclick = function(){
    modal.style.display = "none";
    }
    document.getElementById("play-again").addEventListener('click', function(){
      const delay = 250;

      setTimeout(() => {
      
      bear.reset_game();
      modal.style.display = "none";
      }, delay);
    });
  }
}


class ScoreDuringGame{
  constructor(){
    this.score = 0;
    this.highScore = 0;
    this.flag = false;
    this.score_during_game = document.getElementById("score-during-game");
    this.high_score_during_game = document.getElementById("game-over-high-score");
    this.score_display = document.getElementById("game-over-score");
    this.update_display();
    
    
  }

  update_score_display(score){
    let scoreForDisplay = score;
    if(this.flag === false){
    this.score_display.textContent = `Score: ${scoreForDisplay}`;
      this.flag = true;
    }
  }

  update_high_score_display(){
    this.high_score_during_game.textContent = `High Score: ${this.highScore}`;
  }

  increment_score(){
    this.score++;
    this.update_display();
}

  update_high_score(){
    this.highScore = Math.max(this.highScore, this.score);
    this.update_high_score_display();
    this.update_score_display(this.reset_score());
  }

  reset_score(){
    const currentScore = this.score;
    console.log("C_S: " + currentScore);
    console.log("O_S: " + this.score);
    this.score = 0;
    this.update_display();
    return currentScore;
  }

  update_display(){
    this.score_during_game.innerHTML = this.score;
  }
}


const game = new Game();

// Promise.all([
//   game.backgroundImage.onload,
//   game.bearImage.onload,
//   game.pipeImage.onload
  
// ]).then(() => {
//   game.draw_background();
//   game.draw_bear();
//   game.draw_pipes();
// });
