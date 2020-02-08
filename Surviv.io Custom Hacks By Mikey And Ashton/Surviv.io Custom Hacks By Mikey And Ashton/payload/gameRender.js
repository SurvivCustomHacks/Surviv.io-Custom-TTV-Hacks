window.gameFunctions = window.gameFunctions || {};
window.gameFunctions.gameRender = function(){
	
	if(!window.menu || !window.menu.UserSetting)
		return;
	
	var game = this;
	var targetTexture = window.gameVars.Textures.targetTexture;
	var roundTexture = window.gameVars.Textures.roundTexture;

	if(!targetTexture || !targetTexture.baseTexture ||
		!roundTexture || !roundTexture.baseTexture)
		return;

	var updateObstacleAlpha = function(obstacle) {
		if(!obstacle || !obstacle.img)
			return;
		
		var alpha = 1.0;
		
		var setting = window.menu.UserSetting.look;
		
		if(obstacle.img.includes("map-tree"))
			alpha = setting.ceilingAlphaEnabled ? setting.obstaclesAlphaTreeLevel : 1.0;
		if(obstacle.img.includes("map-tree-04"))
			alpha = 1.0;
		if(obstacle.img.includes("map-bush"))
			alpha = setting.ceilingAlphaEnabled ? setting.obstaclesAlphaBushLevel : 0.97;
		if(obstacle.img.includes("map-table"))
			alpha = setting.ceilingAlphaEnabled ? setting.obstaclesAlphaTableLevel : 1.0;

		obstacle.sprite.alpha = alpha;
	}

	var updateBuildingCeilingAplha = function(building) {
		if(!building || !building.ceiling)
			return;
		
		var setting = window.menu.UserSetting.look;

		if(!setting.ceilingAlphaEnabled)
			return;
		// console.log("All sprites start");
		// for (let i = 0; i < building.sprites.length; i++) {
		// 	console.log(building.sprites[i].sprite.texture.baseTexture);
		// }
		// console.log("All sprites done");
		// console.log(building.sprites[0].sprite);

		building.sprites
			.map((s) => s.sprite)
			// .filter((s) => s.texture.baseTexture.imageUrl.includes("ceiling"))
			.filter((s) => (s._texture.textureCacheIds[0]) ? s._texture.textureCacheIds[0].includes("ceiling") : false)
			// .forEach((s) => console.log(s.texture.baseTexture.imageUrl))
			.forEach((s) => s.alpha = setting.ceilingAlphaLevel);
	}
	
	var updateSmokeAplha = function(smoke) {
		if(!smoke || !smoke.particle || !smoke.particle.sprite)
			return;
		
		var setting = window.menu.UserSetting.look;

		if(!setting.smokeAlphaEnabled)
			return;
		
		smoke.particle.sprite.alpha *= setting.smokeAlphaLevel;
	}
	// console.log("Console logging something!");
	// console.log(game[obfuscate.smokeBarn]);
	game[obfuscate.smokeBarn][obfuscate.smokePool][obfuscate.pool].forEach(updateSmokeAplha);
	game[obfuscate.map][obfuscate.obstaclePool][obfuscate.pool].forEach(updateObstacleAlpha);
	game[obfuscate.map][obfuscate.buildingPool][obfuscate.pool].forEach(updateBuildingCeilingAplha);

	var updateTargetIndicator = function(player) {
		if(!player || !player.prediction)
			return;
		
		var targetIndicator = player.targetIndicator;
		
		if(!targetIndicator)
		{
			targetIndicator = window.PIXI.Sprite.from(targetTexture);
			targetIndicator.visible = false;
			targetIndicator.scale.x = 0.7;
			targetIndicator.scale.y = 0.7;
			targetIndicator.tint = 16711680;
			targetIndicator.alpha = 0.4;
			player.container.addChild(targetIndicator);
			player.targetIndicator = targetIndicator;
		}
		
		if(!targetIndicator)
			return;
		
		targetIndicator.position.x = targetIndicator.width * -0.5 + player.prediction.x;
		targetIndicator.position.y = targetIndicator.height * -0.5 + player.prediction.y;
		
		targetIndicator.visible = player == window.gameVars.Game.Target;
	}
	
	var updateLaser = function() {
		// check this function with console logs.
		if(!game[obfuscate.activePlayer] || !game[obfuscate.activePlayer].container)
			return;
		
		var laser = window.gameVars.Game.Laser;
		
		var draw = laser.draw;
		
		if(!draw)
		{
			draw = new window.PIXI.Graphics();
			
			laser.draw = draw;
			game[obfuscate.activePlayer].container.addChild(draw);
			game[obfuscate.activePlayer].container.setChildIndex(draw, 0);
		}
		
		if(!draw.graphicsData)
			return;
		draw.clear();
		
		if(!laser.active || !window.menu.UserSetting.shoot.lasersightEnabled) 
			return;
		
		var center = {x: 0, y: 0}
		var radius = laser.range;
		var angleFrom = laser.direction - laser.angle;
		var angleTo = laser.direction + laser.angle;
		
		angleFrom = angleFrom > Math.PI * 2 ? angleFrom - Math.PI * 2 : angleFrom < 0 ? angleFrom + Math.PI * 2 : angleFrom;
		angleTo = angleTo > Math.PI * 2 ? angleTo - Math.PI * 2 : angleTo < 0 ? angleTo + Math.PI * 2 : angleTo;
		
		draw.beginFill( 0xff0000, 0.1 );
		draw.moveTo(center.x,center.y);
		draw.arc(center.x, center.y, radius, angleFrom, angleTo);
		draw.lineTo(center.x, center.y);
		draw.endFill();
	}
	
	var updateEnemyLines = function() {
		if(!game[obfuscate.activePlayer] || !game[obfuscate.activePlayer].container)
			return;
		
		var enemyLines = window.gameVars.Game.EnemyLines;
		
		var points = enemyLines.points
		var draw = enemyLines.draw;
		
		if(!points)
			return;
	
		if(!draw)
		{
			draw = new window.PIXI.Graphics();
			
			enemyLines.draw = draw;
			game[obfuscate.activePlayer].container.addChild(draw);
			game[obfuscate.activePlayer].container.setChildIndex(draw, 0);
		}
		
		if(!draw.graphicsData)
			return;
		
		draw.clear();
		
		if(!window.menu.UserSetting.look.enemyLinesEnabled)
			return;
		
		draw.beginFill();
		draw.lineStyle(2, 0x68B0E8);
		
		points.forEach(function(pnt) {
			draw.moveTo(0, 0);
			draw.lineTo(pnt.x, pnt.y);
		});
		
		draw.endFill();
	}
	
	var updateNames = function(player) {
		// if(!player || !player.nameText || player.teammate)
		// 	return;
		
		var nameText = player.nameText;
		
		if(window.gameVars.Input.Cheat.ShowNamesPressed)
		{
			nameText.visible = true;
			if(player.teammate) {
				nameText.tint = 0x00b2ff;
			} else {
				nameText.tint = 0xffd700;
			}
		}
	}

	var updateCustomCursor = function() {
		var cursor = window.menu.UserSetting.look.customCursorLevel;
		// if (cursor == 1) {
		// 	$('#game-area-wrapper').css('cursor', 'url(http://cdn.ogario.ovh/static/img/cursors/cursor_06.cur), default');
		// } else {
		// 	$('#game-area-wrapper').css('cursor', 'crosshair');
		// }
		switch (cursor) {
			case 1:
				$("#game-area-wrapper").css('cursor', 'url(http://cdn.ogario.ovh/static/img/cursors/cursor_01.cur), default');
				break;
			case 2:
				$('#game-area-wrapper').css('cursor', 'url(http://cdn.ogario.ovh/static/img/cursors/cursor_06.cur), default');
				break;
			case 3:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/cursors/cur-11/cur1054.cur), default');
				break;
			case 4:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/games/gam-11/gam1088.cur), default');
				break;
			case 5:
				$("#game-area-wrapper").css('cursor', 'url(http://ani.cursors-4u.net/cursors/cur-12/cur1080.cur), default');
				break;
			case 6:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/cursors/cur-1/cur5.cur), default');
				break;
			case 7:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/games/gam-14/gam1384.cur), default');
				break;
			case 8:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/cursors/cur-2/cur120.cur), default');
				break;
			case 9:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/games/gam-14/gam1394.cur), default');
				break;
			case 10:
				$("#game-area-wrapper").css('cursor', 'url(http://cur.cursors-4u.net/user/use-1/use153.cur), default');
				break;
			default:
				$('#game-area-wrapper').css('cursor', 'crosshair');
		}
	}
	
	try {
		//game.playerBarn.playerPool.pool
		//game.activePlayer
		var players = game[obfuscate.playerBarn][obfuscate.playerPool][obfuscate.pool].filter(p => p.__id != game[obfuscate.activePlayer].__id); 
		//check the above
		players.forEach(updateTargetIndicator);
		players.forEach(updateNames);
		updateLaser();
		updateEnemyLines();
		updateCustomCursor();
		// $(".ui-stats-header-title").html("You suck.");
	}
	catch(error)
	{
		console.log(error)
	}
	
	// counters
	
	var red = { r: 255, g: 0, b: 0 };
	var green = { r: 0, g: 180, b: 0 };
	
	function getColor(color1, color2, weight) {
		var w1 = weight;
		var w2 = 1 - w1;
		var rgb = {
			r: Math.round(color1.r * w1 + color2.r * w2),
			g: Math.round(color1.g * w1 + color2.g * w2),
			b: Math.round(color1.b * w1 + color2.b * w2)
		};
		return rgb;
	}
	
	function getWeight(value, min, max) {
		if (value <= min) return 0;
		if (value >= max) return 1;
		return (value - min) / (max - min);
	}
	
	function colorToString(color) {
		return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', 1.0)';
	}
	
	function getMedian(array) {
		
		var values = array.slice();
		
		values.sort( function(a,b) {return a - b;} );

		var half = Math.floor(values.length/2);

		if(values.length % 2)
			return values[half];
		else
			return (values[half-1] + values[half]) / 2.0;
	}
	
	// FPS counter
	
	var perf = window.gameVars.Perfomance;
	var FPSinertia = 0.1;
	var FPSResultsCount = 15;
	
	var curFPS = 0;
	
	if(perf.lastTimeFPS) {
		var elapsed = window.performance.now() - perf.lastTimeFPS;
		curFPS = 1000 / elapsed;
	}
	
	perf.lastTimeFPS = window.performance.now();
	
	var FPSList = perf.lastFPSList;
	
	FPSList.push(curFPS);
	
	while (FPSList.length > FPSResultsCount) {
		FPSList.shift();
	}
	
	var FPS = getMedian(FPSList);
	
	if(perf.lastFPS) {
		FPS = FPS * (1 - FPSinertia) + perf.lastFPS * FPSinertia;
	}

	perf.lastFPS = FPS;
		
	var FPSCol = getColor(green, red, getWeight(FPS, 5, 40));
	
	if(window.gameVars && window.gameVars.UI && window.gameVars.UI.FPSText) {
		window.gameVars.UI.FPSText.text("FPS: " + Math.round(FPS));
		window.gameVars.UI.FPSText.css('color', colorToString(FPSCol));
	}
}