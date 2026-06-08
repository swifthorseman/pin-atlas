import type { Place } from '../../domain/Place'
import { normaliseText } from './normaliseText'

type Rank = 0 | 1 | 2

function candidateTexts(place: Place): string[] {
  return [...Object.values(place.displayName), ...place.searchAliases].map(normaliseText)
}

function rankPlace(place: Place, query: string): Rank | undefined {
  const texts = candidateTexts(place)
  if (texts.some((text) => text === query)) return 0
  if (texts.some((text) => text.startsWith(query))) return 1
  if (texts.some((text) => text.includes(query))) return 2
  return undefined
}

export function searchPlaces(query: string, places: Place[]): Place[] {
  const normalisedQuery = normaliseText(query)
  if (normalisedQuery === '') return []

  return places
    .map((place) => ({ place, rank: rankPlace(place, normalisedQuery) }))
    .filter((entry): entry is { place: Place; rank: Rank } => entry.rank !== undefined)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.place)
}
