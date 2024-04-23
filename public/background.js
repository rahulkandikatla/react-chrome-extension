const permission = false;
const mediaRecorder = null;
const recordingStatus = "inactive";
const stream = null;
const audioChunks = [];
const audio = null;

chrome.runtime.onMessage.addListener(listener);

async function listener(request, sender, sendResponse) {
  if (request.type === "getPermission") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    try {
      const response = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          if ("MediaRecorder" in window) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
              });
              return stream;
            } catch (err) {
              console.error("Error obtaining stream:", err);
              alert(err.message);
            }
          } else {
            alert("The MediaRecorder API is not supported in your browser.");
          }
        },
      });
      console.log("response", response);
      sendResponse("permission-granted");
    } catch (err) {
      console.log(err);
    }
  }
  console.log(permission, stream, "inside listener");
}
