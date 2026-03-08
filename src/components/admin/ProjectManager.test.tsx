import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectManager from './ProjectManager'

vi.mock('@/lib/driveUtils', () => ({
    getDriveImage: vi.fn((image: string) => image ? `https://drive.google.com/uc?export=view&id=${image}` : null),
}))

vi.mock('@/components/ui/Toast', () => ({
    default: ({ message, isVisible }: { message: string; isVisible: boolean }) => 
        isVisible ? <div data-testid="toast">{message}</div> : null,
}))

global.fetch = vi.fn()

describe('ProjectManager', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', async () => {
        ;(fetch as any).mockResolvedValue({
            ok: true,
            json: async () => [],
        })
        
        const { container } = render(<ProjectManager />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
