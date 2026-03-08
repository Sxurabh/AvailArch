import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '../dashboard/page'

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/useUser', () => ({
    useUser: vi.fn(() => ({ 
        user: { id: 'test-user', email: 'test@test.com', role: 'admin' }, 
        session: { access_token: 'test-token' } 
    })),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        })),
    })),
}))

vi.mock('@/lib/utils', () => ({
    cn: (...classes: (string | undefined | null | boolean)[]) => classes.filter(Boolean).join(' '),
}))

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        const { container } = render(<Dashboard />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
