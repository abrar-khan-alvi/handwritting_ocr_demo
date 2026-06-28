import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  selectedImage: string | null;
  onClear: () => void;
  isProcessing: boolean;
}

export default function UploadZone({
  onImageSelected,
  selectedImage,
  onClear,
  isProcessing,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, or SVG).");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 10MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract raw base64 data and mimeType
        const parts = reader.result.split(",");
        const base64Data = parts[1];
        onImageSelected(base64Data, file.type);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isProcessing) return;
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    }
  };

  const triggerFileSelect = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full" onPaste={handlePaste}>
      {/* Upload/Preview container */}
      <div
        className={`relative min-h-[320px] rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-6 bg-white overflow-hidden ${
          selectedImage
            ? "border-blue-200"
            : isDragging
            ? "border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10"
            : "border-dashed border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg flex items-center gap-2 border border-red-100 z-10 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectedImage ? (
          /* Preview Mode */
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Action panel above the image */}
            <div className="absolute top-0 right-0 z-10 flex gap-2">
              <button
                type="button"
                onClick={onClear}
                disabled={isProcessing}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-full shadow-sm transition-all border border-red-100 disabled:opacity-50"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[380px] w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 p-2">
              <img
                src={selectedImage}
                alt="Uploaded handwriting preview"
                className="max-h-[360px] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 font-medium">
                Ready for extraction. Drop or paste another file to replace it.
              </p>
            </div>
          </div>
        ) : (
          /* Drag & Drop Upload Prompt */
          <div
            onClick={triggerFileSelect}
            className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center py-10"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm shadow-blue-100/50 transition-transform duration-300 group-hover:scale-110">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Upload handwritten note
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Drag & drop your JPG, PNG, or SVG image here, click to browse, or paste directly from clipboard
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100/50">
              <ImageIcon className="w-3.5 h-3.5" />
              PNG, JPG, or SVG up to 10MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
