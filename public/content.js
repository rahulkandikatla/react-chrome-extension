const mimeType = "audio/webm";

let permission = false;
let mediaRecorder = null;
let stream = null;
let audioChunks = [];
let audio = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "getPermission") {
    listener().then(() => sendResponse("permissionGranted"));
  } else if (request.message == "startRecording") {
    startRecording().then(() => sendResponse("recordingStarted"));
  } else if (request.message == "stopRecording") {
    stopRecording().then(() => {
      console.log("d");
      console.log(audio, "audio at then");
      sendResponse(audio);
    });
  }

  return true;
});

const listener = async () => {
  await getMicrophonePermission();
};

const getMicrophonePermission = async () => {
  try {
    if ("MediaRecorder" in window) {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      console.log(streamData, "streamData at getpermission");
      permission = true;
      console.log("after setpermission");
      stream = streamData;
      // return streamData
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  } catch (err) {
    console.log(err, "err");
  }
};

const startRecording = async () => {
  console.log(stream, "stream");
  // await chrome.runtime.sendMessage("startTabRecording");
  //create new Media recorder instance using the stream
  const media = new MediaRecorder(stream);
  //set the MediaRecorder instance to the mediaRecorder ref
  mediaRecorder = media;
  //invokes the start method to start the recording process
  mediaRecorder.start();
  let localAudioChunks = [];
  mediaRecorder.ondataavailable = (event) => {
    if (typeof event.data === "undefined") return;
    if (event.data.size === 0) return;
    localAudioChunks.push(event.data);
  };
  audioChunks = localAudioChunks;
};

const stopRecording = async () => {
  // const tabResponse = await chrome.runtime.sendMessage("stopTabRecording");
  const stopPromise = new Promise((resolve, reject) => {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      audio = JSON.stringify(audioUrl);
      audioChunks = [];
      resolve();
    };
  });
  await stopPromise;
};
