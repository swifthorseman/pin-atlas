import type { Place } from '../../domain/Place'
import { placeContext } from '../../services/search/placeContext'

interface SearchResultsProps {
  results: Place[]
  onSelect: (place: Place) => void
}

function label(place: Place): string {
  const name = place.displayName.en ?? Object.values(place.displayName)[0]
  return `${name} — ${placeContext(place)}`
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) return null

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {results.map((place) => (
        <li key={place.id}>
          <button
            type="button"
            onClick={() => onSelect(place)}
            style={{ width: '100%', textAlign: 'left', padding: '8px', cursor: 'pointer' }}
          >
            {label(place)}
          </button>
        </li>
      ))}
    </ul>
  )
}
