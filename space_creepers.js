var projectileCount = 0;
var spaceshipCenterX = 0;
var spaceshipCenterY = 0;
var mouseX = 0;
var mouseY = 0;
var radians = 0;
var degrees = 0;
var enemies = [];
var score = 0;
var enemyCount = 1;
var shieldsUp = false;

function enemy(ID) {
	this.ID = ID
}

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
		var projectile = "projectile" + projectileCount;
		var projectileID = "#" + projectile;
		$('#game').append('<div class="projectile" id="' + projectile + '"></div>');
		var projectileRise = (425 * Math.cos(radians)) + 290;
		var projectileRun = (425 * Math.sin(radians)) + 290;
		var projectileDestroyed = false;

		moveProjectile(projectileID, projectileRise, projectileRun, projectileDestroyed);
		projectileCount += 1;
	}

	// Spawn new enemies
	setInterval(function(){
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
		$('#game').append('<div class="enemy" id="enemy' + enemyCount + '"></div>');	
		$('#enemy' + enemyCount + '').css("left","" + enemyLeft + "px");
		$('#enemy' + enemyCount + '').css("top","" + enemyTop + "px");
		enemies.push(new enemy("#enemy" + enemyCount + ""));
		enemyMove("#enemy" + enemyCount + "");
		enemyCount += 1;
	},5000);
}

// Update html for score
function displayScore(){
	$('#score_bar_back').html("<h1>Score: " + score + "</h1>");
}

// Move projectile
function moveProjectile(projectileID, projectileRise, projectileRun, projectileDestroyed){
	$(projectileID).animate({left: "" + projectileRun + "px", top: "" + projectileRise + "px"}, {duration: 1000, step: function(now,fx){
		// Check if the projectile hit an enemy	
		if ((!projectileHit) && (projectileDestroyed === false)) {
			for (count in enemies){
				var projectileHit = false;
				projectileHit = projectileEnemyCollision(projectileID, enemies[count]);
				if (projectileHit){
					destroy(enemies[count].ID);
					enemies.splice([count],1);
					score += 1;
					displayScore();
				}
			}
		}

		// Check if the projectile is out of bounds
		if (outOfBounds(projectileID)){ 
			destroy(projectileID);
			projectileDestroyed = true;
		}
	}});
}

// Check if projectile hit enemy
function projectileEnemyCollision(projectileID, enemy) {
	var projectileX = $(projectileID).position().left;	
	var projectileY = $(projectileID).position().top;	
	var enemyLowerBoundX = $(enemy.ID).position().left;
	var enemyUpperBoundX = enemyLowerBoundX + 50;
	var enemyLowerBoundY = $(enemy.ID).position().top;
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
	if ((IDLeft <= 10) || (IDLeft >= 585) || (IDTop <= 0) || (IDTop >= 580)){
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
	$(enemy).animate({ left: "+=" + enemyMoveX + "px", top: "+=" + enemyMoveY + "px" },{duration: 5000, step: function(){
		var spaceshipHit = false;
		spaceshipHit = spaceshipCollision(enemy);

		if (spaceshipHit === "hit"){
			destroy(enemy);
			for (count in enemies){
				if (enemies[count].ID === enemy){
					enemies.splice(count,1);
				}
			}
			$('#health_bar').css("width","-=10");
		}
		else if (spaceshipHit === "shield_block"){
			destroy(enemy);
			for (count in enemies){
				if (enemies[count].ID === enemy){
					enemies.splice(count,1);
				}
			}
			score += 1;
			displayScore();
		}
	}});	
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
