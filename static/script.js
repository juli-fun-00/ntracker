// функция генерирует рандомный id
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


// функция отправляет uuid и точки, ожидает и отображает картинку
async function getFace(uuid, imageBlob, points) {
    console.log("sending " + uuid + " and waiting for the pic")
    let formData = new FormData();
    formData.set("image", imageBlob, uuid + ".png");
    formData.set("points", JSON.stringify({points: points}))
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    let result = await response.json()
    let img = document.querySelector("#screenshot img");
    $(img).src = 'data:image/png;base64,' + result["encoded_image"];
    $(img).show() // todo hide on start probably
}


function extractPoints(recData) {
    console.log("extracting points from recorded data of length ", recData.length)
    let points = [];
    for (const key in recData) {
        if (recData.hasOwnProperty(key)) {
            points.push([recData[key]["docX"], recData[key]["docY"]])
        }
    }
    return points
}

$(() => {
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const recording = document.querySelector("#recording");
    let isCalibrating = false
    let calibratingButtonPressed = true;
    // GazeCloudAPI.UseClickRecalibration = true;

    // RecorderAPI callbacks
    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
        stop();
    }
    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
        stop();
    }
    // GazeCloudAPI.OnResult = (result) => {
    //     console.log("OnResult invoked, result: ", result)
    // }

    // hide on page load
    $(img).hide();
    $(recording).hide();

    function upload(){
        console.log("UPLOAD function");
        const id = uuidv4();
        const sessionReplayData = GazeRecorderAPI.GetRecData();

        canvas.toBlob((blob) => getFace(id, blob, extractPoints(sessionReplayData.gazeevents)));
    }

    function stop() {
        console.log("STOP function");
        GazeRecorderAPI.StopRec();
        GazeCloudAPI.StopEyeTracking();
        isCalibrating = false;
        $(recording).hide();
        // GazePlayer.SetContainer(document.getElementById("id"));
    }

    function stopAndUpload(){
        stop();
        upload();
    }

    function start() {
        console.log("START function")
        isCalibrating = true
        GazeCloudAPI.StartEyeTracking();

        GazeCloudAPI.OnCalibrationComplete = () => {
            console.log('Calibration Complete')
            GazeRecorderAPI.Rec();
            $(recording).show();
            setTimeout(stopAndUpload, 1000);
        };

    }

    const constraints = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
    });


    // onclick listeners
    document.addEventListener('keydown', event => {
        if (event.code === 'Enter') {
            if (!isCalibrating) {
                console.log("Click calibrating simulated")
                calibratingButtonPressed = false;
                start()
            } else if (!calibratingButtonPressed) {
                calibratingButtonPressed = true;
                const startCalibratingButton = document.querySelector("#_ButtonCalibrateId");
                startCalibratingButton.click()
                console.log("Click button within calibrating simulated")
            }
        }
    })

    video.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        img.src = canvas.toDataURL("image/png");
        $(video).hide();
        $(img).show();
    };
});