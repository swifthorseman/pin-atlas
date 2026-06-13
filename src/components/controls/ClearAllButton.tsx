interface ClearAllButtonProps {
  onClear: () => void
  disabled: boolean
}

export default function ClearAllButton({ onClear, disabled }: ClearAllButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled}
      style={{ width: '100%', padding: '8px', cursor: disabled ? 'default' : 'pointer' }}
    >
      Clear all
    </button>
  )
}
