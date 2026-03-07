import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageUploader from './ImageUploader'

vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}))

window.URL.createObjectURL = vi.fn(() => 'mock-url')
window.URL.revokeObjectURL = vi.fn()

const mockOnChange = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
})

describe('ImageUploader Component', () => {
    // ── Existing tests ─────────────────────────────────────────────────────────
    it('renders correctly with default props', () => {
        render(<ImageUploader onChange={mockOnChange} />)
        expect(screen.getByText(/Upload Images/i)).toBeInTheDocument()
        expect(screen.getByText(/Drag.*drop.*images.*here/i)).toBeInTheDocument()
        expect(screen.getByText(/0.*10.*images/i)).toBeInTheDocument()
    })

    it('displays existing uploaded images', () => {
        const existingUrls = ['http://example.com/image1.jpg', 'http://example.com/image2.jpg']
        render(<ImageUploader value={existingUrls} onChange={mockOnChange} maxFiles={5} />)
        expect(screen.getByAltText('Image 1')).toBeInTheDocument()
        expect(screen.getByAltText('Image 2')).toBeInTheDocument()
        expect(screen.getByText(/2.*5.*images/i)).toBeInTheDocument()
    })

    it('prevents upload if maxFiles is exceeded', async () => {
        render(<ImageUploader onChange={mockOnChange} maxFiles={2} value={['url1', 'url2']} />)
        const input = screen.getByTestId('image-upload-input') as HTMLInputElement
        const file = new File(['dummy'], 'test.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })
        await waitFor(() => expect(screen.getByText(/Max 2 images/i)).toBeInTheDocument())
        expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('removes an image when the remove button is clicked', () => {
        render(<ImageUploader value={['url1', 'url2']} onChange={mockOnChange} />)
        const removeButtons = screen.getAllByRole('button', { name: /remove image/i })
        fireEvent.click(removeButtons[0])
        expect(mockOnChange).toHaveBeenCalledWith(['url2'])
    })

    it('uploads images successfully and calls onChange with new URLs', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                images: [{ optimizedUrl: 'http://example.com/optimized-image.jpg' }],
                summary: { count: 1, totalOriginalKB: 100, totalOptimizedKB: 50 },
            }),
        })
        global.fetch = mockFetch

        render(<ImageUploader onChange={mockOnChange} />)
        const input = screen.getByTestId('image-upload-input') as HTMLInputElement
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
            'api/upload?bucket=project-images',
            expect.objectContaining({ method: 'POST' })
        ))
        await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(['http://example.com/optimized-image.jpg']))
        expect(screen.getByText(/1 image uploaded/i)).toBeInTheDocument()
    })

    it('shows an error message when upload fails', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Upload failed' }),
        })
        global.fetch = mockFetch

        render(<ImageUploader onChange={mockOnChange} />)
        const input = screen.getByTestId('image-upload-input') as HTMLInputElement
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument())
        expect(mockOnChange).not.toHaveBeenCalled()
    })

    // ── NEW test cases ─────────────────────────────────────────────────────────
    it('renders custom label prop', () => {
        render(<ImageUploader onChange={mockOnChange} label="Plan Documents" />)
        expect(screen.getByText('Plan Documents')).toBeInTheDocument()
    })

    it('uses custom bucket in the fetch URL', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                images: [{ optimizedUrl: 'http://example.com/plan.webp' }],
                summary: { count: 1, totalOriginalKB: 50, totalOptimizedKB: 30 },
            }),
        })
        global.fetch = mockFetch

        render(<ImageUploader onChange={mockOnChange} bucket="request-images" />)
        const input = screen.getByTestId('image-upload-input') as HTMLInputElement
        fireEvent.change(input, { target: { files: [new File(['x'], 'plan.jpg', { type: 'image/jpeg' })] } })

        await waitFor(() =>
            expect(mockFetch).toHaveBeenCalledWith(
                'api/upload?bucket=request-images',
                expect.objectContaining({ method: 'POST' })
            )
        )
    })

    it('shows uploading state while upload is in progress', async () => {
        let resolveFetch!: (v: any) => void
        const mockFetch = vi.fn().mockReturnValue(new Promise((r) => { resolveFetch = r }))
        global.fetch = mockFetch

        render(<ImageUploader onChange={mockOnChange} />)
        const input = screen.getByTestId('image-upload-input') as HTMLInputElement
        fireEvent.change(input, { target: { files: [new File(['x'], 'img.jpg', { type: 'image/jpeg' })] } })

        await waitFor(() => expect(screen.getByText(/Optimizing/i)).toBeInTheDocument())

        resolveFetch({
            ok: true,
            json: async () => ({ images: [], summary: { count: 0, totalOriginalKB: 0, totalOptimizedKB: 0 } }),
        })
    })

    it('activates drag-over style when a file is dragged over the dropzone', () => {
        render(<ImageUploader onChange={mockOnChange} />)
        const dropzone = screen.getByText(/Drag.*drop.*images.*here/i).closest('div')!
        fireEvent.dragOver(dropzone)
        expect(screen.getByText(/Drop files here/i)).toBeInTheDocument()
    })

    it('resets drag-over style on drag-leave', () => {
        render(<ImageUploader onChange={mockOnChange} />)
        const dropzone = screen.getByText(/Drag.*drop.*images.*here/i).closest('div')!
        fireEvent.dragOver(dropzone)
        fireEvent.dragLeave(dropzone)
        expect(screen.queryByText(/Drop files here/i)).not.toBeInTheDocument()
    })

    it('uploads file when dropped on the dropzone', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                images: [{ optimizedUrl: 'http://example.com/dropped.webp' }],
                summary: { count: 1, totalOriginalKB: 80, totalOptimizedKB: 40 },
            }),
        })
        global.fetch = mockFetch

        render(<ImageUploader onChange={mockOnChange} />)
        const dropzone = screen.getByText(/Drag.*drop.*images.*here/i).closest('div')!
        const file = new File(['x'], 'dropped.jpg', { type: 'image/jpeg' })

        fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })
        await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(['http://example.com/dropped.webp']))
    })
})
