//Config

let RTSPaddress = "rtsp://admin:briciola2015!@82.62.31.20:554/media/video2"
let snapWidth = 1280
let snapHeight = 720

//Snap

function snap(){
                
    let video = document.querySelector('video')
    let canvas = document.createElement('canvas')
    
    canvas.width = snapWidth
    canvas.height = snapHeight
    let ctx = canvas.getContext('2d')
    
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    //convert to desired file format
    let dataURI = canvas.toDataURL('image/jpeg')
    
    console.log(dataURI)

    const link = document.createElement('a')
    link.download = 'snap.png'
    link.href = dataURI
    link.click()
    link.delete
}
function loaded(){
    document.querySelector("#snap").disabled = false;
    document.querySelector(".loader").style.display = "none";    
}
// Extracted from RTSPtoWeb

let mseQueue = [],
mseSourceBuffer,
mseStreamingStarted = false;

function startPlay() {
    let videoEl = document.querySelector('#videoPlayer');
    let url = 'ws://svn.ns0.it:8083/stream/otacos/channel/0/mse?uuid=otacos&channel=0';

    //location.protocol == 'https:' ? protocol = 'wss' : protocol = 'ws';
    let mse = new MediaSource();
    //videoEl.src = window.URL.createObjectURL(mse);
    videoEl.src = window.URL.createObjectURL(mse);

    mse.addEventListener('sourceopen', function() {
    
        let ws = new WebSocket(url);
        ws.binaryType = 'arraybuffer';
        ws.onopen = function(event) {
            console.log('Connect to ws');
        }
        ws.onmessage = function(event) {
            let data = new Uint8Array(event.data);
            if (data[0] == 9) {
                decoded_arr = data.slice(1);
                if (window.TextDecoder) {
                    mimeCodec = new TextDecoder('utf-8').decode(decoded_arr);
                } else {
                    mimeCodec = Utf8ArrayToStr(decoded_arr);
                }
                mseSourceBuffer = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
                mseSourceBuffer.mode = 'segments'
                mseSourceBuffer.addEventListener('updateend', pushPacket);

            } else {
                readPacket(event.data);
            }
        };
    }, false);

}

function pushPacket() {
    let videoEl = document.querySelector('#videoPlayer');

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


document.addEventListener('DOMContentLoaded', function() {
    let videoEl = document.querySelector('#videoPlayer');

    videoEl.addEventListener('loadeddata', () => {
        videoEl.play();
        loaded();
    });

    //fix stalled video in safari
    videoEl.addEventListener('pause', () => {
        if (videoEl.currentTime > videoEl.buffered.end(videoEl.buffered.length - 1)) {
            videoEl.currentTime = videoEl.buffered.end(videoEl.buffered.length - 1) - 0.1;
            videoEl.play();
        }
    });

    videoEl.addEventListener('error', (e) => {
        console.log('video_error', e)
    });

    startPlay();

});
