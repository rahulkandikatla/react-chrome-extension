import { useState, useRef } from "react";

const mimeType = "audio/webm";

const AudioRecorder = () => {
  const [permission] = useState(false);
  const mediaRecorder: any = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream]: any = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio]: any = useState(null);

  // Listen for messages from content scripts
  // function handleMessage(request: any) {
  //   console.log(request, "inside, stream");
  //   setPermission(true);
  //   setStream(request);
  // }
  // chrome.runtime.onMessage.addListener(handleMessage);

  const getMicrophonePermission = () => {
    chrome.runtime
      .sendMessage({
        type: "getPermission",
      })
      .then((message) => console.log(message, "success Message"))
      .catch((error) => console.error(error, "err msg"));
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   chrome.scripting
    //     .executeScript({
    //       target: { tabId: tabs[0].id! },
    //       func: getStream,
    //     })
    //     .then((response) => {
    //       console.log(response, "response");
    //       setPermission(true);
    //       setStream(response[0].result);
    //     });
    // });
  };

  // const getStream = async () => {
  //   if ("MediaRecorder" in window) {
  //     try {
  //       const streamData = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //         video: false,
  //       });
  //       console.log(streamData, "original streamData");
  //       return { stream: streamData };
  //       // setStream(streamData)
  //       // Send stream data back to the background or popup script
  //       // chrome.runtime.sendMessage(streamData);
  //     } catch (err: any) {
  //       console.error("Error obtaining stream:", err);
  //       alert(err.message);
  //     }
  //   } else {
  //     alert("The MediaRecorder API is not supported in your browser.");
  //   }
  // };

  const startRecording = () => {
    console.log(stream, "stream at start recording");

    setRecordingStatus("recording");

    const mediaRecorder: any = new MediaRecorder(stream);
    mediaRecorder.current = mediaRecorder;
    mediaRecorder.start();
    const localAudioChunks: any = [];
    mediaRecorder.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(localAudioChunks, { type: "audio/webm" });
      const audioUrl: any = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
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
              Get Microphone Permission
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" && (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          )}
          {recordingStatus === "recording" && (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          )}
        </div>
        {audio && (
          <div className="audio-container">
            <audio src={audio} controls></audio>
            <a download href={audio}>
              Download Recording
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default AudioRecorder;
