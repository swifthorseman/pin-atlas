import type { MapState } from '../../domain/MapState'

export function serialiseMapState(state: MapState): string {
  const placeIds = [...new Set(state.placeIds)]
  if (placeIds.length === 0) return ''
  return `places=${placeIds.join(',')}`
}
