import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResponseManager from './ResponseManager'

global.fetch = vi.fn()

describe('ResponseManager', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without crashing', async () => {
        ;(fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ headers: [], data: [] }),
        })
        
        const { container } = render(<ResponseManager />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
