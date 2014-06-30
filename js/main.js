/*
 * Anonymous function to induce scope.
 */
(function(global){
	/*
	 * Constants
	 */
	var LINE_LENGTH = 100;
	/*
	 * Global variables
	 */
	var canvas = document.getElementById('otbo'),
		ctx = canvas.getContext('2d'),
		mouseIsDown = false,
		mouseStart,
		mouseCurrent,
		players = [];

	//Set width/height to 100&
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//Detect mouseIsdown
	canvas.addEventListener('mousedown', function(e){		
		mouseIsDown = detectClick(e);
	});
	canvas.addEventListener('mouseup', function(e){
		if(mouseIsDown){
			plotMouseForce();
			mouseIsDown = false;
		}		
	});
	canvas.addEventListener('mousemove', function(e){
		mouseCurrent = getMousePos(canvas, e);
	});
	/*
	 * Helper methods
	 */
    // Mouse
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
	//Load images and execute a function after loading
	function loadImages(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        for (var src in sources) {
            numImages++;
        }
        for (var src in sources) {
            images[src] = new Image();
            images[src].onload = function () {
                if (++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].src = sources[src];
        }
    }
	//Circle vs Circle collision detection
	function circlevscircle(circle1, circle2) {
        return (Math.sqrt(Math.pow(circle1.position.x - circle2.position.x, 2) + Math.pow(circle1.position.y - circle2.position.y, 2))) < circle1.radius + circle2.radius;
    }
	//clamp a value to a minimum or maximum
	function clamp(n,min,max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }
	
	
	/*
	 * Classes
	 */
	// Prototypal inheritance function
	function extend(base, sub) {
		sub.prototype = Object.create(base.prototype);
		sub.prototype.constructor = sub;
	}
	//Vector class
	function Vector(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	//Generic olo object
	function Olo(point, radius) {
        this.position = point || new Vector(0, 0);
		this.radius = radius || 10;
        this.xSpeed = 0;
        this.ySpeed = 0;
    }
	//TODO: implement different shapes and extend from base Olo object
	
	
	/*
	 * Main functions
	 */
	function detectClick(e){
		var click = getMousePos(canvas,e);
			clickObject = new Olo(new Vector(click.x,click.y),1);
			
		for(var i = players.length; i--;){
			var player = players[i];
			
			if(circlevscircle(player,clickObject)){
				mouseStart = player;
				return true;
			};
		}
		return false;
	}
	
	function plotMouseForce(){	
		var force = 50;//lower is faster
		mouseStart.xSpeed = (mouseCurrent.x - mouseStart.position.x) / force;
		mouseStart.ySpeed = (mouseCurrent.y - mouseStart.position.y) / force;		
		mouseStart = null;
	}
	
	function plotObjects(){
		for(var i = players.length; i--;){
			var player = players[i];
			
			player.position.x += player.xSpeed;
			player.position.y += player.ySpeed;
			//if (out of bounds) delete;
		}
	}
	
	function drawObjects(){
		
		//Draw players
		for(var i = players.length; i--;){
			var player = players[i];
			ctx.beginPath();
			ctx.arc(player.position.x, player.position.y, player.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = player.color;
			ctx.fill();
		}
		
		
		//Draw mouse line
		if(mouseIsDown){
			ctx.beginPath();
			ctx.moveTo(mouseStart.position.x, mouseStart.position.y);
			ctx.lineTo(mouseCurrent.x, mouseCurrent.y);
			ctx.stroke();
		}
	}
	
	/*
	 * Gameloop
	 */
	function loop() {
		clear();
		update();
		draw();
		queue();
	}
	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	function update() {
		plotObjects();
	}
	function draw() {
		drawObjects();
	}
	function queue() {
		window.requestAnimationFrame(loop);
	}
	
	/*
	 * Initialize
	 */
	function init(){
		var sources = {
            wolf: 'CrazyWolf.jpg'
        };
        loadImages(sources, function (i) {
			ctx.drawImage(i.wolf, 0, 0);
			
			for(var i = 20; i--;){			
				var player = new Olo(
					new Vector(
						~~(Math.random() * canvas.width) + 1,
						~~(Math.random() * canvas.height) + 1
					),
					~~(Math.random() * 20) + 10
				);
				player.color = '#'+Math.floor(Math.random()*16777215).toString(16);
				players.push(player);
			}
			loop();
        });
	}
	init();
}(window));