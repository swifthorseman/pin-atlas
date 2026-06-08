import type { LngLatBoundsLike } from 'maplibre-gl'

export const BASEMAP_STYLE = 'https://demotiles.maplibre.org/style.json'

export const DATASET_BOUNDS: LngLatBoundsLike = [
  [5.96, 45.82],
  [10.49, 47.81],
]

export const MAX_BOUNDS: LngLatBoundsLike = [
  [4.5, 44.5],
  [12.0, 49.0],
]

export const COUNTRY_NAMES: Record<string, string> = {
  CH: 'Switzerland',
}
