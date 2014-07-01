Otbo.ball = (function (context) {
    var position;
    var lastGoodPosition
    var velocity;
    var radius;
    var mass;
    var color;
    var x;
    var y;

    function ball(inX,inY,inRadiusMass,inVelX,inVelY, inColor) { // constructor
        this.position = new Otbo.vector();
        this.position.setX(inX);
		this.position.setY(inY);

        this.velocity = new Otbo.vector();
        this.velocity.setX(inVelX);
		this.velocity.setY(inVelY);

        this.setRadius(inRadiusMass);
        this.setMass(inRadiusMass);
        this.setColor(inColor);
    }

    ball.prototype.setX = function (inX) { this.position.setX(inX);}
    ball.prototype.setY = function (inY) { this.position.setY(inY);}

    ball.prototype.getX = function () {return this.position.getX();}
    ball.prototype.getY = function () {return this.position.getY();}

    ball.prototype.setRadius = function (inRadius) { this.radius = inRadius;}
    ball.prototype.getRadius = function () { return this.radius;}

    ball.prototype.setMass = function (inMass) { this.mass = inMass;}
    ball.prototype.getMass = function () { return this.mass;}
    ball.prototype.setColor = function (inColor) { this.color = inColor;}
    ball.prototype.getColor = function () { return this.color;}
    return ball;
})();