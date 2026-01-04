'use client';

import { ProcessedImage, formatFileSize } from '@/lib/utils/imageProcessing';
import { Edit2, X } from 'lucide-react';

interface ImagePreviewGridProps {
  images: ProcessedImage[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function ImagePreviewGrid({ images, onEdit, onRemove }: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            {/* Image thumbnail */}
            <img
              src={image.url}
              alt={`Selected ${index + 1}`}
              className="w-24 h-24 object-cover border border-gray-200 rounded"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2">
              {/* Edit button */}
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 p-2 rounded hover:bg-gray-100"
                aria-label="Edit image"
                title="Crop/Edit image"
              >
                <Edit2 size={16} />
              </button>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded hover:bg-red-700"
                aria-label="Remove image"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>

            {/* File size badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 flex items-center justify-between">
              <span>{formatFileSize(image.size)}</span>
              {image.isEdited && (
                <span className="text-green-400" title="Image has been cropped/edited">
                  ✓
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary info */}
      <div className="mt-2 text-xs text-gray-500">
        {images.length} {images.length === 1 ? 'image' : 'images'} selected
        {images.some(img => img.isEdited) && (
          <span className="ml-2 text-green-600">
            ({images.filter(img => img.isEdited).length} edited)
          </span>
        )}
      </div>
    </div>
  );
}
