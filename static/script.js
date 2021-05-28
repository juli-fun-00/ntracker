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
    formData.set("image", imageBlob, uuid + ".jpg");
    let response = await fetch("/face?uuid=" + uuid, {
        method: 'POST',
        body: formData
    });

    return await response.json()
}


function extractPoints(recData, img) {
    console.log("extracting points from recorded data of length ", recData.length)
    console.log("points (ALL) are: ", recData)
    let points = [];
    let canvasRect = img.getBoundingClientRect()
    console.log("imgRect:", canvasRect)
    console.log("img", img)
    for (const key in recData) {
        if (recData.hasOwnProperty(key)) {
            let docY = recData[key]["docY"]
            let docX = recData[key]["docX"]
            // надо убедиться что координаты лежат внури картинки
            if (canvasRect.left <= docX && docX <= canvasRect.right &&
                canvasRect.top <= docY && docY <= canvasRect.bottom) {
                // считаем координаты относительно левого-верхнего угла канваса
                let frameY = docY - canvasRect.y
                let frameX = docX - canvasRect.x
                points.push(frameY, frameX)
            }
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
    const reloadText = document.querySelector("#recording");
    const loadingIndicator = document.querySelector("#loading");

    function setInitialState() {
        console.log("Setting initial state")
        isCalibrating = false
        calibratingButtonPressed = true

        $(img).hide();
        $(reloadText).hide();
        $(text).hide()
        $(video).hide();
        $(loadingIndicator).hide();
    }

    setInitialState()

    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
        errorAndReload('Не удалось получить доступ к камере. Страница будет перезагружена через 10 секунд. Попробуйте еще раз.', 10000);
    }
    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
        errorAndReload('При калибровке возникла ошибка. Страница будет перезагружена через 10 секунд. Попробуйте еще раз.', 10000);
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
    }

    function errorAndReload(msg, timeout) {
        stop_recording();
        $(reloadText).addClass('error');
        reloadText.innerHTML = msg;
        $(reloadText).show();
        setTimeout(() => { 
            window.location.href = window.location.href 
        }, timeout);
    }

    function stopAndUpload() {
        console.log("stopAndUpload")

        // достаем данные
        const sessionReplayData = GazeRecorderAPI.GetRecData();
        let events = sessionReplayData.gazeevents

        // осталавливаем запись и сессию записи
        stop_recording();

        reloadTextVal = `Подождите несколько секунд, идет классификация по способу восприятия лиц...Это недолго. Результат появится под фотографией.`;
        reloadText.innerHTML = reloadTextVal;
        $(reloadText).show();

        // отправяем classify запрос
        classify_request(current_id, frameHeight, frameWidth, extractPoints(events, img)).then(
            (result) => {
                console.log("User class is ", result['class']);

                let text = document.querySelector("#person-class");
                text.innerHTML = result['message'];
                $(text).show();
                let timeLeft = 20;
                setTimeout(() => { window.location.reload() }, timeLeft * 1000);
                
                setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        reloadTextVal = `Сброс в начало через ${timeLeft} сек...`;
                        reloadText.innerHTML = reloadTextVal;
                        console.log(`Осталось ${timeLeft} секунд до перезапуска`);
                    } else {
                        reloadTextVal = `Идет сброс в начальное состояние`;
                        reloadText.innerHTML = reloadTextVal;
                        console.log(`Пора перезапускаться`);
                        window.location.href = window.location.href;
                    }
                }, 1000);

                console.log("center_mass: ", result["center_mass"]);
                console.log("avg_dist: ", result["avg_dist"]);
                console.log("dist_threshold: ", result["dist_threshold"]);

                console.log("CLASSIFY request succeed", current_id);
            },
            () => {
                console.log("--------- CLASSIFY request failed");
                errorAndReload('Ошибка при классификации взгляда. Страница будет перезагружена через 30 секунд. Попробуйте еще раз.', 30000);
            }
        );
    }

    function calibCompleteActions(face_promise) {
        console.log('calibCompleteActions function')
        $(reloadText).show();
        $(loadingIndicator).show();
        face_promise.then(
            () => {
                console.log("face_promise.then сработал")
                // результат нейронки отображаем пользователю
                $(loadingIndicator).hide();
                // $(reloadText).hide();
                $(img).show();
                reloadText.innerHTML = "Посмотрите на это лицо в течение 10 секунд, а я проанализирую ваш взгляд.";

                // начинаем запись
                console.log("Recording START........")
                GazeRecorderAPI.Rec();
                setTimeout(stopAndUpload, 10000);
            },
            () => {
                console.log("face_promise failed => ничего дальше не вызываем")
                setInitialState()
                errorAndReload('Ошибка при генерации фотографии. Страница будет перезагружена через 30 секунд. Попробуйте еще раз.', 30000);
            })
    }

    function takePicture() {
        current_id = uuidv4();
        // достаем картинку пользователя
        drawCameraFrameOnCanvas();

        console.log("current uuid: ", current_id)

        let retryCount = 0;

        canvas.toBlob((blob) => {
            if (blob === null) {
                console.log(`blob is null for some reason... retry count = ${retryCount}`)
                if (retryCount >= 3) {
                    setInitialState();
                    errorAndReload('Ошибка при отправке фотографии. Страница будет перезагружена через 15 секунд. Попробуйте еще раз.', 15000);
                } else {
                    retryCount++;
                    setTimeout(takePicture, 1000);
                }
                return;
            }
            console.log('picture taken');

            // отправляем картинку пользователя на merge
            let face_promise = face_request(current_id, blob).then(
                (result) => {
                    console.log("FACE request succeed", current_id)
                    let img = document.querySelector("#screenshot img");
                    img.src = 'data:image/jpeg;base64,' + result["encoded_image"];
                },
                () => {
                    console.log("---------- FACE request failed")
                    stop_recording()
                    setInitialState()
                });

            GazeCloudAPI.OnCalibrationComplete = () => {
                calibCompleteActions(face_promise)
            };
        }, "image/jpeg", 0.9);
    }

    function start_calibrate() {
        console.log("START function")
        isCalibrating = true


        $(text).hide()
        $(img).hide();
        $(video).hide();
        $(document.querySelector('body')).removeClass('bg')

        GazeCloudAPI.StartEyeTracking();
    }


    const constraints = {
        video: {
            deviceId: navigator.deviceId //"392153864a30ac86ff4405284c660eba6ec8b335159d7e64811a09ad1c7e2dd6"
        }
    };
    console.dir(constraints);

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
    });


    // onclick listeners
    document.addEventListener('keydown', event => {
        if (event.code === 'Enter') {
            if (!isCalibrating) {
                console.log("Click calibrating simulated")
                calibratingButtonPressed = false;
                start_calibrate();
            } else if (!calibratingButtonPressed) {
                const startCalibratingButton = document.querySelector("#_ButtonCalibrateId");
                if (startCalibratingButton != null && !startCalibratingButton.disabled) {
                    takePicture();
                    startCalibratingButton.click();
                    calibratingButtonPressed = true;
                    console.log("Click button within calibrating simulated");
                }
            }
        }
    })
});