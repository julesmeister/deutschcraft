'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { ImagePlus, ArrowRight } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
}

export function ChatInput({
  onSendMessage,
  placeholder = 'Enter a prompt here',
  disabled = false,
  allowAttachments = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-12 flex-col rounded-xl border-solid border-2 border-neutral-200 px-3">
      <div className="flex h-12 w-full items-center gap-2">
        {/* Attachment button */}
        {allowAttachments && (
          <div className="inline-block relative">
            <input
              ref={fileInputRef}
              className="appearance-none hidden absolute inset-0"
              title="Upload file"
              type="file"
              onChange={handleFileChange}
              disabled={disabled}
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-neutral-900 px-1 py-2 text-xl leading-snug hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-neutral-900 h-full flex-1 placeholder:text-neutral-400 outline-none bg-transparent"
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out active:scale-[0.98] inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-base leading-normal text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Show attachment preview if files are selected */}
      {attachments.length > 0 && (
        <div className="flex gap-2 py-2 flex-wrap">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="text-xs bg-neutral-100 rounded px-2 py-1 flex items-center gap-1"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                className="text-neutral-500 hover:text-neutral-900"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
