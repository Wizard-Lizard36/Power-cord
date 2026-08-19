/**
* Title: Crushing Cubes
* Author: Max Bartle
* Date: Terms 1-2 2026
* Version: 1.1
* Purpose: Be a good game
**/

console.log("Main Game")


// Canvas width and height
const WIDTH = 900
const HEIGHT = 750

const PLAYERWIDTH = 50
const PLAYERHEIGHT = 50

// Collision variables
const COLLISIONMARGIN = 10
var wallMargin = 4


// Obstacle constants
const OBSTACLEWIDTH = 200
const OBSTACLEHEIGHT = 200
const OBSTACLECOUNT = 4


const PLAYERSPEED = 2
// Upgrade dividers
const UPGRADEEXTRASPEEDDIVIDER = 10
const UPGRADEOBSTACLESLOWDIVIDER = 10
const UPGRADEOBSTACLESIZEDIVIDER = 0.2

// The canvas
var ctx




// Player variables
var playerStartPositionX = 0
var playerStartPositionY = 0
var playerXPosition = playerStartPositionX
var playerYPosition = playerStartPositionY
var upPressed = false
var downPressed = false
var leftPressed = false
var rightPressed = false

var firstStart = true
var restartable = false
var paused = false

// Points variables
var points = 0
var POINTSSIZE = 20
var POINTSCOLOUR = "green"
var POINTSPOSITIONX = 5
var POINTSPOSITIONY = 20

// Mouse position
var mouseX = 0
var mouseY = 0


//Canvas starting
window.onload=startCanvas

//Button constants
const BUTTONWIDTH = 340
const BUTTONHEIGHT = 100
const BUTTONPOSX = WIDTH/2 - BUTTONWIDTH/2
const BUTTONPOSY = HEIGHT/2 - BUTTONHEIGHT/2

// Starting speed
var obstacleSpeedX = Math.round(Math.min(Math.max(Math.random() * 2, 0.5), 1.5) * 10) / 10
var obstacleSpeedY = Math.round(Math.min(Math.max(Math.random() * 2, 0.5), 1.5) * 10) / 10

// When the game first starts
function startCanvas(){

	ctx = document.getElementById("myCanvas").getContext("2d")

	// Add "Dodge the obstacles!" to the start screen
	ctx.font = "70px arial"
	ctx.fillStyle = "green"
	ctx.fillText("Dodge the obstacles!", 50, 100)

	// Sets the player start position to the middle of the screen
	playerStartPositionX = (WIDTH / 2 - PLAYERWIDTH / 2) + playerStartPositionX
	playerStartPositionY = (HEIGHT / 2 - PLAYERHEIGHT / 2) + playerStartPositionY

	playerXPosition = playerStartPositionX
	playerYPosition = playerStartPositionY

	// 50-50 chance to make the obstacle speed negative
	obstacleSpeedX *= Math.random() < 0.5 ? 1 : -1
	obstacleSpeedY *= Math.random() < 0.5 ? 1 : -1

	// Finds a valid position for each obstacle and adds it to the obstacles array
	for (let i = 0; i < OBSTACLECOUNT; i++){
		console.log("Finding position for obstacle " + i)
		let position = findValidObstaclePosition(OBSTACLEWIDTH, OBSTACLEHEIGHT)

		if (position){
			console.log("Found valid position for obstacle " + i + ": " + position.x + ", " + position.y)
			console.log(obstacleSpeedX + ", ", obstacleSpeedY)
			obstacles.push(new obstacle(position.x, position.y, OBSTACLEWIDTH, OBSTACLEHEIGHT, obstacleSpeedX, obstacleSpeedY))
		}
	}

	let textOffsetX = 60
	let textOffsetY = 15

	// Adds the start button
	ctx.fillStyle = "darkorange"
	ctx.fillRect(BUTTONPOSX, BUTTONPOSY, BUTTONWIDTH, BUTTONHEIGHT)
	ctx.fillStyle = "white"
	ctx.font = "100px arial"
	ctx.fillText("Start", BUTTONPOSX + textOffsetX, (BUTTONPOSY + BUTTONHEIGHT) - textOffsetY, BUTTONWIDTH)
}

// Finds a valid position for an obstacle
function findValidObstaclePosition(width, height){
	while(true){
		let valid = true
		let X = Math.random() * (WIDTH - width)
		let Y = Math.random() * (HEIGHT - height)
		for (let i = 0; i < obstacles.length; i++){
			if (collision(X, Y, width, height, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height)){
				valid = false
			}
		}
		if (collision(X, Y, width, height, playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT)){
			valid = false
		}
		if (valid){
			return { x: X, y: Y }
		}
	}
}

window.addEventListener('mousedown', checkButton)

var started = false
var continueable = false
var upgradesOpen = false
// This checks for different buttons inputs. Pretty bad practice for a long term solution as I should have added a function to make buttons but at this point there is no point.
function checkButton(override = false){
	if (collision(mouseX, mouseY, 1, 1, BUTTONPOSX, BUTTONPOSY, BUTTONWIDTH, BUTTONHEIGHT) || override == true){
		if (!started){
			console.log("Started")
			started = true
			start()
		}
	}if(collision(mouseX, mouseY, 1, 1, retryButtonX, retryButtonY, BUTTONWIDTH + 50, BUTTONHEIGHT)){
		if (restartable){
			console.log("Restarted")
			start()
		}
	}if(collision(mouseX, mouseY, 1, 1, retryButtonX, upgradesButtonY, BUTTONWIDTH + 50, BUTTONHEIGHT)){
		if (restartable && !upgradesOpen){
			upgradesOpen = true
			console.log("UpgradesOpen")
			openUpgrades()
		}
	}
	if(collision(mouseX, mouseY, 1, 1, continueButtonX, continueButtonY, deathButtonsWidth, BUTTONHEIGHT + 10)){
		if (continueable && upgradesOpen){
			upgradesOpen = false
			console.log("Continued")
			start()
			continueable = false
		}
	}
	for (let i = 0; i < upgradeArray.length; i++){
		if (collision(upgradeXArray[i], upgradeYArray[i], UPGRADEBUTTONWIDTH, UPGRADEBUTTONHEIGHT, mouseX, mouseY, 1, 1)){
			if (upgradesOpen){
				upgradeArray[i].clicked()
			}
		}
	}	
}

window.addEventListener('mousemove', checkMousePos)

// Updates the mouse position
function checkMousePos(mouseEvent){
	mouseX = mouseEvent.x
	mouseY = mouseEvent.y
}

// Called every time when you press the start, restart or continue buttons
function start(){

	paused = false
	restartable = false


	if (firstStart){
		timer = setInterval(updateCanvas, 5)
	}

	//Resets the starting obstacle speed
	obstacleSpeedX = (Math.round(Math.min(Math.max(Math.random() * 2, 0.5), 1.5) * 10) / 10) / ((getUpgradeValue("ObstacleSlow", 0) / UPGRADEOBSTACLESLOWDIVIDER) + 1)
	obstacleSpeedY = (Math.round(Math.min(Math.max(Math.random() * 2, 0.5), 1.5) * 10) / 10) / ((getUpgradeValue("ObstacleSlow", 0) / UPGRADEOBSTACLESLOWDIVIDER) + 1)

	
	// Checks for collisions between the player and obstacles, and if there is one, it finds a new position for the obstacle.
	for (let i = 0; i < obstacles.length; i++){
		let thisObstacle = obstacles[i]

		thisObstacle.width = Math.max(OBSTACLEWIDTH - getUpgradeValue("ObstacleSize", 0) / UPGRADEOBSTACLESIZEDIVIDER, 10)
		thisObstacle.height = Math.max(OBSTACLEHEIGHT - getUpgradeValue("ObstacleSize", 0) / UPGRADEOBSTACLESIZEDIVIDER, 10)

		thisObstacle.XSpeed = obstacleSpeedX
		thisObstacle.YSpeed = obstacleSpeedY
		console.log(thisObstacle.X + ", " + thisObstacle.Y + ", " + thisObstacle.width + ", " + thisObstacle.height + ", " + playerStartPositionX + ", " + playerStartPositionY + ", " + PLAYERWIDTH + ", " + PLAYERHEIGHT)
		if (collision(thisObstacle.X, thisObstacle.Y, thisObstacle.width, thisObstacle.height, playerStartPositionX, playerStartPositionY, PLAYERWIDTH, PLAYERHEIGHT) || thisObstacle.checkForCollision()[0] != false){
			let obstacleWidth = thisObstacle.width
			let obstacleHeight = thisObstacle.height
			obstacles.splice(obstacles.indexOf(thisObstacle), 1)
			let position = findValidObstaclePosition(obstacleWidth, obstacleHeight)

			if (position){
				obstacles.push(new obstacle(position.x, position.y, obstacleWidth, obstacleHeight, obstacleSpeedX, obstacleSpeedY))
			}
		}
	}
	
	// Resets the player position
	playerXPosition = playerStartPositionX
	playerYPosition = playerStartPositionY

	firstStart = false
}

// Updates the canvas multiple times a second
function updateCanvas(){

	// Stops updates if the game is paused
	if (paused){
		return
	}

	// Deletes previous frame
	ctx.fillStyle="white"
	ctx.fillRect(0,0,WIDTH, HEIGHT)

	// Adds points over time, and makes sure it's a float so it can be added to
	points = parseFloat(points)
	points += 0.02


	// Moves the player
	movePlayer()


	// Updates the obstacles if the game isn't paused
	for (let i = 0; i < obstacles.length; i++){
		if (!paused){
			obstacles[i].update()
		}
	}
	// Kills the player if they are squashed by the wall and an obstacle
	if (wallSquash()){
		die()
	}



	// Draw points text, e.g. "Points: 50" in the top left
	ctx.font = POINTSSIZE + "px arial"
	ctx.fillStyle = POINTSCOLOUR
	ctx.fillText("Points: " + Math.floor(points), POINTSPOSITIONX, POINTSPOSITIONY)

	if (paused){
		return
	}
	
	// Draw the player if the game isn't paused
	ctx.fillStyle="blue"
	ctx.fillRect(playerXPosition,playerYPosition,PLAYERWIDTH,PLAYERHEIGHT)
}

// Like collisionSide but only checks for a collision, not it's side.
function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
	if (x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2) {
		return true;
	} else {
		return false;
	}
}

// Opens the upgrades menu
var firstTime = true
function openUpgrades(){
	restartable = false
	continueable = true
	ctx.fillStyle = "white"
	ctx.fillRect(0,0,WIDTH,HEIGHT)
	buildUpgradesRetryButton()

	for (let i = 0; i < upgradeArray.length; i++){
		upgradeArray[i].update()
	}

	// Creates the upgrades if it's the first time opening the upgrades menu
	if (firstTime){
		setUpgradeValue("Speed", 0)
		buildUpgrade("Speed", 50, 1.3, "Speed")
		setUpgradeValue("ObstacleSlow", 0)
		buildUpgrade("Obstacle Slow", 50, 1.3, "ObstacleSlow")
		setUpgradeValue("ObstacleSize", 0)
		buildUpgrade("Obstacle Size", 50, 1.3, "ObstacleSize")
	}
	firstTime = false
}

// Like collision but checks it's side using the COLLISIONMARGIN
function collisionSide(x1, y1, w1, h1, x2, y2, w2, h2) {
	if (x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2) {
		if(x1 + w1 - COLLISIONMARGIN < x2){
			return "right"
		}
		else if(x1 + COLLISIONMARGIN > x2 + w2){
			return "left"
		}
		else if(y1 + h1 - COLLISIONMARGIN < y2){
			return "bottom"
		}
		else{
			return "top"
		}
	} else {
		return false;
	}
}




// Move the player if any movement keys are being pressed
function movePlayer(){
	if(upPressed){
		if (playerYPosition > 0){
			let collided = false
			for (let i = 0; i < obstacles.length; i++){
				if (collisionSide(playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height) == "top"){
					collided = true
					break
				}
			}
			if (!collided){
				playerYPosition -= PLAYERSPEED + getUpgradeValue("Speed", 0) / UPGRADEEXTRASPEEDDIVIDER
			}
		}
	}
	if(leftPressed){
		if (playerXPosition > 0){
			let collided = false
			for (let i = 0; i < obstacles.length; i++){
				if (collisionSide(playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height) == "left"){
					collided = true
					break
				}
			}
			if (!collided){
				playerXPosition -= PLAYERSPEED + getUpgradeValue("Speed", 0) / UPGRADEEXTRASPEEDDIVIDER
			}
		}
	}
	if(downPressed){
		if (playerYPosition < HEIGHT - PLAYERHEIGHT){
			let collided = false
			for (let i = 0; i < obstacles.length; i++){
				if (collisionSide(playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height) == "bottom"){
					collided = true
					break
				}
			}
			if (!collided){
				playerYPosition += PLAYERSPEED + getUpgradeValue("Speed", 0) / UPGRADEEXTRASPEEDDIVIDER
			}
		}
	}
	if(rightPressed){
		if (playerXPosition < WIDTH - PLAYERWIDTH){
			let collided = false
			for (let i = 0; i < obstacles.length; i++){
				if (collisionSide(playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height) == "right"){
					collided = true
					break
				}
			}
			if (!collided){
				playerXPosition += PLAYERSPEED + getUpgradeValue("Speed", 0) / UPGRADEEXTRASPEEDDIVIDER
			}
		}
	}
}


// Listens for key presses and calls the keyDownFunction when a key is pressed
window.addEventListener('keydown', keyDownFunction)

function keyDownFunction(keyboardEvent){
	// Remember if the movement keys are being pressed
	var keyDown = keyboardEvent.key.toLowerCase()
	if (keyDown=="w" || keyDown=="arrowup"){
		upPressed = true
	}
	if (keyDown=="a" || keyDown=="arrowleft"){
		leftPressed = true
	}	
	if (keyDown=="s" || keyDown=="arrowdown"){
		downPressed = true
	}
	if (keyDown=="d" || keyDown=="arrowright"){
		rightPressed = true
	}
	if (keyDown == "enter"){
		checkButton(true)
	}
}

// Listens for key releases and calls the keyUpFunction when a key is released
window.addEventListener('keyup', keyUpFunction)

function keyUpFunction(keyboardEvent){
	// Forget movement keys when they are released
	var keyUp = keyboardEvent.key.toLowerCase()
	if (keyUp=="w" || keyUp=="arrowup"){
		upPressed = false
	}
	if (keyUp=="a" || keyUp=="arrowleft"){
		leftPressed = false
	}	
	if (keyUp=="s" || keyUp=="arrowdown"){
		downPressed = false
	}
	if (keyUp=="d" || keyUp=="arrowright"){
		rightPressed = false
	}
}

// Checks if the player is squashed by the wall and an obstacle
function wallSquash(){
	var count = 0
	if (playerYPosition < -wallMargin){
		count ++
	}
	if (playerXPosition < -wallMargin){
		count ++
	}
	if (playerYPosition > wallMargin + HEIGHT - (PLAYERHEIGHT)){
		count ++
	}
	if (playerXPosition > wallMargin + WIDTH - (PLAYERWIDTH)){
		count ++
	}
	if(count > 0){
		return(true)
	}
}

// Kills the player and builds the retry and upgrades buttons
function die(){
	playerXPosition = playerStartPositionX
	playerYPosition = playerStartPositionY
	start()
	paused = true
	ctx.fillStyle="white"
	ctx.fillRect(0,0,WIDTH, HEIGHT)
	buildRetryButton()
}

let deathButtonsWidth = BUTTONWIDTH + 40

let retryButtonX = BUTTONPOSX - 40
let retryButtonY = BUTTONPOSY - 50

// Builds the retry button and the upgrades button
function buildRetryButton(){
	restartable = true
	let textOffsetX = 25
	let textOffsetY = 15

	ctx.fillStyle = "darkorange"
	ctx.fillRect(retryButtonX, retryButtonY, deathButtonsWidth, BUTTONHEIGHT)
	ctx.fillStyle = "white"
	ctx.font = "100px arial"
	ctx.fillText("Restart", retryButtonX + textOffsetX, (retryButtonY + BUTTONHEIGHT) - textOffsetY, deathButtonsWidth)
	buildUpgradesButton()
}

let upgradesButtonY = BUTTONPOSY + 60

// Builds the upgrades button
// I reuse a bunch of variables because... I'm lazy. Also they are the same size and position so it makes sense to reuse them.
function buildUpgradesButton(){
	let textOffsetX = 0
	let textOffsetY = 15


	ctx.fillStyle = "darkorange"
	ctx.fillRect(retryButtonX, upgradesButtonY, deathButtonsWidth, BUTTONHEIGHT + 10)
	ctx.fillStyle = "white"
	ctx.font = "100px arial"
	ctx.fillText("Upgrades", retryButtonX + textOffsetX, (BUTTONPOSY + 60 + BUTTONHEIGHT) - textOffsetY, deathButtonsWidth)
}

var continueButtonY = 600
var continueButtonX = WIDTH - 400

// Builds the continue button for the upgrades menu
function buildUpgradesRetryButton(){
	let textOffsetX = 0
	let textOffsetY = 90

	ctx.fillStyle = "darkorange"
	ctx.fillRect(continueButtonX, continueButtonY, deathButtonsWidth, BUTTONHEIGHT + 10)
	ctx.fillStyle = "white"
	ctx.font = "100px arial"
	ctx.fillText("Continue", continueButtonX + textOffsetX, continueButtonY + textOffsetY, deathButtonsWidth)
}



const UPGRADEBUTTONWIDTH = 300
const UPGRADEBUTTONHEIGHT = 130
var upgradeArray = []
var upgradeYArray = []
var upgradeXArray = []
var xOffset = 20
var yOffset = 20

var yResets = 0

var upgradeValues = []

// Custom Dictionary getter. Didn't know about objects when implementing upgrades so created this. It's a bit inefficient but it works.
function getUpgradeValue(key, fail_return){
	for (let i = 0; i < upgradeValues.length; i++){
		if (upgradeValues[i][0] == key){
			return upgradeValues[i][1]
		}
	}
	return fail_return
}

// Setter for the custom Dictionary.
function setUpgradeValue(key, value){
	for (let i = 0; i < upgradeValues.length; i++){
		if (upgradeValues[i][0] == key){
			upgradeValues[i][1] = value
			return
		}
	}
	upgradeValues.push([key, value])
}

// Automatically sets the position and allows upgrades to wrap around on edges
function buildUpgrade(name, cost, multiplier, to_add_to){
	let Y = (upgradeYArray.length > 0 && upgradeYArray.at(-1) + UPGRADEBUTTONHEIGHT * 2 + yOffset < HEIGHT) ? upgradeYArray.at(-1) + yOffset + UPGRADEBUTTONHEIGHT : yOffset
	if (Y == yOffset && upgradeArray.length > 0){
		yResets ++
	}
	let X = xOffset + (yResets * (UPGRADEBUTTONWIDTH + xOffset))
	if (X == 0){
		X = xOffset
	}

	upgradeArray.push(new upgradeButton(X, Y, UPGRADEBUTTONWIDTH, UPGRADEBUTTONHEIGHT, name, cost, multiplier, to_add_to))
}

var upgradeTextOffsetY = 40
var costOffestY = 35
var upgradeTextOffsetX = 10
var font = "30px Arial"

var obstacles = []

// The obstacle class. These are the "Cubes" that the player has to dodge
class obstacle{
	constructor(X, Y, width, height, XSpeed, YSpeed, colour = "darkcyan"){
		this.X = X
		this.Y = Y
		this.width = width
		this.height = height
		this.XSpeed = XSpeed
		this.YSpeed = YSpeed
		this.colour = colour
	}

	// Updates the obstacle's position and checks for collisions with the player and other obstacles
	update(){

		this.X += this.XSpeed
		this.Y += this.YSpeed

		// Bounce at the edges of the canvas
		// When part of the rectangle goes out of the sides, reverse the speed in that direction my making it the negative of itself
		if(this.X < 0 || this.X + this.width > WIDTH){
			this.XSpeed = -this.XSpeed
		}
		if(this.Y < 0 || this.Y + this.height > HEIGHT){
			this.YSpeed = -this.YSpeed
		}

		let collisionResult = this.checkForCollision()
		if (collisionResult[0] == "x"){
			this.XSpeed = -this.XSpeed
			obstacles[collisionResult[1]].XSpeed *= -1
		}
		else if (collisionResult[0] == "y"){
			this.YSpeed = -this.YSpeed
			obstacles[collisionResult[1]].YSpeed *= -1
		}

		if (this.bounce() == "x"){
			playerXPosition += this.XSpeed
		}
		if (this.bounce() == "y"){
			playerYPosition += this.YSpeed
		}

		if (collision(playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT, this.X, this.Y, this.width, this.height)){
			this.colour = "orange"
		} else {
			this.colour = "darkcyan"
		}

		for (let i = 0; i < obstacles.length; i++){
			if (obstacles[i] != this){
				if (this.colour == "orange" && obstacles[i].colour == "orange"){
					if (this.bounce() == "x" && obstacles[i].bounce() == "x"){
						die()
					}else if(this.bounce() == "y" && obstacles[i].bounce() == "y"){
						die()
					}
				}
			}
		}

		if (paused){
			return
		}
		ctx.fillStyle=this.colour
		ctx.fillRect(this.X,this.Y,this.width,this.height)
	}

	// Returns the side of the collision between this obstacle and other obstacles, or false if there is no collision
	checkForCollision(){
		for (let i = 0; i < obstacles.length; i++) {
			if (obstacles[i] != this) {
				if (collision(this.X, this.Y, this.width, this.height, obstacles[i].X, obstacles[i].Y, obstacles[i].width, obstacles[i].height)) {
					if (this.X + this.width - COLLISIONMARGIN < obstacles[i].X || this.X + COLLISIONMARGIN > obstacles[i].X + obstacles[i].width) {
						return ["x", i]
					} else {
						return ["y", i]
					}
				}
			}
		}
		return [false, false]
	}
	// Returns the side of the collision between this obstacle and the player, or false if there is no collision
	bounce(){

		var side = collisionSide(this.X, this.Y, this.width, this.height, playerXPosition, playerYPosition, PLAYERWIDTH, PLAYERHEIGHT)

		if (side == "right" || side == "left"){
			return "x"
		}else if (side == "top" || side == "bottom"){
			return "y"
		}
		return false
	}
}

// The upgrade button class that automatically draw themselves
class upgradeButton{
	constructor(X, Y, width, height, name, cost, multiplier, to_add_to, colour = "green"){

		this.X = X
		this.Y = Y

		upgradeXArray.push(this.X)
		upgradeYArray.push(this.Y)

		this.width = width
		this.height = height
		this.name = name
		this.cost = cost
		this.multiplier = multiplier
		this.to_add_to = to_add_to
		this.colour = colour
		this.update()

	}

	// Updates the upgrade button's text and draws it to the canvas
	update(){
		console.log("updating")
		refreshPointsInUpgrades()
		ctx.fillStyle = this.colour
		ctx.fillRect(this.X, this.Y, this.width, this.height)
		ctx.font = font
		ctx.fillStyle = "black"
		ctx.fillText(this.name, this.X + upgradeTextOffsetX, this.Y + upgradeTextOffsetY, 999)
		ctx.fillText("Level: " + Math.ceil(getUpgradeValue(this.to_add_to, 0)), this.X + upgradeTextOffsetX, this.Y + upgradeTextOffsetY + costOffestY, 999)
		ctx.fillText("Cost: " + Math.ceil(this.cost), this.X + upgradeTextOffsetX, this.Y + upgradeTextOffsetY + costOffestY + costOffestY, 999)
	}

	// Buys the upgrade if possible and updates the button
	clicked(){
		console.log("Upgrade " + this.name + " pressed.")
		if (points >= this.cost){
			points -= this.cost
			setUpgradeValue(this.to_add_to, getUpgradeValue(this.to_add_to, 0) + 1)
			this.cost *= this.multiplier
			console.log(getUpgradeValue(this.to_add_to, "failed"))
			this.update()
		}
	}

}

// Refreshes the points text in the upgrades menu
function refreshPointsInUpgrades(){
	let points_x = WIDTH - 200
	let points_y = 20
	let points_width = 150
	let point_height = 50

	ctx.font = "20px arial"
	ctx.fillStyle = "white"
	ctx.fillRect(points_x, 0, points_width, point_height)
	ctx.fillStyle = "black"
	ctx.fillText("Points: " + Math.floor(points), points_x + 10, points_y + 10, 999)
}
