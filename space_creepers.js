var gameEnd = false;
var spawnRate = 1;
var spawnInterval = null;
var gameTimer = null;
var hitObjects = [];
var shieldChargerNumber = 0;
var projectileNumber = 0;
var enemyNumber = 0;
var enemies = [];
var projectiles = [];
var spaceshipCenterX = 0;
var spaceshipCenterY = 0;
var mouseX = 0;
var mouseY = 0;
var radians = 0;
var degrees = 0;
var score = 0;
var health = 180;
var shieldsUp = false;

$(document).ready(setupGame);

function setupGame(){
	displayScore();
	$('#shield').hide();
	playGame();
}

function playGame(){
	// Control rotation of spaceship with cursor position
	$(document).mousemove(function(evt){
		spaceshipCenterX = $('#space_ship').offset().left + 25;
		spaceshipCenterY = $('#space_ship').offset().top + 25;
		mouseX = evt.pageX;
		mouseY = evt.pageY;
		radians = Math.atan2(mouseX - spaceshipCenterX, mouseY - spaceshipCenterY);
		degrees = (radians * (180 / Math.PI) * -1) + 90;
		$('#space_ship').css('-moz-transform', 'rotate(' + degrees + 'deg)');
		$('#space_ship').css('-webkit-transform', 'rotate(' + degrees + 'deg)');
		$('#space_ship').css('-o-transform', 'rotate(' + degrees + 'deg)');
		$('#space_ship').css('-ms-transform', 'rotate(' + degrees + 'deg)');
	});


	// Toggle shield with spacebar
	$(document).keydown(function(evt) {
		if (evt.keyCode === 32) {
			if($('#shield_bar').width() === 0){ 
				$('#shield').hide();
				shieldsUp = false;
			}
			else {
				$('#shield').show();
				$('#shield_bar').css('width','-=1px');
				shieldsUp = true;
			}
		}
	});
	$(document).keyup(function(evt) {
		if (evt.keyCode === 32) {
			$('#shield').hide();
			shieldsUp = false;
		}
	});

	// Shoot projectiles with mouse click
	$(document).click(shootProjectile);
	function shootProjectile() {
		var projectile = "projectile" + projectileNumber;
		var projectileID = "#" + projectile;
		var projectileRise = (425 * Math.cos(radians)) + 290;
		var projectileRun = (425 * Math.sin(radians)) + 290;
		var projectileDestroyed = false;
		if (!gameEnd){
			$('#game').append('<div class="projectile" id="' + projectile + '"></div>');
		}
		projectiles.push(projectileID);
		moveProjectile(projectileID, projectileRise, projectileRun, projectileDestroyed);
		projectileNumber += 1;
	}

	// Spawn a certain number of enemies every second
	spawnInterval = setInterval(function(){
		for (var i = 0; i < spawnRate; i++){
			var enemyLeft = 0;
			var enemyTop = 0;
			var locations = ["top","right","bottom","left"];
			var thisLocation = locations[Math.floor(Math.random()*locations.length)];
			if (thisLocation === "top"){
				enemyLeft = Math.floor(Math.random()*550);
				enemyTop = 0;
			}
			else if (thisLocation === "right"){
				enemyLeft = 550;
				enemyTop = Math.floor(Math.random()*550);
			}
			else if (thisLocation === "bottom"){
				enemyLeft = Math.floor(Math.random()*550);
				enemyTop = 550;	
			}
			else if (thisLocation === "left"){
				enemyLeft = 0;
				enemyTop = Math.floor(Math.random()*550);
			}
			$('#game').append('<div class="enemy" id="enemy' + enemyNumber + '"></div>');	
			$('#enemy' + enemyNumber + '').css("left","" + enemyLeft + "px");
			$('#enemy' + enemyNumber + '').css("top","" + enemyTop + "px");
			enemies.push("#enemy" + enemyNumber + "");
			enemyMove("#enemy" + enemyNumber + "");
			enemyNumber += 1;
		}
		spawnRate = Math.floor(Math.random() * (score / 50)) + 1;
	},100000); // Changed from 1000

	// Have a chance of spawing a shield charger every second
	shieldChargerInterval = setInterval(function(){
		var chance = Math.floor(Math.random() * 30);

		var shieldChargerLeft = 0;
		var shieldChargerTop = 0;
		var leftOffset = 0;
		var topOffset = 0;
		var areas = ["top","right","bottom","left"];
		var thisArea = areas[Math.floor(Math.random() * areas.length)];

		// direction 0 means left or down, 1 means up or right depending on the context
		var direction = Math.floor(Math.random() * 2);
		if (thisArea === "top"){
			if (direction === 0){
				shieldChargerLeft = 550;
				shieldChargerTop = Math.floor(Math.random() * 200);			
				leftOffset = -550;	
			}
			else if (direction === 1){
				shieldChargerLeft = 0;
				shieldChargerTop = Math.floor(Math.random() * 200);	
				leftOffset = 550;
			}	
		}
		else if (thisArea === "right"){
			if (direction === 0){
				shieldChargerLeft = Math.floor(Math.random() * 200) + 350;	
				shieldChargerTop = 0;
				topOffset = 550;
			}
			else if (direction === 1){
				shieldChargerLeft = Math.floor(Math.random() * 200) + 350;
				shieldChargerTop = 550;
				topOffset = -550;
			}
		}
		else if (thisArea === "bottom"){
			if (direction === 0){
				shieldChargerLeft = 550;
				shieldChargerTop = Math.floor(Math.random() * 200) + 350;
				leftOffset = -550;
			}
			else if (direction === 1){
				shieldChargerLeft = 0;
				shieldChargerTop = Math.floor(Math.random() * 200) + 350;
				leftOffset = 550;
			}
		}
		else if (thisArea === "left"){
			if (direction === 0){
				shieldChargerLeft = Math.floor(Math.random() * 200);
				shieldChargerTop = 0; 
				topOffset = 550;
			}
			else if (direction === 1){
				shieldChargerLeft = Math.floor(Math.random() * 200);
				shieldChargerTop = 550;
				topOffset = -550;
			}
		}		
		
		createShieldCharger(shieldChargerLeft, shieldChargerTop);
		moveShieldCharger(leftOffset, topOffset);
	},1);

	// Check for any collisions
	gameTimer = setInterval(function(){
		displayScore();
		// Check for enemy/projectile collision
		for (var i = 0; i < projectiles.length; i++){
			for (var j = 0; j < enemies.length; j++){
				var hit = projectileEnemyCollision(projectiles[i],enemies[j]);
				if (hit){
					score += 1;
					if (hitObjects.indexOf(projectiles[i]) === -1){
						hitObjects.push(projectiles[i]);
					}
					if (hitObjects.indexOf(enemies[j]) === -1){
						hitObjects.push(enemies[j]);
					}
				}
			}
		}
	
		// Check for enemies that hit spaceship
		for (var i = 0; i < enemies.length; i++){
			var hit = spaceshipCollision(enemies[i]);
			if (hit === "hit"){
				if (hitObjects.indexOf(enemies[i]) === -1){
					hitObjects.push(enemies[i]);
				}
				$('#health_bar').css("width","-=10");
				health -= 10;
			}
			else if (hit === "shield_block"){
				if (hitObjects.indexOf(enemies[i]) === -1){
					hitObjects.push(enemies[i]);
				}
				score += 1;
			}
		}
		// Check for out of bounds projectiles
		for (var i = 0; i < projectiles.length; i++){
			var hit = outOfBounds(projectiles[i]);
			if (hit){
				if (hitObjects.indexOf(projectiles[i]) === -1){
					hitObjects.push(projectiles[i]);
				}
			}
		}

		// Destroy hit objects
		for (var i = 0; i < hitObjects.length; i++){
			destroy(hitObjects[i]);
			var enemyIndex = enemies.indexOf(hitObjects[i]);
			var projectileIndex = projectiles.indexOf(hitObjects[i]);
			if (enemyIndex > -1){
				enemies.splice(enemyIndex,1);
			}
			if (projectileIndex > -1){
				projectiles.splice(projectileIndex,1);
			}
		}
	
		// Empty the hitObjects array
		while (hitObjects.length > 0){
			hitObjects.pop();
		}

		if (health <= 0){
			gameOver();
		}
	}, 12);
}

// Clear game and display game over message
function gameOver(){
	gameEnd = true;
	clearInterval(spawnInterval);
	$('#space_ship').remove();
	$('.projectile').remove();
	$('.enemy').remove();	
	$('#game').append('<div id="game_over_message"><h1>GAME OVER</h1></div>');
	$('#game_over_message').append('<div id="restart_button"><b>RESTART?</b></div>');
	$('#restart_button').click(function(){
		location.reload();
	});
}

// Update html for score
function displayScore(){
	$('#score_bar_back').html("<h1>Score: " + score + "</h1>");
}

// Create a shield charger
function createShieldCharger(leftPosition, topPosition){
	$('#game').append('<div class ="shield_charger" id="shield_charger' + shieldChargerNumber + '"></div>');
	$('#shield_charger' + shieldChargerNumber + '').css("left", "" + leftPosition + "px");
	$('#shield_charger' + shieldChargerNumber + '').css("top", "" + topPosition + "px");
	shieldChargerNumber += 1;
}

// Move projectile
function moveProjectile(projectileID, projectileRise, projectileRun, projectileDestroyed){
	$(projectileID).animate({left: "" + projectileRun + "px", top: "" + projectileRise + "px"}, 1000);
}

// Check if projectile hit enemy
function projectileEnemyCollision(projectileID, enemyID) {
	var projectileX = $(projectileID).position().left + 10;	
	var projectileY = $(projectileID).position().top + 10;	
	var enemyLowerBoundX = $(enemyID).position().left;
	var enemyUpperBoundX = enemyLowerBoundX + 50;
	var enemyLowerBoundY = $(enemyID).position().top;
	var enemyUpperBoundY = enemyLowerBoundY + 50;
	
	if (((projectileX >= enemyLowerBoundX) && (projectileX <= enemyUpperBoundX)) && ((projectileY >= enemyLowerBoundY) && (projectileY <= enemyUpperBoundY))){
		return true;
	}
	return false;
}

// Detect if object is out of game area
function outOfBounds(ID){
	IDLeft = $(ID).position().left;
	IDTop = $(ID).position().top; 
	if ((IDLeft <= 10) || (IDLeft >= 580) || (IDTop <= 0) || (IDTop >= 580)){
		return true;
	}
	return false;	
}

// Destroy 
function destroy(ID) {
	$(ID).finish();
	$(ID).remove();
}

// Move enemy toward spaceship
function enemyMove(enemy) {
	enemyMoveX = -$(enemy).position().left + 275;
	enemyMoveY = -$(enemy).position().top + 275;
	$(enemy).animate({ left: "+=" + enemyMoveX + "px", top: "+=" + enemyMoveY + "px" },10000);
}

// Check if enemy hit spaceship
function spaceshipCollision(enemy) {
	enemyCenterX = $(enemy).position().left + 25;
	enemyCenterY = $(enemy).position().top + 25;

	if (((enemyCenterX >= 250) && (enemyCenterX <= 350)) && ((enemyCenterY >= 250) && (enemyCenterY <= 350))) {
		if (shieldsUp) {
			return "shield_block";
		}
		else {
			return "hit";
		}
	}	
	return "no_hit";
}
