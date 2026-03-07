import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectForm from './ProjectForm'

vi.mock('components/ui/ImageUploader', () => ({
    default: ({ label, onChange }: { label?: string; onChange: (urls: string[]) => void }) => (
        <button type="button" onClick={() => onChange(['http://example.com/image.jpg'])}>
            {label ?? 'Mock Image Uploader'}
        </button>
    ),
}))

const handleSubmit = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
})

describe('ProjectForm', () => {
    // ── Existing tests ─────────────────────────────────────────────────────────
    it('renders core fields and tabs', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        expect(screen.getByText(/Project Title/i)).toBeInTheDocument()
        expect(screen.getByText(/Year/i)).toBeInTheDocument()
        expect(screen.getByText(/Category/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /hero/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /spaces/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /gallery/i })).toBeInTheDocument()
    })

    it('shows scheduledFor field when status is set to draft', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        const statusSelect = screen.getByLabelText(/Project Status/i) as HTMLSelectElement
        fireEvent.change(statusSelect, { target: { value: 'draft' } })
        expect(screen.getByText(/Schedule Publish Date/i)).toBeInTheDocument()
    })

    it('submits form data with uploaded main image', async () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Test Project' } })
        const imageUploadButton = screen.getByRole('button', { name: /Main Project Image/i })
        fireEvent.click(imageUploadButton)
        fireEvent.click(screen.getByRole('button', { name: /Save Project Changes/i }))
        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        const submitted = handleSubmit.mock.calls[0][0]
        expect(submitted.title).toBe('Test Project')
        expect(submitted.image).toBe('http://example.com/image.jpg')
    })

    // ── NEW test cases ─────────────────────────────────────────────────────────
    it('does NOT show scheduledFor field for active or archived status', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        const statusSelect = screen.getByLabelText(/Project Status/i) as HTMLSelectElement
        fireEvent.change(statusSelect, { target: { value: 'active' } })
        expect(screen.queryByText(/Schedule Publish Date/i)).not.toBeInTheDocument()
        fireEvent.change(statusSelect, { target: { value: 'archived' } })
        expect(screen.queryByText(/Schedule Publish Date/i)).not.toBeInTheDocument()
    })

    it('switches to hero tab and shows Add Placeholder button', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.click(screen.getByRole('button', { name: /hero/i }))
        expect(screen.getByText(/Hero Sections/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Add Placeholder/i })).toBeInTheDocument()
    })

    it('adds a new hero section when Add Placeholder is clicked', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.click(screen.getByRole('button', { name: /hero/i }))
        const addBtn = screen.getByRole('button', { name: /Add Placeholder/i })
        fireEvent.click(addBtn)
        expect(screen.getAllByText(/New Section/i)).toHaveLength(1)
        fireEvent.click(addBtn)
        expect(screen.getAllByText(/New Section/i)).toHaveLength(2)
    })

    it('removes a hero section when the trash icon is clicked', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.click(screen.getByRole('button', { name: /hero/i }))
        fireEvent.click(screen.getByRole('button', { name: /Add Placeholder/i }))
        expect(screen.getAllByText(/New Section/i)).toHaveLength(1)
        const deleteBtn = screen.getByRole('button', { name: /remove section/i })
        fireEvent.click(deleteBtn)
        expect(screen.queryByText(/New Section/i)).not.toBeInTheDocument()
    })

    it('switches to spaces tab and shows Add Space button', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.click(screen.getByRole('button', { name: /spaces/i }))
        expect(screen.getByRole('button', { name: /Add Space/i })).toBeInTheDocument()
    })

    it('switches to gallery tab and shows Add Image button', () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.click(screen.getByRole('button', { name: /gallery/i }))
        expect(screen.getByRole('button', { name: /Add Image/i })).toBeInTheDocument()
    })

    it('pre-populates all fields when initialData is provided (edit mode)', () => {
        render(
            <ProjectForm
                onSubmit={handleSubmit}
                initialData={{
                    id: 'proj-1',
                    title: 'Existing Project',
                    year: '2023',
                    category: 'Residential',
                    image: '/img.jpg',
                    gridColSpan: 6,
                    gridRowSpan: 2,
                    description: 'Existing description',
                    status: 'active',
                    sections: [],
                    spaces: [],
                    gallery: [],
                } as any}
            />
        )
        expect((screen.getByLabelText(/Project Title/i) as HTMLInputElement).value).toBe('Existing Project')
        expect((screen.getByLabelText(/Year/i) as HTMLInputElement).value).toBe('2023')
    })

    it('disables the save button when isLoading is true', () => {
        render(<ProjectForm onSubmit={handleSubmit} isLoading />)
        expect(screen.getByRole('button', { name: /Save Project Changes/i })).toBeDisabled()
    })

    it('submits description textarea value correctly', async () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Desc Test' } })
        fireEvent.change(screen.getByLabelText(/Description/i), {
            target: { value: 'A beautifully designed space.' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Save Project Changes/i }))
        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        expect(handleSubmit.mock.calls[0][0].description).toBe('A beautifully designed space.')
    })

    it('accepts numeric gridColSpan and gridRowSpan inputs', async () => {
        render(<ProjectForm onSubmit={handleSubmit} />)
        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'Grid Test' } })
        fireEvent.change(screen.getByLabelText(/Grid Col Span/i), { target: { value: '8' } })
        fireEvent.change(screen.getByLabelText(/Grid Row Span/i), { target: { value: '3' } })
        fireEvent.click(screen.getByRole('button', { name: /Save Project Changes/i }))
        await waitFor(() => expect(handleSubmit).toHaveBeenCalled())
        const submitted = handleSubmit.mock.calls[0][0]
        expect(Number(submitted.gridColSpan)).toBe(8)
        expect(Number(submitted.gridRowSpan)).toBe(3)
    })
})
