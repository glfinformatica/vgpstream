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

//MIN_PLAYER.JS

//Status constants
let SESSION_STATUS = Flashphoner.constants.SESSION_STATUS
let STREAM_STATUS = Flashphoner.constants.STREAM_STATUS
let session
let PRELOADER_URL = "https://github.com/flashphoner/flashphoner_client/raw/wcs_api-2.0/examples/demo/dependencies/media/preloader.mp4"
 
//Init Flashphoner API on page load
function init_api() {
    Flashphoner.init({})
    //Connect to WCS server over websockets
    session = Flashphoner.createSession({
        urlServer: "wss://demo.flashphoner.com" //specify the address of your WCS
    }).on(SESSION_STATUS.ESTABLISHED, function(session) {
        console.log("ESTABLISHED")
    });
 
    playBtn.onclick = playClick
}
 
//Detect browser
let Browser = {
    isSafari: function() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    },
}

function playClick() {
    document.getElementById('snap').disabled = false
    if (Browser.isSafari()) {
        Flashphoner.playFirstVideo(document.getElementById('play'), true, PRELOADER_URL).then(function() {
            playStream()
        });
    } else {
        playStream()
    }
    document.getElementById('playBtn').disabled = true
}
 
//Playing stream
function playStream() {
    session.createStream({
        name: RTSPaddress, //specify the RTSP stream address
        display: document.getElementById('play'),
    }).play()
}

