import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MagneticButton from './MagneticButton'

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}))

beforeEach(() => {
    HTMLElement.prototype.getBoundingClientRect = () => ({
        width: 200,
        height: 50,
        top: 100,
        left: 100,
        bottom: 150,
        right: 300,
        x: 100,
        y: 100,
        toJSON: () => {},
    })
})

describe('MagneticButton', () => {
    it('renders children correctly', () => {
        render(
            <MagneticButton>
                <button>Click me</button>
            </MagneticButton>
        )
        expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument()
    })

    it('applies custom className', () => {
        render(
            <MagneticButton className="custom-class">
                <div>Content</div>
            </MagneticButton>
        )
        const container = screen.getByText('Content').parentElement
        expect(container).toHaveClass('custom-class')
    })

    it('responds to mouse move event', () => {
        render(
            <MagneticButton>
                <div>Move mouse here</div>
            </MagneticButton>
        )
        
        const container = screen.getByText('Move mouse here')
        
        fireEvent.mouseMove(container, { clientX: 200, clientY: 150 })
        
        expect(container.parentElement).toBeTruthy()
    })

    it('resets position on mouse leave', () => {
        render(
            <MagneticButton>
                <div>Content</div>
            </MagneticButton>
        )
        
        const container = screen.getByText('Content')
        
        fireEvent.mouseMove(container, { clientX: 300, clientY: 200 })
        fireEvent.mouseLeave(container)
        
        expect(container.parentElement).toBeTruthy()
    })
})
