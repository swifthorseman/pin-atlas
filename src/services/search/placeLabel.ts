import type { Place } from '../../domain/Place'
import { placeName } from '../../domain/Place'
import { placeContext } from './placeContext'

export function placeLabel(place: Place): string {
  return `${placeName(place)} — ${placeContext(place)}`
}
