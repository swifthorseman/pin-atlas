import { describe, it, expect } from 'vitest'
import { deriveCountries } from './deriveCountries'
import type { Place } from '../../domain/Place'

function place(id: string, countryCode: string): Place {
  return { id, countryCode, lat: 0, lng: 0, displayName: {}, searchAliases: [] }
}

describe('deriveCountries', () => {
  it('returns nothing for no selected places', () => {
    expect(deriveCountries([])).toEqual([])
  })

  it('maps a selected place to its country code', () => {
    expect(deriveCountries([place('ch:place:1', 'CH')])).toEqual(['CH'])
  })

  it('does not duplicate a country with multiple selected places in it', () => {
    expect(
      deriveCountries([place('ch:place:1', 'CH'), place('ch:place:2', 'CH')]),
    ).toEqual(['CH'])
  })

  it('represents each distinct country once', () => {
    expect(
      deriveCountries([
        place('ch:place:1', 'CH'),
        place('fr:place:1', 'FR'),
        place('ch:place:2', 'CH'),
      ]),
    ).toEqual(['CH', 'FR'])
  })
})
