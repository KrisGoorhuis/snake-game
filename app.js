/*global $ document window localStorage */

$(document).ready(function() {
   
   // (Width or height + dot circumference)/2 must be divisible by dot circumference.
   // For example: dot radius of 4 means circumference of 8. Find a multiple of twice that, 16, and add 8.
   var canvasWidth = 408;
   var canvasHeight = 408;
   var dotRadius = 4;
   
   $("canvas").attr('width', canvasWidth);
   $("canvas").attr('height', canvasHeight);  
   var canvas = $('#myCanvas')[0];
   var context = canvas.getContext("2d");

   var redrawIntervalTimeDefault = 100;
   var redrawIncreasePerFood = 2;
   var foodIntervalTime = 10000;
   var redrawIntervalTime = redrawIntervalTimeDefault;
   var foodInterval;
   var redrawInterval;
   
   var bodyPositions = [];
   var foodPositions = [];
   
   var snakeLengthDefault = 5;
   var snakeLength = snakeLengthDefault;
   var snakeGrowth = 5;
   var dead = false;
   var movementDirection = "up";
   var currentScreen = "start";
   
   var x = canvas.width/2;
   var y = canvas.height/2+dotRadius*2;
   var dx = dotRadius*2;
   var dy = dotRadius*2;
   
   var foodEaten = 0;
   var highScore = 0;   
   
   
   function startPlaying() {
      $('#start-screen').css("display", "none");
      currentScreen = "playing";
      
      generateFood();
      foodInterval = setInterval(generateFood, foodIntervalTime);
   
      drawCycle();
      redrawInterval = setInterval(drawCycle, redrawIntervalTime);
   }
   
   function resetPlay() {
      $('#game-over-screen').css('display', 'none');
      currentScreen = "playing";
      
      bodyPositions = [];
      foodPositions = [];
      redrawIntervalTime = redrawIntervalTimeDefault;
      dead = false;
      movementDirection = "up";
      
      foodEaten = 0;
      $('#food-eaten').text(foodEaten);

      x = canvas.width/2;
      y = canvas.height/2+dotRadius*2;
      dx = dotRadius*2;
      dy = dotRadius*2;
      
      generateFood();
      foodInterval = setInterval(generateFood, foodIntervalTime);
   
      drawCycle();
      redrawInterval = setInterval(drawCycle, redrawIntervalTime);
   }
   
   function keyDownHandler(event) {
      if (event.keyCode === 13) {
         if (currentScreen === "start") {
            startPlaying();
         }
         if (currentScreen === "game over") {
            resetPlay();
         } 
         if (currentScreen === "playing") {
            // do nothing
         }
      }
      
      if (event.keyCode === 38 && movementDirection !== "up" && movementDirection !== "down") { 
         movementDirection = "up";
         drawCycle(); 
         clearInterval(redrawInterval);
         redrawInterval = setInterval(drawCycle, redrawIntervalTime);
      }
      if (event.keyCode === 40 && movementDirection !== "down" && movementDirection !== "up") { 
         movementDirection = "down";
         drawCycle();
         clearInterval(redrawInterval);
         redrawInterval = setInterval(drawCycle, redrawIntervalTime);
      }
      if (event.keyCode === 37 && movementDirection !== "left" && movementDirection !== "right") { 
         movementDirection = "left";
         drawCycle();
         clearInterval(redrawInterval);
         redrawInterval = setInterval(drawCycle, redrawIntervalTime);
      } 
      if (event.keyCode === 39 && movementDirection !== "right" && movementDirection !== "left") { 
         movementDirection = "right";
         drawCycle();
         clearInterval(redrawInterval);
         redrawInterval = setInterval(drawCycle, redrawIntervalTime);
      }
   }
   
   function incrementPosition() {
      bodyPositions.push([x, y]);
      if (bodyPositions.length > snakeLength) {
         bodyPositions.splice(0, 1);
      }
      
      if (movementDirection === "up") {
         x += 0;
         y += -dy;
      }
      if (movementDirection === "down") {
         x += 0;
         y += dy;
      }
      if (movementDirection === "left") {
         x += -dx;
         y += 0;
      }
      if (movementDirection === "right") {
         x += dx;
         y += 0;
      }
   }
   
   function generateFood() {
      
      // Complicated (for me) stuff that keeps new food pellets spawning on a nice grid. I like to think they're berries.
      function acquireNewCoordinate(widthOrHeight) {
         var dotCircumference = dotRadius*2;
         var dotsInsideWidth = (widthOrHeight/dotCircumference) - 1; 
            // We're dividing by dot size to get numbers that are always multiples of our circumference. We'll multiply later to get numbers usable with our actual canvas width/height.
            // Subtracting because Left edge of the final circle would otherwise lie on the canvas' right side border. We're playing inside the field.
        
         var randomNonInteger = Math.random() * (dotsInsideWidth - 1) + 1;
         var randomInteger = Math.floor(randomNonInteger) + 1; 
         var newFoodCoordinate = (randomInteger * dotCircumference) + dotRadius; 
            // Multiplying to get our neatly grid-based random number.
            // Coordinates are based on the center of our dots. We need to be one radius length in from the edges.
         
         return newFoodCoordinate;
      }
      
      var newFoodX = acquireNewCoordinate(canvasWidth);
      var newFoodY = acquireNewCoordinate(canvasHeight);
      
      foodPositions.push([newFoodX, newFoodY]);
   }
   
   function drawFood() {
      for (i = 0; i < foodPositions.length; i++) {
         context.beginPath();
         context.arc(foodPositions[i][0], foodPositions[i][1], dotRadius, 0, Math.PI*2, false);
         context.fillStyle = "#F5004A";
         context.fill();
         context.closePath();
      }
   }
   
   function drawSnake() {
      // Based on Noodle, the coral snake from Snake Pass.
      // red x3 - yellow x1 - black x2 - yellow x1 - red x3 - yellow x1 and so on
      // 7 dots before repeating
      var noodleEyes = "rgb(129, 146, 191)";
      var noodleRed = "rgb(250, 87, 0)";
      var noodleYellow = "rgb(255, 239, 80)";
      var noodleBlack = "rgb(53, 32, 27)";
      
      
      // The head:
      context.beginPath();
      context.arc(x, y, dotRadius, 0, Math.PI*2, false);
      context.fillStyle = noodleEyes;
      context.fill();
      context.closePath(); 
      
      // And the body:
      var segmentCount = 1;
      for (i = bodyPositions.length-1; i >= 0; i--) {
         context.beginPath();
         context.arc(bodyPositions[i][0], bodyPositions[i][1], dotRadius, 0, Math.PI*2, false);
         if (segmentCount >= 1 && segmentCount <= 3) {
            context.fillStyle = noodleRed;
         }
         if (segmentCount === 4) {
            context.fillStyle = noodleYellow;
         }
         if (segmentCount === 5 || segmentCount === 6) {
            context.fillStyle = noodleBlack;
         }
         if (segmentCount === 7) {
            context.fillStyle = noodleYellow;
            segmentCount = 0;
         }
         segmentCount++;
         context.fill();
         context.closePath();      
      }; 
   };
   
   function foodCheck() {
      // indexOf tracks instances of the specific item in question. So [300, 300] can return -1 even with the presence of [300, 300] in the array of arrays.
      for (i = 0; i < foodPositions.length; i++) {
         if (foodPositions[i][0] === x && foodPositions[i][1] === y) {
            snakeLength+= snakeGrowth; 
            foodPositions.splice(i,1);
            
            clearInterval(redrawInterval);
            redrawIntervalTime -= redrawIncreasePerFood;
            redrawInterval = setInterval(drawCycle, redrawIntervalTime);
            
            foodEaten++;
            $('#food-eaten').text(foodEaten);
            
            if (foodPositions.length === 0) {
               generateFood();
            }
            
            if (highScore < foodEaten) {
               highScore = foodEaten;
               $('#high-score-value').text(highScore);
               $('#game-over-text').text("New high score!");
            } else {
               $('#game-over-text').text("Game over");
            }
         }
      }
   }
   
   function gameOver() {
      dead = true;
      currentScreen = "game over";
      snakeLength = snakeLengthDefault;
      clearInterval(redrawInterval);
      clearInterval(foodInterval);
      
      
      
      $('#game-over-screen').css('display', 'flex');
   }
   
   function deathCheck() { 
      // x position is the center of the dot. + or - dot radius to get opposite outside edges
      if (x - dotRadius < 0 || x + dotRadius > canvas.width) {
         gameOver();
      }
      if (y - dotRadius < 0 || y + dotRadius> canvas.height) {
         gameOver();
      }
      
      // indexOf tracks instances of the specific item in question. So [300, 300] can return -1 even with the presence of [300, 300] in the array of arrays.
      for (i = 0; i < bodyPositions.length; i++) { 
         if (bodyPositions[i][0] === x && bodyPositions[i][1] === y) {
            clearInterval(redrawInterval);
            gameOver();
         }
      }
   }

   function drawCycle() {
      deathCheck();
      if (dead === false) {
         context.clearRect(0, 0, canvas.width, canvas.height);
         drawFood();
         drawSnake();
         foodCheck();
      } 
      incrementPosition();
   }
   
   
   $('#start-button').on("click", startPlaying);
   
   $('#reset-button').on("click", resetPlay);
   
   document.addEventListener("keydown", keyDownHandler);
});

