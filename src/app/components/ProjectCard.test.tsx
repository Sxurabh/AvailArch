import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProjectCard from './ProjectCard'
import { Project } from '@/lib/data'

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => {
            const { layout, initial, animate, exit, transition, className, style, ...rest } = props;
            return <div className={className} style={style} {...rest}>{children}</div>;
        },
    },
}))

vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock('@/lib/driveUtils', () => ({
    getDriveImage: vi.fn((image: string) => image ? `https://drive.google.com/uc?export=view&id=${image}` : null),
}))

const mockProject: Project = {
    id: 'test-project-1',
    title: 'Test Project',
    year: '2024',
    category: 'residential',
    image: 'test-image-id',
    gridColSpan: 4,
    gridRowSpan: 1,
}

describe('ProjectCard', () => {
    it('renders without crashing', () => {
        const { container } = render(<ProjectCard project={mockProject} />)
        expect(container.firstChild).toBeInTheDocument()
    })
})
