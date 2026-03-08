import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
  mockSingle.mockResolvedValue({ data: { role: 'admin' } })
  mockEq.mockReturnValue({ single: mockSingle })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockFrom.mockReturnValue({ select: mockSelect })
})

describe('GET /api/about', () => {
  it('returns static fetch implemented message', async () => {
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Fetch implemented' })
  })
})

describe('POST /api/about', () => {
  function makeReq(body: object) {
    return { json: async () => body } as Request
  }

  it('returns 401 when no authenticated user exists', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const res = await POST(makeReq({ heroTitle: 'Hello' }))

    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  it('returns 401 when user is not an admin', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'user' } })

    const res = await POST(makeReq({ heroTitle: 'Hello' }))

    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  it('returns success with echoed payload for admin users', async () => {
    const payload = { heroTitle: 'About us' }

    const res = await POST(makeReq(payload))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, data: payload })
  })
})
