import { useMemo, useState } from 'react'
import MapView from '../components/map/MapView'
import SearchBox from '../components/search/SearchBox'
import SearchResults from '../components/search/SearchResults'
import { emptyMapState, addPlaceId } from '../domain/MapState'
import { allPlaces, findPlace } from '../data/places'
import { searchPlaces } from '../services/search/searchPlaces'
import type { Place } from '../domain/Place'

export default function App() {
  const [mapState, setMapState] = useState(emptyMapState)
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchPlaces(query, allPlaces), [query])
  const selectedPlaces = useMemo(
    () =>
      mapState.placeIds
        .map(findPlace)
        .filter((place): place is Place => place !== undefined),
    [mapState.placeIds],
  )

  function handleSelect(place: Place) {
    setMapState((state) => addPlaceId(state, place.id))
    setQuery('')
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapView places={selectedPlaces} />
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '320px',
          maxHeight: 'calc(100% - 24px)',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        <SearchBox value={query} onChange={setQuery} />
        <SearchResults results={results} onSelect={handleSelect} />
      </div>
    </div>
  )
}
