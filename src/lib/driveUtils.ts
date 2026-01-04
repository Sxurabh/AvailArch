// src/lib/driveUtils.ts

export function getDriveImage(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  // 1. Allow Local Paths (e.g. "/images/project1.jpg")
  if (trimmed.startsWith("/")) return trimmed;

  // 2. Detect Google Drive Links
  // Matches IDs in: drive.google.com/file/d/ID/view, open?id=ID, etc.
  const isDriveLink = trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com");
  const idMatch = trimmed.match(/[-\w]{25,}/);

  if (isDriveLink && idMatch) {
    const fileId = idMatch[0];
    // Returns a high-res thumbnail (w1920 = width 1920px)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
  }

  // 3. Validate Standard URLs (Unsplash, etc.)
  try {
    const parsed = new URL(trimmed);
    // Only allow http/https to avoid "javascript:" or other schemes
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch (e) {
    // Fails silently if not a valid URL
    return null;
  }

  return null;
}