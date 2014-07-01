(function(){
	var wolfImages = ["CrazyWolf.jpg", "CrazyWolf.jpg", "CrazyWolf.jpg", "CrazyWolf.jpg"];

	makeImages(wolfImages,function(img){
		console.log(img.CrazyWolf.src);
	});

	function makeImages(images, callback)
	{
		var result = {};
		var loadCount = 0;
		var imagesToLoad = images.length;
		
		for(var i = imagesToLoad; i--;)
		{
			source = images[i];
			var name = source.split(".")[0];
			console.log(name);
			var img = new Image();			
			img.onload = function () {
				if (++loadCount >= imagesToLoad) {
					callback(result);
				}
			};
			img.src = images[i];
			result[name] = img;
		}
		console.log("Loop ended");
	}
}());