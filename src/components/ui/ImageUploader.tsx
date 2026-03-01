"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface UploadedImage {
    optimizedUrl: string;
    thumbnailUrl: string;
    originalName: string;
    compressionRatio: string;
}

interface ImageUploaderProps {
    bucket?: "project-images" | "request-images";
    maxFiles?: number;
    value?: string[];
    onChange: (urls: string[]) => void;
    label?: string;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

export default function ImageUploader({
    bucket = "project-images",
    maxFiles = 10,
    value = [],
    onChange,
    label = "Upload Images",
}: ImageUploaderProps) {
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [progress, setProgress] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Existing URLs (already uploaded images)
    const existingUrls = value || [];

    const handleFiles = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const totalSlots = maxFiles - existingUrls.length;

            if (fileArray.length > totalSlots) {
                setProgress(`Max ${maxFiles} images. ${existingUrls.length} already added.`);
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
                return;
            }

            // Show local previews
            const localPreviews = fileArray.map((f) => URL.createObjectURL(f));
            setPreviews(localPreviews);

            setStatus("uploading");
            setProgress(`Optimizing ${fileArray.length} image${fileArray.length > 1 ? "s" : ""}...`);

            try {
                const formData = new FormData();
                fileArray.forEach((f) => formData.append("files", f));

                const res = await fetch(`/api/upload?bucket=${bucket}`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Upload failed");
                }

                const data = await res.json();
                const newUrls = data.images.map((img: UploadedImage) => img.optimizedUrl);

                // Merge with existing
                onChange([...existingUrls, ...newUrls]);

                setProgress(
                    `${data.summary.count} image${data.summary.count > 1 ? "s" : ""} uploaded — ${data.summary.totalOriginalKB}KB → ${data.summary.totalOptimizedKB}KB`
                );
                setStatus("done");
                setPreviews([]);
                setTimeout(() => setStatus("idle"), 4000);
            } catch (err: any) {
                setProgress(err.message || "Upload failed");
                setStatus("error");
                setPreviews([]);
                setTimeout(() => setStatus("idle"), 5000);
            }
        },
        [bucket, existingUrls, maxFiles, onChange]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    const removeUrl = (index: number) => {
        const updated = existingUrls.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                {label}
            </label>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-all duration-200
          ${dragActive
                        ? "border-black bg-gray-50 scale-[1.01]"
                        : "border-gray-200 hover:border-gray-400 bg-white"
                    }
          ${status === "uploading" ? "pointer-events-none opacity-70" : ""}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />

                {status === "idle" && (
                    <div className="flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-500">
                            Drag & drop images here, or{" "}
                            <span className="text-black font-medium underline">browse</span>
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            JPEG, PNG, WebP — Max {maxFiles} files, 15MB each
                        </p>
                    </div>
                )}

                {status === "uploading" && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">{progress}</p>
                    </div>
                )}

                {status === "done" && (
                    <div className="flex flex-col items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <p className="text-sm text-green-700 font-medium">{progress}</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-3">
                        <X className="w-8 h-8 text-red-500" />
                        <p className="text-sm text-red-600 font-medium">{progress}</p>
                    </div>
                )}
            </div>

            {/* Preview Grid (local previews while uploading) */}
            {previews.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {previews.map((p, i) => (
                        <div key={i} className="relative aspect-square bg-gray-100 overflow-hidden animate-pulse">
                            <Image src={p} alt="preview" fill className="object-cover opacity-50" />
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded Images Grid */}
            {existingUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {existingUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square bg-gray-100 overflow-hidden group">
                            {url ? (
                                <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeUrl(i);
                                }}
                                className="absolute top-1 right-1 bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {i + 1} / {existingUrls.length}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-[10px] text-gray-400">
                {existingUrls.length} / {maxFiles} images
            </p>
        </div>
    );
}
