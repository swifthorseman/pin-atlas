import { COUNTRY_NAMES } from '../../config'

interface CoverageReadoutProps {
  countries: string[]
}

export default function CoverageReadout({ countries }: CoverageReadoutProps) {
  if (countries.length === 0) return null

  return (
    <div style={{ padding: '8px', borderTop: '1px solid #ddd' }}>
      <strong>Countries</strong>
      <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
        {countries.map((code) => (
          <li key={code}>{COUNTRY_NAMES[code] ?? code}</li>
        ))}
      </ul>
    </div>
  )
}
