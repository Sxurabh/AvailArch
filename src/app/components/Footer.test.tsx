import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from './Footer'

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

describe('Footer', () => {
    it('renders without crashing', () => {
        const { container } = render(<Footer />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
