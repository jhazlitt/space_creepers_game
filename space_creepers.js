$(document).ready(function() {
	var projectileCount = 0;
	var spaceshipCenterX = 0;
	var spaceshipCenterY = 0;
	var mouseX = 0;
	var mouseY = 0;
	var radians = 0;
	var degrees = 0;
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
	$(document).click(function() {
		var projectile = "projectile" + projectileCount;
		var projectileID = "#" + projectile;
		$('#game').append('<div class="projectile" id="' + projectile + '"></div>');
		var projectileRise = (425 * Math.cos(radians)) + 290;
		var projectileRun = (425 * Math.sin(radians)) + 290;

		$(projectileID).animate({left: "" + projectileRun + "px", top: "" + projectileRise + "px"}, {step: function(now,fx){
			var projectileLeft = $(projectileID).position().left;	
			var projectileTop = $(projectileID).position().top;	
			if ((projectileLeft <= 10) || (projectileLeft >= 590) || (projectileTop <= 0) || (projectileTop >= 590)){
				$(projectileID).stop();
				$(projectileID).hide();
			}
		}}, 1000);
		projectileCount += 1;
	});

	// Move projectiles
});
