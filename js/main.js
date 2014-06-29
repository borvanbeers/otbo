/*
 * Anonymous function to induce scope.
 */
(function(global){
	/*
	 * Global variables
	 */
	var canvas = document.getElementById('otbo'),
		ctx = canvas.getContext('2d');

	
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
		//plotObjects();
	}
	function draw() {
		//drawObjects();
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
        });
		//loop();
	}
	init();
}(window));