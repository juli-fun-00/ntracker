// функция генерирует рандомный id
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


// функция отправляет uuid и точки, ожидает и отображает картинку
async function classify_request(uuid, points) {
    console.log("classify_request ", uuid)

    let formData = new FormData();
    formData.set("image", imageBlob, uuid + ".png");
    formData.set("points", JSON.stringify({points: points}))
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    let result = await response.json()
    let img = document.querySelector("#screenshot img");
    let text = document.querySelector("#person-class");

    console.log("User class is ", result['class'])

    text.innerHTML = result['class']
    img.src = 'data:image/png;base64,' + result["encoded_image"];

    $(img).show()
    $(text).show()
}

// функция отправляет uuid и точки, ожидает и отображает картинку
async function face_request(uuid, imageBlob, points) {
    console.log("face_request ", uuid)

    let formData = new FormData();
    formData.set("image", imageBlob, uuid + ".png");
    formData.set("points", JSON.stringify({points: points}))
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    let result = await response.json()
    let img = document.querySelector("#screenshot img");
    let text = document.querySelector("#person-class");

    console.log("User class is ", result['class'])

    text.innerHTML = result['class']
    img.src = 'data:image/png;base64,' + result["encoded_image"];

    $(img).show()
    $(text).show()
}


function extractPoints(recData) {
    console.log("extracting points from recorded data of length ", recData.length)
    let points = [];
    for (const key in recData) {
        if (recData.hasOwnProperty(key)) {
            points.push([recData[key]["docX"], recData[key]["docY"]])
        }
    }
    console.log("resulting points: ", points)
    return points
}

function setPhotoWhileRecordingFromBlob(blob) {
    let img = document.querySelector("#screenshot img");
    let urlCreator = window.URL || window.webkitURL;
    img.src = urlCreator.createObjectURL(blob)
}


$(() => {
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const text = document.querySelector("#person-class");
    const recording = document.querySelector("#recording");
    let isCalibrating = false
    let calibratingButtonPressed = true;

    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
        stop();
    }
    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
        stop();
    }
    // GazeCloudAPI.OnResult = (gazeData) => {
    //     let x = gazeData.docX
    //     let y = gazeData.docY
    //     console.log("Whole gazeData: ", gazeData)
    //     console.log(`coordinates: (${x}, ${y})`);
    // }

    // hide on page load
    $(img).hide();
    $(recording).hide();
    $(text).hide()

    function getVideoScreenshotUrl() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        return canvas.toDataURL("image/png");
    }

    function upload() {
        console.log("UPLOAD function");
        const id = uuidv4();
        const sessionReplayData = GazeRecorderAPI.GetRecData();

        img.src = getVideoScreenshotUrl()
        canvas.toBlob((blob) => face_request(id, blob, extractPoints(sessionReplayData.gazeevents)));
    }

    function stop() {
        console.log("STOP function");
        GazeRecorderAPI.StopRec();
        GazeCloudAPI.StopEyeTracking();
        console.log("Recording STOP........")
        isCalibrating = false;
        $(recording).hide();
        // GazePlayer.SetContainer(document.getElementById("id"));
    }

    function stopAndUpload() {
        console.log("stopAndUpload")
        stop();
        upload();
    }

    function calibCompleteActions() {
        console.log('Calibration Complete')
        $(img).show();
        $(recording).show();
        $(video).hide();

        console.log("Recording START........")
        GazeRecorderAPI.Rec();
        setTimeout(stopAndUpload, 5000);
    }

    function start() {
        console.log("START function")
        isCalibrating = true

        $(text).hide()
        $(img).hide();
        $(recording).hide();
        $(video).show();

        // GazeCloudAPI.StartEyeTracking();
        // GazeCloudAPI.OnCalibrationComplete = () => {
        //     calibCompleteActions()
        // };

        calibCompleteActions()
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

    // video.onclick = () => {
    //     canvas.width = video.videoWidth;
    //     canvas.height = video.videoHeight;
    //     canvas.getContext("2d").drawImage(video, 0, 0);
    //     img.src = canvas.toDataURL("image/png");
    //     $(video).hide();
    //     $(img).show();
    // };
});