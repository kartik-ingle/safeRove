import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Camera, CameraOff, RefreshCcw, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  onCaptured: (file: File, dataUrl: string) => void;
  onClose: () => void;
};

const CameraCapture = ({ onCaptured, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [facingUser, setFacingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported in this browser. Please use a modern browser.");
        return;
      }

      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError("Camera requires HTTPS. Please use https:// or localhost");
        return;
      }

      const media = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingUser ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.onloadedmetadata = () => setReady(true);
        await videoRef.current.play().catch((playError) => {
          console.error("Video play error:", playError);
          setError("Failed to start video preview");
        });
      }
    } catch (e: any) {
      console.error("Camera error:", e);
      if (e.name === 'NotAllowedError') {
        setError("Camera access denied. Please allow camera permissions and try again.");
      } else if (e.name === 'NotFoundError') {
        setError("No camera found. Please connect a camera and try again.");
      } else if (e.name === 'NotReadableError') {
        setError("Camera is already in use by another application.");
      } else {
        setError(`Camera error: ${e.message || "Camera access denied or unavailable."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    setReady(false);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingUser]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !ready || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        const finalize = (b: Blob) => {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const file = new File([b], "captured-photo.jpg", { type: "image/jpeg" });
          onCaptured(file, dataUrl);
          stop();
          onClose();
        };
        if (blob) finalize(blob);
        else {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const byteString = atob(dataUrl.split(",")[1]);
          const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          finalize(new Blob([ab], { type: mimeString }));
        }
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <Card className="glass-card border-glass-border p-3 w-full max-w-md">
      <CardContent className="space-y-3">
        <div className="relative rounded-lg overflow-hidden bg-black min-h-[200px] flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Starting camera...</p>
              </div>
            </div>
          )}
          <video 
            ref={videoRef} 
            className={`w-full h-auto ${ready ? 'block' : 'hidden'}`}
          />
          {!ready && !loading && !error && (
            <div className="text-white text-center">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Camera not ready</p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={facingUser}
              onCheckedChange={(v) => setFacingUser(!!v)}
              id="facing"
              disabled={loading}
            />
            <label htmlFor="facing" className="text-sm">Front Camera</label>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={start} 
              title="Restart"
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={stop} 
              title="Stop"
              disabled={loading}
            >
              <CameraOff className="h-4 w-4" />
            </Button>
            <Button 
              onClick={capture} 
              disabled={!ready || loading} 
              className="btn-hero"
            >
              <Camera className="h-4 w-4 mr-2" /> Capture
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <RotateCcw className="h-3 w-3" />
          If the preview is blank, tap Restart, then Capture.
        </div>
        
        {!error && (
          <div className="text-xs text-muted-foreground">
            💡 Make sure to allow camera permissions when prompted by your browser.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraCapture;


