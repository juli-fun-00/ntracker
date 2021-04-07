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
    console.log("CLASSIFY request started", uuid)

    let formData = new FormData();
    formData.set("points", JSON.stringify({points: points}))
    let response = await fetch("/classify?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    return await response.json()
}

// функция отправляет uuid и точки, ожидает и отображает картинку
async function face_request(uuid, imageBlob) {
    console.log("FACE request started", uuid)

    let formData = new FormData();
    formData.set("image", imageBlob, uuid + ".png");
    // formData.set("points", JSON.stringify({points: points}))
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    return await response.json()
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
    // GLOBALS
    let current_id;
    let face_result;
    let user_photo

    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const text = document.querySelector("#person-class");
    const recording_symbol = document.querySelector("#recording");
    let isCalibrating = false
    let calibratingButtonPressed = true;

    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
        stop_recording();
    }
    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
        stop_recording();
    }
    // GazeCloudAPI.OnResult = (gazeData) => {
    //     let x = gazeData.docX
    //     let y = gazeData.docY
    //     console.log("Whole gazeData: ", gazeData)
    //     console.log(`coordinates: (${x}, ${y})`);
    // }

    // hide on page load
    $(img).hide();
    $(recording_symbol).hide();
    $(text).hide()
    $(video).hide();

    function drawCameraFrameOnCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
    }

    function stop_recording() {
        console.log("Recording STOP........")
        GazeRecorderAPI.StopRec();
        GazeCloudAPI.StopEyeTracking();
        isCalibrating = false;
        $(recording_symbol).hide();
    }

    function stopAndUpload() {
        console.log("stopAndUpload")
        stop_recording();

        // отправяем classify запрос
        const sessionReplayData = GazeRecorderAPI.GetRecData();
        classify_request(id, extractPoints(sessionReplayData.gazeevents)).then(
            (result) => {
                console.log("User class is ", result['class'])

                let text = document.querySelector("#person-class");
                text.innerHTML = result['class']

                $(text).show()
                console.log("CLASSIFY request succeed", id)
            },
            () => {
                console.log("--------- CLASSIFY request failed")
            }
        )
    }

    function calibCompleteActions(face_promise) {
        console.log('calibCompleteActions function')
        face_promise.then(() => {
            console.log("face_promise.then сработал")
            // результат нейронки отображаем пользователю
            $(img).show();

            // начинаем запись
            console.log("Recording START........")
            $(recording_symbol).show();
            GazeRecorderAPI.Rec();
            setTimeout(stopAndUpload, 5000);
        })
    }

    function start_calibrate() {
        console.log("START function")
        isCalibrating = true
        current_id = uuidv4()
        console.log("current uuid: ", current_id)

        $(text).hide()
        $(img).hide();
        $(recording_symbol).hide();

        // отправляем картинку пользователя на merge
        drawCameraFrameOnCanvas()

        canvas.toBlob((blob) => {
            user_photo = blob
        });

        let face_request_promise = face_request(id, user_photo).then(
            (result) => {
                console.log("FACE request succeed", id)
                let img = document.querySelector("#screenshot img");
                img.src = 'data:image/png;base64,' + result["encoded_image"];
            },
            () => {
                console.log("---------- FACE request failed")
            });

        // GazeCloudAPI.StartEyeTracking    ();
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
                start_calibrate()
            } else if (!calibratingButtonPressed) {
                const startCalibratingButton = document.querySelector("#_ButtonCalibrateId");
                startCalibratingButton.click()
                calibratingButtonPressed = true;
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