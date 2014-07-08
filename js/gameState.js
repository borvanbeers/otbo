Otbo.gameState = (function (g) {
    //Singleton pattern - restricts object creation for a "javascriptclass" to only one instance
    var instance,
        canvas,
        ctx,
        states,
        pause = true,
        update;

    // constructor
    function gameState(c, s) {
        canvas = c;
        ctx = c.getContext('2d');
        states = s || {};

        if (instance) {
            return instance;
        }
        instance = this;
    }
    gameState.prototype.start = function (state) {
        this.state = state;
        update = states[this.state];

        if (pause) {
            pause = false;
            queue();
        }
    }
    gameState.prototype.stop = function () {
        pause = true;
    }
    gameState.prototype.isState = function (state) {
        return this.state === state
    }

    function loop() {

        if (!pause) {
            clear();
            update && update();
            queue();
        }
    }
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function queue() {
        g.requestAnimationFrame(loop);
    }

    return gameState;
})(window);