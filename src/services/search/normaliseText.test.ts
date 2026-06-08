import { describe, it, expect } from 'vitest'
import { normaliseText } from './normaliseText'

describe('normaliseText', () => {
  it('lowercases', () => {
    expect(normaliseText('Bern')).toBe('bern')
  })

  it('strips diacritics', () => {
    expect(normaliseText('Mürren')).toBe('murren')
    expect(normaliseText('Genève')).toBe('geneve')
  })

  it('collapses and trims whitespace', () => {
    expect(normaliseText('  St.   Moritz  ')).toBe('st. moritz')
  })

  it('treats accented and unaccented input as equal', () => {
    expect(normaliseText('Mürren')).toBe(normaliseText('Murren'))
  })
})
