import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageUploader from './ImageUploader';

// Mock next/image since it uses next server routing
vi.mock('next/image', () => ({
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />;
    },
}));

// Mock window.URL.createObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('ImageUploader Component', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with default props', () => {
        render(<ImageUploader onChange={mockOnChange} />);

        expect(screen.getByText('Upload Images')).toBeInTheDocument();
        expect(screen.getByText(/Drag & drop images here/i)).toBeInTheDocument();
        expect(screen.getByText(/0 \/ 10 images/i)).toBeInTheDocument();
    });

    it('displays existing uploaded images', () => {
        const existingUrls = ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'];
        render(<ImageUploader value={existingUrls} onChange={mockOnChange} maxFiles={5} />);

        // Alt text is dynamically generated as "Image 1", "Image 2"
        expect(screen.getByAltText('Image 1')).toBeInTheDocument();
        expect(screen.getByAltText('Image 2')).toBeInTheDocument();
        expect(screen.getByText(/2 \/ 5 images/i)).toBeInTheDocument();
    });

    it('prevents upload if maxFiles is exceeded', async () => {
        render(<ImageUploader onChange={mockOnChange} maxFiles={2} value={['url1', 'url2']} />);

        const input = screen.getByTestId('image-upload-input') as HTMLInputElement;
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        // Try to add one more
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/Max 2 images/i)).toBeInTheDocument();
        });

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('removes an image when the remove button is clicked', () => {
        const existingUrls = ['url1', 'url2'];
        render(<ImageUploader value={existingUrls} onChange={mockOnChange} />);

        const removeButtons = screen.getAllByRole('button', { name: /remove image/i });
        fireEvent.click(removeButtons[0]);

        expect(mockOnChange).toHaveBeenCalledWith(['url2']);
    });

    it('uploads images successfully and calls onChange with new URLs', async () => {
        const mockFetch: typeof fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                images: [{ optimizedUrl: 'http://example.com/optimized-image.jpg' }],
                summary: { count: 1, totalOriginalKB: 100, totalOptimizedKB: 50 },
            }),
        });

        // Override global fetch for this test
        global.fetch = mockFetch;

        render(<ImageUploader onChange={mockOnChange} />);

        const input = screen.getByTestId('image-upload-input') as HTMLInputElement;
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/upload?bucket=project-images',
                expect.objectContaining({
                    method: 'POST',
                }),
            );
        });

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith(['http://example.com/optimized-image.jpg']);
        });

        expect(
            screen.getByText(/1 image uploaded — 100KB → 50KB/i),
        ).toBeInTheDocument();
    });

    it('shows an error message when upload fails', async () => {
        const mockFetch: typeof fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Upload failed' }),
        });

        // Override global fetch for this test
        global.fetch = mockFetch;

        render(<ImageUploader onChange={mockOnChange} />);

        const input = screen.getByTestId('image-upload-input') as HTMLInputElement;
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Upload failed')).toBeInTheDocument();
        });

        expect(mockOnChange).not.toHaveBeenCalled();
    });
});
