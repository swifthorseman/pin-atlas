import { describe, it, expect } from 'vitest'
import { placeLabel } from './placeLabel'
import type { Place } from '../../domain/Place'

const murren: Place = {
  id: 'ch:place:2659530',
  countryCode: 'CH',
  lat: 46.5594,
  lng: 7.8919,
  displayName: { de: 'Mürren', en: 'Mürren' },
  searchAliases: ['Mürren', 'Murren', 'Muerren'],
  admin1: 'BE',
}

describe('placeLabel', () => {
  it('combines the place name and its context', () => {
    expect(placeLabel(murren)).toBe('Mürren — Bern, Switzerland')
  })

  it('omits the separator context only when context is the country alone', () => {
    const noRegion: Place = { ...murren, admin1: undefined }
    expect(placeLabel(noRegion)).toBe('Mürren — Switzerland')
  })
})
