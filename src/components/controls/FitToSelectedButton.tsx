interface FitToSelectedButtonProps {
  onFit: () => void
  disabled: boolean
}

export default function FitToSelectedButton({ onFit, disabled }: FitToSelectedButtonProps) {
  return (
    <button
      type="button"
      onClick={onFit}
      disabled={disabled}
      style={{ width: '100%', padding: '8px', cursor: disabled ? 'default' : 'pointer' }}
    >
      Fit to selected
    </button>
  )
}
