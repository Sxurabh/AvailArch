import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectForm from './ProjectForm';

// Mock ImageUploader so we can control its behaviour without hitting network
vi.mock('@/components/ui/ImageUploader', () => ({
    __esModule: true,
    default: ({ label, onChange }: { label?: string; onChange: (urls: string[]) => void }) => (
        <button type="button" onClick={() => onChange(['http://example.com/image.jpg'])}>
            {label ?? 'Mock Image Uploader'}
        </button>
    ),
}));

describe('ProjectForm', () => {
    it('renders core fields and tabs', () => {
        const handleSubmit = vi.fn();

        render(<ProjectForm onSubmit={handleSubmit} />);

        expect(screen.getByText(/Project Title/i)).toBeInTheDocument();
        expect(screen.getByText(/Year/i)).toBeInTheDocument();
        expect(screen.getByText(/Category/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /hero/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /spaces/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /gallery/i })).toBeInTheDocument();
    });

    it('shows scheduling field when status is set to draft', () => {
        const handleSubmit = vi.fn();

        render(<ProjectForm onSubmit={handleSubmit} />);

        const statusSelect = screen.getByLabelText(/Project Status/i) as HTMLSelectElement;
        fireEvent.change(statusSelect, { target: { value: 'draft' } });

        expect(
            screen.getByText(/Schedule Publish Date \(Optional\)/i),
        ).toBeInTheDocument();
    });

    it('submits form data with uploaded main image', async () => {
        const handleSubmit = vi.fn();

        render(<ProjectForm onSubmit={handleSubmit} />);

        fireEvent.change(screen.getByLabelText(/Project Title/i), {
            target: { value: 'Test Project' },
        });

        const imageUploadButton = screen.getByRole('button', {
            name: /Main Project Image/i,
        });
        fireEvent.click(imageUploadButton);

        fireEvent.click(screen.getByRole('button', { name: /Save Project Changes/i }));

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalled();
        });

        const submitted = handleSubmit.mock.calls[0][0];
        expect(submitted.title).toBe('Test Project');
        expect(submitted.image).toBe('http://example.com/image.jpg');
    });
});

