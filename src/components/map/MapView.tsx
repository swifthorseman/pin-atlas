import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  BASEMAP_STYLE,
  DATASET_BOUNDS,
  MAX_BOUNDS,
  FIT_PADDING,
  FIT_MAX_ZOOM,
} from '../../config'
import type { Place } from '../../domain/Place'
import { placeLabel } from '../../services/search/placeLabel'
import { placesBounds } from '../../services/map/placesBounds'

export interface MapViewHandle {
  fitToSelected: () => void
}

interface MapViewProps {
  places: Place[]
  ref?: Ref<MapViewHandle>
}

export default function MapView({ places, ref }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      bounds: DATASET_BOUNDS,
      maxBounds: MAX_BOUNDS,
    })

    map.addControl(new maplibregl.NavigationControl())
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = places.map((place) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setText(placeLabel(place))
      return new maplibregl.Marker()
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [places])

  useImperativeHandle(
    ref,
    () => ({
      fitToSelected() {
        const map = mapRef.current
        const bounds = placesBounds(places)
        if (!map || !bounds) return
        map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM })
      },
    }),
    [places],
  )

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
