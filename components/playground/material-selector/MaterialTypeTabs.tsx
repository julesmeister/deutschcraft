"use client";

type MaterialType = "pdf" | "audio";

interface MaterialTypeTabsProps {
  materialType: MaterialType;
  setMaterialType: (type: MaterialType) => void;
  pdfCount: number;
  audioCount: number;
}

export function MaterialTypeTabs({
  materialType,
  setMaterialType,
  pdfCount,
  audioCount,
}: MaterialTypeTabsProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMaterialType("pdf")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            materialType === "pdf"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📄 PDF Files ({pdfCount})
        </button>
        <button
          onClick={() => setMaterialType("audio")}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            materialType === "audio"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🎵 Audio Files ({audioCount})
        </button>
      </div>
    </div>
  );
}
