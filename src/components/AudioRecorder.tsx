import { useState } from "react";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audio, setAudio]: any = useState(null);

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
      setAudio(JSON.parse(response));
      // }
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
        {audio ? (
          <div className="items-center">
            <audio src={audio} controls className="w-86"></audio>
            <a
              download
              href={audio}
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
