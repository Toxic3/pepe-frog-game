// Frog Game Project - By Toxic

// Position variables
let gameChar_x;
let gameChar_y;
let floorPos_y;
let scrollPos;
let gameChar_world_x;
// Movement variables
let isLeft;
let isRight;
let isFalling;
let isPlummeting;
// Scenery variables
let trees_x;
let cloud;
let collectable;
let mountain;
let canyon;
let flagpole;
// Game-play variables
let game_score;
let lives;
let enemies;

// Function to setup the canvas (ran first)
function setup() {
    "use strict";
    // Create the canvas and set variables
    createCanvas(1024, 576);
    lives = 4;
    // Start the game
    startGame();
}

// Function to start the game
function startGame() {
    "use strict";
    // Set variables
    floorPos_y = height * 3 / 4
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    game_score = 0;
    let i;
    // Reduce number of lives each time it starts
    lives -= 1;
    // Variable to control the background scrolling
    scrollPos = 0;
    gameChar_world_x = gameChar_x - scrollPos;
    // Boolean variables to control the movement of the game character
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;

    // Initialise arrays of scenery objects
    trees_x = [];
    for (i = 0; i < 20; i += 1)
    {
        trees_x[i] = random(0, 2000);
    }

    cloud = [];
    for (i = 0; i < 20; i += 1)
    {
        cloud[i] = {x_pos: random(0, 2000), y_pos: random(0, 350), size: random(4,6)};
    }

    collectable = [{x_pos: random(100, 200), y_pos: random(floorPos_y-100, floorPos_y-20),
                    size: random(26, 30), isFound: false}];
    for (i = 1; i < 20; i += 1)
    {
        collectable[i] = {x_pos: collectable[i-1].x_pos + (30 * random(1, 20)), y_pos: random(floorPos_y-90,
                floorPos_y-20), size: random(26, 30), isFound: false};
    }

    mountain = [];
    for (i = 0; i < 10; i += 1)
    {
        mountain[i] = {x_pos: random(0, 2000), width: random(100, 700), height: random(100, 500)};
    }

    canyon = [{x_pos: 750, width: 120},
             {x_pos: 1024, width: 90},
             {x_pos: 1350, width: 110},
             {x_pos: 1600, width: 140}];
    
    flagpole = {x_pos: 2000, isReached: false};
    
    // Initialise enemies
    enemies = [];
    enemies.push(new Enemy(0, floorPos_y, 300));
    enemies.push(new Enemy(894, floorPos_y, 49));
    enemies.push(new Enemy(1182, floorPos_y, 20));
    enemies.push(new Enemy(2000, floorPos_y, 200));
}

// Function to draw to the canvas
function draw() {
    "use strict";
    let i;
    // Draw floor and sky
    background(100, 155, 255);
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height / 4);

    // Save the current state
    push();

    // Translate the background by scroll position
    translate(scrollPos, 0);
    
    // Draw clouds
    for (i = 0; i < cloud.length; i += 1)
    {    
        drawCloud(cloud[i]);
    }
    
    // Draw mountains
    for (i = 0; i < mountain.length; i += 1)
    {
        drawMountain(mountain[i]);
    }
    
    // Draw trees
    for (i = 0; i < trees_x.length; i += 1)
    {
        drawTree(trees_x[i]);
    }

    // Draw canyons
    for (i = 0; i < canyon.length; i += 1)
    {
        // Draw canyon
        drawCanyon(canyon[i]);
        // Check canyon based on player
        checkCanyon(canyon[i]);
    }

    // Draw collectable items
    for (i = 0; i < collectable.length; i += 1)
    {
        // If the collectable has not been found
        if (collectable[i].isFound === false)
        {
            // Draw the collectable
            drawCollectable(collectable[i]);
            // Check if the player has touched the collectable
            checkCollectable(collectable[i]);
        }
    }

    // Draw flagpole then check it
    drawFlagpole();
    checkFlagpole();
    
    // Draw enemies
    for (i = 0; i < enemies.length; i += 1)
    {
        enemies[i].update();
        enemies[i].draw();
        // If the enemy touches and you don't kill it
        if (enemies[i].isContact(gameChar_world_x, gameChar_y) === true)
        {
            // Restart
            startGame();
            break;
        }
        
        else if (enemies[i].isContact(gameChar_world_x, gameChar_y) === false && enemies[i].isKilled)
        {
            game_score += 1;
        }
    }
    
    // Return the the prior state
    pop();
    // Draw game character
    drawGameChar();

    // Game win/loss check
    if (lives < 1)
    {
        stroke(0);
        fill(0);
        textSize(50);
        text("GAME OVER!", width * 0.35, height * 0.45);
        text("Press Space to Continue..", width * 0.24, height * 0.55);
        // Stop drawing if lost
        return;
    }

    // If the player won
    else if (flagpole.isReached)
    {
        stroke(0);
        fill(0);
        textSize(50);
        text("LEVEL COMPLETE!", width * 0.28, height * 0.45);
        text("Press Space to Continue..", width * 0.24, height * 0.55);
        // Stop drawing if won
        return;
    }

    // Logic to make the game character move or the background scroll
    if (isLeft)
    {
        // If the character hasn't reached threshold to move bg
        if (gameChar_x > width * 0.2)
        {
            // Move character till they do
            gameChar_x -= 5;
        }

        // If the character has reached threshold to move bg
        else
        {
            // Move the background but not the game character
            scrollPos += 5;
        }
    }

    else if (isRight)
    {
        // If the character hasn't reached threshold to move the bg
        if (gameChar_x < width * 0.8)
        {
            // Move character till they do
            gameChar_x += 5;
        }

        // If the character has reached threshold to move bg
        else
        {
            // Move the background but not the game character
            scrollPos -= 5;
        }
    }

    // Logic to make the game character rise and fall.
    if (gameChar_y !== floorPos_y)
    {
        gameChar_y += 2;
        isFalling = true;
    }

    else
    {
        isFalling = false;
    }

    // Logic to restart game
    if (isPlummeting && gameChar_y >= height && lives > 0)
    {
        startGame();
    }

    // Scoreboard text
    stroke(0);
    fill(0);
    textSize(20);
    text("Score: " + str(game_score), 20, 30);

    // Lives text
    text("Lives: ", 20, 70);
    let heartPos;
    for (i = 0; i < lives; i += 1)
    {
        heartPos = 120;
        noStroke();
        fill(255, 120, 120);
        ellipse(heartPos-3+((i-1)*30), 60, 10);
        ellipse(heartPos+3+((i-1)*30), 60, 10);
        triangle(heartPos+((i-1)*30), 72, heartPos-8+((i-1)*30), 61, heartPos+8+((i-1)*30), 61);
    }
    
    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;
}

// If a key is pressed
function keyPressed() {
    "use strict";
    // If the player wants to go to next level
    if (flagpole.isReached && key === " ")
    {
        nextLevel();
        return;
    }

    // If the player wants to restart
    else if (lives === 0 && key === " ")
    {
        returnToStart();
        return;
    }

    // Conditions to see what state player is in
    if (keyCode === 37 && isPlummeting !== true)
    {
        isLeft = true;
    }

    else if (keyCode === 39 && isPlummeting !== true)
    {
        isRight = true;
    }

    else if (keyCode === 32 && gameChar_y === floorPos_y)
    {
        gameChar_y -= 100;
    }
}

// If a key is released
function keyReleased() {
    "use strict";
    // Conditions to see what state player is in
    if (keyCode === 37)
    {
        isLeft = false;
    }

    else if (keyCode === 39)
    {
        isRight = false;
    }
}

// Function to draw the game character.
function drawGameChar() {
    "use strict";

    // Check which state player is it
    if (isLeft && isFalling)
    {
        // Code for Jumping to the Left
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-6, gameChar_y-30, 7, 20);
        ellipse(gameChar_x+2, gameChar_y-30, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+1, gameChar_y-43, 20, 30);
        // Creates the green head
        ellipse(gameChar_x-3, gameChar_y-54, 23, 17);
        ellipse(gameChar_x-6, gameChar_y-57, 10, 19);
        ellipse(gameChar_x+2, gameChar_y-57, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+1, gameChar_y-58, 8, 4);
        ellipse(gameChar_x-6, gameChar_y-58, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x-8, gameChar_y-59, 3);
        ellipse(gameChar_x, gameChar_y-59, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x-5, gameChar_y-52, 14, 5);
        }

    // If the character is falling to the right
    else if (isRight && isFalling)
    {
        // Code for Jumping to the Right
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-2, gameChar_y-30, 7, 20);
        ellipse(gameChar_x+6, gameChar_y-30, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+1, gameChar_y-43, 20, 30);
        // Creates the green head
        ellipse(gameChar_x+3, gameChar_y-54, 23, 17);
        ellipse(gameChar_x, gameChar_y-57, 10, 19);
        ellipse(gameChar_x+8, gameChar_y-57, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+9, gameChar_y-58, 8, 4);
        ellipse(gameChar_x+2, gameChar_y-58, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x+3, gameChar_y-59, 3);
        ellipse(gameChar_x+10, gameChar_y-59, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x+5, gameChar_y-52, 14, 5);
    }

    // If the character is walking to the left
    else if (isLeft)
    {
        // Code for Walking Left
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-6, gameChar_y-7, 7, 20);
        ellipse(gameChar_x+2, gameChar_y-7, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+1, gameChar_y-23, 20, 30);
        // Creates the green head
        ellipse(gameChar_x-3, gameChar_y-34, 23, 17);
        ellipse(gameChar_x-6, gameChar_y-37, 10, 19);
        ellipse(gameChar_x+2, gameChar_y-37, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+1, gameChar_y-38, 8, 4);
        ellipse(gameChar_x-6, gameChar_y-38, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x-8, gameChar_y-37, 3);
        ellipse(gameChar_x, gameChar_y-37, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x-5, gameChar_y-32, 14, 2);
    }

    // If the character is walking to the right
    else if (isRight)
    {
        // Code for Walking Right
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-2, gameChar_y-7, 7, 20);
        ellipse(gameChar_x+6, gameChar_y-7, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+1, gameChar_y-23, 20, 30);
        // Creates the green head
        ellipse(gameChar_x+3, gameChar_y-34, 23, 17);
        ellipse(gameChar_x, gameChar_y-37, 10, 19);
        ellipse(gameChar_x+8, gameChar_y-37, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+9, gameChar_y-38, 8, 4);
        ellipse(gameChar_x+2, gameChar_y-38, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x+3, gameChar_y-37, 3);
        ellipse(gameChar_x+10, gameChar_y-37, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x+5, gameChar_y-32, 14, 2);
    }

    // If the character is falling or plummeting forwards
    else if (isFalling || isPlummeting)
    {
        // Code for Jumping facing straight ahead
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-2, gameChar_y-30, 7, 20);
        ellipse(gameChar_x+6, gameChar_y-30, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+2, gameChar_y-43, 20, 30);
        // Creates the green head
        ellipse(gameChar_x+3, gameChar_y-54, 23, 17);
        ellipse(gameChar_x-1, gameChar_y-57, 10, 19);
        ellipse(gameChar_x+7, gameChar_y-57, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+7, gameChar_y-58, 8, 4);
        ellipse(gameChar_x, gameChar_y-58, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x, gameChar_y-59, 3);
        ellipse(gameChar_x+7, gameChar_y-59, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x+3, gameChar_y-52, 14, 5);
    }

    // Or if the character is standing facing forward
    else
    {
        // Code for standing still facing straight ahead
        noStroke();
        fill(91, 138, 24);
        // Creates the green legs
        ellipse(gameChar_x-2, gameChar_y-7, 7, 20);
        ellipse(gameChar_x+6, gameChar_y-7, 7, 20);
        // Creates the green body
        ellipse(gameChar_x+2, gameChar_y-23, 20, 30);
        // Creates the green head
        ellipse(gameChar_x+3, gameChar_y-34, 23, 17);
        ellipse(gameChar_x-1, gameChar_y-37, 10, 19);
        ellipse(gameChar_x+7, gameChar_y-37, 10, 19);
        // Creates the eyes
        fill(255);
        ellipse(gameChar_x+7, gameChar_y-38, 8, 4);
        ellipse(gameChar_x, gameChar_y-38, 8, 4);
        // Creates the pupils
        fill(0);
        ellipse(gameChar_x, gameChar_y-37, 3);
        ellipse(gameChar_x+7, gameChar_y-37, 3);
        // Creates the lips
        fill(135, 91, 72);
        ellipse(gameChar_x+3, gameChar_y-32, 14, 2);
    }

    // Code to deal with canyon player interaction
    if (isPlummeting)
    {
        gameChar_y += 7;
    }

}

// Function to draw cloud objects
function drawCloud(t_cloud) {
    "use strict";
    // Draw clouds
    noStroke();
    fill(255);
    ellipse(t_cloud.x_pos+20+t_cloud.size, t_cloud.y_pos+20, t_cloud.size*20, t_cloud.size*10);
    fill(235);
    ellipse(t_cloud.x_pos+40+t_cloud.size, t_cloud.y_pos, t_cloud.size*12, t_cloud.size*11);
    fill(215);
    ellipse(t_cloud.x_pos-t_cloud.size, t_cloud.y_pos+10, t_cloud.size*18, t_cloud.size*14);
}

// Function to draw mountains objects
function drawMountain(t_mountain) {
    "use strict";
    // Draw mountains
    noStroke();
    fill(255);
    triangle(t_mountain.x_pos, floorPos_y, t_mountain.x_pos+(t_mountain.width), floorPos_y,
             t_mountain.x_pos+(t_mountain.width*0.4), floorPos_y-(t_mountain.height));
    fill(235);
    triangle(t_mountain.x_pos+(t_mountain.width*0.086), floorPos_y, t_mountain.x_pos+(t_mountain.width*0.886),
             floorPos_y, t_mountain.x_pos+(t_mountain.width*0.514), floorPos_y-(t_mountain.height*0.92));
    fill(215);
    triangle(t_mountain.x_pos+(t_mountain.width*0.371), floorPos_y, t_mountain.x_pos+(t_mountain.width*0.943),
             floorPos_y, t_mountain.x_pos+(t_mountain.width*0.657), floorPos_y-(t_mountain.height*0.977));
    fill(195);
    triangle(t_mountain.x_pos+(t_mountain.width*0.057), floorPos_y, t_mountain.x_pos+(t_mountain.width*0.629),
             floorPos_y, t_mountain.x_pos+(t_mountain.width*0.343), floorPos_y-(t_mountain.height*0.653));
}

// Function to draw trees objects
function drawTree(t_tree) {
    "use strict";
    // Draw trees
    noStroke();
    // Tree trunk
    fill(83, 49, 24);
    triangle(t_tree+39, floorPos_y, t_tree, floorPos_y-122, t_tree+80, floorPos_y-122);
    // Green leaves
    fill(30, 147, 45);
    ellipse(t_tree+39, floorPos_y-162, 80, 80);
    ellipse(t_tree+49, floorPos_y-132, 120, 50);
    ellipse(t_tree+69, floorPos_y-152, 60, 55);
    ellipse(t_tree+20, floorPos_y-142, 100, 70);
}

// Function to draw the flagpole
function drawFlagpole() {
    "use strict";
    // If the flagpole is reached
    if (flagpole.isReached)
    {
        noStroke();
        fill(255);
        rect(flagpole.x_pos-5, floorPos_y*0.6, 10, floorPos_y*0.4);
        fill(255, 0, 0);
        triangle(flagpole.x_pos-40, floorPos_y*0.7, flagpole.x_pos+40, floorPos_y*0.7, flagpole.x_pos, floorPos_y*0.5);
        fill(255, 255, 0);
        triangle(flagpole.x_pos-30, floorPos_y*0.7, flagpole.x_pos+30, floorPos_y*0.7, flagpole.x_pos, floorPos_y*0.5);
        fill(0, 255, 0);
        triangle(flagpole.x_pos-20, floorPos_y*0.7, flagpole.x_pos+20, floorPos_y*0.7, flagpole.x_pos, floorPos_y*0.5);
        fill(0, 255, 255);
        triangle(flagpole.x_pos-10, floorPos_y*0.7, flagpole.x_pos+10, floorPos_y*0.7, flagpole.x_pos, floorPos_y*0.5);
    }

    // If the flagpole hasn't been reached
    else
    {
        noStroke();
        fill(80);
        rect(flagpole.x_pos-5, floorPos_y*0.2, 10, floorPos_y*0.8);
        fill(0);
        triangle(flagpole.x_pos-40, floorPos_y*0.3, flagpole.x_pos+40, floorPos_y*0.3, flagpole.x_pos, floorPos_y*0.1);
        fill(20);
        triangle(flagpole.x_pos-30, floorPos_y*0.3, flagpole.x_pos+30, floorPos_y*0.3, flagpole.x_pos, floorPos_y*0.1);
        fill(40);
        triangle(flagpole.x_pos-20, floorPos_y*0.3, flagpole.x_pos+20, floorPos_y*0.3, flagpole.x_pos, floorPos_y*0.1);
        fill(60);
        triangle(flagpole.x_pos-10, floorPos_y*0.3, flagpole.x_pos+10, floorPos_y*0.3, flagpole.x_pos, floorPos_y*0.1);
    }
}

// Check if the flagpole has been reached
function checkFlagpole() {
    "use strict";
    if (dist(flagpole.x_pos, floorPos_y, gameChar_world_x, floorPos_y) < 10)
    {
        flagpole.isReached = true;
    }
}

// Function to draw canyon objects
function drawCanyon(t_canyon) {
    "use strict";
    noStroke();
    fill(0);
    triangle(t_canyon.x_pos-(t_canyon.width/2), floorPos_y, t_canyon.x_pos+(t_canyon.width/2), floorPos_y,
             t_canyon.x_pos, (floorPos_y+1)*2);
    fill(20);
    triangle(t_canyon.x_pos-(t_canyon.width/2)+5, floorPos_y, t_canyon.x_pos+(t_canyon.width/2)-5, floorPos_y,
             t_canyon.x_pos, (floorPos_y+1)*2);
    fill(40);
    triangle(t_canyon.x_pos-(t_canyon.width/2)+10, floorPos_y, t_canyon.x_pos+(t_canyon.width/2)-10, floorPos_y,
             t_canyon.x_pos, (floorPos_y+1)*2);
    fill(60);
    triangle(t_canyon.x_pos-(t_canyon.width/2)+15, floorPos_y, t_canyon.x_pos+(t_canyon.width/2)-15, floorPos_y,
             t_canyon.x_pos, (floorPos_y+1)*2);
}

// Function to check character is over a canyon
function checkCanyon(t_canyon) {
    "use strict";
    if (gameChar_world_x <= (t_canyon.x_pos + (t_canyon.width / 2)) && gameChar_world_x >=
        (t_canyon.x_pos - (t_canyon.width / 2)) && gameChar_y === floorPos_y)
    {
        isPlummeting = true;
        isLeft = false;
        isRight = false;
    }
}

// Function to draw collectable objects
function drawCollectable(t_collectable) {
    "use strict";
    stroke(50);
    // Creates the background
    fill(255, 215, 0);
    ellipse(t_collectable.x_pos+3, t_collectable.y_pos+2, t_collectable.size);
    // Creates the green head
    noStroke();
    fill(91, 138, 24);
    ellipse(t_collectable.x_pos+3, t_collectable.y_pos+4, t_collectable.size*0.793, t_collectable.size*0.607);
    ellipse(t_collectable.x_pos-((t_collectable.size-28)/t_collectable.size), t_collectable.y_pos+1,
            t_collectable.size*0.357, t_collectable.size*0.679);
    ellipse(t_collectable.x_pos+8+((t_collectable.size-28)/t_collectable.size), t_collectable.y_pos+1,
            t_collectable.size*0.357, t_collectable.size*0.679);
    // Creates the eyes
    fill(255);
    ellipse(t_collectable.x_pos+9+(5*(t_collectable.size-28)/ t_collectable.size), t_collectable.y_pos,
            t_collectable.size*0.286, t_collectable.size*0.143);
    ellipse(t_collectable.x_pos+2-(5*(t_collectable.size-28)/ t_collectable.size),t_collectable.y_pos,
            t_collectable.size*0.286, t_collectable.size*0.143);
    // Creates the pupils
    fill(0);
    ellipse(t_collectable.x_pos+3+((t_collectable.size-28)/t_collectable.size), t_collectable.y_pos+1,
            t_collectable.size*0.107);
    ellipse(t_collectable.x_pos+10+(8*(t_collectable.size-28)/ t_collectable.size), t_collectable.y_pos+1,
            t_collectable.size*0.107);
    // Creates the lips
    fill(135, 91, 72);
    ellipse(t_collectable.x_pos+5, t_collectable.y_pos+6+ (3*(t_collectable.size-28)/t_collectable.size),
            t_collectable.size*0.5, t_collectable.size*0.071);
    ellipse(t_collectable.x_pos+5, t_collectable.y_pos +6+ (3*(t_collectable.size-28)/t_collectable.size),
            t_collectable.size*0.5, t_collectable.size*0.071);
}

// Function to check character has collected an item
function checkCollectable(t_collectable) {
    "use strict";
    if (dist(t_collectable.x_pos, t_collectable.y_pos, gameChar_world_x, gameChar_y)
        <= t_collectable.size + 10)
    {
        t_collectable.isFound = true;
        game_score += 1;
    }
}

// Function to create enemies
function Enemy(x, y, range) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.current_x = x;
    this.incr = 1;
    this.isKilled = false;
    
    // Method to draw the enemy
    this.draw = function() {
        if (this.isKilled === false)
        {
            stroke(0);
            fill(159, 158, 158);
            ellipse(this.current_x - 36, this.y - 24, 12, 4);
            rect(this.current_x - 17, this.y - 12, 10, 12);
            rect(this.current_x + 10, this.y - 12, 10, 12);
            rect(this.current_x + 27, this.y - 12, 10, 12);
            rect(this.current_x - 35, this.y - 12, 10, 12);
            fill(234, 209, 134);
            rect(this.current_x - 30, this.y - 50, 60, 40);
            noStroke();
            fill(254, 119, 255);
            rect(this.current_x - 25, this.y - 45, 50, 30);
            stroke(0);
            fill(159, 158, 158);
            triangle(this.current_x + 25, this.y - 20, this.current_x + 30, this.y - 20,
                     this.current_x + 27, this.y - 35);
            triangle(this.current_x + 40, this.y - 20, this.current_x + 45, this.y - 20,
                     this.current_x + 42, this.y - 35);
            ellipse(this.current_x + 35, this.y - 23, 25, 15);
            fill(0);
            noStroke();
            ellipse(this.current_x + 32, this.y - 26, 3);
            ellipse(this.current_x + 40, this.y - 26, 3);
            ellipse(this.current_x + 36, this.y - 20, 10, 3);
        }
    }
    
    // Method to update the enemy (patrol)
    this.update = function() {
        this.current_x += this.incr;
        
        if (this.current_x < this.x - this.range)
        {
            this.incr = 1;
        }
        
        else if (this.current_x > this.x + this.range)
        {
            this.incr = -1;
        }
    }
    
    // Method to test if the enemy has touched the player
    this.isContact = function(gc_x, gc_y) {
        if (dist(gc_x, gc_y, this.current_x, this.y) < 25)
        {
            if (gc_y >= 50)
            {
                this.isKilled = true;
                return false;
            }
            
            else
            {
                return true;
            }
        }
    }
}
