interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <input
      type="text"
      placeholder="Search places"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
    />
  )
}
