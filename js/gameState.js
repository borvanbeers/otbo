Otbo.gameState = (function (g) {
    //Singleton pattern - restricts object creation for a "javascriptclass" to only one instance
    var instance,
        canvas,
        ctx,
        pause = true,
        update,
        draw;

    // constructor
    function gameState(c) {
        if (instance) {
            return instance;
        }
        instance = this;

        canvas = c;
        ctx = c.getContext('2d');
    }
    gameState.prototype.start = function (state, options) {
        if (options) {
            if (options.update) update = options.update;
            if (options.draw) draw = options.draw;
        }
        this.state = state;

        if (pause) {
            pause = false;
            queue();
        }
    }
    gameState.prototype.stop = function () {
        pause = true;
    }

    function loop() {

        if (!pause) {
            clear();
            update && update();
            draw && draw();
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