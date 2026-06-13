import type { Place } from '../../domain/Place'

export function deriveCountries(places: Place[]): string[] {
  return [...new Set(places.map((place) => place.countryCode))]
}
