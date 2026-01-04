'use client';

import { useState, useRef } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';
import ImagePreviewGrid from './ImagePreviewGrid';
import ImageCropDialog from './ImageCropDialog';
import { ProcessedImage, validateImageFile, compressImage, blobToBase64 } from '@/lib/utils/imageProcessing';

interface CreatePostProps {
  currentUserId: string;
  userLevel: CEFRLevel;
  currentUser?: User;
  onSubmit?: (content: string, mediaUrls?: string[]) => void;
  batchName?: string;
  postFilter?: 'all' | 'batch';
}

export default function CreatePost({ currentUserId, userLevel, currentUser, onSubmit, batchName, postFilter = 'all' }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<ProcessedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [currentEditImage, setCurrentEditImage] = useState<{ file: File; url: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    console.log('[CreatePost] handleSubmit called');
    if (!content.trim()) {
      console.log('[CreatePost] No content, aborting');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[CreatePost] onSubmit exists?', !!onSubmit);
      if (onSubmit) {
        // Pass base64 data URLs directly
        const mediaUrls = selectedImages.map(img => img.url);
        console.log('[CreatePost] Submitting with', selectedImages.length, 'images');
        console.log('[CreatePost] First image URL length:', mediaUrls[0]?.length || 0);
        console.log('[CreatePost] First image URL starts with:', mediaUrls[0]?.substring(0, 50) || 'none');
        console.log('[CreatePost] About to call onSubmit...');
        await onSubmit(content, mediaUrls);
        console.log('[CreatePost] onSubmit completed successfully');
      } else {
        console.log('[CreatePost] No onSubmit callback');
      }
      // Reset form (no need to revoke base64 URLs)
      setContent('');
      setSelectedImages([]);
      console.log('[CreatePost] Form reset complete');
    } catch (error) {
      console.error('[CreatePost] Error creating post:', error);
      alert('Failed to create post: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ProcessedImage[] = [];

    for (const file of Array.from(files)) {
      // 1. Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error || 'Invalid image file');
        continue;
      }

      try {
        // 2. Compress automatically
        const compressedBlob = await compressImage(file, 1920, 0.85);

        // 3. Convert to base64 data URL
        const base64Url = await blobToBase64(compressedBlob);

        // 4. Create ProcessedImage with base64 URL
        newImages.push({
          id: crypto.randomUUID(),
          url: base64Url,
          file: new File([compressedBlob], file.name, { type: 'image/jpeg' }),
          size: compressedBlob.size,
          isEdited: false,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image: ' + file.name);
      }
    }

    setSelectedImages([...selectedImages, ...newImages]);
  };

  const handleEditImage = (index: number) => {
    const image = selectedImages[index];
    setCurrentEditIndex(index);
    setCurrentEditImage({ file: image.file, url: image.url });
    setCropDialogOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob, croppedUrl: string) => {
    if (currentEditIndex === null) return;

    try {
      // Convert cropped blob to base64
      const base64Url = await blobToBase64(croppedBlob);

      const updatedImages = [...selectedImages];
      const originalFile =
        updatedImages[currentEditIndex].originalFile || updatedImages[currentEditIndex].file;

      updatedImages[currentEditIndex] = {
        ...updatedImages[currentEditIndex],
        url: base64Url,
        file: new File([croppedBlob], originalFile.name, { type: 'image/jpeg' }),
        originalFile,
        size: croppedBlob.size,
        isEdited: true,
      };

      setSelectedImages(updatedImages);
    } catch (error) {
      console.error('Error converting cropped image to base64:', error);
      alert('Failed to process cropped image');
    } finally {
      setCropDialogOpen(false);
      setCurrentEditIndex(null);
      setCurrentEditImage(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Dynamic placeholder based on filter
  const getPlaceholder = () => {
    if (postFilter === 'batch' && batchName) {
      return `Share your German practice... only ${batchName} will be able to see your post`;
    }
    return 'Share your German practice... everyone will be able to see your post';
  };

  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex mb-3">
        <div className="mr-2 flex-shrink-0">
          {currentUser ? (
            <UserAvatar user={currentUser} size="md" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          )}
        </div>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            placeholder={getPlaceholder()}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          <GermanCharAutocomplete
            textareaRef={textareaRef}
            content={content}
            onContentChange={setContent}
          />
        </div>
      </div>

      {/* Image Preview Grid */}
      <ImagePreviewGrid
        images={selectedImages}
        onEdit={handleEditImage}
        onRemove={handleRemoveImage}
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded cursor-pointer text-sm">
          <svg width="20" height="20" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
            <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
          </svg>
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
        <button
          className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={currentEditImage?.url || ''}
        imageFile={currentEditImage?.file || new File([], '')}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
