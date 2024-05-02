import { useState, useRef } from "react";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const micAudio: any = useRef(null);
  const tabAudio: any = useRef(null);
  const [audioChunks, setAudioChunks]: any = useState([]);
  const [mixedAudio, setMixedAudio]: any = useState(null);
  let mediaRecorder: any = useRef(null);
  let audioContext: any = useRef(new AudioContext());
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
      const output = new AudioContext();
      const source = output.createMediaStreamSource(stream);
      source.connect(output.destination);
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

  function writeString(view: any, offset: any, string: any) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(output: any, offset: any, input: any) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  function audioDataToWav(audioData: any, sampleRate: any) {
    var buffer = new ArrayBuffer(44 + audioData.length * 2);
    var view = new DataView(buffer);

    // RIFF identifier 'RIFF'
    writeString(view, 0, "RIFF");
    // file length minus RIFF identifier length and file description length
    view.setUint32(4, 36 + audioData.length * 2, true);
    // RIFF type 'WAVE'
    writeString(view, 8, "WAVE");
    // format chunk identifier 'fmt '
    writeString(view, 12, "fmt ");
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier 'data'
    writeString(view, 36, "data");
    // data chunk length
    view.setUint32(40, audioData.length * 2, true);

    floatTo16BitPCM(view, 44, audioData);

    return view;
  }

  const encodeAudioBuffer = (audioBuffer: any) => {
    return new Promise((resolve) => {
      const audioData = audioBuffer.getChannelData(0);
      // Assuming mono audio for simplicity
      const wav = audioDataToWav(audioData, audioBuffer.sampleRate);
      const blob = new Blob([wav], { type: "audio/wav" });
      resolve(blob);
    });
  };

  const decodeAudioBlob = (blob: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const arrayBuffer = this.result;
        const audioBuffer = await audioContext.current.decodeAudioData(
          arrayBuffer
        );
        resolve(audioBuffer);
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob);
    });
  };

  const mixAudios = async (blobUrl: any, tabBlob: any) => {
    const fetchResponse = await fetch(blobUrl);

    // Read the response body as ArrayBuffer
    const arrayBuffer = await fetchResponse.arrayBuffer();

    // Create a Blob from the ArrayBuffer
    const micBlob = new Blob([arrayBuffer]);

    const micAudioBuffer: any = await decodeAudioBlob(micBlob);
    const tabAudioBuffer: any = await decodeAudioBlob(tabBlob);

    const maxLength = Math.max(micAudioBuffer.length, tabAudioBuffer.length);
    const numberOfChannels = Math.min(
      micAudioBuffer.numberOfChannels,
      tabAudioBuffer.numberOfChannels
    );

    const mixedBuffer = new AudioBuffer({
      numberOfChannels: numberOfChannels,
      length: maxLength,
      sampleRate: micAudioBuffer.sampleRate,
    });

    console.log(micAudioBuffer);
    // Mix audio buffers
    for (let channel = 0; channel < mixedBuffer.numberOfChannels; channel++) {
      const channelData1 = micAudioBuffer.getChannelData(channel);
      const channelData2 = tabAudioBuffer.getChannelData(channel);
      const mixedChannelData = mixedBuffer.getChannelData(channel);

      for (let i = 0; i < maxLength; i++) {
        const sample1 = channelData1[i] || 0; // Fallback to 0 if beyond length
        const sample2 = channelData2[i] || 0;
        mixedChannelData[i] = (sample1 + sample2) / 2; // Simple averaging for blending
      }
    }

    const mixedBlob: any = await encodeAudioBuffer(mixedBuffer);
    const mixedAudioUrl = URL.createObjectURL(mixedBlob);

    setMixedAudio(mixedAudioUrl);
  };

  const stopRecording = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const response = await chrome.tabs.sendMessage(tabs[0].id!, {
        message: "stopRecording",
      });
      console.log("response on stop", response);
      // if (response === "recordingStopped") {
      setRecordingStatus("inactive");
      micAudio.current = JSON.parse(response);
      // }
      console.log(mediaRecorder, "mediaRecorder at stop");
      console.log(audioChunks, "audioChunks at stop");

      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = async () => {
        //creates a blob file from the audiochunks data
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        //creates a playable URL from the blob file.
        const audioUrl = URL.createObjectURL(audioBlob);
        tabAudio.current = audioUrl;
        setAudioChunks([]);
        await mixAudios(JSON.parse(response), audioBlob);
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
        {mixedAudio ? (
          <div className="items-center">
            <audio src={mixedAudio} controls className="w-86"></audio>
            <a
              download
              href={mixedAudio}
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
