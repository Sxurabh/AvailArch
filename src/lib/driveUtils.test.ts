import { describe, it, expect } from 'vitest'
import { getDriveImage } from './driveUtils'

describe('getDriveImage', () => {
    it('returns null for undefined', () => {
        expect(getDriveImage(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(getDriveImage('')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
        expect(getDriveImage('   ')).toBeNull()
    })

    it('passes local paths through unchanged', () => {
        expect(getDriveImage('/images/project.jpg')).toBe('/images/project.jpg')
    })

    it('converts Google Drive file/d/ID/view link to thumbnail URL', () => {
        const driveUrl =
            'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view'
        const result = getDriveImage(driveUrl)
        expect(result).toContain('drive.google.com/thumbnail')
        expect(result).toContain('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms')
        expect(result).toContain('w1920')
    })

    it('handles open?id= Drive format', () => {
        const driveUrl =
            'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
        const result = getDriveImage(driveUrl)
        expect(result).toContain('thumbnail')
        expect(result).toContain('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms')
    })

    it('passes standard HTTPS URLs (e.g. Unsplash) through unchanged', () => {
        const url = 'https://images.unsplash.com/photo-xyz?w=800'
        expect(getDriveImage(url)).toBe(url)
    })

    it('returns null for a plain non-URL string', () => {
        expect(getDriveImage('not-a-valid-url')).toBeNull()
    })

    it('returns null for javascript: protocol (XSS guard)', () => {
        expect(getDriveImage('javascript:alert(1)')).toBeNull()
    })
})
