Otbo.ring = (function () {
    var maxRings = 3;

    function easeOutQuad(currentIteration, startValue, changeInValue, totalIterations) {
        return -changeInValue * (currentIteration /= totalIterations) * (currentIteration - 2) + startValue;
    }

    // constructor
    function ring(x, y, beginRadius, maxRadius) {
        this.position = new Otbo.vector(x, y);
        this.radius = beginRadius || 1;
        this.max = maxRadius || beginRadius + 100;
        this.frame = 0;
        this.rings = [{ frame: 0, value: this.radius }];
        this.ringCount = 1;
        this.color = '#FFFFFF'
    }

    ring.prototype.expand = function () {
        this.frame++;

        if (this.ringCount < maxRings &&
            this.frame % 20 === 0) {
            this.rings.push({ frame: 0, value: this.radius });
            this.ringCount++;
        }

        for (var i = this.rings.length; i--;) {
            var r = this.rings[i];
            r.value = easeOutQuad(r.frame, this.radius, this.max, 100);

            if (r.value > this.max) {
                this.rings.splice(i, 1);
            } else {
                r.frame++;
            }
        }
        return this.rings.length === 0;
    }
    return ring;
})();