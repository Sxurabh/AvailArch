import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockGetFormResponses = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/sheetsAdmin', () => ({
  getFormResponses: mockGetFormResponses,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
  mockSingle.mockResolvedValue({ data: { role: 'admin' } })
  mockEq.mockReturnValue({ single: mockSingle })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockFrom.mockReturnValue({ select: mockSelect })
  mockGetFormResponses.mockResolvedValue({ headers: ['h1'], data: [['v1']] })
})

describe('GET /api/admin/form-responses', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const res = await GET()

    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  it('returns 401 when user is not an admin', async () => {
    mockSingle.mockResolvedValueOnce({ data: { role: 'user' } })

    const res = await GET()

    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Unauthorized')
  })

  it('returns headers and data for admin users', async () => {
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ headers: ['h1'], data: [['v1']] })
    expect(mockGetFormResponses).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when an unexpected error occurs', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('boom'))

    const res = await GET()

    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/Failed to load responses/i)
  })
})
