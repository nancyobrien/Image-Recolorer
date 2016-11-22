var origData = false;
var referenceData = false;
var colorData = {};
var profileData = false;
var origBrightness = false;
var singleUse = false;
var unweighted = true;
var $loader = false;
var filteredBrightness = [];

$(document).ready(function() {
	$loader = $('.loading');

	$('.fileUpload').change(function(e) {
		var file = this.files[0];
		if (!file) {return;}
		showLoad()
		var fr = new FileReader();
		fr.onload = loadImage; // onload fires after reading is complete
		fr.readAsDataURL(file); // begin reading
	})

	$('.fileReference').change(function(e) {
		var file = this.files[0];
		if (!file) {return;}
		showLoad();
		var fr = new FileReader();
		fr.onload = function(event) {	// onload fires after reading is complete
			loadImage(event,loadReferenceData)
		} 
		fr.readAsDataURL(file); // begin reading
	})



	$('.grayscale').click(function(e) {
		e.preventDefault();
		showLoad();
		setTimeout(function(){grayScale();}, 100);
	})
	$('.recolor').click(function(e) {
		e.preventDefault();
		showLoad();
		setTimeout(function(){recolor2();}, 100);
	})
	$('.restore').click(function(e) {
		e.preventDefault();
		showLoad();
		setTimeout(function(){restore();}, 100);
	})
})

function showLoad() {
	$loader.show();
}

function hideLoad() {
	setTimeout(function(){$loader.hide();}, 250);
	

}

function imageLoaded(event) {
	var img = event.target;
	var canvas = document.getElementById('myCanvas');
	canvas.width = img.width; // set canvas size big enough for the image
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0); // draw the image

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	origData = imageData.data;

	origBrightness = getBrightness(canvas);
	hideLoad();
}

function loadImage(event, callback) {
	if (!callback) {callback = imageLoaded;}
	img = new Image();
	img.onload = callback;
	img.src = event.target.result;
	//$('.fileUpload').hide();
	$('.grayscale').show();
}

function loadReferenceData(event) {
	var img = event.target;
	var canvas = document.getElementById('colorProfile'); //$('<canvas/>')[0];
	canvas.width = img.width; // set canvas size big enough for the image
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0); // draw the image

	filteredBrightness = [];
	referenceData = getBrightness(canvas);

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	profileData = imageData.data;
	hideLoad();
}


function getBrightness(canvas) {
	var brightData = [];
	var ctx = canvas.getContext("2d");
	var x = 0;
	var y = 0;

	var imageData = ctx.getImageData(x, y, canvas.width, canvas.height);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var brightness = calcBrightness(data[i], data[i + 1], data[i + 2]);
		var dataArray = [data[i] , data[i + 1] , data[i + 2]];
		if (!brightData[brightness]) {
			brightData[brightness] = [];
		}
		brightData[brightness].push(dataArray);
	}

	return brightData;
}

function calcBrightness(r,g,b) {
	return Math.ceil(0.34 * r + 0.5 * g + 0.16 * b);
	//return Math.ceil((r + g + b)/3);
}

function grayScale() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	var x = 0;
	var y = 0;

	
	var imageData = ctx.getImageData(x, y, canvas.width, canvas.height);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var brightness = calcBrightness(data[i], data[i + 1], data[i + 2]);

		if (!colorData[brightness]) {
			colorData[brightness] = [];
		}
		colorData[brightness].push([data[i] , data[i + 1] , data[i + 2]]);
		// red
		data[i] = brightness;
		// green
		data[i + 1] = brightness;
		// blue
		data[i + 2] = brightness;
	}

	// overwrite original image
	ctx.putImageData(imageData, x, y);
	hideLoad();
}
function restore() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		// red
		data[i] = origData[i];
		// green
		data[i + 1] = origData[i+1];
		// blue
		data[i + 2] = origData[i+2];
	}

	// overwrite original image
	ctx.putImageData(imageData, 0, 0);
	hideLoad();
}



function recolor2() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	var x = 0;
	var y = 0;

	singleUse = $('#singleUse').prop('checked');
	unweighted = $('#unweighted').prop('checked');
	randomFlag = $('#random').prop('checked');
	reverseFlag = $('#reverse').prop('checked');
	var tempRef = referenceData;

	var imageData = ctx.getImageData(x, y, canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		var newData = [origData[i] , origData[i + 1] , origData[i + 2]];

		if (randomFlag) {
			var ranIndex = Math.floor(Math.random() * (data.length - 4))
			while ((ranIndex % 3) != 0) {
				ranIndex += 1;
			}
			newData = [origData[ranIndex] , origData[ranIndex + 1] , origData[ranIndex + 2]];
		} else {

			var brightness = calcBrightness(origData[i], origData[i + 1], origData[i + 2]);

			if (reverseFlag) {
				brightness = 255 - brightness;
			}

			if (brightness >= referenceData.length ) {
				brightness = referenceData.length - (origBrightness.length - brightness);
			}

			while (!referenceData[brightness]) {
				brightness += 1;
			}

			var brightList = tempRef[brightness];
			if (unweighted) {
				if (!filteredBrightness[brightness]) {
					filteredBrightness[brightness] = uniqueArray(brightList);
				}
				brightList = filteredBrightness[brightness];
			}

			if (referenceData[brightness]) {
				var ran = Math.floor(Math.random() * brightList.length);
				newData = brightList[ran];
				if (singleUse && brightList.length > 10) {
					brightList.splice(ran, 1)
				}
			} else {
				console.log('cant find ' + brightness);
			}
			if ((data[i] == newData[0]) && (data[i+1] == newData[1]) && (data[i+2] == newData[2])) {
				var xxx= 1;
			}
			if ((data[i] != newData[0]) || (data[i+1] != newData[1]) || (data[i+2] != newData[2])) {
				var xxx= 1;
			}

		}

		// red
		data[i] = newData[0];
		// green
		data[i + 1] = newData[1];
		// blue
		data[i + 2] = newData[2];
	}

	// overwrite original image
	ctx.putImageData(imageData, x, y);
	hideLoad();
}


function recolor() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	var x = 0;
	var y = 0;

	
	var imageData = ctx.getImageData(x, y, canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		var newData = [data[i] , data[i + 1] , data[i + 2]];
		var brightness = data[i]; //0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
		if (referenceData[brightness]) {
			var ran = Math.floor(Math.random() * referenceData[brightness].length);
			newData = referenceData[brightness][ran];
		}
		// red
		data[i] = newData[0];
		// green
		data[i + 1] = newData[1];
		// blue
		data[i + 2] = newData[2];
	}

	// overwrite original image
	ctx.putImageData(imageData, x, y);
	hideLoad();
}

function uniqueArray(array) {
	var tempArr = [];
	var distinctArr = array.filter(function(el) {
		var arrString = el.toString();
		var isDup = true;
		if (tempArr.indexOf(arrString) === -1) {
			tempArr.push(arrString);
			isDup = false;
		}
        return !isDup;
    });

    return distinctArr;
}

/*Array.prototype.getUnique = function(){
   return this.filter(function(el, index, arr) {
        return index === arr.indexOf(el);
    });
}*/