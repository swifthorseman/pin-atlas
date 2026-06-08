import type { Place } from '../../domain/Place'
import { COUNTRY_NAMES } from '../../config'
import regions from '../../data/countries/ch/regions.json'

const cantonNames = regions as Record<string, string>

export function placeContext(place: Place): string {
  const country = COUNTRY_NAMES[place.countryCode] ?? place.countryCode
  const region = place.admin1 ? cantonNames[place.admin1] : undefined
  return region ? `${region}, ${country}` : country
}
