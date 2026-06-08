import { describe, it, expect } from 'vitest'
import { placeName } from './Place'
import type { Place } from './Place'

const base: Place = {
  id: 'ch:place:2657928',
  countryCode: 'CH',
  lat: 46.01999,
  lng: 7.74863,
  displayName: {},
  searchAliases: [],
}

describe('placeName', () => {
  it('prefers the English display name', () => {
    const place = { ...base, displayName: { de: 'Genf', en: 'Geneva', fr: 'Genève' } }
    expect(placeName(place)).toBe('Geneva')
  })

  it('falls back to the first available name when English is absent', () => {
    const place = { ...base, displayName: { de: 'Zürich', it: 'Zurigo' } }
    expect(placeName(place)).toBe('Zürich')
  })
})
