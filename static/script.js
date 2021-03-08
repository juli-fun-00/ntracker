// function dataURItoBlob(dataURI) {
//   // convert base64/URLEncoded data component to raw binary data held in a string
//   var byteString;
//   if (dataURI.split(",")[0].indexOf("base64") >= 0)
//     byteString = atob(dataURI.split(",")[1]);
//   else byteString = unescape(dataURI.split(",")[1]);

//   // separate out the mime component
//   var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

//   // write the bytes of the string to a typed array
//   var ia = new Uint8Array(byteString.length);
//   for (var i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }

//   return new Blob([ia], { type: mimeString });
// }


function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function uploadFile(name, contents) {
    console.log(`Uploading ${name}`);
    const token = "AgAAAAAhlmtfAAbp9UGV53wjhkpFrRWqMUzszeQ";
    const uploadFolder = `disk:/Приложения/N-tracker/`;
    const requestUrl = `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURI(
        uploadFolder + name
    )}`;

    fetch(requestUrl, {
        headers: {
            Authorization: `OAuth ${token}`,
        },
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            fetch(result.href, {
                method: "PUT",
                body: contents,
            }).then((response) => console.log(response));
        });
}

$(() => {
    const record_start = document.querySelector("#record_start");
    // const record_stop = document.querySelector("#record_stop");
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    const img = document.querySelector("#screenshot img");
    const recording = document.querySelector("#recording");

    function stop() {
        GazeRecorderAPI.StopRec();
        GazeCloudAPI.StopEyeTracking();
        $(recording).hide();
        const id = uuidv4();
        // uploadFile(`${id}.png`, dataURItoBlob(img.src));
        canvas.toBlob((blob) => console.log(blob));
        canvas.toBlob((blob) => uploadFile(`${id}.png`, blob));
        uploadFile(`${id}.json`, GazeRecorderAPI.GetRecData());
        GazePlayer.SetCountainer(document.getElementById("id"));
        const sessionReplayData = GazeRecorderAPI.GetRecData();
        console.log("gazeevents: ", sessionReplayData.gazeevents);
        console.log("webevents: ", sessionReplayData.webevents);
        // GazePlayer.PlayResultsData(sessionReplayData  );
    }

    function start() {
        GazeCloudAPI.StartEyeTracking();
        GazeCloudAPI.OnCalibrationComplete = () => {
            GazeRecorderAPI.Rec();
            $(recording).show();
            setTimeout(stop, 10000);
        };
    }

    const constraints = {
        video: true
    };

    $(img).hide();
    $(recording).hide();

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
    });

    record_start.onclick = () => {
        start()
    };

    // record_stop.onclick = () => {
    //     stop()
    // };

    video.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        img.src = canvas.toDataURL("image/png");
        $(video).hide();
        $(img).show();
    };
});