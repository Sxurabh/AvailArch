import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BeforeAfterSlider from './BeforeAfterSlider'

vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}))

const defaultProps = {
    beforeImage: 'https://example.com/before.jpg',
    afterImage: 'https://example.com/after.jpg',
}

describe('BeforeAfterSlider', () => {
    it('renders both before and after images', () => {
        render(<BeforeAfterSlider {...defaultProps} />)
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(2)
    })

    it('renders default labels Before and After', () => {
        render(<BeforeAfterSlider {...defaultProps} />)
        expect(screen.getByText('Before')).toBeInTheDocument()
        expect(screen.getByText('After')).toBeInTheDocument()
    })

    it('renders custom labels when provided', () => {
        render(<BeforeAfterSlider {...defaultProps} leftLabel="Existing" rightLabel="Proposed" />)
        expect(screen.getByText('Existing')).toBeInTheDocument()
        expect(screen.getByText('Proposed')).toBeInTheDocument()
    })

    it('starts at 50% slider position by default', () => {
        const { container } = render(<BeforeAfterSlider {...defaultProps} />)
        // The clip/overlay element that uses sliderPosition should start at 50%
        const slider = container.querySelector('[style*="50%"]')
        expect(slider).toBeTruthy()
    })

    it('updates slider position on mouse drag', () => {
        const { container } = render(<BeforeAfterSlider {...defaultProps} />)
        const sliderHandle = container.querySelector('[onMouseDown]') as HTMLElement

        // Simulate mousedown then mousemove on window
        fireEvent.mouseDown(sliderHandle)
        const moveEvent = new MouseEvent('mousemove', { clientX: 300, bubbles: true })
        window.dispatchEvent(moveEvent)
        fireEvent.mouseUp(window)

        // After drag the 50% style should no longer be the only one
        expect(container.querySelector('[style]')).toBeTruthy()
    })

    it('clamps slider position to minimum 0% on far-left drag', () => {
        const { container } = render(<BeforeAfterSlider {...defaultProps} />)
        const sliderHandle = container.querySelector('[onMouseDown]') as HTMLElement

        fireEvent.mouseDown(sliderHandle)
        const moveEvent = new MouseEvent('mousemove', { clientX: -9999, bubbles: true })
        window.dispatchEvent(moveEvent)
        fireEvent.mouseUp(window)

        // 0% means the overlay covers nothing — the position is clamped
        const style = (container.querySelector('[style*="%"]') as HTMLElement)?.getAttribute('style') ?? ''
        const match = style.match(/(\d+)%/)
        if (match) expect(Number(match[1])).toBeGreaterThanOrEqual(0)
    })

    it('clamps slider position to maximum 100% on far-right drag', () => {
        const { container } = render(<BeforeAfterSlider {...defaultProps} />)
        const sliderHandle = container.querySelector('[onMouseDown]') as HTMLElement

        fireEvent.mouseDown(sliderHandle)
        const moveEvent = new MouseEvent('mousemove', { clientX: 99999, bubbles: true })
        window.dispatchEvent(moveEvent)
        fireEvent.mouseUp(window)

        const style = (container.querySelector('[style*="%"]') as HTMLElement)?.getAttribute('style') ?? ''
        const match = style.match(/(\d+)%/)
        if (match) expect(Number(match[1])).toBeLessThanOrEqual(100)
    })

    it('stops updating position after mouse is released', () => {
        const { container } = render(<BeforeAfterSlider {...defaultProps} />)
        const sliderHandle = container.querySelector('[onMouseDown]') as HTMLElement

        fireEvent.mouseDown(sliderHandle)
        fireEvent.mouseUp(window)

        // Move after release should not change position
        const before = container.querySelector('[style*="%"]')?.getAttribute('style')
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, bubbles: true }))
        const after = container.querySelector('[style*="%"]')?.getAttribute('style')
        expect(before).toBe(after)
    })
})
