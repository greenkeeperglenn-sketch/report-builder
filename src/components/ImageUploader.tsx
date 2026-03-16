"use client";

import { useRef } from "react";
import { ImageUpload } from "@/lib/types";

interface ImageUploaderProps {
  images: ImageUpload[];
  onImagesChange: (images: ImageUpload[]) => void;
}

export default function ImageUploader({
  images,
  onImagesChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);

    Promise.all(
      files.map(
        (file) =>
          new Promise<ImageUpload>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                caption: `Figure ${images.length + 1}: ${file.name.replace(/\.[^.]+$/, "")}`,
                dataUrl: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      onImagesChange([...images, ...newImages]);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    onImagesChange(
      images.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">
        Images (optional)
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-colors hover:border-blue-400"
      >
        <p className="text-sm text-slate-500">Drop images or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative rounded-lg border border-slate-200 bg-white p-2"
            >
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-2 top-2 rounded-full bg-white/80 px-1.5 text-sm text-red-500 hover:bg-red-50"
              >
                &times;
              </button>
              <img
                src={img.dataUrl}
                alt={img.name}
                className="h-32 w-full rounded object-cover"
              />
              <input
                value={img.caption}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
                placeholder="Figure caption..."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
