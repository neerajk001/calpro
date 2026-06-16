"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  if (!codeReaderRef.current && typeof window !== "undefined") {
    codeReaderRef.current = new BrowserMultiFormatReader();
  }
  const [error, setError] = useState<string | null>(null);
  const [detectorSupported] = useState<boolean>(true); // Always supported using ZXing JS
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Start stream and scan loop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    setError(null);
    setIsScanning(true);

    const constraints = {
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
    };

    codeReaderRef.current?.decodeFromConstraints(constraints, videoElement, (result, err) => {
      if (result) {
        const code = result.getText();
        console.log("Found barcode via ZXing:", code);
        codeReaderRef.current?.reset();
        onScan(code);
      }
    }).catch((err: any) => {
      console.error("Camera access failed:", err);
      setError("Camera access denied or device not found. Please type your barcode manually or upload a picture.");
      setIsScanning(false);
    });

    return () => {
      codeReaderRef.current?.reset();
    };
  }, [onScan]);

  // Fallback upload handling
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Read image and try detection
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const result = await codeReaderRef.current?.decodeFromImageElement(img);
        if (result) {
          onScan(result.getText());
        } else {
          setError("No clear barcode found in the photo. Please enter manually.");
        }
      } catch (err) {
        setError("No clear barcode found in the photo. Please enter manually.");
      }
    };
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-white">Scan Barcode</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Point camera at the barcode or enter manually</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Camera Feed / Message */}
        <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center min-h-[260px] max-h-[400px]">
          {isScanning && detectorSupported && (
            <>
              {/* Camera view */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning viewfinder overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-40 border-2 border-[#1DB954]/50 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                  {/* Glowing corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#1DB954]"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#1DB954]"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#1DB954]"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#1DB954]"></div>

                  {/* Red scanning line animation */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_10px_#ef4444] animate-scan-line"></div>
                </div>
              </div>
            </>
          )}

          {/* Empty/Error state */}
          {(!isScanning || error || !detectorSupported) && (
            <div className="px-8 text-center text-zinc-400 space-y-4 py-8">
              <span className="text-4xl">📷</span>
              {error ? (
                <p className="text-xs text-red-400 font-semibold">{error}</p>
              ) : !detectorSupported ? (
                <p className="text-xs text-zinc-400">
                  Your browser does not support live camera scanning. Please snap a photo or input the code manually below.
                </p>
              ) : (
                <p className="text-xs text-zinc-400">Starting camera stream...</p>
              )}
            </div>
          )}
        </div>

        {/* Fallback & Manual Form */}
        <div className="p-5 border-t border-white/5 bg-[#121212] space-y-4 shrink-0">
          {/* File Snapper */}
          <div className="flex gap-2.5">
            <label className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-[#1e1e1e] hover:bg-[#282828] text-xs text-zinc-300 font-bold px-4 py-3 rounded-lg cursor-pointer transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            
            {/* Snap direct fallback for mobile */}
            <label className="flex-1 flex items-center justify-center gap-2 border border-[#1DB954]/20 hover:border-[#1DB954]/40 bg-[#1DB954]/5 text-[#1DB954] hover:bg-[#1DB954]/10 text-xs font-bold px-4 py-3 rounded-lg cursor-pointer transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              Snap Picture
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#121212] px-2 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Or Enter Code Manually</span>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="e.g. 8901058860264"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#1DB954]/50 rounded-lg font-sans tabular-nums"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-5 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 text-black text-xs font-extrabold rounded-lg transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
