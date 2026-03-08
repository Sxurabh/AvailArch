import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const mockGetUser = vi.fn()
const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockOptimizeImage = vi.fn()

vi.mock('lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  })),
}))

vi.mock('lib/imageOptimizer', () => ({
  optimizeImage: (...args: any[]) => mockOptimizeImage(...args),
}))

function createRequest(options: { bucket?: string; files?: File[] }) {
  const formData = new FormData()
  options.files?.forEach((f) => formData.append('files', f))
  const searchParams = new URLSearchParams()
  if (options.bucket) searchParams.set('bucket', options.bucket)
  return { formData: async () => formData, nextUrl: { searchParams } } as any
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
  mockUpload.mockResolvedValue({ error: null })
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/file.webp' } })
  mockOptimizeImage.mockResolvedValue({
    optimizedBuffer: Buffer.from('optimized'),
    thumbnailBuffer: Buffer.from('thumb'),
    originalSize: 2000,
    optimizedSize: 1000,
  })
})

describe('POST /api/upload', () => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    const req = createRequest({ bucket: 'project-images', files: [] })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  // ── Validation ────────────────────────────────────────────────────────────
  it('returns 400 for invalid bucket', async () => {
    const req = createRequest({ bucket: 'invalid-bucket', files: [] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Invalid bucket')
  })

  it('returns 400 when no files are provided', async () => {
    const req = createRequest({ bucket: 'project-images', files: [] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('No files provided')
  })

  it('returns 400 when more than 10 files are provided', async () => {
    const files = Array.from({ length: 11 }, (_, i) => new File(['x'], `file-${i}.jpg`, { type: 'image/jpeg' }))
    const req = createRequest({ bucket: 'project-images', files })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Maximum 10 files per upload')
  })

  it('returns 400 for invalid file type', async () => {
    const file = new File(['hello'], 'file.txt', { type: 'text/plain' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Invalid file type/i)
  })

  it('returns 400 for files over 15 MB', async () => {
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 16 * 1024 * 1024 })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/File too large/i)
  })

  // ── Happy paths ───────────────────────────────────────────────────────────
  it('uploads a single image successfully and returns summary', async () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.images).toHaveLength(1)
    expect(body.images[0].optimizedUrl).toBe('https://example.com/file.webp')
    expect(body.images[0].fileType).toBe('image')
    expect(body.summary.count).toBe(1)
    expect(mockOptimizeImage).toHaveBeenCalledTimes(1)
    expect(mockUpload).toHaveBeenCalledTimes(2) // optimized + thumbnail
  })

  it('uploads a PDF without calling optimizeImage', async () => {
    const file = new File(['pdf-bytes'], 'doc.pdf', { type: 'application/pdf' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.images[0].fileType).toBe('pdf')
    expect(body.images[0].thumbnailUrl).toBeNull()
    expect(mockOptimizeImage).not.toHaveBeenCalled()
  })

  it('returns 500 when storage upload fails', async () => {
    mockUpload.mockResolvedValueOnce({ error: { message: 'Storage down' } })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/Upload failed/i)
  })

  // ── NEW: Additional cases ─────────────────────────────────────────────────
  it('uploads multiple files in one batch and returns correct count', async () => {
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'c.jpg', { type: 'image/jpeg' }),
    ]
    const req = createRequest({ bucket: 'project-images', files })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.summary.count).toBe(3)
    expect(body.images).toHaveLength(3)
    expect(mockOptimizeImage).toHaveBeenCalledTimes(3)
  })

  it('accepts HEIC file type without error', async () => {
    const file = new File(['heic-bytes'], 'photo.heic', { type: 'image/heic' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.images[0].fileType).toBe('image')
  })

  it('accepts request-images bucket (client uploads)', async () => {
    const file = new File(['img'], 'plan.png', { type: 'image/png' })
    const req = createRequest({ bucket: 'request-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 500 when thumbnail storage upload fails', async () => {
    // First upload (optimized) succeeds, second (thumbnail) fails
    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'Thumbnail storage error' } })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const req = createRequest({ bucket: 'project-images', files: [file] })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/Thumbnail upload failed/i)
  })
})
