import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mocks for Supabase client and image optimizer
const mockGetUser = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockOptimizeImage = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  })),
}));

vi.mock('@/lib/imageOptimizer', () => ({
  optimizeImage: (...args: any[]) => mockOptimizeImage(...args),
}));

function createRequest(options: { bucket?: string; files?: File[] }) {
  const formData = new FormData();
  (options.files || []).forEach((file) => formData.append('files', file));

  const searchParams = new URLSearchParams();
  if (options.bucket) searchParams.set('bucket', options.bucket);

  return {
    formData: async () => formData,
    nextUrl: { searchParams },
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();

  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null,
  });

  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({
    data: { publicUrl: 'https://example.com/file.webp' },
  });

  mockOptimizeImage.mockResolvedValue({
    optimizedBuffer: Buffer.from('optimized'),
    thumbnailBuffer: Buffer.from('thumb'),
    originalSize: 2000,
    optimizedSize: 1000,
  });
});

describe('POST /api/upload', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = createRequest({ bucket: 'project-images', files: [] });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('rejects invalid bucket', async () => {
    const req = createRequest({ bucket: 'invalid-bucket', files: [] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid bucket');
  });

  it('rejects when no files are provided', async () => {
    const req = createRequest({ bucket: 'project-images', files: [] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('No files provided');
  });

  it('rejects when more than 10 files are provided', async () => {
    const files = Array.from({ length: 11 }, (_, i) => new File(['x'], `file-${i}.jpg`, { type: 'image/jpeg' }));
    const req = createRequest({ bucket: 'project-images', files });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Maximum 10 files per upload');
  });

  it('rejects invalid file type', async () => {
    const file = new File(['hello'], 'file.txt', { type: 'text/plain' });
    const req = createRequest({ bucket: 'project-images', files: [file] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid file type/i);
  });

  it('rejects files over 15MB', async () => {
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 16 * 1024 * 1024 });

    const req = createRequest({ bucket: 'project-images', files: [file] });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/File too large/i);
  });

  it('handles image upload successfully and returns summary', async () => {
    const file = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const req = createRequest({ bucket: 'project-images', files: [file] });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.images).toHaveLength(1);
    expect(body.images[0].optimizedUrl).toBe('https://example.com/file.webp');
    expect(body.images[0].fileType).toBe('image');

    expect(body.summary.count).toBe(1);
    expect(body.summary.totalOriginalKB).toBeGreaterThan(0);
    expect(body.summary.totalOptimizedKB).toBeGreaterThan(0);

    expect(mockOptimizeImage).toHaveBeenCalledTimes(1);
    expect(mockUpload).toHaveBeenCalledTimes(2); // optimized + thumbnail
  });

  it('handles pdf upload successfully', async () => {
    const file = new File(['pdf-bytes'], 'doc.pdf', { type: 'application/pdf' });
    const req = createRequest({ bucket: 'project-images', files: [file] });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.images).toHaveLength(1);
    expect(body.images[0].fileType).toBe('pdf');
    expect(mockOptimizeImage).not.toHaveBeenCalled();
  });

  it('returns 500 when storage upload fails', async () => {
    mockUpload.mockResolvedValueOnce({ error: { message: 'Storage down' } });

    const file = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const req = createRequest({ bucket: 'project-images', files: [file] });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toMatch(/Upload failed/i);
  });
});

