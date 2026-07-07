import {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useEmergency } from "../../context/EmergencyContext";
import toast from "react-hot-toast";

const isMobile =
  typeof window !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const CameraCaptureComponent = ({ onSend, onCancel }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { setPhoto, location } = useEmergency();

  const [startingCamera, setStartingCamera] = useState(true);
  const [sending, setSending] = useState(false);

  const isStartingRef = useRef(false);

  const startCamera = async () => {
    if (isStartingRef.current) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera not supported.");
      setStartingCamera(false);
      return;
    }

    isStartingRef.current = true;
    setStartingCamera(true);

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error("Camera permission denied.");
    } finally {
      isStartingRef.current = false;
      setStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useImperativeHandle(ref, () => ({
    stopCamera,
  }));

  const handleCaptureAndSend = async () => {
    if (sending || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    if (video.readyState < 2) {
      toast.error("Camera still loading...");
      return;
    }

    setSending(true);

    try {
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL("image/jpeg", 0.9);

      // 🔥 COMBINED PAYLOAD (IMPORTANT FOR BACKEND DISPATCH)
      const payload = {
        image,
        location: location || null,
        timestamp: Date.now(),
      };

      setPhoto(image);

      stopCamera();

      await onSend(payload);
    } catch (err) {
      console.error(err);
      toast.error("Emergency send failed.");
      setSending(false);
    }
  };

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  useEffect(() => {
    const cleanup = () => stopCamera();

    window.addEventListener("pagehide", cleanup);
    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("pagehide", cleanup);
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-4">

      <h3 className="text-center font-bold text-lg mb-4">
        {isMobile ? "Take Patient Photo" : "Capture Patient Photo"}
      </h3>

      <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">

        {startingCamera ? (
          <div className="text-white animate-pulse">
            Starting Camera...
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

      </div>

      <div className="flex gap-3 mt-5">

        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          disabled={sending}
          className="flex-1 py-3 rounded-xl bg-gray-500 text-white"
        >
          Cancel
        </button>

        <button
          onClick={handleCaptureAndSend}
          disabled={sending || startingCamera}
          className="flex-[2] py-3 rounded-xl bg-red-600 text-white font-bold"
        >
          {sending ? "Sending..." : "SEND EMERGENCY"}
        </button>

      </div>

      <canvas ref={canvasRef} hidden />
    </div>
  );
};

export default forwardRef(CameraCaptureComponent);