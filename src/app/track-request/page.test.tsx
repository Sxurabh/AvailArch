import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TrackRequestPage from './page';

// Mock auth hook so component doesn't redirect during tests
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { email: 'test@example.com', user_metadata: { name: 'Test User' } },
    loading: false,
  }),
}));

// Mock next/navigation redirect (should not be called in these tests)
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('TrackRequestPage - new request flow', () => {
  const originalFetch = global.fetch;
  const originalAlert = global.alert;
  const originalCreateObjectURL = global.URL.createObjectURL;

  beforeEach(() => {
    global.fetch = vi.fn() as any;
    global.alert = vi.fn() as any;
    global.URL.createObjectURL = vi.fn(() => 'blob:preview-url') as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.alert = originalAlert;
    global.URL.createObjectURL = originalCreateObjectURL;
    vi.clearAllMocks();
  });

  it('submits a new request successfully including uploaded plan images', async () => {
    const fetchMock = global.fetch as unknown as vi.Mock;

    // 1st call: /api/upload
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ optimizedUrl: 'https://example.com/plan-1.webp' }],
        }),
      })
      // 2nd call: /api/requests
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { container } = render(<TrackRequestPage />);

    // Fill form fields (residential defaults are fine)
    const contactInput = screen.getByPlaceholderText('+91 XXXXX XXXXX');
    const locationInput = screen.getByPlaceholderText('Full address');
    const areaInput = screen.getByPlaceholderText('e.g. 1200');
    const descriptionInput = screen.getByPlaceholderText(
      /Tell us about your space/i,
    );

    fireEvent.change(contactInput, { target: { value: '9999999999' } });
    fireEvent.change(locationInput, { target: { value: 'Test City' } });
    fireEvent.change(areaInput, { target: { value: '1200' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'This is a test project description.' },
    });

    // Select a file via hidden input
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(['dummy'], 'plan.png', { type: 'image/png' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    // Submit
    fireEvent.click(
      screen.getByRole('button', { name: /Submit Request/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/upload?bucket=request-images',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/requests',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(
            '"planImages":["https://example.com/plan-1.webp"]',
          ),
        }),
      );
    });

    // Success banner should appear
    expect(
      screen.getByText(/Request submitted successfully/i),
    ).toBeInTheDocument();
  });

  it('shows an alert and does not create request when upload fails', async () => {
    const fetchMock = global.fetch as unknown as vi.Mock;
    const alertMock = global.alert as unknown as vi.Mock;

    // Upload fails
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    });

    const { container } = render(<TrackRequestPage />);

    // Minimal required fields
    fireEvent.change(screen.getByPlaceholderText('+91 XXXXX XXXXX'), {
      target: { value: '9999999999' },
    });
    fireEvent.change(screen.getByPlaceholderText('Full address'), {
      target: { value: 'Test City' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. 1200'), {
      target: { value: '1200' },
    });

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(['dummy'], 'plan.png', { type: 'image/png' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Submit Request/i }),
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Upload failed');
    });

    // Only one fetch call (upload), no POST /api/requests
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows an alert when request creation fails after successful upload', async () => {
    const fetchMock = global.fetch as unknown as vi.Mock;
    const alertMock = global.alert as unknown as vi.Mock;

    // 1st: upload ok, 2nd: request fails
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: [{ optimizedUrl: 'https://example.com/plan-1.webp' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create request' }),
      });

    const { container } = render(<TrackRequestPage />);

    fireEvent.change(screen.getByPlaceholderText('+91 XXXXX XXXXX'), {
      target: { value: '9999999999' },
    });
    fireEvent.change(screen.getByPlaceholderText('Full address'), {
      target: { value: 'Test City' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. 1200'), {
      target: { value: '1200' },
    });

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(['dummy'], 'plan.png', { type: 'image/png' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Submit Request/i }),
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to submit request');
    });

    // Two fetch calls: upload + failed request
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

