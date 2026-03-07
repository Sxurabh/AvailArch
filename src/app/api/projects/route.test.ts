import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

// ── Supabase mock factory ──────────────────────────────────────────────────
const mockOrder = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()

vi.mock('lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({ from: mockFrom })),
}))

const mockProject = {
    id: 'proj-1',
    title: 'Villa Noir',
    year: '2024',
    category: 'Residential',
    image: '/images/villa.jpg',
    gridcolspan: 8,
    gridrowspan: 2,
    description: 'A minimalist villa',
    client: 'John Doe',
    location: 'Mumbai',
    beforeimage: null,
    afterimage: null,
    projectheroimages: [],
    projectsections: [],
    projectspaces: [],
    projectgallery: [],
}

beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({ data: [mockProject], error: null })
    mockSelect.mockReturnValue({ order: mockOrder, single: mockSingle })
    mockSingle.mockResolvedValue({ data: { id: 'new-proj-1' }, error: null })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert })
})

describe('GET /api/projects', () => {
    it('returns a list of formatted projects', async () => {
        const res = await GET()
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body)).toBe(true)
        expect(body[0].id).toBe('proj-1')
        expect(body[0].title).toBe('Villa Noir')
    })

    it('maps gridcolspan → gridColSpan correctly', async () => {
        const res = await GET()
        const body = await res.json()
        expect(body[0].gridColSpan).toBe(8)
        expect(body[0].gridRowSpan).toBe(2)
    })

    it('returns an empty array when no projects exist', async () => {
        mockOrder.mockResolvedValueOnce({ data: [], error: null })
        const res = await GET()
        const body = await res.json()
        expect(body).toEqual([])
    })

    it('returns 500 when Supabase throws an error', async () => {
        mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
        const res = await GET()
        expect(res.status).toBe(500)
        expect((await res.json()).error).toMatch(/Failed to fetch projects/i)
    })
})

describe('POST /api/projects', () => {
    function makeRequest(body: object) {
        return { json: async () => body } as any
    }

    it('creates a project and returns success with id', async () => {
        const req = makeRequest({
            title: 'New Project',
            year: '2025',
            category: 'Commercial',
            image: '/img.jpg',
            gridColSpan: 4,
            gridRowSpan: 1,
            description: 'A commercial space',
            status: 'active',
            heroImages: [],
            spaces: [],
            gallery: [],
            sections: [],
        })
        const res = await POST(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.success).toBe(true)
        expect(body.mode).toBe('create')
        expect(body.id).toBe('new-proj-1')
    })

    it('inserts hero images when provided', async () => {
        // Track additional from() calls for sub-tables
        const mockHeroInsert = vi.fn().mockResolvedValue({ error: null })
        mockFrom.mockImplementation((table: string) => {
            if (table === 'projectheroimages') return { insert: mockHeroInsert }
            return { select: mockSelect, insert: mockInsert }
        })

        const req = makeRequest({
            title: 'Hero Test',
            heroImages: ['https://example.com/img1.webp', 'https://example.com/img2.webp'],
            spaces: [],
            gallery: [],
            sections: [],
        })
        await POST(req)
        expect(mockHeroInsert).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ imageurl: 'https://example.com/img1.webp', sortorder: 0 }),
                expect.objectContaining({ imageurl: 'https://example.com/img2.webp', sortorder: 1 }),
            ])
        )
    })

    it('returns 500 when project insert fails', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } })
        const req = makeRequest({ title: 'Fail', heroImages: [], spaces: [], gallery: [], sections: [] })
        const res = await POST(req)
        expect(res.status).toBe(500)
        expect((await res.json()).error).toMatch(/Failed to save project/i)
    })
})
