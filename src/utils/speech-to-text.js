import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "dee6e95ec37b496091adb34350ef2221",
});

const audioPath =
  "/home/nxtwavetechrahul/Downloads/dd10e9c5-0270-4f50-b088-1f9c5ffe37b0.wav";

let transcript = await client.transcripts.transcribe({
  audio: audioPath,
  speaker_labels: true,
});

console.log(transcript);
