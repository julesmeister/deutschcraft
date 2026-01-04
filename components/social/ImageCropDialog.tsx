'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogFooter, DialogButton } from '@/components/ui/Dialog';
import { cropAndCompress, formatFileSize } from '@/lib/utils/imageProcessing';

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageFile: File;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

export default function ImageCropDialog({
  open,
  onClose,
  imageSrc,
  imageFile,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);

  // Update estimated size when crop area changes
  useEffect(() => {
    if (croppedAreaPixels) {
      // Rough estimate: area * bytes per pixel * compression factor
      const pixels = croppedAreaPixels.width * croppedAreaPixels.height;
      const bytesPerPixel = 3; // RGB
      const compressionFactor = 0.15; // JPEG compression ~85% quality
      const estimated = pixels * bytesPerPixel * compressionFactor;
      setEstimatedSize(estimated);
    }
  }, [croppedAreaPixels]);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await cropAndCompress(
        imageSrc,
        croppedAreaPixels,
        rotation,
        1920,
        0.85
      );

      const croppedUrl = URL.createObjectURL(croppedBlob);
      onCropComplete(croppedBlob, croppedUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    // Reset to defaults
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="Crop & Edit Image"
      size="lg"
      closeOnOverlayClick={false}
      footer={
        <DialogFooter>
          <DialogButton variant="secondary" onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </DialogButton>
          <DialogButton variant="primary" onClick={handleApplyCrop} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Apply'}
          </DialogButton>
        </DialogFooter>
      }
    >
      <div className="space-y-4">
        {/* Cropper container */}
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Aspect Ratio selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    aspectRatio === ratio.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* File size info */}
          <div className="flex justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Original:</span> {formatFileSize(imageFile.size)}
            </div>
            {estimatedSize > 0 && (
              <div className="text-gray-600">
                <span className="font-medium">Estimated:</span> {formatFileSize(estimatedSize)}
                {estimatedSize < imageFile.size && (
                  <span className="text-green-600 ml-1">
                    (↓{Math.round(((imageFile.size - estimatedSize) / imageFile.size) * 100)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Drag to move the crop area</li>
            <li>Scroll or pinch to zoom</li>
            <li>Select an aspect ratio or use free crop</li>
            <li>Click Apply to save your changes</li>
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
