/*
 * Anonymous function to induce scope.
 */
(function (g, d) {
    /*
	 * Constants
	 */
    var FRICTION = 0.96;
    /*
	 * Global variables
	 */
    var canvas = d.getElementById('otbo'),
		ctx = canvas.getContext('2d'),
        gameState = new Otbo.gameState(canvas, { menu: null, game: update, divide: dividing }),
        menu = d.getElementById('menu'),
        customize = d.getElementById('customize'),
        gameActive = false,
        rainbow = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
        mouseMode = 1,
		mouseIsDown = false,
		mouseStart,
		mouseCurrent,
		balls = [],
        dividedBalls,
        pickups = [],
		players = [],
        winner = 0,
        numberOfPlayers = 2,
		currentPlayer = 0,
        options = {};

    //Set width/height to 100&
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var baseWidth = canvas.width * 0.15,
        middleWidth = canvas.width / 2,
        middleHeight = canvas.height / 2,
        scale = baseWidth * 0.80,
        MAX_FORCE = scale * 2;

    //Mouse/Touch events
    function mouseDown(event) {
        if (!players[currentPlayer].isComputer) {
            mouseMode = 0;
            mouseCurrent = getMousePos(event);

            if (!gameActive) {

                if (mouseCurrent.right) {
                    mouseMode = 2;
                    mouseIsDown = true;
                } else {
                    mouseMode = 1;
                    mouseIsDown = pointInCircle(mouseStart, mouseCurrent);
                }
            }
        }
        event.preventDefault();
    }
    function mouseUp(event) {
        if (mouseIsDown && !players[currentPlayer].isComputer) {

            if(mouseMode === 1){
                plotMouseForce();
            }
        }
        mouseIsDown = false;
        mouseMode = 0;
        event.preventDefault();
    }
    function mouseMove(event) {
        if (mouseIsDown && !players[currentPlayer].isComputer) {
            mouseCurrent = getMousePos(event);

            if (mouseMode === 2) {
                var y = mouseCurrent.y;
                if (y > mouseStart.radius + 10 &&
                   y < canvas.height - mouseStart.radius - 10) {
                    mouseStart.position.setY(y);
                }
            }
            event.preventDefault();
        }
    }
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('touchstart', mouseDown, false);
    canvas.addEventListener('touchend', mouseUp, false);
    canvas.addEventListener('touchmove', mouseMove, false);
    canvas.addEventListener('contextmenu', function () { event.preventDefault(); }, false);
    
    /*
	 * Helper methods
	 */
    //Get radian from degrees
    function rand(num) {
        return Math.floor(Math.random() * num);
    }
    function getRadian(rad) {
        rad = rad || 360;
        return rad * Math.PI / 180;
    }
    // Mouse
    function getMousePos(event) {
        if (~event.type.indexOf("touch")) {
            return {
                x: event.targetTouches[0].pageX,
                y: event.targetTouches[0].pageY,
                right: event.targetTouches.length > 1
            }
        }
        return {
            x: event.layerX,
            y: event.layerY,
            right: event.which === 3
        };
    }
    //Load images and execute a function after loading
    function makeImages(images, callback) {
        var result = {},
            loads = 0,
            keys = Object.keys(images),
            num = keys.length;

        for (var i = num; i--;) {
            var key = keys[i],
                img = new Image();
            img.onload = function () {
                if (++loads >= num) callback(result);
            };
            img.src = images[key];
            result[key] = img;
        }
    }
    //
    function makeAudio(sounds, callback) {
        var result = {},
            loads = 0,
            keys = Object.keys(sounds),
            num = keys.length;

        for (var i = num; i--;) {
            var key = keys[i],
                snd = new Audio();
            snd.oncanplaythrough = function () {
                if (++loads >= num) callback(result);
            };
            snd.src = sounds[key];
            result[key] = snd;
        }
    }
    //
    function playSound(snd) {
        if (Otbo.sound) {
            var sound = Otbo.sound[snd];
            sound.currentTime = 0;
            sound.play();
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
    //Gets a color from blue to red. param value from 0 to 1
    function getColor(value) {
        var hue = ((1 - value) * 200).toString(10);
        return ["hsl(", hue, ",100%,50%)"].join("");
    }
    //Randomize array element order in-place. Using Fisher-Yates shuffle algorithm.
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = rand(i + 1);
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    //
    function validateHEX(hex) {
        return /^#[0-9A-F]{3}(?:[0-9A-F]{3})?$/i.test(hex);
    }
    //
    function getContrastColor(hex) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16),
            brightness = ((r * 299) + (g * 587) + (b * 114)) / 255000;
        return brightness >= 0.5 ? '#000' : '#FFF';
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
    function clampAngle(midX, midY, x, y) {
        var disX = (x - midX),
            disY = (y - midY),
            angleInRadians = Math.atan2(disY, disX),
            maxX = Math.cos(angleInRadians) * MAX_FORCE,
            maxY = Math.sin(angleInRadians) * MAX_FORCE,
            forceX = (maxX > 0 ? clamp(disX, -maxX, maxX) : clamp(disX, maxX, -maxX)),
            forceY = (maxY > 0 ? clamp(disY, -maxY, maxY) : clamp(disY, maxY, -maxY)),
            realX = midX + forceX,
            realY = midY + forceY;
        return new Otbo.vector(realX, realY);
    }
    function plotMouseForce() {
        var speed = 20,
            x = mouseStart.position.getX(),
            y = mouseStart.position.getY(),
            angle = clampAngle(x, y, mouseCurrent.x, mouseCurrent.y);
        mouseStart.velocity.setX((angle.x - x) / speed);
        mouseStart.velocity.setY((angle.y - y) / speed);
        //reset the mouseStart pointer
        mouseStart = null;
        mouseIsDown = false;
        gameActive = true;
    }

    function drawBackground() {
        ctx.beginPath();
        ctx.rect(canvas.width - baseWidth, 0, baseWidth, canvas.height);
        ctx.fillStyle = players[0].contrast;
        ctx.fill();
        ctx.beginPath();
        ctx.rect(0, 0, baseWidth, canvas.height);
        ctx.fillStyle = players[1].contrast;
        ctx.fill();

        ctx.beginPath();
        ctx.rect(baseWidth, 0, middleWidth - baseWidth, canvas.height);
        ctx.fillStyle = players[0].color;
        ctx.fill();
        ctx.beginPath();
        ctx.rect(middleWidth, 0, middleWidth - baseWidth, canvas.height);
        ctx.fillStyle = players[1].color;
        ctx.fill();
    }

    function drawBalls() {
        for (var i = balls.length; i--;) {
            var ball = balls[i];
            /* /
            if (ball.lastPositions && ball.lastPositions.length > 0) {                
                //line trail
                ctx.beginPath();
                ctx.moveTo(ball.position.x, ball.position.y);
                for (var j = 0, l = ball.lastPositions.length; j < l; j++) {
                    ctx.lineTo(ball.lastPositions[j].x, ball.lastPositions[j].y);
                }
                ctx.lineWidth = 50;
                ctx.lineCap = 'round';
                ctx.strokeStyle = players[ball.owner].contrast;
                ctx.stroke();
                // Shadow trail
                for (var j = ball.lastPositions.length; j--;) {
                    var lastPos = ball.lastPositions[j];                    
                    ctx.save();
                    ctx.globalAlpha = 0.5;
                    ctx.translate(lastPos.x, lastPos.y);
                    ctx.rotate((ball.life(0) - ball.velocity.getX() * 16 * (j ? j : 1)) * (Math.PI / 180));
                    ctx.beginPath();
                    ctx.arc(0, 0, ball.radius, 0, 2 * Math.PI, false);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(players[ball.owner].img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                    ctx.closePath();
                    ctx.restore();
                }                
            }
            /* */
            if (ball.isScore) {
                ctx.beginPath();
                ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, false);
                ctx.lineWidth = 10;
                ctx.strokeStyle = players[ball.owner].contrast;
                ctx.stroke();
            }
            ctx.save();
            ctx.translate(ball.position.x, ball.position.y);
            ctx.rotate(ball.life(ball.velocity.getX() * 16) * (Math.PI / 180));
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(players[ball.owner].img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);

            if (ball.pickup) {
                ctx.drawImage(options.biohazard, -32,-32, 64,64);
            }

            ctx.closePath();
            ctx.restore();
        }
    }

    function drawHud() {

        for (var i = 0, l = players.length; i < l; i++) {
            var player = players[i],
                fixedWidth = scale / 10,
                x = i & 1 ? fixedWidth : canvas.width - fixedWidth;
            ctx.fillStyle = player.color;

            for (var o = 0, j = player.balls.length; j--;) {
                var ballSize = player.balls[j] / 10;
                ctx.beginPath();
                ctx.arc(x, fixedWidth + fixedWidth * o, ballSize, 0, 2 * Math.PI, false);
                ctx.fill();
                o++;
            }
        }
        ctx.font = "120px Verdana";
        ctx.shadowBlur = 20;
        //draw pickups
        var lp = gameState.loops % 30 === 0;
        for (var i = 0, l = pickups.length; i < l; i++) {
            var pickup = pickups[i];

            if (lp) pickup.color = pickup.color++ > 5 ? 0 : pickup.color;
            var color = rainbow[pickup.color];
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(pickup.position.x, pickup.position.y, 5, 0, 2 * Math.PI, false);
            ctx.fill();            
        }
        //draw scores
        for (var i = 0, l = players.length; i < l; i++) {
            var player = players[i],
                x = i & 1 ? 10 : canvas.width - 90;
            ctx.fillStyle = player.color;
            ctx.shadowColor = player.color;
            ctx.fillText(players[i].score, x, canvas.height - 20);
        }
        ctx.shadowBlur = 0;

        //Draw mouse line
        if (mouseIsDown && mouseMode === 1) {
            ctx.beginPath();
            var x = mouseStart.position.getX(),
                y = mouseStart.position.getY(),
                to = clampAngle(x, y, mouseCurrent.x, mouseCurrent.y),
                dist = pythagoras(x - to.x, y - to.y),
                percent = Math.round(dist / MAX_FORCE * 10) / 10,
                drop = dist / 2,
                angle = Math.atan2(to.y - y, to.x - x);
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x, y, to.x - drop * Math.cos(angle - Math.PI / 6), to.y - drop * Math.sin(angle - Math.PI / 6), to.x, to.y);
            ctx.bezierCurveTo(to.x, to.y, to.x - drop * Math.cos(angle + Math.PI / 6), to.y - drop * Math.sin(angle + Math.PI / 6), x, y);
            ctx.closePath();
            ctx.fillStyle = getColor(percent);
            ctx.fill();
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

    function fastDivideBall(ball) {
        var player = players[ball.owner];

        if (ball.owner === 0 && ball.position.x > baseWidth && ball.position.x < middleWidth ||
            ball.owner === 1 && ball.position.x < canvas.width - baseWidth && ball.position.x > middleWidth) {
            player.score++;
            ball.isScore = true;
        } else {
            ball.isScore = false;
        }
    }

    function divideBalls() {
        var divided = [];

        for (var i = balls.length; i--;) {
            var ball = balls[i],
                o = ball.owner;

            if (ball.position.x < baseWidth) {
                if (o !== currentPlayer || o === 0) {
                    divided.push({
                        from: o,
                        to: 1,
                        ball: ball
                    });
                } else {
                    divided.push({
                        from: o,
                        to: null,
                        ball: ball
                    });
                }
                balls.splice(i, 1);
            } else if (ball.position.x > canvas.width - baseWidth) {
                if (o !== currentPlayer || o === 1) {
                    divided.push({
                        from: o,
                        to: 0,
                        ball: ball
                    });
                } else {
                    divided.push({
                        from: o,
                        to: null,
                        ball: ball
                    });
                }
                balls.splice(i, 1);
            }
        }
        return divided;
    }

    function grabPickup(ball) {
        for (var i = pickups.length; i--;) {
            var pickup = pickups[i];
            if (pointInCircle(ball, pickup.position)) {
                pickups.splice(i, 1);
                ball.pickup = true;
            };
        }
    }

    function updateBallPos(ball) {
        ball.setLastPosition(ball.position); // save the balls last good position.            
        ball.position = ball.position.add((ball.velocity.multiply(8))); // add the balls (velocity * 6) to position.
        if (gameState.isState('game')) ball.velocity = ball.velocity.multiply(FRICTION); // add friction to decelerate balls
    }

    function checkWallCollision(ball) {
        if (ball.getX() + (ball.getRadius()) >= canvas.width || ball.getX() - (ball.getRadius()) <= 0) {
            ball.velocity.setX(-ball.velocity.getX()); // if collided with a wall on x Axis, reflect Velocity.X.
            ball.position = ball.getLastPosition(0); // reset ball to the last good position (Avoid objects getting stuck in each other).
            playSound('bounce');
        }

        if (ball.getY() - (ball.getRadius()) <= 0 || ball.getY() + (ball.getRadius()) >= canvas.height) { // check for y collisions.
            ball.velocity.setY(-ball.velocity.getY()); // if collided with a wall on y Axis, reflect Velocity.Y.
            ball.position = ball.getLastPosition(0);
            playSound('bounce');
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
        ball1.position = ball1.getLastPosition(0);
        ball2.position = ball2.getLastPosition(0);
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
        if (gameActive) {
            var moving = 0;
            players[0].score = 0;
            players[1].score = 0;

            for (var i = balls.length; i--;) {
                var iBall = balls[i],
                    mag = iBall.velocity.magnitude();

                updateBallPos(iBall);
                checkWallCollision(iBall);
                grabPickup(iBall);

                for (var j = balls.length; j--;) {
                    var jBall = balls[j];
                    if (iBall != jBall) {
                        if (checkBallCollision(iBall, jBall)) {
                            ballCollisionResponce(iBall, jBall);

                            if (iBall.pickup) {
                                jBall.owner = jBall.owner === 0 ? 1 : 0;
                                iBall.pickup = false;
                            }
                            playSound('bounce');
                        }
                    }
                }
                fastDivideBall(iBall);

                if (mag > 0.001) {
                    moving++;
                }
            }
        }
        draw();

        if (gameActive && moving === 0 && gameState.isState('game')) {
            dividedBalls = divideBalls();
            gameState.start('divide');
        }
    }

    var fadePct = 0;
    function dividing() {
        if (!dividedBalls.length || fadePct > 100) {
            fadePct = 0;

            for (var i = dividedBalls.length; i--;) {
                var dvdBall = dividedBalls[i];
                if (dvdBall.to !== null) { players[dvdBall.to].balls.push(dvdBall.ball.radius); }
            }

            if (nextPlayer()) {
                gameState.start('game');
                nextMove();
                draw();
            } else {
                draw();
                gameOver();
            }
            return;
        }
        draw();
        for (var i = dividedBalls.length; i--;) {
            var dvdBall = dividedBalls[i];
            if (dvdBall.from !== dvdBall.to) {
                if (dvdBall.to !== null) { drawFade(dvdBall.ball, dvdBall.to, fadePct / 100); }
                drawFade(dvdBall.ball, dvdBall.from, (1 - fadePct / 100));
            } else {
                drawFade(dvdBall.ball, dvdBall.from, 1);
            }
        }

        fadePct++;
    }

    function drawFade(ball, num, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(ball.position.x, ball.position.y);
        ctx.rotate(ball.life(ball.velocity.getX() * 16) * (Math.PI / 180));
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(players[num].img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
        ctx.closePath();
        ctx.restore();
    }

    function draw() {
        drawBackground();
        drawBalls();
        drawHud();
    }

    /*
	 * Initialize
	 */
    function createRandomBalls() {
        for (var i = 10; i--;) {
            var size = rand(50) + 10;
            var ball = new Otbo.ball(
                (50 + (i * 200)) % (canvas.width - 50),
				rand(canvas.height - size * 2) + size,
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

        mouseStart = null;
        balls = [];
        pickups = [];
        players = [];
        numberOfPlayers = clamp(number, 2, 4);
        currentPlayer = rand(numberOfPlayers);

        for (var i = 0, l = numberOfPlayers; i < l; i++) {
            var p = 'p' + (i + 1),
                player = {
                    name: options[p + 'n'],
                    score: 0,
                    img: options[p + 'i'],
                    balls: shuffleArray(beginBalls.slice(0)),
                    color: options[p + 'c'],
                    contrast: options[p + 'cc']
                };

            if (i === 1 && number === 1) {
                player.isComputer = true;
            }
            players.push(player);
        }
        nextMove();
        gameState.start('game');
    }

    var timer;
    function gameOver() {
        gameActive = true;
        gameState.stop();

        //Find winner
        var scoreboard = players.slice(0).sort(function (a, b) {
            return  b.score - a.score;
        });

        if (scoreboard[0].score === scoreboard[1].score) {
            winner = 0;
        } else {
            winner = scoreboard[0].name;
        }
        var txt = winner ? 'Winner: ' + winner : 'What! No winner?',
            fontSize = 100;
        ctx.font = fontSize + "px Verdana";

        var textWidth = ctx.measureText(txt).width,
            x = canvas.width / 2 - textWidth / 2,
            y = canvas.height / 2,
            gradient = ctx.createLinearGradient(x, y, textWidth, 0);
        gradient.addColorStop(0,     rainbow[0]);
        gradient.addColorStop(1 / 6, rainbow[1]);
        gradient.addColorStop(2 / 6, rainbow[2]);
        gradient.addColorStop(3 / 6, rainbow[3]);
        gradient.addColorStop(4 / 6, rainbow[4]);
        gradient.addColorStop(5 / 6, rainbow[5]);
        gradient.addColorStop(1,     rainbow[6]);
        ctx.fillStyle = gradient;
        ctx.fillText(txt, x, y);
        /* */
        setTimeout(function () {
            menu.style.display = 'block';
            gameState.start('menu');
        }, 5000);
        /* /
        var c = 0,
            max = 50;
        timer = setInterval(function () {
            if (c === max) clearInterval(timer);

            var ball = new Otbo.ball(20, 20, 10, 1, 1, winner);
            balls.push(ball);
            c++;
        }, 200);
        /* */
    }

    function nextMove() {
        var player = players[currentPlayer],
            size = player.balls.shift(),
            fixedWidth = baseWidth / 2;
        var ball = new Otbo.ball(
                currentPlayer & 1 ? fixedWidth : canvas.width - fixedWidth,
                canvas.height / 2,
                size,
                0, 0,
                currentPlayer
            );
        balls.push(ball);
        mouseStart = ball;
        mouseMode = 1;

        if (player.isComputer) {
            var force = MAX_FORCE / 2;
            mouseCurrent = {
                x: ball.getX() + rand(force) + 10,
                y: ball.getY() + rand(MAX_FORCE) - force
            };
            mouseIsDown = true;
            setTimeout(function () {
                plotMouseForce();
            }, 1000);
        }

        if (rand(10) === 9) {
            var pickup = {
                color: 0,
                kind: 0,//TODO: implement
                position: new Otbo.vector(
                    rand(middleWidth) + baseWidth,
                    rand(canvas.height - 40) + 20
                    )
            };
            pickups.push(pickup);
        }
        gameActive = false;
    }

    function drawImage(img, canvas) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fill();        
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    function handleImage(e, canvas, key) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var playerImage = new Image();
            playerImage.onload = function () {
                options[key] = playerImage;
                drawImage(playerImage, canvas);
                localStorage.setItem(key, canvas.toDataURL());
            }
            playerImage.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    function initElements() {
        var player1name = d.getElementById('player1name'),
            player1image = d.getElementById('player1image'),
            player1canvas = d.getElementById('player1canvas'),
            player1color = d.getElementById('player1color'),
            player1result = d.getElementById('player1result'),
            player2name = d.getElementById('player2name'),
            player2image = d.getElementById('player2image'),
            player2canvas = d.getElementById('player2canvas'),
            player2color = d.getElementById('player2color'),
            player2result = d.getElementById('player2result');

        player1name.value = options.p1n;
        player2name.value = options.p2n;

        player1canvas.width = scale;
        player1canvas.height = scale;
        player2canvas.width = scale;
        player2canvas.height = scale;

        player1color.value = options.p1c;        
        player1result.style.backgroundColor = options.p1c;
        player1result.style.color = options.p1cc;
        player1result.innerHTML = options.p1c;

        player2color.value = options.p2c;
        player2result.style.backgroundColor = options.p2c;
        player2result.style.color = options.p2cc;
        player2result.innerHTML = options.p2c;

        player1name.addEventListener('change', function (e) {            
            localStorage.setItem('p1n', this.value);
            options.p1n = this.value;
        }, false);

        player2name.addEventListener('change', function (e) {
            localStorage.setItem('p2n', this.value);
            options.p2n = this.value;
        }, false);

        player1image.addEventListener('change', function (e) {
            handleImage(e, player1canvas, 'p1i');
        }, false);

        player2image.addEventListener('change', function (e) {
            handleImage(e, player2canvas, 'p2i');
        }, false);

        d.getElementById('player2').addEventListener('click', function () {
            initGame(2);
        }, false);

        d.getElementById('player1').addEventListener('click', function () {
            initGame(1);
        }, false);

        d.getElementById('how2play').addEventListener('click', function () {
            alert('Coming soon')
        }, false);

        d.getElementById('customization').addEventListener('click', function () {
            customize.style.display = 'block';
            drawImage(options.p1i, player1canvas);
            drawImage(options.p2i, player2canvas);
        }, false);

        d.getElementById('customizeclose').addEventListener('click', function () {
            customize.style.display = 'none';
        }, false);

        player1color.addEventListener('change', function (e) {
            var val = this.value;
            if (validateHEX(val)) {
                options.p1c = val;
                options.p1cc = getContrastColor(val);
                localStorage.setItem('p1c', val);
                player1result.style.backgroundColor = options.p1c;
                player1result.style.color = options.p1cc;
                player1result.innerHTML = options.p1c;
            }
        }, false);

        player2color.addEventListener('change', function (e) {
            var val = this.value;
            if (validateHEX(val)) {
                options.p2c = val;
                options.p2cc = getContrastColor(val);
                localStorage.setItem('p2c', val);
                player2result.style.backgroundColor = options.p2c;
                player2result.style.color = options.p2cc;
                player2result.innerHTML = options.p2c;
            }
        }, false);
        //
    }

    function initImages(i) {
        var p1image = localStorage.getItem('p1i'),
            p2image = localStorage.getItem('p2i');

        if (p1image) {
            options.p1i = new Image();
            options.p1i.src = p1image;
        } else {
            options.p1i = i.p1;
        }

        if (p2image) {
            options.p2i = new Image();
            options.p2i.src = p2image;
        } else {
            options.p2i = i.p2;
        }
        options.biohazard = i.biohazard;
    }

    function initColors() {
        var p1color = localStorage.getItem('p1c'),
            p2color = localStorage.getItem('p2c');

        if (validateHEX(p1color)) {
            options.p1c = p1color;
        } else {
            options.p1c = '#990800';//'#FB0F03'
        }

        if (validateHEX(p2color)) {
            options.p2c = p2color;
        } else {
            options.p2c = '#370667';// '#5D0EA9'
        }
        options.p1cc = getContrastColor(options.p1c);
        options.p2cc = getContrastColor(options.p2c);
    }

    function init() {
        initColors();
        options.p1n = localStorage.getItem('p1n') || 'Player 1';
        options.p2n = localStorage.getItem('p2n') || 'Player 2';

        makeImages({
            p1: 'img/craycray.jpg',
            p2: 'img/spiral.jpg',
            biohazard: 'img/biohazard.png'
        }, function (i) {
            initImages(i);
            initElements();
        });

        makeAudio({
            bounce: 'sound/bat.mp3',
            //bgmusic: 'sound/Nameless-the_Hackers.mp3'
        }, function (a) {
            Otbo.sound = a;
        });
    }
    init();
}(window, document));