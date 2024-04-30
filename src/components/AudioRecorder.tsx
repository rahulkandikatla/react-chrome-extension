import { useState, useRef } from "react";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [micAudio, setMicAudio]: any = useState(null);
  const [tabAudio, setTabAudio]: any = useState(null);
  const [audioChunks, setAudioChunks]: any = useState([]);
  let mediaRecorder: any = useRef(null);
  let mimeType = "audio/webm";

  const getMicrophonePermission = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const response = await chrome.tabs.sendMessage(tabs[0].id!, {
        message: "getPermission",
      });
      console.log(response, "response");
      if (response === "permissionGranted") {
        setPermission(true);
      }
    });
  };

  const startRecording = async () => {
    chrome.tabCapture.capture({ audio: true }, (stream: any) => {
      console.log(stream, "tab stream");
      const media = new MediaRecorder(stream);
      //set the MediaRecorder instance to the mediaRecorder ref
      mediaRecorder.current = media;
      //invokes the start method to start the recording process
      mediaRecorder.current.start();
      let localAudioChunks: any[] = [];
      mediaRecorder.current.ondataavailable = (event: any) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const response = await chrome.tabs.sendMessage(tabs[0].id!, {
        message: "startRecording",
      });
      if (response === "recordingStarted") {
        setRecordingStatus("recording");
      }
    });
  };

  const stopRecording = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const response = await chrome.tabs.sendMessage(tabs[0].id!, {
        message: "stopRecording",
      });
      console.log("response on stop", response);
      // if (response === "recordingStopped") {
      setRecordingStatus("inactive");
      setMicAudio(JSON.parse(response));
      // }
      console.log(mediaRecorder, "mediaRecorder at stop");
      console.log(audioChunks, "audioChunks at stop");

      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        //creates a blob file from the audiochunks data
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        //creates a playable URL from the blob file.
        const audioUrl = URL.createObjectURL(audioBlob);
        setTabAudio(audioUrl);
        setAudioChunks([]);
      };
    });
  };

  return (
    <div className="w-full h-full">
      <main className="flex flex-col justify-center items-center w-full h-full">
        <div className="justify-center mb-4 items-center">
          {!permission ? (
            <button
              className="p-3 bg-sky-500/100 border-none rounded-lg text-white font-semibold"
              onClick={getMicrophonePermission}
              type="button"
            >
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button
              className="p-3 bg-green-500/100 border-none rounded-lg text-white font-semibold"
              onClick={startRecording}
              type="button"
            >
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button
              className="p-3 bg-red-500/100 border-none rounded-lg text-white font-semibold"
              onClick={stopRecording}
              type="button"
            >
              Stop Recording
            </button>
          ) : null}
        </div>
        {micAudio ? (
          <div className="items-center">
            <audio src={micAudio} controls className="w-86"></audio>
            <a
              download
              href={micAudio}
              className="text-sky-500 underline items-end"
            >
              Download Recording
            </a>
          </div>
        ) : null}
        {tabAudio ? (
          <div className="items-center">
            <audio src={tabAudio} controls className="w-86"></audio>
            <a
              download
              href={tabAudio}
              className="text-sky-500 underline items-end"
            >
              Download Recording
            </a>
          </div>
        ) : null}
      </main>
    </div>
  );
};
export default AudioRecorder;
