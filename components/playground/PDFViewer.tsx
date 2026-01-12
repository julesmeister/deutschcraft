/**
 * PDF Viewer Component
 * Displays PDF materials in the playground room
 */

"use client";

import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface PDFViewerProps {
  materialTitle: string;
  materialUrl: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function PDFViewer({
  materialTitle,
  materialUrl,
  onClose,
  showCloseButton = true,
}: PDFViewerProps) {
  return (
    <div className="bg-white border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <h4 className="font-semibold text-sm text-neutral-900">
            {materialTitle}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Open in New Tab
          </a>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Close PDF"
            >
              <ActionButtonIcons.Close />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100">
        <iframe
          src={materialUrl}
          className="w-full h-full border-0"
          title={materialTitle}
        />
      </div>
    </div>
  );
}
