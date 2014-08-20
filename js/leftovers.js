/* /
//ctx.drawImage(Otbo.img.CrazyWolf, 0, 0);
var pattern = ctx.createPattern(Otbo.img.CrazyWolf, 'repeat');
ctx.rect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = pattern;
ctx.fill();
/* */
/* /
ctx.beginPath();
ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, false);
ctx.fillStyle = ball.color;
ctx.shadowBlur = 5;
ctx.shadowColor = ball.color;
ctx.fill();
ctx.shadowBlur = 0;//reset shadowblur
/* */
/* /
'#32cd32',
'#'+Math.floor(Math.random()*16777215).toString(16)
/* */
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