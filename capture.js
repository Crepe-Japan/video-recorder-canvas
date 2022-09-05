let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let pauseButton = document.getElementById("pauseButton");
let downloadButton = document.getElementById("downloadButton");
let statusText = document.getElementById("status");
let logElement = document.getElementById("log");
const canvas = document.getElementById("c1");
/* const cameraOptions = document.querySelector('.video-options>select'); */
const cameraOptions = document.getElementById('camera-select');
// Optional frames per second argument.
const canvasStream = canvas.captureStream(25);


let recordingTimeMS = 5000;
const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    });


    cameraOptions.innerHTML = options.join('');


};
getCameraSelection()


window.addEventListener("DOMContentLoaded", () => {
    getCameraSelection();
    startStream()
})

startButton.addEventListener("click", () => {
    cameraOptions.disabled = true
    pauseButton.disabled = true
    statusText.innerHTML = 'Recording Started'
    startRecording(canvasStream, recordingTimeMS)
        .then((recordedChunks) => {
            let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
            recording.src = URL.createObjectURL(recordedBlob);
            downloadButton.href = recording.src;
            downloadButton.download = "RecordedVideo.webm";

            log(`Successfully recorded ${recordedBlob.size} bytes of ${recordedBlob.type} media.`);
        })
        .catch((error) => {
            if (error.name === "NotFoundError") {
                log("Camera or microphone not found. Can't record.");
            } else {
                log(error);
            }
        });
}, false);

pauseButton.addEventListener("click", () => {
    /* stop(preview.srcObject); */
    pause(preview)
    cameraOptions.disabled = false
}, false);

/* cameraOptions.onchange = () => {
    startStream()
} */

const startStream = () => {
    console.log("Start Stream")
    getCameraSelection()
    navigator.mediaDevices.getUserMedia({
        video: true,

        /*   audio: true */
    }).then((stream) => {
        preview.srcObject = stream;
        downloadButton.href = stream;
        /* preview.captureStream = preview.captureStream || preview.mozCaptureStream; */
        return new Promise((resolve) => preview.onplaying = resolve);
    })
}



function log(msg) {
    //logElement.innerHTML += `${msg}\n`;
}

function wait(delayInMS) {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
    let recorder = new MediaRecorder(stream);
    let data = [];

    recorder.ondataavailable = (event) => data.push(event.data);
    recorder.start();
    log(`${recorder.state} for ${lengthInMS / 1000} seconds…`);

    let stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = (event) => reject(event.name);
    });

    let recorded = wait(lengthInMS).then(
        () => {
            if (recorder.state === "recording") {
                cameraOptions.disabled = false
                pauseButton.disabled = false
                statusText.innerHTML = 'Recording Finished'
                recorder.stop();
            }
        },
    );

    return Promise.all([
        stopped,
        recorded
    ])
        .then(() => data);
}

function stop(stream) {
    stream.getTracks().forEach((track) => track.stop());
}

function pause(video) {
    if (video.paused) {
        video.load()
    } else video.pause()

}




