/* General notes on x and y coordinates for game:

Canvas is 505 wide.
5 columns total, so each column is 101 wide.

Player can be in any column.
Possible x positions for player are: 0, 101, 202, 303, 404

Enemies can be in any x position, including off the canvas.
They will start at -800 and move to 790, looping back to the start.
They will only appear on the canvas between 0 and 505.
Possible x positions for enemy are: anywhere between -800 and 790.

Canvas is 606 high.
6 rows total.

First 5 rows are 83 high.
6th row is the remainder (191 high).
Player and enemy positions are offset to be
20 higher than the row, for best visual effect.

Enemies can only be on rows 2, 3, 4.
Possible y positions for enemy: 63, 146, 229.

Player can only be in rows 2, 3, 4, 5.
If player hits the 1st row, they reset back to 6th row.
Possible y positions for player: (-20), 63, 146, 229, 312, 395.
Note the -20 position will trigger a reset upon next update.

*/

// Helper function to generate random integer.
// Min is included, max is excluded.

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Define Constants.

var COL_X = 101;       // width of each column.
var ROW_Y = 83;        // height of each column (6th row is longer, but that's not relevant).
var SPEED_MUL = 150;   // constant by which to increase speed of game engine.
var Y_OFFSET = 20;     // number by which all entities will be higher than background rows.
var Y_MAX = 800;       // the highest y position for enemies (will be off the canvas).


/* Entity */

// This is a super-class.
//  All entities (e.g. Enemy, Player, Rock, Star) will use the object it returns)

//  I chose not to include the x and y properties here because
//  they often get reset with random values in the object constructors.

var Entity = function(sprite) {
  this.sprite = sprite;
};


/* Enemy */


// Function to create new instances of Enemy object.

var Enemy = function(sprite) {

  Entity.call(this, sprite);

  // enemies will be in row 2, 3, or 4.
  // select one randomly.
  var rowPos = getRandomInt(1, 4);
  this.y = rowPos * ROW_Y - Y_OFFSET;

  // select a random y position to start
  // make half of them negative.
  var colPos = getRandomInt(1, Y_MAX);
  if (colPos % 2 === 0) {
    colPos *= -1;
  }
  this.x = colPos;

  // select random speed multiplier: 1, 2, 3, or 4.
  this.speed = getRandomInt(1, 5);
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;


Enemy.prototype.update = function(dt) {

  // update x position by enemies speed factor, the dt, and a constant of 150.
  this.x += dt * this.speed * SPEED_MUL;

  // return enemy to start of range when it gets close to the top of the Y_MAX.
  if (this.x >= Y_MAX - 10) {
    this.x *= -1;
  }

  // if the enemy enters same square as player, reset the player position.
  // also sets count of stars back to 0.
  if ((this.x >= player.x && this.x <= player.x + COL_X) && this.y === player.y) {
    player.reset();
    star.reset();
  }
};

Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Player */


// Function to create new instances of Player object.

var Player = function(sprite) {

  Entity.call(this, sprite);

  // Note that player's initial position is set by player.reset() below.
  // This happens immediately after instantiation.
  // This keeps initial positioning values in one single location.
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {

  // If player has reached 1st row, reset its position to 6th row.
  // Also reset location of rock.
  // Also add star to top row or move it over one position to right.
  if (this.y === -Y_OFFSET) {
    this.reset();
    rock.reset();
    star.addStar();
  }
};

Player.prototype.handleInput = function(key) {

  // Don't allow player to move off the game board to the right, left, or bottom.
  // Don't allow player to move into a square with a rock.
  // Do allow player to reach the 1st row with water.
  // Next update will reset player to 6th row very quickly.
  // Possible x and y positions for player are detailed in comments at top.

  // Here is the logic of the first if statement, written out as an example:

  // If left key is hit and the player is not in the first column (where x is 0)
  // and it is NOT true that
  //   a. the rock is in the column to the left of the player
  //   AND
  //   b. that the rock is not on the same row as the player,
  // THEN it is safe to move to the column to the left.

  if (key === 'left' && this.x !== 0 && !(rock.x === this.x - COL_X && rock.y === this.y)) {
    this.x -= COL_X;
  }
  if (key === 'right' && this.x !== COL_X * 4 && !(rock.x === this.x + COL_X && rock.y === this.y)) {
    this.x += COL_X;
  }
  if (key === 'up' && this.y !== -Y_OFFSET && !(rock.y === this.y - ROW_Y && rock.x === this.x)) {
    this.y -= ROW_Y;
  }
  if (key === 'down' && this.y !== ROW_Y - Y_OFFSET && !(rock.y === this.y + ROW_Y && rock.x === this.x)) {
    this.y += ROW_Y;
  }
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset moves player back to 6th row and 3rd column.
// Also picks another player icon, at random.

Player.prototype.reset = function() {
  this.x = COL_X * 2;
  this.y = ROW_Y * 5 - Y_OFFSET;
  var charArr = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
  ];
  var charNum = getRandomInt(0, 5);
  this.sprite = charArr[charNum];
};


/* Rock */


// Function to create new instances of Rock object.

var Rock = function(sprite) {
  Entity.call(this, sprite);
};
Rock.prototype = Object.create(Entity.prototype);
Rock.prototype.constructor = Rock;

// Reset picks new random location for rock.
Rock.prototype.reset = function() {
  var colNum = getRandomInt(0, 5); // will correspond to column 1 through 5
  var rowNum = getRandomInt(0, 3); // will correspond to row 2 through 4
  this.x = colNum * COL_X;
  this.y = ROW_Y - Y_OFFSET + (rowNum * ROW_Y);
};

Rock.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Star */


// Function to create new instances of Star object.

var Star = function(sprite) {
  Entity.call(this, sprite);
  this.numStars = 0;
};
Star.prototype = Object.create(Entity.prototype);
Star.prototype.constructor = Star;

Star.prototype.addStar = function() {
  this.numStars++;
};

// First star will be at x = 0, then x = COL_X), etc..
Star.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), (this.numStars * COL_X) - COL_X, 0);
};

Star.prototype.reset = function() {
  this.numStars = 0;
};


/*  Instantiate New Objects */


// Instantiate multiple enemy objects.
var allEnemies = [];
for (var i = 0; i < 5; i++) {
  allEnemies.push(new Enemy('images/enemy-bug.png'));
}

// Instantiate one player object.
// Set initial location with reset method.
var player = new Player('images/char-boy.png');
player.reset();

// Instantiate one rock object.
// Set initial location with reset method.
var rock = new Rock('images/Rock.png');
rock.reset();

// Instantiate one star object.
// No stars appear til player hits top row for first time.
var star = new Star('images/Star.png');


// This listens for key presses and sends the keys to your
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
