/*
 * Anonymous function to induce scope.
 */
(function(global){
	/*
	 * Constants
	 */
	var FRICTION = 0.1,
		LINE_LENGTH = 100;
	/*
	 * Global variables
	 */
	var canvas = document.getElementById('otbo'),
		ctx = canvas.getContext('2d'),
		mouseIsDown = false,
		mouseStart,
		mouseCurrent,
		balls = [];

	//Set width/height to 100&
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	//Mouse/Touch events
	function mouseDown(e){		
		mouseIsDown = detectClick(e);
	}
	function mouseUp(e){
		if(mouseIsDown){
			plotMouseForce();
			mouseIsDown = false;
		}		
	}
	function mouseMove(e){
		mouseCurrent = getMousePos(canvas, e);
	}
	canvas.addEventListener('mousedown', mouseDown);
	canvas.addEventListener('mouseup', mouseUp);
	canvas.addEventListener('mousemove', mouseMove);
	canvas.addEventListener('touchstart', mouseDown);
	canvas.addEventListener('touchend', mouseUp);
	canvas.addEventListener('touchmove', mouseMove);
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
	function makeImages(images, callback){
		var result = {};
		var loadCount = 0;
		var imagesToLoad = images.length;
		
		for(var i = imagesToLoad; i--;){
			var name = images[i].split(".")[0],
				img = new Image();			
			img.onload = function () {
				if (++loadCount >= imagesToLoad) {
					callback(result);
				}
			};
			img.src = images[i];
			result[name] = img;
		}
		console.log("Loop ended");
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
	
	/*
	 * Main functions
	 */
	function detectClick(e){
		var click = getMousePos(canvas,e);
			clickObject = {
				position: {
					x: click.x,
					y: click.y
				},
				radius: 1
			}
			
		for(var i = balls.length; i--;){
			var ball = balls[i];
			
			if(circlevscircle(ball,clickObject)){
				mouseStart = ball;
				return true;
			};
		}
		return false;
	}
	
	function plotMouseForce(){	
		var xDistance = (mouseCurrent.x - mouseStart.position.getX()); // subtract the X distances from each other. 
        var yDistance = (mouseCurrent.y - mouseStart.position.getY()); // subtract the Y distances from each other. 
<<<<<<< HEAD
        //var distanceBetween = Math.sqrt((xDistance * xDistance) + (yDistance *yDistance));

        pythagoras(xDistance, yDistance);


=======
>>>>>>> origin/master
		mouseStart.velocity.setX(xDistance / 100);
		mouseStart.velocity.setY(yDistance / 100);
		//reset the mouseStart pointer
		mouseStart = null;
	}
	
	function drawObjects(){		
		//Draw image
		/* /
		ctx.drawImage(Otbo.img.CrazyWolf, 0, 0);
		var pattern = ctx.createPattern(Otbo.img.CrazyWolf, 'repeat');
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pattern;
        ctx.fill();
		/* */
	
		//Draw balls
		for(var i = balls.length; i--;){
			var ball = balls[i];
			ctx.beginPath();
			ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = ball.color;
			ctx.fill();
		}
		
		
		//Draw mouse line
		if(mouseIsDown){
			ctx.beginPath();
			ctx.moveTo(mouseStart.position.x, mouseStart.position.y);
			ctx.lineTo(mouseCurrent.x, mouseCurrent.y);
			ctx.lineWidth = 5;
			ctx.lineCap = 'round';
			ctx.stroke();
		}
	}
	
	function updateBallPos(ballArray) {
        for (var i = 0; i < ballArray.length; i++) {
            ballArray[i].lastGoodPosition = ballArray[i].position; // save the balls last good position.
            ballArray[i].position = ballArray[i].position.add((ballArray[i].velocity.multiply(2))); // add the balls (velocity * 6) to position. 
        }
    }
	
    function checkWallCollision(ballArray) {
        for (var i = 0; i < ballArray.length; i++) {
            /*##### Collisions on the X axis ##### */
            if (ballArray[i].getX() + (ballArray[i].getRadius()) >= canvas.width || ballArray[i].getX() - (ballArray[i].getRadius()) <= 0) {
                ballArray[i].velocity.setX(-ballArray[i].velocity.getX()); // if collided with a wall on x Axis, reflect Velocity.X.
                ballArray[i].position = ballArray[i].lastGoodPosition; // reset ball to the last good position (Avoid objects getting stuck in each other).
            }
            /*##### Collisions on the Y axis ##### */
            if (ballArray[i].getY() - (ballArray[i].getRadius()) <= 0 || ballArray[i].getY() + (ballArray[i].getRadius()) >= canvas.height) { // check for y collisions.
                ballArray[i].velocity.setY(-ballArray[i].velocity.getY()); // if collided with a wall on x Axis, reflect Velocity.X. 
                ballArray[i].position = ballArray[i].lastGoodPosition;
            }
        }
    }
	
    function checkBallCollision(ball1, ball2) {
        var xDistance = (ball2.getX() - ball1.getX()); // subtract the X distances from each other. 
        var yDistance = (ball2.getY() - ball1.getY()); // subtract the Y distances from each other. 
        var distanceBetween = Math.sqrt((xDistance * xDistance) + (yDistance *yDistance)); // the distance between the balls is the sqrt of X squard + Ysquared. 
        var sumOfRadius = ((ball1.getRadius()) + (ball2.getRadius())); // add the balls radius together

        if (distanceBetween < sumOfRadius) { // if the distance between them is less than the sum of radius they have collided. 
            return true;
        }
        else {
            return false;
        }
    }
	
    function ballCollisionResponce(ball1, ball2) {
        ball1.position = ball1.lastGoodPosition;
        ball2.position = ball2.lastGoodPosition;

        var xDistance = (ball2.getX() - ball1.getX());
        var yDistance = (ball2.getY() - ball1.getY());

        var normalVector = new Otbo.vector(xDistance, yDistance); // normalise this vector store the return value in normal vector.
        normalVector = normalVector.normalise();

        var tangentVector = new Otbo.vector((normalVector.getY() * -1), normalVector.getX());
       
        // create ball scalar normal direction.
        var ball1scalarNormal =  normalVector.dot(ball1.velocity);
        var ball2scalarNormal = normalVector.dot(ball2.velocity);

        // create scalar velocity in the tagential direction.
        var ball1scalarTangential = tangentVector.dot(ball1.velocity); 
        var ball2scalarTangential = tangentVector.dot(ball2.velocity); 

        var ball1ScalarNormalAfter = (ball1scalarNormal * (ball1.getMass() - ball2.getMass()) + 2 * ball2.getMass() * ball2scalarNormal) / (ball1.getMass() + ball2.getMass());
        var ball2ScalarNormalAfter = (ball2scalarNormal * (ball2.getMass() - ball1.getMass()) + 2 * ball1.getMass() * ball1scalarNormal) / (ball1.getMass() + ball2.getMass());

        var ball1scalarNormalAfter_vector = normalVector.multiply(ball1ScalarNormalAfter); // ball1Scalar normal doesnt have multiply not a vector.
        var ball2scalarNormalAfter_vector = normalVector.multiply(ball2ScalarNormalAfter);

        var ball1ScalarNormalVector = (tangentVector.multiply(ball1scalarTangential));
        var ball2ScalarNormalVector = (tangentVector.multiply(ball2scalarTangential));;

        ball1.velocity = ball1ScalarNormalVector.add(ball1scalarNormalAfter_vector);
        ball2.velocity = ball2ScalarNormalVector.add(ball2scalarNormalAfter_vector);
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
		//Initiate pyramid of doom
        updateBallPos(balls);
        checkWallCollision(balls);
        for (var i = 0; i < balls.length; i++) {
            for (var j = 0; j < balls.length; j++) {
                if (balls[i] != balls[j]) {
                    if (checkBallCollision(balls[i], balls[j])) {
                        ballCollisionResponce(balls[i], balls[j]);
                    }
                }
            }
        }
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
	function createRandomBalls(){
		for(var i = 10; i--;){		
			var size = ~~(Math.random() * 50) + 10;
			var ball = new Otbo.ball(
				~~(Math.random() * (canvas.width-size*2)) + size,
				~~(Math.random() * (canvas.height-size*2)) + size,
				size,
				/* */
				0,0,
				/* /
				~~(Math.random() * 3) -1,
				~~(Math.random() * 3) -1,
				/* */
				'#'+Math.floor(Math.random()*16777215).toString(16)
			);
			balls.push(ball);
		}
	} 

	function pythagoras(a, b)
	{
		var lineLength = Math.sqrt((a*a) + (b*b));
		console.log(lineLength);
	}
	 
	function init(){
        makeImages(['CrazyWolf.jpg'], function (i) {
			Otbo.img = i;
			createRandomBalls();
			loop();
        });
	}
	init();
}(window));