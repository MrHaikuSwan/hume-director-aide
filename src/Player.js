import sound from './assets/Rehearsal_Maize_Mirchi.m4a'
import ReactAudioPlayer from 'react-audio-player';
import React, { useState, useRef, useEffect } from 'react';


function Player( {setJoyData, setConfusionData} ) {
  const videoRef = useRef(null);
  const ws = useRef(null);
  const [isSendingFrames, setIsSendingFrames] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
      });

    // Connect to WebSocket server
    // const API_KEY = "API_KEY_PLACEHOLDER";
    const API_KEY = process.env.REACT_APP_API_KEY;
    ws.current = new WebSocket(`wss://api.hume.ai/v0/stream/models?apiKey=${API_KEY}`);
  
    // WebSocket event listeners
    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.current.onmessage = (event) => {
      const res = JSON.parse(event.data);
      const emotions = res.face.predictions[0].emotions;
      const joyScore = emotions.find(e => e.name === "Joy").score;
      const confusionScore = emotions.find(e => e.name === "Confusion").score;
      setJoyData(chartData => [...chartData, joyScore]);
      setConfusionData(chartData => [...chartData, confusionScore]);
    };

    // Cleanup function
    return () => {
      // Close WebSocket connection when component unmounts
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [setJoyData, setConfusionData]);

  const sendFrame = () => {
    // Capture frame from video
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert frame to Base64 data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
  
    // Send frame over WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        data: imageDataUrl,
        models: {
          face: {}
        }
      }
      ws.current.send(JSON.stringify(message));
    }
    else {
      console.log("Failed to send message");
    }
  };

  const handleStartSendingFrames = () => {
    setIsSendingFrames(true);
  };

  const handleStopSendingFrames = () => {
    setIsSendingFrames(false);
  };

  // Set interval to send frames periodically
  useEffect(() => {
    let intervalId;
    if (isSendingFrames) {
      intervalId = setInterval(sendFrame, 1000); // Adjust interval as needed
    }

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [isSendingFrames]);

  return (
    <div style={{textAlign: 'center'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
        <button onClick={handleStartSendingFrames}>Start</button>
        <ReactAudioPlayer
          src={sound}
          autoPlay
          controls
        />
        <button onClick={handleStopSendingFrames}>Stop</button>
      </div>
      {isSendingFrames && 
        <p>Connected to Hume</p>
      }
      {!isSendingFrames && 
        <p>Not connected to Hume</p>
      }
      <video ref={videoRef} autoPlay style={{ display: 'block', margin: 'auto', maxWidth: '30%', maxHeight: '30%', border: '2px solid #333', boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)' }}></video>
    </div>
  );
}

export default Player;