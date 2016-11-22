var origData = false;
var referenceData = false;
var referenceHue = false;
var colorData = {};
var profileData = false;
var origBrightness = false;
var origHue = false;
var singleUse = false;
var unweighted = true;
var $loader = false;
var filteredBrightness = [];
var hueMultiplier = 1;
var brightnessMultiplier = 1000;

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

	$('.rangeCtrl').each(function() {
		$(this).siblings('label').html($(this).val());
	})

	$('.rangeCtrl').on('input', function(e) {
		$(this).siblings('label').html($(this).val());
	})

	$('.rangeCtrl').change(function(e) {
		$(this).siblings('label').html($(this).val());
	})

	$('#hueMatch').change(function() {
		referenceHue = getHue(document.getElementById('colorProfile'));
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
	$('.recolorHue').click(function(e) {
		e.preventDefault();
		showLoad();
		setTimeout(function(){recolorHue();}, 100);
	})
	$('.recolorOverlay').click(function(e) {
		e.preventDefault();
		showLoad();
		setTimeout(function(){recolorOverlay();}, 100);
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
	var size = {};
	var img = event.target;
	var canvas = document.getElementById('myCanvas');
	var overlayCanvas = document.getElementById('overlayCanvas');
	size.width = $(canvas).parent().width() - 20;
	size.height = $(canvas).parent().height() - 20;
	canvas.width = img.width; // set canvas size big enough for the image
	canvas.height = img.height;
	overlayCanvas.width = img.width; // set canvas size big enough for the image
	overlayCanvas.height = img.height;
	if (img.width < img.height) {
		$('.displayCanvas').css('width', size.width + 'px');
		$('.displayCanvas').css('height', (img.height/img.width * size.width) + 'px');
	} else {
		$('.displayCanvas').css('height', size.height + 'px');
		$('.displayCanvas').css('width', (img.width/img.height * size.height) + 'px');
	}
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0); // draw the image
	var octx = overlayCanvas.getContext("2d");
	octx.drawImage(img, 0, 0); // draw the image

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	origData = imageData.data;

	origBrightness = getBrightness(canvas);
	origHue = getHue(canvas);
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
	referenceData = [];
	referenceHue = [];

	referenceData = getBrightness(canvas);
	referenceHue = getHue(canvas);

	//var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	//profileData = imageData.data;
	hideLoad();
}


function getBrightness(canvas) {
	var brightData = [];
	var ctx = canvas.getContext("2d");

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var brightness = Math.ceil(calcBrightnessArray([data[i], data[i + 1], data[i + 2]], true) * brightnessMultiplier);
		var dataArray = [data[i] , data[i + 1] , data[i + 2]];
		if (!brightData[brightness]) {
			brightData[brightness] = [];
		}
		brightData[brightness].push(dataArray);
	}

	return brightData;
}

function getHue(canvas) {	
	var hueData = [];
	var ctx = canvas.getContext("2d");

	var hueSwitch = $('#hueMatch').val();

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var dataArray = [data[i] , data[i + 1] , data[i + 2]];
		var hsl = rgb2hsl(dataArray);
		var hue = Math.floor(hsl[hueSwitch]*hueMultiplier);
		if (!hueData[hue]) {
			hueData[hue] = [];
		}
		hueData[hue].push(dataArray);
	}

	return hueData;

}

function calcBrightnessArray(rgb, sendRaw) {
	var bright = (0.34 * rgb[0] + 0.5 * rgb[1] + 0.16 * rgb[2]);
	if(sendRaw) {
		return bright;
	} else {
		return Math.ceil(bright);
	}
}

function calcBrightness(r,g,b) {
	return calcBrightnessArray([r,g,b]);
}

function hideOverlay() {
	var overlayCanvas = document.getElementById('overlayCanvas');

	$(overlayCanvas).hide();
}
function showOverlay() {
	var overlayCanvas = document.getElementById('overlayCanvas');

	$(overlayCanvas).show();
}

function grayScale() {
	hideOverlay();
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var brightness = calcBrightness(data[i], data[i + 1], data[i + 2]);

		// if (!colorData[brightness]) {
		// 	colorData[brightness] = [];
		// }
		// colorData[brightness].push([data[i] , data[i + 1] , data[i + 2]]);
		// red
		data[i] = brightness;
		// green
		data[i + 1] = brightness;
		// blue
		data[i + 2] = brightness;
	}

	// overwrite original image
	ctx.putImageData(imageData, 0, 0);
	hideLoad();
}
function restore() {
	hideOverlay();
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



function recolorHue() {
	hideOverlay();
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");


	var hueSwitch = $('#hueMatch').val();

	singleUse = $('#singleUse').prop('checked');
	unweighted = $('#unweighted').prop('checked');
	recursiveFlag = $('#recursive').prop('checked');
	reverseFlag = $('#reverse').prop('checked');
	var tempRef = referenceHue;

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {

		var origDataPt = [origData[i] , origData[i + 1] , origData[i + 2]];
		if (recursiveFlag) {
			origDataPt = [data[i] , data[i + 1] , data[i + 2]];
		}
		var newData = origDataPt;

		var hsl = rgb2hsl(origDataPt);
		var hue = Math.floor(hsl[hueSwitch]*hueMultiplier);

		if (hue >= referenceHue.length ) {
			hue = referenceHue.length - (origHue.length - hue);
		}

		while (!referenceHue[hue]) {
			hue += 1;
			if (hue >= referenceHue.length ) {
				hue = referenceHue.length - 1;
			}
		}

		var hueList = tempRef[hue];


		if (referenceHue[hue]) {
			var ran = Math.floor(Math.random() * hueList.length);
			newData = hueList[ran];
		} else {
			console.log('cant find ' + brightness);
		}		


		if ($('#weightHue').prop('checked')) {
			var hsl2 = rgb2hsl(newData);
			//hsl2[1] = hsl[1];
			hsl2[1] = hsl[1] + (hsl2[1] - hsl[1])/($('#weightHueValue').val());
			//hsl2[2] = hsl[2] + (hsl2[2] - hsl[2])/($('#weightHueValue').val());
			tmpData = hsl2Rgb(hsl2);
			newData = [tmpData.r, tmpData.g, tmpData.b];

		}

		// red
		data[i] = newData[0];
		// green
		data[i + 1] = newData[1];
		// blue
		data[i + 2] = newData[2];
	}

	// overwrite original image
	ctx.putImageData(imageData, 0, 0);
	hideLoad();
}


function recolor2() {
	hideOverlay();
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");

	singleUse = $('#singleUse').prop('checked');
	unweighted = $('#unweighted').prop('checked');
	recursiveFlag = $('#recursive').prop('checked');
	reverseFlag = $('#reverse').prop('checked');
	var tempRef = referenceData;

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	for (var i = 0; i < data.length; i += 4) {
		var origDataPt = [origData[i] , origData[i + 1] , origData[i + 2]];

		var newData = origDataPt;

		if (recursiveFlag) {
			origDataPt = [data[i] , data[i + 1] , data[i + 2]];
		}


		var brightness = Math.ceil(calcBrightnessArray(origDataPt, true) * brightnessMultiplier); //calcBrightness(origData[i], origData[i + 1], origData[i + 2]);

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


		

		// red
		data[i] = newData[0];
		// green
		data[i + 1] = newData[1];
		// blue
		data[i + 2] = newData[2];
	}

	// overwrite original image
	ctx.putImageData(imageData, 0, 0);
	hideLoad();
}

function recolorOverlay() {
	var canvas = document.getElementById('myCanvas');
	var overlayCanvas = document.getElementById('overlayCanvas');
	var ctx = canvas.getContext("2d");
	var octx = overlayCanvas.getContext("2d");


	var hueSwitch = $('#hueMatch').val();
	singleUse = $('#singleUse').prop('checked');
	unweighted = $('#unweighted').prop('checked');
	recursiveFlag = $('#recursive').prop('checked');
	reverseFlag = $('#reverse').prop('checked');

	var overlayOpacity = $('#overlayOpacity').val();

	//var tempRef = referenceData;

	var overlayData = octx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
	var data = overlayData.data;

	//grayScale();  //Grayscale the base layer
	showOverlay();

	for (var i = 0; i < data.length; i += 4) {

		var origDataPt = [origData[i] , origData[i + 1] , origData[i + 2]];
		if (recursiveFlag) {
			origDataPt = [data[i] , data[i + 1] , data[i + 2]];
		}
		var newData = origDataPt;

		var hsl = rgb2hsl(origDataPt);
		var hue = Math.floor(hsl[hueSwitch]*hueMultiplier);

		if (hue >= referenceHue.length ) {
			hue = referenceHue.length - (origHue.length - hue);
		}

		while (!referenceHue[hue]) {
			hue += 1;
			if (hue >= referenceHue.length ) {
				hue = referenceHue.length - 1;
			}
		}

		if (referenceHue[hue]) {
			var hueList = referenceHue[hue];
			var ran = Math.floor(Math.random() * hueList.length);
			newData = hueList[ran];
		} else {
			console.log('cant find ' + brightness);
		}		

		var srcPt = calcBrightnessArray(origDataPt, true);
		var destPt = calcBrightnessArray(newData, true);
		// var srcPt = hsl[2];
		// var destPt = rgb2hsl(newData)[2];

		var pct = 1 - Math.abs((destPt - srcPt)/srcPt);


		// red
		data[i] = newData[0];
		// green
		data[i + 1] = newData[1];
		// blue
		data[i + 2] = newData[2];

		data[i + 3] = 255 * pct * overlayOpacity;
	}

	// overwrite original image
	octx.putImageData(overlayData, 0, 0);
	hideLoad();
}


function recolor() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
	ctx.putImageData(imageData, 0, 0);
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


function rgb2hsl(rgbArr){
    var r1 = rgbArr[0] / 255;
    var g1 = rgbArr[1] / 255;
    var b1 = rgbArr[2] / 255;
 
    var maxColor = Math.max(r1,g1,b1);
    var minColor = Math.min(r1,g1,b1);
    //Calculate L:
    var L = (maxColor + minColor) / 2 ;
    var S = 0;
    var H = 0;
    if(maxColor != minColor){
        //Calculate S:
        if(L < 0.5){
            S = (maxColor - minColor) / (maxColor + minColor);
        }else{
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if(r1 == maxColor){
            H = (g1-b1) / (maxColor - minColor);
        }else if(g1 == maxColor){
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        }else{
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }
 
    L = L * 100;
    S = S * 100;
    H = H * 60;
    if(H<0){
        H += 360;
    }
    var result = [H, S, L];
    return result;
}


function hsl2Rgb(hsl){

	var h = hsl[0];
	var s = hsl[1];
	var l = hsl[2];

    var r, g, b, m, c, x

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }

    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return { r: r, g: g, b: b }

}