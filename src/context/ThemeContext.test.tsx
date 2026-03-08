import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}))

const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
}
vi.stubGlobal('localStorage', mockLocalStorage)

vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
})))

const TestComponent = () => {
    const { theme, toggleTheme } = useTheme()
    return (
        <div>
            <span data-testid="theme-value">{theme}</span>
            <button onClick={toggleTheme} data-testid="toggle-btn">Toggle</button>
        </div>
    )
}

describe('ThemeContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLocalStorage.getItem.mockReturnValue(null)
        mockLocalStorage.setItem.mockReturnValue(undefined)
        mockLocalStorage.clear.mockReturnValue(undefined)
        document.documentElement.removeAttribute('data-theme')
    })

    it('provides default light theme', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        expect(screen.getByTestId('theme-value').textContent).toBe('light')
    })

    it('toggles theme from light to dark', async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        
        const toggleBtn = screen.getByTestId('toggle-btn')
        fireEvent.click(toggleBtn)
        
        await waitFor(() => {
            expect(screen.getByTestId('theme-value').textContent).toBe('dark')
        })
    })

    it('toggles theme back from dark to light', async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        
        const toggleBtn = screen.getByTestId('toggle-btn')
        fireEvent.click(toggleBtn)
        fireEvent.click(toggleBtn)
        
        await waitFor(() => {
            expect(screen.getByTestId('theme-value').textContent).toBe('light')
        })
    })

    it('persists theme to localStorage', async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        
        fireEvent.click(screen.getByTestId('toggle-btn'))
        
        await waitFor(() => {
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('avail-theme', 'dark')
        })
    })

    it('sets data-theme attribute on document', async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        
        fireEvent.click(screen.getByTestId('toggle-btn'))
        
        await waitFor(() => {
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        })
    })

    it('loads theme from localStorage on mount', async () => {
        mockLocalStorage.getItem.mockReturnValue('dark')
        
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )
        
        await waitFor(() => {
            expect(screen.getByTestId('theme-value').textContent).toBe('dark')
        })
    })
})
