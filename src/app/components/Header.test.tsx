import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from './Header'

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/'),
    useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/useUser', () => ({
    useUser: vi.fn(() => ({ user: null, session: null })),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
        },
    })),
}))

vi.mock('@/context/ThemeContext', () => ({
    useTheme: vi.fn(() => ({
        theme: 'light',
        toggleTheme: vi.fn(),
    })),
}))

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
        div: ({ children, ...props }: any) => {
            const { className, style, ...rest } = props;
            return <div className={className} style={style} {...rest}>{children}</div>;
        },
    },
}))

describe('Header', () => {
    it('renders without crashing', () => {
        const { container } = render(<Header />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
