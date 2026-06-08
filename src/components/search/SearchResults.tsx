import type { Place } from '../../domain/Place'
import { placeLabel } from '../../services/search/placeLabel'

interface SearchResultsProps {
  results: Place[]
  onSelect: (place: Place) => void
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
            {placeLabel(place)}
          </button>
        </li>
      ))}
    </ul>
  )
}
