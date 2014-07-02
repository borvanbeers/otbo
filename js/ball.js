Otbo.ball = (function (context) {
    var position,
		lastGoodPosition,
		velocity,
		radius,
		mass,
		color,
		x,
		y,
		lifeTime;

    function ball(x,y,radiusMass,velX,velY,color) { // constructor
	//function ball(inX,inY,inRadiusMass,inVelX,inVelY, inColor) {
        this.position = new Otbo.vector();
        this.position.setX(x);
		this.position.setY(y);

        this.velocity = new Otbo.vector();
        this.velocity.setX(velX);
		this.velocity.setY(velY);

        this.setRadius(radiusMass);
        this.setMass(radiusMass);
        this.setColor(color);		
		this.lifeTime = 0;
    }

    ball.prototype.setX = function (x) { this.position.setX(x);}
    ball.prototype.setY = function (y) { this.position.setY(y);}

    ball.prototype.getX = function () {return this.position.getX();}
    ball.prototype.getY = function () {return this.position.getY();}

    ball.prototype.setRadius = function (radius) { this.radius = radius;}
    ball.prototype.getRadius = function () { return this.radius;}

    ball.prototype.setMass = function (mass) { this.mass = mass;}
    ball.prototype.getMass = function () { return this.mass;}
    ball.prototype.setColor = function (color) { this.color = color;}
    ball.prototype.getColor = function () { return this.color;}
	ball.prototype.life = function(life){ return this.lifeTime+=life;}
    return ball;
})();