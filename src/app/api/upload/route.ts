// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeImage } from "@/lib/imageOptimizer";
import { randomUUID } from "crypto";

// Images are optimized via Sharp; PDFs are uploaded as-is
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const PDF_TYPE = "application/pdf";
const ALLOWED_TYPES = [...IMAGE_TYPES, PDF_TYPE];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

interface UploadResult {
    optimizedUrl: string;
    thumbnailUrl: string | null;
    originalName: string;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: string;
    fileType: "image" | "pdf";
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Determine bucket based on query param (default: project-images for admin)
        const bucket = request.nextUrl.searchParams.get("bucket") || "project-images";
        if (!["project-images", "request-images"].includes(bucket)) {
            return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files.length) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        if (files.length > 10) {
            return NextResponse.json({ error: "Maximum 10 files per upload" }, { status: 400 });
        }

        const results: UploadResult[] = [];

        for (const file of files) {
            // Validate type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP, HEIC, PDF` },
                    { status: 400 }
                );
            }

            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File too large: ${file.name}. Max: 15MB` },
                    { status: 400 }
                );
            }

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileId = randomUUID();
            const basePath = `${user.id}/${fileId}`;

            // --- PDF: upload directly without optimization ---
            if (file.type === PDF_TYPE) {
                const { error: pdfError } = await supabase.storage
                    .from(bucket)
                    .upload(`${basePath}/original.pdf`, buffer, {
                        contentType: "application/pdf",
                        cacheControl: "31536000",
                        upsert: false,
                    });

                if (pdfError) throw new Error(`Upload failed for ${file.name}: ${pdfError.message}`);

                const { data: pdfUrl } = supabase.storage.from(bucket).getPublicUrl(`${basePath}/original.pdf`);

                results.push({
                    optimizedUrl: pdfUrl.publicUrl,
                    thumbnailUrl: null,
                    originalName: file.name,
                    originalSize: file.size,
                    optimizedSize: file.size,
                    compressionRatio: "0%",
                    fileType: "pdf",
                });
                continue;
            }

            // --- IMAGE (JPEG, PNG, WebP, HEIC): optimize via Sharp ---
            const optimized = await optimizeImage(buffer);

            // Upload optimized version
            const { error: optError } = await supabase.storage
                .from(bucket)
                .upload(`${basePath}/optimized.webp`, optimized.optimizedBuffer, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                });

            if (optError) throw new Error(`Upload failed for ${file.name}: ${optError.message}`);

            // Upload thumbnail
            const { error: thumbError } = await supabase.storage
                .from(bucket)
                .upload(`${basePath}/thumbnail.webp`, optimized.thumbnailBuffer, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                });

            if (thumbError) throw new Error(`Thumbnail upload failed for ${file.name}: ${thumbError.message}`);

            // Get public URLs
            const { data: optUrl } = supabase.storage.from(bucket).getPublicUrl(`${basePath}/optimized.webp`);
            const { data: thumbUrl } = supabase.storage.from(bucket).getPublicUrl(`${basePath}/thumbnail.webp`);

            const ratio = ((1 - optimized.optimizedSize / optimized.originalSize) * 100).toFixed(0);

            results.push({
                optimizedUrl: optUrl.publicUrl,
                thumbnailUrl: thumbUrl.publicUrl,
                originalName: file.name,
                originalSize: optimized.originalSize,
                optimizedSize: optimized.optimizedSize,
                compressionRatio: `${ratio}%`,
                fileType: "image",
            });
        }

        return NextResponse.json({
            success: true,
            images: results,
            summary: {
                count: results.length,
                totalOriginalKB: Math.round(results.reduce((s, r) => s + r.originalSize, 0) / 1024),
                totalOptimizedKB: Math.round(results.reduce((s, r) => s + r.optimizedSize, 0) / 1024),
            },
        });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
