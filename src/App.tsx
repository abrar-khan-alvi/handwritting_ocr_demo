import React, { useState, useRef } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import ResultDisplay from "./components/ResultDisplay";
import { OCRResult } from "./types";
import {
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileCheck,
  ChevronRight
} from "lucide-react";

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageSelected = (base64: string, type: string) => {
    setSelectedImage(`data:${type};base64,${base64}`);
    setBase64Data(base64);
    setMimeType(type);
    setOcrResult(null);
    setError(null);
  };

  const clearCanvas = () => {
    setSelectedImage(null);
    setBase64Data(null);
    setMimeType("image/png");
    setOcrResult(null);
    setError(null);
  };

  // Fun sequence of progress messages for natural, high-quality wait feedback
  const runProgressMessages = () => {
    const steps = [
      "Uploading handwritten canvas to servers...",
      "Analyzing scribbled strokes & contrast levels...",
      "Converting visual curves into digital character nodes...",
      "Verifying grammar, structure, and handwriting patterns...",
      "Finalizing structured markdown layout...",
    ];

    let current = 0;
    setProcessingStep(steps[0]);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setProcessingStep(steps[current]);
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return interval;
  };

  const triggerOCR = async () => {
    if (!base64Data) return;

    setIsProcessing(true);
    setError(null);
    const progressInterval = runProgressMessages();

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "OCR extraction failed. Please try again.");
      }

      setOcrResult(data.result);
      
      // Smooth scroll to results once completed
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during transcription.");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-blue-100">
      {/* Header bar component */}
      <Header />

      {/* Main dashboard content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Controls, Upload */}
          <div className="flex flex-col gap-6">
            
            {/* 1. Upload card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4 h-full justify-between">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 tracking-tight font-display uppercase">
                    1. Input Handwriting Image
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Drop a snapshot of handwriting, select a file, or paste from clipboard.
                  </p>
                </div>

                <UploadZone
                  onImageSelected={handleImageSelected}
                  selectedImage={selectedImage}
                  onClear={clearCanvas}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Action trigger button */}
              {selectedImage && (
                <button
                  type="button"
                  onClick={triggerOCR}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wide mt-4"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                      <span>Transcribing Note...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Extract Handwritten Text</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Results Workspace */}
          <div className="flex" ref={resultsRef}>
            
            {isProcessing ? (
              /* PROGRESS LOADING VIEW */
              <div className="w-full bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[450px]">
                <div className="relative mb-6">
                  {/* Decorative concentric circles */}
                  <div className="w-24 h-24 rounded-full border-4 border-blue-50/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 flex items-center justify-center animate-pulse">
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                  ScribbleOCR Analysis in Progress
                </h3>
                
                {/* Stepper text */}
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl px-4 py-2.5 max-w-sm mb-4">
                  <p className="text-xs font-semibold text-blue-700 animate-pulse">
                    {processingStep}
                  </p>
                </div>

                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  The vision OCR model is analyzing standard print shapes, cursive patterns, and word context to draft the clean transcription. Please wait a moment.
                </p>
              </div>
            ) : error ? (
              /* ERROR REPORT VIEW */
              <div className="w-full bg-red-50/20 rounded-2xl border border-red-100 p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[450px]">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-red-950 mb-2 font-display">
                  Transcription Process Failed
                </h3>
                <p className="text-sm text-red-800 max-w-md mb-6 leading-relaxed bg-red-50 p-4 rounded-xl border border-red-100/50 font-mono text-left text-xs">
                  {error}
                </p>
                <button
                  onClick={triggerOCR}
                  className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try extracting again
                </button>
              </div>
            ) : ocrResult ? (
              /* REAL RESULT VIEW */
              <ResultDisplay result={ocrResult} />
            ) : (
              /* EMPTY DEFAULT WORKSPACE PLACEHOLDER */
              <div className="w-full bg-slate-50/30 rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[450px]">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-xs text-gray-300 flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-1 font-display">
                  Waiting for Handwriting Input
                </h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                  Upload your own JPG/PNG snapshot or paste an image from clipboard, then click the Extract button to review results.
                </p>

                {/* Small instructive step arrows */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-[10px]">1</span>
                    Upload or Paste Note
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-[10px]">2</span>
                    Click &quot;Extract Text&quot;
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
