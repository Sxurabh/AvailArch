import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, PATCH, PUT } from './route'

const mockFrom = vi.fn()

const mockProjectUpdateEq = vi.fn()
const mockProjectDeleteEq = vi.fn()
const mockRelationDeleteEq = vi.fn()
const mockRelationInsert = vi.fn()
const mockSectionSingle = vi.fn()
const mockSectionSelect = vi.fn()
const mockSectionInsert = vi.fn()
const mockPatchEq = vi.fn()
let lastProjectUpdatePayload: Record<string, unknown> | undefined

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ from: mockFrom })),
}))

beforeEach(() => {
  vi.clearAllMocks()

  mockProjectUpdateEq.mockResolvedValue({ error: null })
  mockProjectDeleteEq.mockResolvedValue({ error: null })
  mockRelationDeleteEq.mockResolvedValue({ error: null })
  mockRelationInsert.mockResolvedValue({ error: null })

  mockSectionSingle.mockResolvedValue({ data: { id: 'sec-1' }, error: null })
  mockSectionSelect.mockReturnValue({ single: mockSectionSingle })
  mockSectionInsert.mockReturnValue({ select: mockSectionSelect })

  lastProjectUpdatePayload = undefined
  mockPatchEq.mockResolvedValue({ error: null, count: 1 })

  mockFrom.mockImplementation((table: string) => {
    if (table === 'projects') {
      return {
        update: (payload: Record<string, unknown>) => {
          if ('title' in payload || 'image' in payload || 'status' in payload) {
            lastProjectUpdatePayload = payload
            return { eq: mockProjectUpdateEq }
          }
          return { eq: mockPatchEq }
        },
        delete: () => ({ eq: mockProjectDeleteEq }),
      }
    }

    if (table === 'project_sections') {
      return {
        delete: () => ({ eq: mockRelationDeleteEq }),
        insert: mockSectionInsert,
      }
    }

    if (table === 'project_hero_images' || table === 'project_spaces' || table === 'project_gallery') {
      return {
        delete: () => ({ eq: mockRelationDeleteEq }),
        insert: mockRelationInsert,
      }
    }

    if (table === 'project_section_images') {
      return { insert: mockRelationInsert }
    }

    return { update: () => ({ eq: mockPatchEq }) }
  })
})

describe('PUT /api/projects/[id]', () => {
  function makeReq(body: object) {
    return { json: async () => body } as Request
  }

  it('uses defaults for missing grid spans and status', async () => {
    const res = await PUT(
      makeReq({
        title: 'Updated Project',
        image: '/image.jpg',
        heroImages: [],
        spaces: [],
        gallery: [],
        sections: [],
      }),
      { params: Promise.resolve({ id: 'proj-1' }) }
    )

    expect(res.status).toBe(200)
    expect(mockProjectUpdateEq).toHaveBeenCalledWith('id', 'proj-1')

    expect(lastProjectUpdatePayload).toEqual(
      expect.objectContaining({
        grid_col_span: 1,
        grid_row_span: 1,
        status: 'active',
      })
    )
  })

  it('returns 500 when project update fails', async () => {
    mockProjectUpdateEq.mockResolvedValueOnce({ error: { message: 'update failed' } })

    const res = await PUT(makeReq({ title: 'Broken' }), { params: Promise.resolve({ id: 'proj-1' }) })

    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/update failed/i)
  })
})

describe('PATCH /api/projects/[id]', () => {
  function makeReq(body: object) {
    return { json: async () => body } as Request
  }

  it('falls back to legacy_id when id update affects zero rows', async () => {
    mockPatchEq
      .mockResolvedValueOnce({ error: null, count: 0 })
      .mockResolvedValueOnce({ error: null, count: 1 })

    const res = await PATCH(makeReq({ gridColSpan: 6 }), { params: Promise.resolve({ id: 'legacy-7' }) })

    expect(res.status).toBe(200)
    expect(mockPatchEq).toHaveBeenNthCalledWith(1, 'id', 'legacy-7')
    expect(mockPatchEq).toHaveBeenNthCalledWith(2, 'legacy_id', 'legacy-7')
  })
})

describe('DELETE /api/projects/[id]', () => {
  it('returns 500 when delete fails', async () => {
    mockProjectDeleteEq.mockResolvedValueOnce({ error: { message: 'cannot delete' } })

    const res = await DELETE({} as Request, { params: Promise.resolve({ id: 'proj-1' }) })

    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/cannot delete/i)
  })
})
