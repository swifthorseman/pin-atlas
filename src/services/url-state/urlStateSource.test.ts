import { describe, it, expect, beforeEach } from 'vitest'
import { writeMapState } from './urlStateSource'
import { emptyMapState } from '../../domain/MapState'

function withPlaces(placeIds: string[]) {
  return { ...emptyMapState(), placeIds }
}

describe('writeMapState', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('writes the selected place ids to the URL', () => {
    writeMapState(withPlaces(['ch:place:2657928']))
    expect(window.location.search).toBe('?places=ch:place:2657928')
  })

  it('updates the URL when a place is added', () => {
    writeMapState(withPlaces(['ch:place:2657928']))
    writeMapState(withPlaces(['ch:place:2657928', 'ch:place:2660646']))
    expect(window.location.search).toBe('?places=ch:place:2657928,ch:place:2660646')
  })

  it('updates the URL when a place is removed', () => {
    writeMapState(withPlaces(['ch:place:2657928', 'ch:place:2660646']))
    writeMapState(withPlaces(['ch:place:2660646']))
    expect(window.location.search).toBe('?places=ch:place:2660646')
  })

  it('clears the query when the selection becomes empty', () => {
    writeMapState(withPlaces(['ch:place:2657928']))
    writeMapState(emptyMapState())
    expect(window.location.search).toBe('')
  })
})
