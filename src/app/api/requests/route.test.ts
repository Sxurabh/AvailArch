import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH } from './route'

const mockGetUser = vi.fn()
const mockOrder = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()

vi.mock('lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: mockGetUser },
        from: mockFrom,
    })),
}))

const mockRequest = {
    id: 'req-1',
    createdat: '2025-01-01T00:00:00Z',
    type: 'Residential - 2 BHK',
    description: 'Open plan living space',
    status: 'Pending',
    adminnotes: '',
    projectcategory: 'residential',
    commercialtype: null,
    contactno: '9999999999',
    projectlocation: 'Mumbai',
    bhk: '2',
    areavalue: 1200,
    areaunit: 'sqft',
    planimages: [],
    isarchived: false,
    profiles: { email: 'client@example.com' },
}

beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockOrder.mockResolvedValue({ data: [mockRequest], error: null })
    mockEq.mockResolvedValue({ error: null })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockInsert.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate })
})

describe('GET /api/requests', () => {
    it('returns a formatted list of requests', async () => {
        const req = {} as any
        const res = await GET(req)
        expect(res.status).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body)).toBe(true)
        expect(body[0].id).toBe('req-1')
        expect(body[0].userEmail).toBe('client@example.com')
        expect(body[0].contactNo).toBe('9999999999')
        expect(body[0].planImages).toEqual([])
    })

    it('returns empty array when no requests exist', async () => {
        mockOrder.mockResolvedValueOnce({ data: [], error: null })
        const res = await GET({} as any)
        expect((await res.json())).toEqual([])
    })

    it('returns 401 when Supabase returns an error', async () => {
        mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'Unauthorized' } })
        const res = await GET({} as any)
        expect(res.status).toBe(401)
    })
})

describe('POST /api/requests', () => {
    function makeReq(body: object) {
        return { json: async () => body } as any
    }

    it('creates a residential request successfully', async () => {
        const req = makeReq({
            projectCategory: 'residential',
            bhk: '2',
            contactNo: '9999999999',
            projectLocation: 'Mumbai',
            areaValue: '1200',
            areaUnit: 'sqft',
            description: 'Light-filled living room',
            planImages: [],
        })
        const res = await POST(req)
        expect(res.status).toBe(200)
        expect((await res.json()).success).toBe(true)
    })

    it('creates a commercial request with commercialType set', async () => {
        const req = makeReq({
            projectCategory: 'commercial',
            commercialType: 'Office',
            contactNo: '9999999999',
            projectLocation: 'Delhi',
            areaValue: '3000',
            areaUnit: 'sqft',
            description: 'Open-plan office',
            planImages: ['https://example.com/plan.webp'],
        })
        const res = await POST(req)
        expect(res.status).toBe(200)
        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({ commercialtype: 'Office', projectcategory: 'commercial' })
        )
    })

    it('returns 401 when user is not authenticated', async () => {
        mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
        const req = makeReq({ projectCategory: 'residential' })
        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it('returns 500 when insert fails', async () => {
        mockInsert.mockResolvedValueOnce({ error: { message: 'DB insert failed' } })
        const req = makeReq({ projectCategory: 'residential', planImages: [] })
        const res = await POST(req)
        expect(res.status).toBe(500)
    })
})

describe('PATCH /api/requests', () => {
    function makeReq(body: object) {
        return { json: async () => body } as any
    }

    it('updates request status', async () => {
        const req = makeReq({ id: 'req-1', status: 'In Progress' })
        const res = await PATCH(req)
        expect(res.status).toBe(200)
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'In Progress' }))
        expect(mockEq).toHaveBeenCalledWith('id', 'req-1')
    })

    it('updates adminNotes', async () => {
        const req = makeReq({ id: 'req-1', adminNotes: 'Will call tomorrow.' })
        const res = await PATCH(req)
        expect(res.status).toBe(200)
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ adminnotes: 'Will call tomorrow.' }))
    })

    it('archives a request', async () => {
        const req = makeReq({ id: 'req-1', isArchived: true })
        const res = await PATCH(req)
        expect(res.status).toBe(200)
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ isarchived: true }))
    })

    it('returns 500 when update fails', async () => {
        mockEq.mockResolvedValueOnce({ error: { message: 'Update failed' } })
        const req = makeReq({ id: 'req-1', status: 'Completed' })
        const res = await PATCH(req)
        expect(res.status).toBe(500)
    })
})
