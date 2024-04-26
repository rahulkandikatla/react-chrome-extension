import AudioRecorder from "./components/AudioRecorder";

const App = () => {
  return (
    <div className="flex flex-col items-center w-80 rounded-lg min-h-40">
      <h1 className="text-3xl font-bold m-3 w-auto">Audio Recorder</h1>
      <div className="justify-center h-full">
        <AudioRecorder />
      </div>
    </div>
  );
};
export default App;
