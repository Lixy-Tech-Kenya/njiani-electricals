'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api/client';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      setError('');

      try {
        const newUrls: string[] = [];
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append('file', file);
          const result = await clientApi.upload<{ url: string }>('/admin/upload/image', formData);
          newUrls.push(result.url);
        }
        onChange([...value, ...newUrls]);
      } catch {
        setError('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [value, onChange],
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--color-border)] rounded-xl cursor-pointer hover:border-[var(--color-accent)] transition-colors bg-gray-50 hover:bg-gray-100">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
        ) : (
          <>
            <Upload className="w-6 h-6 text-[var(--color-muted)] mb-2" />
            <p className="text-sm text-[var(--color-muted)]">Click to upload images</p>
            <p className="text-xs text-[var(--color-muted)]">JPG, PNG, WebP</p>
          </>
        )}
      </label>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
              <Image
                src={url.startsWith('http') ? url : `${BACKEND_URL}${url}`}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
