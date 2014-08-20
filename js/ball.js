Otbo.ball = (function () {
    // constructor
    function ball(x, y, radiusMass, velX, velY, owner) {
        this.position = new Otbo.vector(x, y);
        //Store the last 5 positions of the ball
        this.lastPositions = [];
        this.velocity = new Otbo.vector(velX, velY);
        this.radius = radiusMass;
        this.mass = radiusMass;
        //this.setColor(color);
        this.owner = owner;
        this.isScore = false;
        this.lifeTime = 0;
    }
    ball.prototype.setX = function (x) { this.position.setX(x); }
    ball.prototype.setY = function (y) { this.position.setY(y); }
    ball.prototype.getX = function () { return this.position.getX(); }
    ball.prototype.getY = function () { return this.position.getY(); }
    ball.prototype.setLastPosition = function (pos) {
        if (this.lastPositions.length >= 5) {
            this.lastPositions.unshift(pos);
            this.lastPositions.pop();
        } else {
            this.lastPositions.unshift(pos);
        }
    }
    ball.prototype.getLastPosition = function (idx) {
        return this.lastPositions[idx];
    }
    ball.prototype.life = function (life) { return this.lifeTime += life; }
    return ball;
})();