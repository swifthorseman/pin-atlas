import type { MapState } from '../../domain/MapState'
import { findPlace } from '../../data/places'
import { parseMapState } from './parseMapState'
import { serialiseMapState } from './serialiseMapState'

export function readInitialMapState(): MapState {
  return parseMapState(window.location.search, (id) => findPlace(id) !== undefined)
}

export function writeMapState(state: MapState): void {
  const query = serialiseMapState(state)
  const url = query ? `?${query}` : window.location.pathname
  window.history.replaceState(null, '', url)
}

export function shareableUrl(state: MapState): string {
  const query = serialiseMapState(state)
  const { origin, pathname } = window.location
  return query ? `${origin}${pathname}?${query}` : `${origin}${pathname}`
}
