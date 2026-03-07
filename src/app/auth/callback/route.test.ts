import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

const mockExchangeCode = vi.fn()

vi.mock('lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: { exchangeCodeForSession: mockExchangeCode },
    })),
}))

function makeRequest(params: Record<string, string>) {
    const url = new URL('http://localhost:3000/auth/callback')
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return new Request(url.toString())
}

beforeEach(() => {
    vi.clearAllMocks()
    mockExchangeCode.mockResolvedValue({ error: null })
})

describe('GET /auth/callback', () => {
    it('redirects to / after successful code exchange', async () => {
        const req = makeRequest({ code: 'valid-code-123' })
        const res = await GET(req)
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('redirects to the `next` param after successful exchange', async () => {
        const req = makeRequest({ code: 'valid-code-123', next: '/dashboard' })
        const res = await GET(req)
        expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
    })

    it('redirects to /auth/auth-code-error when exchange fails', async () => {
        mockExchangeCode.mockResolvedValueOnce({ error: { message: 'Invalid code' } })
        const req = makeRequest({ code: 'bad-code' })
        const res = await GET(req)
        expect(res.headers.get('location')).toContain('/auth/auth-code-error')
    })

    it('redirects to /auth/auth-code-error when no code is provided', async () => {
        const req = makeRequest({})
        const res = await GET(req)
        expect(res.headers.get('location')).toContain('/auth/auth-code-error')
        expect(mockExchangeCode).not.toHaveBeenCalled()
    })
})
