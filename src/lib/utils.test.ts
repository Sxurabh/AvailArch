import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
    it('merges multiple class strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('filters out falsy values', () => {
        expect(cn('foo', false as any, null as any, undefined as any, 'baz')).toBe('foo baz')
    })

    it('supports object syntax — includes truthy keys only', () => {
        expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
    })

    it('supports conditional expression syntax', () => {
        const active = true
        expect(cn('base', active ? 'active' : 'inactive')).toBe('base active')
    })

    it('deduplicates conflicting Tailwind classes (last wins)', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4')
        expect(cn('text-sm', 'text-lg')).toBe('text-lg')
    })

    it('returns empty string when called with no arguments', () => {
        expect(cn()).toBe('')
    })

    it('handles array of classes', () => {
        expect(cn(['foo', 'bar'] as any)).toBe('foo bar')
    })
})
