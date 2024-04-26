import { useState, useRef } from "react";

const mimeType = "audio/webm";
const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder: any = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream]: any = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio]: any = useState(null);

  const getMicrophonePermission = () => {
    console.log(stream, "initial stream");
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const response = await chrome.tabs.sendMessage(tabs[0].id!, {
        greeting: "tip",
      });
      console.log(response, "response");
      if (response === "permission granted") {
        setPermission(true);
      }
    });

    // chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
    //     chrome.scripting.executeScript({
    //         target: {tabId: tabs[0].id!},
    //         func: async () => {
    //             console.log("2")
    //             try {
    //                 console.log("3")
    //             if ("MediaRecorder" in window) {
    //                 const streamData: any = await navigator.mediaDevices.getUserMedia({
    //                     audio: true,
    //                     video: false,
    //                 });
    //                 console.log(streamData, "streamData at getpermission")
    //                 setPermission(true);
    //                 console.log("after setpermission")
    //                 setStream(streamData);
    //                 // return streamData
    //             } else {
    //                 alert("The MediaRecorder API is not supported in your browser.");
    //             }} catch(err) {
    //                 console.log(err, "err")
    //             }
    //         }
    //     }).then((streamData: any) => {

    //         console.log(streamData, "streamData")
    //     }).catch((err=> console.log(err, "err at getMicrophonePermission")))
    // });
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    console.log(stream, "stream");
    //create new Media recorder instance using the stream
    const media: any = new MediaRecorder(stream);
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks: any = [];
    mediaRecorder.current.ondataavailable = (event: any) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    console.log("asd");
    setRecordingStatus("inactive");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="mb-20">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
        </div>
        {audio ? (
          <div className="audio-container">
            <audio src={audio} controls></audio>
            <a download href={audio}>
              Download Recording
            </a>
          </div>
        ) : null}
      </main>
    </div>
  );
};
export default AudioRecorder;
