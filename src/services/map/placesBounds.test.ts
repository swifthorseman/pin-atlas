import { describe, it, expect } from 'vitest'
import { placesBounds } from './placesBounds'
import type { Place } from '../../domain/Place'

function place(lng: number, lat: number): Place {
  return {
    id: `ch:place:${lng}-${lat}`,
    countryCode: 'CH',
    lat,
    lng,
    displayName: {},
    searchAliases: [],
  }
}

describe('placesBounds', () => {
  it('returns null for no places', () => {
    expect(placesBounds([])).toBeNull()
  })

  it('returns a point box for a single place', () => {
    expect(placesBounds([place(7.74, 46.02)])).toEqual([
      [7.74, 46.02],
      [7.74, 46.02],
    ])
  })

  it('spans the south-west and north-east extremes of several places', () => {
    const places = [place(7.44, 46.95), place(6.14, 46.2), place(8.55, 47.37)]
    expect(placesBounds(places)).toEqual([
      [6.14, 46.2],
      [8.55, 47.37],
    ])
  })

  it('is independent of the input order', () => {
    const a = [place(7.44, 46.95), place(6.14, 46.2)]
    const b = [place(6.14, 46.2), place(7.44, 46.95)]
    expect(placesBounds(a)).toEqual(placesBounds(b))
  })
})
