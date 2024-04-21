import "./App.css";
import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";

const App = () => {
    let [recordOption, setRecordOption] = useState("video");
    const toggleRecordOption = (type: any) => {
      recordOption; // remove this line
        return () => {
            setRecordOption(type);
        };
    };
    return (
        <div>
            <h1>React Media Recorder</h1>
            <div className="justify-center items-center gap-10">
                <button onClick={toggleRecordOption("audio")}>
                  Record Audio
                </button>
            </div>
            <div>
                <AudioRecorder />
            </div>
        </div>
    );
};
export default App;
