import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BASEMAP_STYLE, DATASET_BOUNDS, MAX_BOUNDS } from '../../config'

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      bounds: DATASET_BOUNDS,
      maxBounds: MAX_BOUNDS,
    })

    map.addControl(new maplibregl.NavigationControl())

    return () => { map.remove() }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
