export interface Place {
  id: string
  countryCode: string
  lat: number
  lng: number

  displayName: Record<string, string>
  searchAliases: string[]

  admin1?: string
  admin2?: string
  admin3?: string

  geonames?: number
  wikidata?: string

  importance?: number
  type?: string
}
