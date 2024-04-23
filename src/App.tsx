import AudioRecorder from "./components/AudioRecorder";

const App = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="text-3xl font-bold">Audio Recorder</h1>
      <div>
        <AudioRecorder />
      </div>
    </div>
  );
};
export default App;
