//Config

let snapWidth = 1280
let snapHeight = 720

let videoEl = document.querySelector('#videoPlayer');
let inputUrl  = document.querySelector('#mse-url');

if(videoEl != undefined){

    window.addEventListener('resize', () => {
        if(videoEl.classList.contains("flipped")){
            videoEl.parentElement.style.height = videoEl.offsetWidth + 'px';
        }
    });
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
function flip(){
    if(videoEl  == undefined)
        return;

    videoEl.classList.toggle("flipped");
    
    if(videoEl.classList.contains("flipped"))
        videoEl.parentElement.style.height = videoEl.offsetWidth + 'px';
    else
        videoEl.parentElement.style.height = 'auto';
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

let mseQueue = [],
mseSourceBuffer,
mseStreamingStarted = false;

function startPlay() {
    if(videoEl == undefined || inputUrl == undefined)
        return

    let url = inputUrl.value;
    let mse = new MediaSource();
    videoEl.src = window.URL.createObjectURL(mse);

    mse.onsourceopen = () => {
    
        let ws = new WebSocket(url);
        ws.binaryType = 'arraybuffer';
        
        ws.onopen = (event) => {
            console.log('Connect to ws');
        }

        ws.onmessage = (event) => {
            let data = new Uint8Array(event.data);

            if (data[0] != 9){
                readPacket(event.data);
                return;
            }
            
            decoded_arr = data.slice(1);
            mimeCodec = (window.TextDecoder) ? new TextDecoder('utf-8').decode(decoded_arr) : Utf8ArrayToStr(decoded_arr);

            mseSourceBuffer = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
            mseSourceBuffer.mode = 'segments';
            mseSourceBuffer.onupdateend = () => { pushPacket() };
        };
    }, false;

}

function pushPacket() {

    if (!mseSourceBuffer.updating) {
        if (mseQueue.length > 0) {
            packet = mseQueue.shift();
            mseSourceBuffer.appendBuffer(packet);
        } else {
            mseStreamingStarted = false;
        }
    }
    if (videoEl.buffered.length <= 0) 
        return
    
    if (typeof document.hidden !== 'undefined' && document.hidden) {
        //no sound, browser paused video without sound in background
        videoEl.currentTime = videoEl.buffered.end((videoEl.buffered.length - 1)) - 0.5;
    }
}

function readPacket(packet) {
    
    if (!mseStreamingStarted) {
        mseSourceBuffer.appendBuffer(packet);
        mseStreamingStarted = true;
        return;
    }
    
    mseQueue.push(packet);
    
    if (!mseSourceBuffer.updating) {
        pushPacket();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    if(videoEl == undefined || inputUrl == undefined)
        return

    videoEl.addEventListener('loadeddata', () => {

        videoEl.play();
        loaded();
    });

    //fix stalled video in safari
    videoEl.addEventListener('pause', () => {

        if (videoEl.currentTime <= videoEl.buffered.end(videoEl.buffered.length - 1)) 
            return     
               
        videoEl.currentTime = videoEl.buffered.end(videoEl.buffered.length - 1) - 0.1;
        videoEl.play();
    });

    videoEl.addEventListener('error', (e) => {

        console.log('video_error', e)
    });

    startPlay();

});
