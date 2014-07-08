/*
 * Anonymous function to induce scope.
 */
(function (global) {
    /*
	 * Constants
	 */
    var FRICTION = 0.96,
		LINE_LENGTH = 100;
    /*
	 * Global variables
	 */
    var canvas = document.getElementById('otbo'),
		ctx = canvas.getContext('2d'),
        states = {menu:'menu',game:'game'},
        gameState = new Otbo.gameState(canvas),
        menu = document.getElementsByClassName('backdrop')[0],
        gameActive = false,
		mouseIsDown = false,
		mouseStart,
		mouseCurrent,
		balls = [],
		players = [],
        numberOfPlayers = 2,
		currentPlayer = 0;

    //Set width/height to 100&
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var baseWidth = canvas.width * 0.15,
        middleWidth = canvas.width / 2,
        middleHeight = canvas.height / 2,
        scale = baseWidth * 0.80;

    //Mouse/Touch events
    function mouseDown(event) {        
        var click = getMousePos(event);
        mouseCurrent = click;

        if (!gameActive) {            
            mouseIsDown = detectClick(click);
        }
        event.preventDefault();
    }
    function mouseUp(event) {
        if (mouseIsDown) {
            plotMouseForce();
            mouseIsDown = false;
            gameActive = true;
        }
        event.preventDefault();
    }
    function mouseMove(event) {
        mouseCurrent = getMousePos(event);
        event.preventDefault();
    }
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('touchstart', mouseDown, false);
    canvas.addEventListener('touchend', mouseUp, false);
    canvas.addEventListener('touchmove', mouseMove, false);
    /*
	 * Helper methods
	 */
    //Get radian from degrees
    function getRadian(rad) {
        rad = rad || 360;
        return rad * Math.PI / 180;
    }
    // Mouse
    function getMousePos(event) {
        if (~event.type.indexOf("touch")) {
            return {
                x: event.targetTouches[0].pageX,
                y: event.targetTouches[0].pageY
            }
        }
        return {
            x: event.layerX,
            y: event.layerY
        };
    }
    //Load images and execute a function after loading
    function makeImages(images, callback) {
        var result = {};
        var loadCount = 0;
        var imagesToLoad = images.length;

        for (var i = imagesToLoad; i--;) {
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
    }
    //Point in circle detection
    function pointInCircle(circle, point) {
        return (Math.sqrt(Math.pow(circle.position.x - point.x, 2) +
                          Math.pow(circle.position.y - point.y, 2))) < circle.radius;
    }
    //Pythagoras
    function pythagoras(a, b) {
        return Math.sqrt((a * a) + (b * b));
    }
    //clamp a value to a minimum or maximum
    function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    //Randomize array element order in-place. Using Fisher-Yates shuffle algorithm.
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
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
    function detectClick(click) {
        var clickObject = new Otbo.vector(click.x, click.y);

        for (var i = balls.length; i--;) {
            var ball = balls[i];

            if (pointInCircle(ball, clickObject)) {
                mouseStart = ball;
                return true;
            };
        }
        return false;
    }

    function plotMouseForce() {
        var speed = 60,
            xDistance = (mouseCurrent.x - mouseStart.position.getX()), // subtract the X distances from each other.
            yDistance = (mouseCurrent.y - mouseStart.position.getY()); // subtract the Y distances from each other.

        console.log(pythagoras(xDistance, yDistance));//get distance

        mouseStart.velocity.setX(xDistance / speed);
        mouseStart.velocity.setY(yDistance / speed);
        //reset the mouseStart pointer
        mouseStart = null;
    }

    function drawBackground() {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.fill();

        ctx.drawImage(players[0].img, baseWidth, 0, middleWidth - baseWidth, canvas.height);
        ctx.drawImage(players[1].img, middleWidth, 0, middleWidth - baseWidth, canvas.height);

        ctx.beginPath();
        ctx.rect(middleWidth-1, 0, 2, canvas.height);
        ctx.fillStyle = '#f00';
        ctx.fill();
    }

    function drawHud() {
        ctx.fillStyle = '#fff';

        for (var i = 0, l = players.length; i < l; i++) {
            var player = players[i],
                fixedWidth = 20,
                x = i & 1 ? fixedWidth : canvas.width - fixedWidth;

            for (var o = 0, j = player.balls.length; j--;) {                
                var ballSize = player.balls[j] / 10;
                ctx.beginPath();
                ctx.arc(x, fixedWidth + fixedWidth * o, ballSize, 0, 2 * Math.PI, false);
                
                ctx.fill();
                o++;
            }            
        }

        ctx.font = "120px Verdana";
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20;

        for (var i = 0, l = players.length; i < l; i++) {            
            var x = i & 1 ? 10 : canvas.width - 90;
            ctx.fillText(players[i].score, x, canvas.height - 20);
        }
        ctx.shadowBlur = 0;
    }

    function drawObjects() {

        //Draw balls
        for (var i = balls.length; i--;) {
            var ball = balls[i];

            if (gameState.state === states.game) {
                ctx.beginPath();
                ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, false);
                ctx.shadowColor = '#f00';
                ctx.shadowBlur = ball.radius / 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.save();
            ctx.translate(ball.position.x, ball.position.y);
            ctx.rotate(ball.life(ball.velocity.getX() * 16) * (Math.PI / 180));
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(players[ball.owner].img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
            ctx.closePath();            
            ctx.restore();
        }

        //Draw mouse line
        if (mouseIsDown) {
            ctx.beginPath();
            var x = mouseStart.position.getX(),
                y = mouseStart.position.getY();
            ctx.moveTo(x, y);
            ctx.lineTo(mouseCurrent.x, mouseCurrent.y);
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }
    }

    function nextPlayer() {
        function getNext() {            
            if (players.length === count) return false;
            count++;
            currentPlayer = ++currentPlayer % numberOfPlayers;

            if (players[currentPlayer].balls.length === 0) {
                return getNext();
            }
            return true;
        }

        var count = 0;
        return getNext();
    }

    function divideBalls() {
        var scores = [0, 0];//playerscores

        for (var i = balls.length; i--;) {
            var ball = balls[i];

            if (ball.position.x < baseWidth) {
                players[1].balls.push(ball.radius);
                balls.splice(i, 1);
            } else if (ball.position.x > canvas.width - baseWidth) {
                players[0].balls.push(ball.radius);
                balls.splice(i, 1);
            } else if (ball.owner === 0 && ball.position.x > baseWidth && ball.position.x < middleWidth) {
                scores[0] += 1;
            } else if (ball.owner === 1 && ball.position.x < canvas.width - baseWidth && ball.position.x > middleWidth) {
                scores[1] += 1;
            }
        }

        for (var i = 0, l = players.length; i < l; i++) {
            players[i].score = scores[i];
        }
    }

    function updateBallPos(ball) {
        ball.lastGoodPosition = ball.position; // save the balls last good position.            
        ball.position = ball.position.add((ball.velocity.multiply(8))); // add the balls (velocity * 6) to position.
        if (gameState.state === states.game) ball.velocity = ball.velocity.multiply(FRICTION); // add friction to decelerate balls
    }

    function checkWallCollision(ball) {
        if (ball.getX() + (ball.getRadius()) >= canvas.width || ball.getX() - (ball.getRadius()) <= 0) {
            ball.velocity.setX(-ball.velocity.getX()); // if collided with a wall on x Axis, reflect Velocity.X.
            ball.position = ball.lastGoodPosition; // reset ball to the last good position (Avoid objects getting stuck in each other).
        }

        if (ball.getY() - (ball.getRadius()) <= 0 || ball.getY() + (ball.getRadius()) >= canvas.height) { // check for y collisions.
            ball.velocity.setY(-ball.velocity.getY()); // if collided with a wall on y Axis, reflect Velocity.Y.
            ball.position = ball.lastGoodPosition;
        }
    }

    function checkBallCollision(ball1, ball2) {
        var xDistance = (ball2.getX() - ball1.getX()); // subtract the X distances from each other. 
        var yDistance = (ball2.getY() - ball1.getY()); // subtract the Y distances from each other. 
        var distanceBetween = pythagoras(xDistance, yDistance); // the distance between the balls is the sqrt of Xsquared + Ysquared.
        var sumOfRadius = ((ball1.getRadius()) + (ball2.getRadius())); // add the balls radius together
        return (distanceBetween < sumOfRadius); // if the distance between them is less than the sum of radius they have collided.
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
        var ball1scalarNormal = normalVector.dot(ball1.velocity);
        var ball2scalarNormal = normalVector.dot(ball2.velocity);
        // create scalar velocity in the tagential direction.
        var ball1scalarTangential = tangentVector.dot(ball1.velocity);
        var ball2scalarTangential = tangentVector.dot(ball2.velocity);
        var ball1ScalarNormalAfter = (ball1scalarNormal * (ball1.getMass() - ball2.getMass()) + 2 * ball2.getMass() * ball2scalarNormal) / (ball1.getMass() + ball2.getMass());
        var ball2ScalarNormalAfter = (ball2scalarNormal * (ball2.getMass() - ball1.getMass()) + 2 * ball1.getMass() * ball1scalarNormal) / (ball1.getMass() + ball2.getMass());
        var ball1scalarNormalAfter_vector = normalVector.multiply(ball1ScalarNormalAfter); // ball1Scalar normal doesnt have multiply not a vector.
        var ball2scalarNormalAfter_vector = normalVector.multiply(ball2ScalarNormalAfter);
        var ball1ScalarNormalVector = (tangentVector.multiply(ball1scalarTangential));
        var ball2ScalarNormalVector = (tangentVector.multiply(ball2scalarTangential));
        ball1.velocity = ball1ScalarNormalVector.add(ball1scalarNormalAfter_vector);
        ball2.velocity = ball2ScalarNormalVector.add(ball2scalarNormalAfter_vector);
    }

    function update() {
        var moving = 0;

        for (var i = balls.length; i--;) {
            var iBall = balls[i],
                mag = iBall.velocity.magnitude();
            
            updateBallPos(iBall);
            checkWallCollision(iBall);

            for (var j = balls.length; j--;) {
                var jBall = balls[j];
                if (iBall != jBall) {
                    if (checkBallCollision(iBall, jBall)) {
                        ballCollisionResponce(iBall, jBall);
                    }
                }
            }

            if (mag > 0.001) {
                moving++;
            }
        }

        if (gameActive && moving === 0) {
            divideBalls();
            if (!nextPlayer()) gameOver();
            nextMove();
            gameActive = false;
        }
    }
    function draw() {
        drawBackground();
        drawObjects();
        drawHud();
    }

    /*
	 * Initialize
	 */
    function createRandomBalls() {
        for (var i = 10; i--;) {
            var size = ~~(Math.random() * 50) + 10;
            var ball = new Otbo.ball(
                (50 + (i * 200)) % (canvas.width - 50),
				~~(Math.random() * (canvas.height - size * 2)) + size,
				size,
				0, 0, 0
			);
            balls.push(ball);
        }
    }
    //mousecurrent touchstart
    function initGame(number) {
        var big = scale / 2,
            small = big / 3,
            medium = big - small,
            beginBalls = [big, big, medium, medium, small, small];

        clearInterval(timer);
        menu.style.display = 'none';

        gameActive = false;
        mouseStart = null;
        balls = [];
        players = [];
        numberOfPlayers = number;
        currentPlayer = Math.floor(Math.random() * numberOfPlayers);

        for (var i = 0, l = numberOfPlayers; i < l; i++) {
            players.push({
                score: 0,
                img: i & 1 ? Otbo.img.spider : Otbo.img.spiral,
                balls: shuffleArray(beginBalls.slice(0))
            });
        }        
        nextMove();
    }

    var timer;
    function gameOver() {
        var c = 0,
            max = 50;

        menu.style.display = 'block';
        gameState.start(states.menu);
        gameActive = true;

        timer = setInterval(function () {
            if (c === max) clearInterval(timer);

            var ball = new Otbo.ball(20, 20, 10, 1, 1, c & 1);
            balls.push(ball);
            c++;
        }, 200);
    }

    function nextMove(){
        var size = players[currentPlayer].balls.shift(),
            fixedWidth = baseWidth / 2;
        var ball = new Otbo.ball(
            currentPlayer & 1 ? fixedWidth : canvas.width - fixedWidth,
            canvas.height / 2,
            size,
            0, 0,
            currentPlayer
        );
        balls.push(ball);
    }

    function init() {

        document.getElementById('player2').addEventListener('click', function () {
            initGame(2);
            gameState.start(states.game,{
                update: update,
                draw: draw
            });
        }, false);

        makeImages(['spider.png','circle.png','spiral.jpg'], function (i) {
            Otbo.img = i;
        });
    }
    init();
}(window));