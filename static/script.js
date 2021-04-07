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
    // console.log("CLASSIFY request started", uuid)
    //
    // let formData = new FormData();
    // formData.set("smth", "smth")
    // formData.set("points", JSON.stringify({points: points}))
    // let response = await fetch("/classify?uuid=" + uuid, {
    //     method: 'POST',
    //     body: formData
    // });
    //
    // return await response.json()

    console.log("CLASSIFY request started", uuid)
    let formData = new FormData();
    formData.set("points", JSON.stringify({points: points}));
    // let points_final = JSON.stringify({points: points})//.toString()
    // + "&points=" +
    let response = await fetch("/classify?uuid=" + uuid, {
        method: 'GET',
        // body: formData
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


function extractPoints(recData) {
    console.log("extracting points from recorded data of length ", recData.length)
    let points = [];
    for (const key in recData) {
        if (recData.hasOwnProperty(key)) {
            points.push([recData[key]["docX"], recData[key]["docY"]])
        }
    }
    // для теста
    if (points.length === 0) {
        console.log("добавили одну точку для теста в points")
        points.push([16, 67])
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
    let isCalibrating = false
    let calibratingButtonPressed = true;

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
        classify_request(current_id, extractPoints(sessionReplayData.gazeevents)).then(
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
                setTimeout(stopAndUpload, 5000);
            },
            () => {
                console.log("face_promise failed => ничего дальше не вызываем")
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
                    // TODO go init state
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