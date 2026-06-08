import type { CustomPin } from './CustomPin'

export interface MapState {
  placeIds: string[]
  customPins: CustomPin[]
  routeIds: string[]
  uploadedRouteIds: string[]
}

export function emptyMapState(): MapState {
  return { placeIds: [], customPins: [], routeIds: [], uploadedRouteIds: [] }
}

export function addPlaceId(state: MapState, id: string): MapState {
  if (state.placeIds.includes(id)) return state
  return { ...state, placeIds: [...state.placeIds, id] }
}
