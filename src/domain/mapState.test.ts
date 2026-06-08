import { describe, it, expect } from 'vitest'
import { emptyMapState, addPlaceId } from './MapState'

describe('emptyMapState', () => {
  it('has no selected ids', () => {
    expect(emptyMapState()).toEqual({
      placeIds: [],
      customPins: [],
      routeIds: [],
      uploadedRouteIds: [],
    })
  })
})

describe('addPlaceId', () => {
  it('adds a place id to the selected state', () => {
    const next = addPlaceId(emptyMapState(), 'ch:place:2657928')
    expect(next.placeIds).toEqual(['ch:place:2657928'])
  })

  it('does not duplicate a place id already selected', () => {
    const once = addPlaceId(emptyMapState(), 'ch:place:2657928')
    const twice = addPlaceId(once, 'ch:place:2657928')
    expect(twice.placeIds).toEqual(['ch:place:2657928'])
  })

  it('preserves the other state fields', () => {
    const state = {
      placeIds: ['ch:place:2660646'],
      customPins: [{ lat: 46.5, lng: 7.8, label: 'cabin' }],
      routeIds: ['ch:route:10001'],
      uploadedRouteIds: ['rt_abc'],
    }
    const next = addPlaceId(state, 'ch:place:2657928')
    expect(next.placeIds).toEqual(['ch:place:2660646', 'ch:place:2657928'])
    expect(next.customPins).toEqual(state.customPins)
    expect(next.routeIds).toEqual(state.routeIds)
    expect(next.uploadedRouteIds).toEqual(state.uploadedRouteIds)
  })

  it('does not mutate the input state', () => {
    const state = emptyMapState()
    addPlaceId(state, 'ch:place:2657928')
    expect(state.placeIds).toEqual([])
  })
})
