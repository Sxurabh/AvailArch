// src/lib/imageUtils.ts
// Unified image URL resolver — handles Supabase Storage, Google Drive, Unsplash, and local paths.

/**
 * Resolves any image URL to a renderable source.
 * Handles:
 * - Supabase Storage URLs (passthrough)
 * - Google Drive share links → thumbnail proxy
 * - Standard HTTPS URLs (Unsplash, etc.)
 * - Local paths (/images/...)
 */
export function resolveImageUrl(url: string | undefined): string | null {
    if (!url || typeof url !== "string") return null;

    const trimmed = url.trim();
    if (trimmed.length === 0) return null;

    // 1. Local paths
    if (trimmed.startsWith("/")) return trimmed;

    // 2. Supabase Storage URLs (passthrough — already optimized)
    if (trimmed.includes("supabase.co/storage")) return trimmed;

    // 3. Google Drive links → high-res thumbnail proxy
    const isDriveLink = trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com");
    const idMatch = trimmed.match(/[-\w]{25,}/);
    if (isDriveLink && idMatch) {
        return `https://drive.google.com/thumbnail?id=${idMatch[0]}&sz=w1920`;
    }

    // 4. Standard HTTPS URLs
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return trimmed;
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Extracts a low-quality thumbnail URL for blur placeholders.
 * For Supabase images, swaps "optimized.webp" → "thumbnail.webp".
 * For others, returns the image itself (Next.js will handle sizing).
 */
export function getThumbnailUrl(url: string | undefined): string | null {
    if (!url) return null;

    // If it's a Supabase optimized URL, swap to thumbnail variant
    if (url.includes("supabase.co/storage") && url.includes("/optimized.webp")) {
        return url.replace("/optimized.webp", "/thumbnail.webp");
    }

    // For Drive images, use a smaller thumbnail
    if (url.includes("drive.google.com/thumbnail")) {
        return url.replace("sz=w1920", "sz=w400");
    }

    return resolveImageUrl(url);
}
