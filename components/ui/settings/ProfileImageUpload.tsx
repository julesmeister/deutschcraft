'use client';

import { useState } from 'react';

interface ProfileImageUploadProps {
  currentImage?: string;
  userName?: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  className?: string;
}

export function ProfileImageUpload({
  currentImage,
  userName = 'User',
  onUpload,
  onRemove,
  className = '',
}: ProfileImageUploadProps) {
  const [imagePreview, setImagePreview] = useState(currentImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Call upload handler
      onUpload?.(file);
    }
  };

  const handleRemove = () => {
    setImagePreview(undefined);
    onRemove?.();
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-[90px] h-[90px] rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1 px-3 py-2 h-10 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-blue-500 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-2 h-10 bg-white border border-gray-300 text-gray-600 font-bold text-sm rounded-xl hover:border-blue-600 hover:ring-1 hover:ring-blue-600 hover:text-blue-600 transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
