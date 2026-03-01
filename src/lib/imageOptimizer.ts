// src/lib/imageOptimizer.ts
import sharp from "sharp";

export interface OptimizedImage {
    optimizedBuffer: Buffer;
    thumbnailBuffer: Buffer;
    width: number;
    height: number;
    originalSize: number;
    optimizedSize: number;
    thumbnailSize: number;
}

/**
 * Processes a raw image buffer into optimized WebP variants.
 * - `optimized`: WebP @ quality 82, max 1920px wide (for display)
 * - `thumbnail`: WebP @ quality 75, max 400px wide (for grids/cards/blur placeholders)
 * 
 * No original is stored to conserve storage.
 */
export async function optimizeImage(buffer: Buffer): Promise<OptimizedImage> {
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.byteLength;

    // Generate optimized display image (max 1920px wide, WebP)
    const optimizedResult = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    // Generate thumbnail (max 400px wide, WebP)
    const thumbnailResult = await sharp(buffer)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    return {
        optimizedBuffer: optimizedResult.data,
        thumbnailBuffer: thumbnailResult.data,
        width: metadata.width || 0,
        height: metadata.height || 0,
        originalSize,
        optimizedSize: optimizedResult.info.size,
        thumbnailSize: thumbnailResult.info.size,
    };
}
