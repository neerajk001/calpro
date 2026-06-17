"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { ScanResultItem, FoodDbItem } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

interface FoodCameraProps {
  onLogItem: (item: ScanResultItem) => void;
  onClose: () => void;
}

type CameraState = "camera" | "preview" | "loading" | "results";

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1024;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
        else { w = Math.round(w * (maxDim / h)); h = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl.split(",")[1] || ""); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };
    img.src = dataUrl;
  });
}

function mapGramsToUnitGrams(unit: string): number {
  if (unit === "small bowl") return 50;
  if (unit === "katori") return 150;
  if (unit === "plate") return 300;
  if (unit === "full plate" || unit === "plates") return 450;
  return 100;
}

export function FoodCamera({ onLogItem, onClose }: FoodCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<CameraState>("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResultItem[]>([]);
  const [resultsMessage, setResultsMessage] = useState<string>("");
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
  const [allLogged, setAllLogged] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPortionItemId, setEditingPortionItemId] = useState<string | null>(null);
  const [editNameQuery, setEditNameQuery] = useState("");
  const [editNameResults, setEditNameResults] = useState<FoodDbItem[]>([]);
  const [editNameLoading, setEditNameLoading] = useState(false);
  const editNameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resultsScrollRef = useRef<HTMLDivElement | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
    setTorchOn(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Camera access denied. Please allow camera permissions in your browser settings.");
    }
  }, []);

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  useEffect(() => {
    if (state === "loading" && capturedDataUrl) {
      compressImage(capturedDataUrl).then((base64) => {
        if (!base64) return;
        apiClient.scanFoodImage(base64).then((res) => {
          setResults(res.items);
          setResultsMessage(res.items.length === 0 ? "No food items detected." : "");
          setState("results");
          setTimeout(() => resultsScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
        }).catch((err) => {
          setError(err.message || "Failed to scan. Please try again.");
          setState("results");
        });
      });
    }
  }, [capturedDataUrl, state === "loading"]);

  useEffect(() => {
    if (editingItemId && editNameQuery.trim().length > 0) {
      if (editNameTimer.current) clearTimeout(editNameTimer.current);
      setEditNameLoading(true);
      editNameTimer.current = setTimeout(() => {
        apiClient.searchFoods(editNameQuery).then(setEditNameResults).finally(() => setEditNameLoading(false));
      }, 200);
    } else { setEditNameResults([]); setEditNameLoading(false); }
    return () => { if (editNameTimer.current) clearTimeout(editNameTimer.current); };
  }, [editNameQuery, editingItemId]);

  const toggleTorch = useCallback(async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(!torchOn);
    } catch { setError("Flash not supported on this device."); }
  }, [stream, torchOn]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCapturedDataUrl(canvas.toDataURL("image/jpeg", 0.85));
    setState("preview");
  }, []);

  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedDataUrl(reader.result as string);
      stopCamera();
      setState("preview");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [stopCamera]);

  const retake = () => { setCapturedDataUrl(null); stopCamera(); startCamera(); setState("camera"); };
  const confirmCapture = () => { setState("loading"); };
  const retryAfterError = () => { setError(null); retake(); };

  const recalculateItem = (item: ScanResultItem, newPortionG: number): ScanResultItem => {
    const factor = newPortionG / 100;
    const portionStr = formatPortionLabel(newPortionG);
    return {
      ...item,
      estimatedPortionG: newPortionG,
      portionLabel: portionStr.label,
      portionUnit: portionStr.unit,
      portionValue: portionStr.value,
      estimatedCalories: Math.round(item.caloriesPer100g * factor),
      estimatedProtein: Math.round(item.proteinPer100g * factor * 10) / 10,
      estimatedCarbs: Math.round(item.carbsPer100g * factor * 10) / 10,
      estimatedFat: Math.round(item.fatPer100g * factor * 10) / 10,
    };
  };

  const handlePortionChange = (itemId: string, delta: number) => {
    setResults((prev) => prev.map((r) => {
      if (r.id !== itemId) return r;
      const unitGrams = mapGramsToUnitGrams(r.portionUnit);
      const currentUnits = r.estimatedPortionG / unitGrams;
      const newUnits = Math.max(0.5, Math.round((currentUnits + delta) * 2) / 2);
      return recalculateItem(r, Math.round(newUnits * unitGrams));
    }));
  };

  const swapFoodName = (itemId: string, newFood: FoodDbItem) => {
    setResults((prev) => {
      const oldItem = prev.find((r) => r.id === itemId);
      return prev.map((r) => {
        if (r.id !== itemId) return r;
        const updated: ScanResultItem = {
          ...r,
          name: newFood.name,
          caloriesPer100g: newFood.caloriesPer100g,
          proteinPer100g: newFood.proteinPer100g,
          carbsPer100g: newFood.carbsPer100g,
          fatPer100g: newFood.fatPer100g,
          confidence: 1,
          source: "database",
          emoji: newFood.emoji,
          alternatives: [],
        };
        return recalculateItem(updated, r.estimatedPortionG);
      });
    });
    setEditingItemId(null);
    setEditNameQuery("");

    const oldItem = results.find((r) => r.id === itemId);
    if (oldItem && oldItem.name !== newFood.name) {
      apiClient.recordCorrection({
        originalName: oldItem.name,
        correctedName: newFood.name,
        originalPortionG: oldItem.estimatedPortionG,
        correctedPortionG: oldItem.estimatedPortionG,
      }).catch(() => {});
    }

    const oldItem2 = results.find((r) => r.id === itemId);
    if (oldItem2) {
      const unitGrams = mapGramsToUnitGrams(oldItem2.portionUnit);
      const newFoodUnitGrams = mapGramsToUnitGrams("katori");
      if (unitGrams !== newFoodUnitGrams) {
        Math.round(oldItem2.estimatedPortionG);
      }
      setEditingPortionItemId(null);
    }
  };

  const handleLogSingle = (item: ScanResultItem) => {
    onLogItem(item);
    setLoggedIds((prev) => new Set(prev).add(item.id));
  };

  const handleLogAll = () => {
    const remaining = results.filter((r) => !loggedIds.has(r.id));
    remaining.forEach((item) => onLogItem(item));
    setLoggedIds((prev) => {
      const next = new Set(prev);
      remaining.forEach((r) => next.add(r.id));
      return next;
    });
    setAllLogged(true);
    setTimeout(() => onClose(), 800);
  };

  const lowConfidence = (item: ScanResultItem) => item.confidence < 0.7;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black animate-fade-in font-sans">
      <div className="relative w-full h-full max-w-md flex flex-col bg-black mx-auto">
        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />

        {/* Camera Viewfinder */}
        {state === "camera" && (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <button onClick={() => { stopCamera(); onClose(); }} className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full text-white hover:bg-black/50 transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button onClick={toggleTorch} className={`w-10 h-10 flex items-center justify-center rounded-full transition cursor-pointer ${torchOn ? "bg-yellow-400 text-black" : "bg-black/30 text-white hover:bg-black/50"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 14v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M14 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                </button>
              </div>
            </div>

            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8 text-center z-20">
                <span className="text-4xl mb-4">📷</span>
                <p className="text-sm text-white font-medium mb-2">{error}</p>
                <button onClick={retryAfterError} className="px-5 py-2.5 bg-[#1DB954] text-white text-sm font-bold rounded-xl cursor-pointer">Try Again</button>
              </div>
            )}

            {!error && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/20 rounded-3xl" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 pt-16 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-12">
                <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 flex items-center justify-center bg-black/30 rounded-full text-white hover:bg-black/50 transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </button>
                <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-white" />
                </button>
                <div className="w-12 h-12" />
              </div>
            </div>
          </>
        )}

        {/* Preview */}
        {state === "preview" && capturedDataUrl && (
          <>
            <img src={capturedDataUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 pt-16 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-16">
                <button onClick={retake} className="w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button onClick={confirmCapture} className="w-20 h-20 rounded-full bg-[#1DB954] flex items-center justify-center active:scale-95 transition cursor-pointer shadow-lg shadow-[#1DB954]/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-5 px-8">
            <div className="w-16 h-16 border-4 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
            <p className="text-white text-lg font-bold">Identifying your food...</p>
            <p className="text-zinc-400 text-sm text-center">Analyzing your meal with AI. This usually takes 1-3 seconds.</p>
          </div>
        )}

        {/* Results Screen */}
        {state === "results" && (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 pb-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <button onClick={() => { stopCamera(); onClose(); }} className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full text-white hover:bg-black/50 transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <h2 className="text-sm font-bold text-white">Scan Results</h2>
                <div className="w-10" />
              </div>
            </div>

            <div ref={resultsScrollRef} className="flex-1 overflow-y-auto hide-scrollbar pt-20 pb-28 px-4 space-y-4">
              {error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <span className="text-5xl">😕</span>
                  <p className="text-white font-semibold text-base">{error}</p>
                  <p className="text-zinc-400 text-sm">We couldn&apos;t analyze your photo. Make sure the food is clearly visible.</p>
                  <button onClick={retryAfterError} className="px-6 py-3 bg-[#1DB954] text-white text-sm font-bold rounded-xl cursor-pointer">Retake Photo</button>
                  <button onClick={() => { stopCamera(); onClose(); }} className="text-zinc-400 hover:text-white text-sm font-medium transition cursor-pointer">Go Back</button>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <span className="text-5xl">🤷</span>
                  <p className="text-white font-semibold text-base">No food items detected</p>
                  <p className="text-zinc-400 text-sm">Try a clearer photo with better lighting and make sure food is centered.</p>
                  <button onClick={retake} className="px-6 py-3 bg-[#1DB954] text-white text-sm font-bold rounded-xl cursor-pointer">Take Another Photo</button>
                  <button onClick={() => onClose()} className="text-zinc-400 hover:text-white text-sm font-medium transition cursor-pointer">Close</button>
                </div>
              ) : (
                <>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    {results.length} item{results.length !== 1 ? "s" : ""} detected
                  </p>
                  {results.map((item) => {
                    const isLow = lowConfidence(item);
                    const isEditingName = editingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl overflow-hidden border ${
                          isLow ? "border-[#F59E0B]/30 bg-[#1e1a10]" : "border-white/10 bg-[#1a1a1a]"
                        }`}
                      >
                        {/* Headline + Confidence Badge */}
                        <div className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {isLow && (
                                <p className="text-[#F59E0B] text-[11px] font-bold uppercase tracking-wider mb-1">Not sure what this is</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{item.emoji || "🍽️"}</span>
                                {isEditingName ? (
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={editNameQuery}
                                      onChange={(e) => setEditNameQuery(e.target.value)}
                                      placeholder="Search foods..."
                                      autoFocus
                                      className="w-full bg-[#282828] border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#1DB954] rounded-lg"
                                    />
                                    {editNameQuery.trim().length > 0 && (
                                      <div className="mt-1 bg-[#282828] border border-white/10 rounded-lg overflow-hidden max-h-32 overflow-y-auto hide-scrollbar">
                                        {editNameLoading ? (
                                          <p className="px-3 py-2 text-xs text-zinc-500">Searching...</p>
                                        ) : editNameResults.length === 0 ? (
                                          <p className="px-3 py-2 text-xs text-zinc-500">No matches</p>
                                        ) : (
                                          editNameResults.slice(0, 5).map((f) => (
                                            <button
                                              key={f.id}
                                              onClick={() => swapFoodName(item.id, f)}
                                              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#333] transition cursor-pointer"
                                            >
                                              <span className="text-sm text-white">{f.emoji || "🍽️"} {f.name}</span>
                                              <span className="text-xs text-zinc-400">{f.caloriesPer100g} kcal</span>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => { setEditingItemId(null); setEditNameQuery(""); }}
                                      className="text-xs text-zinc-500 hover:text-white mt-1 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <h3
                                      onClick={() => { setEditingItemId(item.id); setEditNameQuery(item.name); }}
                                      className="text-lg font-bold text-white cursor-pointer hover:text-[#1DB954] transition"
                                    >
                                      {item.name}
                                    </h3>
                                    {item.source === "database" && (
                                      <span className="shrink-0 px-2 py-0.5 bg-[#1DB954]/20 text-[#1DB954] text-[10px] font-bold rounded-full">✓ Verified</span>
                                    )}
                                    {item.source === "ai_estimated" && (
                                      <span className="shrink-0 px-2 py-0.5 bg-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold rounded-full">⚡ AI</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Portion display */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-zinc-400">{item.portionLabel}</span>
                            <button
                              onClick={() => handlePortionChange(item.id, -0.5)}
                              className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer text-xs"
                            >−</button>
                            <button
                              onClick={() => handlePortionChange(item.id, 0.5)}
                              className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer text-xs"
                            >+</button>
                          </div>

                          {/* Big calorie number */}
                          <p className="text-4xl font-black text-white mt-3 tabular-nums">
                            {item.estimatedCalories}
                            <span className="text-lg font-semibold text-zinc-500 ml-1">kcal</span>
                          </p>

                          {/* Macro row */}
                          <div className="flex gap-3 mt-2">
                            <span className="text-xs text-[#3B82F6] font-bold">{item.estimatedProtein}g protein</span>
                            <span className="text-xs text-zinc-500">·</span>
                            <span className="text-xs text-[#F59E0B] font-bold">{item.estimatedCarbs}g carbs</span>
                            <span className="text-xs text-zinc-500">·</span>
                            <span className="text-xs text-[#EF4444] font-bold">{item.estimatedFat}g fat</span>
                          </div>
                        </div>

                        {/* Low confidence alternatives */}
                        {isLow && item.alternatives.length > 0 && (
                          <div className="border-t border-[#F59E0B]/10 bg-[#2a2410] px-4 py-3">
                            <p className="text-[11px] text-[#F59E0B] font-semibold mb-2">Did you mean...</p>
                            <div className="flex flex-wrap gap-2">
                              {item.alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  onClick={() => {
                                    apiClient.searchFoods(alt).then((foods) => {
                                      if (foods.length > 0) swapFoodName(item.id, foods[0]);
                                    }).catch(() => {});
                                  }}
                                  className="px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold rounded-full hover:bg-[#F59E0B]/20 transition cursor-pointer"
                                >
                                  {alt}
                                </button>
                              ))}
                              <button
                                onClick={() => { setEditingItemId(item.id); setEditNameQuery(""); }}
                                className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-full hover:text-white transition cursor-pointer"
                              >
                                Search instead
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Log single button */}
                        {!loggedIds.has(item.id) && (
                          <div className="px-4 pb-4 pt-2">
                            <button
                              onClick={() => handleLogSingle(item)}
                              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition active:scale-[0.99] cursor-pointer"
                            >
                              Log Just This
                            </button>
                          </div>
                        )}
                        {loggedIds.has(item.id) && (
                          <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <span className="text-[#1DB954] text-xs font-bold">Logged</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Bottom bar: Log All */}
            {results.length > 0 && !error && (results.some((r) => !loggedIds.has(r.id))) && (
              <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-10 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent">
                <button
                  onClick={handleLogAll}
                  className="w-full py-4 bg-[#1DB954] hover:bg-[#17a94a] text-white text-base font-extrabold rounded-2xl transition active:scale-[0.98] shadow-lg shadow-[#1DB954]/30 cursor-pointer"
                >
                  Log This Meal
                </button>
              </div>
            )}

            {/* Success state */}
            {allLogged && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
                <div className="w-20 h-20 rounded-full bg-[#1DB954] flex items-center justify-center animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="mt-4 text-white text-xl font-extrabold">Logged!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatPortionLabel(grams: number): { unit: string; value: number; label: string } {
  if (grams <= 0) return { unit: "grams", value: grams, label: `${grams}g` };
  if (grams < 60) return { unit: "small bowl", value: 1, label: `1 small bowl (${grams}g)` };
  if (grams <= 200) return { unit: "katori", value: 1, label: `1 katori (${grams}g)` };
  if (grams <= 350) return { unit: "plate", value: 1, label: `1 plate (${grams}g)` };
  if (grams <= 600) return { unit: "full plate", value: 1, label: `1 full plate (${grams}g)` };
  const plates = Math.round(grams / 300);
  return { unit: "plates", value: plates, label: `${plates} plates (${grams}g)` };
}
