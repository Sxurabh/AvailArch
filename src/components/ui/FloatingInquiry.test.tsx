import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FloatingInquiry from './FloatingInquiry'

vi.mock('hooks/useUser', () => ({
    useUser: vi.fn(() => ({ user: null })),
}))

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

vi.mock('components/ui/MagneticButton', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="magnetic-button">{children}</div>,
}))

describe('FloatingInquiry', () => {
    it('renders without errors', () => {
        const { container } = render(<FloatingInquiry />)
        expect(container).toBeTruthy()
    })
})
