import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from '../components/map/MapView'
import type { MapViewHandle } from '../components/map/MapView'
import SearchBox from '../components/search/SearchBox'
import SearchResults from '../components/search/SearchResults'
import SelectedPlaces from '../components/sidebar/SelectedPlaces'
import CopyUrlButton from '../components/controls/CopyUrlButton'
import ClearAllButton from '../components/controls/ClearAllButton'
import FitToSelectedButton from '../components/controls/FitToSelectedButton'
import { emptyMapState, addPlaceId, removePlaceId } from '../domain/MapState'
import { allPlaces, findPlace } from '../data/places'
import { searchPlaces } from '../services/search/searchPlaces'
import { readInitialMapState, writeMapState } from '../services/url-state/urlStateSource'
import type { Place } from '../domain/Place'

export default function App() {
  const [mapState, setMapState] = useState(readInitialMapState)
  const [query, setQuery] = useState('')
  const mapViewRef = useRef<MapViewHandle>(null)

  const results = useMemo(() => searchPlaces(query, allPlaces), [query])
  const selectedPlaces = useMemo(
    () =>
      mapState.placeIds
        .map(findPlace)
        .filter((place): place is Place => place !== undefined),
    [mapState.placeIds],
  )

  useEffect(() => {
    writeMapState(mapState)
  }, [mapState])

  function handleSelect(place: Place) {
    setMapState((state) => addPlaceId(state, place.id))
    setQuery('')
  }

  function handleRemove(id: string) {
    setMapState((state) => removePlaceId(state, id))
  }

  function handleClear() {
    setMapState(emptyMapState())
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapView ref={mapViewRef} places={selectedPlaces} />
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
        <CopyUrlButton mapState={mapState} />
        <ClearAllButton onClear={handleClear} disabled={mapState.placeIds.length === 0} />
        <FitToSelectedButton
          onFit={() => mapViewRef.current?.fitToSelected()}
          disabled={mapState.placeIds.length === 0}
        />
      </div>
    </div>
  )
}
