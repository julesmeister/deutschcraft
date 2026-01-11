/**
 * EditableTags Component
 * Displays tags as badges with inline editing for teachers
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableTagsProps {
  tags: string[];
  onSave: (tags: string[]) => Promise<void>;
  isTeacher: boolean;
  syllabusOptions: string[];
}

export function EditableTags({
  tags,
  onSave,
  isTeacher,
  syllabusOptions,
}: EditableTagsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>(tags);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedTags(tags);
  }, [tags]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Close editing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  const filteredSuggestions = syllabusOptions.filter(
    (option) =>
      option.toLowerCase().includes(inputValue.toLowerCase()) &&
      !editedTags.includes(option)
  );

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !editedTags.includes(tag.trim())) {
      setEditedTags([...editedTags, tag.trim()]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setEditedTags(editedTags.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedTags);
      setIsEditing(false);
      setInputValue('');
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error saving tags:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTags(tags);
    setIsEditing(false);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isTeacher && tags.length === 0) {
    return null;
  }

  if (!isEditing) {
    return (
      <div className="inline-block">
        {tags.length === 0 && isTeacher ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors inline-block align-middle"
          >
            <svg className="w-3 h-3 inline-block align-middle mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="inline-block align-middle">Add tags</span>
          </button>
        ) : (
          <>
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block align-middle px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium mr-2"
              >
                {tag}
              </span>
            ))}
            {isTeacher && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors inline-block align-middle"
              >
                <svg className="w-3.5 h-3.5 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 flex-wrap px-2 py-1 border border-gray-300 bg-white">
        {editedTags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-white text-xs font-medium"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(index)}
              className="hover:text-gray-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type or select from syllabus..."
          className="flex-1 min-w-[150px] px-2 py-0.5 text-xs border-0 bg-transparent focus:outline-none"
        />

        {/* Action Buttons - Inline */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-0.5 bg-gray-700 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Syllabus Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 shadow-lg">
          {filteredSuggestions.slice(0, 10).map((option, index) => (
            <button
              key={index}
              onClick={() => handleAddTag(option)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
