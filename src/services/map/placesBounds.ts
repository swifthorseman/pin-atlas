import type { Place } from '../../domain/Place'

export type Bounds = [[number, number], [number, number]]

export function placesBounds(places: Place[]): Bounds | null {
  if (places.length === 0) return null

  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity

  for (const place of places) {
    west = Math.min(west, place.lng)
    east = Math.max(east, place.lng)
    south = Math.min(south, place.lat)
    north = Math.max(north, place.lat)
  }

  return [
    [west, south],
    [east, north],
  ]
}
