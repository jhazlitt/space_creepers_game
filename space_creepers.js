$(document).ready(function() {
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

	function enemy(ID) {
		this.ID = ID
	}

	$('#score_bar_back').html("<h1>Score: " + score + "</h1>");
	$('#shield').hide();

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
			}
			else {
				$('#shield').show();
				$('#shield_bar').css('width','-=1px');
			}
		}
	});
	$(document).keyup(function(evt) {
		if (evt.keyCode === 32) {
			$('#shield').hide();
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

		$(projectileID).animate({left: "" + projectileRun + "px", top: "" + projectileRise + "px"}, {step: function(now,fx){
			var projectileLeft = $(projectileID).position().left;	
			var projectileTop = $(projectileID).position().top;	

			// Check if the projectile hit an enemy	
			if ((!hit) && (projectileDestroyed === false)) {
				for (count in enemies){
					var hit = false;
					hit = projectileEnemyCollision(projectileLeft, projectileTop, enemies[count]);
					if (hit){
						enemies.splice([count],1);
					}
				}
			}

			// Check if the projectile is out of bounds
			if ((projectileLeft <= 10) || (projectileLeft >= 590) || (projectileTop <= 0) || (projectileTop >= 590)){
				$(projectileID).hide();
				projectileDestroyed = true;
			}
		}}, 1000);
		projectileCount += 1;
	}

	// Check if projectile hit enemy
	function projectileEnemyCollision(projectileX, projectileY, enemy) {
		enemyLowerBoundX = $(enemy.ID).position().left;
		enemyUpperBoundX = enemyLowerBoundX + 50;
		enemyLowerBoundY = $(enemy.ID).position().top;
		enemyUpperBoundY = enemyLowerBoundY + 50;
		
		if (((projectileX >= enemyLowerBoundX) && (projectileX <= enemyUpperBoundX)) && ((projectileY >= enemyLowerBoundY) && (projectileY <= enemyUpperBoundY))){
			$(enemy.ID).remove();
			score += 1;
			$('#score_bar_back').html("<h1>Score: " + score + "</h1>");
			return true;
		}
		return false;
	}

	// Spawn new enemies
	setInterval(function(){
		$('#game').append('<div class="enemy" id="enemy' + enemyCount + '"></div>');	
		enemies.push(new enemy("#enemy" + enemyCount + ""));
		enemyMove("#enemy" + enemyCount + "");
		enemyCount += 1;
	}, 10000);

	// Move enemy toward spaceship
	function enemyMove(enemy) {
		enemyMoveX = -$(enemy).position().left + 275;
		enemyMoveY = -$(enemy).position().top + 275;
		$(enemy).animate({ left: "+=" + enemyMoveX + "px", top: "+=" + enemyMoveY + "px" }, 30000);	
	}
});
