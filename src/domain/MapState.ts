import type { CustomPin } from './CustomPin'

export interface MapState {
  placeIds: string[]
  customPins: CustomPin[]
  routeIds: string[]
  uploadedRouteIds: string[]
}
