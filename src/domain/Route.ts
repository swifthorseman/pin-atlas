export interface Route {
  id: string
  countryCodes: string[]
  name: Record<string, string> | string
  type?: 'hike' | 'rail' | 'skate' | 'cycle' | 'walk' | 'road' | 'ferry' | 'scenic' | 'other'
  geometry: [number, number][]
  distanceKm?: number
  source: 'curated' | 'uploaded'
}
