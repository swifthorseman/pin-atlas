import type { Place } from '../../domain/Place'
import { placeName } from '../../domain/Place'

interface SelectedPlacesProps {
  places: Place[]
  onRemove: (id: string) => void
}

export default function SelectedPlaces({ places, onRemove }: SelectedPlacesProps) {
  if (places.length === 0) return null

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid #ddd' }}>
      {places.map((place) => (
        <li
          key={place.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
          }}
        >
          <span>{placeName(place)}</span>
          <button
            type="button"
            aria-label={`Remove ${placeName(place)}`}
            onClick={() => onRemove(place.id)}
            style={{ cursor: 'pointer' }}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
