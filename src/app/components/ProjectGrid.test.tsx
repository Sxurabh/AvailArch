import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectGrid from './ProjectGrid'

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
        div: ({ children, ...props }: any) => {
            const { className, style, ...rest } = props;
            return <div className={className} style={style} {...rest}>{children}</div>;
        },
    },
}))

vi.mock('@/hooks/useUser', () => ({
    useUser: vi.fn(() => ({ user: null })),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        })),
        removeChannel: vi.fn(),
    })),
}))

global.fetch = vi.fn()

describe('ProjectGrid', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', () => {
        ;(fetch as any).mockResolvedValue({
            ok: true,
            json: async () => [],
        })
        
        const { container } = render(<ProjectGrid />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
