"use client";

interface CameraPermissionSnackbarProps {
  error: { name: string; message: string } | null;
  onRetry: () => void;
  onResetCamera: () => void;
  onResetMic: () => void;
  onDismiss: () => void;
}

function getErrorMessage(errorName: string): string {
  switch (errorName) {
    case "NotAllowedError":
      return "Camera or mic access was blocked by your browser.";
    case "NotFoundError":
      return "No camera found on this device.";
    case "AbortError":
      return "Camera was interrupted — another app may be using it.";
    case "NotReadableError":
      return "Camera is busy — close other apps using it.";
    default:
      return "Could not access your camera.";
  }
}

export function CameraPermissionSnackbar({ error, onRetry, onResetCamera, onResetMic, onDismiss }: CameraPermissionSnackbarProps) {
  if (!error) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-fade-in-up">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden">
        {/* Top row: icon + message + dismiss */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {error.name === "NotFoundError" ? "No Camera" : "Camera Blocked"}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
              {getErrorMessage(error.name)}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={onRetry}
            className="flex-1 py-2 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onResetCamera}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Reset Camera
          </button>
          <button
            onClick={onResetMic}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Reset Mic
          </button>
        </div>

        {/* Hint */}
        <div className="px-4 pb-3 -mt-1">
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            If permissions are blocked, click the lock/tune icon in your address bar to allow camera &amp; mic, then try again.
          </p>
        </div>
      </div>
    </div>
  );
}
