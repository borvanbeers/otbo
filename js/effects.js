Otbo.ring = (function () {
    var maxRings = 3;
    // constructor
    function ring(x, y, beginRadius, maxRadius) {
        this.position = new Otbo.vector(x, y);
        this.radius = beginRadius || 1;
        this.max = maxRadius || beginRadius + 50;
        this.frame = 0;
        this.rings = [this.radius];
        this.ringCount = 1;
        this.color = '#FFFFFF'
    }

    ring.prototype.expand = function (n) {
        n = n || 1;
        this.frame++;

        if (this.ringCount < maxRings &&
            this.frame % 10 === 0) {
            this.rings.push(this.radius);
            this.ringCount++;
        }

        for (var i = this.rings.length; i--;) {
            this.rings[i] += n;

            if (this.rings[i] > this.max) {
                this.rings.splice(i, 1);
            }
        }
        return this.rings.length === 0;
    }
    return ring;
})();