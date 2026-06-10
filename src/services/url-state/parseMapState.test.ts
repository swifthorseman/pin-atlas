import { describe, it, expect } from 'vitest'
import { parseMapState } from './parseMapState'
import { serialiseMapState } from './serialiseMapState'
import { emptyMapState } from '../../domain/MapState'

const known = new Set(['ch:place:2657928', 'ch:place:2660646', 'ch:place:2659811'])
const isKnownId = (id: string) => known.has(id)

describe('parseMapState', () => {
  it('returns empty state for an empty search string', () => {
    expect(parseMapState('', isKnownId)).toEqual(emptyMapState())
  })

  it('returns empty state when there is no places param', () => {
    expect(parseMapState('?other=x', isKnownId)).toEqual(emptyMapState())
  })

  it('returns empty state for an empty places value', () => {
    expect(parseMapState('?places=', isKnownId)).toEqual(emptyMapState())
  })

  it('restores the encoded known place ids', () => {
    expect(parseMapState('?places=ch:place:2657928,ch:place:2660646', isKnownId).placeIds).toEqual([
      'ch:place:2657928',
      'ch:place:2660646',
    ])
  })

  it('parses with or without a leading question mark', () => {
    expect(parseMapState('places=ch:place:2657928', isKnownId).placeIds).toEqual([
      'ch:place:2657928',
    ])
  })

  it('ignores unknown ids', () => {
    expect(parseMapState('?places=ch:place:2657928,ch:place:999999', isKnownId).placeIds).toEqual([
      'ch:place:2657928',
    ])
  })

  it('deduplicates ids', () => {
    expect(parseMapState('?places=ch:place:2657928,ch:place:2657928', isKnownId).placeIds).toEqual([
      'ch:place:2657928',
    ])
  })

  it('preserves the encoded order', () => {
    expect(parseMapState('?places=ch:place:2660646,ch:place:2657928', isKnownId).placeIds).toEqual([
      'ch:place:2660646',
      'ch:place:2657928',
    ])
  })

  it('round-trips with serialiseMapState', () => {
    const state = { ...emptyMapState(), placeIds: ['ch:place:2657928', 'ch:place:2659811'] }
    expect(parseMapState(serialiseMapState(state), isKnownId)).toEqual(state)
  })
})
