import { describe, it, expect } from 'vitest'
import { resolveImageUrl, getThumbnailUrl } from './imageUtils'

describe('resolveImageUrl', () => {
    it('returns null for undefined', () => {
        expect(resolveImageUrl(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(resolveImageUrl('')).toBeNull()
    })

    it('returns null for whitespace string', () => {
        expect(resolveImageUrl('   ')).toBeNull()
    })

    it('passes local paths through unchanged', () => {
        expect(resolveImageUrl('/images/hero.jpg')).toBe('/images/hero.jpg')
    })

    it('passes Supabase storage URLs through unchanged', () => {
        const url =
            'https://xyz.supabase.co/storage/v1/object/public/project-images/user/file.webp'
        expect(resolveImageUrl(url)).toBe(url)
    })

    it('passes Google Drive URLs through unchanged (use getDriveImage for conversion)', () => {
        const url = 'https://drive.google.com/file/d/1abc123DEF456ghi789/view'
        const result = resolveImageUrl(url)
        expect(result).toBe(url)  // resolveImageUrl just validates/passes through
    })

    it('passes valid external HTTPS URLs through', () => {
        const url = 'https://cdn.example.com/image.jpg'
        expect(resolveImageUrl(url)).toBe(url)
    })

    it('returns null for a random string with no valid URL format', () => {
        expect(resolveImageUrl('random-string-no-path')).toBeNull()
    })
})

// src/lib/imageUtils.test.ts  — replace the getThumbnailUrl describe block

describe('getThumbnailUrl', () => {
    it('returns null for null input', () => {
        // Cast to any to test runtime guard even though type signature excludes null
        expect(getThumbnailUrl(null as any)).toBeNull()
    })

    it('returns null for undefined input', () => {
        expect(getThumbnailUrl(undefined)).toBeNull()
    })

    it('swaps optimized.webp → thumbnail.webp for Supabase URLs', () => {
        const url =
            'https://xyz.supabase.co/storage/v1/object/public/project-images/uid/uuid/optimized.webp'
        const result = getThumbnailUrl(url)
        expect(result).toContain('thumbnail.webp')
        expect(result).not.toContain('optimized.webp')
    })

    it('returns the original URL unchanged for non-Supabase URLs', () => {
        const url = 'https://cdn.example.com/image.jpg'
        expect(getThumbnailUrl(url)).toBe(url)
    })
})
