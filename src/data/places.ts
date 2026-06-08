import type { Place } from '../domain/Place'
import chPlaces from './countries/ch/places.json'

export const allPlaces: Place[] = chPlaces as Place[]

const placesById = new Map(allPlaces.map((place) => [place.id, place]))

export function findPlace(id: string): Place | undefined {
  return placesById.get(id)
}
