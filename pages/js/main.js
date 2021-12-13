//smartphone testing

// window.onerror = function(error, url, line) {
//     alert('ERRRO: ' + error);
//     alert('AT LINE: + 'line);
// };


//Config

let snapWidth = 1280
let snapHeight = 720

let videoEl = document.querySelector('#hls-video');
let inputUrl  = document.querySelector('#hls-url');

if(videoEl != undefined){

	window.addEventListener('resize', () => {
      	setDimensions();
    });
}

function flip(){
  	if(videoEl  == undefined)
		return;

  	videoEl.classList.toggle("flipped");
  
  	setDimensions();
}

function setDimensions(){
  	
	if(videoEl.classList.contains("flipped")){
    	videoEl.parentElement.style.height = videoEl.offsetWidth + 'px';
    	return
  	}

  	videoEl.parentElement.style.height = 'auto';
}

//Snap

function snap(){
    
    if(videoEl == undefined)
        return;
    
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    
    if(videoEl.classList.contains("flipped")){
        
    	canvas.width = snapHeight;
        canvas.height = snapWidth;

        var x = canvas.width / 2;
        var y = canvas.height / 2;
        var angle = 90 * Math.PI/180;

        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(videoEl, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
        ctx.rotate(angle);
        ctx.translate(-x, -y);
    }else{

        canvas.width = snapWidth;
        canvas.height = snapHeight;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    }
    
    //convert to desired file format
    let dataURI = canvas.toDataURL('image/jpeg');
    
    // console.log(dataURI)

    const link = document.createElement('a');
    link.download = 'snap.png';
    link.href = dataURI;
    link.click();
    link.delete;

}
function loaded(){
    
    let snapBtn = document.querySelector("#snap");
    if(snapBtn != undefined)
        snapBtn.disabled = false;
    
    let flipBtn = document.querySelector("#flip");
    if(flipBtn != undefined){
        flipBtn.disabled = false;
        flip();
    }
    
    let loader = document.querySelector("#loaderContainer");
    if(loader != undefined){
        loader.remove();
    }

}

// Extracted from RTSPtoWeb

document.addEventListener('DOMContentLoaded', function() {
    let videoEl = document.querySelector('#hls-video');
    let url = document.querySelector('#hls-url').value;

    videoEl.addEventListener('loadeddata', () => {
    	videoEl.play();
    	loaded();
    });

    videoEl.addEventListener('error', (e) => {
      	console.log('video_error', e)
    });

    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      	videoEl.src = url;
    } else if (Hls.isSupported()) {
		var hls = new Hls();
		hls.attachMedia(videoEl);
		hls.on(Hls.Events.MEDIA_ATTACHED, function () {
			hls.loadSource(url);
			hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          		console.log(
            		'manifest loaded, found ' + data.levels.length + ' quality level'
          		);
        	});
      	});
    }
});