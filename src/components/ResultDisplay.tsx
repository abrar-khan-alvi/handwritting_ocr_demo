import React, { useState } from "react";
import { OCRResult } from "../types";
import { Copy, Check, FileText, Sparkles, HelpCircle, Languages, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ResultDisplayProps {
  result: OCRResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<"formatted" | "verbatim">("formatted");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textToCopy =
      activeTab === "formatted" ? result.formattedText : result.transcribedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadge = (rating: string) => {
    switch (rating) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium Confidence
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Confidence
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 font-display">
            OCR Extraction Output
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time transcribed results by Gemini Vision
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-medium">
            <Languages className="w-3.5 h-3.5" /> {result.detectedLanguage || "Detected Language"}
          </span>
          {getConfidenceBadge(result.confidenceRating)}
        </div>
      </div>

      {/* Tabs Selector & Clipboard actions */}
      <div className="px-6 pt-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("formatted")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "formatted"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Formatted Markdown
            </span>
          </button>
          <button
            onClick={() => setActiveTab("verbatim")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "verbatim"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Verbatim Text
            </span>
          </button>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all mb-2.5 shadow-sm"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Result Body content */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[400px] min-h-[250px] bg-slate-50/50">
        {activeTab === "formatted" ? (
          <div className="prose prose-blue prose-sm max-w-none text-gray-800 leading-relaxed font-sans">
            {/* Simple manual markdown helper list/paragraphs parser to render nicely without installing massive remark-rehype */}
            {result.formattedText.split("\n").map((line, idx) => {
              if (line.trim().startsWith("# ")) {
                return (
                  <h1 key={idx} className="text-xl font-bold font-display text-gray-900 mt-4 mb-2">
                    {line.replace("# ", "")}
                  </h1>
                );
              }
              if (line.trim().startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-lg font-bold font-display text-gray-900 mt-3 mb-2">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.trim().startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-md font-bold font-display text-gray-900 mt-3 mb-1">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                return (
                  <li key={idx} className="ml-4 list-disc text-gray-700 py-0.5">
                    {line.substring(2)}
                  </li>
                );
              }
              if (/^\d+\.\s/.test(line.trim())) {
                return (
                  <li key={idx} className="ml-4 list-decimal text-gray-700 py-0.5">
                    {line.replace(/^\d+\.\s/, "")}
                  </li>
                );
              }
              if (line.trim() === "") {
                return <div key={idx} className="h-2" />;
              }
              return (
                <p key={idx} className="text-gray-700 leading-relaxed mb-2 text-sm">
                  {line}
                </p>
              );
            })}
          </div>
        ) : (
          <pre className="font-mono text-xs text-slate-800 bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {result.transcribedText}
          </pre>
        )}
      </div>

      {/* Ambiguous or Scribbled Words section */}
      {result.difficultWords && result.difficultWords.length > 0 && (
        <div className="p-5 border-t border-gray-100 bg-amber-50/20">
          <div className="flex items-center gap-1.5 mb-3">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-amber-800 tracking-wider uppercase">
              Handwriting Discrepancies & Scribble Detection
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.difficultWords.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-amber-100 rounded-xl p-3 flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Scribbled Word
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Suggested Fix
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-0.5">
                  <span className="font-mono font-medium text-amber-800 line-through decoration-amber-400">
                    &quot;{item.word}&quot;
                  </span>
                  <span className="font-semibold text-emerald-800 bg-emerald-100/30 px-2 py-0.5 rounded">
                    {item.suggestion}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 italic mt-1 bg-gray-50/50 p-1.5 rounded border border-gray-100">
                  Context: &quot;{item.context}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
