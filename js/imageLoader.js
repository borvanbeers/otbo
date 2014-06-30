var images = ["CrazyWolf.jpg", "CrazyWolf.jpg", "CrazyWolf.jpg", "CrazyWolf.jpg"];
var name = "";

var loadCount = 0;
var imagesToLoad = images.length;

function preload(path)
{
        img = new Image();
        img.src = path;
        img.onload = imageLoaded;
        return img;
};

function imageLoaded(event) 
{
        loadCount++;
        console.log("Loading:" + loadCount);

        if (loadCount == imagesToLoad) 
        {
            console.log("All images are loaded!");
	        //Images done loading 
	        //Start next function
        }
};

function makeImages()
{
    for(var i = images.length; i > 0; i--)
    {
        source = images.shift();
        preload(source);
        var name = source.replace(".jpg", "Image");
        console.log(name);

        //make vars with as name, var name

        if(i==0) console.log("Loop ended");
    }
}



