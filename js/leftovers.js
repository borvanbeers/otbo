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