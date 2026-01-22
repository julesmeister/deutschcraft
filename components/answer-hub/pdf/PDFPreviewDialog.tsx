"use client";

import { Eye, X } from "lucide-react";
import { ExerciseAttachment } from "@/lib/models/exercises";
import { PDFViewer } from "@/components/playground/PDFViewer";

interface PDFPreviewDialogProps {
  attachment: ExerciseAttachment;
  onClose: () => void;
}

export function PDFPreviewDialog({ attachment, onClose }: PDFPreviewDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[90vw] h-[85vh] max-w-5xl flex flex-col shadow-2xl rounded-lg overflow-hidden">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              Preview: {attachment.title}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              (scroll to find the pages you need)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* PDF Viewer */}
        <div className="flex-1">
          <PDFViewer
            materialTitle={attachment.title || "PDF Document"}
            materialUrl={attachment.url}
            showCloseButton={false}
          />
        </div>
      </div>
    </div>
  );
}
