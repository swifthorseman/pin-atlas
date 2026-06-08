import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BASEMAP_STYLE, DATASET_BOUNDS, MAX_BOUNDS } from '../../config'
import type { Place } from '../../domain/Place'

interface MapViewProps {
  places: Place[]
}

export default function MapView({ places }: MapViewProps) {
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
    markersRef.current = places.map((place) =>
      new maplibregl.Marker().setLngLat([place.lng, place.lat]).addTo(map),
    )

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [places])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
