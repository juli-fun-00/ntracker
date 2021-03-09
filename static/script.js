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
    document.querySelector("#screenshot img").src = 'data:image/png;base64,' + result["encoded_image"];
}


function extractPoints(recData) {
    console.log("extracting points from ", recData)
    let points = [[1, 2], [3, 4]];
    for (const key in recData) {
        console.log("key form recdata: ", key, " : ", recData[key])
    }
    return points
}

$(() => {
    const record_start = document.querySelector("#record_start");
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const recording = document.querySelector("#recording");

    // useful callbacks
    GazeCloudAPI.OnCamDenied = function () {
        console.log('camera access denied')
    }

    GazeCloudAPI.OnError = function (msg) {
        console.log('err: ' + msg)
    }

    // hide on page laod
    $(img).hide();
    $(recording).hide();

    function stop() {
        GazeRecorderAPI.StopRec();
        GazeCloudAPI.StopEyeTracking();
        $(recording).hide();

        // upload
        const id = uuidv4();
        const sessionReplayData = GazeRecorderAPI.GetRecData();

        canvas.toBlob((blob) => getFace(id, blob, extractPoints(sessionReplayData.gazeevents)))

        // GazePlayer.SetCountainer(document.getElementById("id"));
    }

    function start() {
        // GazeCloudAPI.StartEyeTracking();
        // GazeCloudAPI.OnCalibrationComplete = () => {
        //  console.log(‘Calibration Complete’)
        // };
        GazeRecorderAPI.Rec();
        $(recording).show();
        setTimeout(stop, 1000);
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
            let isRecording = $(recording).visible
            if (!isRecording) {
                start()
            } else {
                stop()
            }

        }
    })

    record_start.onclick = () => {
        start()
    };

    video.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        img.src = canvas.toDataURL("image/png");
        $(video).hide();
        $(img).show();
    };
});