import { describe, it, expect } from 'vitest'
import { placeContext } from './placeContext'
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

const zermatt: Place = {
  id: 'ch:place:2657928',
  countryCode: 'CH',
  lat: 46.01999,
  lng: 7.74863,
  displayName: { de: 'Zermatt', en: 'Zermatt' },
  searchAliases: ['Zermatt'],
  admin1: 'VS',
}

describe('placeContext', () => {
  it('combines canton name and country', () => {
    expect(placeContext(murren)).toBe('Bern, Switzerland')
    expect(placeContext(zermatt)).toBe('Valais, Switzerland')
  })

  it('falls back to country alone when the region is unknown', () => {
    const noRegion: Place = { ...murren, admin1: undefined }
    expect(placeContext(noRegion)).toBe('Switzerland')
  })
})
