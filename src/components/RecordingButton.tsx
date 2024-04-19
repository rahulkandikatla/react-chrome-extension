import { useState } from "react";

function RecordingButton() {
  const [isRecordingStarted, setIsRecordingStarted ]= useState(false)

  const onClickRecordingBtn = () => {
    setIsRecordingStarted(!isRecordingStarted)
  }



  return (
    <button 
      className="p-3 bg-blue-500 text-white w-full" 
      onClick={onClickRecordingBtn}
    >
        {isRecordingStarted ? "Stop" : "Start"}
    </button>    
  );
}

export default RecordingButton;
