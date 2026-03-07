import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'

import TrackRequestPage from './page'

vi.mock('hooks/useUser', () => ({
  useUser: vi.fn(() => ({
    user: { email: 'test@example.com', user_metadata: { name: 'Test User' } },
    loading: false,
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { useUser } from 'hooks/useUser'
import { redirect } from 'next/navigation'

const originalFetch = global.fetch
const originalAlert = global.alert
const originalCreateObjectURL = global.URL.createObjectURL

beforeEach(() => {
  global.fetch = vi.fn() as any
  global.alert = vi.fn() as any
  global.URL.createObjectURL = vi.fn(() => 'blob:preview-url') as any
})

afterEach(() => {
  global.fetch = originalFetch
  global.alert = originalAlert
  global.URL.createObjectURL = originalCreateObjectURL
  vi.useRealTimers()
  vi.clearAllMocks()
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function fillMinimalForm(container: HTMLElement) {
  fireEvent.change(screen.getByPlaceholderText(/91 XXXXX XXXXX/), { target: { value: '9999999999' } })
  fireEvent.change(screen.getByPlaceholderText(/Full address/), { target: { value: 'Test City' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g. 1200/), { target: { value: '1200' } })
}

function attachFile(container: HTMLElement, type = 'image/png', name = 'plan.png') {
  const fileInput = container.querySelector('input[type=file]') as HTMLInputElement
  const file = new File(['dummy'], name, { type })
  fireEvent.change(fileInput, { target: { files: [file] } })
  return file
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('TrackRequestPage — new request flow (existing)', () => {
  it('submits a new request successfully including uploaded plan images', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: [{ optimizedUrl: 'https://example.com/plan-1.webp' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    attachFile(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/upload?bucket=request-images', expect.objectContaining({ method: 'POST' })))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/requests', expect.objectContaining({ method: 'POST', body: expect.stringContaining('planImages') })))
    expect(screen.getByText(/Request submitted successfully/i)).toBeInTheDocument()
  })

  it('shows an alert and does not create request when upload fails', async () => {
    const fetchMock = global.fetch as unknown as Mock
    const alertMock = global.alert as unknown as Mock
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Upload failed' }) })

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    attachFile(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Upload failed'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows an alert when request creation fails after successful upload', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: [{ optimizedUrl: 'https://example.com/plan-1.webp' }] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Failed to create request' }) })

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    attachFile(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Failed to submit request'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('TrackRequestPage — NEW additional cases', () => {
  it('redirects to / when user is not authenticated', () => {
    ; (useUser as Mock).mockReturnValueOnce({ user: null, loading: false })
    render(<TrackRequestPage />)
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('renders loading skeleton when userLoading is true', () => {
    ; (useUser as Mock).mockReturnValueOnce({ user: null, loading: true })
    render(<TrackRequestPage />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByText(/Client Portal/i)).not.toBeInTheDocument()
  })

  it('switching to Commercial shows the commercial type dropdown', () => {
    render(<TrackRequestPage />)
    fireEvent.click(screen.getByText(/🏢 Commercial/i))
    expect(screen.getByText(/Commercial Type/i)).toBeInTheDocument()
  })

  it('switching to Commercial hides BHK selector', () => {
    render(<TrackRequestPage />)
    fireEvent.click(screen.getByText(/🏢 Commercial/i))
    expect(screen.queryByText(/^BHK$/i)).not.toBeInTheDocument()
  })

  it('BHK selector is visible for residential (default)', () => {
    render(<TrackRequestPage />)
    expect(screen.getByText(/^BHK$/i)).toBeInTheDocument()
  })

  it('area unit toggle changes the active button (sqft → sqmt)', () => {
    render(<TrackRequestPage />)
    const sqmtBtn = screen.getByRole('button', { name: /Sq\. Mt/i })
    fireEvent.click(sqmtBtn)
    // After click, sqmt button should have the active background style (rgb(var(--fg)))
    expect(sqmtBtn).toHaveStyle({ background: 'rgb(var(--fg))' })
  })

  it('shows alert for invalid MIME type and does not add file', () => {
    const { container } = render(<TrackRequestPage />)
    attachFile(container, 'text/plain', 'doc.txt')
    expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/not an allowed file type/i))
    expect(container.querySelector('.file-preview')).not.toBeInTheDocument()
  })

  it('shows alert for file exceeding 15 MB and does not add file', () => {
    const { container } = render(<TrackRequestPage />)
    const fileInput = container.querySelector('input[type=file]') as HTMLInputElement
    const bigFile = new File(['x'], 'huge.jpg', { type: 'image/jpeg' })
    Object.defineProperty(bigFile, 'size', { value: 16 * 1024 * 1024 })
    fireEvent.change(fileInput, { target: { files: [bigFile] } })
    expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/15MB limit/i))
  })

  it('submits with planImages: [] when no file is attached', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/requests',
        expect.objectContaining({ body: expect.stringContaining('"planImages":[]') })
      )
    )
  })

  it('submit button shows Uploading… text while submitting', async () => {
    let resolveFetch!: (v: any) => void
      ; (global.fetch as Mock).mockReturnValue(new Promise((r) => { resolveFetch = r }))

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    attachFile(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => expect(screen.getByText(/Uploading/i)).toBeInTheDocument())

    resolveFetch({ ok: true, json: async () => ({ images: [] }) })
  })

  it('auto-switches to history tab 2 seconds after successful submission', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      // History tab fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })

    const { container } = render(<TrackRequestPage />)
    fillMinimalForm(container)
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => expect(screen.getByText(/Request submitted successfully/i)).toBeInTheDocument())

    await waitFor(() => expect(screen.getByText(/Request History/i)).toHaveStyle({ color: 'rgb(var(--fg))' }), { timeout: 3500 })
  })

  it('shows loading indicator while fetching history', async () => {
    const fetchMock = global.fetch as unknown as Mock
    let resolveHistory!: (v: any) => void
    fetchMock.mockReturnValue(new Promise((r) => { resolveHistory = r }))

    render(<TrackRequestPage />)
    fireEvent.click(screen.getByRole('button', { name: /Request History/i }))

    expect(screen.getByText(/Loading records/i)).toBeInTheDocument()
    resolveHistory({ ok: true, json: async () => [] })
  })

  it('shows No past requests found when history is empty', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] })

    render(<TrackRequestPage />)
    fireEvent.click(screen.getByRole('button', { name: /Request History/i }))

    await waitFor(() => expect(screen.getByText(/No past requests found/i)).toBeInTheDocument())
  })

  it('renders request history cards with status and details', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'req-1',
          projectCategory: 'residential',
          bhk: '2',
          contactNo: '9999999999',
          projectLocation: 'Mumbai',
          areaValue: 1200,
          areaUnit: 'sqft',
          description: 'Light-filled home',
          status: 'In Progress',
          date: '01/01/2025',
          adminNotes: '',
          planImages: [],
        },
      ],
    })

    render(<TrackRequestPage />)
    fireEvent.click(screen.getByRole('button', { name: /Request History/i }))

    await waitFor(() => expect(screen.getByText('In Progress')).toBeInTheDocument())
    expect(screen.getByText('9999999999')).toBeInTheDocument()
    expect(screen.getByText('Mumbai')).toBeInTheDocument()
  })

  it('shows admin notes block when adminNotes is non-empty', async () => {
    const fetchMock = global.fetch as unknown as Mock
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'req-2', projectCategory: 'residential', status: 'Pending',
          date: '01/01/2025', adminNotes: 'Will call you Thursday.', planImages: [],
        },
      ],
    })

    render(<TrackRequestPage />)
    fireEvent.click(screen.getByRole('button', { name: /Request History/i }))

    await waitFor(() => expect(screen.getByText(/Will call you Thursday/i)).toBeInTheDocument())
    expect(screen.getByText(/ADMIN NOTE/i)).toBeInTheDocument()
  })

  it('removes a file from the preview list when remove is clicked', () => {
    const { container } = render(<TrackRequestPage />)
    attachFile(container)
    const removeBtn = screen.getByTitle(/Remove/i)
    fireEvent.click(removeBtn)
    expect(screen.queryByText('plan.png')).not.toBeInTheDocument()
  })

  it('does not show a thumbnail preview for PDF files', () => {
    const { container } = render(<TrackRequestPage />)
    attachFile(container, 'application/pdf', 'blueprint.pdf')
    expect(screen.queryByRole('img', { name: /blueprint/i })).not.toBeInTheDocument()
    expect(screen.getByText('blueprint.pdf')).toBeInTheDocument()
  })
})
