import { describe, it, expect } from 'vitest'
import { serialiseMapState } from './serialiseMapState'
import { emptyMapState } from '../../domain/MapState'

function withPlaces(placeIds: string[]) {
  return { ...emptyMapState(), placeIds }
}

describe('serialiseMapState', () => {
  it('returns an empty string for an empty selection', () => {
    expect(serialiseMapState(emptyMapState())).toBe('')
  })

  it('encodes selected place ids as opaque ids under the places key', () => {
    expect(serialiseMapState(withPlaces(['ch:place:2660646']))).toBe(
      'places=ch:place:2660646',
    )
  })

  it('preserves selection order', () => {
    expect(
      serialiseMapState(withPlaces(['ch:place:2660646', 'ch:place:2659811'])),
    ).toBe('places=ch:place:2660646,ch:place:2659811')
  })

  it('deduplicates ids', () => {
    expect(
      serialiseMapState(withPlaces(['ch:place:2660646', 'ch:place:2660646'])),
    ).toBe('places=ch:place:2660646')
  })

  it('is deterministic for the same state', () => {
    const state = withPlaces(['ch:place:2657928', 'ch:place:2659530'])
    expect(serialiseMapState(state)).toBe(serialiseMapState(state))
  })
})
