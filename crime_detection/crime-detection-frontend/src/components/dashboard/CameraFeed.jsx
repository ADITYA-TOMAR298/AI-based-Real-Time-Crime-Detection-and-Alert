import { useEffect, useRef, useState } from "react";
import cameraService from "../../services/cameraService";
import { API_BASE_URL } from "../../services/api";

const CAMERA_CONFIGURATION_KEY = "crimeDetection.cameraConfiguration";

function usesBrowserWebcam() {
  try {
    return JSON.parse(localStorage.getItem(CAMERA_CONFIGURATION_KEY))?.type === "webcam";
  } catch {
    return false;
  }
}

function websocketUrl() {
  return `${API_BASE_URL.replace(/^http/, "ws")}/ws/camera`;
}

export default function CameraFeed() {
  const [error, setError] = useState(false);
  const [browserWebcam] = useState(usesBrowserWebcam);
  const [webcamStatus, setWebcamStatus] = useState("Connecting to browser webcam...");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!browserWebcam) return undefined;
    let stream;
    let captureTimer;
    let reconnectTimer;
    let stopped = false;

    const sendFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const socket = socketRef.current;
      if (!video?.videoWidth || socket?.readyState !== WebSocket.OPEN) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob && socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(await blob.arrayBuffer());
      }, "image/jpeg", 0.72);
    };

    const connect = () => {
      if (stopped) return;
      const socket = new WebSocket(websocketUrl());
      socketRef.current = socket;
      socket.onopen = () => setWebcamStatus("Webcam connected — analysis is running");
      socket.onclose = () => {
        if (!stopped) {
          setWebcamStatus("Reconnecting webcam...");
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
      socket.onerror = () => socket.close();
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        videoRef.current.srcObject = stream;
        connect();
        captureTimer = setInterval(sendFrame, 500);
      } catch {
        setError(true);
        setWebcamStatus("Camera permission was denied or no webcam is available.");
      }
    };
    start();
    return () => {
      stopped = true;
      clearInterval(captureTimer);
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [browserWebcam]);

  return <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
    <div className="flex justify-between items-center p-5 border-b border-slate-800"><div><h2 className="text-2xl font-bold">Live Surveillance</h2><p className="text-slate-400">{browserWebcam ? webcamStatus : "AI Monitoring"}</p></div><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full animate-pulse ${error ? "bg-red-500" : "bg-green-500"}`} />{browserWebcam ? "BROWSER WEBCAM" : "LIVE"}</div></div>
    {browserWebcam ? <><video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-cover bg-black" /><canvas ref={canvasRef} className="hidden" /></> : error ? <div className="aspect-video flex items-center justify-center text-red-400">Camera stream unavailable</div> : <img src={cameraService.videoUrl()} alt="Live Camera Feed" className="w-full aspect-video object-cover" onError={() => setError(true)} />}
    {browserWebcam && error && <div className="p-4 text-red-500">{webcamStatus}</div>}
  </div>;
}
