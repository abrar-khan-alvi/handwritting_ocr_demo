import React from "react";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-sm shadow-blue-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900 flex items-center gap-2">
              ScribbleOCR
              <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                Gemini Vision
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-0.5">
              Handwriting Recognition Demo
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
