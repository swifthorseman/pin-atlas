import { useEffect, useMemo, useState } from 'react'
import MapView from '../components/map/MapView'
import SearchBox from '../components/search/SearchBox'
import SearchResults from '../components/search/SearchResults'
import SelectedPlaces from '../components/sidebar/SelectedPlaces'
import { addPlaceId, removePlaceId } from '../domain/MapState'
import { allPlaces, findPlace } from '../data/places'
import { searchPlaces } from '../services/search/searchPlaces'
import { serialiseMapState } from '../services/url-state/serialiseMapState'
import { parseMapState } from '../services/url-state/parseMapState'
import type { Place } from '../domain/Place'

export default function App() {
  const [mapState, setMapState] = useState(() =>
    parseMapState(window.location.search, (id) => findPlace(id) !== undefined),
  )
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchPlaces(query, allPlaces), [query])
  const selectedPlaces = useMemo(
    () =>
      mapState.placeIds
        .map(findPlace)
        .filter((place): place is Place => place !== undefined),
    [mapState.placeIds],
  )

  useEffect(() => {
    const query = serialiseMapState(mapState)
    const url = query ? `?${query}` : window.location.pathname
    window.history.replaceState(null, '', url)
  }, [mapState])

  function handleSelect(place: Place) {
    setMapState((state) => addPlaceId(state, place.id))
    setQuery('')
  }

  function handleRemove(id: string) {
    setMapState((state) => removePlaceId(state, id))
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
        <SelectedPlaces places={selectedPlaces} onRemove={handleRemove} />
      </div>
    </div>
  )
}
