import type { MapState } from '../../domain/MapState'
import { emptyMapState } from '../../domain/MapState'

export function parseMapState(
  search: string,
  isKnownId: (id: string) => boolean,
): MapState {
  const raw = new URLSearchParams(search).get('places')
  if (!raw) return emptyMapState()

  const placeIds = [
    ...new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '' && isKnownId(id)),
    ),
  ]
  return { ...emptyMapState(), placeIds }
}
