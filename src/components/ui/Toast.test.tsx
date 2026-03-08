import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Toast from './Toast'

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Toast', () => {
    const defaultProps = {
        message: 'Test message',
        isVisible: true,
        onClose: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders nothing when isVisible is false', () => {
        const { container } = render(<Toast {...defaultProps} isVisible={false} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders success toast with message', () => {
        render(<Toast {...defaultProps} />)
        expect(screen.getByText('Test message')).toBeInTheDocument()
        expect(screen.getByText('success')).toBeInTheDocument()
    })

    it('renders error toast with error type', () => {
        render(<Toast {...defaultProps} type="error" message="Error occurred" />)
        expect(screen.getByText('Error occurred')).toBeInTheDocument()
        expect(screen.getByText('error')).toBeInTheDocument()
    })

    it('renders info toast with info type', () => {
        render(<Toast {...defaultProps} type="info" message="Info message" />)
        expect(screen.getByText('Info message')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
        render(<Toast {...defaultProps} />)
        const closeBtn = screen.getByRole('button')
        fireEvent.click(closeBtn)
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('renders with default success type when type not specified', () => {
        render(<Toast {...defaultProps} />)
        expect(screen.getByText('success')).toBeInTheDocument()
    })

    it('displays different icons for each type', () => {
        const { rerender } = render(<Toast {...defaultProps} type="success" />)
        expect(screen.getByText('success')).toBeInTheDocument()
        
        rerender(<Toast {...defaultProps} type="error" />)
        expect(screen.getByText('error')).toBeInTheDocument()
        
        rerender(<Toast {...defaultProps} type="info" />)
        expect(screen.getByText('info')).toBeInTheDocument()
    })
})
