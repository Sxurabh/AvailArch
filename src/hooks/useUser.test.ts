import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUser } from './useUser'

const mockUnsubscribe = vi.fn()
const mockGetSession = vi.fn()
const mockGetProfile = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getSession: mockGetSession,
            onAuthStateChange: mockOnAuthStateChange,
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: mockGetProfile,
                }),
            }),
        }),
    })),
}))

beforeEach(() => {
    vi.clearAllMocks()
    mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
})

describe('useUser', () => {
    it('starts in a loading state', () => {
        mockGetSession.mockResolvedValue({ data: { session: null } })
        const { result } = renderHook(() => useUser())
        expect(result.current.loading).toBe(true)
    })

    it('returns null user when no session exists', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null } })
        const { result } = renderHook(() => useUser())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.user).toBeNull()
        expect(result.current.session).toBeNull()
    })

    it('returns user with role when session and profile exist', async () => {
        const fakeSession = {
            user: { id: 'user-123', email: 'test@example.com' },
        }
        mockGetSession.mockResolvedValue({ data: { session: fakeSession } })
        mockGetProfile.mockResolvedValue({ data: { role: 'admin' } })

        const { result } = renderHook(() => useUser())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.user?.email).toBe('test@example.com')
        expect(result.current.user?.role).toBe('admin')
    })

    it('sets role to null when profile fetch returns no role', async () => {
        const fakeSession = { user: { id: 'user-123', email: 'client@example.com' } }
        mockGetSession.mockResolvedValue({ data: { session: fakeSession } })
        mockGetProfile.mockResolvedValue({ data: null })

        const { result } = renderHook(() => useUser())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.user?.role).toBeNull()
    })

    it('cleans up subscription on unmount', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null } })
        const { unmount } = renderHook(() => useUser())
        await waitFor(() => { })
        unmount()
        expect(mockUnsubscribe).toHaveBeenCalled()
    })
})
