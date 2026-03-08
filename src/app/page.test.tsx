import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from './page'

vi.mock('./components/ProjectGrid', () => ({
    default: () => <div data-testid="project-grid">Project Grid Mock</div>,
}))

describe('Home Page', () => {
    it('renders without crashing', () => {
        const { container } = render(<Home />)
        expect(container).toBeTruthy()
    })

    it('contains ProjectGrid component', () => {
        render(<Home />)
        expect(screen.getByTestId('project-grid')).toBeInTheDocument()
    })

    it('has correct wrapper div with padding', () => {
        const { container } = render(<Home />)
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).toHaveClass('pb-24')
    })

    it('renders section element', () => {
        const { container } = render(<Home />)
        const section = container.querySelector('section')
        expect(section).toBeTruthy()
    })
})
