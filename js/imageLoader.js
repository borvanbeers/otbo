var loadCount = 0;
var imagesToLoad = 0;

function init()
{
	imagesToLoad = 1;

	wolfImage = preload("CrazyWolf.jpg");
}

function preload(path)
{
        img = new Image();
        img.src = path;
        img.onload = itemLoaded;
        return img;
};

function itemLoaded(event) 
{
        loadCount++;
        console.log("Loading:" + loadCount);

        if (loadCount == imagesToLoad) 
        {
            console.log("All images are loaded!");
	        //Images done loading 
	        //Start next function
            nextFuntion();
        }
};

function nextFuntion()
{
    console.log("Next function called!");
}