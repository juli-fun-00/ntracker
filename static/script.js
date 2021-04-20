// функция генерирует рандомный id
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


// функция отправляет uuid и точки, ожидает и отображает картинку
async function classify_request(uuid, frameHeight, frameWidth, points) {
    let url = 'classify?uuid=' + uuid + "&frame_height=" + frameHeight + "&frame_width=" + frameWidth;
    console.log("CLASSIFY request started, url is ", url)
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            points: points,
            length: points.length
        }),

    });

    return await response.json()
}

// функция отправляет uuid и точки, ожидает и отображает картинку
async function face_request(uuid, imageBlob) {
    console.log("FACE request started", uuid, imageBlob)

    let formData = new FormData();
    formData.set("image", imageBlob, uuid + ".png");
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    return await response.json()
}


function extractPoints(recData, canvas) {
    console.log("extracting points from recorded data of length ", recData.length)
    let points = [];
    let canvasRect = canvas.getBoundingClientRect()
    for (const key in recData) {
        if (recData.hasOwnProperty(key)) {
            let docY = recData[key]["docY"]
            let docX = recData[key]["docX"]
            // надо убедиться что координаты лежат внури картинки
            if (canvasRect.left <= docX && docX <= canvasRect.right &&
                canvasRect.top <= docY && docY <= canvasRect.bottom)
                points.push(docY, docX)
        }
    }
    // // для теста
    // if (points.length === 0) {
    //     console.log("добавили одну точку для теста в points")
    //     points.push(16, 67)
    // }

    // GazePlayer.PlayResultsData(recData)
    console.log("length of points", points.length, "resulting points: ", points)
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
    let isCalibrating = false
    let calibratingButtonPressed = true;
    let frameHeight = 1080
    let frameWidth = 1920

    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const text = document.querySelector("#person-class");
    const recording_symbol = document.querySelector("#recording");

    function setInitialState() {
        console.log("Setting initial state")
        isCalibrating = false
        calibratingButtonPressed = true

        $(img).hide();
        $(recording_symbol).hide();
        $(text).hide()
        $(video).show();
    }

    setInitialState()

    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
        stop_recording();
    }
    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
        stop_recording();
    }

    function drawCameraFrameOnCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        frameHeight = canvas.height
        frameWidth = canvas.width
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
        classify_request(current_id, frameHeight, frameWidth, extractPoints(sessionReplayData.gazeevents)).then(
            (result) => {
                console.log("User class is ", result['class'])

                let text = document.querySelector("#person-class");
                text.innerHTML = result['class'] + ": " + result['message']

                $(text).show()
                console.log("CLASSIFY request succeed", current_id)
            },
            () => {
                console.log("--------- CLASSIFY request failed")
            }
        )
    }

    function calibCompleteActions(face_promise) {
        console.log('calibCompleteActions function')
        face_promise.then(
            () => {
                console.log("face_promise.then сработал")
                // результат нейронки отображаем пользователю
                $(img).show();

                // начинаем запись
                console.log("Recording START........")
                $(recording_symbol).show();
                GazeRecorderAPI.Rec();
                setTimeout(stopAndUpload, 10000);
            },
            () => {
                console.log("face_promise failed => ничего дальше не вызываем")
                setInitialState()
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
        $(video).hide();

        // достаем картинку пользователя
        drawCameraFrameOnCanvas()
        canvas.toBlob((blob) => {
            if (blob === null) {
                console.log("blob is null for some reason...")
                setInitialState()
                return;
            }

            // отправляем картинку пользователя на merge
            let face_promise = face_request(current_id, blob).then(
                (result) => {
                    console.log("FACE request succeed", current_id)
                    let img = document.querySelector("#screenshot img");
                    img.src = 'data:image/png;base64,' + result["encoded_image"];
                },
                () => {
                    console.log("---------- FACE request failed")
                    setInitialState()
                });

            // запускам калибровку
            GazeCloudAPI.OnCalibrationComplete = () => {
                calibCompleteActions(face_promise)
            };
            GazeCloudAPI.StartEyeTracking();
        })
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
                if (startCalibratingButton != null) {
                    startCalibratingButton.click()
                    calibratingButtonPressed = true;
                    console.log("Click button within calibrating simulated")
                }

            }
        }
    })
});